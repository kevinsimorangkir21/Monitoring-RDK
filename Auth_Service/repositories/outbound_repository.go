package repositories

import (
	"context"
	"strings"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/utils"
	"gorm.io/gorm"
)

type OutboundRepository interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.Outbound, int64, error)
	FindByID(ctx context.Context, id uint) (*models.Outbound, error)
	Create(ctx context.Context, m *models.Outbound) error
	Update(ctx context.Context, m *models.Outbound) error
	Delete(ctx context.Context, id uint) error
	Count(ctx context.Context) (int64, error)
}

type gormOutboundRepository struct{ db *gorm.DB }

func NewOutboundRepository(db *gorm.DB) OutboundRepository {
	return &gormOutboundRepository{db: db}
}

func (r *gormOutboundRepository) base(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Model(&models.Outbound{})
}

func (r *gormOutboundRepository) List(ctx context.Context, f utils.ListFilter) ([]models.Outbound, int64, error) {
	q := r.base(ctx)
	if f.Search != "" {
		like := "%" + strings.ToLower(f.Search) + "%"
		q = q.Where("LOWER(freight_order) LIKE ? OR LOWER(mobil_muat) LIKE ?", like, like)
	}
	q = utils.ApplyDateRange(q, "tanggal", f.TanggalAwal, f.TanggalAkhir)
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []models.Outbound
	err := q.Order(f.Sort).Limit(f.Limit).Offset(utils.Offset(f.Page, f.Limit)).Find(&list).Error
	return list, total, err
}

func (r *gormOutboundRepository) FindByID(ctx context.Context, id uint) (*models.Outbound, error) {
	var m models.Outbound
	err := r.base(ctx).First(&m, id).Error
	return &m, err
}

func (r *gormOutboundRepository) Create(ctx context.Context, m *models.Outbound) error {
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *gormOutboundRepository) Update(ctx context.Context, m *models.Outbound) error {
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *gormOutboundRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Outbound{}, id).Error
}

func (r *gormOutboundRepository) Count(ctx context.Context) (int64, error) {
	var n int64
	err := r.base(ctx).Count(&n).Error
	return n, err
}
