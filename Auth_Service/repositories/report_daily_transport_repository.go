package repositories

import (
	"context"
	"strings"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/utils"
	"gorm.io/gorm"
)

type ReportDailyTransportRepository interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.ReportDailyTransport, int64, error)
	FindByID(ctx context.Context, id uint) (*models.ReportDailyTransport, error)
	Create(ctx context.Context, m *models.ReportDailyTransport) error
	Update(ctx context.Context, m *models.ReportDailyTransport) error
	Delete(ctx context.Context, id uint) error
}

type gormReportDailyTransportRepository struct{ db *gorm.DB }

func NewReportDailyTransportRepository(db *gorm.DB) ReportDailyTransportRepository {
	return &gormReportDailyTransportRepository{db: db}
}

func (r *gormReportDailyTransportRepository) base(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Model(&models.ReportDailyTransport{})
}

func (r *gormReportDailyTransportRepository) List(ctx context.Context, f utils.ListFilter) ([]models.ReportDailyTransport, int64, error) {
	q := r.base(ctx)
	if f.Search != "" {
		like := "%" + strings.ToLower(f.Search) + "%"
		q = q.Where("LOWER(division) LIKE ? OR LOWER(report_type) LIKE ?", like, like)
	}
	q = utils.ApplyDateRange(q, "tanggal", f.TanggalAwal, f.TanggalAkhir)
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []models.ReportDailyTransport
	err := q.Order(f.Sort).Limit(f.Limit).Offset(utils.Offset(f.Page, f.Limit)).Find(&list).Error
	return list, total, err
}

func (r *gormReportDailyTransportRepository) FindByID(ctx context.Context, id uint) (*models.ReportDailyTransport, error) {
	var m models.ReportDailyTransport
	err := r.base(ctx).First(&m, id).Error
	return &m, err
}

func (r *gormReportDailyTransportRepository) Create(ctx context.Context, m *models.ReportDailyTransport) error {
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *gormReportDailyTransportRepository) Update(ctx context.Context, m *models.ReportDailyTransport) error {
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *gormReportDailyTransportRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.ReportDailyTransport{}, id).Error
}
