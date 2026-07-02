package models

import "time"

// ReportDailyTransport is a daily operational report per division.
type ReportDailyTransport struct {
	ID         uint      `gorm:"primaryKey;autoIncrement"        json:"id"`
	Tanggal    time.Time `gorm:"type:date;not null;index"        json:"tanggal"`
	Division   string    `gorm:"type:varchar(100);not null"      json:"division"`
	ReportType string    `gorm:"type:varchar(100);not null"      json:"report_type"`
	Qty        float64   `gorm:"type:decimal(15,2);default:0"    json:"qty"`
	CreatedBy  string    `gorm:"type:varchar(36);not null;index" json:"created_by"`
	Creator    User      `gorm:"foreignKey:CreatedBy"            json:"creator,omitempty"`
	CreatedAt  time.Time `                                       json:"created_at"`
	UpdatedAt  time.Time `                                       json:"updated_at"`
}

func (ReportDailyTransport) TableName() string { return "report_daily_transports" }
