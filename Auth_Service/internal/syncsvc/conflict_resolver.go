package syncsvc

import (
	"context"
	"log"
	"time"
)

// ConflictResolver menyelesaikan konflik data antara Google Sheets dan MySQL.
type ConflictResolver interface {
	// Resolve membandingkan updated_at dari kedua sumber dan menentukan tindakan.
	// Selalu mengembalikan nil error — error dari write-back hanya di-log, tidak dipropagasi.
	Resolve(ctx context.Context, table string, recordID uint,
		sheetsUpdatedAt, mysqlUpdatedAt time.Time,
		writeBackToMySQL func() error,
		writeBackToSheets func() error,
	) (ConflictDecision, error)
}

// conflictResolverImpl adalah implementasi ConflictResolver dengan strategi Last Write Wins.
type conflictResolverImpl struct{}

// NewConflictResolver membuat instance ConflictResolver baru.
func NewConflictResolver() ConflictResolver {
	return &conflictResolverImpl{}
}

// Resolve menyelesaikan konflik antara dua sumber berdasarkan timestamp updated_at.
// Algoritma Last Write Wins:
//   - sheetsUpdatedAt zero → mysql wins, write-back ke sheets, log warning
//   - mysqlUpdatedAt zero  → sheets wins, write-back ke mysql, log warning
//   - diff > 0 (sheets lebih baru) → sheets wins, write-back ke mysql
//   - diff < 0 (mysql lebih baru)  → mysql wins, write-back ke sheets
//   - diff == 0                    → no_conflict, tidak ada write
//
// Selalu mengembalikan nil sebagai error — kegagalan write-back hanya di-log.
func (r *conflictResolverImpl) Resolve(
	ctx context.Context,
	table string,
	recordID uint,
	sheetsUpdatedAt, mysqlUpdatedAt time.Time,
	writeBackToMySQL func() error,
	writeBackToSheets func() error,
) (ConflictDecision, error) {
	var decision ConflictDecision

	// Tangani kasus timestamp zero — sumber dengan zero timestamp kalah.
	if sheetsUpdatedAt.IsZero() {
		decision = DecisionMySQLWins
		log.Printf("[conflict_resolver] warning: %s updated_at is zero for table=%s id=%d",
			"sheets", table, recordID)
		if err := writeBackToSheets(); err != nil {
			log.Printf("[conflict_resolver] write-back error: source=%s table=%s id=%d err=%v",
				"sheets", table, recordID, err)
		}
		log.Printf("[conflict_resolver] table=%s id=%d sheets_ts=%s mysql_ts=%s decision=%s",
			table, recordID, sheetsUpdatedAt.UTC().Format(time.RFC3339), mysqlUpdatedAt.UTC().Format(time.RFC3339), decision)
		return decision, nil
	}

	if mysqlUpdatedAt.IsZero() {
		decision = DecisionSheetsWins
		log.Printf("[conflict_resolver] warning: %s updated_at is zero for table=%s id=%d",
			"mysql", table, recordID)
		if err := writeBackToMySQL(); err != nil {
			log.Printf("[conflict_resolver] write-back error: source=%s table=%s id=%d err=%v",
				"mysql", table, recordID, err)
		}
		log.Printf("[conflict_resolver] table=%s id=%d sheets_ts=%s mysql_ts=%s decision=%s",
			table, recordID, sheetsUpdatedAt.UTC().Format(time.RFC3339), mysqlUpdatedAt.UTC().Format(time.RFC3339), decision)
		return decision, nil
	}

	// Kedua timestamp valid — bandingkan dengan Last Write Wins.
	diff := sheetsUpdatedAt.Sub(mysqlUpdatedAt)

	switch {
	case diff > 0:
		// Sheets lebih baru → update MySQL dengan data dari Sheets.
		decision = DecisionSheetsWins
		if err := writeBackToMySQL(); err != nil {
			log.Printf("[conflict_resolver] write-back error: source=%s table=%s id=%d err=%v",
				"mysql", table, recordID, err)
		}

	case diff < 0:
		// MySQL lebih baru → update Sheets dengan data dari MySQL.
		decision = DecisionMySQLWins
		if err := writeBackToSheets(); err != nil {
			log.Printf("[conflict_resolver] write-back error: source=%s table=%s id=%d err=%v",
				"sheets", table, recordID, err)
		}

	default:
		// diff == 0: kedua sumber identik — tidak ada write.
		decision = DecisionNoConflict
	}

	log.Printf("[conflict_resolver] table=%s id=%d sheets_ts=%s mysql_ts=%s decision=%s",
		table, recordID,
		sheetsUpdatedAt.UTC().Format(time.RFC3339),
		mysqlUpdatedAt.UTC().Format(time.RFC3339),
		decision)

	return decision, nil
}
