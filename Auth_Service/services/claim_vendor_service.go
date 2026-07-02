package services

import (
	"context"
	"fmt"

	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/VYN2/Auth_Service/utils"
)

type ClaimVendorService interface {
	List(ctx context.Context, f utils.ListFilter) ([]models.ClaimVendor, int64, error)
	GetByID(ctx context.Context, id uint) (*models.ClaimVendor, error)
	Create(ctx context.Context, m *models.ClaimVendor, actorName, actorID, ip string) error
	Update(ctx context.Context, m *models.ClaimVendor, actorName, actorID, ip string) error
	Delete(ctx context.Context, id uint, actorName, actorID, ip string) error
}

type claimVendorService struct {
	repo    repositories.ClaimVendorRepository
	actRepo repositories.ActivityLogRepository
}

func NewClaimVendorService(repo repositories.ClaimVendorRepository, actRepo repositories.ActivityLogRepository) ClaimVendorService {
	return &claimVendorService{repo: repo, actRepo: actRepo}
}

func (s *claimVendorService) List(ctx context.Context, f utils.ListFilter) ([]models.ClaimVendor, int64, error) {
	return s.repo.List(ctx, f)
}

func (s *claimVendorService) GetByID(ctx context.Context, id uint) (*models.ClaimVendor, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *claimVendorService) Create(ctx context.Context, m *models.ClaimVendor, actorName, actorID, ip string) error {
	if err := s.repo.Create(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Claim Vendor", Action: "create",
		Description: fmt.Sprintf("%s menambahkan Claim Vendor (%s)", actorName, m.NomorClaim),
		IPAddress:   ip,
	})
	return nil
}

func (s *claimVendorService) Update(ctx context.Context, m *models.ClaimVendor, actorName, actorID, ip string) error {
	if err := s.repo.Update(ctx, m); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Claim Vendor", Action: "update",
		Description: fmt.Sprintf("%s mengubah Claim Vendor (%s)", actorName, m.NomorClaim),
		IPAddress:   ip,
	})
	return nil
}

func (s *claimVendorService) Delete(ctx context.Context, id uint, actorName, actorID, ip string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = s.actRepo.Create(ctx, &models.ActivityLog{
		UserID: actorID, Module: "Claim Vendor", Action: "delete",
		Description: fmt.Sprintf("%s menghapus Claim Vendor (ID: %d)", actorName, id),
		IPAddress:   ip,
	})
	return nil
}
