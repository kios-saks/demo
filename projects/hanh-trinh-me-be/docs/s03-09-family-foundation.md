# S03-09 — Không gian gia đình và tài khoản
Status: fixture-only account/family service and HTTP routes, explicitly injected into tests only. Live server does not register the routes; no live migration, auth provider configuration or deployment.
Architecture: Fastify API buildApp composes repositories; keep family domain separate from editorial KnowledgeRepository and CMS credentials. Next.js reader remains anonymous on designated DEV; family endpoints require separately verified account identity. Production and Mobile unchanged.
## Proposed access design (review before wiring)
Owner: read/write shared journey, manage invitations/membership; member: read/write journey; viewer: read only. No access for anonymous, pending or revoked membership, wrong tenant, unknown action/role. Authorization is based on verified principal + current server-side membership scoped to exact family ID, never caller-supplied role. No family ownership transfer or last-owner removal in initial scope; account/membership creation transactional. The pure policy is only a foundation, not an authentication implementation.
## Delivery sequence
- [x] Read current composition and establish role/tenant policy + fixture unit tests.
- [x] Policy CI 45586442647 PASS; define verified identity interface (provider not wired).
- [x] Isolated in-memory service + HTTP API for consent, onboarding, family create/list/get, invitation issuance/acceptance/expiry/replay protection, member revocation and journey stage revision. Fixture verifier injection only; real session revocation/provider integration pending.
- [ ] Fixture HTTP assertions implemented; CI pending. Real DB atomic authorization, audit and export/delete still pending.
- [ ] Web account + family UX; preserve guest reader/local-first and opt-in migration of local preferences. No child medical information or DOB collected by default.
- [ ] Draft schema migration and test in isolated database only; review RLS/least privilege and rollback before owner approval of actual database changes.
- [ ] CI and live DEV acceptance once approved. No production publishing.

## API contract (fixture-only)
- POST /v1/account/onboard
- GET /v1/account/me
- POST/GET /v1/families
- GET /v1/families/:familyId
- PATCH /v1/families/:familyId/journey
- GET /v1/families/:familyId/members
- POST /v1/families/:familyId/invitations
- POST /v1/family-invitations/accept
- DELETE /v1/families/:familyId/members/:accountId
Invites bound to existing recipient account, 24h expiry, stored as SHA256 digest, single use; this is separate from the removed Reader invite. No email delivery yet. Production needs verified provider sessions, durable storage, rate limits, secure same-origin Web session, privacy controls and transactional DB tests.
