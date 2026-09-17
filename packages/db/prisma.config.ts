import "@crm/env/load";

import path from "node:path";
import { defineConfig } from "prisma/config";

function databaseSchema(): string | undefined {
	const value = process.env.DATABASE_SCHEMA?.trim();
	const schema = value || (process.env.VERCEL ? "agentic_crm" : undefined);
	if (!schema) return undefined;
	if (!/^[a-z_][a-z0-9_]*$/.test(schema)) {
		throw new Error(
			"DATABASE_SCHEMA must be a lowercase PostgreSQL identifier (letters, numbers, underscores).",
		);
	}
	return schema;
}

function databaseUrl(): string {
	const url =
		process.env.DATABASE_URL ||
		process.env.POSTGRES_PRISMA_URL ||
		process.env.POSTGRES_URL;
	if (!url) {
		throw new Error(
			"No database connection is configured. Set DATABASE_URL or connect Supabase to Vercel so POSTGRES_PRISMA_URL is available.",
		);
	}
	return url;
}

function prismaDatabaseUrl(url: string): string {
	const schema = databaseSchema();
	if (!schema) return url;

	const parsed = new URL(url);
	parsed.searchParams.set("schema", schema);
	return parsed.toString();
}

export default defineConfig({
	schema: path.join("prisma", "schema.prisma"),
	migrations: {
		path: path.join("prisma", "migrations"),
		seed: "bun run prisma/seed.ts",
	},
	datasource: {
		url: prismaDatabaseUrl(databaseUrl()),
	},
});
