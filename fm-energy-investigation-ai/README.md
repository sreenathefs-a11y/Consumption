# FM Energy Investigation AI

A browser-first Facility Management investigation and decision-support application for abnormal electricity consumption. Version 1 centres on **C7 – Unusually High July Electricity Consumption** at Etihad Plaza and deliberately avoids asserting a root cause before evidence supports it.

## Main features

- Command-centre dashboard with portfolio KPIs, priority case, trends, activity, and data quality.
- One-task-at-a-time Investigation Wizard with the complete 126-question checklist available only on request.
- Permanent rule-based thinking panel, evidence signals, smart progress, animated investigation timeline, root-cause tree, and local assistant chat.
- Dedicated drag-and-drop Evidence Center and focused mobile Technician Mode.
- Transparent rule-based cause assessment showing supporting and weakening evidence.
- Sequenced next-best-action engine that completes basic validation before electrical testing.
- Evidence register with compressed small images and metadata-only fallback for large files.
- Revision history, immediate saves, activity records, stage progress, corrective-action tracking, and guarded closure.
- C7 PDF report via jsPDF; meter CRUD/search/filter/CSV export; demo portfolio analytics.
- Theme controls, JSON backup/import/reset, responsive sidebar/mobile navigation, and offline PWA cache.

## Project structure

```text
fm-energy-investigation-ai/
├── index.html, case.html, meters.html, analytics.html, settings.html
├── evidence.html, field.html
├── manifest.json, service-worker.js, README.md
├── css/
│   ├── variables.css, base.css, layout.css, components.css
│   └── dashboard.css, case.css, responsive.css, evidence.css
├── js/
│   ├── app.js, storage.js, seed-data.js, dashboard.js, case.js
│   ├── meters.js, analytics.js, calculations.js
│   ├── investigation-engine.js, validation-engine.js
│   ├── recommendation-engine.js, workflow-engine.js, assistant-engine.js
│   ├── evidence.js, field.js, report-generator.js, ui.js, utils.js
└── assets/
    ├── icons/README.md
    └── uploads/.gitkeep
```

## Run locally

A local server is recommended because browsers restrict ES modules and service workers on `file://` URLs.

```bash
cd fm-energy-investigation-ai
python3 -m http.server 8080
# open http://localhost:8080
```

Alternatives: `php -S localhost:8080` or `npx serve .` if already available. Chart.js and jsPDF use public CDNs; the core investigation workflow still loads from local files after the service worker has cached it, but charts/PDF require the CDN resources to be available or cached.

## Persistence and portable data

All entity access goes through `js/storage.js`. The versioned database is stored under `fmeia_db_v1` in LocalStorage and is seeded on first use. Answers are saved on field changes; each edit appends a revision with previous/new values, user, and timestamp. Settings → **Export JSON backup** downloads the full database. **Import backup** validates the basic schema. **Reset demo data** destroys local changes after confirmation and reseeds C7.

## PWA installation

Serve over `localhost` or HTTPS, visit the app, then use the browser's **Install app** command. The service worker caches first-party application files. Production packaging should add 192×192 and 512×512 icons in `assets/icons/` and declare them in the manifest.

## Known limitations

- Single-browser, single-user storage has no concurrency, server backup, audit immutability, or access control.
- Browser LocalStorage is commonly limited to roughly 5–10 MB. Small images are compressed; large evidence is metadata-only. Keep originals in the approved document system.
- CDN availability is required on first load for Chart.js charts and jsPDF reports.
- Demo portfolio analytics are illustrative; only the stated C7 readings represent the initial case facts.
- The rule engine is deterministic decision support, not an electrical safety authority or predictive AI.
- Date-based “days open” reflects the seeded case date and the current device clock.

## Security and safety

Do not store sensitive personal data, credentials, permits, or confidential drawings in this local prototype. Base64 evidence is not encrypted. Use authorized personnel, calibrated instruments, suitable PPE, permit-to-work and lockout/tagout. Do not open energized panels or isolate critical loads without authorization and operational approval. Never depend solely on this software for electrical safety decisions.

## Future integration plan

### Supabase
Replace the storage adapter with a repository implementing the same collection/find/create/update/delete interface. Add authenticated users, row-level security, sites, immutable audit events, object storage for evidence, realtime assignment updates, and scheduled backups. Migrate the versioned JSON entities without changing page controllers or engines.

### OpenAI
Add an optional server-side, explicitly labelled advisory adapter only after the evidence model is secured. It may summarize verified records, draft reports, and suggest questions, but must cite source evidence, avoid hidden confidence scores, never confirm root cause automatically, and never receive credentials or sensitive evidence from the client. Keep deterministic rules as the auditable gatekeeper.

## Testing checklist

- Dashboard, wizard case, Evidence Center, Technician Mode, meter, analytics, and settings pages load without console errors.
- Wizard reveals one current task; completion advances it and View All Questions reveals the full checklist.
- Thinking panel, smart progress, timeline, root-cause tree, and rule-based chat update from saved evidence.
- C7 readings and 180.3% increase display; current task requests reading/photo/date/CT evidence.
- Answer edits survive reload and create history; stage/progress and recommendation update.
- Evidence metadata and small image paths work; deletion requires confirmation.
- Tariff recalculates cost; rule statuses respond to matching/contradictory evidence.
- Corrective actions can be created and cannot be verified without evidence.
- Case cannot close without root cause, evidence, and verified actions.
- PDF/CSV/JSON exports and JSON import work; reset reseeds the app.
- Theme and responsive/mobile navigation work; keyboard focus is visible.
- Service worker installs over localhost and first-party files work offline after caching.
