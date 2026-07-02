package models

import "time"

// ScanOutDC records a vehicle scan-out event at the Distribution Center.
type ScanOutDC struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"        json:"id"`
	Tanggal   time.Time `gorm:"type:date;not null;index"        json:"tanggal"`
	Vendor    string    `gorm:"type:varchar(100);not null"      json:"vendor"`
	Nopol     string    `gorm:"type:varchar(20);not null"       json:"nopol"`
	Driver    string    `gorm:"type:varchar(100)"               json:"driver"`
	JamScan   string    `gorm:"type:varchar(10)"                json:"jam_scan"`
	JamKeluar string    `gorm:"type:varchar(10)"                json:"jam_keluar"`
	Status    string    `gorm:"type:varchar(50)"                json:"status"`
	CreatedBy string    `gorm:"type:varchar(36);not null;index" json:"created_by"`
	Creator   User      `gorm:"foreignKey:CreatedBy"            json:"creator,omitempty"`
	CreatedAt time.Time `                                       json:"created_at"`
	UpdatedAt time.Time `                                       json:"updated_at"`
}

func (ScanOutDC) TableName() string { return "scan_out_dcs" }
