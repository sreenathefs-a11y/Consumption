import { getApiConfig, isApiConfigured } from './api-config.js';

const REQUEST_TIMEOUT_MS = 20000;
export class ApiError extends Error {
  constructor(code, message, details = {}, status = 0) { super(message); this.name = 'ApiError'; this.code = code; this.details = details; this.status = status; }
}
export class ApiClient {
  constructor(configProvider = getApiConfig, fetchImplementation = globalThis.fetch) { this.configProvider = configProvider; this.fetchImplementation = fetchImplementation; }
  async request(action, { method = 'GET', params = {}, body = {}, signal } = {}) {
    const config = this.configProvider();
    if (!isApiConfigured(config) || config.mode !== 'remote') throw new ApiError('API_NOT_CONFIGURED', 'The secure Google Sheet gateway is not configured.');
    const verb = String(method).toUpperCase();
    if (verb !== 'GET' && !config.apiToken) {
      const error = new ApiError('WRITE_ACCESS_REQUIRED', 'Write access is not configured. Add the authorization token in Settings.');
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('fmeia:write-access-required', { detail: { action } }));
      throw error;
    }
    const origin = typeof location !== 'undefined' ? location.origin : 'http://localhost';
    const url = new URL(config.baseUrl, origin);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
    const options = { method: verb, signal: controller.signal, headers: { Accept: 'application/json' } };
    if (verb === 'GET') {
      url.searchParams.set('action', action);
      Object.entries(params).forEach(([key, value]) => { if (!['token', 'apiToken'].includes(key) && value !== '' && value !== undefined && value !== null) url.searchParams.set(key, value); });
    } else {
      options.headers['Content-Type'] = 'application/json;charset=utf-8';
      options.body = JSON.stringify({ ...body, action, apiToken: config.apiToken });
    }
    let response;
    try { response = await this.fetchImplementation(url.toString(), options); }
    catch (error) {
      clearTimeout(timeout);
      if (error?.name === 'AbortError') throw new ApiError('PROXY_TIMEOUT', 'The secure Google Sheet gateway did not respond in time.');
      throw new ApiError('PROXY_CONNECTION_ERROR', 'The secure Google Sheet gateway could not be reached.');
    }
    clearTimeout(timeout);
    let payload;
    try { payload = await response.json(); } catch { throw new ApiError('INVALID_PROXY_RESPONSE', 'The secure gateway returned an invalid response.', {}, response.status); }
    if (!response.ok || !payload.success) {
      const error = new ApiError(payload.error?.code || 'PROXY_ERROR', payload.error?.message || 'The Google Sheet request failed.', payload.error?.details || {}, response.status);
      if (error.code === 'PERMISSION_DENIED' && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('fmeia:write-access-required', { detail: { action, reason: 'permission-denied' } }));
      throw error;
    }
    return payload;
  }
  get(action, params) { return this.request(action, { params }); }
  post(action, body) { return this.request(action, { method: 'POST', body }); }
}
export const apiClient = new ApiClient();
