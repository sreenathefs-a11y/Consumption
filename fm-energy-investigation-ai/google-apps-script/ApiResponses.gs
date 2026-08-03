function requestId_() { return 'REQ-' + Utilities.getUuid(); }
function responsePayload_(success, data, error, requestId) {
  return { success: success, data: success ? data : null, error: success ? null : error, meta: { apiVersion: CONFIG.API_VERSION, timestamp: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"), requestId: requestId || requestId_() } };
}
function jsonResponse_(payload) { return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON); }
function ok_(data, requestId) { return jsonResponse_(responsePayload_(true, data, null, requestId)); }
function fail_(code, message, details, requestId) { return jsonResponse_(responsePayload_(false, null, { code: code, message: message, details: details || {} }, requestId)); }
function apiError_(code, message, details) { var error = new Error(message); error.apiCode = code; error.details = details || {}; return error; }
