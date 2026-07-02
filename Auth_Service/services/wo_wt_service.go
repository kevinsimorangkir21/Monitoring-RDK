package services

import (
	"context"
	"fmt"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/VYN2/Auth_Service/utils"
)

type WoWtService interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.WoWt, int64, error)
	GetByID(ctx context.Context, id uint) (*models.WoWt, error)
	Create(ctx context.Context, m *models.WoWt, actorName, actorID, ip string) error
	Update(ctx context.Context, m *models.WoWt, actorName, actorID, ip string) error
	Delete(ctx context.Context, id uint, actorName, actorID, ip string) error
}

type woWtService struct {
	repo    repositories.WoWtRepository
	actRepo repositories.ActivityLogRepository
}

func NewWoWtService(repo repositories.WoWtRepository, actRepo repositories.ActivityLogRepository) WoWtService {
	return &woWtService{repo: repo, actRepo: actRepo}
}

func (s *woWtService) List(ctx context.Context, f utils.ListFilter) ([]models.WoWt, int64, error) {
	return s.repo.List(ctx, f)
}

func (s *woWtService) GetByID(ctx context.Context, id uint) (*models.WoWt, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *woWtService) Create(ctx context.Context, m *models.WoWt, actorName, actorID, ip string) error {
	if err := s.repo.Create(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "WO-WT", Action: "create",
		Description: fmt.Sprintf("%s menambahkan WO-WT (%s)", actorName, m.Plant),
		IPAddress:   ip,
	})
	return nil
}

func (s *woWtService) Update(ctx context.Context, m *models.WoWt, actorName, actorID, ip string) error {
	if err := s.repo.Update(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "WO-WT", Action: "update",
		Description: fmt.Sprintf("%s mengubah WO-WT (ID: %d)", actorName, m.ID),
		IPAddress:   ip,
	})
	return nil
}

func (s *woWtService) Delete(ctx context.Context, id uint, actorName, actorID, ip string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "WO-WT", Action: "delete",
		Description: fmt.Sprintf("%s menghapus WO-WT (ID: %d)", actorName, id),
		IPAddress:   ip,
	})
	return nil
}
