package repositories

import (
	"context"
	"strings"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/utils"
	"gorm.io/gorm"
)

// GantunganFakturSummary holds aggregate query results for the dashboard.
type GantunganFakturSummary struct {
	TotalDokumen  int64   `json:"total_dokumen"`
	TotalNetValue float64 `json:"total_net_value"`
}

type GantunganFakturRepository interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.GantunganFaktur, int64, error)
	FindByID(ctx context.Context, id uint) (*models.GantunganFaktur, error)
	Create(ctx context.Context, m *models.GantunganFaktur) error
	Update(ctx context.Context, m *models.GantunganFaktur) error
	Delete(ctx context.Context, id uint) error
	Summary(ctx context.Context) (GantunganFakturSummary, error)
}

type gormGantunganFakturRepository struct{ db *gorm.DB }

func NewGantunganFakturRepository(db *gorm.DB) GantunganFakturRepository {
	return &gormGantunganFakturRepository{db: db}
}

func (r *gormGantunganFakturRepository) base(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Model(&models.GantunganFaktur{})
}

func (r *gormGantunganFakturRepository) List(ctx context.Context, f utils.ListFilter) ([]models.GantunganFaktur, int64, error) {
	q := r.base(ctx)
	if f.Search != "" {
		like := "%" + strings.ToLower(f.Search) + "%"
		q = q.Where("LOWER(customer) LIKE ? OR LOWER(nama_toko) LIKE ? OR LOWER(sales_doc) LIKE ?", like, like, like)
	}
	q = utils.ApplyDateRange(q, "tanggal", f.TanggalAwal, f.TanggalAkhir)
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []models.GantunganFaktur
	err := q.Order(f.Sort).Limit(f.Limit).Offset(utils.Offset(f.Page, f.Limit)).Find(&list).Error
	return list, total, err
}

func (r *gormGantunganFakturRepository) FindByID(ctx context.Context, id uint) (*models.GantunganFaktur, error) {
	var m models.GantunganFaktur
	err := r.base(ctx).First(&m, id).Error
	return &m, err
}

func (r *gormGantunganFakturRepository) Create(ctx context.Context, m *models.GantunganFaktur) error {
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *gormGantunganFakturRepository) Update(ctx context.Context, m *models.GantunganFaktur) error {
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *gormGantunganFakturRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.GantunganFaktur{}, id).Error
}

func (r *gormGantunganFakturRepository) Summary(ctx context.Context) (GantunganFakturSummary, error) {
	var s GantunganFakturSummary
	err := r.db.WithContext(ctx).
		Model(&models.GantunganFaktur{}).
		Select("COUNT(*) AS total_dokumen, COALESCE(SUM(net_value), 0) AS total_net_value").
		Scan(&s).Error
	return s, err
}
