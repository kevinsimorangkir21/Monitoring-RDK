package repositories

import (
	"github.com/VYN2/Auth_Service/models"
	"gorm.io/gorm"
)

// UserRepository defines the data-access contract for the User model.
type UserRepository interface {
	FindByEmail(email string) (*models.User, error)
	FindByID(id string) (*models.User, error)
}

// GormUserRepository is the GORM-backed implementation of UserRepository.
type GormUserRepository struct {
	db *gorm.DB
}

// NewGormUserRepository creates a new GormUserRepository.
func NewGormUserRepository(db *gorm.DB) UserRepository {
	return &GormUserRepository{db: db}
}

// FindByEmail looks up a user by email address.
func (r *GormUserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByID looks up a user by primary key (UUID string).
func (r *GormUserRepository) FindByID(id string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("id = ?", id).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
