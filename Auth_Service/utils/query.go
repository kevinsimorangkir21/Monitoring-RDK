package utils

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

// ListFilter holds standard list query parameters shared across all modules.
type ListFilter struct {
	Search       string
	TanggalAwal  string // "YYYY-MM-DD"
	TanggalAkhir string // "YYYY-MM-DD"
	Sort         string // e.g. "tanggal desc" — sanitized via AllowedSortCols
	Page         int
	Limit        int
}

// allowedSortCols is the whitelist of columns that may appear in ORDER BY.
// Add new columns here when needed — never pass user input directly.
var allowedSortCols = map[string]bool{
	"id": true, "tanggal": true, "created_at": true, "updated_at": true,
	"nomor_fo": true, "nopol": true, "vendor": true, "salesman": true,
	"freight_order": true, "customer": true, "nomor_claim": true,
	"net_value": true, "division": true, "plant": true,
}

// sanitizeSort validates the sort string and returns a safe ORDER BY clause.
// It accepts "column" or "column asc/desc". Falls back to "created_at desc".
func sanitizeSort(raw string) string {
	if raw == "" {
		return "created_at desc"
	}
	parts := strings.Fields(strings.ToLower(strings.TrimSpace(raw)))
	if len(parts) == 0 {
		return "created_at desc"
	}
	col := parts[0]
	if !allowedSortCols[col] {
		return "created_at desc"
	}
	dir := "asc"
	if len(parts) > 1 && parts[1] == "desc" {
		dir = "desc"
	}
	return fmt.Sprintf("%s %s", col, dir)
}

// ParseListFilter builds a ListFilter from raw string map (e.g. from query params).
func ParseListFilter(q map[string]string) ListFilter {
	f := ListFilter{
		Search:       q["search"],
		TanggalAwal:  q["tanggal_awal"],
		TanggalAkhir: q["tanggal_akhir"],
		Sort:         sanitizeSort(q["sort"]),
		Page:         1,
		Limit:        10,
	}
	if p, err := strconv.Atoi(q["page"]); err == nil && p > 0 {
		f.Page = p
	}
	if l, err := strconv.Atoi(q["limit"]); err == nil && l > 0 && l <= 100 {
		f.Limit = l
	}
	return f
}

// ApplyDateRange applies tanggal_awal / tanggal_akhir filters on the given
// column to a GORM scope.
func ApplyDateRange(db *gorm.DB, col, awal, akhir string) *gorm.DB {
	if awal != "" {
		if t, err := time.Parse("2006-01-02", awal); err == nil {
			db = db.Where(col+" >= ?", t)
		}
	}
	if akhir != "" {
		if t, err := time.Parse("2006-01-02", akhir); err == nil {
			db = db.Where(col+" <= ?", t)
		}
	}
	return db
}

// Offset returns the GORM offset for a given page and limit.
func Offset(page, limit int) int {
	if page < 1 {
		page = 1
	}
	return (page - 1) * limit
}

// PaginationMeta is embedded in every list response.
type PaginationMeta struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	TotalItems int64 `json:"total_items"`
	TotalPages int   `json:"total_pages"`
}

// BuildMeta constructs PaginationMeta from raw counts.
func BuildMeta(page, limit int, total int64) PaginationMeta {
	tp := int(total) / limit
	if int(total)%limit != 0 {
		tp++
	}
	return PaginationMeta{Page: page, Limit: limit, TotalItems: total, TotalPages: tp}
}
