# LINK Agentic CRM

LINK Agentic CRM is the agentic CRM core for the LINK ecosystem. It is based on the MIT-licensed `trycompai/crm` project and is adapted on the `link-core` branch.

## Branch policy

- `release`: upstream-compatible baseline. Keep this branch aligned with `trycompai/crm` release.
- `link-core`: LINK product branch. Vercel production deployments use this branch.

## Production topology

- Web app: `https://link-agentic-crm.vercel.app`
- API: `https://link-agentic-crm-api.vercel.app`
- Database: Supabase project `LINK CONTROL CENTRAL`, schema `agentic_crm`
- Agent runtime: deployed separately from `apps/agent` when agent execution is enabled.

## Required production gates

A production candidate must satisfy all of the following:

- PostgreSQL migrations succeed.
- TypeScript type checks pass.
- Lint passes.
- Automated tests pass.
- API `/health` returns HTTP 200 with a successful database round-trip.
- The web app reaches the production API rather than localhost.
- Sign-in is restricted by `ALLOWED_SIGN_IN`. LINK provides allow-listed email/password access as the production bootstrap; Google/Microsoft/SSO remain optional integrations for mailbox and calendar sync.
- Production database credentials are not exposed to Preview deployments.
- CRM operational tables remain isolated in `agentic_crm`.

## Ecosystem role

LINK Agentic CRM owns operational CRM state: companies, contacts, deals, activities, evidence, agent tasks, conversations and agent runs.

LINK Control Central is the executive/command layer. It should consume CRM state through the CRM API rather than duplicate CRM tables.

Corteza remains the LINK skills/capability layer and should trigger or enrich work that is represented operationally inside the CRM.
