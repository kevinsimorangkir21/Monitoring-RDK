package repositories

import (
	"context"
	"strings"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/utils"
	"gorm.io/gorm"
)

type SetoranRepository interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.Setoran, int64, error)
	FindByID(ctx context.Context, id uint) (*models.Setoran, error)
	Create(ctx context.Context, m *models.Setoran) error
	Update(ctx context.Context, m *models.Setoran) error
	Delete(ctx context.Context, id uint) error
	AvgDurasi(ctx context.Context) (float64, error)
}

type gormSetoranRepository struct{ db *gorm.DB }

func NewSetoranRepository(db *gorm.DB) SetoranRepository {
	return &gormSetoranRepository{db: db}
}

func (r *gormSetoranRepository) base(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Model(&models.Setoran{})
}

func (r *gormSetoranRepository) List(ctx context.Context, f utils.ListFilter) ([]models.Setoran, int64, error) {
	q := r.base(ctx)
	if f.Search != "" {
		like := "%" + strings.ToLower(f.Search) + "%"
		q = q.Where("LOWER(salesman) LIKE ?", like)
	}
	q = utils.ApplyDateRange(q, "tanggal", f.TanggalAwal, f.TanggalAkhir)
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []models.Setoran
	err := q.Order(f.Sort).Limit(f.Limit).Offset(utils.Offset(f.Page, f.Limit)).Find(&list).Error
	return list, total, err
}

func (r *gormSetoranRepository) FindByID(ctx context.Context, id uint) (*models.Setoran, error) {
	var m models.Setoran
	err := r.base(ctx).First(&m, id).Error
	return &m, err
}

func (r *gormSetoranRepository) Create(ctx context.Context, m *models.Setoran) error {
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *gormSetoranRepository) Update(ctx context.Context, m *models.Setoran) error {
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *gormSetoranRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Setoran{}, id).Error
}

func (r *gormSetoranRepository) AvgDurasi(ctx context.Context) (float64, error) {
	var avg float64
	err := r.db.WithContext(ctx).
		Model(&models.Setoran{}).
		Select("COALESCE(AVG(durasi), 0)").
		Scan(&avg).Error
	return avg, err
}
