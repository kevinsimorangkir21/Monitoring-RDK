package syncsvc

import (
	"context"
	"crypto/subtle"
	"fmt"
	"log"

	"github.com/VYN2/Auth_Service/config"
	"github.com/VYN2/Auth_Service/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// SyncService adalah orchestrator utama yang mengoordinasikan semua komponen syncsvc.
type SyncService interface {
	ImportAll(ctx context.Context) (*ImportResult, error)
	ExportAll(ctx context.Context) (*ExportResult, error)
	SyncAfterCRUD(entity string, op CRUDOp, record interface{})
	ProcessWebhook(ctx context.Context, payload WebhookPayload) error
	IsConfigured() bool
}

// syncServiceImpl mengimplementasikan SyncService.
type syncServiceImpl struct {
	gc       GoogleClient
	sheetSvc SheetService
	mapper   SheetMapper
	resolver ConflictResolver
	db       *gorm.DB
	hub      *SSEHub
	cfg      *config.Config
}

// NewSyncService membuat instance SyncService baru.
// gc boleh nil jika Google tidak dikonfigurasi — service berjalan dalam Degraded Mode.
func NewSyncService(
	gc GoogleClient,
	sheetSvc SheetService,
	mapper SheetMapper,
	resolver ConflictResolver,
	db *gorm.DB,
	hub *SSEHub,
	cfg *config.Config,
) SyncService {
	return &syncServiceImpl{
		gc:       gc,
		sheetSvc: sheetSvc,
		mapper:   mapper,
		resolver: resolver,
		db:       db,
		hub:      hub,
		cfg:      cfg,
	}
}

// IsConfigured returns true jika semua 3 env var Google wajib tersedia.
func (s *syncServiceImpl) IsConfigured() bool {
	if s.gc == nil || s.cfg == nil {
		return false
	}
	return s.cfg.GoogleClientEmail != "" &&
		s.cfg.GooglePrivateKey != "" &&
		s.cfg.GoogleSpreadsheetID != ""
}

// ── ImportAll ─────────────────────────────────────────────────────────────────

// ImportAll membaca semua 8 worksheet dan melakukan upsert ke MySQL.
func (s *syncServiceImpl) ImportAll(ctx context.Context) (*ImportResult, error) {
	allData, readErrs := s.sheetSvc.ReadAllWorksheets(ctx)
	result := &ImportResult{}

	worksheetTableMap := map[string]string{
		"Inbound": "inbounds", "Outbound": "outbounds",
		"Report Daily": "report_daily_transports", "Scan Out DC": "scan_out_dcs",
		"Claim Vendor": "claim_vendors", "Gantungan Faktur": "gantungan_fakturs",
		"Setoran": "setorans", "WO-WT": "wo_wts",
	}
	for _, ws := range allWorksheets {
		wResult := WorksheetImportResult{Worksheet: ws}
		if err, ok := readErrs[ws]; ok {
			wResult.Error = err.Error()
			log.Printf("[syncsvc] ImportAll: worksheet %q read error: %v", ws, err)
			result.Results = append(result.Results, wResult)
			continue
		}
		rows := allData[ws]
		imported, skipped, err := s.importWorksheet(ctx, ws, rows)
		wResult.Imported = imported
		wResult.Skipped = skipped
		if err != nil {
			wResult.Error = err.Error()
			log.Printf("[syncsvc] ImportAll: worksheet %q import error: %v", ws, err)
		}
		_ = worksheetTableMap[ws]
		result.Results = append(result.Results, wResult)
	}
	return result, nil
}

// importWorksheet upserts rows from a single worksheet into MySQL.
func (s *syncServiceImpl) importWorksheet(ctx context.Context, worksheet string, rows [][]string) (imported, skipped int, err error) {
	createdBy := "google_import"
	switch worksheet {
	case "Inbound":
		records, sk := s.mapper.RowsToInbounds(rows)
		skipped = len(sk)
		for i := range records {
			records[i].CreatedBy = createdBy
		}
		if len(records) > 0 {
			res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "nomor_fo"}},
				DoUpdates: clause.AssignmentColumns([]string{"tanggal", "shifting", "nopol", "plant_pabrik", "jenis_bongkaran", "total_box", "nomor_gr", "total_slipsheet", "updated_at"}),
			}).Create(&records)
			if res.Error != nil { return 0, skipped, res.Error }
			imported = int(res.RowsAffected)
		}
	case "Outbound":
		records, sk := s.mapper.RowsToOutbounds(rows)
		skipped = len(sk)
		for i := range records { records[i].CreatedBy = createdBy }
		if len(records) > 0 {
			res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "freight_order"}},
				DoUpdates: clause.AssignmentColumns([]string{"tanggal", "mobil_muat", "status_fo", "assign_job", "jam_terima", "status", "selesai_muat", "hari", "putaran", "sth2", "jam_running", "updated_at"}),
			}).Create(&records)
			if res.Error != nil { return 0, skipped, res.Error }
			imported = int(res.RowsAffected)
		}
	case "Report Daily":
		records, sk := s.mapper.RowsToReportDailyTransports(rows)
		skipped = len(sk)
		for i := range records { records[i].CreatedBy = createdBy }
		if len(records) > 0 {
			res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "tanggal"}, {Name: "division"}, {Name: "report_type"}},
				DoUpdates: clause.AssignmentColumns([]string{"qty", "updated_at"}),
			}).Create(&records)
			if res.Error != nil { return 0, skipped, res.Error }
			imported = int(res.RowsAffected)
		}
	case "Scan Out DC":
		records, sk := s.mapper.RowsToScanOutDCs(rows)
		skipped = len(sk)
		for i := range records { records[i].CreatedBy = createdBy }
		if len(records) > 0 {
			res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "tanggal"}, {Name: "nopol"}},
				DoUpdates: clause.AssignmentColumns([]string{"vendor", "driver", "jam_scan", "jam_keluar", "status", "updated_at"}),
			}).Create(&records)
			if res.Error != nil { return 0, skipped, res.Error }
			imported = int(res.RowsAffected)
		}
	case "Claim Vendor":
		records, sk := s.mapper.RowsToClaimVendors(rows)
		skipped = len(sk)
		for i := range records { records[i].CreatedBy = createdBy }
		if len(records) > 0 {
			res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "nomor_claim"}},
				DoUpdates: clause.AssignmentColumns([]string{"tanggal", "vendor", "payment", "outstanding", "value", "status", "updated_at"}),
			}).Create(&records)
			if res.Error != nil { return 0, skipped, res.Error }
			imported = int(res.RowsAffected)
		}
	case "Gantungan Faktur":
		records, sk := s.mapper.RowsToGantunganFakturs(rows)
		skipped = len(sk)
		for i := range records { records[i].CreatedBy = createdBy }
		if len(records) > 0 {
			res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "sd_document"}},
				DoUpdates: clause.AssignmentColumns([]string{"tanggal", "pay_terms", "customer", "nama_toko", "sales_doc", "net_value", "keterangan_transport", "updated_at"}),
			}).Create(&records)
			if res.Error != nil { return 0, skipped, res.Error }
			imported = int(res.RowsAffected)
		}
	case "Setoran":
		records, sk := s.mapper.RowsToSetorans(rows)
		skipped = len(sk)
		for i := range records { records[i].CreatedBy = createdBy }
		if len(records) > 0 {
			res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "tanggal"}, {Name: "salesman"}},
				DoUpdates: clause.AssignmentColumns([]string{"pulang_kunjungan", "setoran_ke_kasir", "durasi", "bulan", "updated_at"}),
			}).Create(&records)
			if res.Error != nil { return 0, skipped, res.Error }
			imported = int(res.RowsAffected)
		}
	case "WO-WT":
		records, sk := s.mapper.RowsToWoWts(rows)
		skipped = len(sk)
		for i := range records { records[i].CreatedBy = createdBy }
		if len(records) > 0 {
			res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "tanggal"}, {Name: "plant"}},
				DoUpdates: clause.AssignmentColumns([]string{"zwp1", "zwp2", "zwp4", "zwp5", "global", "updated_at"}),
			}).Create(&records)
			if res.Error != nil { return 0, skipped, res.Error }
			imported = int(res.RowsAffected)
		}
	}
	return imported, skipped, nil
}

// ── ExportAll ─────────────────────────────────────────────────────────────────

// ExportAll membaca semua 8 tabel MySQL dan menulis ke worksheet yang bersesuaian.
func (s *syncServiceImpl) ExportAll(ctx context.Context) (*ExportResult, error) {
	result := &ExportResult{}
	for _, ws := range allWorksheets {
		rows, count, err := s.exportWorksheet(ctx, ws)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("%s: %v", ws, err))
			log.Printf("[syncsvc] ExportAll: worksheet %q error: %v", ws, err)
			continue
		}
		if writeErr := s.sheetSvc.WriteWorksheet(ctx, ws, rows); writeErr != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("%s write: %v", ws, writeErr))
			log.Printf("[syncsvc] ExportAll: WriteWorksheet %q error: %v", ws, writeErr)
			continue
		}
		result.Results = append(result.Results, WorksheetExportResult{Worksheet: ws, Written: count})
	}
	return result, nil
}

// exportWorksheet reads all records from the MySQL table and converts to sheet rows.
func (s *syncServiceImpl) exportWorksheet(ctx context.Context, worksheet string) ([][]interface{}, int, error) {
	switch worksheet {
	case "Inbound":
		var records []models.Inbound
		if err := s.db.WithContext(ctx).Find(&records).Error; err != nil { return nil, 0, err }
		rows := make([][]interface{}, len(records))
		for i := range records { rows[i] = s.mapper.InboundToRow(&records[i]) }
		return rows, len(rows), nil
	case "Outbound":
		var records []models.Outbound
		if err := s.db.WithContext(ctx).Find(&records).Error; err != nil { return nil, 0, err }
		rows := make([][]interface{}, len(records))
		for i := range records { rows[i] = s.mapper.OutboundToRow(&records[i]) }
		return rows, len(rows), nil
	case "Report Daily":
		var records []models.ReportDailyTransport
		if err := s.db.WithContext(ctx).Find(&records).Error; err != nil { return nil, 0, err }
		rows := make([][]interface{}, len(records))
		for i := range records { rows[i] = s.mapper.ReportDailyTransportToRow(&records[i]) }
		return rows, len(rows), nil
	case "Scan Out DC":
		var records []models.ScanOutDC
		if err := s.db.WithContext(ctx).Find(&records).Error; err != nil { return nil, 0, err }
		rows := make([][]interface{}, len(records))
		for i := range records { rows[i] = s.mapper.ScanOutDCToRow(&records[i]) }
		return rows, len(rows), nil
	case "Claim Vendor":
		var records []models.ClaimVendor
		if err := s.db.WithContext(ctx).Find(&records).Error; err != nil { return nil, 0, err }
		rows := make([][]interface{}, len(records))
		for i := range records { rows[i] = s.mapper.ClaimVendorToRow(&records[i]) }
		return rows, len(rows), nil
	case "Gantungan Faktur":
		var records []models.GantunganFaktur
		if err := s.db.WithContext(ctx).Find(&records).Error; err != nil { return nil, 0, err }
		rows := make([][]interface{}, len(records))
		for i := range records { rows[i] = s.mapper.GantunganFakturToRow(&records[i]) }
		return rows, len(rows), nil
	case "Setoran":
		var records []models.Setoran
		if err := s.db.WithContext(ctx).Find(&records).Error; err != nil { return nil, 0, err }
		rows := make([][]interface{}, len(records))
		for i := range records { rows[i] = s.mapper.SetoranToRow(&records[i]) }
		return rows, len(rows), nil
	case "WO-WT":
		var records []models.WoWt
		if err := s.db.WithContext(ctx).Find(&records).Error; err != nil { return nil, 0, err }
		rows := make([][]interface{}, len(records))
		for i := range records { rows[i] = s.mapper.WoWtToRow(&records[i]) }
		return rows, len(rows), nil
	}
	return nil, 0, fmt.Errorf("unknown worksheet: %s", worksheet)
}

// ── SyncAfterCRUD ─────────────────────────────────────────────────────────────

// entityMeta maps entity names to worksheet name, key column letter, and key value extractor.
type entityMeta struct {
	worksheet string
	keyCol    string
	keyFn     func(record interface{}) (string, []interface{})
}

var entityMetaMap = map[string]entityMeta{
	"inbounds":                 {worksheet: "Inbound", keyCol: "C"},
	"outbounds":                {worksheet: "Outbound", keyCol: "B"},
	"report_daily_transports":  {worksheet: "Report Daily", keyCol: "A"},
	"scan_out_dcs":             {worksheet: "Scan Out DC", keyCol: "A"},
	"claim_vendors":            {worksheet: "Claim Vendor", keyCol: "C"},
	"gantungan_fakturs":        {worksheet: "Gantungan Faktur", keyCol: "E"},
	"setorans":                 {worksheet: "Setoran", keyCol: "A"},
	"wo_wts":                   {worksheet: "WO-WT", keyCol: "A"},
}

// SyncAfterCRUD runs asynchronously in a goroutine after a CRUD operation succeeds.
// Errors are only logged — never propagated to the caller.
func (s *syncServiceImpl) SyncAfterCRUD(entity string, op CRUDOp, record interface{}) {
	if !s.IsConfigured() {
		return
	}
	go func() {
		ctx := context.Background()
		meta, ok := entityMetaMap[entity]
		if !ok {
			log.Printf("[syncsvc] SyncAfterCRUD: unknown entity %q", entity)
			return
		}
		row, keyValue := s.recordToRowAndKey(entity, record)
		if keyValue == "" {
			log.Printf("[syncsvc] SyncAfterCRUD: could not extract key for entity=%q op=%s", entity, op)
			return
		}
		if err := s.sheetSvc.SyncRowToSheet(ctx, op, meta.worksheet, meta.keyCol, keyValue, row); err != nil {
			log.Printf("[syncsvc] SyncAfterCRUD error: table=%s op=%s err=%v", entity, op, err)
		}
	}()
}

// recordToRowAndKey converts a record interface to a sheet row and its upsert key value.
func (s *syncServiceImpl) recordToRowAndKey(entity string, record interface{}) ([]interface{}, string) {
	switch entity {
	case "inbounds":
		if m, ok := record.(*models.Inbound); ok {
			return s.mapper.InboundToRow(m), m.NomorFO
		}
	case "outbounds":
		if m, ok := record.(*models.Outbound); ok {
			return s.mapper.OutboundToRow(m), m.FreightOrder
		}
	case "report_daily_transports":
		if m, ok := record.(*models.ReportDailyTransport); ok {
			return s.mapper.ReportDailyTransportToRow(m), fmtDate(m.Tanggal)
		}
	case "scan_out_dcs":
		if m, ok := record.(*models.ScanOutDC); ok {
			return s.mapper.ScanOutDCToRow(m), fmtDate(m.Tanggal)
		}
	case "claim_vendors":
		if m, ok := record.(*models.ClaimVendor); ok {
			return s.mapper.ClaimVendorToRow(m), m.NomorClaim
		}
	case "gantungan_fakturs":
		if m, ok := record.(*models.GantunganFaktur); ok {
			return s.mapper.GantunganFakturToRow(m), m.SDDocument
		}
	case "setorans":
		if m, ok := record.(*models.Setoran); ok {
			return s.mapper.SetoranToRow(m), fmtDate(m.Tanggal)
		}
	case "wo_wts":
		if m, ok := record.(*models.WoWt); ok {
			return s.mapper.WoWtToRow(m), fmtDate(m.Tanggal)
		}
	}
	return nil, ""
}

// ── ProcessWebhook ────────────────────────────────────────────────────────────

// ProcessWebhook validates the secret, reads the row from Google Sheets,
// upserts to MySQL, and broadcasts an SSE event.
func (s *syncServiceImpl) ProcessWebhook(ctx context.Context, payload WebhookPayload) error {
	// Validate secret using constant-time comparison
	if subtle.ConstantTimeCompare([]byte(payload.Secret), []byte(s.cfg.GoogleWebhookSecret)) != 1 {
		return fmt.Errorf("unauthorized: secret mismatch")
	}

	// Read the specific row from Google Sheets
	row, err := s.gc.GetRow(ctx, payload.Worksheet, payload.Row)
	if err != nil {
		return fmt.Errorf("GetRow %q row %d: %w", payload.Worksheet, payload.Row, err)
	}

	// Upsert the row into MySQL
	var recordID uint
	if id, upsertErr := s.upsertRowFromSheet(ctx, payload.Worksheet, row); upsertErr != nil {
		log.Printf("[syncsvc] ProcessWebhook: upsert error worksheet=%q row=%d err=%v", payload.Worksheet, payload.Row, upsertErr)
		return upsertErr
	} else {
		recordID = id
	}

	// Broadcast SSE event to all connected Dashboard clients
	if s.hub != nil {
		s.hub.Broadcast(SSEEvent{
			Event:     "sync",
			Worksheet: payload.Worksheet,
			ID:        recordID,
		})
	}

	return nil
}

// upsertRowFromSheet converts a sheet row to the appropriate model and upserts it.
// Returns the record ID (0 if unknown) and any error.
func (s *syncServiceImpl) upsertRowFromSheet(ctx context.Context, worksheet string, row []string) (uint, error) {
	// Wrap single row in a slice (with a dummy header) for the mapper
	rows := [][]string{{"header"}, row}
	switch worksheet {
	case "Inbound":
		records, _ := s.mapper.RowsToInbounds(rows)
		if len(records) == 0 { return 0, fmt.Errorf("could not parse Inbound row") }
		m := &records[0]
		if m.CreatedBy == "" { m.CreatedBy = "google_import" }
		res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "nomor_fo"}},
			DoUpdates: clause.AssignmentColumns([]string{"tanggal", "shifting", "nopol", "plant_pabrik", "jenis_bongkaran", "total_box", "nomor_gr", "total_slipsheet", "updated_at"}),
		}).Create(m)
		return m.ID, res.Error
	case "Outbound":
		records, _ := s.mapper.RowsToOutbounds(rows)
		if len(records) == 0 { return 0, fmt.Errorf("could not parse Outbound row") }
		m := &records[0]
		if m.CreatedBy == "" { m.CreatedBy = "google_import" }
		res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "freight_order"}},
			DoUpdates: clause.AssignmentColumns([]string{"tanggal", "mobil_muat", "status_fo", "assign_job", "jam_terima", "status", "selesai_muat", "hari", "putaran", "sth2", "jam_running", "updated_at"}),
		}).Create(m)
		return m.ID, res.Error
	case "Claim Vendor":
		records, _ := s.mapper.RowsToClaimVendors(rows)
		if len(records) == 0 { return 0, fmt.Errorf("could not parse ClaimVendor row") }
		m := &records[0]
		if m.CreatedBy == "" { m.CreatedBy = "google_import" }
		res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "nomor_claim"}},
			DoUpdates: clause.AssignmentColumns([]string{"tanggal", "vendor", "payment", "outstanding", "value", "status", "updated_at"}),
		}).Create(m)
		return m.ID, res.Error
	case "Gantungan Faktur":
		records, _ := s.mapper.RowsToGantunganFakturs(rows)
		if len(records) == 0 { return 0, fmt.Errorf("could not parse GantunganFaktur row") }
		m := &records[0]
		if m.CreatedBy == "" { m.CreatedBy = "google_import" }
		res := s.db.WithContext(ctx).Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "sd_document"}},
			DoUpdates: clause.AssignmentColumns([]string{"tanggal", "pay_terms", "customer", "nama_toko", "sales_doc", "net_value", "keterangan_transport", "updated_at"}),
		}).Create(m)
		return m.ID, res.Error
	default:
		log.Printf("[syncsvc] upsertRowFromSheet: worksheet %q not yet handled in webhook path", worksheet)
		return 0, nil
	}
}

// WebhookSecret returns the configured webhook secret (used by SyncController).
func (s *syncServiceImpl) WebhookSecret() string {
	if s.cfg == nil {
		return ""
	}
	return s.cfg.GoogleWebhookSecret
}
