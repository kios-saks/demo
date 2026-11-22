# Backend production service — release readiness

This project includes an API-only Dockerfile at `Dockerfile.api`, to be
built with `projects/hanh-trinh-me-be` as Docker build context. The
container runs Fastify using Node.js 22 and a production TSX runtime.

## Build / local smoke

~~~bash
cd projects/hanh-trinh-me-be
docker build -f Dockerfile.api -t mebe-api:dev .
docker run --rm --name mebe-api -p 4000:4000 -e DATABASE_MODE=mock mebe-api:dev
curl -fsS http://localhost:4000/health/ready
~~~

The mock example is only for local smoke. It cannot publish draft medical
content in production: `GET /v1/articles` returns 0 results, and
`GET /v1/admin/articles` returns 404.

## Hosting with Supabase (no secrets in Git)

1. Create a backend service from `kios-saks/demo` feature branch. Set
   **Root Directory** to `/projects/hanh-trinh-me-be`.
2. Set Dockerfile path to `Dockerfile.api` (build context: the Root Directory).
   On Railway, set `RAILWAY_DOCKERFILE_PATH=Dockerfile.api` in the service
   configuration; the built-in Dockerfile detector only sees a file named
   `Dockerfile`. Avoid the deprecated `railway.json` config-as-code format.
3. In **service private secrets** configure:
   `NODE_ENV=production`, `DATABASE_MODE=supabase`,
   `SUPABASE_DATABASE_URL` copied from Supabase Dashboard > Connect
   (Session Pooler port 5432 on IPv4-only hosts), `PORT=4000` if not provided,
   and `CORS_ORIGIN` set to your allowed Web domain.
   Optionally add `SUPABASE_CA_CERT_PATH` referring to the verified project CA.
   Verify SSL on the selected provider and do not disable TLS.
4. Set healthcheck path `/health/ready`. It requires the database adapter
   to be ready, returning HTTP 503 on failure, without leaking connection data.
5. Deploy and check `/health`, `/health/ready`, `/v1/stages`, and
   `/v1/articles`. Only approved, **published** articles are public;
   24 existing seeded articles remain drafts.
6. Set `WEB_CONTENT_PROVIDER=api` and
   `CONTENT_API_INTERNAL_URL=https://YOUR-API-HOST` as server-only settings
   on the Web service. Configure `EXPO_PUBLIC_CONTENT_API_URL` to the
   public HTTPS Backend domain for Mobile build. Never ship PostgreSQL
   connection strings or a Supabase service key to clients.

The **ChatGPT Supabase connection does not inject database passwords into
a deployment host**. The user must authorize the hosting connection/service
before app secrets can be added. The password shared in chat should be
rotated now and then stored only in the hosting secret manager.

Production hardening: The Web wraps **all repository providers**, including
the local mock, in a published-only release policy; no draft preview,
admin UI, research-cards UI or editorial overview is exposed. The Mobile
release has no static JSON draft import. Development preview requires an
API, using Mock/Docker/Supabase adapters behind Fastify.

Still outstanding: user auth/RBAC & verified clinical review, approved
content publishing, backups/PITR, monitoring and logging, real iOS/Android
device tests, deploy permissions and live app-to-Supabase password test.


## Verified TLS for the Supabase Shared Pooler

The shared pooler uses **Supabase Root 2021 CA**, which is not part of Node's
default public CA bundle. The Dockerfile includes the public CA certificate at
`/srv/database/certs/prod-ca-2021.crt`, sets `SUPABASE_CA_CERT_PATH` and keeps
`rejectUnauthorized=true`. Never use `NODE_TLS_REJECT_UNAUTHORIZED=0` or
`rejectUnauthorized=false`.

The pinned certificate's SHA-256 fingerprint is
`807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa`
(Supabase Root 2021 CA, valid to April 2031). CI checks its fingerprint so that
unreviewed changes to the public trust root fail. The root was cross-checked
against the publicly documented Supabase CA fingerprint; for future root
rotation, obtain a new certificate directly from **Supabase Dashboard →
Database Settings → SSL Configuration → Download Certificate** and verify
independently before updating the repository.

No database credential is stored in this file or image. Render holds the
`SUPABASE_DATABASE_URL` secret separately.
