function setApiTokenOnce() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('FM Energy API token', 'Enter a strong token. It will be stored in Script Properties and cannot be read from source control.', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var token = response.getResponseText().trim();
  if (token.length < 24) throw new Error('Token must contain at least 24 characters.');
  var properties = PropertiesService.getScriptProperties();
  if (properties.getProperty('FM_ENERGY_API_TOKEN')) throw new Error('API token is already set. Delete it manually from Script Properties before rotation.');
  properties.setProperty('FM_ENERGY_API_TOKEN', token);
}
function assertAuthorized_(request) {
  var expected = PropertiesService.getScriptProperties().getProperty('FM_ENERGY_API_TOKEN');
  if (!expected) throw apiError_('AUTH_NOT_CONFIGURED', 'The backend API token has not been configured.', {});
  var supplied = String((request && (request.apiToken || request.token)) || '');
  if (!supplied || supplied !== expected) throw apiError_('PERMISSION_DENIED', 'A valid API token is required.', {});
}
