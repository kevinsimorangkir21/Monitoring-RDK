package dto

import "time"

// CreateInboundRequest is the validated request body for POST /inbound.
type CreateInboundRequest struct {
	Tanggal        string `json:"tanggal"         binding:"required"`
	Shifting       string `json:"shifting"        binding:"omitempty,max=50"`
	NomorFO        string `json:"nomor_fo"        binding:"required,max=100"`
	Nopol          string `json:"nopol"           binding:"omitempty,max=20"`
	PlantPabrik    string `json:"plant_pabrik"    binding:"omitempty,max=100"`
	JenisBongkaran string `json:"jenis_bongkaran" binding:"required,oneof=SLIPSHEET CURAH"`
	TotalBox       int    `json:"total_box"       binding:"required,min=0"`
	NomorGR        string `json:"nomor_gr"        binding:"omitempty,max=100"`
	TotalSlipsheet int    `json:"total_slipsheet" binding:"omitempty,min=0"`
}

// UpdateInboundRequest is the validated request body for PUT /inbound/:id.
type UpdateInboundRequest struct {
	Tanggal        string `json:"tanggal"         binding:"omitempty"`
	Shifting       string `json:"shifting"        binding:"omitempty,max=50"`
	NomorFO        string `json:"nomor_fo"        binding:"omitempty,max=100"`
	Nopol          string `json:"nopol"           binding:"omitempty,max=20"`
	PlantPabrik    string `json:"plant_pabrik"    binding:"omitempty,max=100"`
	JenisBongkaran string `json:"jenis_bongkaran" binding:"omitempty,oneof=SLIPSHEET CURAH"`
	TotalBox       *int   `json:"total_box"       binding:"omitempty,min=0"`
	NomorGR        string `json:"nomor_gr"        binding:"omitempty,max=100"`
	TotalSlipsheet *int   `json:"total_slipsheet" binding:"omitempty,min=0"`
}

// InboundResponse is the safe public representation of an Inbound record.
type InboundResponse struct {
	ID             uint      `json:"id"`
	Tanggal        time.Time `json:"tanggal"`
	Shifting       string    `json:"shifting"`
	NomorFO        string    `json:"nomor_fo"`
	Nopol          string    `json:"nopol"`
	PlantPabrik    string    `json:"plant_pabrik"`
	JenisBongkaran string    `json:"jenis_bongkaran"`
	TotalBox       int       `json:"total_box"`
	NomorGR        string    `json:"nomor_gr"`
	TotalSlipsheet int       `json:"total_slipsheet"`
	CreatedBy      string    `json:"created_by"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
