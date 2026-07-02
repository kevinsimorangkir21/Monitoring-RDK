package repositories

import (
	"context"
	"strings"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/utils"
	"gorm.io/gorm"
)

type ScanOutDCRepository interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.ScanOutDC, int64, error)
	FindByID(ctx context.Context, id uint) (*models.ScanOutDC, error)
	Create(ctx context.Context, m *models.ScanOutDC) error
	Update(ctx context.Context, m *models.ScanOutDC) error
	Delete(ctx context.Context, id uint) error
}

type gormScanOutDCRepository struct{ db *gorm.DB }

func NewScanOutDCRepository(db *gorm.DB) ScanOutDCRepository {
	return &gormScanOutDCRepository{db: db}
}

func (r *gormScanOutDCRepository) base(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Model(&models.ScanOutDC{})
}

func (r *gormScanOutDCRepository) List(ctx context.Context, f utils.ListFilter) ([]models.ScanOutDC, int64, error) {
	q := r.base(ctx)
	if f.Search != "" {
		like := "%" + strings.ToLower(f.Search) + "%"
		q = q.Where("LOWER(nopol) LIKE ? OR LOWER(vendor) LIKE ?", like, like)
	}
	q = utils.ApplyDateRange(q, "tanggal", f.TanggalAwal, f.TanggalAkhir)
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []models.ScanOutDC
	err := q.Order(f.Sort).Limit(f.Limit).Offset(utils.Offset(f.Page, f.Limit)).Find(&list).Error
	return list, total, err
}

func (r *gormScanOutDCRepository) FindByID(ctx context.Context, id uint) (*models.ScanOutDC, error) {
	var m models.ScanOutDC
	err := r.base(ctx).First(&m, id).Error
	return &m, err
}

func (r *gormScanOutDCRepository) Create(ctx context.Context, m *models.ScanOutDC) error {
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *gormScanOutDCRepository) Update(ctx context.Context, m *models.ScanOutDC) error {
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *gormScanOutDCRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.ScanOutDC{}, id).Error
}
