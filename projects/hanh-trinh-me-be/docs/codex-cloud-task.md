# Codex Cloud task — instructions to use after connecting environment

Repository: `kios-saks/demo`; branch: `feat/hanh-trinh-me-be-ecosystem`; working directory: `projects/hanh-trinh-me-be`; PR: https://github.com/kios-saks/demo/pull/1.

## Pasteable task
Continue the Hành Trình Mẹ & Bé platform in the existing branch without merging the draft PR. Read AGENTS.md, README.md and docs/architecture.md. First install dependencies and reproduce GitHub Actions gates (content checks, API tests and typecheck, Mobile typecheck, Next production build and HTTP smoke); fix all errors by tests-first development. Then implement next priority milestones in small commits: CMS schema and protected editorial workflow with immutable revision approvals, API contract typing, mobile content sync with offline fallback, meaningful cross-platform navigation tests, privacy checks and SEO guardrails. Do not expose draft health content as approved; do not collect child medical data or commit secrets. Report exactly which tests ran and their output, unfinished work, and links to commits/PRs. Ask for explicit approval before adding production services, costs, domain operations, database credentials, or merging.

## Current status
Codex Cloud has NOT been launched by this chat. GitHub Actions runs independently and can provide objective CI evidence. Initiate Codex Cloud from a Codex session connected to GitHub and choose this repo and branch.

## Acceptance
- All existing CI checks green.
- No changes to unrelated `fits` file in demo repository.
- No unreviewed medical advice published.
- Production code additions include tests and security constraints.
