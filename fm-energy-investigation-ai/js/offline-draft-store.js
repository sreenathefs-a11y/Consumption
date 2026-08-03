const DRAFT_KEY = 'fmeia_offline_drafts_v1';
const CACHE_KEY = 'fmeia_remote_read_cache_v1';
const ARCHIVE_KEY = 'fmeia_local_archive_v1';
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
export const offlineDraftStore = {
  list() { return read(DRAFT_KEY, []); },
  save(draft) { const drafts = this.list(); const item = { draftId: draft.draftId || `DRAFT-${Date.now()}`, savedAt: new Date().toISOString(), ...draft }; drafts.push(item); localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)); return item; },
  remove(draftId) { localStorage.setItem(DRAFT_KEY, JSON.stringify(this.list().filter(item => item.draftId !== draftId))); },
  cache(action, params, data) { const cache = read(CACHE_KEY, {}); const key = this.cacheKey(action, params); cache[key] = { data, cachedAt: new Date().toISOString() }; localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); },
  cached(action, params) { return read(CACHE_KEY, {})[this.cacheKey(action, params)] || null; },
  cacheKey(action, params = {}) { return `${action}:${JSON.stringify(Object.keys(params).sort().reduce((out, key) => ({ ...out, [key]: params[key] }), {}))}`; },
  archiveLegacy(raw) { localStorage.setItem(ARCHIVE_KEY, JSON.stringify({ archivedAt: new Date().toISOString(), data: raw })); },
  getLegacyArchive() { return read(ARCHIVE_KEY, null); }
};
