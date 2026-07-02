package models

import "time"

// WoWt holds daily WO/WT figures per plant.
type WoWt struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"        json:"id"`
	Tanggal   time.Time `gorm:"type:date;not null;index"        json:"tanggal"`
	Plant     string    `gorm:"type:varchar(100);not null"      json:"plant"`
	ZWP1      float64   `gorm:"column:zwp1;type:decimal(15,2);default:0" json:"zwp1"`
	ZWP2      float64   `gorm:"column:zwp2;type:decimal(15,2);default:0" json:"zwp2"`
	ZWP4      float64   `gorm:"column:zwp4;type:decimal(15,2);default:0" json:"zwp4"`
	ZWP5      float64   `gorm:"column:zwp5;type:decimal(15,2);default:0" json:"zwp5"`
	Global    float64   `gorm:"type:decimal(15,2);default:0"    json:"global"`
	CreatedBy string    `gorm:"type:varchar(36);not null;index" json:"created_by"`
	Creator   User      `gorm:"foreignKey:CreatedBy"            json:"creator,omitempty"`
	CreatedAt time.Time `                                       json:"created_at"`
	UpdatedAt time.Time `                                       json:"updated_at"`
}

func (WoWt) TableName() string { return "wo_wts" }
