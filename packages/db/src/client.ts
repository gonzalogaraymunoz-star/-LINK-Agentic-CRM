import "@crm/env/load";

import { PrismaPg } from "@prisma/adapter-pg";
import { type Prisma, PrismaClient } from "./generated/prisma/client";

const connectionString =
	process.env.NODE_ENV === "test" ? testDatabase() : liveDatabase();
const schema = databaseSchema();

function liveDatabase(): string {
	// On Vercel prefer credentials managed by the official Supabase integration.
	// Use the direct/session URL first: it is the same connection class used by
	// successful production migrations and avoids pooler-specific runtime issues.
	const url = process.env.VERCEL
		? process.env.POSTGRES_URL_NON_POOLING ||
			process.env.DATABASE_URL_UNPOOLED ||
			process.env.POSTGRES_PRISMA_URL ||
			process.env.POSTGRES_URL ||
			process.env.DATABASE_URL
		: process.env.DATABASE_URL ||
			process.env.POSTGRES_PRISMA_URL ||
			process.env.POSTGRES_URL;

	if (!url) {
		throw new Error(
			"No database connection is configured. Set DATABASE_URL or connect Supabase to Vercel so a managed Postgres URL is available.",
		);
	}

	return normalizeSupabaseSsl(url);
}

function normalizeSupabaseSsl(url: string): string {
	try {
		const parsed = new URL(url);
		const isSupabase =
			parsed.hostname.endsWith(".supabase.co") ||
			parsed.hostname.endsWith(".pooler.supabase.com") ||
			parsed.hostname.includes("supabase");
		if (!isSupabase) return url;

		// pg-connection-string currently treats sslmode=require like verify-full
		// unless libpq compatibility is enabled. Supabase-managed URLs use
		// sslmode=require, and enabling libpq compatibility keeps TLS encryption
		// while avoiding the self-signed-certificate verification failure seen in
		// Vercel's runtime.
		if (parsed.searchParams.get("sslmode") === "require") {
			parsed.searchParams.set("uselibpqcompat", "true");
		}
		return parsed.toString();
	} catch {
		return url;
	}
}

function testDatabase(): string {
	const url = process.env.TEST_DATABASE_URL;

	if (!url) {
		throw new Error(
			[
				"TEST_DATABASE_URL is not set, and the suite will not fall back to DATABASE_URL.",
				"",
				"These are real integration tests. They delete every workspace member and the",
				"organization row and put them back when the run finishes — so a run that is",
				"interrupted leaves everybody locked out of whatever database it was pointed at.",
				"The pre-push hook runs them, so that is one `git push` away from a database you",
				"care about.",
				"",
				"Make a throwaway one and point TEST_DATABASE_URL at it:",
				"",
				"    bun run db:test",
				"",
			].join("\n"),
		);
	}

	if (!databaseName(url).endsWith("_test")) {
		throw new Error(
			`TEST_DATABASE_URL must name a database ending in _test, so it cannot be one somebody is using. It names "${databaseName(url)}".`,
		);
	}

	return url;
}

function databaseName(url: string): string {
	try {
		return new URL(url).pathname.replace(/^\//, "");
	} catch {
		return url;
	}
}

function databaseSchema(): string | undefined {
	const value = process.env.DATABASE_SCHEMA?.trim();
	const resolvedSchema =
		value || (process.env.VERCEL ? "agentic_crm" : undefined);
	if (!resolvedSchema) return undefined;
	if (!/^[a-z_][a-z0-9_]*$/.test(resolvedSchema)) {
		throw new Error(
			"DATABASE_SCHEMA must be a lowercase PostgreSQL identifier (letters, numbers, underscores).",
		);
	}
	return resolvedSchema;
}

export interface PrismaLogRecord {
	level: Prisma.LogLevel;
	message: string;
	target: string;
	durationMs?: number;
}

export type PrismaLogSink = (record: PrismaLogRecord) => void;

const consoleSink: PrismaLogSink = ({ level, message, target, durationMs }) => {
	const suffix = durationMs === undefined ? "" : ` (+${durationMs}ms)`;
	const line = `[prisma:${level}] ${message}${suffix} [${target}]`;

	if (level === "error") {
		console.error(line);
	} else if (level === "warn") {
		console.warn(line);
	} else {
		console.log(line);
	}
};

let sink: PrismaLogSink = consoleSink;

export function setPrismaLogSink(next: PrismaLogSink | null): void {
	sink = next ?? consoleSink;
}

const logQueries = process.env.PRISMA_LOG_QUERIES === "true";

const logDefinitions: Prisma.LogDefinition[] = [
	{ level: "warn", emit: "event" },
	{ level: "error", emit: "event" },
	...(logQueries
		? ([
				{ level: "query", emit: "event" },
				{ level: "info", emit: "event" },
			] satisfies Prisma.LogDefinition[])
		: []),
];

const createPrismaClient = () => {
	const adapter = schema
		? new PrismaPg({ connectionString }, { schema })
		: new PrismaPg({ connectionString });
	const client = new PrismaClient({
		adapter,
		log: logDefinitions,
	});

	client.$on("error", ({ message, target }) => {
		sink({ level: "error", message, target });
	});
	client.$on("warn", ({ message, target }) => {
		sink({ level: "warn", message, target });
	});
	client.$on("info", ({ message, target }) => {
		sink({ level: "info", message, target });
	});
	client.$on("query", ({ query, duration, target }) => {
		sink({ level: "query", message: query, target, durationMs: duration });
	});

	return client;
};

declare global {
	var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

export const db = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = db;
}

export type Db = typeof db;
