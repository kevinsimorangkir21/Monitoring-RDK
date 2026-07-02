package models

import "time"

// ClaimVendor tracks vendor claim documents and payment status.
type ClaimVendor struct {
	ID          uint      `gorm:"primaryKey;autoIncrement"        json:"id"`
	Tanggal     time.Time `gorm:"type:date;not null;index"        json:"tanggal"`
	Vendor      string    `gorm:"type:varchar(100);not null"      json:"vendor"`
	NomorClaim  string    `gorm:"type:varchar(100);not null"      json:"nomor_claim"`
	Payment     float64   `gorm:"type:decimal(18,2);default:0"    json:"payment"`
	Outstanding float64   `gorm:"type:decimal(18,2);default:0"    json:"outstanding"`
	Value       float64   `gorm:"type:decimal(18,2);default:0"    json:"value"`
	Status      string    `gorm:"type:varchar(50)"                json:"status"`
	CreatedBy   string    `gorm:"type:varchar(36);not null;index" json:"created_by"`
	Creator     User      `gorm:"foreignKey:CreatedBy"            json:"creator,omitempty"`
	CreatedAt   time.Time `                                       json:"created_at"`
	UpdatedAt   time.Time `                                       json:"updated_at"`
}

func (ClaimVendor) TableName() string { return "claim_vendors" }
