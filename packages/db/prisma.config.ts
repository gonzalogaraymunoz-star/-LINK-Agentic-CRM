import "@crm/env/load";

import path from "node:path";
import { defineConfig, env } from "prisma/config";

function databaseSchema(): string | undefined {
	const value = process.env.DATABASE_SCHEMA?.trim();
	if (!value) return undefined;
	if (!/^[a-z_][a-z0-9_]*$/.test(value)) {
		throw new Error(
			"DATABASE_SCHEMA must be a lowercase PostgreSQL identifier (letters, numbers, underscores).",
		);
	}
	return value;
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
		url: prismaDatabaseUrl(env("DATABASE_URL")),
	},
});
