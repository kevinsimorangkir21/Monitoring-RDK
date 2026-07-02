package models

import "time"

// StatusFO is an enum for outbound freight order status.
type StatusFO string

const (
	StatusFOMuatPagi StatusFO = "Muat Pagi"
	StatusFOMuatInap StatusFO = "Muat Inap"
)

// Outbound represents a single outbound freight order record.
type Outbound struct {
	ID           uint      `gorm:"primaryKey;autoIncrement"        json:"id"`
	Tanggal      time.Time `gorm:"type:date;not null;index"        json:"tanggal"`
	FreightOrder string    `gorm:"type:varchar(100);not null"      json:"freight_order"`
	MobilMuat    string    `gorm:"type:varchar(50)"                json:"mobil_muat"`
	StatusFO     StatusFO  `gorm:"type:enum('Muat Pagi','Muat Inap');not null" json:"status_fo"`
	AssignJob    string    `gorm:"type:varchar(100)"               json:"assign_job"`
	JamTerima    string    `gorm:"type:varchar(10)"                json:"jam_terima"`
	Status       string    `gorm:"type:varchar(50)"                json:"status"`
	SelesaiMuat  string    `gorm:"type:varchar(10)"                json:"selesai_muat"`
	Hari         string    `gorm:"type:varchar(20)"                json:"hari"`
	Putaran      int       `gorm:"default:0"                       json:"putaran"`
	STH2         string    `gorm:"column:sth2;type:varchar(20)"    json:"sth2"`
	JamRunning   string    `gorm:"type:varchar(20)"                json:"jam_running"`
	CreatedBy    string    `gorm:"type:varchar(36);not null;index" json:"created_by"`
	Creator      User      `gorm:"foreignKey:CreatedBy"            json:"creator,omitempty"`
	CreatedAt    time.Time `                                       json:"created_at"`
	UpdatedAt    time.Time `                                       json:"updated_at"`
}

func (Outbound) TableName() string { return "outbounds" }
