/** Central browser mapping. Keys on the right are exact Google Sheet headers. */
export const SHEET_SCHEMA = Object.freeze({
  sites: { id: 'Site_ID', name: 'Site_Name', status: 'Status' },
  buildings: { id: 'Building_ID', siteId: 'Site_ID', name: 'Building_Name', status: 'Status' },
  utilities: { id: 'Utility_ID', name: 'Utility_Name', status: 'Status' },
  meters: { id: 'Meter_ID', number: 'Meter_Number', name: 'Meter_Name', siteId: 'Site_ID', buildingId: 'Building_ID', utilityId: 'Utility_ID', unit: 'Unit', level: 'Meter_Level', parentId: 'Parent_Meter_ID', ctRatio: 'CT_Ratio', multiplier: 'Multiplier', frequency: 'Reading_Frequency', status: 'Status', dataStatus: 'Data_Status' },
  readings: { id: 'Reading_ID', meterId: 'Meter_ID', date: 'Reading_Date', time: 'Reading_Time', value: 'Reading_Value', verificationStatus: 'Verification_Status' },
  cases: { id: 'Case_ID', meterId: 'Meter_ID', siteId: 'Site_ID', utilityId: 'Utility_ID', title: 'Case_Title', severity: 'Severity', status: 'Status', assignedTo: 'Assigned_To', rootCause: 'Confirmed_Root_Cause' },
  evidence: { id: 'Evidence_ID', caseId: 'Case_ID', questionId: 'Question_ID', type: 'Evidence_Type', fileLink: 'File_Link', fileName: 'File_Name', uploader: 'Uploaded_By', uploadedAt: 'Uploaded_At', verificationStatus: 'Verification_Status' },
  actions: { id: 'Action_ID', caseId: 'Case_ID', description: 'Description', assignedTo: 'Assigned_To', status: 'Status', targetDate: 'Target_Date' }
});
export const valueOf = (record, entity, field) => record?.[SHEET_SCHEMA[entity]?.[field]] ?? null;
export const displayValue = value => value === null || value === undefined || value === '' ? 'Pending verification' : String(value);
