# Dynamic media – phase 2 (DEV only)
Private bucket mebe-draft-media (2 MiB). No browser/client grants. Configure on API server only: MEDIA_DEV_ENABLED=true, MEDIA_SUPABASE_URL, MEDIA_SUPABASE_SERVICE_KEY (legacy service_role JWT), MEDIA_DEV_EDITOR_TOKEN, MEDIA_DEV_REVIEWER_TOKEN (distinct random secrets >=32 chars, distinct from preview token). Do not enable in a public environment; these are shared DEV roles, not per-user production RBAC.
Database must have Supabase as primary. Run db:migrate; do not seed/reset. Apply bucket bootstrap per Supabase dashboard or documented create-bucket SQL. Storage API uploads only, never insert storage.objects manually.
Routes:
- GET /v1/dev-preview/media/:slug (x-preview-token) -> active signed links (120s), draft only
- GET /v1/dev-media-admin/:slug (editor/reviewer bearer) -> revision history, active pointers, events
- POST /v1/dev-media-admin/:slug/upload (editor bearer) -> {slot,imageBase64,alt,caption,provenance,afterSection?,anchorHeading?}; WebP only, immutable object, pending revision
- POST /v1/dev-media-admin/:slug/preview (editor/reviewer bearer) -> {slot,revision}, short-lived signed link including pending
- POST /v1/dev-media-admin/:slug/review (reviewer bearer) -> {slot,revision,expectedActiveRevision:null|number,action:"approve"|"rollback"|"request_changes",note}; DEV approval only. Optimistic active pointer check + row lock.
Unreferenced immutable object may remain after failed DB transaction; reconcile separately, never auto-delete originals. No migration of existing binary files or frontend cutover yet. SVG import must be via a controlled, reviewed pipeline, not arbitrary upload. Existing article/status/medical approval unchanged. Public delivery and production identity remain gated.
