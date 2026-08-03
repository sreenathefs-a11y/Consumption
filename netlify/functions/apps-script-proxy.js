'use strict';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};
const TIMEOUT_MS = 25000;

function json(statusCode, payload) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(payload) };
}

function proxyError(code, message, statusCode = 502, details = {}) {
  return json(statusCode, {
    success: false,
    data: null,
    error: { code, message, details },
    meta: { source: 'netlify-apps-script-proxy', timestamp: new Date().toISOString() }
  });
}

function backendUrl(event, configuredUrl) {
  const url = new URL(configuredUrl);
  const query = new URLSearchParams(event.rawQuery || '');
  // Read endpoints are public. Never allow credentials into a GET URL.
  query.delete('token');
  query.delete('apiToken');
  for (const [key, value] of query.entries()) url.searchParams.append(key, value);
  return url;
}

exports.handler = async function handler(event) {
  const configuredUrl = String(process.env.APPS_SCRIPT_URL || '').trim();
  if (!configuredUrl) return proxyError('PROXY_NOT_CONFIGURED', 'The Google Sheet gateway is not configured.', 503);

  let target;
  try {
    target = backendUrl(event, configuredUrl);
    if (target.protocol !== 'https:') throw new Error('HTTPS is required');
  } catch {
    return proxyError('PROXY_CONFIGURATION_ERROR', 'The Google Sheet gateway configuration is invalid.', 503);
  }

  const method = String(event.httpMethod || 'GET').toUpperCase();
  if (!['GET', 'POST'].includes(method)) return proxyError('METHOD_NOT_ALLOWED', 'Only GET and POST requests are supported.', 405);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const options = { method, redirect: 'follow', signal: controller.signal, headers: { Accept: 'application/json' } };
  if (method === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { clearTimeout(timeout); return proxyError('INVALID_REQUEST_JSON', 'The request body must be valid JSON.', 400); }
    options.headers['Content-Type'] = 'text/plain;charset=utf-8';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(target.toString(), options);
  } catch (error) {
    clearTimeout(timeout);
    if (error && error.name === 'AbortError') return proxyError('PROXY_TIMEOUT', 'The Google Sheet service did not respond in time.', 504);
    return proxyError('PROXY_CONNECTION_ERROR', 'The Google Sheet service could not be reached.', 502);
  }
  clearTimeout(timeout);

  const responseText = await response.text();
  try { JSON.parse(responseText); } catch { return proxyError('INVALID_BACKEND_RESPONSE', 'The Google Sheet service returned an invalid response.', 502, { backendStatus: response.status }); }

  return { statusCode: response.status, headers: JSON_HEADERS, body: responseText };
};

exports._test = { backendUrl, proxyError, TIMEOUT_MS };
