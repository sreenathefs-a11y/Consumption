const assert = require('node:assert/strict');
process.env.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/test-deployment/exec';
const proxy = require('../../netlify/functions/apps-script-proxy.js');

const response = (body, status = 200) => ({ status, text: async () => typeof body === 'string' ? body : JSON.stringify(body) });
const ok = action => ({ success: true, data: { action }, error: null, meta: { apiVersion: 'v1' } });

(async () => {
  let captured;
  global.fetch = async (url, options) => { captured = { url, options }; return response(ok(new URL(url).searchParams.get('action') || 'base')); };

  let result = await proxy.handler({ httpMethod: 'GET', rawQuery: 'action=health' });
  assert.equal(result.statusCode, 200); assert.equal(JSON.parse(result.body).data.action, 'health');
  assert.equal(captured.options.redirect, 'follow');

  for (const action of ['getDashboard', 'getConsumptionIntelligence', 'getSites', 'getMeters']) {
    result = await proxy.handler({ httpMethod: 'GET', rawQuery: `action=${action}` });
    assert.equal(JSON.parse(result.body).data.action, action);
  }

  await proxy.handler({ httpMethod: 'GET', rawQuery: 'action=getSites&token=secret&apiToken=secret' });
  const getUrl = new URL(captured.url);
  assert.equal(getUrl.searchParams.has('token'), false); assert.equal(getUrl.searchParams.has('apiToken'), false);

  const writeBody = { action: 'updateCase', caseId: 'CASE-1', apiToken: 'write-token' };
  result = await proxy.handler({ httpMethod: 'POST', rawQuery: '', body: JSON.stringify(writeBody) });
  assert.deepEqual(JSON.parse(captured.options.body), writeBody);
  assert.equal(new URL(captured.url).searchParams.has('token'), false);
  assert.equal(captured.options.redirect, 'follow');

  global.fetch = async () => response({success:false,data:null,error:{code:'PERMISSION_DENIED',message:'denied'},meta:{}},403);result=await proxy.handler({httpMethod:'POST',rawQuery:'',body:JSON.stringify(writeBody)});assert.equal(result.statusCode,403);assert.equal(JSON.parse(result.body).error.code,'PERMISSION_DENIED');

  global.fetch = async () => response('<html>not json</html>');
  result = await proxy.handler({ httpMethod: 'GET', rawQuery: 'action=health' });
  assert.equal(result.statusCode, 502); assert.equal(JSON.parse(result.body).error.code, 'INVALID_BACKEND_RESPONSE');

  const saved = process.env.APPS_SCRIPT_URL; delete process.env.APPS_SCRIPT_URL;
  result = await proxy.handler({ httpMethod: 'GET', rawQuery: 'action=health' });
  assert.equal(result.statusCode, 503); assert.equal(JSON.parse(result.body).error.code, 'PROXY_NOT_CONFIGURED');
  process.env.APPS_SCRIPT_URL = saved;

  assert.equal(proxy._test.backendUrl({ rawQuery: 'action=health' }, saved).hostname, 'script.google.com');
  console.log('Netlify Apps Script proxy tests passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
