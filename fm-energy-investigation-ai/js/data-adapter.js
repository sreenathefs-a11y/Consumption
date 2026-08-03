import { getApiConfig } from './api-config.js';
import { remoteStorage } from './remote-storage.js';
import { C7_MOCK, mockDashboard } from './mock-fixture.js';

const filter = (rows, params, map) => rows.filter(row => Object.entries(params || {}).every(([key, value]) => value === '' || value === undefined || String(row[map[key] || key]) === String(value)));
class MockStorage {
  async read(action, params = {}) {
    const routes = {
      health: () => ({ status: 'ok', spreadsheetAccess: false, spreadsheetTitle: 'Development C7 fixture', timezone: 'Asia/Dubai', apiVersion: 'v1', dataVersion: 'M2.0' }),
      getSettings: () => [], getSites: () => filter(C7_MOCK.sites, params, { siteId: 'Site_ID', status: 'Status' }), getBuildings: () => C7_MOCK.buildings,
      getUtilities: () => C7_MOCK.utilities, getMeters: () => filter(C7_MOCK.meters, params, { meterId: 'Meter_ID', meterNumber: 'Meter_Number', siteId: 'Site_ID', utilityId: 'Utility_ID' }),
      getMeterReadings: () => C7_MOCK.readings, getConsumption: () => filter(C7_MOCK.consumption, params, { meterId: 'Meter_ID', siteId: 'Site_ID', utilityId: 'Utility_ID' }),
      getHistoricalConsumption: () => C7_MOCK.consumption, getAnomalies: () => C7_MOCK.anomalies, getCases: () => filter(C7_MOCK.cases, params, { caseId: 'Case_ID', meterId: 'Meter_ID', siteId: 'Site_ID' }),
      getEvidence: () => C7_MOCK.evidence, getCorrectiveActions: () => C7_MOCK.actions, getDashboard: mockDashboard,
      getPortfolioTree: () => ({ name: 'Portfolio', sites: C7_MOCK.sites.map(site => ({ site, buildings: [], unassignedMeters: C7_MOCK.meters.filter(meter => meter.Site_ID === site.Site_ID) })) }),
      getCaseDetails: () => ({ case: C7_MOCK.cases[0], meter: C7_MOCK.meters[0], site: C7_MOCK.sites[0], building: null, utility: C7_MOCK.utilities[0], investigationInputs: C7_MOCK.inputs, evidence: C7_MOCK.evidence, correctiveActions: C7_MOCK.actions, relatedAnomaly: C7_MOCK.anomalies[0], consumptionHistory: C7_MOCK.consumption })
    };
    if (!routes[action]) throw new Error(`Mock action is not implemented: ${action}`);
    return { data: routes[action](), source: 'mock', meta: { apiVersion: 'v1', timestamp: new Date().toISOString() } };
  }
  async write() { throw new Error('Mock mode is read-only. Switch to remote mode for controlled writes.'); }
}

export class DataAdapter {
  constructor(configProvider = getApiConfig, remote = remoteStorage, mock = new MockStorage()) { this.configProvider = configProvider; this.remote = remote; this.mock = mock; }
  provider() { return this.configProvider().mode === 'mock' ? this.mock : this.remote; }
  read(action, params) { return this.provider().read(action, params); }
  write(action, body) { return this.provider().write(action, body); }
  health() { return this.read('health'); }
  getSettings() { return this.read('getSettings'); } getSites(p={}) { return this.read('getSites', p); } getBuildings(p={}) { return this.read('getBuildings', p); } getUtilities(p={}) { return this.read('getUtilities', p); } getMeters(p={}) { return this.read('getMeters', p); }
  getMeterReadings(p={}) { return this.read('getMeterReadings', p); } getConsumption(p={}) { return this.read('getConsumption', p); } getHistoricalConsumption(p={}) { return this.read('getHistoricalConsumption', p); } getAnomalies(p={}) { return this.read('getAnomalies', p); }
  getCases(p={}) { return this.read('getCases', p); } getCaseDetails(caseId) { return this.read('getCaseDetails', { caseId }); } getEvidence(p={}) { return this.read('getEvidence', p); } getCorrectiveActions(p={}) { return this.read('getCorrectiveActions', p); } getDashboard(p={}) { return this.read('getDashboard', p); } getPortfolioTree() { return this.read('getPortfolioTree'); }
  createMeterReading(body) { return this.write('createMeterReading', body); } updateMeterReading(body) { return this.write('updateMeterReading', body); } createInvestigationInput(body) { return this.write('createInvestigationInput', body); } updateInvestigationInput(body) { return this.write('updateInvestigationInput', body); }
  createEvidence(body) { return this.write('createEvidence', body); } updateEvidenceStatus(body) { return this.write('updateEvidenceStatus', body); } createCorrectiveAction(body) { return this.write('createCorrectiveAction', body); } updateCorrectiveAction(body) { return this.write('updateCorrectiveAction', body); } updateCase(body) { return this.write('updateCase', body); } confirmRootCause(body) { return this.write('confirmRootCause', body); } closeCase(body) { return this.write('closeCase', body); }
}
export const dataAdapter = new DataAdapter();
