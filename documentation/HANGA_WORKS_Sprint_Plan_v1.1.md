# HANGA WORKS Sprint Plan — v1.2

HANGA WORKS  
Skills, Employment & Workforce Intelligence Platform

**Phase 1 · Full-Stack TypeScript Team · 5 Engineers**  
Node.js · React · PostgreSQL · GitHub · Render · Vercel

---

## 1. Technology Stack

All components are implemented in TypeScript end-to-end, ensuring type safety across the full stack.

| Layer | Technology | Details |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript | Vite build tool, React Router v6, custom hooks for server state, CSS custom properties for styling. Deployed to Vercel. |
| Backend API | Node.js + NestJS + TypeScript | NestJS modular architecture with decorators, dependency injection, Guards for RBAC. OpenAPI/Swagger at `/api/docs`. REST at `/api/v1/`. |
| ORM / Database | Prisma 5.22.0 + PostgreSQL | Prisma schema as single source of truth. `prisma migrate deploy` on build. Hosted PostgreSQL on Render. |
| Auth | JWT + Passport.js | `passport-jwt` strategy. Access tokens (15 min), refresh tokens (7 days). RBAC via NestJS Guards and `@Roles()` decorator. |
| Caching | Redis (ioredis) | Session management, rate limiting, course listing cache, notification queues. |
| Real-time | Socket.io | WebSocket Gateway on NestJS. In-app notifications and live application status updates. |
| File Storage | Cloudinary + S3-compatible | Certificate PDFs, course media, profile photos. Presigned URLs for secure client upload. |
| Email | SendGrid | Transactional emails: registration, application updates, course completion, certificate issued. |
| Version Control | GitHub | Monorepo (`Hanga-Works/`). Branch protection on `main`. Required PR reviews + CI pass before merge. |
| CI/CD — Backend | GitHub Actions → Render | On merge to `main`: run `tsc`, `eslint`, `jest`, then deploy. `build.js` pins Prisma 5.22.0 before generate. |
| CI/CD — Frontend | Vercel GitHub integration | Automatic preview URL per PR branch, production deploy on merge to `main`. |

---

## 2. Repository & Project Structure

Single monorepo under `Hanga-Works/`:

```
Hanga-Works/
├── backend/                  ← NestJS API (Render)
│   ├── src/
│   │   ├── auth/             ← JWT, Passport, Guards
│   │   ├── users/            ← User module + RBAC
│   │   ├── lms/              ← Courses, Enrollment, Progress, Tests
│   │   ├── jobs/             ← Listings, Applications
│   │   ├── certifications/   ← Issue, Verify, PDF
│   │   ├── notifications/    ← SendGrid, Socket.io Gateway
│   │   ├── employer/         ← ATS, Dashboard, Analytics
│   │   ├── mentorship/       ← Profiles, Sessions, Reviews
│   │   ├── intelligence/     ← Skill gap, Career pathway, Matching
│   │   ├── analytics/        ← Metrics, Export
│   │   ├── admin/            ← Moderation, User management
│   │   └── storage/          ← Cloudinary, S3, Media upload
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── build.js              ← Pins Prisma 5.22.0 before generate
│
└── frontend/                 ← React app (Vercel)
    ├── src/
    │   ├── components/       ← Shared UI library + layout
    │   ├── pages/            ← Route-level components
    │   ├── features/         ← Auth, Jobs, LMS, Notifications
    │   ├── hooks/            ← Custom React hooks
    │   ├── services/         ← API client (fetch/axios)
    │   └── types/            ← Shared TS types / DTOs
    └── documentation/        ← SRS, sprint plan, ERD, DB design
```

**Branching strategy:**

| Branch | Purpose |
|--------|---------|
| `main` | Production. Protected — requires PR + CI pass + 1 review. Auto-deploys to Render and Vercel. |
| `develop` | Integration branch. Feature branches merge here first. |
| `feature/TASK-name` | One branch per task. E.g. `feature/intelligence-salary-benchmark`. |
| `hotfix/name` | Emergency fixes from `main`, merged back to both `main` and `develop`. |

---

## 3. Team Assignments

| Member | Role |
|--------|------|
| **Blaise** | Tech Lead · Backend |
| **Rosine** | Frontend Lead · UI/UX |
| **Yves** | Backend Dev · Features |
| **Leo** | Full-Stack · DevOps |
| **Lambert** | Frontend Dev *(joined Sprint 3)* |

---

## 4. Sprint 1 — Foundation & Auth (Days 1–5) ✅ COMPLETED

### Day 1 — Kickoff & Scaffold
- **All** — Project kickoff (2h): SRS Phase 1 scope, TypeScript strict mode, ESLint/Prettier, Git branching, API contract process, definition of done.
- **Blaise** — NestJS scaffold + Prisma schema: User, Role, Course, Module, Enrollment, Job, Application, Certificate models. First migration.
- **Leo** — React app scaffold with Vite, React Router v6, Vercel project setup.
- **Rosine** — Design system: colour tokens, typography, spacing. Component specs.
- **Yves** — Prisma schema relations, seed data (courses, jobs, employers).

### Days 2–3 — Auth, LMS API & CI/CD
- **Blaise** — NestJS Auth module: JWT + Passport + RBAC Guards. Endpoints: register, login, refresh, logout. Swagger docs.
- **Yves** — LMS NestJS module: CoursesModule, EnrollmentModule, ProgressModule. Redis cache for course listing.
- **Rosine** — Auth screens (login, register, verify-email). Dashboard shell. TanStack Query + axios.
- **Leo** — GitHub Actions CI/CD: `tsc`, `eslint`, `jest` on PR. Render deploy hook on merge.

### Day 4 — Mid-Sprint Sync & Features
- **All** — Mid-sprint sync (1h): Swagger review, API contract finalisation.
- **Yves** — Job Marketplace module: POST/GET jobs, filter by skill/location/type/salary, apply, track status.
- **Rosine** — LMS UI: course browser, video player, progress bar, quiz component.
- **Leo** — Notifications: SendGrid integration, Socket.io Gateway, notification bell component.

### Day 5 — Week 1 Wrap
- **All** — PR reviews, integration merge to `develop`, staging deploy. Smoke test: register → login → enrol → browse jobs.
- **All** — Week 1 retro + Week 2 planning (1h).

**✅ Week 1 Milestone** — Auth API live on Render staging · LMS + Jobs API in Swagger · React app on Vercel preview · CI green

---

## 5. Sprint 2 — Features, Polish & Deploy (Days 6–10) ✅ COMPLETED

### Day 6 — Certifications & Marketplace UI
- **Blaise + Yves** — CertificationsModule: PDF generation (pdfkit), S3 upload, verify endpoint. Employer cert validation.
- **Rosine + Leo** — Job marketplace UI: advanced filters, one-click apply, My Applications status view.

### Days 7–8 — Employer Dashboard, Profiles & Analytics
- **Blaise** — EmployerModule: ATS pipeline (applied → reviewing → shortlisted → hired/rejected), job post/management, employer analytics.
- **Rosine** — Skill Profile UI: skill tagging, proficiency selector, certificate badges, profile photo upload, shareable public profile.
- **Leo** — Employer dashboard UI, applicant pipeline board. Admin panel: user list, moderation queue, platform stats.
- **Yves** — AnalyticsModule: DAU/MAU, course completion rate, job matching score (skill overlap), CSV export.

### Day 9 — QA, Security & Performance
- **All** — Full QA pass on staging: end-to-end flows across all roles.
- **Blaise + Leo** — Security hardening: `helmet`, `@nestjs/throttler`, DTO whitelist, Prisma parameterised queries, Lighthouse audit.
- **Rosine** — UI polish: onboarding wizard, empty states, error boundaries, skeleton screens, mobile sweep.

### Day 10 — Production Deploy & Demo
- **Leo + Blaise** — Production deploy: `develop → main` PR, Render + Vercel production deploy, `prisma migrate deploy`, env vars verified.
- **All** — Final demo: architecture, UI walkthrough, API demo via Swagger, CI/CD pipeline overview. Phase 2 backlog logged in GitHub Issues.

**✅ Week 2 Milestone** — HANGA WORKS Phase 1 LIVE · All Phase 1 SRS features shipped

---

## 6. Sprint 3 — Final Sprint (Days 11–13) 🔴 IN PROGRESS

**Context:** 2 weeks completed. 3 additional days added to close all remaining SRS gaps. Lambert joins as the 5th engineer on frontend.

### Outstanding SRS Gaps Entering Sprint 3

| Gap | SRS Section |
|-----|-------------|
| Intelligence page shows skill UUIDs instead of names | §4.1 |
| No salary benchmarking endpoint or UI | §3.4 |
| No industry trend / skill demand heatmap | §3.4, §4.3 |
| No predictive career modelling UI | §4.4 |
| Mentor cannot accept, reject, or complete sessions | §3.7 |
| No session review/rating system | §3.7 |
| No employer job edit or delete | §3.6 |
| `/employer/jobs/:id/applicants` route broken | §3.6 |
| `AdminPanel.tsx` is empty | §3.9 |
| Profile `headline` field not persisted to backend | §3.1 |
| Mentor reviews not visible on public mentor profile | §3.7 |

---

### Day 11 — Backend Gaps + Intelligence Fixes

#### Blaise — Backend Lead
- `backend/src/intelligence/intelligence.service.ts` — fix `trendingSkillsToLearn` to join `Skill` table and return `skill.name`; add `getSalaryBenchmark(roleKeyword)` method; add `getIndustryTrends()` method (top skills by job demand).
- `backend/src/mentorship/mentorship.service.ts` — add `acceptSession`, `rejectSession`, `completeSession`, `addReview(sessionId, rating, feedback)`.
- Wire new mentorship endpoints: `PATCH /mentorship/sessions/:id/accept`, `/reject`, `/complete`, `POST /mentorship/sessions/:id/review`.

#### Rosine — Frontend: Intelligence
- `frontend/src/pages/intelligence/Intelligence.tsx` — fix trending skills UUID display; add salary benchmark section.
- `frontend/src/services/intelligence.service.ts` — add `getSalaryBenchmark(role)` and `getIndustryTrends()`.
- Create `frontend/src/pages/intelligence/IndustryTrends.tsx` — skill demand grid, links to related courses and jobs.
- `frontend/src/App.tsx` — add route `/intelligence/trends`.

#### Yves — Backend: Employer Edit/Delete
- `backend/src/employer/employer.service.ts` — add `updateJob(userId, jobId, dto)` and `deleteJob(userId, jobId)`.
- `backend/src/employer/employer.controller.ts` — wire `PATCH /employer/jobs/:id` and `DELETE /employer/jobs/:id`.

#### Leo — Frontend: Employer Fixes
- `frontend/src/pages/employer/EmployerDashboard.tsx` — fix broken `/employer/jobs/:id/applicants` link; add edit/delete buttons on job cards.
- Create `frontend/src/pages/employer/EditJob.tsx` — prefilled edit form.
- `frontend/src/App.tsx` — add route `/employer/jobs/:id/edit`.
- `frontend/src/services/employer.service.ts` — add `updateJob(id, data)` and `deleteJob(id)`.

#### Lambert — Frontend Onboarding + Home
- Read `README.md`, `frontend/src/App.tsx`, `frontend/src/services/` to understand service layer pattern.
- `frontend/src/pages/home/Home.tsx` — audit and polish: CTA buttons route correctly, hero reflects SRS §1.4 value proposition.
- `frontend/src/components/layout/Topbar.tsx` — verify nav links are role-aware.

---

### Day 12 — UI Features + Profile + Admin

#### Blaise — Deploy & Smoke Test
- Deploy all Day 11 backend changes to Render staging.
- Smoke test new endpoints: salary benchmark, industry trends, mentor session actions, job edit/delete.

#### Rosine — Career Modelling Page
- Create `frontend/src/pages/intelligence/CareerModelling.tsx` — role viability score, skill deprecation alerts, pivot pathway suggestions.
- `frontend/src/App.tsx` — add route `/intelligence/career-model`.
- Link new sub-pages from `Intelligence.tsx`.

#### Yves — Admin Panel
- `frontend/src/pages/admin/AdminPanel.tsx` — implement: user count stats, quick links to moderation/export, recent audit log list (wire to existing admin service).
- `frontend/src/pages/admin/AdminPanelPage.tsx` — confirm AdminPanel is imported and rendered correctly.

#### Leo — Profile & Notifications
- `frontend/src/pages/profile/Profile.tsx` — persist `headline` field in `updateProfile` call; fix skills not reloading on refresh.
- `frontend/src/services/auth.service.ts` — add `headline` to profile update DTO.
- `frontend/src/pages/notifications/Notifications.tsx` — add read/unread toggle and mark-all-read button.

#### Lambert — Mentor Reviews
- Create `frontend/src/pages/mentors/MentorReviews.tsx` — public list of ratings and reviews for a mentor.
- `frontend/src/pages/mentors/MentorProfile.tsx` — embed review list and average rating display.
- `frontend/src/services/mentorship.service.ts` — add `getMentorReviews(mentorProfileId)`.

---

### Day 13 — QA, Polish & Final Deploy

#### Blaise — Production Deploy
- Merge all branches to `main` via PRs with CI green.
- `prisma migrate deploy` on production DB.
- Verify Render logs, HTTPS, confirm all endpoints live.

#### Rosine — Visual QA
- Cross-browser and mobile responsive check: JobList, CourseDetail, Dashboard, Intelligence.
- Fix any layout regressions.

#### Yves — Certifications & End-to-End
- `frontend/src/pages/certifications/CertificationList.tsx` — show expiry date; add "Renew" prompt for expired certs.
- `frontend/src/pages/certifications/CertificationVerify.tsx` — confirm public verify page works end-to-end with real certificate codes.
- Full cross-role smoke test: learner applies → employer reviews → status update → learner sees notification → cert issued.

#### Leo — Mentor Session Flow (Frontend)
- `frontend/src/pages/mentors/MentorDashboard.tsx` — add accept/reject buttons, "Complete" button, and review form (rating 1–5 + feedback) after completion.
- `frontend/src/services/mentorship.service.ts` — add `acceptSession(id)`, `rejectSession(id)`, `completeSession(id)`, `submitReview(id, rating, feedback)`.

#### Lambert — Job List & Detail Polish
- `frontend/src/pages/jobs/JobList.tsx` — verify all filter combinations (salary, type, location) work; fix any broken filter state.
- `frontend/src/pages/jobs/JobDetail.tsx` — add related jobs section based on shared skills.
- Final visual pass for mobile on JobList, CourseDetail, and Dashboard.

---

**✅ Sprint 3 Definition of Done**
- All routes in `App.tsx` render without crashing.
- Employer can post, edit, and delete a job; applicant board scoped per job.
- Mentor can accept, complete a session, and receive a review visible on their public profile.
- Intelligence page shows skill names (not UUIDs), salary benchmark and industry trends work.
- Career modelling page is live.
- Admin panel has real content (stats + audit log).
- Profile saves headline field.
- Certifications show expiry and verify end-to-end.
- All CI checks green on `main`.

---

## 7. CI/CD Pipeline

```
Developer pushes feature branch
        ↓
GitHub Actions: tsc · eslint · jest
        ↓
PR opened + 1 approving review
        ↓
Merge to main (CI must be green)
        ↓
 ┌──────────────────────────────┐
 │ Vercel auto-deploys frontend │
 │ Render deploys NestJS API    │
 └──────────────────────────────┘
```

Environment variables are never committed to GitHub. Set in Render dashboard (API) and Vercel dashboard (Web) only. `.env.example` documents required keys.

---

## 8. Non-Functional Requirements

| Category | Requirement | Target | How we meet it |
|----------|------------|--------|----------------|
| Performance | Page load (P95) | < 2s | Vercel CDN + Vite code-splitting + React.lazy() |
| Performance | API response | < 500ms | Redis cache + Prisma connection pool |
| Performance | WebSocket latency | < 1s | Socket.io on Render (same region as DB) |
| Security | Data in transit | TLS 1.2+ | Render + Vercel enforce HTTPS automatically |
| Security | Auth | JWT + refresh | Passport.js strategy, httpOnly cookies |
| Security | Input validation | All endpoints | class-validator whitelist on all DTOs |
| Scalability | Concurrent users | 10,000+ | Stateless NestJS + Render autoscale |
| Reliability | Uptime SLA | 99.5% | Render managed infra + daily PG backups |
| Usability | Onboarding | < 5 min | 3-step wizard, < 5 fields per step |
| Usability | Accessibility | WCAG 2.1 AA | Semantic HTML + ARIA labels + contrast check |

---

## 9. Sprint KPIs

| Metric | Target | Status |
|--------|--------|--------|
| API endpoints (Swagger) | 30+ | ✅ Exceeded |
| React pages / routes | 30+ | ✅ Exceeded |
| GitHub Actions workflows | 2 | ✅ Done |
| Lighthouse score | 90+ | In progress |
| All SRS Phase 1 features | 100% | Sprint 3 closing gap |
| Job placement rate (Year 1) | 25%+ | Platform live |
| Course completion rate | 60%+ | Tracked via analytics |
| 90-day retention target | 40%+ | Post-launch |
| Match accuracy (positive) | 75%+ | Intelligence layer active |
