package services

import (
	"context"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/repositories"
)

type DashboardService interface {
	Stats(ctx context.Context) (repositories.DashboardStats, error)
	RecentActivity(ctx context.Context, limit int) ([]models.ActivityLog, error)
}

type dashboardService struct {
	repo repositories.DashboardRepository
}

func NewDashboardService(repo repositories.DashboardRepository) DashboardService {
	return &dashboardService{repo: repo}
}

func (s *dashboardService) Stats(ctx context.Context) (repositories.DashboardStats, error) {
	return s.repo.Stats(ctx)
}

func (s *dashboardService) RecentActivity(ctx context.Context, limit int) ([]models.ActivityLog, error) {
	if limit <= 0 {
		limit = 10
	}
	return s.repo.RecentActivity(ctx, limit)
}
