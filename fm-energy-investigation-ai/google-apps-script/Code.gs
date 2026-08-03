function doGet(e) {
  var requestId = requestId_();
  try {
    var params = (e && e.parameter) || {};
    var action = String(params.action || '').trim();
    if (!action) return ok_({ status: 'ok', message: 'FM Utility Intelligence API is running', recommendedAction: 'Open the frontend web application' }, requestId);
    routeAccess_('GET', action);
    if (action === 'health') return ok_(health_(), requestId);
    return ok_(readAction_(action, params), requestId);
  } catch (error) {
    return fail_(error.apiCode || 'INTERNAL_ERROR', error.apiCode ? error.message : 'The backend could not complete the request.', error.details || {}, requestId);
  }
}
function doPost(e) {
  var requestId = requestId_();
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    requireFields_(body, ['action']);
    routeAccess_('POST', body.action);
    assertAuthorized_(body);
    return ok_(writeAction_(body.action, body), requestId);
  } catch (error) {
    return fail_(error.apiCode || (error instanceof SyntaxError ? 'INVALID_JSON' : 'INTERNAL_ERROR'), error.apiCode ? error.message : (error instanceof SyntaxError ? 'Request body must be valid JSON.' : 'The backend could not complete the request.'), error.details || {}, requestId);
  }
}
function health_() {
  var spreadsheet = spreadsheet_();
  return { status: 'ok', spreadsheetAccess: true, spreadsheetTitle: spreadsheet.getName(), expectedSpreadsheetTitle: CONFIG.SPREADSHEET_TITLE, timezone: CONFIG.TIMEZONE, apiVersion: CONFIG.API_VERSION, dataVersion: CONFIG.DATA_VERSION };
}
