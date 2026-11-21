# Mock content data — 2026-11-21

All files are UTF-8 JSON, with stable IDs and references. This is a **local test dataset**, not an official clinical database. URLs and metadata were manually collected from official WHO, CDC, UNICEF and Ministry of Health webpages. Summaries are newly authored Vietnamese text, not scraped external articles.

| File | Purpose |
|---|---|
| sources.json | Official reference metadata and provenance |
| topics.json | Topic taxonomy and related stages |
| research-cards.json | 12 original draft content cards with relational IDs |
| manifest.json | Provenance, schema version, rights and non-publication rule |

Existing 24 draft articles are in ../articles.json.

FK relationships: \`researchCard.stageSlug -> stage.slug\`, \`researchCard.topicId -> topic.id\`, \`researchCard.sourceIds[] -> sources.id\`. Validation: \`npm run check:content\`.

Before PostgreSQL: keep this as a read-only adapter. No actual DB configured. Clinical/editorial approval is required before any public launch. Source names/URLs are metadata, not evidence that each article claim is verified.
