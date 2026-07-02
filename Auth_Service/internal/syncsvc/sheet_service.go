package syncsvc

import (
	"context"
	"log"
)

// allWorksheets adalah daftar 8 nama worksheet yang dikelola oleh sistem.
var allWorksheets = []string{
	"Inbound",
	"Outbound",
	"Report Daily",
	"Scan Out DC",
	"Claim Vendor",
	"Gantungan Faktur",
	"Setoran",
	"WO-WT",
}

// SheetService membungkus GoogleClient dengan logika batch read/write level worksheet.
type SheetService interface {
	// ReadAllWorksheets membaca semua 8 worksheet sekaligus.
	// Worksheet yang gagal dibaca tidak menghentikan worksheet lainnya.
	// Mengembalikan map data (nama → baris) dan map error (nama → error) untuk yang gagal.
	ReadAllWorksheets(ctx context.Context) (map[string][][]string, map[string]error)

	// WriteWorksheet menghapus baris lama (mulai row 2) dan menulis data baru
	// menggunakan batchUpdate dalam satu round-trip per worksheet.
	WriteWorksheet(ctx context.Context, worksheet string, rows [][]interface{}) error

	// SyncRowToSheet menentukan apakah baris harus di-append, update, atau delete
	// berdasarkan operasi CRUD yang dilakukan, lalu memanggil GoogleClient.
	// Untuk single-row gunakan AppendRow/UpdateRow/DeleteRow;
	// untuk multi-row gunakan BatchUpdateRows.
	SyncRowToSheet(ctx context.Context, op CRUDOp, worksheet, keyCol, keyValue string, values []interface{}) error
}

// sheetServiceImpl mengimplementasikan SheetService menggunakan GoogleClient.
type sheetServiceImpl struct {
	gc GoogleClient
}

// NewSheetService membuat instans SheetService baru dengan GoogleClient sebagai dependency.
func NewSheetService(gc GoogleClient) SheetService {
	return &sheetServiceImpl{gc: gc}
}

// ReadAllWorksheets membaca semua 8 worksheet secara iteratif.
// Worksheet yang gagal tidak menghentikan pembacaan worksheet lainnya.
// Mengembalikan map data untuk yang berhasil dan map error untuk yang gagal.
func (s *sheetServiceImpl) ReadAllWorksheets(ctx context.Context) (map[string][][]string, map[string]error) {
	data := make(map[string][][]string, len(allWorksheets))
	errs := make(map[string]error)

	for _, ws := range allWorksheets {
		rows, err := s.gc.GetSheetValues(ctx, ws)
		if err != nil {
			log.Printf("[syncsvc] ReadAllWorksheets: failed to read worksheet %q: %v", ws, err)
			errs[ws] = err
			continue
		}
		data[ws] = rows
	}

	return data, errs
}

// WriteWorksheet menghapus konten worksheet mulai baris ke-2 (mempertahankan header),
// kemudian menulis data baru dari baris ke-2 menggunakan BatchUpdateRows (satu round-trip).
func (s *sheetServiceImpl) WriteWorksheet(ctx context.Context, worksheet string, rows [][]interface{}) error {
	if err := s.gc.ClearSheet(ctx, worksheet); err != nil {
		log.Printf("[syncsvc] WriteWorksheet: ClearSheet failed for %q: %v", worksheet, err)
		return err
	}

	if len(rows) == 0 {
		return nil
	}

	if err := s.gc.BatchUpdateRows(ctx, worksheet, 2, rows); err != nil {
		log.Printf("[syncsvc] WriteWorksheet: BatchUpdateRows failed for %q: %v", worksheet, err)
		return err
	}

	return nil
}

// SyncRowToSheet menentukan operasi yang harus dilakukan berdasarkan CRUDOp dan
// menjalankannya melalui GoogleClient.
//
// - OpCreate: append baris baru di akhir worksheet menggunakan AppendRow.
// - OpUpdate: cari baris via FindRowByKey; jika ditemukan, UpdateRow; jika tidak, AppendRow (upsert).
// - OpDelete: cari baris via FindRowByKey; jika ditemukan, DeleteRow; jika tidak, log warning (bukan error).
func (s *sheetServiceImpl) SyncRowToSheet(ctx context.Context, op CRUDOp, worksheet, keyCol, keyValue string, values []interface{}) error {
	switch op {
	case OpCreate:
		if err := s.gc.AppendRow(ctx, worksheet, values); err != nil {
			log.Printf("[syncsvc] SyncRowToSheet: AppendRow failed for worksheet=%q key=%q: %v", worksheet, keyValue, err)
			return err
		}

	case OpUpdate:
		rowNum, err := s.gc.FindRowByKey(ctx, worksheet, keyCol, keyValue)
		if err != nil {
			log.Printf("[syncsvc] SyncRowToSheet: FindRowByKey failed for worksheet=%q keyCol=%q keyValue=%q: %v", worksheet, keyCol, keyValue, err)
			return err
		}

		if rowNum > 0 {
			// Baris ditemukan — lakukan update
			if err := s.gc.UpdateRow(ctx, worksheet, rowNum, values); err != nil {
				log.Printf("[syncsvc] SyncRowToSheet: UpdateRow failed for worksheet=%q row=%d key=%q: %v", worksheet, rowNum, keyValue, err)
				return err
			}
		} else {
			// Baris tidak ditemukan — upsert dengan append
			if err := s.gc.AppendRow(ctx, worksheet, values); err != nil {
				log.Printf("[syncsvc] SyncRowToSheet: AppendRow (upsert) failed for worksheet=%q key=%q: %v", worksheet, keyValue, err)
				return err
			}
		}

	case OpDelete:
		rowNum, err := s.gc.FindRowByKey(ctx, worksheet, keyCol, keyValue)
		if err != nil {
			log.Printf("[syncsvc] SyncRowToSheet: FindRowByKey failed for worksheet=%q keyCol=%q keyValue=%q: %v", worksheet, keyCol, keyValue, err)
			return err
		}

		if rowNum > 0 {
			if err := s.gc.DeleteRow(ctx, worksheet, rowNum); err != nil {
				log.Printf("[syncsvc] SyncRowToSheet: DeleteRow failed for worksheet=%q row=%d key=%q: %v", worksheet, rowNum, keyValue, err)
				return err
			}
		} else {
			// Baris tidak ditemukan — log warning, bukan error
			log.Printf("[syncsvc] SyncRowToSheet: row not found for delete on worksheet=%q keyCol=%q keyValue=%q (no-op)", worksheet, keyCol, keyValue)
		}

	default:
		log.Printf("[syncsvc] SyncRowToSheet: unknown CRUDOp %q for worksheet=%q key=%q", op, worksheet, keyValue)
	}

	return nil
}
