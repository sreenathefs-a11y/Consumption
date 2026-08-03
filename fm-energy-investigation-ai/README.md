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
3. Keep mode set to **Remote**, paste the `/exec` deployment URL, then select **Save and connect**. No token is required to view live data. Configure the token separately under **Authorized data changes** only when writes are required.
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
- Browser-held write tokens are an interim control for changes, not confidentiality or enterprise-grade authentication. Public reads expose data to anyone who can access the deployment URL.
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
- Deploy the Apps Script project and verify the public health endpoint identifies the expected workbook, Dubai timezone, API `v1`, and data `M2.0`.
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

# Milestone 4 — Consumption Intelligence and FM Experience

Milestone 4 makes consumption understanding the primary entry point while preserving the full evidence-led investigation workflow. Home answers: **What is happening? Where should I look? What should I do next?** The deterministic flow is consumption → validation → comparison → alert review → justified investigation → corrective action → verification → confirmed saving.

## User navigation

- **Home** — utility status, five priorities, Today queues, high/low use, verified improvements, and data quality.
- **Consumption** — overview, historical analysis, Portfolio, meters, Comparison Center, and Opportunities.
- **Alerts** — consumption and data-quality alerts; review, explain, assign, ignore with an audited reason, or open an existing investigation.
- **Investigations** — simplified problem/known/missing/next-action view with expandable technical details, evidence, actions, and reports.
- **Data Entry** — meter master, readings, and source data entry.
- **Reports** — portfolio, site, high/low, historical, quality, alerts, investigations, actions, savings, and the printable monthly checklist.
- **Settings** — Google Sheet connection and local display preferences.
- **Help & User Guide** is available below the primary navigation.

## Daily workflow

1. Open Home and review the five priorities.
2. Correct missing, negative, duplicate, suspicious-zero, continuity, or unverified data.
3. Review changes in Consumption.
4. Review alerts and open only justified investigations.
5. Complete the recommended check or corrective action.
6. Verify the result before recording a saving.

## Monthly workflow

1. Enter or import month-end readings.
2. Verify readings and resolve missing data.
3. Compare with the previous month and same month last year.
4. Review historical outliers and open justified investigations.
5. Review costs only where an approved tariff exists.
6. Verify savings and generate the monthly report.

## Classification rules

The backend uses available previous-period values, same-month history, historical range, normalized-period data, and data-quality/verification fields. It returns a classification, plain-language explanation, comparison basis, recommended action, and whether investigation is justified.

- **Normal** — within the available comparison and historical range.
- **Watch** — a material change that needs review, including an unverified reduction.
- **Abnormal** — outside the available normal range.
- **Critical** — far outside range and comparisons, after data checks.
- **Data issue** — negative, invalid, duplicate, broken, suspicious, or unverified source data.
- **Missing data** — absent value or an unconfirmed zero.
- **Not enough information** — insufficient comparable history.
- **Explained variation** — a change such as a seasonal increase that remains within the historical range.

A reduction with incomplete data is explained as **“Reduction not confirmed — incomplete or unverified meter data.”** Different utilities or units cannot be compared. Cost is unavailable when tariff is missing.

## Milestone 4 API reads

- `getConsumptionIntelligence` — filtered records, calculations, rankings, suspicious data, explanations, and pagination.
- `getHistoricalAnalysis` — unit-separated monthly series, rolling averages, annual totals, extremes, and gaps.
- `getComparisonData` — actuals, differences, percentage changes, ranks, validity, and context.
- `getOpportunities` — verified improvements, potential actions, and missing-data/tariff opportunities.
- `getTodaySummary` — utility cards, five priorities, high/low rankings, verified improvements, quality, and queues.
- `getMonthlyChecklist` — printable ten-step monthly control checklist.
- `getDataQualityIssues` — filtered source quality records used by Alerts.

`updateAnomaly` was added as an audited controlled write so explained, assigned, and ignored alert decisions are retained. Existing endpoints remain unchanged.

## Performance and accessibility

Apps Script caches safe read results for 120 seconds and invalidates affected caches after writes. Server filters and 50-row default pagination limit browser work; historical chart series are capped at 120 points. Filters are debounced. All empty charts are replaced with explanations. Status pills include text and color, table rows support keyboard drill-down, controls use labels and mobile touch sizes, and filters collapse on small screens.

## Milestone 4 limitations

- Classification quality depends on available live history, period dates, units, verification, occupancy, area, and operating-hour records. Missing context is explained, not assumed.
- Similar-building benchmarking is available only when comparable building attributes exist in source records.
- Same-month-last-year cards remain unavailable when no matching historical record is returned.
- Alert decisions can update an existing anomaly, but an investigation is not automatically created for every alert.
- Report previews are printable browser reports; the existing investigation PDF remains the dedicated technical PDF.
- No live-data accuracy claim is made by repository tests; deployment-owner acceptance must compare the UI with the connected workbook.

# Milestone 4.1 — Public Reads and Protected Writes

Normal viewing requires only the Apps Script Web App deployment URL. Health, dashboards, sites, meters, consumption, history, alerts, investigations, evidence, corrective-action views, portfolio, intelligence, comparisons, opportunities, Today, checklist, and data-quality GET actions are public. The frontend never puts the write token in a GET URL.

All POST actions remain protected. Before any network request, a write without a locally configured token is stopped and the app shows **Write access required** with **Open Settings** and **Cancel**. A configured token is sent only inside the POST JSON body. Backend `PERMISSION_DENIED` errors are translated into a human-readable message and are never retried automatically.

The base `/exec` URL returns a simple API-running JSON message. Unknown actions return `UNKNOWN_ACTION`; a write action sent through GET returns `METHOD_NOT_ALLOWED`. Access rules are centralized in `Router.gs`.

## Security warning

This model protects writes, not confidentiality of read-only utility data. Anyone who can reach the deployed Apps Script Web App URL can use its public GET endpoints. Utility information may be operationally sensitive:

- Use a private/internal frontend and controlled deployment audience where possible.
- Do not publish or casually share the Apps Script deployment URL.
- Configure write tokens only on managed devices used by authorized staff.
- A future production version should use Google Sign-In and role-based access.
- Public read access is suitable only for the user’s controlled internal deployment and is not enterprise-grade authentication.

### Milestone 4.1 transport hardening

The browser client also strips `token` and `apiToken` keys from caller-supplied GET parameters, preventing accidental credential leakage into URLs. A backend `PERMISSION_DENIED` response triggers the same **Write access required** guidance as a locally missing token; the failed request is not retried.
