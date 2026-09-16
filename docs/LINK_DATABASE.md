# LINK Agentic CRM database isolation

LINK Agentic CRM shares the existing Supabase project used by LINK Control Central, but it does not share Control Central tables.

## Supabase layout

- Supabase project: `LINK CONTROL CENTRAL`
- Existing application schemas remain untouched (`public`, `mac_personal`, etc.).
- CRM schema: `agentic_crm`
- Reserved CRM database role: `link_agentic_crm`

The CRM must always run with:

```env
DATABASE_SCHEMA="agentic_crm"
```

`DATABASE_URL` remains a normal PostgreSQL/Supabase connection string. The LINK fork applies `DATABASE_SCHEMA` in two places:

1. `packages/db/prisma.config.ts` adds the schema to the Prisma CLI datasource used by migrations.
2. `packages/db/src/client.ts` passes `{ schema: "agentic_crm" }` to the official Prisma 7 `PrismaPg` adapter at runtime.

This keeps migrations and normal Prisma reads/writes inside `agentic_crm` without relying on session-level `search_path` state, which is important when a connection pooler is used.

## Ownership of data

- **LINK Agentic CRM** owns CRM operational state: companies, contacts, deals, activities, agent tasks, agent runs and future LINK domain entities.
- **LINK Control Central** is the command/interface layer. It should consume CRM data through the CRM API instead of creating duplicate CRM tables.

## Database role

`link_agentic_crm` is currently a NOLOGIN role reserved for runtime hardening. It has `USAGE` and `CREATE` on `agentic_crm`, plus default privileges for future CRM tables, sequences and types. Production credentials are not stored in GitHub.

## Deployment rule

Do not run CRM migrations against this Supabase project unless `DATABASE_SCHEMA=agentic_crm` is present in the environment.

For serverless runtime traffic, use the Supabase pooled connection recommended for Prisma. For migrations, use the direct/session connection exposed by Supabase through the deployment environment.

Production secrets such as the Supabase database password must live in the deployment environment (for example Vercel) and must never be committed to GitHub.
