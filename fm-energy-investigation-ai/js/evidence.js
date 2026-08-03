import { storage } from './storage.js';
import { initShell, toast } from './ui.js';
import { esc, id, date } from './utils.js';

initShell();
let caseData = storage.collection('cases')[0];
const form = document.querySelector('#dropForm');
const fileInput = document.querySelector('#evidenceFile');
const types = ['Meter photograph', 'Meter reading', 'Clamp-meter measurement', 'Power-analyser record', 'Thermal image', 'BMS screenshot', 'DB schedule', 'Single-line diagram', 'Work order', 'Permit', 'Technician report', 'Comment', 'Other document'];
form.elements.type.innerHTML = types.map(type => `<option>${type}</option>`).join('');
form.elements.questionId.innerHTML = '<option value="">General case evidence</option>' + caseData.questions.map(q => `<option value="${q.id}">${q.id} · ${esc(q.text)}</option>`).join('');

async function compress(file) {
  if (!file || file.size > 750000 || !file.type.startsWith('image/')) return null;
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1000 / image.width);
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function render() {
  caseData = storage.collection('cases')[0];
  const verified = caseData.evidence.filter(item => item.verificationStatus === 'Verified').length;
  document.querySelector('#evidenceSummary').innerHTML = `<span><b>${caseData.evidence.length}</b><small>Total items</small></span><span><b>${verified}</b><small>Verified</small></span><span><b>${caseData.evidence.length - verified}</b><small>Awaiting review</small></span>`;
  const filter = document.querySelector('#evidenceFilter').value;
  const items = caseData.evidence.filter(item => !filter || item.type === filter);
  document.querySelector('#evidenceGallery').innerHTML = items.length ? items.slice().reverse().map(item => {
    const question = caseData.questions.find(q => q.id === item.questionId);
    return `<article class="evidence-tile">${item.data ? `<img src="${item.data}" alt="${esc(item.title)}">` : `<div class="file-placeholder">${item.type === 'Comment' ? '“' : '▧'}</div>`}<div><span class="badge">${esc(item.type)}</span><h3>${esc(item.title)}</h3><p>${esc(item.notes || 'No comments')}</p><dl><div><dt>Date</dt><dd>${date(item.at)}</dd></div><div><dt>Uploaded by</dt><dd>${esc(item.uploadedBy)}</dd></div><div><dt>Related question</dt><dd>${question ? `${question.id} · ${esc(question.text)}` : 'General case evidence'}</dd></div><div><dt>Verification</dt><dd><select class="verify-evidence" data-id="${item.id}">${['Pending verification', 'Verified', 'Needs recheck', 'Rejected'].map(status => `<option ${status === item.verificationStatus ? 'selected' : ''}>${status}</option>`).join('')}</select></dd></div></dl><button class="btn small delete-evidence" data-id="${item.id}">Delete</button></div></article>`;
  }).join('') : '<div class="empty-state"><span>▧</span><h3>No matching evidence</h3><p>Drop a file or add a comment to begin the controlled evidence trail.</p></div>';
  document.querySelectorAll('.verify-evidence').forEach(select => select.onchange = () => {
    const item = caseData.evidence.find(e => e.id === select.dataset.id);
    item.verificationStatus = select.value;
    storage.update('cases', caseData.id, caseData);
    toast('Evidence verification updated');
    render();
  });
  document.querySelectorAll('.delete-evidence').forEach(button => button.onclick = () => {
    if (confirm('Delete this evidence item? This cannot be undone.')) {
      caseData.evidence = caseData.evidence.filter(item => item.id !== button.dataset.id);
      storage.update('cases', caseData.id, caseData);
      toast('Evidence deleted');
      render();
    }
  });
}

document.querySelector('#chooseFile').onclick = () => fileInput.click();
const dropZone = document.querySelector('#dropZone');
dropZone.onclick = event => { if (!event.target.closest('button')) fileInput.click(); };
dropZone.onkeydown = event => { if (['Enter', ' '].includes(event.key)) fileInput.click(); };
['dragenter', 'dragover'].forEach(name => dropZone.addEventListener(name, event => { event.preventDefault(); dropZone.classList.add('dragging'); }));
['dragleave', 'drop'].forEach(name => dropZone.addEventListener(name, event => { event.preventDefault(); dropZone.classList.remove('dragging'); }));
dropZone.addEventListener('drop', event => { fileInput.files = event.dataTransfer.files; document.querySelector('#fileState').textContent = `${fileInput.files[0]?.name || 'File'} ready to add`; });
fileInput.onchange = () => { document.querySelector('#fileState').textContent = `${fileInput.files[0]?.name || 'File'} ready to add`; if (!form.elements.title.value) form.elements.title.value = fileInput.files[0]?.name || ''; };
document.querySelector('#evidenceFilter').onchange = render;
form.onsubmit = async event => {
  event.preventDefault();
  const file = fileInput.files[0];
  const limit = storage.get().settings.evidenceWarningKb * 1024;
  const data = file && file.size <= limit ? await compress(file) : null;
  if (file && file.size > limit) toast('File exceeds the local limit; metadata was saved instead');
  caseData.evidence.push({ id: id('EVD'), type: form.elements.type.value, title: form.elements.title.value, notes: form.elements.notes.value, fileName: file?.name || '', data, questionId: form.elements.questionId.value, verificationStatus: form.elements.verificationStatus.value, uploadedBy: storage.get().settings.userName, at: new Date().toISOString() });
  storage.update('cases', caseData.id, caseData);
  form.reset();
  toast('Evidence added to C7');
  render();
};
render();
