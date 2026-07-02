package syncsvc

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/VYN2/Auth_Service/config"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/googleapi"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

// GoogleClient mendefinisikan operasi akses ke Google Sheets.
type GoogleClient interface {
	// GetSheetValues membaca semua nilai dari worksheet yang diberikan.
	GetSheetValues(ctx context.Context, worksheet string) ([][]string, error)
	// GetRow membaca satu baris (1-based) dari worksheet.
	GetRow(ctx context.Context, worksheet string, rowNum int) ([]string, error)
	// AppendRow menambahkan satu baris baru di akhir worksheet.
	AppendRow(ctx context.Context, worksheet string, values []interface{}) error
	// UpdateRow menimpa nilai pada baris (1-based) di worksheet.
	UpdateRow(ctx context.Context, worksheet string, rowNum int, values []interface{}) error
	// DeleteRow menghapus satu baris (1-based) dari worksheet.
	DeleteRow(ctx context.Context, worksheet string, rowNum int) error
	// BatchUpdateRows menulis beberapa baris mulai dari startRow (1-based).
	BatchUpdateRows(ctx context.Context, worksheet string, startRow int, values [][]interface{}) error
	// ClearSheet menghapus semua data mulai dari baris ke-2 (mempertahankan header).
	ClearSheet(ctx context.Context, worksheet string) error
	// FindRowByKey mencari baris yang nilai pada kolom keyCol sama dengan keyValue.
	// keyCol adalah huruf kolom (mis. "A", "B"). Mengembalikan nomor baris 1-based, atau 0 jika tidak ditemukan.
	FindRowByKey(ctx context.Context, worksheet, keyCol, keyValue string) (int, error)
}

// googleClientImpl mengimplementasikan GoogleClient menggunakan Google Sheets API v4.
type googleClientImpl struct {
	svc           *sheets.Service
	spreadsheetID string

	// sheetIDCache menyimpan cache pemetaan nama worksheet → sheetId numerik.
	// Di-populate secara lazy pada akses pertama ke suatu worksheet.
	sheetIDCache   map[string]int64
	sheetIDCacheMu sync.RWMutex
}

// NewGoogleClient membuat instans GoogleClient baru dari konfigurasi yang diberikan.
// Mengembalikan error jika salah satu env var wajib tidak dikonfigurasi.
func NewGoogleClient(cfg *config.Config) (GoogleClient, error) {
	// Validasi env vars wajib
	var missing []string
	if cfg.GoogleClientEmail == "" {
		missing = append(missing, "GoogleClientEmail")
	}
	if cfg.GooglePrivateKey == "" {
		missing = append(missing, "GooglePrivateKey")
	}
	if cfg.GoogleSpreadsheetID == "" {
		missing = append(missing, "GoogleSpreadsheetID")
	}
	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required config: %s", strings.Join(missing, ", "))
	}

	ctx := context.Background()

	// Bangun JSON kredensial Service Account secara programatik — tidak dari file JSON.
	credMap := map[string]interface{}{
		"type":                        "service_account",
		"project_id":                  cfg.GoogleProjectID,
		"client_email":                cfg.GoogleClientEmail,
		"private_key":                 cfg.GooglePrivateKey,
		"auth_uri":                    "https://accounts.google.com/o/oauth2/auth",
		"token_uri":                   "https://oauth2.googleapis.com/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	}
	credJSON, err := json.Marshal(credMap)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal service account credentials: %w", err)
	}

	creds, err := google.CredentialsFromJSON(ctx, credJSON, sheets.SpreadsheetsScope)
	if err != nil {
		return nil, fmt.Errorf("failed to parse service account credentials: %w", err)
	}

	svc, err := sheets.NewService(ctx, option.WithCredentials(creds))
	if err != nil {
		return nil, fmt.Errorf("failed to create sheets service: %w", err)
	}

	return &googleClientImpl{
		svc:           svc,
		spreadsheetID: cfg.GoogleSpreadsheetID,
		sheetIDCache:  make(map[string]int64),
	}, nil
}

// --- Retry helper ---

// isRetryableHTTPCode mengembalikan true untuk kode HTTP yang perlu di-retry.
func isRetryableHTTPCode(code int) bool {
	return code == http.StatusUnauthorized || // 401
		code == http.StatusTooManyRequests || // 429
		(code >= 500 && code < 600) // 5xx
}

// extractHTTPCode mencoba mengekstrak kode HTTP dari error Google API.
func extractHTTPCode(err error) (int, bool) {
	if gerr, ok := err.(*googleapi.Error); ok {
		return gerr.Code, true
	}
	return 0, false
}

// withRetry menjalankan fn dengan exponential backoff hingga maxRetries kali
// untuk error yang dapat di-retry (HTTP 401, 429, 5xx).
func withRetry(ctx context.Context, maxRetries int, fn func() error) error {
	var lastErr error
	for attempt := 0; attempt <= maxRetries; attempt++ {
		if err := ctx.Err(); err != nil {
			return err
		}
		lastErr = fn()
		if lastErr == nil {
			return nil
		}
		code, hasCode := extractHTTPCode(lastErr)
		if !hasCode || !isRetryableHTTPCode(code) {
			return lastErr
		}
		if attempt == maxRetries {
			break
		}
		// Exponential backoff: 1s, 2s, 4s
		backoff := time.Duration(1<<uint(attempt)) * time.Second
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(backoff):
		}
	}
	code, _ := extractHTTPCode(lastErr)
	return fmt.Errorf("all %d retries failed (last HTTP %d): %w", maxRetries, code, lastErr)
}

// --- Sheet ID cache ---

// resolveSheetID mengembalikan sheetId numerik untuk nama worksheet, menggunakan cache.
// Jika nama tidak ditemukan, mengembalikan error deskriptif.
func (c *googleClientImpl) resolveSheetID(ctx context.Context, worksheet string) (int64, error) {
	// Cek cache dulu (read lock)
	c.sheetIDCacheMu.RLock()
	id, ok := c.sheetIDCache[worksheet]
	c.sheetIDCacheMu.RUnlock()
	if ok {
		return id, nil
	}

	// Populate cache via spreadsheet metadata API
	var spreadsheet *sheets.Spreadsheet
	err := withRetry(ctx, 3, func() error {
		var e error
		spreadsheet, e = c.svc.Spreadsheets.Get(c.spreadsheetID).
			Fields("sheets.properties").
			Context(ctx).
			Do()
		return e
	})
	if err != nil {
		return 0, fmt.Errorf("failed to fetch spreadsheet metadata: %w", err)
	}

	c.sheetIDCacheMu.Lock()
	defer c.sheetIDCacheMu.Unlock()
	for _, sh := range spreadsheet.Sheets {
		c.sheetIDCache[sh.Properties.Title] = sh.Properties.SheetId
	}

	id, ok = c.sheetIDCache[worksheet]
	if !ok {
		return 0, fmt.Errorf("worksheet %q not found in spreadsheet %s", worksheet, c.spreadsheetID)
	}
	return id, nil
}

// --- columnLetterToIndex mengonversi huruf kolom ("A"=0, "B"=1, "Z"=25, "AA"=26, dst.) ---
func columnLetterToIndex(col string) (int, error) {
	col = strings.ToUpper(strings.TrimSpace(col))
	if col == "" {
		return 0, fmt.Errorf("empty column letter")
	}
	idx := 0
	for _, ch := range col {
		if ch < 'A' || ch > 'Z' {
			return 0, fmt.Errorf("invalid column letter %q", col)
		}
		idx = idx*26 + int(ch-'A'+1)
	}
	return idx - 1, nil // 0-based
}

// --- rangeFor returns A1-notation range for a given worksheet and row (1-based) ---
func rangeFor(worksheet string, row int) string {
	return fmt.Sprintf("%s!A%d:Z%d", worksheet, row, row)
}

// --- Interface implementations ---

// GetSheetValues membaca semua nilai dari worksheet.
func (c *googleClientImpl) GetSheetValues(ctx context.Context, worksheet string) ([][]string, error) {
	// Pastikan worksheet ada
	if _, err := c.resolveSheetID(ctx, worksheet); err != nil {
		return nil, err
	}

	rangeStr := fmt.Sprintf("%s!A1:Z", worksheet)
	var resp *sheets.ValueRange
	err := withRetry(ctx, 3, func() error {
		var e error
		resp, e = c.svc.Spreadsheets.Values.Get(c.spreadsheetID, rangeStr).
			ValueRenderOption("FORMATTED_VALUE").
			Context(ctx).
			Do()
		return e
	})
	if err != nil {
		return nil, fmt.Errorf("GetSheetValues(%q): %w", worksheet, err)
	}

	result := make([][]string, len(resp.Values))
	for i, row := range resp.Values {
		strRow := make([]string, len(row))
		for j, cell := range row {
			strRow[j] = fmt.Sprintf("%v", cell)
		}
		result[i] = strRow
	}
	return result, nil
}

// GetRow membaca satu baris (1-based) dari worksheet.
func (c *googleClientImpl) GetRow(ctx context.Context, worksheet string, rowNum int) ([]string, error) {
	if _, err := c.resolveSheetID(ctx, worksheet); err != nil {
		return nil, err
	}

	rangeStr := rangeFor(worksheet, rowNum)
	var resp *sheets.ValueRange
	err := withRetry(ctx, 3, func() error {
		var e error
		resp, e = c.svc.Spreadsheets.Values.Get(c.spreadsheetID, rangeStr).
			ValueRenderOption("FORMATTED_VALUE").
			Context(ctx).
			Do()
		return e
	})
	if err != nil {
		return nil, fmt.Errorf("GetRow(%q, %d): %w", worksheet, rowNum, err)
	}

	if len(resp.Values) == 0 {
		return []string{}, nil
	}
	row := resp.Values[0]
	strRow := make([]string, len(row))
	for i, cell := range row {
		strRow[i] = fmt.Sprintf("%v", cell)
	}
	return strRow, nil
}

// AppendRow menambahkan satu baris baru di akhir worksheet.
func (c *googleClientImpl) AppendRow(ctx context.Context, worksheet string, values []interface{}) error {
	if _, err := c.resolveSheetID(ctx, worksheet); err != nil {
		return err
	}

	rangeStr := fmt.Sprintf("%s!A1", worksheet)
	body := &sheets.ValueRange{
		Values: [][]interface{}{values},
	}
	return withRetry(ctx, 3, func() error {
		_, e := c.svc.Spreadsheets.Values.Append(c.spreadsheetID, rangeStr, body).
			ValueInputOption("USER_ENTERED").
			InsertDataOption("INSERT_ROWS").
			Context(ctx).
			Do()
		return e
	})
}

// UpdateRow menimpa nilai pada baris (1-based) di worksheet.
func (c *googleClientImpl) UpdateRow(ctx context.Context, worksheet string, rowNum int, values []interface{}) error {
	if _, err := c.resolveSheetID(ctx, worksheet); err != nil {
		return err
	}

	rangeStr := rangeFor(worksheet, rowNum)
	body := &sheets.ValueRange{
		Range:  rangeStr,
		Values: [][]interface{}{values},
	}
	return withRetry(ctx, 3, func() error {
		_, e := c.svc.Spreadsheets.Values.Update(c.spreadsheetID, rangeStr, body).
			ValueInputOption("USER_ENTERED").
			Context(ctx).
			Do()
		return e
	})
}

// DeleteRow menghapus satu baris (1-based) dari worksheet menggunakan deleteDimension.
func (c *googleClientImpl) DeleteRow(ctx context.Context, worksheet string, rowNum int) error {
	sheetID, err := c.resolveSheetID(ctx, worksheet)
	if err != nil {
		return err
	}

	// API menggunakan indeks 0-based untuk range; rowNum adalah 1-based.
	startIndex := int64(rowNum - 1)
	endIndex := int64(rowNum)

	req := &sheets.BatchUpdateSpreadsheetRequest{
		Requests: []*sheets.Request{
			{
				DeleteDimension: &sheets.DeleteDimensionRequest{
					Range: &sheets.DimensionRange{
						SheetId:    sheetID,
						Dimension:  "ROWS",
						StartIndex: startIndex,
						EndIndex:   endIndex,
					},
				},
			},
		},
	}
	return withRetry(ctx, 3, func() error {
		_, e := c.svc.Spreadsheets.BatchUpdate(c.spreadsheetID, req).Context(ctx).Do()
		return e
	})
}

// BatchUpdateRows menulis beberapa baris mulai dari startRow (1-based).
func (c *googleClientImpl) BatchUpdateRows(ctx context.Context, worksheet string, startRow int, values [][]interface{}) error {
	if _, err := c.resolveSheetID(ctx, worksheet); err != nil {
		return err
	}
	if len(values) == 0 {
		return nil
	}

	endRow := startRow + len(values) - 1
	rangeStr := fmt.Sprintf("%s!A%d:Z%d", worksheet, startRow, endRow)

	data := []*sheets.ValueRange{
		{
			Range:  rangeStr,
			Values: values,
		},
	}
	body := &sheets.BatchUpdateValuesRequest{
		ValueInputOption: "USER_ENTERED",
		Data:             data,
	}
	return withRetry(ctx, 3, func() error {
		_, e := c.svc.Spreadsheets.Values.BatchUpdate(c.spreadsheetID, body).Context(ctx).Do()
		return e
	})
}

// ClearSheet menghapus semua data mulai dari baris ke-2 (mempertahankan header).
func (c *googleClientImpl) ClearSheet(ctx context.Context, worksheet string) error {
	if _, err := c.resolveSheetID(ctx, worksheet); err != nil {
		return err
	}

	rangeStr := fmt.Sprintf("%s!A2:Z", worksheet)
	return withRetry(ctx, 3, func() error {
		_, e := c.svc.Spreadsheets.Values.Clear(c.spreadsheetID, rangeStr, &sheets.ClearValuesRequest{}).
			Context(ctx).
			Do()
		return e
	})
}

// FindRowByKey mencari baris yang nilai pada kolom keyCol sama dengan keyValue.
// keyCol adalah huruf kolom (mis. "A", "B"). Mengembalikan nomor baris 1-based, atau 0 jika tidak ditemukan.
func (c *googleClientImpl) FindRowByKey(ctx context.Context, worksheet, keyCol, keyValue string) (int, error) {
	colIdx, err := columnLetterToIndex(keyCol)
	if err != nil {
		return 0, fmt.Errorf("FindRowByKey: invalid keyCol %q: %w", keyCol, err)
	}

	rows, err := c.GetSheetValues(ctx, worksheet)
	if err != nil {
		return 0, fmt.Errorf("FindRowByKey: %w", err)
	}

	for i, row := range rows {
		if colIdx < len(row) && row[colIdx] == keyValue {
			return i + 1, nil // 1-based row number
		}
	}
	return 0, nil // not found
}
