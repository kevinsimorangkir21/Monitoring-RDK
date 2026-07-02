package models

import "time"

// GantunganFaktur is an outstanding invoice record.
// Total dokumen and nominal are derived via COUNT/SUM queries — never stored.
type GantunganFaktur struct {
	ID                  uint      `gorm:"primaryKey;autoIncrement"        json:"id"`
	Tanggal             time.Time `gorm:"type:date;not null;index"        json:"tanggal"`
	PayTerms            string    `gorm:"type:varchar(100)"               json:"pay_terms"`
	Customer            string    `gorm:"type:varchar(200);not null"      json:"customer"`
	NamaToko            string    `gorm:"type:varchar(200)"               json:"nama_toko"`
	SDDocument          string    `gorm:"column:sd_document;type:varchar(100)" json:"sd_document"`
	SalesDoc            string    `gorm:"type:varchar(100)"               json:"sales_doc"`
	NetValue            float64   `gorm:"type:decimal(18,2);default:0"    json:"net_value"`
	KeteranganTransport string    `gorm:"type:text"                       json:"keterangan_transport"`
	CreatedBy           string    `gorm:"type:varchar(36);not null;index" json:"created_by"`
	Creator             User      `gorm:"foreignKey:CreatedBy"            json:"creator,omitempty"`
	CreatedAt           time.Time `                                       json:"created_at"`
	UpdatedAt           time.Time `                                       json:"updated_at"`
}

func (GantunganFaktur) TableName() string { return "gantungan_fakturs" }
