/**
 * Google Apps Script - Sync Service untuk Monitoring RDK
 * 
 * Konfigurasi Script Properties:
 *   - BACKEND_URL: URL backend (contoh: https://api.monitoring-rdk.com)
 * 
 * File ini berisi:
 *   - doPost(): Menerima request dari Dashboard untuk update Spreadsheet
 *   - onEdit(): Mengirim webhook ke Dashboard saat Spreadsheet diedit manual
 */

// ═══════════════════════════════════════════════════════════════════════════
// doPost() - Menerima request dari Dashboard untuk update Spreadsheet
// ═══════════════════════════════════════════════════════════════════════════

/**
 * doPost handler - dipanggil ketika Dashboard mengirim perubahan data
 * 
 * Expected JSON payload:
 * {
 *   "action": "create" | "update" | "delete",
 *   "sheet": "IN" | "OUT" | "Daily" | "Scan Out" | "Claim" | "Faktur" | "WO-WT" | "Setoran",
 *   "rowId": "unique-identifier",  // untuk update/delete
 *   "data": { ... }                // untuk create/update
 * }
 */
function doPost(e) {
  try {
    // Parse request body
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var sheetName = mapSheetName(payload.sheet);
    var rowId = payload.rowId;
    var data = payload.data;
    
    // Validasi input
    if (!action || !sheetName) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Missing action or sheet'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Sheet not found: ' + sheetName}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Proses berdasarkan action
    var result;
    switch(action) {
      case 'create':
        result = handleCreate(sheet, data);
        break;
      case 'update':
        result = handleUpdate(sheet, rowId, data);
        break;
      case 'delete':
        result = handleDelete(sheet, rowId);
        break;
      default:
        return ContentService
          .createTextOutput(JSON.stringify({error: 'Invalid action: ' + action}))
          .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    console.error('[doPost] Error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Map nama sheet singkat ke nama sheet lengkap di Spreadsheet
 */
function mapSheetName(shortName) {
  var mapping = {
    'IN': 'Inbound',
    'OUT': 'Outbound',
    'Daily': 'Report Daily',
    'Scan Out': 'Scan Out DC',
    'Claim': 'Claim Vendor',
    'Faktur': 'Gantungan Faktur',
    'WO-WT': 'WO-WT',
    'Setoran': 'Setoran'
  };
  return mapping[shortName] || shortName;
}

/**
 * Handle CREATE - tambahkan baris baru di akhir sheet
 */
function handleCreate(sheet, data) {
  var lastRow = sheet.getLastRow();
  var newRow = dataToArray(sheet.getName(), data);
  
  // Append row baru
  sheet.appendRow(newRow);
  
  console.log('[CREATE] Sheet: ' + sheet.getName() + ', Row: ' + (lastRow + 1));
  
  return {
    success: true,
    action: 'create',
    sheet: sheet.getName(),
    row: lastRow + 1
  };
}

/**
 * Handle UPDATE - cari row berdasarkan ID lalu update
 */
function handleUpdate(sheet, rowId, data) {
  if (!rowId) {
    return {error: 'Missing rowId for update'};
  }
  
  // Cari row berdasarkan ID (kolom pertama biasanya ID atau key)
  var rowNum = findRowById(sheet, rowId);
  
  if (rowNum === 0) {
    return {error: 'Row not found with ID: ' + rowId};
  }
  
  var newRow = dataToArray(sheet.getName(), data);
  var numCols = newRow.length;
  
  // Update row
  sheet.getRange(rowNum, 1, 1, numCols).setValues([newRow]);
  
  console.log('[UPDATE] Sheet: ' + sheet.getName() + ', Row: ' + rowNum + ', ID: ' + rowId);
  
  return {
    success: true,
    action: 'update',
    sheet: sheet.getName(),
    row: rowNum
  };
}

/**
 * Handle DELETE - cari row berdasarkan ID lalu hapus
 */
function handleDelete(sheet, rowId) {
  if (!rowId) {
    return {error: 'Missing rowId for delete'};
  }
  
  var rowNum = findRowById(sheet, rowId);
  
  if (rowNum === 0) {
    return {error: 'Row not found with ID: ' + rowId};
  }
  
  // Hapus row
  sheet.deleteRow(rowNum);
  
  console.log('[DELETE] Sheet: ' + sheet.getName() + ', Row: ' + rowNum + ', ID: ' + rowId);
  
  return {
    success: true,
    action: 'delete',
    sheet: sheet.getName(),
    row: rowNum
  };
}

/**
 * Cari nomor row berdasarkan ID
 * ID bisa di kolom yang berbeda tergantung sheet
 */
function findRowById(sheet, rowId) {
  var sheetName = sheet.getName();
  var keyColIndex = getKeyColumnIndex(sheetName);
  var data = sheet.getDataRange().getValues();
  
  // Loop mulai dari baris ke-2 (skip header)
  for (var i = 1; i < data.length; i++) {
    var cellValue = String(data[i][keyColIndex]);
    if (cellValue === String(rowId)) {
      return i + 1; // Return 1-based row number
    }
  }
  
  return 0; // Not found
}

/**
 * Get index kolom key untuk setiap sheet (0-based)
 */
function getKeyColumnIndex(sheetName) {
  var keyColumns = {
    'Inbound': 2,          // C = nomor_fo (0-based: kolom 2)
    'Outbound': 1,         // B = freight_order
    'Report Daily': 0,     // A = tanggal
    'Scan Out DC': 0,      // A = tanggal
    'Claim Vendor': 2,     // C = nomor_claim
    'Gantungan Faktur': 4, // E = sd_document
    'Setoran': 0,          // A = tanggal
    'WO-WT': 0             // A = tanggal
  };
  return keyColumns[sheetName] || 0;
}

/**
 * Convert data object ke array sesuai urutan kolom sheet
 */
function dataToArray(sheetName, data) {
  switch(sheetName) {
    case 'Inbound':
      return [
        data.tanggal || '',
        data.shifting || '',
        data.nomor_fo || '',
        data.nopol || '',
        data.plant_pabrik || '',
        data.jenis_bongkaran || '',
        data.total_box || '',
        data.nomor_gr || '',
        data.total_slipsheet || ''
      ];
      
    case 'Outbound':
      return [
        data.tanggal || '',
        data.freight_order || '',
        data.mobil_muat || '',
        data.status_fo || '',
        data.assign_job || '',
        data.jam_terima || '',
        data.status || '',
        data.selesai_muat || '',
        data.hari || '',
        data.putaran || '',
        data.sth2 || '',
        data.jam_running || ''
      ];
      
    case 'Report Daily':
      return [
        data.tanggal || '',
        data.division || '',
        data.report_type || '',
        data.qty || ''
      ];
      
    case 'Scan Out DC':
      return [
        data.tanggal || '',
        data.vendor || '',
        data.nopol || '',
        data.driver || '',
        data.jam_scan || '',
        data.jam_keluar || '',
        data.status || ''
      ];
      
    case 'Claim Vendor':
      return [
        data.tanggal || '',
        data.vendor || '',
        data.nomor_claim || '',
        data.payment || '',
        data.outstanding || '',
        data.value || '',
        data.status || ''
      ];
      
    case 'Gantungan Faktur':
      return [
        data.tanggal || '',
        data.pay_terms || '',
        data.customer || '',
        data.nama_toko || '',
        data.sd_document || '',
        data.sales_doc || '',
        data.net_value || '',
        data.keterangan_transport || ''
      ];
      
    case 'Setoran':
      return [
        data.tanggal || '',
        data.salesman || '',
        data.pulang_kunjungan || '',
        data.setoran_ke_kasir || '',
        data.durasi || '',
        data.bulan || ''
      ];
      
    case 'WO-WT':
      return [
        data.tanggal || '',
        data.plant || '',
        data.zwp1 || '',
        data.zwp2 || '',
        data.zwp4 || '',
        data.zwp5 || '',
        data.global || ''
      ];
      
    default:
      return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// onEdit() - Kirim webhook ke Dashboard saat Spreadsheet diedit manual
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trigger onEdit - dipanggil otomatis saat sel diedit
 */
function onEdit(e) {
  // Guard: return jika nilai tidak berubah
  if (e.value === undefined || e.oldValue === undefined) {
    return;
  }
  
  var props = PropertiesService.getScriptProperties();
  var backendUrl = props.getProperty('BACKEND_URL');
  
  if (!backendUrl) {
    console.error('[onEdit] BACKEND_URL not configured');
    return;
  }
  
  // Validasi HTTPS
  if (!backendUrl.startsWith('https://')) {
    console.error('[onEdit] BACKEND_URL must use HTTPS: ' + backendUrl);
    return;
  }
  
  var sheet = e.source.getActiveSheet();
  var worksheetName = sheet.getName();
  var rowNum = e.range.getRow();
  
  // Build payload
  var payload = JSON.stringify({
    worksheet: worksheetName,
    row: rowNum,
    timestamp: new Date().toISOString()
  });
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(backendUrl + '/api/sync/from-sheets', options);
    var code = response.getResponseCode();
    
    if (code !== 200) {
      console.error(
        '[onEdit] Webhook failed: HTTP ' + code +
        ' | worksheet=' + worksheetName +
        ' | row=' + rowNum
      );
    } else {
      console.log('[onEdit] Sync sent: ' + worksheetName + ' row ' + rowNum);
    }
  } catch (err) {
    console.error('[onEdit] Network error: ' + err.toString());
  }
}
