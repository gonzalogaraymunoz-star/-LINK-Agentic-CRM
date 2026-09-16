# LINK Agentic CRM

This fork is the experimental agentic CRM core for the LINK ecosystem.

## Branch policy

- `release`: upstream-compatible baseline. Keep this branch as close as possible to `trycompai/crm` release.
- `link-core`: LINK adaptation branch. Product-specific work starts here.

## Initial validation phase

Before changing the domain model, the fork must pass the upstream CI unchanged:

- PostgreSQL migrations
- TypeScript type checks
- linting
- automated tests

Only after the baseline is green will LINK-specific entities such as Workspace, Project and Mission be introduced.
