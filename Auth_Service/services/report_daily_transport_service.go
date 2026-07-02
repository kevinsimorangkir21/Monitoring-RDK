package services

import (
	"context"
	"fmt"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/VYN2/Auth_Service/utils"
)

type ReportDailyTransportService interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.ReportDailyTransport, int64, error)
	GetByID(ctx context.Context, id uint) (*models.ReportDailyTransport, error)
	Create(ctx context.Context, m *models.ReportDailyTransport, actorName, actorID, ip string) error
	Update(ctx context.Context, m *models.ReportDailyTransport, actorName, actorID, ip string) error
	Delete(ctx context.Context, id uint, actorName, actorID, ip string) error
}

type reportDailyTransportService struct {
	repo    repositories.ReportDailyTransportRepository
	actRepo repositories.ActivityLogRepository
}

func NewReportDailyTransportService(repo repositories.ReportDailyTransportRepository, actRepo repositories.ActivityLogRepository) ReportDailyTransportService {
	return &reportDailyTransportService{repo: repo, actRepo: actRepo}
}

func (s *reportDailyTransportService) List(ctx context.Context, f utils.ListFilter) ([]models.ReportDailyTransport, int64, error) {
	return s.repo.List(ctx, f)
}

func (s *reportDailyTransportService) GetByID(ctx context.Context, id uint) (*models.ReportDailyTransport, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *reportDailyTransportService) Create(ctx context.Context, m *models.ReportDailyTransport, actorName, actorID, ip string) error {
	if err := s.repo.Create(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Report Daily", Action: "create",
		Description: fmt.Sprintf("%s menambahkan Report Daily (%s)", actorName, m.Division),
		IPAddress:   ip,
	})
	return nil
}

func (s *reportDailyTransportService) Update(ctx context.Context, m *models.ReportDailyTransport, actorName, actorID, ip string) error {
	if err := s.repo.Update(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Report Daily", Action: "update",
		Description: fmt.Sprintf("%s mengubah Report Daily (ID: %d)", actorName, m.ID),
		IPAddress:   ip,
	})
	return nil
}

func (s *reportDailyTransportService) Delete(ctx context.Context, id uint, actorName, actorID, ip string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Report Daily", Action: "delete",
		Description: fmt.Sprintf("%s menghapus Report Daily (ID: %d)", actorName, id),
		IPAddress:   ip,
	})
	return nil
}
