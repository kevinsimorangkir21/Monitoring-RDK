/**
 * onEdit Trigger - Google Apps Script
 * 
 * Menangani perubahan pada Google Spreadsheet dan mengirim webhook ke Backend
 * untuk sync perubahan ke MySQL database.
 * 
 * Flow: Spreadsheet Edit → onEdit() → POST webhook → Backend → UPDATE MySQL
 */

// Configuration
const BACKEND_WEBHOOK_URL = PropertiesService.getScriptProperties().getProperty('BACKEND_WEBHOOK_URL');
const WEBHOOK_SECRET = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');

// Sheet name mapping (must match backend expectations)
const SHEET_NAMES = {
  'IN': 'IN',
  'OUT': 'OUT',
  'Daily': 'Daily',
  'Scan Out': 'Scan Out',
  'Claim': 'Claim',
  'Faktur': 'Faktur',
  'Setoran': 'Setoran',
  'WO-WT': 'WO-WT'
};

/**
 * Trigger yang dipanggil otomatis saat ada perubahan di Spreadsheet
 * IMPORTANT: Install this trigger via Apps Script Editor:
 * 1. Click "Triggers" (clock icon)
 * 2. Add Trigger
 * 3. Function: onEdit
 * 4. Event source: From spreadsheet
 * 5. Event type: On edit
 */
function onEdit(e) {
  try {
    // Validate edit event
    if (!e || !e.range) {
      Logger.log('[onEdit] Invalid event object');
      return;
    }

    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();
    
    // Check if this sheet should be synced
    if (!SHEET_NAMES[sheetName]) {
      Logger.log('[onEdit] Sheet not tracked: ' + sheetName);
      return;
    }

    // Get edited row number (1-indexed)
    const row = e.range.getRow();
    
    // Skip header row
    if (row === 1) {
      Logger.log('[onEdit] Header row edited, skipping sync');
      return;
    }

    // Get row data
    const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Find ID column (assuming first column is ID)
    const rowId = rowData[0];
    if (!rowId || isNaN(rowId)) {
      Logger.log('[onEdit] Invalid or missing row ID at row ' + row);
      return;
    }

    // Build data object from row
    const data = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const value = rowData[i];
      
      // Convert header to snake_case for backend
      const key = header.toLowerCase().replace(/\s+/g, '_');
      data[key] = value;
    }

    // Prepare webhook payload
    const payload = {
      sheet: SHEET_NAMES[sheetName],
      rowId: parseInt(rowId),
      data: data
    };

    Logger.log('[onEdit] Sending webhook for sheet=' + sheetName + ', rowId=' + rowId);
    
    // Send webhook to backend
    sendWebhook(payload);
    
  } catch (error) {
    Logger.log('[onEdit] Error: ' + error.toString());
    // Don't throw - we don't want to block the edit
  }
}

/**
 * Send webhook POST request to backend
 */
function sendWebhook(payload) {
  if (!BACKEND_WEBHOOK_URL || !WEBHOOK_SECRET) {
    Logger.log('[sendWebhook] Configuration missing: BACKEND_WEBHOOK_URL or WEBHOOK_SECRET');
    return;
  }

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'X-Webhook-Secret': WEBHOOK_SECRET
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // Don't throw on HTTP errors
  };

  try {
    const response = UrlFetchApp.fetch(BACKEND_WEBHOOK_URL, options);
    const statusCode = response.getResponseCode();
    
    if (statusCode === 200) {
      Logger.log('[sendWebhook] Success: ' + response.getContentText());
    } else {
      Logger.log('[sendWebhook] Failed with status ' + statusCode + ': ' + response.getContentText());
    }
  } catch (error) {
    Logger.log('[sendWebhook] Request failed: ' + error.toString());
  }
}

/**
 * Setup function - Run this once to configure script properties
 */
function setupWebhook() {
  const properties = PropertiesService.getScriptProperties();
  
  // Set these values according to your backend configuration
  properties.setProperty('BACKEND_WEBHOOK_URL', 'https://your-backend-url.com/api/webhook/google');
  properties.setProperty('WEBHOOK_SECRET', 'your-webhook-secret-here');
  
  Logger.log('Webhook configuration saved');
  Logger.log('BACKEND_WEBHOOK_URL: ' + properties.getProperty('BACKEND_WEBHOOK_URL'));
  Logger.log('WEBHOOK_SECRET: ' + properties.getProperty('WEBHOOK_SECRET'));
}
