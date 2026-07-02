package syncsvc

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/VYN2/Auth_Service/models"
)

// dateFormats lists the supported date formats to try when parsing spreadsheet dates.
var dateFormats = []string{
	"2006-01-02",
	"02/01/2006",
	"01/02/2006",
	"2-Jan-06",
	"January 2, 2006",
}

// SheetMapper converts spreadsheet rows ([]string) to/from Go model structs.
type SheetMapper interface {
	RowsToInbounds(rows [][]string) ([]models.Inbound, []SkippedRow)
	RowsToOutbounds(rows [][]string) ([]models.Outbound, []SkippedRow)
	RowsToReportDailyTransports(rows [][]string) ([]models.ReportDailyTransport, []SkippedRow)
	RowsToScanOutDCs(rows [][]string) ([]models.ScanOutDC, []SkippedRow)
	RowsToClaimVendors(rows [][]string) ([]models.ClaimVendor, []SkippedRow)
	RowsToGantunganFakturs(rows [][]string) ([]models.GantunganFaktur, []SkippedRow)
	RowsToSetorans(rows [][]string) ([]models.Setoran, []SkippedRow)
	RowsToWoWts(rows [][]string) ([]models.WoWt, []SkippedRow)

	InboundToRow(m *models.Inbound) []interface{}
	OutboundToRow(m *models.Outbound) []interface{}
	ReportDailyTransportToRow(m *models.ReportDailyTransport) []interface{}
	ScanOutDCToRow(m *models.ScanOutDC) []interface{}
	ClaimVendorToRow(m *models.ClaimVendor) []interface{}
	GantunganFakturToRow(m *models.GantunganFaktur) []interface{}
	SetoranToRow(m *models.Setoran) []interface{}
	WoWtToRow(m *models.WoWt) []interface{}
}

// sheetMapperImpl is the concrete implementation of SheetMapper.
type sheetMapperImpl struct{}

// NewSheetMapper returns a new SheetMapper.
func NewSheetMapper() SheetMapper {
	return &sheetMapperImpl{}
}

// ── helpers ──────────────────────────────────────────────────────────────────

// safeGet returns row[idx] or "" when idx is out of range.
func safeGet(row []string, idx int) string {
	if idx >= len(row) {
		return ""
	}
	return strings.TrimSpace(row[idx])
}

// isRowEmpty returns true when every cell in the row is blank.
func isRowEmpty(row []string) bool {
	for _, c := range row {
		if strings.TrimSpace(c) != "" {
			return false
		}
	}
	return true
}

// parseDate tries each format in dateFormats until one succeeds.
func parseDate(s string) (time.Time, error) {
	s = strings.TrimSpace(s)
	for _, f := range dateFormats {
		if t, err := time.Parse(f, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("invalid date: %s", s)
}

// parseFloat converts a string to float64, returning 0 and an error on failure.
func parseFloat(s string) (float64, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return 0, nil
	}
	return strconv.ParseFloat(s, 64)
}

// parseInt converts a string to int, returning 0 and an error on failure.
func parseInt(s string) (int, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return 0, nil
	}
	// Handle float strings like "5.0"
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0, err
	}
	return int(f), nil
}

// fmtDate formats a time.Time as ISO 8601 "2006-01-02".
func fmtDate(t time.Time) string {
	return t.Format("2006-01-02")
}

// ── RowsToInbounds ────────────────────────────────────────────────────────────

// RowsToInbounds converts Inbound worksheet rows to model structs.
// Row 0 (header) is always skipped. Invalid/empty rows are collected as SkippedRow.
func (s *sheetMapperImpl) RowsToInbounds(rows [][]string) (out []models.Inbound, skipped []SkippedRow) {
	defer func() {
		if r := recover(); r != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Inbound", RowNumber: -1, Reason: fmt.Sprintf("panic: %v", r)})
		}
	}()
	for i := 1; i < len(rows); i++ {
		row := rows[i]
		rowNum := i + 1
		if isRowEmpty(row) {
			skipped = append(skipped, SkippedRow{Worksheet: "Inbound", RowNumber: rowNum, Reason: "empty row"})
			continue
		}
		tanggalStr := safeGet(row, 0)
		tanggal, err := parseDate(tanggalStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Inbound", RowNumber: rowNum, Reason: "invalid date: " + tanggalStr})
			continue
		}
		nomorFO := safeGet(row, 2)
		if nomorFO == "" {
			skipped = append(skipped, SkippedRow{Worksheet: "Inbound", RowNumber: rowNum, Reason: "missing required field: nomor_fo"})
			continue
		}
		totalBoxStr := safeGet(row, 6)
		totalBox, err := parseInt(totalBoxStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Inbound", RowNumber: rowNum, Reason: fmt.Sprintf("invalid number at column 6: %s", totalBoxStr)})
			continue
		}
		totalSlipsheetStr := safeGet(row, 8)
		totalSlipsheet, err := parseInt(totalSlipsheetStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Inbound", RowNumber: rowNum, Reason: fmt.Sprintf("invalid number at column 8: %s", totalSlipsheetStr)})
			continue
		}
		jenis := models.JenisBongkaran(safeGet(row, 5))
		if jenis != models.JenisBongkaranSlipsheet && jenis != models.JenisBongkaranCurah {
			jenis = models.JenisBongkaranSlipsheet
		}
		out = append(out, models.Inbound{
			Tanggal:        tanggal,
			Shifting:       safeGet(row, 1),
			NomorFO:        nomorFO,
			Nopol:          safeGet(row, 3),
			PlantPabrik:    safeGet(row, 4),
			JenisBongkaran: jenis,
			TotalBox:       totalBox,
			NomorGR:        safeGet(row, 7),
			TotalSlipsheet: totalSlipsheet,
		})
	}
	return
}

// ── RowsToOutbounds ───────────────────────────────────────────────────────────

func (s *sheetMapperImpl) RowsToOutbounds(rows [][]string) (out []models.Outbound, skipped []SkippedRow) {
	defer func() {
		if r := recover(); r != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Outbound", RowNumber: -1, Reason: fmt.Sprintf("panic: %v", r)})
		}
	}()
	for i := 1; i < len(rows); i++ {
		row := rows[i]
		rowNum := i + 1
		if isRowEmpty(row) {
			skipped = append(skipped, SkippedRow{Worksheet: "Outbound", RowNumber: rowNum, Reason: "empty row"})
			continue
		}
		tanggalStr := safeGet(row, 0)
		tanggal, err := parseDate(tanggalStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Outbound", RowNumber: rowNum, Reason: "invalid date: " + tanggalStr})
			continue
		}
		freightOrder := safeGet(row, 1)
		if freightOrder == "" {
			skipped = append(skipped, SkippedRow{Worksheet: "Outbound", RowNumber: rowNum, Reason: "missing required field: freight_order"})
			continue
		}
		putaranStr := safeGet(row, 9)
		putaran, err := parseInt(putaranStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Outbound", RowNumber: rowNum, Reason: fmt.Sprintf("invalid number at column 9: %s", putaranStr)})
			continue
		}
		statusFO := models.StatusFO(safeGet(row, 3))
		if statusFO != models.StatusFOMuatPagi && statusFO != models.StatusFOMuatInap {
			statusFO = models.StatusFOMuatPagi
		}
		out = append(out, models.Outbound{
			Tanggal:      tanggal,
			FreightOrder: freightOrder,
			MobilMuat:    safeGet(row, 2),
			StatusFO:     statusFO,
			AssignJob:    safeGet(row, 4),
			JamTerima:    safeGet(row, 5),
			Status:       safeGet(row, 6),
			SelesaiMuat:  safeGet(row, 7),
			Hari:         safeGet(row, 8),
			Putaran:      putaran,
			STH2:         safeGet(row, 10),
			JamRunning:   safeGet(row, 11),
		})
	}
	return
}

// ── RowsToReportDailyTransports ───────────────────────────────────────────────

func (s *sheetMapperImpl) RowsToReportDailyTransports(rows [][]string) (out []models.ReportDailyTransport, skipped []SkippedRow) {
	defer func() {
		if r := recover(); r != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Report Daily", RowNumber: -1, Reason: fmt.Sprintf("panic: %v", r)})
		}
	}()
	for i := 1; i < len(rows); i++ {
		row := rows[i]
		rowNum := i + 1
		if isRowEmpty(row) {
			skipped = append(skipped, SkippedRow{Worksheet: "Report Daily", RowNumber: rowNum, Reason: "empty row"})
			continue
		}
		tanggalStr := safeGet(row, 0)
		tanggal, err := parseDate(tanggalStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Report Daily", RowNumber: rowNum, Reason: "invalid date: " + tanggalStr})
			continue
		}
		division := safeGet(row, 1)
		if division == "" {
			skipped = append(skipped, SkippedRow{Worksheet: "Report Daily", RowNumber: rowNum, Reason: "missing required field: division"})
			continue
		}
		reportType := safeGet(row, 2)
		if reportType == "" {
			skipped = append(skipped, SkippedRow{Worksheet: "Report Daily", RowNumber: rowNum, Reason: "missing required field: report_type"})
			continue
		}
		qtyStr := safeGet(row, 3)
		qty, err := parseFloat(qtyStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Report Daily", RowNumber: rowNum, Reason: fmt.Sprintf("invalid number at column 3: %s", qtyStr)})
			continue
		}
		out = append(out, models.ReportDailyTransport{
			Tanggal:    tanggal,
			Division:   division,
			ReportType: reportType,
			Qty:        qty,
		})
	}
	return
}

// ── RowsToScanOutDCs ──────────────────────────────────────────────────────────

func (s *sheetMapperImpl) RowsToScanOutDCs(rows [][]string) (out []models.ScanOutDC, skipped []SkippedRow) {
	defer func() {
		if r := recover(); r != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Scan Out DC", RowNumber: -1, Reason: fmt.Sprintf("panic: %v", r)})
		}
	}()
	for i := 1; i < len(rows); i++ {
		row := rows[i]
		rowNum := i + 1
		if isRowEmpty(row) {
			skipped = append(skipped, SkippedRow{Worksheet: "Scan Out DC", RowNumber: rowNum, Reason: "empty row"})
			continue
		}
		tanggalStr := safeGet(row, 0)
		tanggal, err := parseDate(tanggalStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Scan Out DC", RowNumber: rowNum, Reason: "invalid date: " + tanggalStr})
			continue
		}
		vendor := safeGet(row, 1)
		if vendor == "" {
			skipped = append(skipped, SkippedRow{Worksheet: "Scan Out DC", RowNumber: rowNum, Reason: "missing required field: vendor"})
			continue
		}
		nopol := safeGet(row, 2)
		if nopol == "" {
			skipped = append(skipped, SkippedRow{Worksheet: "Scan Out DC", RowNumber: rowNum, Reason: "missing required field: nopol"})
			continue
		}
		out = append(out, models.ScanOutDC{
			Tanggal:   tanggal,
			Vendor:    vendor,
			Nopol:     nopol,
			Driver:    safeGet(row, 3),
			JamScan:   safeGet(row, 4),
			JamKeluar: safeGet(row, 5),
			Status:    safeGet(row, 6),
		})
	}
	return
}

// ── RowsToClaimVendors ────────────────────────────────────────────────────────

func (s *sheetMapperImpl) RowsToClaimVendors(rows [][]string) (out []models.ClaimVendor, skipped []SkippedRow) {
	defer func() {
		if r := recover(); r != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Claim Vendor", RowNumber: -1, Reason: fmt.Sprintf("panic: %v", r)})
		}
	}()
	for i := 1; i < len(rows); i++ {
		row := rows[i]
		rowNum := i + 1
		if isRowEmpty(row) {
			skipped = append(skipped, SkippedRow{Worksheet: "Claim Vendor", RowNumber: rowNum, Reason: "empty row"})
			continue
		}
		tanggalStr := safeGet(row, 0)
		tanggal, err := parseDate(tanggalStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Claim Vendor", RowNumber: rowNum, Reason: "invalid date: " + tanggalStr})
			continue
		}
		nomorClaim := safeGet(row, 2)
		if nomorClaim == "" {
			skipped = append(skipped, SkippedRow{Worksheet: "Claim Vendor", RowNumber: rowNum, Reason: "missing required field: nomor_claim"})
			continue
		}
		paymentStr := safeGet(row, 3)
		payment, err := parseFloat(paymentStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Claim Vendor", RowNumber: rowNum, Reason: fmt.Sprintf("invalid number at column 3: %s", paymentStr)})
			continue
		}
		outstandingStr := safeGet(row, 4)
		outstanding, err := parseFloat(outstandingStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Claim Vendor", RowNumber: rowNum, Reason: fmt.Sprintf("invalid number at column 4: %s", outstandingStr)})
			continue
		}
		valueStr := safeGet(row, 5)
		value, err := parseFloat(valueStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Claim Vendor", RowNumber: rowNum, Reason: fmt.Sprintf("invalid number at column 5: %s", valueStr)})
			continue
		}
		out = append(out, models.ClaimVendor{
			Tanggal:     tanggal,
			Vendor:      safeGet(row, 1),
			NomorClaim:  nomorClaim,
			Payment:     payment,
			Outstanding: outstanding,
			Value:       value,
			Status:      safeGet(row, 6),
		})
	}
	return
}

// ── RowsToGantunganFakturs ────────────────────────────────────────────────────

func (s *sheetMapperImpl) RowsToGantunganFakturs(rows [][]string) (out []models.GantunganFaktur, skipped []SkippedRow) {
	defer func() {
		if r := recover(); r != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Gantungan Faktur", RowNumber: -1, Reason: fmt.Sprintf("panic: %v", r)})
		}
	}()
	for i := 1; i < len(rows); i++ {
		row := rows[i]
		rowNum := i + 1
		if isRowEmpty(row) {
			skipped = append(skipped, SkippedRow{Worksheet: "Gantungan Faktur", RowNumber: rowNum, Reason: "empty row"})
			continue
		}
		tanggalStr := safeGet(row, 0)
		tanggal, err := parseDate(tanggalStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Gantungan Faktur", RowNumber: rowNum, Reason: "invalid date: " + tanggalStr})
			continue
		}
		customer := safeGet(row, 2)
		if customer == "" {
			skipped = append(skipped, SkippedRow{Worksheet: "Gantungan Faktur", RowNumber: rowNum, Reason: "missing required field: customer"})
			continue
		}
		netValueStr := safeGet(row, 6)
		netValue, err := parseFloat(netValueStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Gantungan Faktur", RowNumber: rowNum, Reason: fmt.Sprintf("invalid number at column 6: %s", netValueStr)})
			continue
		}
		out = append(out, models.GantunganFaktur{
			Tanggal:             tanggal,
			PayTerms:            safeGet(row, 1),
			Customer:            customer,
			NamaToko:            safeGet(row, 3),
			SDDocument:          safeGet(row, 4),
			SalesDoc:            safeGet(row, 5),
			NetValue:            netValue,
			KeteranganTransport: safeGet(row, 7),
		})
	}
	return
}

// ── RowsToSetorans ────────────────────────────────────────────────────────────

func (s *sheetMapperImpl) RowsToSetorans(rows [][]string) (out []models.Setoran, skipped []SkippedRow) {
	defer func() {
		if r := recover(); r != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Setoran", RowNumber: -1, Reason: fmt.Sprintf("panic: %v", r)})
		}
	}()
	for i := 1; i < len(rows); i++ {
		row := rows[i]
		rowNum := i + 1
		if isRowEmpty(row) {
			skipped = append(skipped, SkippedRow{Worksheet: "Setoran", RowNumber: rowNum, Reason: "empty row"})
			continue
		}
		tanggalStr := safeGet(row, 0)
		tanggal, err := parseDate(tanggalStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Setoran", RowNumber: rowNum, Reason: "invalid date: " + tanggalStr})
			continue
		}
		salesman := safeGet(row, 1)
		if salesman == "" {
			skipped = append(skipped, SkippedRow{Worksheet: "Setoran", RowNumber: rowNum, Reason: "missing required field: salesman"})
			continue
		}
		durasiStr := safeGet(row, 4)
		durasi, err := parseInt(durasiStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "Setoran", RowNumber: rowNum, Reason: fmt.Sprintf("invalid number at column 4: %s", durasiStr)})
			continue
		}
		out = append(out, models.Setoran{
			Tanggal:         tanggal,
			Salesman:        salesman,
			PulangKunjungan: safeGet(row, 2),
			SetoranKeKasir:  safeGet(row, 3),
			Durasi:          durasi,
			Bulan:           safeGet(row, 5),
		})
	}
	return
}

// ── RowsToWoWts ───────────────────────────────────────────────────────────────

func (s *sheetMapperImpl) RowsToWoWts(rows [][]string) (out []models.WoWt, skipped []SkippedRow) {
	defer func() {
		if r := recover(); r != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "WO-WT", RowNumber: -1, Reason: fmt.Sprintf("panic: %v", r)})
		}
	}()
	for i := 1; i < len(rows); i++ {
		row := rows[i]
		rowNum := i + 1
		if isRowEmpty(row) {
			skipped = append(skipped, SkippedRow{Worksheet: "WO-WT", RowNumber: rowNum, Reason: "empty row"})
			continue
		}
		tanggalStr := safeGet(row, 0)
		tanggal, err := parseDate(tanggalStr)
		if err != nil {
			skipped = append(skipped, SkippedRow{Worksheet: "WO-WT", RowNumber: rowNum, Reason: "invalid date: " + tanggalStr})
			continue
		}
		plant := safeGet(row, 1)
		if plant == "" {
			skipped = append(skipped, SkippedRow{Worksheet: "WO-WT", RowNumber: rowNum, Reason: "missing required field: plant"})
			continue
		}
		parseCol := func(col int) (float64, bool) {
			v, e := parseFloat(safeGet(row, col))
			if e != nil {
				skipped = append(skipped, SkippedRow{Worksheet: "WO-WT", RowNumber: rowNum, Reason: fmt.Sprintf("invalid number at column %d: %s", col, safeGet(row, col))})
				return 0, false
			}
			return v, true
		}
		zwp1, ok := parseCol(2)
		if !ok { continue }
		zwp2, ok := parseCol(3)
		if !ok { continue }
		zwp4, ok := parseCol(4)
		if !ok { continue }
		zwp5, ok := parseCol(5)
		if !ok { continue }
		global, ok := parseCol(6)
		if !ok { continue }
		out = append(out, models.WoWt{
			Tanggal: tanggal,
			Plant:   plant,
			ZWP1:    zwp1,
			ZWP2:    zwp2,
			ZWP4:    zwp4,
			ZWP5:    zwp5,
			Global:  global,
		})
	}
	return
}

// ── XxxToRow ──────────────────────────────────────────────────────────────────

// InboundToRow converts an Inbound struct to a sheet row.
func (s *sheetMapperImpl) InboundToRow(m *models.Inbound) []interface{} {
	return []interface{}{
		fmtDate(m.Tanggal),
		m.Shifting,
		m.NomorFO,
		m.Nopol,
		m.PlantPabrik,
		string(m.JenisBongkaran),
		m.TotalBox,
		m.NomorGR,
		m.TotalSlipsheet,
	}
}

// OutboundToRow converts an Outbound struct to a sheet row.
func (s *sheetMapperImpl) OutboundToRow(m *models.Outbound) []interface{} {
	return []interface{}{
		fmtDate(m.Tanggal),
		m.FreightOrder,
		m.MobilMuat,
		string(m.StatusFO),
		m.AssignJob,
		m.JamTerima,
		m.Status,
		m.SelesaiMuat,
		m.Hari,
		m.Putaran,
		m.STH2,
		m.JamRunning,
	}
}

// ReportDailyTransportToRow converts a ReportDailyTransport struct to a sheet row.
func (s *sheetMapperImpl) ReportDailyTransportToRow(m *models.ReportDailyTransport) []interface{} {
	return []interface{}{
		fmtDate(m.Tanggal),
		m.Division,
		m.ReportType,
		m.Qty,
	}
}

// ScanOutDCToRow converts a ScanOutDC struct to a sheet row.
func (s *sheetMapperImpl) ScanOutDCToRow(m *models.ScanOutDC) []interface{} {
	return []interface{}{
		fmtDate(m.Tanggal),
		m.Vendor,
		m.Nopol,
		m.Driver,
		m.JamScan,
		m.JamKeluar,
		m.Status,
	}
}

// ClaimVendorToRow converts a ClaimVendor struct to a sheet row.
func (s *sheetMapperImpl) ClaimVendorToRow(m *models.ClaimVendor) []interface{} {
	return []interface{}{
		fmtDate(m.Tanggal),
		m.Vendor,
		m.NomorClaim,
		m.Payment,
		m.Outstanding,
		m.Value,
		m.Status,
	}
}

// GantunganFakturToRow converts a GantunganFaktur struct to a sheet row.
func (s *sheetMapperImpl) GantunganFakturToRow(m *models.GantunganFaktur) []interface{} {
	return []interface{}{
		fmtDate(m.Tanggal),
		m.PayTerms,
		m.Customer,
		m.NamaToko,
		m.SDDocument,
		m.SalesDoc,
		m.NetValue,
		m.KeteranganTransport,
	}
}

// SetoranToRow converts a Setoran struct to a sheet row.
func (s *sheetMapperImpl) SetoranToRow(m *models.Setoran) []interface{} {
	return []interface{}{
		fmtDate(m.Tanggal),
		m.Salesman,
		m.PulangKunjungan,
		m.SetoranKeKasir,
		m.Durasi,
		m.Bulan,
	}
}

// WoWtToRow converts a WoWt struct to a sheet row.
func (s *sheetMapperImpl) WoWtToRow(m *models.WoWt) []interface{} {
	return []interface{}{
		fmtDate(m.Tanggal),
		m.Plant,
		m.ZWP1,
		m.ZWP2,
		m.ZWP4,
		m.ZWP5,
		m.Global,
	}
}
