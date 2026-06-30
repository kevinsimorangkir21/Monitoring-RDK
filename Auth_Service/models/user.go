package models

import "time"

// User represents a user record in the users table.
type User struct {
	ID        string    `gorm:"type:varchar(36);primaryKey"       json:"id"`
	Name      string    `gorm:"type:varchar(255);not null"         json:"name"`
	Email     string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"type:varchar(255);not null"         json:"-"`
	Role      string    `gorm:"type:varchar(50);not null"          json:"role"`
	Status    string    `gorm:"type:varchar(50);not null"          json:"status"`
	CreatedAt time.Time `                                          json:"created_at"`
	UpdatedAt time.Time `                                          json:"updated_at"`
}
