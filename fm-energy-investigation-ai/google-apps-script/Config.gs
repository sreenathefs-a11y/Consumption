/** Central Milestone 3 configuration. Never store deployment tokens here. */
var CONFIG = Object.freeze({
  SPREADSHEET_ID: '1x9_eKa9PgiELyyKOUY6P6Ej4pbWRWdpK2OYgUBbM_Us',
  SPREADSHEET_TITLE: 'FM Utility Intelligence Master - Milestone 2',
  API_VERSION: 'v1',
  DATA_VERSION: 'M2.0',
  TIMEZONE: 'Asia/Dubai',
  LOCK_TIMEOUT_MS: 30000,
  SHEETS: Object.freeze({
    dashboard: 'Dashboard', sites: 'Site_Master', buildings: 'Building_Master', utilities: 'Utility_Master',
    meters: 'Utility_Meter_Master', readings: 'Meter_Readings', consumption: 'Utility_Consumption', bills: 'Utility_Bills',
    drivers: 'Operational_Drivers', cases: 'Investigation_Cases', inputs: 'Investigation_Inputs', evidence: 'Evidence_Register',
    actions: 'Corrective_Actions', dashboardData: 'Dashboard_Data', settings: 'Settings', audit: 'Audit_Log',
    historical: 'Historical_Consumption', anomalies: 'Anomaly_Register', quality: 'Data_Quality_Issues',
    sources: 'Source_Inventory', migration: 'Migration_Plan', findings: 'Key_Findings'
  }),
  IDS: Object.freeze({
    sites: 'Site_ID', buildings: 'Building_ID', utilities: 'Utility_ID', meters: 'Meter_ID', readings: 'Reading_ID',
    consumption: 'Consumption_ID', cases: 'Case_ID', inputs: 'Input_ID', evidence: 'Evidence_ID', actions: 'Action_ID', anomalies: 'Anomaly_ID'
  })
});

/** Canonical field aliases only translate API filters; source sheet headers remain unchanged. */
var SCHEMA = Object.freeze({
  sites: { id: 'Site_ID', name: 'Site_Name', status: 'Status' },
  buildings: { id: 'Building_ID', siteId: 'Site_ID', name: 'Building_Name', status: 'Status' },
  utilities: { id: 'Utility_ID', name: 'Utility_Name', status: 'Status' },
  meters: { id: 'Meter_ID', number: 'Meter_Number', name: 'Meter_Name', siteId: 'Site_ID', buildingId: 'Building_ID', utilityId: 'Utility_ID', status: 'Status' },
  readings: { id: 'Reading_ID', meterId: 'Meter_ID', date: 'Reading_Date', time: 'Reading_Time', value: 'Reading_Value', verificationStatus: 'Verification_Status' },
  consumption: { id: 'Consumption_ID', meterId: 'Meter_ID', siteId: 'Site_ID', utilityId: 'Utility_ID', periodFrom: 'Period_From', periodTo: 'Period_To', quality: 'Data_Quality_Status' },
  cases: { id: 'Case_ID', meterId: 'Meter_ID', siteId: 'Site_ID', utilityId: 'Utility_ID', severity: 'Severity', status: 'Status', assignedTo: 'Assigned_To' },
  evidence: { id: 'Evidence_ID', caseId: 'Case_ID', questionId: 'Question_ID', type: 'Evidence_Type', verificationStatus: 'Verification_Status' },
  actions: { id: 'Action_ID', caseId: 'Case_ID', status: 'Status', assignedTo: 'Assigned_To', targetDate: 'Target_Date' },
  anomalies: { id: 'Anomaly_ID', site: 'Site', building: 'Building', utility: 'Utility', severity: 'Severity', status: 'Status', month: 'Month', year: 'Year' }
});
