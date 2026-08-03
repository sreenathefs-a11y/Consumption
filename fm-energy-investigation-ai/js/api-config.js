/** Production uses the same-origin Netlify gateway. No backend URL or secret is committed. */
export const API_BASE_URL = '/.netlify/functions/apps-script-proxy';
export const DEFAULT_API_MODE = 'remote';
export const API_VERSION = 'v1';
export const DATA_VERSION = 'M2.0';
export const CONFIG_KEY = 'fmeia_api_config_v1';

export function getApiConfig() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}'); } catch { saved = {}; }
  const developmentOverride = Boolean(saved.developmentOverride);
  return {
    baseUrl: developmentOverride && saved.baseUrl ? saved.baseUrl : API_BASE_URL,
    developmentOverride,
    apiToken: saved.apiToken || '',
    mode: saved.mode || DEFAULT_API_MODE
  };
}
export function saveApiConfig(config) {
  const safe = {
    baseUrl: String(config.baseUrl || '').trim(),
    developmentOverride: Boolean(config.developmentOverride),
    apiToken: String(config.apiToken || '').trim(),
    mode: config.mode === 'mock' ? 'mock' : 'remote'
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(safe));
  return getApiConfig();
}
export function isApiConfigured(config = getApiConfig()) {
  if (config.mode === 'mock') return true;
  if (config.baseUrl === API_BASE_URL) return true;
  return config.developmentOverride && /^https:\/\/script\.google\.com\//.test(config.baseUrl);
}
