package models

import "time"

// JenisBongkaran is an enum for inbound unloading type.
type JenisBongkaran string

const (
	JenisBongkaranSlipsheet JenisBongkaran = "SLIPSHEET"
	JenisBongkaranCurah     JenisBongkaran = "CURAH"
)

// Inbound represents a single inbound record.
type Inbound struct {
	ID             uint           `gorm:"primaryKey;autoIncrement"        json:"id"`
	Tanggal        time.Time      `gorm:"type:date;not null;index"        json:"tanggal"`
	Shifting       string         `gorm:"type:varchar(50)"                json:"shifting"`
	NomorFO        string         `gorm:"type:varchar(100);not null"      json:"nomor_fo"`
	Nopol          string         `gorm:"type:varchar(20)"                json:"nopol"`
	PlantPabrik    string         `gorm:"type:varchar(100)"               json:"plant_pabrik"`
	JenisBongkaran JenisBongkaran `gorm:"type:enum('SLIPSHEET','CURAH');not null" json:"jenis_bongkaran"`
	TotalBox       int            `gorm:"not null;default:0"              json:"total_box"`
	NomorGR        string         `gorm:"type:varchar(100)"               json:"nomor_gr"`
	TotalSlipsheet int            `gorm:"default:0"                       json:"total_slipsheet"`
	CreatedBy      string         `gorm:"type:varchar(36);not null;index" json:"created_by"`
	Creator        User           `gorm:"foreignKey:CreatedBy"            json:"creator,omitempty"`
	CreatedAt      time.Time      `                                       json:"created_at"`
	UpdatedAt      time.Time      `                                       json:"updated_at"`
}

func (Inbound) TableName() string { return "inbounds" }
