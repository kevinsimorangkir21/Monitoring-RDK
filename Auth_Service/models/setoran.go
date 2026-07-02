package models

import "time"

// Setoran records a salesman cash deposit session.
// Average durasi is computed via AVG(durasi) query — never stored as an aggregate.
type Setoran struct {
	ID               uint      `gorm:"primaryKey;autoIncrement"        json:"id"`
	Tanggal          time.Time `gorm:"type:date;not null;index"        json:"tanggal"`
	Salesman         string    `gorm:"type:varchar(100);not null"      json:"salesman"`
	PulangKunjungan  string    `gorm:"type:varchar(10)"                json:"pulang_kunjungan"`
	SetoranKeKasir   string    `gorm:"type:varchar(10)"                json:"setoran_ke_kasir"`
	Durasi           int       `gorm:"default:0"                       json:"durasi"`
	Bulan            string    `gorm:"type:varchar(20)"                json:"bulan"`
	CreatedBy        string    `gorm:"type:varchar(36);not null;index" json:"created_by"`
	Creator          User      `gorm:"foreignKey:CreatedBy"            json:"creator,omitempty"`
	CreatedAt        time.Time `                                       json:"created_at"`
	UpdatedAt        time.Time `                                       json:"updated_at"`
}

func (Setoran) TableName() string { return "setorans" }
