package services

import (
	"context"
	"fmt"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/VYN2/Auth_Service/utils"
)

type ScanOutDCService interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.ScanOutDC, int64, error)
	GetByID(ctx context.Context, id uint) (*models.ScanOutDC, error)
	Create(ctx context.Context, m *models.ScanOutDC, actorName, actorID, ip string) error
	Update(ctx context.Context, m *models.ScanOutDC, actorName, actorID, ip string) error
	Delete(ctx context.Context, id uint, actorName, actorID, ip string) error
}

type scanOutDCService struct {
	repo    repositories.ScanOutDCRepository
	actRepo repositories.ActivityLogRepository
}

func NewScanOutDCService(repo repositories.ScanOutDCRepository, actRepo repositories.ActivityLogRepository) ScanOutDCService {
	return &scanOutDCService{repo: repo, actRepo: actRepo}
}

func (s *scanOutDCService) List(ctx context.Context, f utils.ListFilter) ([]models.ScanOutDC, int64, error) {
	return s.repo.List(ctx, f)
}

func (s *scanOutDCService) GetByID(ctx context.Context, id uint) (*models.ScanOutDC, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *scanOutDCService) Create(ctx context.Context, m *models.ScanOutDC, actorName, actorID, ip string) error {
	if err := s.repo.Create(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Scan Out DC", Action: "create",
		Description: fmt.Sprintf("%s menambahkan Scan Out DC (%s)", actorName, m.Nopol),
		IPAddress:   ip,
	})
	return nil
}

func (s *scanOutDCService) Update(ctx context.Context, m *models.ScanOutDC, actorName, actorID, ip string) error {
	if err := s.repo.Update(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Scan Out DC", Action: "update",
		Description: fmt.Sprintf("%s mengubah Scan Out DC (%s)", actorName, m.Nopol),
		IPAddress:   ip,
	})
	return nil
}

func (s *scanOutDCService) Delete(ctx context.Context, id uint, actorName, actorID, ip string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Scan Out DC", Action: "delete",
		Description: fmt.Sprintf("%s menghapus Scan Out DC (ID: %d)", actorName, id),
		IPAddress:   ip,
	})
	return nil
}
