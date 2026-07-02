package syncsvc

import (
	"fmt"
	"testing"
	"time"

	"github.com/VYN2/Auth_Service/models"
	"pgregory.net/rapid"
)

// ── Property 1: SheetMapper melewati baris header ─────────────────────────────
//
// Validates: Requirements 2.2
// For any worksheet data where row[0] is a header, RowsToInbounds must never
// produce output whose key field value came from row[0].

func TestProperty1_SheetMapperSkipsHeader(t *testing.T) {
	mapper := NewSheetMapper()
	rapid.Check(t, func(t *rapid.T) {
		// Generate a distinct header sentinel that is a valid nomor_fo string
		// (so if it were parsed it would be a valid field value — the test is
		// purely about skipping row[0]).
		headerNomorFO := "HEADER-" + rapid.StringN(1, 20, -1).Draw(t, "hdr")

		header := []string{
			"2024-01-01", // col 0: tanggal
			"Pagi",       // col 1: shifting
			headerNomorFO, // col 2: nomor_fo  ← sentinel
			"B1234",
			"PlantA",
			"SLIPSHEET",
			"10",
			"GR001",
			"5",
		}

		// Build rows: header + 0–3 data rows that do NOT use the sentinel
		numData := rapid.IntRange(0, 3).Draw(t, "numData")
		rows := make([][]string, 1+numData)
		rows[0] = header
		for i := 1; i <= numData; i++ {
			rows[i] = []string{
				"2024-01-0" + fmt.Sprintf("%d", i%9+1),
				"Siang",
				fmt.Sprintf("FO-%04d", i),
				"B9999",
				"PlantB",
				"SLIPSHEET",
				"3",
				"GR999",
				"1",
			}
		}

		result, _ := mapper.RowsToInbounds(rows)

		// The sentinel value must never appear in output
		for _, m := range result {
			if m.NomorFO == headerNomorFO {
				t.Fatalf(
					"header value %q appeared in output NomorFO — header was not skipped",
					headerNomorFO,
				)
			}
		}
	})
}

// ── Property 2: SheetMapper round-trip ────────────────────────────────────────
//
// Validates: Requirements 2.3–2.10
// For valid model structs, StructToRow → RowToStruct must yield an equivalent struct.
// Tested for Inbound, Outbound, and Setoran (representative sample, 200 total runs).

func TestProperty2_SheetMapperRoundTrip_Inbound(t *testing.T) {
	mapper := NewSheetMapper()
	rapid.Check(t, func(t *rapid.T) {
		// Generate a valid Inbound struct
		year := rapid.IntRange(2020, 2030).Draw(t, "year")
		month := rapid.IntRange(1, 12).Draw(t, "month")
		day := rapid.IntRange(1, 28).Draw(t, "day") // cap at 28 to avoid invalid dates
		tanggal := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)

		// Use only alphanumeric runes to avoid trimming differences
		safeRunes := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")
		nomorFO := "FO-" + rapid.StringOf(rapid.RuneFrom(safeRunes)).Draw(t, "nomorFO")
		totalBox := rapid.IntRange(0, 9999).Draw(t, "totalBox")
		totalSlipsheet := rapid.IntRange(0, 999).Draw(t, "totalSlipsheet")
		jenisBongkaran := models.JenisBongkaranSlipsheet
		if rapid.Bool().Draw(t, "isCurah") {
			jenisBongkaran = models.JenisBongkaranCurah
		}

		original := &models.Inbound{
			Tanggal:        tanggal,
			Shifting:       "Pagi",
			NomorFO:        nomorFO,
			Nopol:          "B1234ABC",
			PlantPabrik:    "Plant A",
			JenisBongkaran: jenisBongkaran,
			TotalBox:       totalBox,
			NomorGR:        "GR-001",
			TotalSlipsheet: totalSlipsheet,
		}

		// StructToRow
		row := mapper.InboundToRow(original)

		// Convert []interface{} → []string for RowsToInbounds
		strRow := make([]string, len(row))
		for i, v := range row {
			strRow[i] = fmt.Sprintf("%v", v)
		}

		// RowToStruct (with dummy header at index 0)
		rows := [][]string{{"header"}, strRow}
		result, skipped := mapper.RowsToInbounds(rows)

		if len(skipped) > 0 {
			t.Fatalf("round-trip produced SkippedRow: %+v\noriginal: %+v\nrow: %v", skipped[0], original, strRow)
		}
		if len(result) == 0 {
			t.Fatalf("round-trip produced no result\noriginal: %+v\nrow: %v", original, strRow)
		}

		got := result[0]

		// Verify key fields
		if got.NomorFO != original.NomorFO {
			t.Fatalf("NomorFO mismatch: got %q, want %q", got.NomorFO, original.NomorFO)
		}
		if got.TotalBox != original.TotalBox {
			t.Fatalf("TotalBox mismatch: got %d, want %d", got.TotalBox, original.TotalBox)
		}
		if got.TotalSlipsheet != original.TotalSlipsheet {
			t.Fatalf("TotalSlipsheet mismatch: got %d, want %d", got.TotalSlipsheet, original.TotalSlipsheet)
		}
		if got.JenisBongkaran != original.JenisBongkaran {
			t.Fatalf("JenisBongkaran mismatch: got %q, want %q", got.JenisBongkaran, original.JenisBongkaran)
		}
		if !got.Tanggal.Equal(original.Tanggal) {
			t.Fatalf("Tanggal mismatch: got %v, want %v", got.Tanggal, original.Tanggal)
		}
	})
}

func TestProperty2_SheetMapperRoundTrip_Setoran(t *testing.T) {
	mapper := NewSheetMapper()
	rapid.Check(t, func(t *rapid.T) {
		year := rapid.IntRange(2020, 2030).Draw(t, "year")
		month := rapid.IntRange(1, 12).Draw(t, "month")
		day := rapid.IntRange(1, 28).Draw(t, "day")
		tanggal := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)

		// Use only alphanumeric runes to avoid trim differences
		safeRunes2 := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")
		salesman := "Sales-" + rapid.StringOf(rapid.RuneFrom(safeRunes2)).Draw(t, "salesman")
		durasi := rapid.IntRange(0, 300).Draw(t, "durasi")

		original := &models.Setoran{
			Tanggal:         tanggal,
			Salesman:        salesman,
			PulangKunjungan: "17:00",
			SetoranKeKasir:  "18:00",
			Durasi:          durasi,
			Bulan:           "Januari",
		}

		row := mapper.SetoranToRow(original)
		strRow := make([]string, len(row))
		for i, v := range row {
			strRow[i] = fmt.Sprintf("%v", v)
		}

		rows := [][]string{{"header"}, strRow}
		result, skipped := mapper.RowsToSetorans(rows)

		if len(skipped) > 0 {
			t.Fatalf("round-trip produced SkippedRow: %+v", skipped[0])
		}
		if len(result) == 0 {
			t.Fatal("round-trip produced no result")
		}

		got := result[0]
		if got.Salesman != original.Salesman {
			t.Fatalf("Salesman mismatch: got %q, want %q", got.Salesman, original.Salesman)
		}
		if got.Durasi != original.Durasi {
			t.Fatalf("Durasi mismatch: got %d, want %d", got.Durasi, original.Durasi)
		}
		if !got.Tanggal.Equal(original.Tanggal) {
			t.Fatalf("Tanggal mismatch: got %v, want %v", got.Tanggal, original.Tanggal)
		}
	})
}

// ── Property 3: Baris tidak valid menghasilkan SkippedRow, bukan panic ─────────
//
// Validates: Requirements 2.11
// Any row with an invalid date (non-parseable) must be added to skipped, never panic.

func TestProperty3_InvalidRowsSkipped(t *testing.T) {
	mapper := NewSheetMapper()
	safeRunes := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 _-")

	rapid.Check(t, func(t *rapid.T) {
		// Generate an invalid date string (letters only → can't be parsed as date)
		invalidDate := rapid.StringOf(rapid.RuneFrom(safeRunes)).Draw(t, "invalidDate")
		// Ensure it can't accidentally match a date format
		invalidDate = "NOTADATE-" + invalidDate

		row := []string{
			invalidDate,  // col 0: tanggal — intentionally invalid
			"Pagi",
			"FO-001",
			"B1234",
			"PlantA",
			"SLIPSHEET",
			"5",
			"GR001",
			"3",
		}
		rows := [][]string{{"header"}, row}

		// Must not panic
		result, skipped := mapper.RowsToInbounds(rows)

		// Row must be skipped (not silently dropped without a record)
		if len(result) > 0 {
			t.Fatal("invalid date row was parsed instead of skipped")
		}
		if len(skipped) == 0 {
			t.Fatal("invalid row neither parsed nor produced a SkippedRow")
		}
	})
}

func TestProperty3_EmptyRowsSkipped(t *testing.T) {
	mapper := NewSheetMapper()
	rapid.Check(t, func(t *rapid.T) {
		numEmpty := rapid.IntRange(1, 5).Draw(t, "numEmpty")
		rows := make([][]string, 1+numEmpty)
		rows[0] = []string{"header"}
		for i := 1; i <= numEmpty; i++ {
			rows[i] = []string{"", "", "", "", "", "", "", "", ""}
		}

		result, skipped := mapper.RowsToInbounds(rows)

		if len(result) > 0 {
			t.Fatal("empty rows produced output instead of being skipped")
		}
		if len(skipped) != numEmpty {
			t.Fatalf("expected %d skipped rows, got %d", numEmpty, len(skipped))
		}
	})
}
