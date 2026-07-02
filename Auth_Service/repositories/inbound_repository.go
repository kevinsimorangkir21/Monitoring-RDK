package repositories

import (
	"context"
	"strings"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/utils"
	"gorm.io/gorm"
)

type InboundRepository interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.Inbound, int64, error)
	FindByID(ctx context.Context, id uint) (*models.Inbound, error)
	Create(ctx context.Context, m *models.Inbound) error
	Update(ctx context.Context, m *models.Inbound) error
	Delete(ctx context.Context, id uint) error
	Count(ctx context.Context) (int64, error)
}

type gormInboundRepository struct{ db *gorm.DB }

func NewInboundRepository(db *gorm.DB) InboundRepository {
	return &gormInboundRepository{db: db}
}

func (r *gormInboundRepository) base(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Model(&models.Inbound{})
}

func (r *gormInboundRepository) List(ctx context.Context, f utils.ListFilter) ([]models.Inbound, int64, error) {
	q := r.base(ctx)
	if f.Search != "" {
		like := "%" + strings.ToLower(f.Search) + "%"
		q = q.Where("LOWER(nomor_fo) LIKE ? OR LOWER(nopol) LIKE ?", like, like)
	}
	q = utils.ApplyDateRange(q, "tanggal", f.TanggalAwal, f.TanggalAkhir)

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var list []models.Inbound
	err := q.Order(f.Sort).
		Limit(f.Limit).
		Offset(utils.Offset(f.Page, f.Limit)).
		Find(&list).Error
	return list, total, err
}

func (r *gormInboundRepository) FindByID(ctx context.Context, id uint) (*models.Inbound, error) {
	var m models.Inbound
	err := r.base(ctx).First(&m, id).Error
	return &m, err
}

func (r *gormInboundRepository) Create(ctx context.Context, m *models.Inbound) error {
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *gormInboundRepository) Update(ctx context.Context, m *models.Inbound) error {
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *gormInboundRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Inbound{}, id).Error
}

func (r *gormInboundRepository) Count(ctx context.Context) (int64, error) {
	var n int64
	err := r.base(ctx).Count(&n).Error
	return n, err
}
