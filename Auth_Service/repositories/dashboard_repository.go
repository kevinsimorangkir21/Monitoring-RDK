package repositories

import (
	"context"

	"github.com/VYN2/Auth_Service/models"
	"gorm.io/gorm"
)

// DashboardStats holds aggregated KPI values for the dashboard.
type DashboardStats struct {
	TotalInbound       int64   `json:"total_inbound"`
	TotalOutbound      int64   `json:"total_outbound"`
	TotalGantunganDok  int64   `json:"total_gantungan_dokumen"`
	TotalGantunganNilai float64 `json:"total_gantungan_nominal"`
}

type DashboardRepository interface {
	Stats(ctx context.Context) (DashboardStats, error)
	RecentActivity(ctx context.Context, limit int) ([]models.ActivityLog, error)
}

type gormDashboardRepository struct{ db *gorm.DB }

func NewDashboardRepository(db *gorm.DB) DashboardRepository {
	return &gormDashboardRepository{db: db}
}

func (r *gormDashboardRepository) Stats(ctx context.Context) (DashboardStats, error) {
	var s DashboardStats
	db := r.db.WithContext(ctx)

	if err := db.Model(&models.Inbound{}).Count(&s.TotalInbound).Error; err != nil {
		return s, err
	}
	if err := db.Model(&models.Outbound{}).Count(&s.TotalOutbound).Error; err != nil {
		return s, err
	}
	type gfResult struct {
		TotalDokumen  int64
		TotalNetValue float64
	}
	var gf gfResult
	if err := db.Model(&models.GantunganFaktur{}).
		Select("COUNT(*) AS total_dokumen, COALESCE(SUM(net_value),0) AS total_net_value").
		Scan(&gf).Error; err != nil {
		return s, err
	}
	s.TotalGantunganDok = gf.TotalDokumen
	s.TotalGantunganNilai = gf.TotalNetValue
	return s, nil
}

func (r *gormDashboardRepository) RecentActivity(ctx context.Context, limit int) ([]models.ActivityLog, error) {
	var logs []models.ActivityLog
	err := r.db.WithContext(ctx).
		Preload("User").
		Order("created_at desc").
		Limit(limit).
		Find(&logs).Error
	return logs, err
}
