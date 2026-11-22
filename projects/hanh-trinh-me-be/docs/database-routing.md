# Database routing — Docker PostgreSQL and Supabase (2026-11-22)

## Interface contract

All business-facing API and CMS handlers use the existing KnowledgeRepository and EditorialRepository interfaces, with no vendor SQL embedded in handlers. The new DatabaseConnectionProvider interface governs physical connections. RoutedEditorialRepository delegates all business reads and writes to a selected primary repository, and probes an optional secondary read-only. A future database engine or provider can be added by implementing these interfaces and registering a provider in the composition root.

Source locations:
- packages/data/src/contracts.ts and editorial-contracts.ts — domain interfaces
- packages/data/src/routed-repository.ts — primary-only routing, health and drift
- apps/api/src/db/config.ts — validated mode and maintenance target selection
- apps/api/src/db/providers.ts — provider interface, Postgres pool for Docker and Supabase
- apps/api/src/repository.ts — composition root (only place selecting implementations)
- apps/api/src/db/run-status.ts — read-only status command

## Four runtime modes

| DATABASE_MODE | Primary | Secondary |
|---|---|---|
| mock | Local JSON | None |
| docker | Docker Postgres | None |
| supabase | Hosted Supabase Postgres | None |
| both + DATABASE_PRIMARY=docker | Docker Postgres | Supabase read-only |
| both + DATABASE_PRIMARY=supabase | Supabase Postgres | Docker read-only |

In BOTH mode, reads/writes of API and CMS go ONLY to the primary. Secondary is queried for readiness, article counts, and a content/revision fingerprint. It is NOT synchronized, NOT a write mirror, and NOT automatic failover. Changing primary without reconciling differences can make past edits seem missing. Switch only after verifying a migration or replication plan. The status command warns about drift and never writes.

## A. Docker only

Start the local database:

~~~bash
docker compose -f compose.postgres.yml up -d
~~~

Copy .env.example to .env and configure:

~~~ini
DATABASE_MODE=docker
DOCKER_DATABASE_URL=postgresql://mebe:local-only-change-me@127.0.0.1:5432/mebe
~~~

Then:

~~~bash
npm install
npm run db:migrate
npm run db:seed
npm run db:status
npm run dev:api
~~~

## B. Supabase only

1. Create/open a Supabase project. From Dashboard > Connect copy its real database URI. On IPv4-only persistent backends select Session pooler port 5432. On IPv6-capable persistent infrastructure, Direct port 5432 may be suitable. Do not choose transaction pooler port 6543 for these migration commands, which use session-level advisory locks.
2. Enable SSL enforcement where available. In Database Settings download the project's root certificate and keep it outside the repository. Set SUPABASE_CA_CERT_PATH to the certificate path so TLS verifies the trusted CA. The application always uses TLS with certificate verification for the Supabase target.
3. Store the connection details in an untracked .env file or managed secret store, not GitHub source:

~~~ini
DATABASE_MODE=supabase
SUPABASE_DATABASE_URL=postgresql://postgres.PROJECT_REF:YOUR_URL_ENCODED_PASSWORD@POOLER_HOST:5432/postgres
SUPABASE_CA_CERT_PATH=/secure/path/supabase-ca.crt
~~~

Copy the real values from Supabase Dashboard; the placeholders above are not valid credentials. Percent-encode special characters in passwords.

Run npm run db:migrate, npm run db:seed and npm run db:status only on a dedicated project/database, after reviewing costs and backup strategy. There is NO hosted Supabase project provisioned by this code change.

## C. Both

Configure BOTH URLs and explicit primary in .env:

~~~ini
DATABASE_MODE=both
DATABASE_PRIMARY=docker
DOCKER_DATABASE_URL=postgresql://mebe:local-only-change-me@127.0.0.1:5432/mebe
SUPABASE_DATABASE_URL=postgresql://postgres.PROJECT_REF:YOUR_URL_ENCODED_PASSWORD@POOLER_HOST:5432/postgres
SUPABASE_CA_CERT_PATH=/secure/path/supabase-ca.crt
~~~

Schema and seed must be applied to each explicitly selected database. This is an intentional operation and not automatic replication.

~~~bash
DB_TARGET=docker npm run db:migrate
DB_TARGET=docker npm run db:seed
DB_TARGET=supabase npm run db:migrate
DB_TARGET=supabase npm run db:seed
npm run db:status
npm run dev:api
~~~

To make Supabase primary, change DATABASE_PRIMARY=supabase after reconciling data. Secondary is not written to on CMS edits. Errors in URLs, missing destinations and unknown mode values fail closed.

## Testing and limitations

CI runs parser tests as part of API suite, plus a two-database routing integration test. Two independent PostgreSQL 16 service containers act as Docker and a Supabase-target SIMULATOR: this verifies routing and detection of divergence but does NOT establish a real remote Supabase connection. Production Supabase activation requires an authorized account and secure connection values.

The current CMS admin API is still only a development demo with role keys, never publicly enabled in production. No real user accounts, verified clinicians, production backup/PITR, cross-database replication, or public publishing mechanism. Do not expose sensitive child/medical data. API/Web/Mobile clients never receive DB credentials.

## Provider extension

Add a new provider ID, implement DatabaseConnectionProvider for physical connectivity and ManagedEditorialRepository / EditorialRepository for the domain operations, then register this in apps/api/src/repository.ts. Run the same contract tests for the new adapter. Do not change route controllers or CMS forms.


## LIVE PROJECT — provisioned 2026-11-22

Project: **hanh-trinh-me-be** / **yfmwznvlblbhicxexffe**, region **ap-southeast-1 (Singapore)**, organization **trunhquang9**, Free tier. Dashboard: https://supabase.com/dashboard/project/yfmwznvlblbhicxexffe

The Supabase connector created the cloud project and executed the first application migration. Tables live in **private schema mebe** (not public): 12 stages, 24 draft articles, 13 topics, 13 reference sources, 12 research cards, 24 initial revision snapshots. All 11 content tables and migration tracker have RLS enabled and no access grants for anon or authenticated. No health content has been approved or published.

Backend Supabase connections set session search_path to mebe,public; Docker keeps its original public schema. The migration runner prepares the private schema before DDL and reapplies RLS restrictions afterwards. The initial Supabase-applied 001_init.sql migration hash is recorded in mebe.schema_migrations, so db:migrate will not recreate tables.

**Not yet connected to a deployed API:** The Supabase OAuth connector authorizes ChatGPT database management, but does not inject a PostgreSQL password or connection string into GitHub Actions or Backend hosting. Configure SUPABASE_DATABASE_URL securely in the Backend runtime, never in committed .env, NEXT_PUBLIC_*, GitHub issues or PR comments. Test npm run db:status and a read-only API endpoint after credentials are in place.

Suggested current mode: DATABASE_MODE=supabase; to use both, set DATABASE_MODE=both and choose DATABASE_PRIMARY=supabase or docker. This is not automatic replication. Do not switch a production primary without drift reconciliation.

For production, configure least-privilege roles, TLS, network restrictions, backups, and real authenticated CMS. Demo CMS is intentionally disabled in NODE_ENV=production.
