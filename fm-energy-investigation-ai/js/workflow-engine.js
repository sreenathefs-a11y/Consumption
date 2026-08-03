import { completion, evidenceCompleteness } from './calculations.js';

export const WIZARD_TASKS = [
  { id: 'photo-july', questionId: 'Q9', title: 'Upload the July meter photo', type: 'evidence', evidenceType: 'Meter photograph', prompt: 'Capture the full meter face so the serial number, displayed reading, and timestamp are legible.', tool: 'Phone camera', person: 'Meter Reader', stage: 'Meter data validation' },
  { id: 'july-closing', questionId: 'Q5', title: 'Enter the July closing reading', type: 'number', prompt: 'Enter the reading exactly as displayed. Do not apply the CT multiplier here.', unit: 'meter units', person: 'Meter Reader', stage: 'Meter data validation' },
  { id: 'reading-date', questionId: 'Q7', title: 'Verify the reading date and time', type: 'datetime-local', prompt: 'Use the timestamp from the reading register or original photo.', person: 'Meter Reader', stage: 'Meter data validation' },
  { id: 'june-closing', questionId: 'Q3', title: 'Enter the June closing reading', type: 'number', prompt: 'Use the verified June source record.', unit: 'meter units', person: 'Energy Analyst', stage: 'Meter data validation' },
  { id: 'july-opening', questionId: 'Q4', title: 'Enter the July opening reading', type: 'number', prompt: 'This should normally match the June closing reading.', unit: 'meter units', person: 'Energy Analyst', stage: 'Meter data validation' },
  { id: 'ct-ratio', questionId: 'Q20', title: 'Enter the installed CT ratio', type: 'text', prompt: 'Record the physical CT nameplate ratio, for example 200/5.', person: 'Authorized Electrical Engineer', stage: 'Meter and CT verification', electrical: true },
  { id: 'multiplier', questionId: 'Q21', title: 'Verify the configured multiplier', type: 'number', prompt: 'Record the multiplier configured in the billing or calculation source.', person: 'Energy Analyst', stage: 'Meter and CT verification' },
  { id: 'continuity', questionId: 'Q6', title: 'Check meter reading continuity', type: 'yes/no', prompt: 'Confirm whether June closing equals July opening after checking both source records.', person: 'Energy Analyst', stage: 'Reading-period validation' },
  { id: 'period-days', questionId: 'Q8', title: 'Confirm the July reading period', type: 'number', prompt: 'Enter the exact number of days represented by July consumption.', unit: 'days', person: 'Energy Analyst', stage: 'Reading-period validation' },
  { id: 'connected-db', questionId: 'Q40', title: 'Identify the connected distribution board', type: 'text', prompt: 'Confirm the DB from the SLD and physical labels.', person: 'Electrical Supervisor', stage: 'Connected-load identification', electrical: true },
  { id: 'temporary-load', questionId: 'Q51', title: 'Check for temporary connected loads', type: 'yes/no', prompt: 'Check contractor supplies, temporary panels, and cross-connections.', person: 'Electrical Supervisor', stage: 'Connected-load identification', electrical: true },
  { id: 'night-load', questionId: 'Q79', title: 'Measure the night-time base load', type: 'number', prompt: 'Measure stable demand outside occupied hours using an approved method.', unit: 'kW', person: 'Authorized Electrical Engineer', stage: 'Electrical measurements', electrical: true },
  { id: 'abnormal-feeder', questionId: 'Q81', title: 'Identify any feeder operating at night', type: 'text', prompt: 'Record the highest persistent feeder and measured current.', person: 'Authorized Electrical Engineer', stage: 'Electrical measurements', electrical: true },
  { id: 'hvac-operation', questionId: 'Q58', title: 'Verify HVAC and BMS operation', type: 'yes/no', prompt: 'Confirm whether HVAC operated continuously or outside schedule.', person: 'BMS Engineer', stage: 'Operational review' },
  { id: 'root-evidence', questionId: 'Q96', title: 'Confirm the evidence-supported root cause', type: 'text', prompt: 'State one cause and link it to verified evidence. A hypothesis is not a confirmed cause.', person: 'Facility Manager', stage: 'Root-cause confirmation', rootCause: true },
  { id: 'corrective-action', questionId: 'Q100', title: 'Assign the corrective action', type: 'text', prompt: 'Create an owned, dated corrective action for the confirmed cause.', person: 'Facility Manager', stage: 'Corrective action' },
  { id: 'post-verification', questionId: 'Q114', title: 'Verify post-action consumption', type: 'yes/no', prompt: 'Confirm measured daily consumption reduced after the action.', person: 'Energy Manager', stage: 'Post-action verification' }
];

export function isTaskComplete(task, caseData) {
  const question = caseData.questions.find(item => item.id === task.questionId);
  if (task.type === 'evidence') {
    return caseData.evidence.some(item => item.questionId === task.questionId && item.verificationStatus === 'Verified');
  }
  return Boolean(question && ['Answered', 'Verified', 'Not applicable'].includes(question.status) && String(question.answer || '').trim());
}

export function getWizardState(caseData) {
  const completed = WIZARD_TASKS.filter(task => isTaskComplete(task, caseData));
  const active = WIZARD_TASKS.find(task => !isTaskComplete(task, caseData)) || null;
  return { active, completed, locked: active ? WIZARD_TASKS.slice(completed.length + 1) : [], total: WIZARD_TASKS.length };
}

export function getSmartProgress(caseData) {
  const groups = {
    data: ['Meter data validation', 'Reading-period validation'],
    technical: ['Meter and CT verification', 'Connected-load identification', 'Operational review', 'Electrical measurements']
  };
  const score = names => {
    const questions = caseData.questions.filter(question => names.includes(question.stage));
    return Math.round(completion(questions));
  };
  return {
    dataCollection: score(groups.data),
    technicalVerification: score(groups.technical),
    evidenceCount: caseData.evidence.length,
    evidenceTarget: 18,
    evidencePercent: evidenceCompleteness(caseData.evidence, 18),
    rootCause: caseData.rootCause ? 'Confirmed' : 'Pending',
    correctiveAction: caseData.actions.length ? caseData.actions[0].status : 'Not started'
  };
}

export function getTimeline(caseData) {
  const stages = [
    ['Case Created', () => true],
    ['Reading Verified', () => ['Q3', 'Q4', 'Q5'].every(id => ['Answered', 'Verified'].includes(caseData.questions.find(q => q.id === id)?.status))],
    ['Meter Verified', () => ['Q20', 'Q21'].every(id => ['Answered', 'Verified'].includes(caseData.questions.find(q => q.id === id)?.status))],
    ['Reading Period Verified', () => ['Q7', 'Q8'].every(id => ['Answered', 'Verified'].includes(caseData.questions.find(q => q.id === id)?.status))],
    ['Load Investigation', () => caseData.questions.some(q => q.stage === 'Connected-load identification' && q.status !== 'Pending')],
    ['Electrical Measurement', () => caseData.questions.some(q => q.stage === 'Electrical measurements' && q.status !== 'Pending')],
    ['Root Cause', () => Boolean(caseData.rootCause)],
    ['Corrective Action', () => caseData.actions.length > 0],
    ['Verification', () => caseData.actions.some(action => ['Verification pending', 'Verified'].includes(action.status))],
    ['Closed', () => caseData.status === 'Closed']
  ];
  let firstIncompleteFound = false;
  return stages.map(([label, test]) => {
    const complete = test();
    let state = 'future';
    if (complete && !firstIncompleteFound) state = 'complete';
    else if (!firstIncompleteFound) { state = 'current'; firstIncompleteFound = true; }
    return { label, state };
  });
}

export function rootCauseGate(caseData) {
  const missing = [];
  if (!caseData.evidence.some(e => e.verificationStatus === 'Verified')) missing.push('at least one verified evidence item');
  if (!['Q3', 'Q4', 'Q5'].every(id => caseData.questions.find(q => q.id === id)?.status === 'Verified')) missing.push('verified June/July readings');
  if (!['Q20', 'Q21'].every(id => ['Answered', 'Verified'].includes(caseData.questions.find(q => q.id === id)?.status))) missing.push('meter CT ratio and multiplier');
  if (caseData.questions.filter(q => q.mandatory).some(q => !['Answered', 'Verified', 'Not applicable'].includes(q.status))) missing.push('all mandatory questions');
  if (!caseData.actions.length) missing.push('an assigned corrective action');
  return { allowed: missing.length === 0, missing };
}
