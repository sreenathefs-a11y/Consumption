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

Official entity access goes through `js/data-adapter.js` to the Apps Script API. LocalStorage retains only display preferences, timestamped read caches, offline drafts, and an optional archive of pre-M3 records. Local archives are never uploaded or merged automatically.

## PWA installation

Serve over `localhost` or HTTPS, visit the app, then use the browser's **Install app** command. The service worker caches first-party application files. Production packaging should add 192×192 and 512×512 icons in `assets/icons/` and declare them in the manifest.

## Known limitations

- Live writes depend on the configured Apps Script deployment, workbook permissions, and temporary browser token.
- Browser caches and drafts are subject to LocalStorage limits; official evidence remains an HTTPS metadata link in the Sheet and original files remain in approved storage.
- CDN availability is required on first load for Chart.js charts and jsPDF reports.
- The rule engine is deterministic decision support, not an electrical safety authority or predictive AI.

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

# Milestone 3 — Live Google Sheets backend

The intended production source of truth is the Google Apps Script Web App attached to **FM Utility Intelligence Master - Milestone 2**. LocalStorage is limited to display preferences, cached read responses, offline field drafts, and an explicit archive of pre-M3 local records. Old records are never merged or uploaded automatically. Remote mode is the default; mock mode contains only the supplied real C7 facts and deliberately leaves unknown fields null.

## Configure live data

1. Deploy the backend by following `google-apps-script/README.md`.
2. Open Settings → Google Apps Script API.
3. Keep mode set to **Remote**, paste the `/exec` deployment URL and the manually configured token, then select **Save and test connection**.
4. Confirm the header badge reads **LIVE GOOGLE SHEET**. Cached results are labelled as not current; connection failures never masquerade as live data.
5. If previous local records are detected, archive or export them. The default archive action never writes to the Sheet.

No deployment URL or token is committed. Until a deployment URL is configured, remote pages show an API setup state rather than falling back to the old portfolio demonstration data.

## Live API summary

Reads: `health`, `getSettings`, `getSites`, `getBuildings`, `getUtilities`, `getMeters`, `getMeterReadings`, `getConsumption`, `getHistoricalConsumption`, `getAnomalies`, `getCases`, `getCaseDetails`, `getEvidence`, `getCorrectiveActions`, `getDashboard`, and `getPortfolioTree`.

Writes: `createMeterReading`, `updateMeterReading`, `createInvestigationInput`, `updateInvestigationInput`, `createEvidence`, `updateEvidenceStatus`, `createCorrectiveAction`, `updateCorrectiveAction`, `updateCase`, `confirmRootCause`, and `closeCase`.

Every write uses `LockService`, validates source records and payloads, uses permanent ID columns rather than row numbers, and appends an Audit_Log entry. Evidence writes contain HTTPS metadata links only. Browser writes are never silently retried.

## Milestone 3 validation rules

- Required fields, ID format, valid dates, numeric and non-negative readings.
- Existing meter/case foreign keys and duplicate permanent IDs.
- Duplicate meter/date/time readings require an explicit update.
- A reading below the previous reading requires a declared, verified reset path.
- Period start cannot follow period end.
- Evidence requires an HTTPS link and an allowed verification status.
- Root-cause confirmation requires an existing case, verified evidence, completed mandatory inputs, required verified readings, verified CT ratio/multiplier when CT-operated, and an owned corrective action.
- Closure requires a confirmed root cause, completed or verified action, post-action verification, and closure approver.

## Offline behavior

Successful reads are cached with a timestamp. A failed read may return the last cached response with a conspicuous **CACHED — NOT CURRENT** badge. Field submissions are first stored as drafts. The user must explicitly confirm a one-time online submission; failed submissions remain drafts. There is no automatic write queue or background retry in this milestone.

## Milestone 3 limitations

- The repository cannot deploy or authorize an Apps Script Web App; deployment must be performed by the Sheet owner.
- The supplied Sheet URL requires authorization in this environment, so live headers and records could not be inspected or integration-tested here. `Config.gs` centralizes header mappings for controlled correction during deployment testing.
- Apps Script lacks cross-sheet database transactions. An `AUDIT_FAILURE` after a main sheet write is returned as a serious integrity error and must be reconciled manually.
- Browser-held API tokens are an interim access control, not a fully secure identity solution.
- Binary Drive upload, automatic retries, Google login/RBAC, weather, BMS, OpenAI, Supabase, Power BI, forecasting, and email alerts remain out of scope.
- Cost and savings are displayed only when supported values are returned. Missing tariff produces “Cost unavailable — tariff not entered.”

## Milestone 3 files

```text
google-apps-script/
├── Code.gs                 # doGet/doPost and health
├── Config.gs               # spreadsheet, tabs, API/data versions, schema map
├── Router.gs               # read routes, KPI/tree composition, controlled writes
├── Auth.gs                 # Script Properties token setup and checks
├── SheetsRepository.gs     # exact-header object conversion and ID-based repository
├── Validation.gs           # reusable validation and workflow gates
├── AuditLog.gs             # write lock and mandatory audit records
├── ApiResponses.gs         # invariant JSON envelopes
├── appsscript.json
└── README.md
js/
├── api-config.js, api-client.js, remote-storage.js
├── data-adapter.js, schema-mapping.js, sync-manager.js
├── offline-draft-store.js, mock-fixture.js, case-data-mapper.js
└── portfolio.js
portfolio.html
tests/
├── frontend.test.mjs
└── apps-script.test.cjs
```

## Manual Milestone 3 acceptance checklist

- Configure Remote mode with no URL and confirm every live page shows API Setup Required rather than old portfolio values.
- Deploy the Apps Script project, configure a token, and verify health identifies the expected workbook, Dubai timezone, API `v1`, and data `M2.0`.
- Verify Sites, Buildings, Utilities, Meters, Portfolio, Cases, C7 details, Anomalies, Evidence, Actions, and Dashboard reflect the source tabs without invented blanks or zeros.
- Confirm C7 is `CASE-2026-0001`, meter `MTR-EYP-C7-001` / `ACC11D000382`, June 6,640 kWh, July 18,615 kWh, difference 11,975 kWh, Critical, Data Collection, and Not Assessed.
- Confirm missing CT ratio, multiplier, tariff, parent, calibration, or assignment displays a pending/not-provided label.
- Confirm money at risk and savings show the unavailable message when source tariff/support is absent.
- Create a reading, verify its Audit_Log row, then attempt the same meter/date/time and confirm `DUPLICATE_READING`.
- Explicitly update a reading and verify Audit_Log contains old and new JSON.
- Confirm a lower reading is rejected without a reset indication.
- Create/update an investigation input, evidence link, and corrective action; verify each audit record.
- Attempt premature root-cause confirmation and case closure; verify clear missing-gate lists.
- Disconnect the API and confirm cached data is labelled not current. Save a field draft and confirm no automatic write occurs.
- Reconnect and explicitly confirm one draft submission; verify no silent retry or duplicate.
- Archive/export pre-M3 local records and confirm nothing is merged into the Sheet.
- Switch to Mock mode and confirm only the supplied C7 fixture appears with unknown values left blank/null.
