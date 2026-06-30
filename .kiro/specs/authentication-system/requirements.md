# Requirements Document

## Introduction

This feature implements a full-stack authentication system for the Monitoring Operational RDK application. The backend is built in Go (Gin, GORM, MySQL, JWT, bcrypt) and exposes a login endpoint. The frontend is the existing Next.js project at `Monitoring-RDK`. Authentication protects all admin/dashboard routes, stores user identity in a global React Context, and surfaces user info in the navbar's UserDropdown.

## Glossary

- **Auth_Service**: The Go backend service that handles user authentication, JWT issuance, and authorization middleware.
- **Login_API**: The HTTP endpoint `POST /api/auth/login` exposed by Auth_Service.
- **JWT**: JSON Web Token — a signed, time-limited credential carrying the user's `id`, `email`, `role`, and `exp` claims.
- **AuthMiddleware**: Go middleware that validates a JWT on every protected route request.
- **RoleMiddleware**: Go middleware that enforces role-based access; currently permits only `SUPER_ADMIN`.
- **User**: A record in the `users` table with fields `id` (UUID), `name`, `email`, `password` (bcrypt), `role`, `status`, `created_at`, `updated_at`.
- **UserContext**: A React context that stores the authenticated user's `id`, `name`, `email`, and `role` client-side.
- **Login_Page**: The Next.js page at route `/login`.
- **Dashboard_Layout**: The Next.js `DashboardLayout` component that wraps all `/admin/*` routes.
- **Protected_Route**: Any route under `/admin/*` that requires a valid JWT to access.
- **UserDropdown**: The existing navbar component `src/components/layout/UserDropdown.tsx` that shows avatar, name, role, and a logout action.
- **Seeder**: A Go program that inserts the default `SUPER_ADMIN` user into the database on first run.
- **ACTIVE**: The status value indicating a user account is enabled and may authenticate.
- **SUPER_ADMIN**: The only role currently supported by RoleMiddleware.

---

## Requirements

### Requirement 1: User Login — Backend Endpoint

**User Story:** As a system operator, I want to POST credentials to `/api/auth/login`, so that I receive a JWT and user information upon successful authentication.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/auth/login` with a valid `email` and `password` body, THE Login_API SHALL return HTTP 200 with `{ "success": true, "message": "Login berhasil", "data": { "token": "<jwt>", "user": { "id": "<uuid>", "name": "<name>", "email": "<email>", "role": "<role>" } } }`.
2. WHEN a POST request is made to `/api/auth/login` with a valid `email` but incorrect `password`, THE Login_API SHALL return HTTP 401 with `{ "success": false, "message": "Email atau Password salah" }`.
3. WHEN a POST request is made to `/api/auth/login` with an `email` that does not exist in the `users` table, THE Login_API SHALL return HTTP 401 with `{ "success": false, "message": "Email atau Password salah" }`.
4. WHEN a POST request is made to `/api/auth/login` with a missing or malformed request body, THE Login_API SHALL return HTTP 400 with `{ "success": false, "message": "Request tidak valid" }`.
5. WHEN a POST request is made to `/api/auth/login` with credentials belonging to a user whose `status` is not `ACTIVE`, THE Login_API SHALL return HTTP 401 with `{ "success": false, "message": "Email atau Password salah" }`.

### Requirement 2: JWT Generation and Validation

**User Story:** As a system operator, I want JWTs to be securely generated and validated, so that only authenticated and active users can access protected resources.

#### Acceptance Criteria

1. WHEN Auth_Service generates a JWT, THE Auth_Service SHALL include `id`, `email`, `role`, and `exp` claims in the token payload.
2. WHEN Auth_Service generates a JWT, THE Auth_Service SHALL sign the token using the value of the `JWT_SECRET` environment variable and set the expiry to the duration specified by `JWT_EXPIRE` (default 24 hours).
3. THE Auth_Service SHALL NOT hardcode the JWT secret value in source code.
4. WHEN AuthMiddleware receives a request with a valid, non-expired JWT in the `Authorization: Bearer <token>` header, THE AuthMiddleware SHALL allow the request to proceed to the next handler.
5. WHEN AuthMiddleware receives a request with an expired JWT, THE AuthMiddleware SHALL return HTTP 401 with `{ "success": false, "message": "Token tidak valid atau sudah kadaluarsa" }`.
6. WHEN AuthMiddleware receives a request with a malformed or missing JWT, THE AuthMiddleware SHALL return HTTP 401 with `{ "success": false, "message": "Token tidak valid atau sudah kadaluarsa" }`.
7. WHEN AuthMiddleware receives a request with a valid JWT whose `id` does not match any user with `status = ACTIVE` in the database, THE AuthMiddleware SHALL return HTTP 401 with `{ "success": false, "message": "Akun tidak aktif atau tidak ditemukan" }`.

### Requirement 3: Role-Based Authorization Middleware

**User Story:** As a system administrator, I want role-based access control enforced on protected routes, so that only users with the `SUPER_ADMIN` role can access admin resources.

#### Acceptance Criteria

1. WHEN RoleMiddleware is applied to a route and the authenticated user's `role` is `SUPER_ADMIN`, THE RoleMiddleware SHALL allow the request to proceed.
2. WHEN RoleMiddleware is applied to a route and the authenticated user's `role` is not `SUPER_ADMIN`, THE RoleMiddleware SHALL return HTTP 403 with `{ "success": false, "message": "Akses ditolak" }`.
3. THE Auth_Service SHALL apply AuthMiddleware before RoleMiddleware on all protected routes.

### Requirement 4: Database Schema and Seeder

**User Story:** As a developer, I want a well-defined `users` table and a seeder for the default admin account, so that the system is ready to use after initial deployment.

#### Acceptance Criteria

1. THE Auth_Service SHALL create a `users` table with columns: `id` (UUID, primary key), `name` (varchar), `email` (varchar, unique), `password` (varchar, bcrypt hash), `role` (varchar), `status` (varchar), `created_at` (timestamp), `updated_at` (timestamp).
2. WHEN the Seeder is executed and no user with email `putrimas@monitoring.rdk.com` exists, THE Seeder SHALL insert a user with name `Putri Mas`, email `putrimas@monitoring.rdk.com`, password `putrimas123` stored as a bcrypt hash, role `SUPER_ADMIN`, and status `ACTIVE`.
3. WHEN the Seeder is executed and a user with email `putrimas@monitoring.rdk.com` already exists, THE Seeder SHALL skip insertion and produce no duplicate records.
4. THE Auth_Service SHALL store all passwords as bcrypt hashes and SHALL NOT store plaintext passwords.

### Requirement 5: Backend Project Structure and Configuration

**User Story:** As a developer, I want the backend to follow a layered architecture with environment-based configuration, so that the codebase is maintainable and secure.

#### Acceptance Criteria

1. THE Auth_Service SHALL organize source code into the following packages: `cmd`, `config`, `controllers`, `middlewares`, `models`, `repositories`, `services`, `routes`, `utils`, `dto`, `database`, `seeders`.
2. THE Auth_Service SHALL read all sensitive configuration values (`JWT_SECRET`, `JWT_EXPIRE`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`) from environment variables.
3. IF a required environment variable is missing at startup, THEN THE Auth_Service SHALL terminate with a non-zero exit code, and SHALL attempt to log an error before terminating.
4. THE Auth_Service SHALL validate all incoming request bodies using DTO structs with binding tags before passing data to the service layer.
5. THE Auth_Service SHALL use the repository pattern to abstract all database access from the service layer.

### Requirement 6: Frontend Login Page

**User Story:** As an operator, I want to log in through the existing `/login` page using my email and password, so that I can access the monitoring dashboard.

#### Acceptance Criteria

1. THE Login_Page SHALL present an email input field, a password input field with a show/hide toggle, a "Remember Me" checkbox, and a full-width login button.
2. WHEN the login form is submitted with an empty email field, THE Login_Page SHALL display a validation error and SHALL NOT submit the request to Login_API.
3. WHEN the login form is submitted with an empty password field, THE Login_Page SHALL display a validation error and SHALL NOT submit the request to Login_API.
4. WHEN the login button is clicked and a network request is in progress, THE Login_Page SHALL display a loading spinner inside the login button and SHALL disable the button to prevent duplicate submissions.
5. WHEN Login_API returns a success response and the JWT is successfully stored, THE Login_Page SHALL save the user object to UserContext and redirect the user to `/admin` (dashboard). IF JWT storage fails, THEN THE Login_Page SHALL display an error message and SHALL NOT redirect.
6. WHEN Login_API returns a 401 response, THE Login_Page SHALL display a toast notification with the message "Email atau Password salah".
7. THE Login_Page SHALL send the login request to the URL constructed from the `NEXT_PUBLIC_API_URL` environment variable appended with `/auth/login`.
8. WHERE the user's browser supports cookies, THE Login_Page SHALL store the JWT as an HttpOnly cookie via a Next.js API route.

### Requirement 7: Frontend Protected Routes

**User Story:** As a system administrator, I want all dashboard routes to require authentication, so that unauthenticated users cannot access operational data.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to any route under `/admin/*`, THE Dashboard_Layout SHALL redirect the user to `/login`.
2. WHEN an authenticated user navigates to `/login`, THE Login_Page SHALL redirect the user to `/admin`.
3. THE Dashboard_Layout SHALL verify authentication by checking for a valid JWT in the cookie or UserContext on every render; WHEN the JWT is invalid or missing, THE Dashboard_Layout SHALL redirect the user to `/login`.
4. THE Auth_Service middleware SHALL protect all backend routes under `/api/admin/*` and require a valid JWT; unauthenticated requests SHALL receive HTTP 401.

### Requirement 8: User Context

**User Story:** As a frontend developer, I want a global React context that holds the authenticated user's data, so that any component can access identity information without prop drilling.

#### Acceptance Criteria

1. THE UserContext SHALL store the authenticated user's `id`, `name`, `email`, and `role` fields.
2. WHEN a user successfully logs in, THE Login_Page SHALL populate UserContext with the user object returned by Login_API.
3. WHEN the page is loaded or refreshed and a valid JWT cookie is present, THE UserContext SHALL be restored by fetching user data or decoding the JWT on the client.
4. WHEN a user logs out, THE UserContext SHALL be cleared and the JWT SHALL be removed from storage.

### Requirement 9: Logout

**User Story:** As an operator, I want to log out from the navbar dropdown, so that my session is terminated and no one else can use my account.

#### Acceptance Criteria

1. WHEN the user clicks "Logout" in UserDropdown, THE UserDropdown SHALL clear the JWT from storage, clear UserContext, and redirect the user to `/login`.
2. THE UserDropdown SHALL display the authenticated user's name and role from UserContext instead of hardcoded values.
3. THE UserDropdown SHALL display the initials-based avatar `"PM"` for the default SUPER_ADMIN user, derived from the user's name in UserContext.

### Requirement 10: Navbar User Display

**User Story:** As an operator, I want to see my name and role in the navbar, so that I know I am logged in as the correct account.

#### Acceptance Criteria

1. WHILE a user is authenticated and user data is available in UserContext, THE UserDropdown SHALL display the user's `name` and a formatted version of the user's `role` (e.g., `SUPER_ADMIN` rendered as `Super Admin`). IF the required user data is unavailable, THEN THE UserDropdown SHALL not render.
2. WHILE a user is authenticated, THE UserDropdown SHALL display the user's `email` in the dropdown panel header.
3. THE UserDropdown SHALL derive the avatar initials from the user's `name` in UserContext (e.g., `"Putri Mas"` → `"PM"`).
