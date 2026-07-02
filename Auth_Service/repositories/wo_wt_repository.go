package repositories

import (
	"context"
	"strings"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/utils"
	"gorm.io/gorm"
)

type WoWtRepository interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.WoWt, int64, error)
	FindByID(ctx context.Context, id uint) (*models.WoWt, error)
	Create(ctx context.Context, m *models.WoWt) error
	Update(ctx context.Context, m *models.WoWt) error
	Delete(ctx context.Context, id uint) error
}

type gormWoWtRepository struct{ db *gorm.DB }

func NewWoWtRepository(db *gorm.DB) WoWtRepository {
	return &gormWoWtRepository{db: db}
}

func (r *gormWoWtRepository) base(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Model(&models.WoWt{})
}

func (r *gormWoWtRepository) List(ctx context.Context, f utils.ListFilter) ([]models.WoWt, int64, error) {
	q := r.base(ctx)
	if f.Search != "" {
		like := "%" + strings.ToLower(f.Search) + "%"
		q = q.Where("LOWER(plant) LIKE ?", like)
	}
	q = utils.ApplyDateRange(q, "tanggal", f.TanggalAwal, f.TanggalAkhir)
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []models.WoWt
	err := q.Order(f.Sort).Limit(f.Limit).Offset(utils.Offset(f.Page, f.Limit)).Find(&list).Error
	return list, total, err
}

func (r *gormWoWtRepository) FindByID(ctx context.Context, id uint) (*models.WoWt, error) {
	var m models.WoWt
	err := r.base(ctx).First(&m, id).Error
	return &m, err
}

func (r *gormWoWtRepository) Create(ctx context.Context, m *models.WoWt) error {
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *gormWoWtRepository) Update(ctx context.Context, m *models.WoWt) error {
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *gormWoWtRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.WoWt{}, id).Error
}
