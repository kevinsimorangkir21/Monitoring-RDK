package models

import "time"

// ActivityLog records every user action for the dashboard Recent Activity feed.
type ActivityLog struct {
	ID          uint      `gorm:"primaryKey;autoIncrement"       json:"id"`
	UserID      string    `gorm:"type:varchar(36);not null;index" json:"user_id"`
	User        User      `gorm:"foreignKey:UserID"               json:"user,omitempty"`
	Module      string    `gorm:"type:varchar(100);not null"      json:"module"`
	Action      string    `gorm:"type:varchar(50);not null"       json:"action"`
	Description string    `gorm:"type:text"                       json:"description"`
	IPAddress   string    `gorm:"type:varchar(45)"                json:"ip_address"`
	CreatedAt   time.Time `                                       json:"created_at"`
}

// TableName overrides the default table name.
func (ActivityLog) TableName() string { return "activity_logs" }
