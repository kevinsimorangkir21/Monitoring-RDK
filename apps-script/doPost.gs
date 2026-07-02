/**
 * Google Apps Script - doPost Handler
 * Receives HTTP POST requests from Backend to sync data to Spreadsheet
 * 
 * Backend sends JSON payload:
 * {
 *   "action": "create" | "update" | "delete",
 *   "sheet": "IN" | "OUT" | "Daily" | "Scan Out" | "Claim" | "Faktur" | "Setoran" | "WO-WT",
 *   "rowId": "123" (for update/delete only),
 *   "data": { ... } (for create/update only)
 * }
 */

function doPost(e) {
  try {
    // Parse incoming payload
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var sheetName = payload.sheet;
    
    // Get the spreadsheet and target sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return createResponse(false, "Sheet not found: " + sheetName);
    }
    
    // Route to appropriate handler
    if (action === "create") {
      return handleCreate(sheet, payload.data);
    } else if (action === "update") {
      return handleUpdate(sheet, payload.rowId, payload.data);
    } else if (action === "delete") {
      return handleDelete(sheet, payload.rowId);
    } else {
      return createResponse(false, "Unknown action: " + action);
    }
    
  } catch (error) {
    Logger.log("[ERROR] doPost failed: " + error.toString());
    return createResponse(false, error.toString());
  }
}

/**
 * Handle CREATE action - append new row to sheet
 */
function handleCreate(sheet, data) {
  try {
    // Convert data object to array based on sheet columns
    var row = dataToRow(sheet, data);
    
    // Append row to sheet
    sheet.appendRow(row);
    
    Logger.log("[SYNC] CREATE success on sheet: " + sheet.getName());
    return createResponse(true, "Row created");
    
  } catch (error) {
    Logger.log("[ERROR] CREATE failed: " + error.toString());
    return createResponse(false, error.toString());
  }
}

/**
 * Handle UPDATE action - find row by ID and update values
 */
function handleUpdate(sheet, rowId, data) {
  try {
    var rowIndex = findRowByID(sheet, rowId);
    
    if (rowIndex === -1) {
      Logger.log("[WARN] Row not found for ID: " + rowId);
      return createResponse(false, "Row not found");
    }
    
    // Convert data to row array
    var row = dataToRow(sheet, data);
    
    // Update the row (rowIndex is 1-based)
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    
    Logger.log("[SYNC] UPDATE success on sheet: " + sheet.getName() + ", ID: " + rowId);
    return createResponse(true, "Row updated");
    
  } catch (error) {
    Logger.log("[ERROR] UPDATE failed: " + error.toString());
    return createResponse(false, error.toString());
  }
}

/**
 * Handle DELETE action - find row by ID and delete it
 */
function handleDelete(sheet, rowId) {
  try {
    var rowIndex = findRowByID(sheet, rowId);
    
    if (rowIndex === -1) {
      Logger.log("[WARN] Row not found for ID: " + rowId);
      return createResponse(false, "Row not found");
    }
    
    // Delete the row
    sheet.deleteRow(rowIndex);
    
    Logger.log("[SYNC] DELETE success on sheet: " + sheet.getName() + ", ID: " + rowId);
    return createResponse(true, "Row deleted");
    
  } catch (error) {
    Logger.log("[ERROR] DELETE failed: " + error.toString());
    return createResponse(false, error.toString());
  }
}

/**
 * Find row index by ID (assumes ID is in first column)
 * Returns -1 if not found
 * Returns 1-based row number (for sheet operations)
 */
function findRowByID(sheet, rowId) {
  var data = sheet.getDataRange().getValues();
  
  // Start from row 1 (skip header row 0)
  for (var i = 1; i < data.length; i++) {
    // Compare with first column (ID)
    if (data[i][0].toString() === rowId.toString()) {
      return i + 1; // Return 1-based index
    }
  }
  
  return -1; // Not found
}

/**
 * Convert data object to row array based on sheet's header row
 * Maps JSON fields to sheet columns
 */
function dataToRow(sheet, data) {
  // Get header row to know column order
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  var row = [];
  
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i].toString().toLowerCase();
    
    // Try to find matching field in data
    // Convert header to snake_case for matching (e.g., "Nomor FO" → "nomor_fo")
    var fieldName = header.replace(/\s+/g, '_').toLowerCase();
    
    // Also try camelCase (e.g., "nomorFO")
    var camelCase = toCamelCase(header);
    
    // Get value from data object
    var value = data[fieldName] || data[camelCase] || data[header] || "";
    
    row.push(value);
  }
  
  return row;
}

/**
 * Convert string to camelCase
 * "Nomor FO" → "nomorFo"
 */
function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, function(match, chr) {
      return chr.toUpperCase();
    });
}

/**
 * Create HTTP response in JSON format
 */
function createResponse(success, message) {
  var response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - can be run from Apps Script editor
 */
function testDoPost() {
  // Simulate POST request for CREATE
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        action: "create",
        sheet: "IN",
        data: {
          id: 999,
          shifting: "Pagi",
          nomor_fo: "FO-TEST-001",
          nopol: "B 1234 XYZ"
        }
      })
    }
  };
  
  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}
