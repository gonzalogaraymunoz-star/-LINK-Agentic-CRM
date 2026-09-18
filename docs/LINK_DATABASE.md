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

`DATABASE_URL` is the explicit runtime connection and takes precedence over provider-injected Vercel Postgres variables.

For production migrations, `DIRECT_DATABASE_URL` is preferred. Prisma adds the requested schema to the migration datasource.

At runtime, `packages/db/src/client.ts` passes `{ schema: "agentic_crm" }` to the official Prisma PostgreSQL adapter.

## Access control

The `agentic_crm` schema is intentionally not available to Supabase `anon` or `authenticated` roles. Schema, table, sequence and function privileges are revoked from those roles and from `PUBLIC`.

`link_agentic_crm` is the reserved least-privilege CRM role. It is granted access to CRM objects but no table access to Control Central's `public` data.

The role is currently `NOLOGIN` until a deployment credential can be stored directly in the production secret store. Production must never commit database passwords to GitHub.

## Ownership of data

- **LINK Agentic CRM** owns CRM operational state: companies, contacts, deals, activities, agent tasks, agent runs and future LINK domain entities.
- **LINK Control Central** is the command/interface layer. It should consume CRM data through the CRM API instead of creating duplicate CRM tables.

## Deployment rules

1. Never run CRM migrations unless `DATABASE_SCHEMA=agentic_crm` is present.
2. Use `DIRECT_DATABASE_URL` for migrations and `DATABASE_URL` for runtime traffic.
3. Do not expose production database credentials to Preview deployments.
4. Do not enable RLS blindly on Prisma-owned CRM tables. Access isolation is enforced at the PostgreSQL schema/role layer unless a specific Data API use case is intentionally introduced.
5. Rotate credentials immediately if a connection string is exposed.
