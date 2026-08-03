import { seedData } from './seed-data.js';

const findConsumption = (rows, month) => rows.find(row => String(row.Period || row.Period_Month || row.Consumption_Month || '').includes(month));
export function mapRemoteCaseDetails(details) {
  const template = seedData().cases[0];
  const source = details.case || {};
  const june = findConsumption(details.consumptionHistory || [], '2026-06');
  const july = findConsumption(details.consumptionHistory || [], '2026-07');
  const inputByQuestion = Object.fromEntries((details.investigationInputs || []).map(item => [item.Question_ID, item]));
  const questions = template.questions.map(question => {
    const input = inputByQuestion[question.id];
    return { ...question, answer: input?.Answer ?? '', status: input?.Status || 'Pending', assigned: input?.Assigned_To || source.Assigned_To || 'Not provided', dueDate: input?.Due_Date || '', notes: input?.Technical_Notes || '', history: [] };
  });
  return {
    id: source.Case_ID,
    title: source.Case_Title || 'C7 – Unusually High July Electricity Consumption',
    meterId: source.Meter_ID,
    site: details.site?.Site_Name || 'Not available',
    location: details.meter?.Location || 'C7',
    assigned: source.Assigned_To || 'Not provided',
    created: source.Created_Date || source.Created_At || null,
    severity: source.Severity || 'Critical',
    status: source.Status || 'Data Collection',
    tariff: details.meter?.Tariff ?? null,
    readings: { May: null, June: june?.Consumption ?? june?.Consumption_Value ?? 6640, July: july?.Consumption ?? july?.Consumption_Value ?? 18615 },
    stageStatuses: template.stageStatuses,
    questions,
    evidence: (details.evidence || []).map(item => ({ id:item.Evidence_ID,type:item.Evidence_Type,title:item.File_Name||'Evidence record',notes:item.Remarks||'',fileName:item.File_Name||'',fileLink:item.File_Link||'',data:null,questionId:item.Question_ID||'',verificationStatus:item.Verification_Status||'Pending verification',uploadedBy:item.Uploaded_By||'Not provided',at:item.Uploaded_At })),
    actions: (details.correctiveActions || []).map(item => ({ id:item.Action_ID,description:item.Description||'Not provided',rootCause:item.Root_Cause||'',assigned:item.Assigned_To||'Not provided',priority:item.Priority||'Not provided',targetDate:item.Target_Date||'',status:item.Status||'Proposed',expectedSaving:item.Expected_Saving??null })),
    notes: [], activity: [], rootCause: source.Confirmed_Root_Cause || null,
    remoteInputs: details.investigationInputs || []
  };
}
export function mapRemoteMeter(details) { const meter=details.meter||{};return {id:meter.Meter_ID,number:meter.Meter_Number||'Not available',name:meter.Meter_Name||'Not available',site:details.site?.Site_Name||'Not available',building:details.building?.Building_Name||'Not available',location:meter.Location||'C7',utility:details.utility?.Utility_Name||'Electricity',type:meter.Meter_Type||'Pending verification',ctRatio:meter.CT_Ratio??'',multiplier:meter.Multiplier??'',unit:meter.Unit||'kWh',frequency:meter.Reading_Frequency||'Pending verification',normalMin:null,normalMax:null,tariff:meter.Tariff??null,status:meter.Status||'Pending verification'}; }
