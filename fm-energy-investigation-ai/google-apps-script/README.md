# Google Apps Script backend — Milestone 3

This project exposes controlled JSON endpoints over **FM Utility Intelligence Master - Milestone 2**. It contains no API token or Google credential. Apps Script runs as the deployment owner and opens spreadsheet `1x9_eKa9PgiELyyKOUY6P6Ej4pbWRWdpK2OYgUBbM_Us` with `SpreadsheetApp.openById()`.

## Deploy

1. Open the target Google Sheet.
2. Select **Extensions → Apps Script**.
3. Create files matching every `.gs` file in this directory and paste each file's contents. Replace the generated manifest with `appsscript.json` after enabling **Show appsscript.json manifest file** in Project Settings.
4. Confirm `CONFIG.SPREADSHEET_ID` and every tab name. The repository uses exact source headers and does not rename sheet columns.
5. In Project Settings, confirm timezone **Asia/Dubai**.
6. From the editor, select and run `setApiTokenOnce()`. Authorize the script and enter a strong token of at least 24 characters. The value is stored in Script Properties, not source. To rotate it, delete `FM_ENERGY_API_TOKEN` in Script Properties and rerun the function.
7. Choose **Deploy → New deployment → Web app**.
8. Execute as **Me (deployment owner)**. Restrict access to the narrowest audience compatible with the hosted PWA. Apps Script cross-origin and identity constraints may require “Anyone” for a token-protected first deployment; assess this with the organization’s Google Workspace administrator.
9. Deploy and copy the `/exec` Web App URL.
10. In the PWA, open **Settings → Google Apps Script API**, choose **Remote**, paste the URL and token, then save.
11. Test `GET <deployment-url>?action=health`. Health intentionally does not require the API token. Confirm spreadsheet title, access, timezone, API `v1`, and data `M2.0`.
12. Test an authenticated read such as `getSites&token=...`.
13. Perform one controlled write using a non-duplicate reading or investigation input. Confirm the response includes an `auditLogId`.
14. Open `Audit_Log` and verify old/new values, user, action, entity, source, and timestamp.

## Deployment versions

Saving Apps Script source does **not** update an already-versioned Web App deployment. After code changes, use **Deploy → Manage deployments → Edit**, select **New version**, and deploy. Keep the `/exec` URL unless intentionally creating a separate deployment. Test health, one read, and one controlled write after every deployment.

## Authentication and browser limitation

GET accepts `token`; POST accepts `apiToken` in JSON. Apps Script Web Apps do not reliably expose arbitrary request headers to `doGet`/`doPost`, so `X-API-TOKEN` is not the primary transport here. A token saved in browser storage can be inspected by a user with device access and is not equivalent to server-side authentication. Use a restricted deployment and rotate tokens. The interfaces are intentionally replaceable with Google Identity and role-based access later.

## Data safety

- All writes acquire a script lock and do not retry automatically.
- IDs are generated independently; row numbers are never permanent identifiers.
- Duplicate readings are rejected. Updates require an explicit update action.
- No route physically deletes or sorts source rows.
- Evidence endpoints store HTTPS metadata links only; they never upload binary files.
- Every successful write attempts an Audit_Log append. `AUDIT_FAILURE` is a serious integrity error requiring immediate review because Sheets cannot provide a cross-sheet transaction rollback.
- Unknown fields are not filled with zero. Blank sheet cells are returned as `null`.

## Endpoint catalogue

Unauthenticated: `GET health`.

Authenticated reads: `getSettings`, `getSites`, `getBuildings`, `getUtilities`, `getMeters`, `getMeterReadings`, `getConsumption`, `getHistoricalConsumption`, `getAnomalies`, `getCases`, `getCaseDetails`, `getEvidence`, `getCorrectiveActions`, `getDashboard`, and `getPortfolioTree`.

Authenticated POST writes: `createMeterReading`, `updateMeterReading`, `createInvestigationInput`, `updateInvestigationInput`, `createEvidence`, `updateEvidenceStatus`, `createCorrectiveAction`, `updateCorrectiveAction`, `updateCase`, `confirmRootCause`, and `closeCase`.

## Troubleshooting

- `AUTH_NOT_CONFIGURED`: run `setApiTokenOnce()`.
- `PERMISSION_DENIED`: token mismatch or missing token.
- `SHEET_NOT_FOUND` / `SCHEMA_ERROR`: verify exact tab and header names in `Config.gs` against the workbook.
- HTML response: confirm the PWA uses the deployed `/exec` URL and deployment access permits the caller.
- Old behavior after editing code: deploy a **new version**; saving alone is insufficient.

## Milestone 4 intelligence endpoints

Redeploy a new Apps Script version after copying `Intelligence.gs` and the updated router/repository files. Saving source without redeploying does not update the live `/exec` deployment.

Authenticated reads added in Milestone 4: `getConsumptionIntelligence`, `getHistoricalAnalysis`, `getComparisonData`, `getOpportunities`, `getTodaySummary`, `getMonthlyChecklist`, and `getDataQualityIssues`. The controlled `updateAnomaly` POST records explained, ignored, and assigned alert decisions in both `Anomaly_Register` and `Audit_Log`.

Intelligence results are calculated at request time and are not written into source sheets. Safe reads may be cached for 120 seconds; writes invalidate the affected tab cache. Historical series are capped and consumption tables are paginated. Utilities and units remain separate, reductions with incomplete data are not treated as savings, and missing tariffs never produce assumed cost values.
