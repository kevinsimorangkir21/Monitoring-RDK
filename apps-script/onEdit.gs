/**
 * Google Apps Script - onEdit Trigger untuk Google Sheets Sync
 * 
 * Konfigurasi:
 *   1. Buka: File > Project Properties > Script Properties
 *   2. Tambahkan property:
 *      - Key: WEBHOOK_SECRET, Value: <nilai secret yang sama dengan GOOGLE_WEBHOOK_SECRET>
 *      - Key: BACKEND_URL, Value: https://your-backend.example.com
 * 
 * Trigger:
 *   - Tambahkan trigger onEdit dari menu Triggers
 *   - Event type: From spreadsheet, On edit
 * 
 * Validates Requirements: 5.1, 5.6, 5.7, 11.4, 11.5
 */

/**
 * Trigger onEdit - dipanggil otomatis saat sel diedit.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e - Event object dari Google Apps Script
 */
function onEdit(e) {
  // Guard: return jika nilai tidak berubah (hanya format/selection change)
  // Requirement 5.6: hanya kirim webhook ketika e.value !== undefined && e.oldValue !== undefined
  if (e.value === undefined || e.oldValue === undefined) {
    return;
  }

  // Baca konfigurasi dari Script Properties
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('WEBHOOK_SECRET');
  var backendUrl = props.getProperty('BACKEND_URL');

  // Validasi konfigurasi tersedia
  if (!secret) {
    console.error('[onEdit] WEBHOOK_SECRET not configured in Script Properties');
    return;
  }

  if (!backendUrl) {
    console.error('[onEdit] BACKEND_URL not configured in Script Properties');
    return;
  }

  // Requirement 11.5: Validasi HTTPS - log error dan return jika tidak HTTPS
  if (!backendUrl.startsWith('https://')) {
    console.error('[onEdit] BACKEND_URL must use HTTPS, got: ' + backendUrl);
    return;
  }

  // Ambil informasi worksheet dan baris yang diedit
  var sheet = e.source.getActiveSheet();
  var worksheetName = sheet.getName();
  var rowNum = e.range.getRow();

  // Build payload sesuai Requirement 5.1
  var payload = JSON.stringify({
    worksheet: worksheetName,
    row: rowNum,
    timestamp: new Date().toISOString(),
    secret: secret
  });

  // Konfigurasi HTTP request
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true  // Jangan throw exception pada HTTP error
  };

  // Requirement 5.7: Tangkap network error dengan try-catch → console.error tanpa throw
  try {
    var response = UrlFetchApp.fetch(backendUrl + '/api/sync/google', options);
    var code = response.getResponseCode();
    
    // Log jika response bukan 200
    if (code !== 200) {
      console.error(
        '[onEdit] Webhook failed: HTTP ' + code +
        ' | worksheet=' + worksheetName +
        ' | row=' + rowNum +
        ' | body=' + response.getContentText()
      );
    }
  } catch (err) {
    // Requirement 5.7: Catat error tanpa throw exception
    console.error(
      '[onEdit] Network error calling webhook: ' + err.toString() +
      ' | worksheet=' + worksheetName +
      ' | row=' + rowNum
    );
  }
}
