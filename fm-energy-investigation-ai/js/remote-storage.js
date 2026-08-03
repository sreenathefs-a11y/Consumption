import { apiClient } from './api-client.js';
import { offlineDraftStore } from './offline-draft-store.js';

export class RemoteStorage {
  constructor(client = apiClient) { this.client = client; this.lastSync = null; this.lastSource = 'remote'; }
  async read(action, params = {}) {
    try { const response = await this.client.get(action, params); offlineDraftStore.cache(action, params, response.data); this.lastSync = response.meta.timestamp; this.lastSource = 'live'; return { data: response.data, source: 'live', meta: response.meta }; }
    catch (error) { const cached = offlineDraftStore.cached(action, params); if (cached) { this.lastSync = cached.cachedAt; this.lastSource = 'cache'; return { data: cached.data, source: 'cache', meta: { cachedAt: cached.cachedAt }, error }; } throw error; }
  }
  async write(action, body) { return this.client.post(action, body); }
}
export const remoteStorage = new RemoteStorage();
