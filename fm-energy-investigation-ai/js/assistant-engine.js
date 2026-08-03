import { assess } from './investigation-engine.js';
import { getWizardState, getSmartProgress } from './workflow-engine.js';
import { difference, costImpact } from './calculations.js';
import { fmt, money } from './utils.js';

export const QUICK_PROMPTS = ['Why is C7 abnormal?', 'What should I check next?', 'Generate investigation summary.', 'Generate technical report.', 'Estimate savings.', 'Show missing evidence.'];

export function answerAssistant(prompt, caseData, meter, settings) {
  const normalized = prompt.toLowerCase();
  const findings = assess(caseData);
  const activeFindings = findings.filter(item => item.status !== 'Not assessed');
  const wizard = getWizardState(caseData);
  const progress = getSmartProgress(caseData);
  if (normalized.includes('why')) {
    return activeFindings.length
      ? `C7 is abnormal because July recorded ${fmt(caseData.readings.July)} kWh, ${fmt(difference(caseData.readings.June, caseData.readings.July))} kWh above June. Current evidence supports: ${activeFindings.map(item => `${item.name} — ${item.status}`).join('; ')}. This is an assessment, not a confirmed root cause.`
      : 'July is 180.3% above June, but there is not enough verified evidence to explain why. Reading, period, CT/multiplier, and load checks must be completed before naming a cause.';
  }
  if (normalized.includes('next')) return wizard.active ? `${wizard.active.title}. ${wizard.active.prompt}` : 'All guided tasks are complete. Review the closure gates and verified corrective action.';
  if (normalized.includes('missing')) {
    const missing = caseData.questions.filter(q => q.mandatory && !['Answered', 'Verified', 'Not applicable'].includes(q.status));
    return missing.length ? `Missing mandatory evidence: ${missing.map(q => q.text).join(' · ')}` : 'All mandatory questions have a recorded outcome. Verify the linked evidence before closure.';
  }
  if (normalized.includes('saving')) {
    const excess = Math.max(0, caseData.readings.July - (meter.normalMax || caseData.readings.June));
    return `Current money at risk is approximately ${money(costImpact(excess, caseData.tariff), settings.currency)} per repeated month. Savings must be verified from post-action readings; this is not a guaranteed saving.`;
  }
  if (normalized.includes('report')) return 'Use Generate PDF in the case header. The report separates confirmed facts, pending items, possible causes, evidence, actions, and verification.';
  return `C7 remains in ${caseData.status}. Data collection is ${progress.dataCollection}% complete, technical verification is ${progress.technicalVerification}% complete, and ${caseData.evidence.length} evidence items are recorded. ${wizard.active ? `Next: ${wizard.active.title}.` : 'The guided sequence is complete.'}`;
}
