import { seedData } from './seed-data.js';

const KEY = 'fmeia_db_v1';
let memory = null;
const available = (() => {
  try {
    localStorage.setItem('__fmeia_test', '1');
    localStorage.removeItem('__fmeia_test');
    return true;
  } catch {
    return false;
  }
})();

function migrate(db) {
  db.version = 2;
  db.cases = Array.isArray(db.cases) ? db.cases : [];
  db.cases.forEach(caseData => {
    caseData.evidence = (caseData.evidence || []).map(item => ({
      verificationStatus: 'Pending verification',
      questionId: '',
      ...item
    }));
    caseData.actions = caseData.actions || [];
    caseData.activity = caseData.activity || [];
    caseData.notes = caseData.notes || [];
  });
  db.demo = {
    priorities: [
      { id: 'DEMO-A', caseName: 'Tower A', waitingFor: 'Waiting for CT ratio', owner: 'Electrical Engineer', severity: 'High' },
      { id: 'DEMO-C15', caseName: 'C15', waitingFor: 'Waiting for current measurement', owner: 'Technician', severity: 'Medium' }
    ],
    waitingClient: 2,
    waitingEngineer: 3,
    waitingContractor: 1,
    overdueActions: 2,
    recentlyClosed: 4,
    ...db.demo
  };
  return db;
}

function save(db) {
  memory = migrate(db);
  if (available) localStorage.setItem(KEY, JSON.stringify(memory));
  window.dispatchEvent(new CustomEvent('fmeia:change'));
  return memory;
}

export const storage = {
  init() {
    let db = null;
    if (available) {
      try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; }
    }
    if (!db || !db.version) db = seedData();
    return save(db);
  },
  get() { return memory || this.init(); },
  collection(name) { return this.get()[name] || []; },
  find(name, id) { return this.collection(name).find(item => item.id === id); },
  create(name, item) { const db = this.get(); db[name].push(item); save(db); return item; },
  update(name, id, patch) { const db = this.get(); const index = db[name].findIndex(item => item.id === id); if (index < 0) return null; db[name][index] = { ...db[name][index], ...patch }; save(db); return db[name][index]; },
  delete(name, id) { const db = this.get(); db[name] = db[name].filter(item => item.id !== id); save(db); },
  mutate(callback) { const db = this.get(); callback(db); return save(db); },
  export() { return JSON.stringify(this.get(), null, 2); },
  import(raw) { const db = JSON.parse(raw); if (!db.version || !Array.isArray(db.cases)) throw new Error('Invalid FM Energy backup'); return save(db); },
  reset() { if (available) localStorage.removeItem(KEY); memory = null; return this.init(); },
  persistent: available
};
