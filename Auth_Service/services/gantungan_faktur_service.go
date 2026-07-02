package services

import (
	"context"
	"fmt"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/VYN2/Auth_Service/utils"
)

type GantunganFakturService interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.GantunganFaktur, int64, error)
	GetByID(ctx context.Context, id uint) (*models.GantunganFaktur, error)
	Create(ctx context.Context, m *models.GantunganFaktur, actorName, actorID, ip string) error
	Update(ctx context.Context, m *models.GantunganFaktur, actorName, actorID, ip string) error
	Delete(ctx context.Context, id uint, actorName, actorID, ip string) error
	Summary(ctx context.Context) (repositories.GantunganFakturSummary, error)
}

type gantunganFakturService struct {
	repo    repositories.GantunganFakturRepository
	actRepo repositories.ActivityLogRepository
}

func NewGantunganFakturService(repo repositories.GantunganFakturRepository, actRepo repositories.ActivityLogRepository) GantunganFakturService {
	return &gantunganFakturService{repo: repo, actRepo: actRepo}
}

func (s *gantunganFakturService) List(ctx context.Context, f utils.ListFilter) ([]models.GantunganFaktur, int64, error) {
	return s.repo.List(ctx, f)
}

func (s *gantunganFakturService) GetByID(ctx context.Context, id uint) (*models.GantunganFaktur, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *gantunganFakturService) Create(ctx context.Context, m *models.GantunganFaktur, actorName, actorID, ip string) error {
	if err := s.repo.Create(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Gantungan Faktur", Action: "create",
		Description: fmt.Sprintf("%s menambahkan Gantungan Faktur (%s)", actorName, m.SalesDoc),
		IPAddress:   ip,
	})
	return nil
}

func (s *gantunganFakturService) Update(ctx context.Context, m *models.GantunganFaktur, actorName, actorID, ip string) error {
	if err := s.repo.Update(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Gantungan Faktur", Action: "update",
		Description: fmt.Sprintf("%s mengubah Gantungan Faktur (%s)", actorName, m.SalesDoc),
		IPAddress:   ip,
	})
	return nil
}

func (s *gantunganFakturService) Delete(ctx context.Context, id uint, actorName, actorID, ip string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Gantungan Faktur", Action: "delete",
		Description: fmt.Sprintf("%s menghapus Gantungan Faktur (ID: %d)", actorName, id),
		IPAddress:   ip,
	})
	return nil
}

func (s *gantunganFakturService) Summary(ctx context.Context) (repositories.GantunganFakturSummary, error) {
	return s.repo.Summary(ctx)
}
