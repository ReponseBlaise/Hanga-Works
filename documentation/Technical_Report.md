# HANGA WORKS
# Technical Report

---

| Field | Details |
|---|---|
| **Prepared For** | kLab Rwanda / Project Stakeholders |
| **Prepared By** | Hanga Works Development Team |
| **Project Type** | Full-Stack Web Platform |
| **Version** | v1.0 |
| **Date** | 03/06/2026 |
| **Status** | Final |
| **Confidentiality** | Confidential — For Authorized Recipients Only |

---

© 2026 Hanga Works. All Rights Reserved.

---

## Table of Contents

1. Executive Summary
2. Project Overview
3. System Architecture
4. Features & Functionality
5. Database Design
6. API Documentation
7. Security
8. Testing & Quality Assurance
9. System Setup & Running the System
10. Deployment
11. Maintenance & Monitoring
12. Known Limitations & Future Recommendations
13. Support & Contact Information
14. Appendices

---

## 1. Executive Summary

Hanga Works is a skills, employment, and workforce intelligence platform built to bridge the gap between learners, employers, institutions, and mentors in Rwanda and across the African continent. The platform provides a unified workspace where job seekers can discover and apply for roles, learners can enroll in courses and earn verifiable digital certificates, institutions can publish training content, employers can manage hiring pipelines, and mentors can offer one-on-one guidance sessions.

The system has been delivered as a full-stack web application comprising a NestJS REST API backend, a React/Vite single-page application frontend, and a PostgreSQL relational database. As of version 1.0, all core modules — authentication, job marketplace, learning management, mentorship, certifications, employer dashboard, and administration — are implemented and deployed on Render's cloud infrastructure. The platform is live and accessible to all five user roles with role-aware navigation, real-time notifications, and end-to-end data flows.

---

## 2. Project Overview

| Field | Details |
|---|---|
| **Project Name** | Hanga Works |
| **Client / Owner** | kLab Rwanda |
| **Project Type** | Full-Stack Web Platform (SPA + REST API) |
| **Primary Objective** | Connect learners, employers, institutions, and mentors through a unified skills and employment intelligence platform |
| **Target Users** | Learners, Employers, Training Institutions, Mentors, System Administrators |
| **Project Start Date** | 01/04/2026 |
| **Delivery Date** | 03/06/2026 |
| **Current Version** | v1.0 |
| **Live URL** | https://hanga-works.onrender.com |
| **Repository** | https://github.com/ReponseBlaise/Hanga-Works |

### 2.1 Project Scope

**In Scope:**
- Multi-role authentication (Learner, Employer, Institution, Mentor, Admin)
- Job marketplace with advanced search, filtering, saving, and application tracking
- Learning Management System (LMS) — course creation, module management, enrollment, progress tracking
- Course assessments (tests) with auto-grading and pass/fail logic
- Digital certificate issuance with PDF generation and public verification
- Employer hiring dashboard — job posting, applicant pipeline (Kanban), stage management
- Mentorship module — mentor profiles, session booking, session management
- Institution dashboard — course catalog management, enrollment analytics, certification oversight
- Admin panel — user management, moderation, system analytics, audit logs, data export
- Real-time notifications via Socket.IO WebSocket gateway
- Workforce intelligence module — skill analytics and demand insights
- Media uploads via Cloudinary (avatars, course thumbnails, documents)
- Email notifications via Nodemailer
- Role-based access control (RBAC) across all protected routes
- Responsive web UI with mobile navigation support

**Out of Scope:**
- Native mobile application (Android / iOS)
- Payment gateway integration (MTN Mobile Money / Stripe)
- Video hosting / streaming infrastructure (currently external URLs only)
- Multi-language / localization support
- Offline / PWA mode

### 2.2 Project Milestones

| Milestone | Target Date | Status |
|---|---|---|
| Requirements Gathering & SRS | 05/04/2026 | ✔ Completed |
| Database Schema & API Design | 12/04/2026 | ✔ Completed |
| Backend Core Development | 01/05/2026 | ✔ Completed |
| Frontend Core Development | 15/05/2026 | ✔ Completed |
| LMS, Mentorship & Certifications | 25/05/2026 | ✔ Completed |
| Admin Panel & Analytics | 30/05/2026 | ✔ Completed |
| Testing & Bug Fixes | 02/06/2026 | ✔ Completed |
| Deployment & Handover | 03/06/2026 | ✔ Completed |

---

## 3. System Architecture

### 3.1 Architecture Overview

Hanga Works follows a decoupled client-server architecture. The React SPA (frontend) communicates exclusively with the NestJS REST API (backend) over HTTPS using JSON payloads and Bearer JWT tokens for authentication. The backend persists all data to a PostgreSQL database via Prisma ORM and uses Redis for API response caching on high-frequency public endpoints. Real-time events (notifications, course completion) are delivered through a Socket.IO WebSocket gateway embedded in the NestJS server. Media files are uploaded to Cloudinary via the backend upload controller. Transactional emails are sent using Nodemailer.

```
Browser (React SPA)
        │
        │ HTTPS / REST + WebSocket
        ▼
  NestJS API Server
  ├── Auth Module (JWT + Refresh Tokens)
  ├── Jobs Module
  ├── Courses / LMS Module
  ├── Enrollment / Progress Module
  ├── Certifications Module
  ├── Mentorship Module
  ├── Notifications Module (Socket.IO Gateway)
  ├── Employer Module
  ├── Admin Module
  ├── Storage Module (Cloudinary)
  └── Intelligence Module
        │               │               │
        ▼               ▼               ▼
  PostgreSQL        Redis Cache     Cloudinary
  (Prisma ORM)     (ioredis)       (Media CDN)
```

### 3.2 Component Breakdown

| Component | Description |
|---|---|
| **Frontend** | React 18 SPA built with Vite, served as static files on Render. Handles all user interactions across 5 roles with role-aware routing and navigation. |
| **Backend / API** | NestJS v11 REST API with URI versioning (`/api/v1`). Modular architecture with dedicated modules per domain. Deployed on Render (Node.js service). |
| **Database** | PostgreSQL v15 hosted on Render's managed database (or external Render PostgreSQL). Accessed via Prisma ORM v5.22. |
| **Authentication** | JWT-based stateless auth with short-lived access tokens (1 day) and refresh token rotation stored in HTTP-only cookies. |
| **Caching** | Redis (ioredis) used for caching public course and job listings with 5-minute TTL to reduce database load. |
| **File Storage** | Cloudinary for profile avatars, course thumbnails, and document uploads. R2 (Cloudflare) configured as S3-compatible backup store for PDF certificates. |
| **Email Service** | Nodemailer with Gmail App Password for transactional emails (welcome, password reset, course completion). SendGrid API key also configured. |
| **Real-time** | Socket.IO WebSocket gateway on the NestJS server for live notification delivery to connected clients. |
| **PDF Generation** | PDFKit used server-side to generate certificate PDFs on course completion. |

### 3.3 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | v18.3.1 |
| Frontend Build Tool | Vite | v5.4.0 |
| Frontend Language | TypeScript | v5.5.0 |
| Frontend Routing | React Router DOM | v6.26.0 |
| Frontend HTTP Client | Axios | v1.7.0 |
| Frontend State | React useState / Context API | — |
| Backend Framework | NestJS | v11.x |
| Backend Language | TypeScript / Node.js | v5.0 / ≥18 |
| ORM | Prisma | v5.22.0 |
| Database | PostgreSQL | v15.x |
| Cache | Redis (ioredis) | v5.10.1 |
| Authentication | Passport.js + JWT | v0.7.0 |
| Real-time | Socket.IO | v4.8.3 |
| Media Storage | Cloudinary SDK | v2.10.0 |
| PDF Generation | PDFKit | v0.18.0 |
| Email | Nodemailer | v8.0.10 |
| API Documentation | Swagger (NestJS Swagger) | v11.4.4 |
| Hosting (Frontend) | Render Static Site | — |
| Hosting (Backend) | Render Web Service | — |
| Version Control | Git + GitHub | — |
| CI/CD | Manual deploy via Render GitHub integration | — |

---

## 4. Features & Functionality

### 4.1 Feature List

| Feature | Description | Status |
|---|---|---|
| Multi-role Registration & Login | Learner, Employer, Institution, Mentor, Admin accounts with role-aware redirects | ✔ Done |
| JWT Authentication & Refresh Tokens | Secure stateless auth with token rotation | ✔ Done |
| Email Verification | Token-based email verification on registration | ✔ Done |
| Password Reset | Forgot password flow with email link and token expiry | ✔ Done |
| Learner Dashboard | Learning progress, job recommendations, activity timeline, skill demand | ✔ Done |
| Job Marketplace | Browse, search, filter by location/type/salary/skills, save, paginate | ✔ Done |
| Job Application Tracking | Apply to jobs, track status across APPLIED → HIRED pipeline | ✔ Done |
| Employer Dashboard | Post jobs, manage applicant pipeline, hiring analytics | ✔ Done |
| Applicant Kanban Board | Stage-based candidate management (Applied, Reviewing, Shortlisted, Hired, Rejected) | ✔ Done |
| Course Catalog | Browse, search, filter, enroll in published courses | ✔ Done |
| Course Creation & Management | Institution/Admin/Mentor can create, edit, and publish courses with modules | ✔ Done |
| Course Modules | Add text/notes, video URL, and document attachments to lessons | ✔ Done |
| Course Tests | Create multiple-choice tests with auto-grading and configurable passing score | ✔ Done |
| Enrollment & Progress | Enroll in courses, track progress percentage, mark complete | ✔ Done |
| Digital Certifications | Auto-issue PDF certificates on course completion with unique verification code | ✔ Done |
| Certificate Verification | Public URL to verify any certificate by code | ✔ Done |
| Mentorship Profiles | Mentors create profiles with expertise, bio, rate, availability | ✔ Done |
| Session Booking | Learners book sessions with mentors, mentors manage schedule | ✔ Done |
| Institution Dashboard | Manage courses, view enrollment stats, oversee certifications | ✔ Done |
| Admin Panel | Manage all users, moderate content, view system analytics, export data | ✔ Done |
| Real-time Notifications | Live in-app notifications via Socket.IO WebSocket gateway | ✔ Done |
| Media Uploads | Profile pictures and course thumbnails via Cloudinary | ✔ Done |
| Workforce Intelligence | Skill demand analytics and workforce insights dashboard | ✔ Done |
| Audit Logs | All significant system actions logged with actor and metadata | ✔ Done |
| Rate Limiting | Global API throttle — 300 requests/minute per IP | ✔ Done |
| Responsive UI | Mobile-friendly layout with hamburger navigation | ✔ Done |

### 4.2 User Roles & Permissions

| Role | Permissions & Access |
|---|---|
| **Admin** | Full system access — manage all users, view all data, moderate content, export reports, access audit logs |
| **Employer** | Post and manage job listings, view and manage applicants, access hiring pipeline and analytics |
| **Institution** | Create and publish courses, manage modules and tests, view enrolled learners, oversee issued certificates |
| **Mentor** | Create mentor profile, manage session bookings, create and manage courses |
| **Learner** | Browse jobs and apply, enroll in courses, track progress, earn certificates, book mentor sessions |
| **Public / Guest** | View public job listings and course catalog — no account required for browsing |

---

## 5. Database Design

### 5.1 Entity Relationship Overview

The database is relational (PostgreSQL) with the following primary entity relationships:

- **User** belongs to one **Organization** (optional); has many **Applications**, **Enrollments**, **Certifications**, **UserSkills**, **Notifications**, **RefreshTokens**, **AuditLogs**, **TestAttempts**
- **Organization** (type: EMPLOYER or INSTITUTION) has many **Jobs**, **Courses**, **Users**, **Certifications**
- **Job** belongs to one **Organization** (employer); has many **Applications**, **JobSkills**
- **Course** belongs to one **Organization** (institution); has many **CourseModules**, **Enrollments**, **Certifications**, **CourseSkills**, one **CourseTest**
- **CourseTest** has many **TestQuestions**; each **TestQuestion** has many **TestOptions**
- **MentorProfile** belongs to one **User**; has many **MentorSessions**
- **Certification** belongs to one **User**, one **Course**, one **Organization** (issuer)

### 5.2 Key Tables

| Table | Key Fields | Relationships | Description |
|---|---|---|---|
| `User` | id, name, email, passwordHash, role, status, organizationId, avatarUrl, emailVerified | Belongs to Organization; has many Applications, Enrollments, Certifications, UserSkills | All registered platform users |
| `Organization` | id, name, type (EMPLOYER/INSTITUTION), website | Has many Users, Jobs, Courses, Certifications | Companies and training institutions |
| `Job` | id, title, slug, description, location, jobType, salaryMin, salaryMax, isActive, employerId | Belongs to Organization; has many Applications, JobSkills | Job postings |
| `Application` | id, userId, jobId, status, appliedAt, updatedAt | Belongs to User and Job | Job applications with pipeline status |
| `Course` | id, title, slug, description, published, thumbnailUrl, institutionId | Belongs to Organization; has many Modules, Enrollments, Certifications | Published training courses |
| `CourseModule` | id, courseId, title, content, videoUrl, order | Belongs to Course | Individual lesson units within a course |
| `Enrollment` | id, userId, courseId, progress, status, startedAt, completedAt | Belongs to User and Course | Tracks learner progress per course |
| `Certification` | id, code, userId, courseId, issuerId, pdfUrl, issuedAt | Belongs to User, Course, Organization | Issued digital credentials |
| `MentorProfile` | id, userId, expertise, bio, hourlyRate, availability | Belongs to User; has many MentorSessions | Mentor public profiles |
| `MentorSession` | id, mentorId, menteeId, status, scheduledAt, durationMinutes | Belongs to MentorProfile and User (mentee) | Booked mentorship sessions |
| `CourseTest` | id, courseId, instructions, passingScore | Belongs to Course; has many TestQuestions | Assessment attached to a course |
| `Notification` | id, userId, type, payload, read, createdAt | Belongs to User | In-app notification records |
| `AuditLog` | id, actorId, action, meta, createdAt | Belongs to User (actor) | System-wide action audit trail |
| `Skill` | id, name, tag | Has many UserSkills, JobSkills, CourseSkills | Global skills taxonomy |

---

## 6. API Documentation

| Field | Value |
|---|---|
| **Base URL** | `https://hanga-works-api.onrender.com/api/v1` |
| **Authentication** | Bearer Token (JWT) — include in `Authorization: Bearer <token>` header |
| **Content-Type** | `application/json` |
| **API Docs (Swagger)** | `https://hanga-works-api.onrender.com/api/docs` |

### 6.1 Key Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register a new user account | No |
| POST | `/auth/login` | Log in and receive JWT access token | No |
| POST | `/auth/refresh` | Refresh access token using refresh cookie | No |
| POST | `/auth/logout` | Revoke refresh token and sign out | Yes |
| GET | `/auth/profile` | Get current authenticated user profile | Yes |
| GET | `/users/:id` | Get public user profile by ID | Yes |
| PATCH | `/users/me` | Update current user profile, bio, skills | Yes |
| GET | `/jobs` | List all active jobs with filters (search, location, type, salary) | No |
| GET | `/jobs/:id` | Get full job detail by ID | No |
| POST | `/jobs` | Create a new job posting | Yes (Employer/Admin) |
| PATCH | `/jobs/:id` | Update a job posting | Yes (Employer/Admin) |
| DELETE | `/jobs/:id` | Delete a job posting | Yes (Employer/Admin) |
| GET | `/applications` | Get current user's applications | Yes |
| POST | `/applications` | Submit a job application | Yes (Learner) |
| PATCH | `/applications/:id/status` | Update application stage | Yes (Employer/Admin) |
| GET | `/courses` | List all published courses | No |
| GET | `/courses/manage` | List courses manageable by current user | Yes (Institution/Admin/Mentor) |
| GET | `/courses/:id` | Get course detail with modules | No |
| POST | `/courses` | Create a new course | Yes (Institution/Admin/Mentor) |
| PATCH | `/courses/:id` | Update course details | Yes (Institution/Admin/Mentor) |
| DELETE | `/courses/:id` | Delete a course (no enrollments) | Yes (Institution/Admin) |
| POST | `/courses/:id/modules` | Add a module to a course | Yes (Institution/Admin/Mentor) |
| PATCH | `/courses/:id/modules/:moduleId` | Update a module | Yes (Institution/Admin/Mentor) |
| POST | `/courses/:id/test` | Create or replace a course test | Yes (Institution/Admin/Mentor) |
| GET | `/courses/:id/test` | Get course test questions | Yes |
| POST | `/courses/:id/test/attempt` | Submit test answers | Yes (Learner) |
| POST | `/enrollments` | Enroll in a course | Yes (Learner) |
| GET | `/progress` | Get learner's enrolled courses and progress | Yes |
| PATCH | `/progress/:enrollmentId` | Update lesson progress | Yes |
| GET | `/certificates` | Get current user's certificates | Yes |
| GET | `/certificates/verify/:code` | Publicly verify a certificate by code | No |
| GET | `/certificates/:code/download` | Download certificate PDF | Yes |
| GET | `/mentors` | List all mentor profiles | No |
| GET | `/mentors/:id` | Get a mentor's public profile | No |
| POST | `/mentor-profile` | Create or update mentor profile | Yes (Mentor) |
| POST | `/sessions` | Book a mentor session | Yes (Learner) |
| GET | `/sessions/me` | Get current user's sessions | Yes |
| PATCH | `/sessions/:id/status` | Accept or reject a session | Yes (Mentor) |
| GET | `/notifications` | Get current user's notifications | Yes |
| PATCH | `/notifications/:id/read` | Mark a notification as read | Yes |
| GET | `/analytics/employer` | Employer hiring analytics | Yes (Employer/Admin) |
| GET | `/admin/users` | List all users | Yes (Admin) |
| PATCH | `/admin/users/:id/status` | Suspend or activate a user | Yes (Admin) |
| GET | `/admin/stats` | System-wide platform statistics | Yes (Admin) |
| POST | `/media/upload` | Upload a file to Cloudinary | Yes |

---

## 7. Security

### 7.1 Authentication & Authorization

- JWT-based stateless authentication. Access tokens expire after **1 day**; refresh tokens are stored as HTTP-only cookies and rotated on each use.
- Role-Based Access Control (RBAC) enforced on all protected routes using `@Roles()` decorator and a global `RolesGuard`.
- `JwtAuthGuard` applied to all authenticated endpoints; `OptionalJwtAuthGuard` used for endpoints supporting both authenticated and public access.
- Refresh token revocation is persisted in the `RefreshToken` table with `isRevoked` flag, preventing token reuse after logout.

### 7.2 Data Protection

- All passwords hashed using **bcryptjs** with 10 salt rounds — plaintext passwords are never stored.
- All API communication transmitted over **HTTPS/TLS** — enforced by Render's infrastructure.
- Database connection uses SSL in production via the `DATABASE_URL` connection string.
- Sensitive environment variables (JWT secrets, API keys, database credentials) stored as Render environment variables — never committed to version control.

### 7.3 Input Validation & Sanitization

- All incoming request payloads validated server-side using **class-validator** decorators on NestJS DTOs.
- `ValidationPipe` configured globally with `whitelist: true` (strips unknown fields) and `forbidNonWhitelisted: true` (rejects requests with unexpected fields).
- `@Transform` decorators used to sanitize optional fields (e.g., empty strings converted to `undefined` before validation).
- SQL injection prevention via Prisma ORM's parameterized query builder — raw SQL is not used.
- XSS protection provided by **Helmet.js** middleware which sets Content Security Policy and other security HTTP headers.

### 7.4 Rate Limiting

- Global throttler applied via `@nestjs/throttler` — **300 requests per minute** per IP address.
- Configurable via `ThrottlerModule` in `AppModule`.

### 7.5 CORS

- CORS configured to allow requests from `localhost:5173` (development), all `*.onrender.com` subdomains, all `*.vercel.app` subdomains, and the configurable `FRONTEND_URL` environment variable.

---

## 8. Testing & Quality Assurance

### 8.1 Testing Approach

| Test Type | Tool / Method | Coverage |
|---|---|---|
| Unit Testing | Jest + ts-jest | Core service logic — CoursesService, JobsService, CertificationsService, ProgressService |
| Integration Testing | Supertest + Jest | Key API endpoints tested with mock Prisma providers |
| Manual QA | Browser testing across Chrome, Firefox, Edge | All major user flows per role |
| UAT | Development team walkthrough | All 5 role flows validated end-to-end |
| Performance / Rate Limit | Manual stress testing | Rate limiter verified at 300 req/min threshold |

### 8.2 Known Issues & Bugs

| ID | Description | Severity | Status |
|---|---|---|---|
| BUG-001 | WebSocket connection fails when Redis is unavailable — falls back gracefully but no reconnect | Low | Open |
| BUG-002 | Course thumbnail upload fails when Cloudinary credentials are misconfigured — course still creates without thumbnail | Low | Open |
| BUG-003 | Mobile filter sidebar on job list and course list requires scroll on small screens | Low | Open |
| BUG-004 | Session booking does not send email confirmation to mentor | Medium | Open |

---

## 9. System Setup & Running the System

### 9.1 Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | v18.x or higher | https://nodejs.org |
| npm | v9.x or higher | Bundled with Node.js |
| PostgreSQL | v15.x | https://postgresql.org — or use a hosted service |
| Redis | v7.x | https://redis.io — required for caching and sessions |
| Git | Any recent version | https://git-scm.com |

### 9.2 Environment Variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"

# Authentication
JWT_SECRET="your-jwt-secret-key"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Server
PORT=3000
APP_URL=http://localhost:3000

# Email
APP_PASSWORD="your-gmail-app-password"
SENDGRID_API_KEY=""

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_FOLDER="hanga-works"
CLOUDINARY_UPLOAD_PRESET=""

# S3 / R2 (for PDF certificate storage)
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_BUCKET=hanga-certs
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_PUBLIC_URL=https://pub-xxx.r2.dev
```

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 9.3 Installation & Setup

**Step 1 — Clone the Repository**
```bash
git clone https://github.com/ReponseBlaise/Hanga-Works.git
cd Hanga-Works
```

**Step 2 — Install Backend Dependencies**
```bash
cd backend
npm install
```

**Step 3 — Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

**Step 4 — Configure Environment Variables**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Then fill in all required values
```

**Step 5 — Set Up the Database**
```bash
cd backend

# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# (Optional) Seed initial data
npm run prisma:seed
```

### 9.4 Running the System

**Development Mode**

Terminal 1 — Backend:
```bash
cd backend
npm run dev
# API running at: http://localhost:3000/api/v1
# Swagger docs at: http://localhost:3000/api/docs
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
# App running at: http://localhost:5173
```

**Production Mode**
```bash
# Build frontend
cd frontend && npm run build

# Start backend
cd backend && npm run start
```

### 9.5 Accessing the System

| Interface | URL | Notes |
|---|---|---|
| Web App (Frontend) | http://localhost:5173 (dev) / https://hanga-works.onrender.com (prod) | — |
| API Base URL | http://localhost:3000/api/v1 | JWT Bearer token required for protected endpoints |
| API Docs (Swagger) | http://localhost:3000/api/docs | Interactive API explorer |
| Admin Panel | https://hanga-works.onrender.com/admin | Requires Admin role account |

### 9.6 Useful Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Start backend development server with hot reload |
| `npm run build` | Compile TypeScript and build backend for production |
| `npm run start` | Start compiled backend in production mode |
| `npm run test` | Run all Jest test suites |
| `npm run lint` | Lint TypeScript source files |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:migrate` | Create and apply a new database migration (dev) |
| `npm run prisma:studio` | Open Prisma Studio database browser |
| `npm run prisma:seed` | Seed the database with initial data |
| `vite` (frontend) | Start frontend dev server |
| `tsc && vite build` (frontend) | Build frontend for production |

---

## 10. Deployment

### 10.1 Hosting Infrastructure

| Service | Provider | Details |
|---|---|---|
| Frontend Hosting | Render (Static Site) | Auto-deploys from `main` branch on GitHub push |
| Backend Hosting | Render (Web Service) | Node.js service, root directory: `backend/`, build: `npm run build`, start: `npm start` |
| Database | Render PostgreSQL / External | PostgreSQL 15, connection via `DATABASE_URL` env variable |
| Media Storage | Cloudinary | Profile pictures, course thumbnails, document uploads |
| PDF / File Storage | Cloudflare R2 | Certificate PDFs stored in `hanga-certs` bucket |
| SSL Certificate | Render-managed (Let's Encrypt) | Auto-renewed, HTTPS enforced |

### 10.2 CI/CD Pipeline

- Push to GitHub `main` branch → Render detects change and triggers automated redeploy
- Backend build process: `npm install` → `prisma generate` → `prisma migrate deploy` → `tsc` (via `build.js`)
- Frontend build process: `tsc && vite build` → static files served from `dist/`
- No automated test step in CI pipeline currently — tests run manually pre-push

### 10.3 Render Build Configuration

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm run build` |
| Start Command | `npm start` |
| Node.js Version | ≥18 (specified in `package.json` engines field) |

### 10.4 Backup & Recovery

- Render PostgreSQL managed database includes automated daily backups with 7-day retention on paid plans.
- Database can be restored via Render dashboard → Database → Backups.
- To restore manually: `pg_restore -d DATABASE_URL backup.dump`

---

## 11. Maintenance & Monitoring

### 11.1 Monitoring Tools

| Tool | Purpose | Access |
|---|---|---|
| Render Dashboard | Service health, deploy logs, resource usage | https://dashboard.render.com |
| Render Log Stream | Live application logs | Render Dashboard → Service → Logs |
| Swagger UI | API endpoint health verification | `/api/docs` |
| Browser DevTools | Frontend error monitoring | Browser console |

### 11.2 Maintenance Schedule

| Frequency | Task |
|---|---|
| Daily | Check Render service health and application logs |
| Weekly | Review failed requests in logs, verify database backup completion |
| Monthly | Rotate API keys (Cloudinary, SendGrid), review user activity, apply minor dependency patches |
| Quarterly | Full dependency audit (`npm audit`), performance review, security scan, Prisma migration review |

---

## 12. Known Limitations & Future Recommendations

### 12.1 Current Limitations

- No native mobile application — web only, responsive design for mobile browsers
- No payment gateway — mentorship sessions and premium features are not monetized yet
- Video hosting relies on external URLs (YouTube, Vimeo) — no built-in video storage or streaming
- Redis dependency — if Redis is unavailable, caching falls back gracefully but rate limiting may behave inconsistently
- No offline / PWA support — requires active internet connection
- Bulk data import not available — administrators must create records individually or via seed scripts
- Email delivery depends on Gmail App Password — a dedicated transactional email service (SendGrid / AWS SES) is recommended for production scale

### 12.2 Recommended Future Enhancements

| Recommendation | Priority | Estimated Effort |
|---|---|---|
| Native mobile app (React Native — Android & iOS) | High | 3–4 months |
| Payment integration (MTN Mobile Money / Stripe) for session bookings | High | 3–5 weeks |
| Video hosting and HLS streaming (AWS MediaConvert / Cloudflare Stream) | High | 4–6 weeks |
| Advanced workforce intelligence — ML-based job-skill matching | Medium | 6–8 weeks |
| Multi-language support (English, French, Kinyarwanda) | Medium | 2–3 weeks |
| PWA / offline mode | Medium | 4–6 weeks |
| Automated CI/CD with GitHub Actions (tests → build → deploy) | Medium | 1–2 weeks |
| Dedicated monitoring (Sentry for errors, UptimeRobot for uptime) | Low | 1 week |
| Bulk CSV import for jobs, users, and courses | Low | 2–3 weeks |
| Advanced analytics dashboard with charts and exports | Low | 3–4 weeks |

---

## 13. Support & Contact Information

| Role | Contact |
|---|---|
| **Lead Developer** | Hanga Works Dev Team — dev@hanga-works.rw |
| **Technical Support** | support@hanga-works.rw |
| **Issue Tracker** | https://github.com/ReponseBlaise/Hanga-Works/issues |
| **Repository** | https://github.com/ReponseBlaise/Hanga-Works |
| **API Documentation** | https://hanga-works-api.onrender.com/api/docs |
| **Support Hours** | Mon–Fri, 8:00 AM – 6:00 PM CAT |

---

## 14. Appendices

### Appendix A — Glossary

| Term | Definition |
|---|---|
| API | Application Programming Interface — a set of rules allowing systems to communicate |
| JWT | JSON Web Token — a compact, URL-safe token used for stateless authentication |
| RBAC | Role-Based Access Control — restricts system access based on assigned user roles |
| ORM | Object-Relational Mapper — abstracts SQL database queries into code objects (Prisma) |
| SPA | Single-Page Application — a web app that loads one HTML page and dynamically updates content |
| LMS | Learning Management System — software for creating, managing, and delivering educational courses |
| CI/CD | Continuous Integration / Continuous Deployment — automated build, test, and release pipeline |
| DTO | Data Transfer Object — a typed object used to validate and shape incoming API request data |
| CDN | Content Delivery Network — distributed servers that deliver media files with low latency |
| WebSocket | A persistent bidirectional communication protocol used for real-time features |
| Prisma | A modern TypeScript ORM used to interact with the PostgreSQL database |
| Redis | An in-memory key-value store used for caching and rate limiting |
| Render | Cloud hosting platform used to deploy both the frontend and backend of Hanga Works |
| Cloudinary | Cloud-based media management service for image and video uploads |

### Appendix B — References

- NestJS Documentation: https://docs.nestjs.com
- Prisma Documentation: https://www.prisma.io/docs
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev
- PostgreSQL Documentation: https://www.postgresql.org/docs
- Cloudinary Documentation: https://cloudinary.com/documentation
- Socket.IO Documentation: https://socket.io/docs/v4
- Render Deployment Docs: https://render.com/docs
- JWT Standard: https://jwt.io/introduction
- Project Repository: https://github.com/ReponseBlaise/Hanga-Works

---

*— End of Technical Report —*

*© 2026 Hanga Works. All Rights Reserved.*
*This document is confidential and intended solely for authorized recipients.*
