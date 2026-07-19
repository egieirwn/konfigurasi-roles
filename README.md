# RBAC Dashboard — Fullstack Web Application

Enterprise-level Role-Based Access Control (RBAC) dashboard built with **SvelteKit** + **NestJS** + **PostgreSQL**.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | SvelteKit 5, TypeScript, TailwindCSS v4 |
| Backend | NestJS 11, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT + Refresh Token, bcrypt |
| Styling | Shadcn UI style, Dark/Light mode |

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** running locally
- **npm** package manager

### 1. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database (creates roles, permissions, admin user)
npm run prisma:seed

# Start development server
npm run start:dev
```

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

### Default Login

| Field | Value |
|---|---|
| Email | `admin@admin.com` |
| Password | `Admin123!` |

## 🔐 Roles & Permissions

| Role | Description |
|---|---|
| **Super Admin** | Full access to all features |
| **Admin** | User management, view roles/permissions |
| **Editor** | View users, view activity logs |
| **User** | Dashboard and profile only |

## 📁 Project Structure

```
├── backend/          # NestJS API
│   ├── prisma/       # Schema & seeds
│   └── src/
│       ├── common/   # Guards, decorators, filters
│       └── modules/  # Feature modules
├── frontend/         # SvelteKit App
│   └── src/
│       ├── lib/      # Components, stores, API
│       └── routes/   # Pages & layouts
```

## 🔑 API Endpoints

- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register
- `POST /api/auth/refresh` — Refresh tokens
- `GET /api/auth/me` — Current user
- `GET /api/users` — List users
- `GET /api/roles` — List roles
- `GET /api/permissions` — List permissions
- `GET /api/activity-logs` — Activity logs
- `GET /api/profile` — User profile

## ⚡ Features

- ✅ JWT Authentication with Refresh Tokens
- ✅ Role-Based Access Control (RBAC)
- ✅ Permission-based UI rendering
- ✅ Dark/Light mode toggle
- ✅ Responsive dashboard layout
- ✅ User/Role/Permission management
- ✅ Activity logging
- ✅ Form validation (client + server)
- ✅ Toast notifications
- ✅ Loading states & skeletons
- ✅ Collapsible sidebar
- ✅ Protected routes

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens expire in 15 minutes
- Refresh tokens stored hashed in database
- Input validation via class-validator
- CORS configured for frontend origin only
- Global exception filter hides internal errors
