# LINK Agentic CRM database isolation

LINK Agentic CRM shares the existing Supabase project used by LINK Control Central, but it does not share Control Central tables.

## Supabase layout

- Supabase project: `LINK CONTROL CENTRAL`
- Existing application schemas remain untouched (`public`, `mac_personal`, etc.).
- CRM schema: `agentic_crm`
- CRM database role: `link_agentic_crm`

The CRM must always run with:

```env
DATABASE_SCHEMA="agentic_crm"
```

`DATABASE_URL` remains a normal PostgreSQL/Supabase connection string. The LINK fork applies `DATABASE_SCHEMA` in two places:

1. `packages/db/prisma.config.ts` adds the schema for Prisma migrations.
2. `packages/db/src/client.ts` sets PostgreSQL `search_path` for every runtime connection.

This prevents CRM migrations and normal Prisma reads/writes from defaulting to the existing `public` schema.

## Ownership of data

- **LINK Agentic CRM** owns CRM operational state: companies, contacts, deals, activities, agent tasks, agent runs and future LINK domain entities.
- **LINK Control Central** is the command/interface layer. It should consume CRM data through the CRM API instead of creating duplicate CRM tables.

## Deployment rule

Do not run CRM migrations against this Supabase project unless `DATABASE_SCHEMA=agentic_crm` is present in the environment.

Production secrets such as the Supabase database password must live in the deployment environment (for example Vercel) and must never be committed to GitHub.
