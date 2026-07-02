package config

import (
	"fmt"
	"log"
	"os"
	"strings"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	Port        string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPass      string
	DBName      string
	JWTSecret   string
	JWTExpire   string
	CORSOrigins string

	// Google Sheets Sync — field baru (additive, field lama tidak berubah)
	GoogleProjectID      string // GOOGLE_PROJECT_ID (opsional, warning saja)
	GoogleClientEmail    string // GOOGLE_CLIENT_EMAIL (wajib untuk mode aktif)
	GooglePrivateKey     string // GOOGLE_PRIVATE_KEY (wajib untuk mode aktif, \n dinormalisasi)
	GoogleSpreadsheetID  string // GOOGLE_SPREADSHEET_ID (wajib untuk mode aktif)
	GoogleWebhookSecret  string // GOOGLE_WEBHOOK_SECRET (opsional, warning saja)
	GoogleAppsScriptURL  string // GOOGLE_APPS_SCRIPT_URL (URL doPost Apps Script untuk sync Dashboard→Spreadsheet)
}

// AppConfig is the global config instance, populated by Load().
var AppConfig *Config

// Load reads all required environment variables and panics if any are missing.
// Google-related env vars are optional — missing vars log a warning and the backend
// starts in Degraded Mode (sync endpoints return 503, CRUD endpoints remain normal).
func Load() {
	cfg := &Config{
		Port:        getEnv("PORT", "8080"),
		DBHost:      requireEnv("DB_HOST"),
		DBPort:      getEnv("DB_PORT", "3306"),
		DBUser:      requireEnv("DB_USER"),
		DBPass:      os.Getenv("DB_PASS"), // password may be empty
		DBName:      requireEnv("DB_NAME"),
		JWTSecret:   requireEnv("JWT_SECRET"),
		JWTExpire:   getEnv("JWT_EXPIRE", "24h"),
		CORSOrigins: getEnv("CORS_ORIGINS", "http://localhost:3000"),
	}

	// Google Sheets Sync — semua bersifat opsional; jika kosong, backend berjalan
	// dalam Degraded Mode dan endpoint sync mengembalikan HTTP 503.
	cfg.GoogleProjectID = os.Getenv("GOOGLE_PROJECT_ID")
	cfg.GoogleClientEmail = os.Getenv("GOOGLE_CLIENT_EMAIL")
	// Normalisasi GOOGLE_PRIVATE_KEY: ganti literal \n (dua karakter) dengan newline aktual (0x0A)
	cfg.GooglePrivateKey = strings.ReplaceAll(os.Getenv("GOOGLE_PRIVATE_KEY"), `\n`, "\n")
	cfg.GoogleSpreadsheetID = os.Getenv("GOOGLE_SPREADSHEET_ID")
	cfg.GoogleWebhookSecret = os.Getenv("GOOGLE_WEBHOOK_SECRET")
	cfg.GoogleAppsScriptURL = os.Getenv("GOOGLE_APPS_SCRIPT_URL")

	if cfg.GoogleProjectID == "" {
		log.Println("[config] warning: GOOGLE_PROJECT_ID is not set — Google Sheets sync will run in Degraded Mode")
	}
	if cfg.GoogleClientEmail == "" {
		log.Println("[config] warning: GOOGLE_CLIENT_EMAIL is not set — Google Sheets sync will run in Degraded Mode")
	}
	if cfg.GooglePrivateKey == "" {
		log.Println("[config] warning: GOOGLE_PRIVATE_KEY is not set — Google Sheets sync will run in Degraded Mode")
	}
	if cfg.GoogleSpreadsheetID == "" {
		log.Println("[config] warning: GOOGLE_SPREADSHEET_ID is not set — Google Sheets sync will run in Degraded Mode")
	}
	if cfg.GoogleWebhookSecret == "" {
		log.Println("[config] warning: GOOGLE_WEBHOOK_SECRET is not set — webhook endpoint will return 503")
	}
	if cfg.GoogleAppsScriptURL == "" {
		log.Println("[config] warning: GOOGLE_APPS_SCRIPT_URL is not set — Dashboard→Spreadsheet sync will be disabled")
	}

	AppConfig = cfg
}

// DSN returns the MySQL data source name for GORM.
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.DBUser, c.DBPass, c.DBHost, c.DBPort, c.DBName,
	)
}

// requireEnv returns the value of the environment variable or panics with a
// descriptive message if the variable is not set or empty.
func requireEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("[config] required environment variable %q is not set", key)
	}
	return val
}

// getEnv returns the value of the environment variable or the provided default.
func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
