/**
 * Spreadsheet-First Architecture
 * Google Spreadsheet adalah SOURCE OF TRUTH
 * 
 * Backend hanya:
 * - GET: Baca data dari spreadsheet
 * - POST: Tambah data baru (appendRow)
 * 
 * TIDAK ADA operasi UPDATE atau DELETE
 * Data yang sudah ada di spreadsheet TIDAK PERNAH diubah oleh backend
 */

/**
 * doGet - Membaca data dari sheet dan return JSON
 * 
 * URL: https://script.google.com/.../exec?sheet=IN
 * Response: { "success": true, "data": [...] }
 */
function doGet(e) {
  try {
    var sheetName = e.parameter.sheet;
    
    if (!sheetName) {
      return createJSONResponse(false, "Parameter 'sheet' required", null);
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return createJSONResponse(false, "Sheet not found: " + sheetName, null);
    }
    
    // Baca semua data dari sheet
    var data = readSheetData(sheet, sheetName);
    
    return createJSONResponse(true, "Data retrieved successfully", data);
    
  } catch (error) {
    Logger.log("[ERROR] doGet failed: " + error.toString());
    return createJSONResponse(false, error.toString(), null);
  }
}

/**
 * doPost - Menerima data dari backend dan appendRow
 * 
 * Payload: { "sheet": "IN", "data": {...} }
 * Response: { "success": true, "message": "Row appended" }
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheetName = payload.sheet;
    var data = payload.data;
    
    if (!sheetName || !data) {
      return createJSONResponse(false, "Missing 'sheet' or 'data'", null);
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return createJSONResponse(false, "Sheet not found: " + sheetName, null);
    }
    
    // Convert data object to row array based on sheet type
    var row = dataToRow(sheetName, data);
    
    // Append row (TIDAK PERNAH update atau delete)
    sheet.appendRow(row);
    
    Logger.log("[SUCCESS] Row appended to sheet: " + sheetName);
    return createJSONResponse(true, "Row appended successfully", null);
    
  } catch (error) {
    Logger.log("[ERROR] doPost failed: " + error.toString());
    return createJSONResponse(false, error.toString(), null);
  }
}

/**
 * Baca semua data dari sheet dan convert ke array of objects
 */
function readSheetData(sheet, sheetName) {
  var range = sheet.getDataRange();
  var values = range.getValues();
  
  if (values.length < 2) {
    return []; // No data (only header or empty)
  }
  
  var headers = values[0];
  var data = [];
  
  // Start from row 1 (skip header row 0)
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = rowToObject(sheetName, headers, row);
    data.push(obj);
  }
  
  return data;
}

/**
 * Convert row array to object based on sheet type
 */
function rowToObject(sheetName, headers, row) {
  var obj = {};
  
  // Mapping specific untuk setiap sheet
  switch(sheetName) {
    case "IN": // Inbound
      obj = {
        id: row[0],
        shifting: row[1],
        nomor_fo: row[2],
        nopol: row[3],
        plant_pabrik: row[4],
        jenis_bongkaran: row[5],
        total_box: row[6],
        nomor_gr: row[7],
        total_slipsheet: row[8],
        created_at: row[9],
        created_by: row[10]
      };
      break;
      
    case "OUT": // Outbound
      obj = {
        id: row[0],
        shifting: row[1],
        nopol: row[2],
        customer: row[3],
        total_collie: row[4],
        area: row[5],
        created_at: row[6],
        created_by: row[7]
      };
      break;
      
    case "Daily": // Report Daily Transport
      obj = {
        id: row[0],
        tanggal: row[1],
        nopol: row[2],
        supir: row[3],
        rute: row[4],
        jarak_km: row[5],
        bbm_liter: row[6],
        created_at: row[7],
        created_by: row[8]
      };
      break;
      
    case "Scan Out": // Scan Out DC
      obj = {
        id: row[0],
        tanggal: row[1],
        nomor_po: row[2],
        customer: row[3],
        qty: row[4],
        status: row[5],
        created_at: row[6],
        created_by: row[7]
      };
      break;
      
    case "Claim": // Claim Vendor
      obj = {
        id: row[0],
        tanggal: row[1],
        vendor: row[2],
        nomor_claim: row[3],
        nilai: row[4],
        status: row[5],
        created_at: row[6],
        created_by: row[7]
      };
      break;
      
    case "Faktur": // Gantungan Faktur
      obj = {
        id: row[0],
        nomor_faktur: row[1],
        tanggal: row[2],
        customer: row[3],
        nilai: row[4],
        jatuh_tempo: row[5],
        status: row[6],
        created_at: row[7],
        created_by: row[8]
      };
      break;
      
    case "Setoran": // Setoran
      obj = {
        id: row[0],
        tanggal: row[1],
        nopol: row[2],
        driver: row[3],
        nominal: row[4],
        durasi: row[5],
        created_at: row[6],
        created_by: row[7]
      };
      break;
      
    case "WO-WT": // WO WT
      obj = {
        id: row[0],
        nomor_wo: row[1],
        tanggal: row[2],
        keterangan: row[3],
        status: row[4],
        created_at: row[5],
        created_by: row[6]
      };
      break;
      
    default:
      // Generic fallback
      for (var j = 0; j < headers.length && j < row.length; j++) {
        obj[headers[j]] = row[j];
      }
  }
  
  return obj;
}

/**
 * Convert data object to row array for appendRow
 */
function dataToRow(sheetName, data) {
  var row = [];
  
  // Mapping specific untuk setiap sheet
  switch(sheetName) {
    case "IN": // Inbound
      row = [
        "", // id (auto-increment di sheet)
        data.shifting || "",
        data.nomor_fo || "",
        data.nopol || "",
        data.plant_pabrik || "",
        data.jenis_bongkaran || "",
        data.total_box || 0,
        data.nomor_gr || "",
        data.total_slipsheet || 0,
        new Date(), // created_at
        data.created_by || ""
      ];
      break;
      
    case "OUT": // Outbound
      row = [
        "",
        data.shifting || "",
        data.nopol || "",
        data.customer || "",
        data.total_collie || 0,
        data.area || "",
        new Date(),
        data.created_by || ""
      ];
      break;
      
    case "Daily": // Report Daily Transport
      row = [
        "",
        data.tanggal || new Date(),
        data.nopol || "",
        data.supir || "",
        data.rute || "",
        data.jarak_km || 0,
        data.bbm_liter || 0,
        new Date(),
        data.created_by || ""
      ];
      break;
      
    case "Scan Out": // Scan Out DC
      row = [
        "",
        data.tanggal || new Date(),
        data.nomor_po || "",
        data.customer || "",
        data.qty || 0,
        data.status || "",
        new Date(),
        data.created_by || ""
      ];
      break;
      
    case "Claim": // Claim Vendor
      row = [
        "",
        data.tanggal || new Date(),
        data.vendor || "",
        data.nomor_claim || "",
        data.nilai || 0,
        data.status || "",
        new Date(),
        data.created_by || ""
      ];
      break;
      
    case "Faktur": // Gantungan Faktur
      row = [
        "",
        data.nomor_faktur || "",
        data.tanggal || new Date(),
        data.customer || "",
        data.nilai || 0,
        data.jatuh_tempo || "",
        data.status || "",
        new Date(),
        data.created_by || ""
      ];
      break;
      
    case "Setoran": // Setoran
      row = [
        "",
        data.tanggal || new Date(),
        data.nopol || "",
        data.driver || "",
        data.nominal || 0,
        data.durasi || 0,
        new Date(),
        data.created_by || ""
      ];
      break;
      
    case "WO-WT": // WO WT
      row = [
        "",
        data.nomor_wo || "",
        data.tanggal || new Date(),
        data.keterangan || "",
        data.status || "",
        new Date(),
        data.created_by || ""
      ];
      break;
      
    default:
      throw new Error("Unknown sheet type: " + sheetName);
  }
  
  return row;
}

/**
 * Create JSON response
 */
function createJSONResponse(success, message, data) {
  var response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - dapat dijalankan dari editor
 */
function testDoGet() {
  var mockEvent = {
    parameter: {
      sheet: "IN"
    }
  };
  
  var result = doGet(mockEvent);
  Logger.log(result.getContent());
}

function testDoPost() {
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        sheet: "IN",
        data: {
          shifting: "Pagi",
          nomor_fo: "FO-TEST-001",
          nopol: "B 1234 XYZ",
          plant_pabrik: "Plant A",
          jenis_bongkaran: "Manual",
          total_box: 100,
          nomor_gr: "GR-001",
          total_slipsheet: 10,
          created_by: "test@example.com"
        }
      })
    }
  };
  
  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}
