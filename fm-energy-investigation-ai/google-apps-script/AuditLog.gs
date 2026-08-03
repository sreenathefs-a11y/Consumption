function appendAudit_(entry) {
  var record = { Log_ID: uniqueId_('LOG'), Timestamp: new Date(), User: entry.user || 'Not provided', Action: entry.action, Entity_Type: entry.entityType, Entity_ID: entry.entityId, Old_Value: JSON.stringify(entry.oldValue || null), New_Value: JSON.stringify(entry.newValue || null), Source: entry.source || 'PWA Web App', Remarks: entry.remarks || '' };
  try { appendRecord_('audit', record); } catch (error) { throw apiError_('AUDIT_FAILURE', 'The data change could not be safely audited. Verify the Audit_Log headers and retry.', { cause: String(error.message || error) }); }
  return record;
}
function withWriteLock_(callback) { var lock = LockService.getScriptLock(); if (!lock.tryLock(CONFIG.LOCK_TIMEOUT_MS)) throw apiError_('CONCURRENCY_ERROR', 'The workbook is busy. No changes were made; retry manually.', {}); try { return callback(); } finally { lock.releaseLock(); } }
