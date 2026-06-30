package seeders

import (
	"log"

	"github.com/VYN2/Auth_Service/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const defaultAdminEmail = "putrimas@monitoring.rdk.com"

// Seed inserts the default SUPER_ADMIN user if it does not already exist.
// It is safe to call on every startup — it is a no-op when the user exists.
func Seed(db *gorm.DB) {
	var existing models.User
	result := db.Where("email = ?", defaultAdminEmail).First(&existing)
	if result.Error == nil {
		// User already exists — skip.
		log.Printf("[seeder] default admin already exists, skipping seed")
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte("putrimas123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("[seeder] failed to hash password: %v", err)
	}

	user := models.User{
		ID:       uuid.NewString(),
		Name:     "Putri Mas",
		Email:    defaultAdminEmail,
		Password: string(hashed),
		Role:     "SUPER_ADMIN",
		Status:   "ACTIVE",
	}

	if err := db.Create(&user).Error; err != nil {
		log.Fatalf("[seeder] failed to create default admin: %v", err)
	}

	log.Printf("[seeder] default admin created: %s", defaultAdminEmail)
}
