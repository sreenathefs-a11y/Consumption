/** Development fixture: only explicitly supplied C7 facts. Unknown fields remain null. */
export const C7_MOCK = Object.freeze({
  sites: [{ Site_ID: null, Site_Name: 'Etihad Plaza', Status: 'Active' }],
  buildings: [],
  utilities: [{ Utility_ID: null, Utility_Name: 'Electricity', Status: 'Active' }],
  meters: [{ Meter_ID: 'MTR-EYP-C7-001', Meter_Number: 'ACC11D000382', Meter_Name: null, Site_ID: null, Building_ID: null, Utility_ID: null, Unit: 'kWh', Meter_Level: null, Parent_Meter_ID: null, CT_Ratio: null, Multiplier: null, Reading_Frequency: null, Status: 'Active', Data_Status: 'Pending verification', Latest_Reading: null, Latest_Reading_Date: null, Verification_Status: 'Pending verification' }],
  cases: [{ Case_ID: 'CASE-2026-0001', Case_Title: 'C7 – Unusually High July Electricity Consumption', Meter_ID: 'MTR-EYP-C7-001', Site_ID: null, Utility_ID: null, Severity: 'Critical', Status: 'Data Collection', Root_Cause_Status: 'Not Assessed', Confirmed_Root_Cause: null, Assigned_To: null }],
  consumption: [{ Consumption_ID: null, Meter_ID: 'MTR-EYP-C7-001', Site_ID: null, Utility_ID: null, Period: '2026-06', Consumption: 6640, Unit: 'kWh', Data_Quality_Status: 'Pending verification' }, { Consumption_ID: null, Meter_ID: 'MTR-EYP-C7-001', Site_ID: null, Utility_ID: null, Period: '2026-07', Consumption: 18615, Unit: 'kWh', Data_Quality_Status: 'Pending verification' }],
  readings: [], evidence: [], actions: [], inputs: [], anomalies: [{ Anomaly_ID: null, Case_ID: 'CASE-2026-0001', Meter_ID: 'MTR-EYP-C7-001', Site: 'Etihad Plaza', Utility: 'Electricity', Period: '2026-07', Anomaly_Type: 'Consumption anomaly', Severity: 'Critical', Status: 'Open', Current_Value: 18615, Previous_Value: 6640, Difference: 11975 }], quality: []
});
export function mockDashboard() { return { liveSites: 1, buildings: 0, mappedMeters: 1, pendingVerificationReadings: 0, openInvestigations: 1, criticalAnomalies: 1, highAnomalies: 0, dataQualityIssues: 0, correctiveActionsOverdue: 0, moneyAtRisk: null, potentialSavings: null }; }
