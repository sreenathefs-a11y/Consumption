import { storage } from './storage.js';
import { initShell, toast } from './ui.js';
import { getWizardState } from './workflow-engine.js';
import { id } from './utils.js';

initShell();
let caseData = storage.collection('cases')[0];
const state = getWizardState(caseData);
document.querySelector('#fieldTask').innerHTML = `<article class="field-task"><span class="task-icon">${state.active?.electrical ? 'ϟ' : '✓'}</span><div><span class="badge critical">C7 · ${caseData.severity}</span><h1>${state.active?.title || 'Field checks complete'}</h1><p>${state.active?.prompt || 'Return the case to the Facility Manager for closure review.'}</p><small>Assigned role · ${state.active?.person || caseData.assigned}</small></div></article>`;
const recordedAt = document.querySelector('[name=recordedAt]');
recordedAt.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
document.querySelector('#fieldForm').onsubmit = async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const photo = form.elements.photo.files[0];
  caseData.evidence.push({ id: id('EVD'), type: photo ? 'Meter photograph' : 'Clamp-meter measurement', title: `Field update — ${state.active?.title || 'C7'}`, notes: `Reading: ${values.reading || '—'}; Current: ${values.current || '—'} A; Voltage: ${values.voltage || '—'} V; Remarks: ${values.remarks || 'None'}`, fileName: photo?.name || '', data: null, questionId: state.active?.questionId || '', verificationStatus: 'Pending verification', uploadedBy: storage.get().settings.userName, at: values.recordedAt ? new Date(values.recordedAt).toISOString() : new Date().toISOString() });
  if (state.active && values.reading) {
    const question = caseData.questions.find(q => q.id === state.active.questionId);
    if (question && state.active.type !== 'evidence') { question.answer = values.reading; question.status = 'Answered'; question.updatedBy = storage.get().settings.userName; question.updatedAt = new Date().toISOString(); }
  }
  caseData.activity.unshift({ text: `Technician field update submitted for ${state.active?.title || 'C7'}`, at: new Date().toISOString() });
  storage.update('cases', caseData.id, caseData);
  toast('Field update submitted for verification');
  form.reset();
  setTimeout(() => location.reload(), 700);
};
