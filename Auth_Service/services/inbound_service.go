package services

import (
	"context"
	"fmt"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/VYN2/Auth_Service/utils"
)

type InboundService interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.Inbound, int64, error)
	GetByID(ctx context.Context, id uint) (*models.Inbound, error)
	Create(ctx context.Context, m *models.Inbound, actorName, actorID, ip string) error
	Update(ctx context.Context, m *models.Inbound, actorName, actorID, ip string) error
	Delete(ctx context.Context, id uint, actorName, actorID, ip string) error
}

type inboundService struct {
	repo    repositories.InboundRepository
	actRepo repositories.ActivityLogRepository
}

func NewInboundService(repo repositories.InboundRepository, actRepo repositories.ActivityLogRepository) InboundService {
	return &inboundService{repo: repo, actRepo: actRepo}
}

func (s *inboundService) List(ctx context.Context, f utils.ListFilter) ([]models.Inbound, int64, error) {
	return s.repo.List(ctx, f)
}

func (s *inboundService) GetByID(ctx context.Context, id uint) (*models.Inbound, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *inboundService) Create(ctx context.Context, m *models.Inbound, actorName, actorID, ip string) error {
	if err := s.repo.Create(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID:      actorID,
		Module:      "Inbound",
		Action:      "create",
		Description: fmt.Sprintf("%s menambahkan data Inbound (FO: %s)", actorName, m.NomorFO),
		IPAddress:   ip,
	})
	return nil
}

func (s *inboundService) Update(ctx context.Context, m *models.Inbound, actorName, actorID, ip string) error {
	if err := s.repo.Update(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID:      actorID,
		Module:      "Inbound",
		Action:      "update",
		Description: fmt.Sprintf("%s mengubah data Inbound (FO: %s)", actorName, m.NomorFO),
		IPAddress:   ip,
	})
	return nil
}

func (s *inboundService) Delete(ctx context.Context, id uint, actorName, actorID, ip string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID:      actorID,
		Module:      "Inbound",
		Action:      "delete",
		Description: fmt.Sprintf("%s menghapus data Inbound (ID: %d)", actorName, id),
		IPAddress:   ip,
	})
	return nil
}
