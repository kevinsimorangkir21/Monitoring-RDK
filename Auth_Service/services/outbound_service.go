package services

import (
	"context"
	"fmt"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/VYN2/Auth_Service/utils"
)

type OutboundService interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.Outbound, int64, error)
	GetByID(ctx context.Context, id uint) (*models.Outbound, error)
	Create(ctx context.Context, m *models.Outbound, actorName, actorID, ip string) error
	Update(ctx context.Context, m *models.Outbound, actorName, actorID, ip string) error
	Delete(ctx context.Context, id uint, actorName, actorID, ip string) error
}

type outboundService struct {
	repo    repositories.OutboundRepository
	actRepo repositories.ActivityLogRepository
}

func NewOutboundService(repo repositories.OutboundRepository, actRepo repositories.ActivityLogRepository) OutboundService {
	return &outboundService{repo: repo, actRepo: actRepo}
}

func (s *outboundService) List(ctx context.Context, f utils.ListFilter) ([]models.Outbound, int64, error) {
	return s.repo.List(ctx, f)
}

func (s *outboundService) GetByID(ctx context.Context, id uint) (*models.Outbound, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *outboundService) Create(ctx context.Context, m *models.Outbound, actorName, actorID, ip string) error {
	if err := s.repo.Create(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Outbound", Action: "create",
		Description: fmt.Sprintf("%s menambahkan data Outbound (FO: %s)", actorName, m.FreightOrder),
		IPAddress:   ip,
	})
	return nil
}

func (s *outboundService) Update(ctx context.Context, m *models.Outbound, actorName, actorID, ip string) error {
	if err := s.repo.Update(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Outbound", Action: "update",
		Description: fmt.Sprintf("%s mengubah data Outbound (FO: %s)", actorName, m.FreightOrder),
		IPAddress:   ip,
	})
	return nil
}

func (s *outboundService) Delete(ctx context.Context, id uint, actorName, actorID, ip string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Outbound", Action: "delete",
		Description: fmt.Sprintf("%s menghapus data Outbound (ID: %d)", actorName, id),
		IPAddress:   ip,
	})
	return nil
}
