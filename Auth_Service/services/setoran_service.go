package services

import (
	"context"
	"fmt"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/VYN2/Auth_Service/utils"
)

type SetoranService interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.Setoran, int64, error)
	GetByID(ctx context.Context, id uint) (*models.Setoran, error)
	Create(ctx context.Context, m *models.Setoran, actorName, actorID, ip string) error
	Update(ctx context.Context, m *models.Setoran, actorName, actorID, ip string) error
	Delete(ctx context.Context, id uint, actorName, actorID, ip string) error
	AvgDurasi(ctx context.Context) (float64, error)
}

type setoranService struct {
	repo    repositories.SetoranRepository
	actRepo repositories.ActivityLogRepository
}

func NewSetoranService(repo repositories.SetoranRepository, actRepo repositories.ActivityLogRepository) SetoranService {
	return &setoranService{repo: repo, actRepo: actRepo}
}

func (s *setoranService) List(ctx context.Context, f utils.ListFilter) ([]models.Setoran, int64, error) {
	return s.repo.List(ctx, f)
}

func (s *setoranService) GetByID(ctx context.Context, id uint) (*models.Setoran, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *setoranService) Create(ctx context.Context, m *models.Setoran, actorName, actorID, ip string) error {
	if err := s.repo.Create(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Setoran", Action: "create",
		Description: fmt.Sprintf("%s menambahkan data Setoran (%s)", actorName, m.Salesman),
		IPAddress:   ip,
	})
	return nil
}

func (s *setoranService) Update(ctx context.Context, m *models.Setoran, actorName, actorID, ip string) error {
	if err := s.repo.Update(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Setoran", Action: "update",
		Description: fmt.Sprintf("%s mengubah data Setoran (%s)", actorName, m.Salesman),
		IPAddress:   ip,
	})
	return nil
}

func (s *setoranService) Delete(ctx context.Context, id uint, actorName, actorID, ip string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Setoran", Action: "delete",
		Description: fmt.Sprintf("%s menghapus data Setoran (ID: %d)", actorName, id),
		IPAddress:   ip,
	})
	return nil
}

func (s *setoranService) AvgDurasi(ctx context.Context) (float64, error) {
	return s.repo.AvgDurasi(ctx)
}
