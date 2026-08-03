import { storage } from './storage.js';
import { initShell } from './ui.js';
import { fmt, money, date, esc } from './utils.js';
import { percentIncrease, completion, evidenceCompleteness } from './calculations.js';
import { getWizardState } from './workflow-engine.js';

initShell();
const db = storage.get();
const caseData = db.cases[0];
const demo = db.demo;
const progress = completion(caseData.questions);
const wizard = getWizardState(caseData);

const priorities = [
  { id: caseData.id, caseName: 'C7 Investigation', waitingFor: wizard.active ? wizard.active.title : 'Closure review', owner: wizard.active?.person || caseData.assigned, severity: caseData.severity, href: 'case.html' },
  ...(demo.priorities || []).map(item => ({ ...item, href: 'analytics.html' }))
];
document.querySelector('#todayPriorities').innerHTML = priorities.map((item, index) => `<a class="priority-item" href="${item.href}"><span class="priority-number">${index + 1}</span><span class="priority-copy"><b>${esc(item.caseName)}</b><small>${esc(item.waitingFor)}</small></span><span class="priority-owner"><small>Waiting for</small><b>${esc(item.owner)}</b></span><span class="badge ${item.severity === 'Critical' ? 'critical' : item.severity === 'High' ? 'warning' : ''}">${item.severity}</span><span class="arrow">→</span></a>`).join('');

const operational = [
  ['Today’s Tasks', priorities.length, 'tasks', 'Due across active cases'],
  ['Critical Cases', demo.critical, 'critical', 'Immediate FM attention'],
  ['Waiting For Client', demo.waitingClient, 'client', 'Approval or evidence'],
  ['Waiting For Engineer', demo.waitingEngineer, 'engineer', 'Technical verification'],
  ['Waiting For Contractor', demo.waitingContractor, 'contractor', 'Field completion'],
  ['Overdue Actions', demo.overdueActions, 'overdue', 'Escalation required'],
  ['Recently Closed', demo.recentlyClosed, 'closed', 'Last 30 days'],
  ['Estimated Savings', money(demo.verifiedSavings), 'saving', 'Verified portfolio value'],
  ['Money at Risk', money(demo.potentialCost), 'risk', 'If anomalies repeat']
];
document.querySelector('#summary').innerHTML = operational.map(([label, value, icon, note]) => `<article class="operational-card ${icon}"><span class="op-icon" aria-hidden="true">${{tasks:'✓',critical:'!',client:'◌',engineer:'ϟ',contractor:'⌁',overdue:'⌛',closed:'✓',saving:'↗',risk:'◈'}[icon]}</span><div><small>${label}</small><b>${value}</b><p>${note}</p></div></article>`).join('');

document.querySelector('#priority').innerHTML = `<div class="priority-grid"><div><span class="badge critical">Critical · ${caseData.status}</span><h2>${caseData.title}</h2><small>${db.meters[0].number} · ${caseData.site}</small></div><div class="metric"><small>June</small><b>${fmt(caseData.readings.June)} kWh</b></div><div class="metric"><small>July</small><b>${fmt(caseData.readings.July)} kWh</b></div><div class="metric"><small>Increase</small><b>+${fmt(percentIncrease(caseData.readings.June, caseData.readings.July), 1)}%</b></div><div><small>Checklist record ${fmt(progress)}%</small><div class="progress"><i style="width:${progress}%"></i></div><a class="btn" href="case.html">Continue investigation →</a></div></div><p><b>Current guided task:</b> ${esc(wizard.active?.title || 'Review closure gates')}</p>`;

document.querySelector('#activity').innerHTML = caseData.activity.map(item => `<div class="timeline-item"><b>${esc(item.text)}</b><small>${date(item.at)}</small></div>`).join('');
const quality = [['Meter data completeness', 25], ['Evidence completeness', evidenceCompleteness(caseData.evidence)], ['Reading continuity', caseData.questions.find(q => q.id === 'Q6')?.status === 'Verified' ? 100 : 0], ['Pending verifications', caseData.evidence.filter(e => e.verificationStatus !== 'Verified').length], ['Missing mandatory', caseData.questions.filter(q => q.mandatory && q.status === 'Pending').length]];
document.querySelector('#quality').innerHTML = quality.map(([label, value], index) => `<div class="quality-row"><span>${label}</span><b>${index < 3 ? `${fmt(value)}%` : value}</b>${index < 3 ? `<div class="progress"><i style="width:${value}%"></i></div>` : ''}</div>`).join('');

if (window.Chart) {
  new Chart(document.querySelector('#trend'), { type: 'bar', data: { labels: ['May', 'June', 'July'], datasets: [{ label: 'kWh', data: [5560, 6640, 18615], backgroundColor: ['#62a8bc', '#39869d', '#d92d20'], borderRadius: 7 }] }, options: { responsive: true, animation: { duration: 700 } } });
  new Chart(document.querySelector('#statuses'), { type: 'doughnut', data: { labels: ['Waiting', 'Investigating', 'Root cause', 'Action pending', 'Closed'], datasets: [{ data: [4, 2, 1, 3, 18], backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#10b981'], borderWidth: 0 }] }, options: { responsive: true, cutout: '68%' } });
}
