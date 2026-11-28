# Triển khai Render Free (Web + Backend, Supabase Cloud)

This project includes a ready-to-review Blueprint in the **repository root**
[render.yaml](../../../render.yaml). It defines exactly **two Free Web Services**:
a Docker Fastify API and a Next.js Web application. No additional database is
created; the existing Supabase PostgreSQL project remains the source of truth.

## Prerequisites and cost limits

- Connect the Render application with ChatGPT or log in to
  https://dashboard.render.com and connect GitHub account `kios-saks`.
- The GitHub code currently lives on branch
  `feat/hanh-trinh-me-be-ecosystem` in public repository
  `kios-saks/demo`, **not on main**. This Blueprint pins both services to that
  branch.
- Render Free web services spin down after 15 minutes of idle traffic, take
  around a minute to wake up, and share **750 free instance-hours per
  workspace per calendar month**. Two continuously active instances would
  exceed this monthly allowance. This deployment is for **development
  demonstration only**, not reliable 24/7 production.
- The Free service filesystem is ephemeral; all persistent data remains in
  Supabase Cloud. No Render database is provisioned.
- Supabase must be reachable through a valid **PostgreSQL Session Pooler
  connection URI on port 5432**, copied from Supabase Dashboard > Connect.
  Direct IPv6-only connectivity is not assumed on Render.
- The previously shared Supabase database password must be **rotated** before
  use with a hosting service. Never commit it to GitHub or paste it into
  ChatGPT/plugin comments.

## Deploy using the Blueprint

1. Open https://dashboard.render.com. Choose **New > Blueprint**.
2. Grant Render GitHub access to `kios-saks/demo`; choose the branch
   `feat/hanh-trinh-me-be-ecosystem`, then select the **root render.yaml**.
3. Check that the plan for **both services** is explicitly `free` and
   **no managed Postgres** is being created. If the account offers paid plans
   by default, do not confirm a charge.
4. Render requests the `SUPABASE_DATABASE_URL` secret once on first sync:
   retrieve the actual Session Pooler connection URI (including host and
   password) from
   https://supabase.com/dashboard/project/yfmwznvlblbhicxexffe?showConnect=true .
   Set it directly in Render's secret prompt, **not** in a GitHub file.
   The Blueprint does not know the password.
5. Deploy Blueprint. The API should be reachable on its own HTTPS Render
   domain. Render propagates `RENDER_EXTERNAL_URL` into the Web service's
   server-only `CONTENT_API_INTERNAL_URL`, so the two services are connected
   without hardcoding hostnames.
6. Verify the API paths:
   - `/health` → `ok:true`, provider `postgres`
   - `/health/ready` → `ok:true` (database query verified)
   - `/v1/stages` → 12 stages
   - `/v1/articles` → 0 published articles currently
7. Verify Web `/api/health` → `ok:true` and `/` shows the stages.
   An unauthenticated request for draft details must return 404.
   `/admin`, `/bien-tap`, and `/goc-nghien-cuu` are 404 in production.

## Troubleshooting

- `/health/ready` 503: check the Supabase Session Pooler URI, its password
  (special characters URL-encoded), and TLS trust. Read Render's Backend logs;
  do not paste secrets into chat. Supabase DB is in private schema `mebe`.
- Web is online but shows a 500: the Backend may be cold/sleeping, or has no
  valid DB connection yet. Check the API's own `/health/ready`, then reload.
- On Free, Web→API calls use the **public HTTPS domain** because Render's Free
  Web Services cannot receive private-network traffic. This is normal.
- If Render cannot resolve a branch/build, confirm the Blueprint branch and
  root-level `render.yaml` path, and that the GitHub grant includes the repo.
- For a service previously created, secrets with `sync:false` must be added
  manually through the Render service's Environment tab (Blueprint only
  prompts on first creation).

## Security and follow-on work

All API schema migrations and seed data were completed previously in the
Supabase-managed PostgreSQL 17 project; do not seed production automatically.
Backend runs in `NODE_ENV=production` and exposes no demo admin CMS. Web
filters unpublished articles irrespective of which storage adapter is active.
The login/reviewer/publishing pipeline, backups, monitoring, domain setup,
and on-device native Mobile smoke tests are still outstanding. Connecting
Render is a **user authorization action**; committing this file alone does
not deploy anything.
