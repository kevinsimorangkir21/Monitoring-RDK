package config

import (
	"fmt"
	"log"
	"os"
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
}

// AppConfig is the global config instance, populated by Load().
var AppConfig *Config

// Load reads all required environment variables and panics if any are missing.
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
