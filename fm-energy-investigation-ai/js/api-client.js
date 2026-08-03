import { getApiConfig, isApiConfigured } from './api-config.js';

export class ApiError extends Error { constructor(code, message, details = {}, status = 0) { super(message); this.name = 'ApiError'; this.code = code; this.details = details; this.status = status; } }
export class ApiClient {
  constructor(configProvider = getApiConfig) { this.configProvider = configProvider; }
  async request(action, { method = 'GET', params = {}, body = {}, signal } = {}) {
    const config = this.configProvider();
    if (!isApiConfigured(config) || config.mode !== 'remote') throw new ApiError('API_NOT_CONFIGURED', 'Configure the Google Apps Script Web App URL in Settings.');
    const url = new URL(config.baseUrl);
    const options = { method, signal, headers: {} };
    if (method === 'GET') { url.searchParams.set('action', action); if (config.apiToken) url.searchParams.set('token', config.apiToken); Object.entries(params).forEach(([key, value]) => { if (value !== '' && value !== undefined && value !== null) url.searchParams.set(key, value); }); }
    else { options.headers['Content-Type'] = 'text/plain;charset=utf-8'; options.body = JSON.stringify({ ...body, action, apiToken: config.apiToken }); }
    let response;
    try { response = await fetch(url.toString(), options); } catch { throw new ApiError('CONNECTION_ERROR', 'The live Google Sheet backend could not be reached.'); }
    let payload;
    try { payload = await response.json(); } catch { throw new ApiError('INVALID_RESPONSE', 'The backend returned an invalid response.', {}, response.status); }
    if (!response.ok || !payload.success) throw new ApiError(payload.error?.code || 'API_ERROR', payload.error?.message || 'The backend request failed.', payload.error?.details || {}, response.status);
    return payload;
  }
  get(action, params) { return this.request(action, { params }); }
  post(action, body) { return this.request(action, { method: 'POST', body }); }
}
export const apiClient = new ApiClient();
