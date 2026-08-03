/** Committed defaults contain no deployment URL or secret. Runtime values are saved from Settings. */
export const API_BASE_URL = '';
export const DEFAULT_API_MODE = 'remote';
export const API_VERSION = 'v1';
export const DATA_VERSION = 'M2.0';
export const CONFIG_KEY = 'fmeia_api_config_v1';

export function getApiConfig() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}'); } catch { saved = {}; }
  return { baseUrl: saved.baseUrl || API_BASE_URL, apiToken: saved.apiToken || '', mode: saved.mode || DEFAULT_API_MODE };
}
export function saveApiConfig(config) {
  const safe = { baseUrl: String(config.baseUrl || '').trim(), apiToken: String(config.apiToken || '').trim(), mode: config.mode === 'mock' ? 'mock' : 'remote' };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(safe));
  return safe;
}
export function isApiConfigured(config = getApiConfig()) { return config.mode === 'mock' || /^https:\/\/script\.google\.com\//.test(config.baseUrl); }
