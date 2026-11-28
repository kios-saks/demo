# DEV Media Management CMS
Enable WEB_MEDIA_ADMIN_ENABLED=true on DEV Web only, after Backend and Web deploy this version. /admin remains disabled in production unless that explicit flag is set. The old editorial mock remains local development only. No draft/public release switch.
- Editor uses existing MEDIA_DEV_EDITOR_TOKEN. Select up to 72 WebP files, each <=2 MiB, names slug.webp / cover-slug.webp / lifestyle-cover-slug.webp. Check mapping and alt/caption. Upload stages pending revisions only; no overwrite.
- Reviewer signs in separately with MEDIA_DEV_REVIEWER_TOKEN. View active and candidate revision from private verified binary proxy; approve individually or mark each candidate reviewed and approve the selected batch. Rollback to any previously approved cover revision; source remains intact. Comments and expected active revision required.
- The live catalog calculates target from initial SVG revision 1, and upgraded when currently active WebP revision >1. Rollback decreases progress. Neither local files nor pending revisions count as upgraded.
- Browser holds the role token in memory only; no service credentials, signed URLs or tokens in URL/local storage. All same-origin proxy paths allowlisted; Backend independently enforces roles. No database access in Web. No public content changes.
- Upload failures are per-file; use refresh/history before retry; previously pending identical bytes are reused.
- Current scope: cover upgrade workflow; historical binary endpoint supports both slots, but inline editing UI is future work. No medical certification.
