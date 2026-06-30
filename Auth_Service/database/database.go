package database

import (
	"fmt"
	"log"
	"time"

	"github.com/VYN2/Auth_Service/config"
	"github.com/VYN2/Auth_Service/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the global GORM database instance.
var DB *gorm.DB

// Connect opens a GORM connection to a local MySQL instance using the loaded
// config. It retries up to maxRetries times before printing a human-readable
// error and terminating, so the developer knows exactly what to fix.
func Connect() {
	cfg := config.AppConfig

	const maxRetries = 5
	const retryDelay = 2 * time.Second

	fmt.Println()
	fmt.Println("  Connecting to MySQL...")
	fmt.Printf("  Host     : %s\n", cfg.DBHost)
	fmt.Printf("  Port     : %s\n", cfg.DBPort)
	fmt.Printf("  Database : %s\n", cfg.DBName)
	fmt.Println()

	var db *gorm.DB
	var err error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		db, err = gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
		if err == nil {
			break
		}

		if attempt < maxRetries {
			log.Printf("[database] connection attempt %d/%d failed, retrying in %v...", attempt, maxRetries, retryDelay)
			time.Sleep(retryDelay)
		}
	}

	if err != nil {
		fmt.Println()
		fmt.Println("  ❌ Failed to connect to MySQL.")
		fmt.Println()
		fmt.Println("  Please ensure:")
		fmt.Println("  - MySQL Server is running.")
		fmt.Printf("  - Port %s is available.\n", cfg.DBPort)
		fmt.Printf("  - Database '%s' exists.\n", cfg.DBName)
		fmt.Println("  - DB_USER and DB_PASS are correct in .env")
		fmt.Println()
		fmt.Println("  To create the database, run:")
		fmt.Printf("  CREATE DATABASE %s CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n", cfg.DBName)
		fmt.Println()
		log.Fatalf("[database] could not connect after %d attempts: %v", maxRetries, err)
	}

	// Run schema migrations — safe to run on every startup; GORM only adds
	// missing columns/tables and never drops existing data.
	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatalf("[database] auto-migration failed: %v", err)
	}

	DB = db
}
