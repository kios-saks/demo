# Combined DEV deployment (opt-in)

Decision: co-locate the two existing applications to avoid separate Free instance wake-up. This is an architectural workaround, not proof of the cause of Render transport errors. Keep the existing split render.yaml unchanged and retain both previous services until acceptance. Do not merge PR or change production.

## Render Dashboard (existing Web service only, after CI)

Use the existing Node service root directory `projects/hanh-trinh-me-be`, Free, same branch. Change Build Command to `npm install --no-audit --no-fund && npm run build:dev:combined`; Start Command to `npm run start:dev:combined`; keep health path `/api/health`. Set `MEBE_COMBINED_DEV=true`, PORT=10000. Copy existing Backend credentials using the Render Dashboard secret UI, never chat or Git: SUPABASE_DATABASE_URL, MEDIA_SUPABASE_URL, MEDIA_SUPABASE_SERVICE_KEY, MEDIA_DEV_EDITOR_TOKEN, MEDIA_DEV_REVIEWER_TOKEN, DEV_CONTENT_PREVIEW_TOKEN (match current Web value); retain READER_INVITE_SHA256. Existing editorial demo tokens are optional; only copy if explicitly used. CA file in repository is used by default. No migration, seed or import on start; TLS validation enabled. Build and Web child get a narrow environment allowlist, API gets DB and media credentials; no secrets prefixed NEXT_PUBLIC. The same OS account/container is not a strong security boundary: DEV only. Keep secrets out of source, .env files and logs.

API binds to 127.0.0.1:4000, Web binds public PORT. Supervisor waits for API readiness before starting Web, combined health checks both; exits when a child fails, forwards SIGTERM and has bounded cleanup. Reader and CMS smoke paths remain unchanged, CMS startup audit uses local Web address in combined mode. No public /v1 API reverse proxy in this topology; external API contract remains on existing API service until any separate decision to retire it. Keep old Backend deployment for rollback and do not suspend/delete until approved. No always-on ping.

## Acceptance

Run isolated fixture CI first (no live database/Storage access). After Dashboard configuration and deploy: inspect COMBINED_API_READY, COMBINED_DEV_READY, DEV_AUTH_SMOKE_PASS, DEV_CMS_SMOKE_PASS, guest denial, CPU/RAM. Check the same after natural idle with only Web request, verify no separate API activation; confirm actual combined memory stays below plan cap. CI mocks do not prove live Supabase or memory usage. Old service can sleep; existing scheduled monitor/public smoke calling it directly should be retired or adapted only after the new topology is accepted.

Rollback: restore previous build/start commands and CONTENT_API_INTERNAL_URL to existing API public origin; remove combined opt-in and backend-only secrets from Web service after rollback. Production split services remain unchanged.
