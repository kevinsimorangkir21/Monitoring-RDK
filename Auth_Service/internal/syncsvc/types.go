package syncsvc

// CRUDOp mewakili jenis operasi CRUD.
type CRUDOp string

const (
	OpCreate CRUDOp = "create"
	OpUpdate CRUDOp = "update"
	OpDelete CRUDOp = "delete"
)

// WebhookPayload adalah payload dari Apps Script.
type WebhookPayload struct {
	Worksheet string `json:"worksheet"`
	Row       int    `json:"row"`
	Timestamp string `json:"timestamp"`
	Secret    string `json:"secret"`
}

// ImportResult merangkum hasil operasi import.
type ImportResult struct {
	Results []WorksheetImportResult `json:"results"`
}

// WorksheetImportResult menyimpan hasil import per worksheet.
type WorksheetImportResult struct {
	Worksheet string `json:"worksheet"`
	Imported  int    `json:"imported"`
	Skipped   int    `json:"skipped"`
	Error     string `json:"error,omitempty"`
}

// ExportResult merangkum hasil operasi export.
type ExportResult struct {
	Results []WorksheetExportResult `json:"results"`
	Errors  []string                `json:"errors,omitempty"`
}

// WorksheetExportResult menyimpan hasil export per worksheet.
type WorksheetExportResult struct {
	Worksheet string `json:"worksheet"`
	Written   int    `json:"written"`
}

// SSEEvent adalah event yang dikirim ke klien Dashboard via SSE.
type SSEEvent struct {
	Event     string `json:"event"`
	Worksheet string `json:"worksheet,omitempty"`
	ID        uint   `json:"id,omitempty"`
	ClientID  string `json:"clientId,omitempty"`
}

// SkippedRow mencatat baris yang dilewati saat parsing.
type SkippedRow struct {
	Worksheet string
	RowNumber int    // 1-based, termasuk header
	Reason    string
}

// ConflictDecision adalah hasil keputusan resolusi konflik.
type ConflictDecision string

const (
	DecisionMySQLWins  ConflictDecision = "mysql_wins"
	DecisionSheetsWins ConflictDecision = "sheets_wins"
	DecisionNoConflict ConflictDecision = "no_conflict"
)
