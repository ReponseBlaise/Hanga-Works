# HANGA WORKS — 2-Week Sprint Plan v2.0 (Blaise)

Phase 1 · 4 Developers · Node.js · React · PostgreSQL · GitHub · Render · Vercel

---

## 1. Technology Stack

Layer | Technology | Details & Rationale
---|---|---
Frontend | React 18 + TypeScript | Vite build tool, React Router v6, TanStack Query, Tailwind CSS. Deployed to Vercel with automatic preview per PR.
Backend API | Node.js + NestJS + TypeScript | NestJS modular architecture with decorators, DI, Guards for RBAC. OpenAPI/Swagger docs. REST at `/api/v1/`.
Database | Prisma + PostgreSQL | Prisma schema as single source of truth. Migrations via `prisma migrate`. Hosted PostgreSQL on Render.
Auth | JWT + Passport.js | `passport-jwt` strategy. Access tokens 15 min, refresh tokens 7 days in httpOnly cookies. RBAC guards.
Cache | Redis (ioredis) | Session management, rate limiting, course listing cache, notification queues.
Real-time | Socket.io | WebSocket server on NestJS. `socket.io-client` on React for live notifications and status updates.
Storage | S3 / Cloudflare R2 | Certificate PDFs, course media, profile photos. Presigned URLs for secure upload.
Email | SendGrid | Transactional emails: registration, application updates, course completion, cert issued.
CI/CD | GitHub Actions | On PR: `tsc`, `eslint`, `jest`. On merge to `main`: auto-deploy to Render (API) and Vercel (Web).

---

## 2. Repository & Project Structure

Two repositories under the team org:

- `hanga-works-backend` (NodeJS / Render)
- `hanga-works-frontend` (React / Vercel)

Suggested top-level layout (backend):

- `src/auth/` ← JWT, Passport, Guards
- `src/users/` ← User module + RBAC
- `src/lms/` ← Courses, Progress, Quiz
- `src/jobs/` ← Listings, Applications
- `src/certifications/` ← Issue, Verify, PDF
- `src/notifications/` ← SendGrid, Socket.io
- `src/employer/` ← ATS, Dashboard
- `src/analytics/` ← Metrics endpoints
- `src/prisma/` ← Prisma service
- `src/redis/` ← Redis service
- `src/common/` ← Filters, Pipes

Prisma:

- `prisma/schema.prisma`
- `prisma/seed.ts`

Frontend layout (high level):

- `src/components/ui/` ← Shared UI components
- `src/components/layout/` ← Sidebar, Topbar
- `src/components/shared/` ← ProgressBar, Avatar
- `src/pages/auth/` ← Login, Register
- `src/pages/dashboard/` ← Dashboard
- `src/pages/courses/` ← CourseList, Detail
- `src/pages/jobs/` ← JobList, Apply
- `src/pages/profile/` ← Profile page
- `src/pages/employer/` ← Employer pages
- `src/features/` ← Feature hooks
- `src/services/` ← API service layer
- `src/types/` ← TypeScript types
- `src/utils/` ← Helper functions

---

## 3. Updated Team Assignments (v2.0)

**YVES — Backend Developer**
- Prisma schema & seed data
- LMS module (courses, progress, quiz)
- Jobs marketplace API
- Certifications module
- Analytics & job matching
- Redis caching (ioredis)
- Swagger / OpenAPI docs

**LEON — Backend Developer**
- NestJS scaffold & setup
- JWT / Passport auth + RBAC
- Notifications (SendGrid + Socket.io)
- Employer ATS module
- Security hardening
- Production deploy (Render)
- Database migrations

**ROSINE — Frontend Developer**
- UI template & design reference
- Auth screens (login, register)
- LMS UI (courses, progress)
- Job marketplace UI
- Skill profile UI
- UI polish & mobile responsive
- Accessibility (WCAG 2.1 AA)

**BLAISE — Frontend Developer**
- React scaffold + Tailwind setup
- Dashboard layout + sidebar nav
- GitHub Actions CI/CD
- Employer dashboard + ATS kanban
- Admin panel
- Lighthouse performance audit
- Vercel production deploy

---

## 4. Week 1 — Foundation & Design (Days 1–5)

**Day 1 — Kickoff & Scaffold**

All: [MEETING] Project kickoff (2 hours) — align SRS Phase 1 scope, TypeScript strict mode, ESLint/Prettier, shared tsconfig, Git branching strategy (feature → develop → main), daily standups.

**Day 1 — Leon: NestJS scaffold & full project structure**
- `npx @nestjs/cli new hanga-works-backend --strict`
- Create folder placeholders per agreed structure and `.env` with required variables
- Connect Prisma to PostgreSQL, push repo and create `develop` branch, add branch protection

**Day 1 — Yves: Prisma schema & seed data**
- Define models: `User`, `Course`, `Module`, `Enrollment`, `Progress`, `Job`, `Application`, `Certificate`, `SkillTag`
- Write `prisma/seed.ts` with 20 learners, 5 employers, 10 courses, 20 jobs
- Run `npx prisma migrate dev --name init` and verify with `npx prisma studio`

**Day 1 — Blaise: React scaffold + Tailwind + routing**
- `npm create vite@latest hanga-works-frontend -- --template react-ts`
- Install `tailwindcss`, `react-router-dom`, `@tanstack/react-query`, `axios`, `socket.io-client`
- Set up routes in `App.tsx`, create `src/services/api.ts` (axios instance), push repo and link to Vercel

**Day 1 — Rosine: UI template & design reference (Figma)**
- Duplicate a free Figma template for job/LMS dashboard and share link with team


**Days 2–3 — Auth, LMS API & CI/CD**

**Day 2–3 — Leon: Auth module — JWT + Passport + RBAC**
- Files: `src/auth/auth.module.ts`, `auth.controller.ts`, `auth.service.ts`, `strategies/jwt.strategy.ts`, `guards/jwt-auth.guard.ts`, `guards/roles.guard.ts`, `decorators/roles.decorator.ts`, `dto/register.dto.ts`, `dto/login.dto.ts`
- Endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- Access token 15 min; refresh token 7 days in httpOnly cookie

**Day 2–3 — Yves: LMS module — courses, enrollment, progress**
- `src/lms/courses/`, `enrollment/`, `progress/` with controllers, services and DTOs
- Endpoints: `GET /courses`, `GET /courses/:id`, `POST /enrollments`, `PATCH /progress/:moduleId`, `POST /quiz/:id/submit`
- Redis cache for course listing (TTL 5 min) and Jest unit tests

**Day 2–3 — Rosine: Auth screens + dashboard shell (React)**
- `src/pages/auth/Login.tsx`, `Register.tsx`, `VerifyEmail.tsx`
- `src/features/auth/useAuth.ts`, `src/services/auth.service.ts`
- Protected routes via auth context; connect to Leon's auth API

**Day 2–3 — Blaise: Dashboard layout + sidebar nav**
- `src/components/layout/Sidebar.tsx`, `Topbar.tsx`, `DashboardLayout.tsx`
- `src/components/ui/Button.tsx`, `Input.tsx`, `Card.tsx`, `Badge.tsx`
- `src/components/shared/NotificationBell.tsx`, `Avatar.tsx`
- TanStack Query setup and axios instance; branch `feature/dashboard-layout`

**Day 4 — Mid-Sprint Sync & Features**

All: [MEETING] Mid-sprint sync (1 hour) — review Swagger, finalise Job/LMS request/response shapes, demo React preview, identify blockers.

**Day 4 — Yves: Jobs marketplace API**
- Files: `src/jobs/jobs.module.ts`, `jobs.controller.ts`, `jobs.service.ts`, DTOs
- Endpoints: `POST /jobs`, `GET /jobs` (filters), `GET /jobs/:id`, `POST /jobs/:id/apply`, `PATCH /applications/:id/status`

**Day 4 — Leon: Notifications — SendGrid + Socket.io**
- Files: `src/notifications/notifications.module.ts`, `notifications.gateway.ts`, `notifications.service.ts`
- SendGrid events for registration, application updates, course complete, cert issued
- Socket.io events: job-match, application-status, course-complete

**Day 4 — Rosine: LMS UI — course browser + progress**
- `src/pages/courses/CourseList.tsx`, `CourseDetail.tsx`
- `src/components/shared/ProgressBar.tsx`
- `src/features/lms/useCourses.ts`, `useProgress.ts`

**Day 4 — Blaise: GitHub Actions CI/CD + Vercel**
- File: `.github/workflows/ci.yml` — on PR run `tsc --noEmit`, `eslint`, `jest`
- On merge to `main` Vercel auto-deploys; set `VITE_API_URL` in Vercel
- Branch: `feature/cicd`

**Day 5 — Week 1 Wrap & Staging**

All: [REVIEW] PR reviews, integration merge & staging deploy — smoke test critical flows.

[MEETING] Week 1 retro + Week 2 planning — demo on staging and update backlog.

---

## 5. Week 2 — Features, Polish & Deploy (Days 6–10)

**Day 6 — Certifications & Marketplace UI**
- Yves: Certifications module — PDF generation, upload to S3/R2, `GET /certificates/verify/:token`, `POST /certificates/validate`
- Leon: Employer ATS module — job pipeline stages (protected)
- Rosine: Job marketplace UI
- Blaise: Employer dashboard + ATS kanban (frontend)

**Days 7–8 — Analytics, Profiles & Admin**
- Yves: Analytics endpoints & job matching (`GET /analytics/overview`, `GET /jobs/recommended`)
- Rosine: Skill profile UI & UI polish
- Blaise: Admin panel & hooks (user list, moderation queue, platform stats)

**Day 9 — QA, Security & Performance**
- All: Full QA pass on staging; accessibility checks and bug logging
- Leon: Security hardening — `helmet`, `@nestjs/throttler`, secrets scan
- Blaise: Performance audit — Lighthouse target > 90, code-splitting, WebSocket reconnection checks

**Day 10 — Production Deploy & Demo**
- Leon: Production deploy to Render — merge `develop` → `main`, run `npx prisma migrate deploy`, verify backups and HTTPS
- Blaise: Vercel production deploy — confirm env vars and frontend connectivity, final mobile sweep
- Final demo & handoff: Blaise covers CI/CD + employer dashboard

---

## 6. CI/CD Pipeline Summary

1. Developer pushes feature branch → 2. GitHub Actions runs `tsc`, `eslint`, `jest` → 3. PR opened + 1 approving review → 4. Merge to `main` → Auto-deploy

Environment variables are never committed to GitHub; set in Render (API) and Vercel (Web) only.

---

## 7. Non-Functional Requirements

Category | Requirement | Target | How we meet it
---|---:|---|---
Performance | Page load (P95) | < 2 seconds | Vercel CDN + Vite code-splitting + React.lazy()
Performance | API response | < 500ms | Redis cache + Prisma connection pool
Performance | WebSocket latency | < 1 second | Socket.io on Render (same region as DB)
Security | Data in transit | TLS 1.2+ | Render + Vercel enforce HTTPS
Security | Auth | JWT + refresh | Passport.js strategy, httpOnly cookies
Security | Input validation | All endpoints | `class-validator` on DTOs
Scalability | Concurrent users | 10,000+ | Stateless NestJS + Render autoscale
Reliability | Uptime SLA | 99.5% | Render infra + daily PG backups
Usability | Onboarding | < 5 min | 3-step wizard, < 5 form fields per step
Usability | Accessibility | WCAG 2.1 AA | Tailwind a11y utilities + Axe CI scan

---

## 8. Sprint KPIs

- API endpoints (Swagger): 30+
- React pages / routes: 15+
- GitHub Actions workflows: 2
- Target Lighthouse score: 90+

- Job placement rate (Year 1): 25%+
- Course completion rate: 60%+
- 90-day retention target: 40%+
- Match accuracy (positive): 75%+

© 2026 HANGA WORKS. All rights reserved. — Sprint Plan v2.0 (Updated)
