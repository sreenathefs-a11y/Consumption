import { dataAdapter } from './data-adapter.js';
import { initShell, renderConnectionBanner, safeMessage } from './ui.js';
import { displayValue } from './schema-mapping.js';
import { esc, fmt } from './utils.js';

initShell();
const summary = document.querySelector('#summary');
const prioritiesElement = document.querySelector('#todayPriorities');
let charts = [];
function unavailableMoney(value) { return value === null || value === undefined || value === '' ? 'Cost unavailable — tariff not entered' : new Intl.NumberFormat('en-AE', { style:'currency', currency:'AED' }).format(value); }
function loading() { summary.innerHTML = Array.from({length:9},()=>'<div class="skeleton-row"></div>').join(''); }
async function loadFilters() { const [sites, utilities] = await Promise.all([dataAdapter.getSites(), dataAdapter.getUtilities()]); document.querySelector('#siteFilter').innerHTML='<option value="">All live sites</option>'+sites.data.map(item=>`<option value="${esc(item.Site_ID)}">${esc(displayValue(item.Site_Name))}</option>`).join(''); document.querySelector('#utilityFilter').innerHTML='<option value="">All utilities</option>'+utilities.data.map(item=>`<option value="${esc(item.Utility_ID)}">${esc(displayValue(item.Utility_Name))}</option>`).join(''); }
async function load() {
  loading();
  try {
    const filters={siteId:document.querySelector('#siteFilter').value,utilityId:document.querySelector('#utilityFilter').value};
    const [dashboard,cases,anomalies,consumption] = await Promise.all([dataAdapter.getDashboard(filters),dataAdapter.getCases(filters),dataAdapter.getAnomalies(filters),dataAdapter.getConsumption(filters)]);
    const source=dashboard.source;renderConnectionBanner({source,lastSync:dashboard.meta.timestamp||dashboard.meta.cachedAt});document.querySelector('#dataBadge').textContent=source==='live'?'LIVE GOOGLE SHEET':source==='cache'?'CACHED DATA':source==='mock'?'MOCK · C7 ONLY':'OFFLINE';
    const d=dashboard.data;
    const metrics=[['Live Sites',d.liveSites],['Real Buildings',d.buildings],['Mapped Meters',d.mappedMeters],['Readings Pending Verification',d.pendingVerificationReadings],['Open Investigations',d.openInvestigations],['Critical Anomalies',d.criticalAnomalies],['High Anomalies',d.highAnomalies],['Data-quality Issues',d.dataQualityIssues],['Corrective Actions Overdue',d.correctiveActionsOverdue],['Money at Risk',unavailableMoney(d.moneyAtRisk)],['Potential Savings',unavailableMoney(d.potentialSavings)]];
    summary.innerHTML=metrics.map(([label,value])=>`<article class="operational-card"><span class="op-icon">${label.includes('Anomal')?'!':'◈'}</span><div><small>${label}</small><b>${value===null||value===undefined?'Not available':value}</b><p>Calculated from live source tabs</p></div></article>`).join('');
    const open=cases.data.filter(item=>!['Closed','Cancelled'].includes(item.Status));prioritiesElement.innerHTML=open.length?open.slice(0,5).map((item,index)=>`<a class="priority-item" href="case.html?caseId=${encodeURIComponent(item.Case_ID)}"><span class="priority-number">${index+1}</span><span class="priority-copy"><b>${esc(displayValue(item.Case_Title))}</b><small>${esc(displayValue(item.Next_Required_Action||item.Status))}</small></span><span class="priority-owner"><small>Assigned to</small><b>${esc(displayValue(item.Assigned_To))}</b></span><span class="badge ${item.Severity==='Critical'?'critical':''}">${esc(displayValue(item.Severity))}</span><span class="arrow">→</span></a>`).join(''):'<div class="empty-state"><h3>No open investigations</h3><p>No matching live case records were returned.</p></div>';
    document.querySelector('#priority').hidden=true;
    renderCharts(consumption.data,anomalies.data);
    document.querySelector('#activity').innerHTML='<div class="empty-state"><p>Activity is loaded from Audit_Log for controlled writes. No fabricated activity is shown.</p></div>';
    document.querySelector('#quality').innerHTML=`<div class="quality-row"><span>Open data-quality issues</span><b>${d.dataQualityIssues??'Not available'}</b></div><div class="quality-row"><span>Pending reading verifications</span><b>${d.pendingVerificationReadings??'Not available'}</b></div>`;
  } catch(error) { renderConnectionBanner({source:error.code==='API_NOT_CONFIGURED'?'unconfigured':'offline',message:safeMessage(error)});summary.innerHTML=`<div class="empty-state"><h3>Live dashboard unavailable</h3><p>${safeMessage(error)}</p></div>`;prioritiesElement.innerHTML=''; }
}
function renderCharts(consumption,anomalies){charts.forEach(chart=>chart.destroy());charts=[];if(!window.Chart)return;const values=consumption.slice(-12);charts.push(new Chart(document.querySelector('#trend'),{type:'line',data:{labels:values.map(x=>displayValue(x.Period||x.Period_From)),datasets:[{label:'Recorded consumption',data:values.map(x=>x.Consumption??x.Consumption_Value),borderColor:'#176b87'}]}}));const counts=anomalies.reduce((out,item)=>{const type=item.Anomaly_Type||'Not provided';out[type]=(out[type]||0)+1;return out},{});charts.push(new Chart(document.querySelector('#statuses'),{type:'doughnut',data:{labels:Object.keys(counts),datasets:[{data:Object.values(counts),backgroundColor:['#d92d20','#d97706','#2563eb','#667085']}]}}));}
document.querySelectorAll('#siteFilter,#utilityFilter').forEach(el=>el.onchange=load);
loadFilters().then(load).catch(load);
