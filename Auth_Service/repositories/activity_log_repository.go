package repositories

import (
	"context"

	"github.com/VYN2/Auth_Service/models"
	"gorm.io/gorm"
)

type ActivityLogRepository interface {
	Create(ctx context.Context, log *models.ActivityLog) error
	ListByUser(ctx context.Context, userID string, limit int) ([]models.ActivityLog, error)
	ListRecent(ctx context.Context, limit int) ([]models.ActivityLog, error)
}

type gormActivityLogRepository struct{ db *gorm.DB }

func NewActivityLogRepository(db *gorm.DB) ActivityLogRepository {
	return &gormActivityLogRepository{db: db}
}

func (r *gormActivityLogRepository) Create(ctx context.Context, log *models.ActivityLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

func (r *gormActivityLogRepository) ListByUser(ctx context.Context, userID string, limit int) ([]models.ActivityLog, error) {
	var logs []models.ActivityLog
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at desc").
		Limit(limit).
		Find(&logs).Error
	return logs, err
}

func (r *gormActivityLogRepository) ListRecent(ctx context.Context, limit int) ([]models.ActivityLog, error) {
	var logs []models.ActivityLog
	err := r.db.WithContext(ctx).
		Preload("User").
		Order("created_at desc").
		Limit(limit).
		Find(&logs).Error
	return logs, err
}
