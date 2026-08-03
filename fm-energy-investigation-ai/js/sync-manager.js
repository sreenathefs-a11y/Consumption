import { dataAdapter } from './data-adapter.js';
import { getApiConfig, isApiConfigured } from './api-config.js';
import { offlineDraftStore } from './offline-draft-store.js';

const LEGACY_KEY = 'fmeia_db_v1';
export const syncManager = {
  status: { state: 'idle', source: null, lastSuccessfulSync: null, error: null },
  configurationState() { const config = getApiConfig(); return { configured: isApiConfigured(config), mode: config.mode, baseUrl: config.baseUrl }; },
  detectLegacyData() { try { const raw = localStorage.getItem(LEGACY_KEY); if (!raw) return null; const data = JSON.parse(raw); return { raw: data, likelyDemo: Boolean(data.demo || data.cases?.some(item => item.id === 'C7-2025-007')), hasUserRecords: Boolean(data.cases?.some(item => item.evidence?.length || item.actions?.length || item.questions?.some(q => q.answer))) }; } catch { return null; } },
  archiveLegacy() { const legacy = this.detectLegacyData(); if (legacy) offlineDraftStore.archiveLegacy(legacy.raw); return legacy; },
  async connect() { this.status = { ...this.status, state: 'loading', error: null }; try { const result = await dataAdapter.health(); this.status = { state: result.source === 'cache' ? 'cached' : 'online', source: result.source, lastSuccessfulSync: result.meta.timestamp || result.meta.cachedAt, error: result.error || null }; return result; } catch (error) { this.status = { ...this.status, state: error.code === 'API_NOT_CONFIGURED' ? 'unconfigured' : 'offline', error }; throw error; } },
  async submitDraft(draftId) { const draft = offlineDraftStore.list().find(item => item.draftId === draftId); if (!draft) throw new Error('Draft was not found.'); if (!confirm('Submit this draft to the live Google Sheet now? Duplicate writes are not retried automatically.')) return null; const result = await dataAdapter.write(draft.action, draft.body); offlineDraftStore.remove(draftId); return result; }
};
