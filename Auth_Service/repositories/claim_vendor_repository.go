package repositories

import (
	"context"
	"strings"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/utils"
	"gorm.io/gorm"
)

type ClaimVendorRepository interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.ClaimVendor, int64, error)
	FindByID(ctx context.Context, id uint) (*models.ClaimVendor, error)
	Create(ctx context.Context, m *models.ClaimVendor) error
	Update(ctx context.Context, m *models.ClaimVendor) error
	Delete(ctx context.Context, id uint) error
}

type gormClaimVendorRepository struct{ db *gorm.DB }

func NewClaimVendorRepository(db *gorm.DB) ClaimVendorRepository {
	return &gormClaimVendorRepository{db: db}
}

func (r *gormClaimVendorRepository) base(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Model(&models.ClaimVendor{})
}

func (r *gormClaimVendorRepository) List(ctx context.Context, f utils.ListFilter) ([]models.ClaimVendor, int64, error) {
	q := r.base(ctx)
	if f.Search != "" {
		like := "%" + strings.ToLower(f.Search) + "%"
		q = q.Where("LOWER(vendor) LIKE ? OR LOWER(nomor_claim) LIKE ?", like, like)
	}
	q = utils.ApplyDateRange(q, "tanggal", f.TanggalAwal, f.TanggalAkhir)
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []models.ClaimVendor
	err := q.Order(f.Sort).Limit(f.Limit).Offset(utils.Offset(f.Page, f.Limit)).Find(&list).Error
	return list, total, err
}

func (r *gormClaimVendorRepository) FindByID(ctx context.Context, id uint) (*models.ClaimVendor, error) {
	var m models.ClaimVendor
	err := r.base(ctx).First(&m, id).Error
	return &m, err
}

func (r *gormClaimVendorRepository) Create(ctx context.Context, m *models.ClaimVendor) error {
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *gormClaimVendorRepository) Update(ctx context.Context, m *models.ClaimVendor) error {
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *gormClaimVendorRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.ClaimVendor{}, id).Error
}
