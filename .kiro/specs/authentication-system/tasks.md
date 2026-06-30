# Implementation Plan: Authentication System

## Overview

Implement a full-stack authentication system spanning a new Go backend (`Auth_Service`) and the existing Next.js frontend (`Monitoring-RDK`). The backend (Gin, GORM, MySQL, JWT, bcrypt) exposes `POST /api/auth/login` and enforces `AuthMiddleware` + `RoleMiddleware`. The frontend wires the existing login page, adds a `UserContext`, guards all `/admin/*` routes in `DashboardLayout`, and connects `UserDropdown` to live user data.

---

## Tasks

- [x] 1. Bootstrap Go backend project structure and configuration
  - Create the `Auth_Service` directory at the repo root (sibling to `Monitoring-RDK`)
  - Initialise Go module (`go mod init`)
  - Create package directories: `cmd`, `config`, `database`, `seeders`, `models`, `dto`, `repositories`, `services`, `controllers`, `middlewares`, `utils`, `routes`
  - Write `config/config.go`: read `JWT_SECRET`, `JWT_EXPIRE`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` from environment; panic with logged error if any required variable is missing
  - Write `cmd/main.go` entry point that loads config, opens DB, runs seeder, registers routes, and starts the Gin server
  - Add a `.env.example` listing all required environment variables
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 2. Implement database connection and User model
  - [x] 2.1 Write `database/database.go`: open GORM connection to MySQL using config values; run `AutoMigrate(&models.User{})` on startup
    - _Requirements: 4.1, 5.1_
  - [x] 2.2 Write `models/user.go`: define `User` struct with GORM tags (`id` VARCHAR(36) primary key, `name`, `email` uniqueIndex, `password`, `role`, `status`, `created_at`, `updated_at`)
    - _Requirements: 4.1_

- [x] 3. Implement DTO structs
  - [x] 3.1 Write `dto/auth_dto.go`: define `LoginRequest` (email, password with `binding:"required,email"` / `binding:"required"` tags) and `LoginResponse` + `UserInfo` structs
    - _Requirements: 5.4_

- [x] 4. Implement UserRepository
  - [x] 4.1 Write `repositories/user_repository.go`: define `UserRepository` interface with `FindByEmail(email string) (*models.User, error)` and `FindByID(id string) (*models.User, error)`; implement `GormUserRepository` that fulfils the interface using GORM
    - _Requirements: 5.5_

- [x] 5. Implement JWT utilities
  - [x] 5.1 Write `utils/jwt.go`: implement `GenerateToken(user *models.User) (string, error)` — signs a JWT containing `id`, `email`, `role`, and `exp` claims using `JWT_SECRET`; implement `ParseToken(token string) (*Claims, error)`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 5.2 Write property test for JWT round-trip — `utils/jwt_pbt_test.go`
    - **Property 4: JWT claims round-trip through parse**
    - Generate random `User` structs with arbitrary `id`, `email`, and `role` values; call `GenerateToken` then `ParseToken` and assert all three fields are identical to the originals
    - Minimum 100 iterations with `rapid`
    - **Validates: Requirements 2.1, 2.2**

- [x] 6. Implement AuthService
  - [x] 6.1 Write `services/auth_service.go`: define `AuthService` interface with `Login(req dto.LoginRequest) (*dto.LoginResponse, error)`; implement `authServiceImpl` that calls `UserRepository.FindByEmail`, runs `bcrypt.CompareHashAndPassword`, checks `user.Status == "ACTIVE"`, and calls `utils.GenerateToken`
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 4.4_
  - [x] 6.2 Write property tests for AuthService — `services/auth_service_pbt_test.go`
    - **Property 1: Valid credentials always yield a structurally correct login response**
    - Generate random active users; mock repository to return them; assert HTTP 200 with non-empty `token`, `user.id`, `user.name`, `user.email`, `user.role`
    - **Validates: Requirements 1.1**
    - **Property 2: Wrong or non-existent credentials always yield 401**
    - Generate a user + a random password string that does not match; assert HTTP 401 and no token in response
    - **Validates: Requirements 1.2, 1.3**
    - **Property 3: Inactive users are rejected like wrong credentials**
    - Generate users with random non-`ACTIVE` status values; assert HTTP 401 regardless of password correctness
    - **Validates: Requirements 1.5**
    - Minimum 100 iterations each with `rapid`

- [x] 7. Implement AuthMiddleware and RoleMiddleware
  - [x] 7.1 Write `middlewares/auth_middleware.go`: extract `Authorization: Bearer <token>` header; call `utils.ParseToken`; look up user by `claims.ID` with `UserRepository.FindByID`; reject with HTTP 401 if token is missing, malformed, expired, or user status is not `ACTIVE`; set `claims` in Gin context for downstream handlers
    - _Requirements: 2.4, 2.5, 2.6, 2.7_
  - [x] 7.2 Write property test for AuthMiddleware — `middlewares/auth_middleware_pbt_test.go`
    - **Property 5: AuthMiddleware rejects any non-valid token**
    - Generate random strings, expired tokens, and tokens for inactive users; assert HTTP 401 and that the next handler is never called for all invalid inputs
    - Minimum 100 iterations with `rapid`
    - **Validates: Requirements 2.4, 2.5, 2.6, 2.7**
  - [x] 7.3 Write `middlewares/role_middleware.go`: read `claims` from Gin context; allow the request if `claims.Role == "SUPER_ADMIN"`; return HTTP 403 with `{ "success": false, "message": "Akses ditolak" }` for any other role
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 7.4 Write property test for RoleMiddleware — `middlewares/role_middleware_pbt_test.go`
    - **Property 6: RoleMiddleware is role-exclusive**
    - Generate arbitrary role strings; assert that only `"SUPER_ADMIN"` passes and all others receive HTTP 403
    - Minimum 100 iterations with `rapid`
    - **Validates: Requirements 3.1, 3.2**

- [x] 8. Implement AuthController and register routes
  - [x] 8.1 Write `controllers/auth_controller.go`: bind `dto.LoginRequest` (return 400 on failure); call `AuthService.Login`; return 200 `{ "success": true, "message": "Login berhasil", "data": { "token": ..., "user": ... } }` or 401 with `{ "success": false, "message": "Email atau Password salah" }` on error
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 8.2 Write `routes/routes.go`: register public group (`POST /api/auth/login`) and protected group (`/api/admin/*` behind `AuthMiddleware` + `RoleMiddleware`)
    - _Requirements: 3.3, 7.4_

- [x] 9. Implement database seeder
  - [x] 9.1 Write `seeders/user_seeder.go`: check if `putrimas@monitoring.rdk.com` exists; if not, bcrypt-hash `putrimas123` and insert the default `SUPER_ADMIN` / `ACTIVE` user; skip without error if the user already exists
    - _Requirements: 4.2, 4.3, 4.4_

- [x] 10. Backend checkpoint — wire everything together and verify
  - In `cmd/main.go`, ensure the call order is: `config.Load()` → `database.Connect()` → `seeders.Seed()` → `routes.Register()` → `r.Run()`
  - Run `go build ./...` to confirm the project compiles with no errors
  - Run `go test ./...` to confirm all unit and property tests pass
  - Ensure all tests pass; ask the user if questions arise.
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 11. Install frontend dependencies
  - [x] 11.1 Add `jose` for client-side JWT decoding and `fast-check` + `vitest` + `@testing-library/react` for testing
    - Run: `npm install jose`
    - Run: `npm install --save-dev vitest fast-check @testing-library/react @testing-library/user-event @vitejs/plugin-react jsdom`
    - Add a `vitest.config.ts` at the project root configured for the `jsdom` environment
    - _Requirements: 6.8, 8.3_

- [x] 12. Implement Next.js API routes for cookie management
  - [x] 12.1 Create `src/app/api/auth/set-cookie/route.ts`: accept `POST { token: string }`; set `jwt` as `HttpOnly; SameSite=Strict; Secure; Path=/` cookie with `Max-Age` derived from the JWT `exp` claim
    - _Requirements: 6.8_
  - [x] 12.2 Create `src/app/api/auth/logout/route.ts`: accept `POST`; clear the `jwt` cookie by setting `Max-Age=0`
    - _Requirements: 9.1_

- [x] 13. Implement UserContext
  - [x] 13.1 Create `src/contexts/UserContext.tsx`: define `User` interface (`id`, `name`, `email`, `role`); implement `UserProvider` that on mount reads and decodes the `jwt` cookie via `jose` and calls `setUser` with the decoded claims; expose `useUser()` hook and `logout()` function that calls `POST /api/auth/logout`, sets `user` to `null`, and calls `router.replace('/login')`
    - _Requirements: 8.1, 8.3, 8.4, 9.1_
  - [x] 13.2 Write property test for UserContext hydration — `src/contexts/UserContext.pbt.test.tsx`
    - **Property 8: UserContext hydrates correctly from JWT cookie**
    - Generate random `{ id, email, role }` objects; build a fake signed JWT; mount `UserProvider` with the cookie set; assert `user.id`, `user.email`, and `user.role` match the generated values exactly
    - Minimum 100 iterations with `fast-check`
    - **Validates: Requirements 8.3**
  - [x] 13.3 Write property test for logout — `src/contexts/UserContext.pbt.test.tsx`
    - **Property 9: Logout clears all auth state**
    - For arbitrary authenticated user states, call `logout()`; assert that the `jwt` cookie is cleared, `UserContext.user` becomes `null`, and `router.replace('/login')` is called
    - Minimum 100 iterations with `fast-check`
    - **Validates: Requirements 8.4, 9.1**

- [x] 14. Wire login page to backend
  - [x] 14.1 Update `src/app/login/page.jsx` → convert to `page.tsx`: add `useRouter` and `useUser`; add controlled state for `email`, `password`, `loading`, and `error`; implement client-side validation (non-empty after trim) that shows inline errors without network dispatch; on valid submit, `fetch` `${NEXT_PUBLIC_API_URL}/auth/login`, on success call `POST /api/auth/set-cookie`, then `setUser(data.user)` and `router.push('/admin')`; on 401 show toast; on cookie-set failure show error and do not redirect
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
  - [x] 14.2 Add redirect guard to `src/app/login/page.tsx`: on mount, if a valid `jwt` cookie is present, call `router.replace('/admin')`
    - _Requirements: 7.2_
  - [x] 14.3 Write property test for login form validation — `src/app/login/LoginPage.pbt.test.tsx`
    - **Property 7: Client-side form rejects blank fields**
    - Generate arbitrary empty or whitespace-only strings for email and password; render the login form; submit it; assert that `fetch` is never called
    - Minimum 100 iterations with `fast-check`
    - **Validates: Requirements 6.2, 6.3**

- [x] 15. Implement DashboardLayout auth guard
  - [x] 15.1 Create `src/components/layout/DashboardLayout.tsx`: on every render, read the `jwt` cookie from `document.cookie`; if missing or unparseable, call `router.replace('/login')`; if valid, ensure `UserContext` is populated with decoded claims; render the layout shell (sidebar, header, children) only for authenticated users
    - _Requirements: 7.1, 7.3_

- [x] 16. Wire UserDropdown to UserContext
  - [x] 16.1 Update `src/components/layout/UserDropdown.tsx`: import `useUser()`; if `user` is `null`, return `null` (do not render); replace hardcoded `"Kevin"` / `"Administrator"` / `"kevin@monitoring.op"` with `user.name`, formatted role string (e.g. `SUPER_ADMIN` → `Super Admin`), and `user.email`; derive avatar initials from `user.name` (first letter of each word); wire the "Logout" dropdown item to call `logout()` from context
    - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.2, 10.3_
  - [x] 16.2 Write property test for UserDropdown — `src/components/layout/UserDropdown.pbt.test.tsx`
    - **Property 10: UserDropdown displays real user data**
    - Generate arbitrary `User` objects; render `UserDropdown` inside a `UserProvider` with `user` pre-populated; assert the rendered output contains the correct `name`, formatted `role`, `email`, and derived initials — and does not contain any hardcoded placeholder strings
    - Minimum 100 iterations with `fast-check`
    - **Validates: Requirements 10.1, 10.2, 10.3**

- [x] 17. Wire UserProvider into the application root
  - [x] 17.1 Wrap the root layout (`src/app/layout.tsx` or equivalent) with `UserProvider` so that `useUser()` is accessible in all pages and components
    - _Requirements: 8.1, 8.2_

- [x] 18. Frontend checkpoint — Ensure all tests pass
  - Run `npx vitest --run` to execute all unit and property-based tests
  - Ensure all tests pass; ask the user if questions arise.
  - _Requirements: 6.1–6.8, 7.1–7.3, 8.1–8.4, 9.1–9.3, 10.1–10.3_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Each task references specific requirements for traceability.
- The Go backend is a new codebase — create it as a sibling directory to `Monitoring-RDK`.
- The frontend targets the existing `Monitoring-RDK` Next.js project; always match its existing conventions and imports.
- Property tests use `rapid` (Go) and `fast-check` (TypeScript); each must run a minimum of 100 iterations.
- The `name` field is intentionally included in JWT claims (see design note) to support refresh hydration without an additional `/api/me` round trip.
- Backend integration tests against a real MySQL instance are out of scope for the coding agent; use unit tests with mocked repositories instead.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2", "3.1"] },
    { "id": 1, "tasks": ["4.1", "5.1"] },
    { "id": 2, "tasks": ["5.2", "6.1"] },
    { "id": 3, "tasks": ["6.2", "7.1", "7.3"] },
    { "id": 4, "tasks": ["7.2", "7.4", "8.1"] },
    { "id": 5, "tasks": ["8.2", "9.1"] },
    { "id": 6, "tasks": ["11.1"] },
    { "id": 7, "tasks": ["12.1", "12.2"] },
    { "id": 8, "tasks": ["13.1"] },
    { "id": 9, "tasks": ["13.2", "13.3", "14.1"] },
    { "id": 10, "tasks": ["14.2", "15.1"] },
    { "id": 11, "tasks": ["14.3", "16.1"] },
    { "id": 12, "tasks": ["16.2", "17.1"] }
  ]
}
```
