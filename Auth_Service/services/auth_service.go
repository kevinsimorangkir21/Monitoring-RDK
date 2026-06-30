package services

import (
	"errors"

	"github.com/VYN2/Auth_Service/dto"
	"github.com/VYN2/Auth_Service/repositories"
	"github.com/VYN2/Auth_Service/utils"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// ErrInvalidCredentials is returned when email/password do not match or the
// account is inactive — we use a single sentinel to prevent user enumeration.
var ErrInvalidCredentials = errors.New("invalid credentials")

// AuthService defines the authentication business-logic contract.
type AuthService interface {
	Login(req dto.LoginRequest) (*dto.LoginResponse, error)
}

type authServiceImpl struct {
	userRepo repositories.UserRepository
}

// NewAuthService creates a new AuthService backed by the given UserRepository.
func NewAuthService(userRepo repositories.UserRepository) AuthService {
	return &authServiceImpl{userRepo: userRepo}
}

// Login validates the credentials and returns a JWT + user info on success.
func (s *authServiceImpl) Login(req dto.LoginRequest) (*dto.LoginResponse, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	// Verify password against bcrypt hash.
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	// Reject inactive accounts with the same error to avoid enumeration.
	if user.Status != "ACTIVE" {
		return nil, ErrInvalidCredentials
	}

	token, err := utils.GenerateToken(user)
	if err != nil {
		return nil, err
	}

	return &dto.LoginResponse{
		Token: token,
		User: dto.UserInfo{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
			Role:  user.Role,
		},
	}, nil
}
