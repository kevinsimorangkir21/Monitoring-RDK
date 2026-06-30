# Auth_Service — Monitoring RDK Backend

Standalone Go authentication backend for the Monitoring Operational RDK application.
Connects to a **local MySQL instance** — no Docker required.

## Tech Stack

| Layer | Library |
|---|---|
| HTTP framework | [Gin](https://github.com/gin-gonic/gin) |
| ORM | [GORM](https://gorm.io) |
| Database | MySQL 8+ (local) |
| JWT | [golang-jwt/jwt v5](https://github.com/golang-jwt/jwt) |
| Password hashing | bcrypt (`golang.org/x/crypto`) |
| UUID | [google/uuid](https://github.com/google/uuid) |
| Env loading | [godotenv](https://github.com/joho/godotenv) |
| CORS | [gin-contrib/cors](https://github.com/gin-contrib/cors) |

---

## Quick Start

### 1. Start MySQL

Make sure your local MySQL service is running.

- **Windows (XAMPP / MySQL Installer):** Start the MySQL service from the control panel.
- **macOS (Homebrew):** `brew services start mysql`
- **Linux (systemd):** `sudo systemctl start mysql`

### 2. Create the database

Open a MySQL client (MySQL Workbench, DBeaver, CLI, etc.) and run:

```sql
CREATE DATABASE monitoring_rdk
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 3. Configure environment

Copy the example file and edit it if your MySQL password is not empty:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Default `.env` values — only `DB_PASS` typically needs changing:

```env
PORT=8080

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=           ← set your MySQL password here if required
DB_NAME=monitoring_rdk

JWT_SECRET=replace_with_secure_secret
JWT_EXPIRE=24h

CORS_ORIGINS=http://localhost:3000
```

> `127.0.0.1` is used instead of `localhost` to avoid IPv6 (`[::1]`) resolution
> issues on Windows, where `localhost` can resolve to `[::1]:3306` and fail.

### 4. Install Go dependencies

```bash
go mod tidy
```

### 5. Run the backend

```bash
go run cmd/main.go
```

Expected startup output:

```
====================================
   Monitoring RDK Auth Service
====================================

  Environment Loaded

  Connecting to MySQL...
  Host     : 127.0.0.1
  Port     : 3306
  Database : monitoring_rdk

  Database Connected
  Auto Migration Success
  Seeder Success

  ── Diagnostics ──────────────────────────
  Go Version   : go1.23.x
  Port         : 8080
  Database     : root@127.0.0.1:3306/monitoring_rdk
  JWT Secret   : Loaded

  ── Registered Routes ────────────────────
  GET      /api/health
  POST     /api/auth/login
  GET      /api/admin/me

  Server Listening on :8080
```

### 6. Run the frontend

In a separate terminal, inside `Monitoring-RDK/`:

```bash
npm run dev
```

Make sure `Monitoring-RDK/.env.local` contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## API Endpoints

### Health Check

```
GET /api/health
```

```json
{
  "success": true,
  "status": "UP",
  "service": "Monitoring Auth Service"
}
```

### Login

```
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "putrimas@monitoring.rdk.com",
  "password": "putrimas123"
}
```

**Success (200):**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "<uuid>",
      "name": "Putri Mas",
      "email": "putrimas@monitoring.rdk.com",
      "role": "SUPER_ADMIN"
    }
  }
}
```

**Wrong credentials (401):**

```json
{
  "success": false,
  "message": "Email atau Password salah."
}
```

### Protected Routes

All routes under `/api/admin/*` require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Default Admin Account

Created automatically by the seeder on first startup:

| Field | Value |
|---|---|
| Name | Putri Mas |
| Email | putrimas@monitoring.rdk.com |
| Password | putrimas123 |
| Role | SUPER_ADMIN |
| Status | ACTIVE |

---

## Troubleshooting

### `Failed to connect to MySQL`

The startup log will print:

```
  ❌ Failed to connect to MySQL.

  Please ensure:
  - MySQL Server is running.
  - Port 3306 is available.
  - Database 'monitoring_rdk' exists.
  - DB_USER and DB_PASS are correct in .env
```

Steps:
1. Confirm MySQL is running.
2. Confirm the `monitoring_rdk` database exists.
3. Check `DB_USER` and `DB_PASS` in `.env`.
4. Confirm `DB_HOST=127.0.0.1` (not `localhost`) in `.env`.

### Port 8080 already in use

Change `PORT=8081` in `.env` and update `NEXT_PUBLIC_API_URL` in the frontend accordingly.

---

## Project Structure

```
Auth_Service/
├── cmd/main.go              ← Entry point
├── config/config.go         ← Env-based configuration
├── controllers/             ← HTTP handlers
├── database/database.go     ← MySQL connection + AutoMigrate (with retry)
├── dto/                     ← Request / Response structs
├── middleware/              ← AuthMiddleware, RoleMiddleware
├── models/                  ← GORM models
├── repositories/            ← Data access layer
├── routes/routes.go         ← Route registration
├── seeders/user_seeder.go   ← Default admin user
├── services/                ← Business logic
├── utils/jwt.go             ← JWT generate / parse
├── go.mod
├── go.sum
├── .env                     ← Local config (not committed)
├── .env.example             ← Template
└── .gitignore
```
