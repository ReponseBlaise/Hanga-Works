# HANGA WORKS Sprint Plan v1.1

[Source: HANGA_WORKS_Sprint_Plan_v1.1.docx]

HANGA WORKS

Skills, Employment & Workforce Intelligence Platform



2-WEEK SPRINT PLAN

Phase 1  ·  Full-Stack TypeScript Team  ·  4 Engineers

Node.js · React · PostgreSQL · GitHub · Render · Vercel



1. Technology Stack



All components are implemented in TypeScript end-to-end, ensuring type safety across the full stack and shared type definitions between frontend and backend.

FRONTEND

React + TypeScript

Deployed on Vercel

BACKEND

Node.js / NestJS + TS

Deployed on Render

DATABASE

PostgreSQL

Prisma ORM

DevOps

GitHub Actions

CI/CD · Branch rules



Layer

Technology

Details & Rationale

Frontend

React 18 + TypeScript

Vite build tool, React Router v6, TanStack Query for server state, Tailwind CSS for styling. Deployed to Vercel with automatic preview deployments per PR.

Backend API

Node.js + NestJS + TypeScript

NestJS modular architecture with decorators, dependency injection, and built-in Guards for RBAC. OpenAPI/Swagger docs auto-generated. REST endpoints at /api/v1/.

ORM / Database

Prisma + PostgreSQL

Prisma schema as single source of truth for type-safe DB access. Migrations managed with prisma migrate. Hosted PostgreSQL on Render (or Supabase). Connection pooling via PgBouncer.

Auth

JWT + Passport.js (NestJS)

passport-jwt strategy. Access tokens (15 min), refresh tokens (7 days) stored in httpOnly cookies. RBAC via NestJS custom decorators and Guards.

Caching

Redis (ioredis)

Session management, rate limiting, course listing cache, real-time notification queues. Redis instance on Render.

Real-time

Socket.io

WebSocket server on NestJS. Client connects via socket.io-client on React. Used for in-app notifications and application status live updates.

File Storage

S3-compatible (AWS S3 / Cloudflare R2)

Certificate PDFs, course media, profile photos. Presigned URLs for secure direct client upload.

Email

SendGrid (Phase 1)

Transactional emails: registration confirm, application updates, course completion, cert issued. SendGrid Node.js SDK.

Version Control

GitHub

Monorepo or separate repos (api/ + web/). Branch protection on main. Required PR reviews before merge. GitHub Actions for CI.

CI/CD — Backend

GitHub Actions → Render

On merge to main: run tsc --noEmit, eslint, jest tests, then trigger Render deploy hook. Zero-downtime deploy on Render.

CI/CD — Frontend

GitHub Actions → Vercel

Vercel GitHub integration: automatic preview URL per PR branch, production deploy on merge to main. Environment variables set in Vercel dashboard.



2. Repository & Project Structure



The project uses two separate GitHub repositories (or a monorepo root) — one for the NestJS API and one for the React frontend — enabling independent Render and Vercel deployments.

hanga-api  (NestJS / Render)

hanga-web  (React / Vercel)

src/

  auth/          ← JWT, Passport, Guards

  users/         ← User module + RBAC

  lms/           ← Courses, Progress, Quizzes

  jobs/          ← Listings, Applications

  certifications/ ← Issue, Verify, PDF

  notifications/ ← SendGrid, Socket.io

  employer/      ← ATS, Dashboard

  analytics/     ← Metrics endpoints

prisma/

  schema.prisma  ← All models + relations

  migrations/

.env.example

Dockerfile

render.yaml    ← Render deploy config

src/

  components/    ← Shared UI library

  pages/         ← Route-level components

  features/      ← Auth, LMS, Jobs, Profile

  hooks/         ← Custom React hooks

  services/      ← API client (axios/fetch)

  types/         ← Shared TS types / DTOs

  store/         ← TanStack Query config

public/

.env.example

vite.config.ts

vercel.json    ← Vercel deploy config



GitHub branching strategy:

Branch

Purpose

main

Production branch. Protected — requires PR + passing CI + 1 review before merge. Auto-deploys to Render (API) and Vercel (Web).

develop

Integration branch. All feature branches merge here first. Deployed to staging environment.

feature/TASK-name

One branch per task. E.g. feature/auth-jwt, feature/lms-courses. Opened as PR to develop. Feature branches may pull or rebase from develop to stay current.

hotfix/name

Emergency fixes branched from main, merged back to both main and develop.



3. Team Assignments





BLAISE

Tech Lead · Backend

ROSINE

Frontend Lead · UI/UX

YVES

Backend Dev · Features

LEO

Full-Stack · DevOps

NestJS architecture & modules

Prisma schema & DB migrations

JWT / Passport auth + RBAC Guards

API security & rate limiting

Render deploy config

React component library

Figma design system + wireframes

TanStack Query data fetching

Tailwind CSS + responsive design

Vercel deploy + preview URLs

LMS, Jobs & Certs modules (NestJS)

Prisma queries & service layer

Redis caching (ioredis)

Analytics & matching endpoints

Swagger / OpenAPI docs

React feature pages & routing

GitHub Actions CI/CD pipelines

Socket.io client integration

Dockerfile & environment config

Production deployment & QA



4. Week 1 — Foundation & Design (Days 1–5)





Day 1 (Monday) — Kickoff & Scaffold

Day 1

All

[MEETING]  Project kickoff (2h — all hands)

Assigned: Blaise, Rosine, Yves, Leo

Align on SRS Phase 1 scope. Agree on TypeScript strict mode settings, ESLint/Prettier config, shared tsconfig.base.json, Git branching strategy (GitFlow on GitHub), daily standup cadence (15 min async or sync), API contract process (Swagger-first), and definition of done.



[DEV]  NestJS API scaffold + Prisma schema

Assigned: Blaise

npx @nestjs/cli new hanga-api --strict. Configure TypeScript strict mode. Set up Prisma with PostgreSQL connection string. Draft schema.prisma: User, Role, Course, Module, Enrollment, Progress, Job, Application, Certificate models. Run first migration. Push to GitHub.



[DEV]  React app scaffold + Tailwind + routing

Assigned: Leo

npm create vite@latest hanga-web -- --template react-ts. Install: tailwindcss, react-router-dom, @tanstack/react-query, axios. Configure vite.config.ts with env proxy for API. Set up Vercel project — link GitHub repo, configure VITE_API_URL env var. First preview URL live.



[DESIGN]  Figma wireframes + design system

Assigned: Rosine

Wireframe: Onboarding & registration flow, Learner dashboard, Course browser, Job Marketplace listing. Define design tokens: colour palette, typography scale (Inter or Geist), spacing, shadow. Build Tailwind theme extension in tailwind.config.ts. Export component specs for the team.



[DEV]  Database entity design + Prisma relations

Assigned: Yves

Collaborate with Blaise to finalise Prisma schema relationships: Course → Module → Enrollment → Progress, Job → Application, Certificate. Write seed.ts with sample data (10 courses, 20 jobs, 5 employers). Verify with prisma studio.





Days 2–3 (Tue–Wed) — Auth, LMS API & CI/CD

Days 2–3

All

[DEV]  NestJS Auth module — JWT + Passport + RBAC

Assigned: Blaise

Install: @nestjs/passport, passport-jwt, @nestjs/jwt, bcryptjs. Implement: AuthModule, JwtStrategy, JwtAuthGuard, RolesGuard, @Roles() decorator. Endpoints: POST /api/v1/auth/register, /auth/login, /auth/refresh, /auth/logout. Access token 15 min, refresh token 7 days in httpOnly cookie. Swagger docs auto-generated.



[DEV]  LMS NestJS module — courses, enrolment, progress

Assigned: Yves

CoursesModule, EnrollmentModule, ProgressModule with NestJS controllers, services, DTOs (class-validator). Prisma service calls for: list courses, get by ID, enrol learner, update progress %, submit quiz. Redis cache (ioredis) for course listing (TTL 5 min). Unit tests with Jest.



[DEV]  Auth screens + dashboard shell (React)

Assigned: Rosine

Implement in React + TypeScript: /login, /register, /verify-email pages. React Router v6 protected routes with auth context. Learner dashboard layout: sidebar nav, top bar, content area. TanStack Query setup with axios instance pointing to VITE_API_URL. Connect to Blaise's auth endpoints.



[DEVOPS]  GitHub Actions CI/CD — Render + Vercel

Assigned: Leo

hanga-api/.github/workflows/ci.yml: on PR — run npx tsc --noEmit, eslint, jest --coverage. On merge to main — curl Render deploy hook. hanga-web/.github/workflows/ci.yml: Vercel GitHub integration handles preview + production deploys automatically. Add branch protection rules on GitHub: require CI pass + 1 review.





Day 4 (Thursday) — Mid-Sprint Sync & Features

Day 4

All

[MEETING]  Mid-sprint sync (1h) — API contracts & blockers

Assigned: All

Review Swagger UI at /api/docs — finalise request/response shape for Job and LMS endpoints. Rosine demos React screens on Vercel preview URL. Leo confirms CI green on all PRs. Yves shares Prisma schema in final state. Identify and assign any blockers.



[DEV]  Job Marketplace NestJS module

Assigned: Yves

JobsModule: POST /jobs (employer), GET /jobs with query filters (skill, location, type, salary, experience), GET /jobs/:id, POST /jobs/:id/apply, GET /applications/:id, PATCH /applications/:id/status. DTOs with class-validator. Seed 20 sample jobs via prisma seed. Swagger-documented.



[DEV]  LMS UI — course browser, player & quiz

Assigned: Rosine

Course listing page with search + filter (TanStack Query + axios). Course detail page with video/content player. Progress bar auto-update on scroll milestones (POST /progress). Quiz component with score submission. Fully typed API response types from shared types/ folder.



[DEV]  Notifications — SendGrid + Socket.io

Assigned: Leo

NotificationsModule in NestJS: @sendgrid/mail SDK for transactional emails. Socket.io Gateway (@WebSocketGateway) for in-app real-time events. Events: job-match, application-status, course-complete, cert-issued. React: socket.io-client hook, notification bell + dropdown component.





Day 5 (Friday) — Week 1 Wrap & Staging

Day 5

All

[REVIEW]  PR reviews, integration merge & staging deploy

Assigned: All

All feature branches open PRs to develop. Each PR: CI must pass (tsc, eslint, jest) + 1 approving review. Merge to develop → auto-deploy to Render staging + Vercel preview. Run end-to-end integration smoke test: register → login → enrol course → progress → job browse.



[MEETING]  Week 1 retro + Week 2 planning (1h)

Assigned: All

Demo on Vercel preview and Render staging URLs. Velocity check vs plan. Reprioritise Week 2 if needed — certifications, employer dashboard, Skill Profile UI. Update GitHub Project board. Confirm Week 2 task assignments.





✓  Week 1 Milestone — Auth API live on Render staging, LMS + Jobs API documented in Swagger, React app live on Vercel preview, GitHub Actions CI green on all branches



5. Week 2 — Features, Polish & Deploy (Days 6–10)





Day 6 (Monday) — Certifications & Marketplace UI

Day 6

All

[DEV]  Certifications module — generate, store & verify

Assigned: Blaise + Yves

Blaise: CertificationsModule — trigger on course completion event (NestJS EventEmitter). Generate PDF with pdfkit or puppeteer. Upload to S3/Cloudflare R2 (AWS SDK v3). Store cert record in Prisma (id, userId, courseId, issuedAt, pdfUrl, verifyToken). GET /certificates/verify/:token public endpoint. Yves: Employer-facing POST /certificates/validate with token — returns cert details JSON.



[DEV]  Job Marketplace UI — apply, track, save

Assigned: Rosine + Leo

Rosine: Job listing page with advanced TanStack Query filters, job detail page with employer branding, one-click apply button (posts via TanStack Mutation). Leo: My Applications page — status kanban (applied / reviewing / shortlisted / hired), saved jobs (localStorage + API sync), email alert subscription toggle.





Days 7–8 (Tue–Wed) — Employer Dashboard, Profiles & Analytics

Days 7–8

All

[DEV]  Employer NestJS module — ATS pipeline

Assigned: Blaise

EmployerModule: POST /employer/jobs, PATCH /employer/jobs/:id, GET /employer/jobs/:id/applicants, PATCH /employer/applications/:id/stage (applied → reviewing → shortlisted → hired/rejected). All routes protected by @Roles('employer') Guard. Employer analytics: GET /employer/analytics — application volume, avg time-to-shortlist. Swagger-documented.



[DESIGN]  Skill Profile UI — tags, badges, public link

Assigned: Rosine

Skill tagging interface with proficiency selector (Beginner/Intermediate/Expert). Experience timeline (add/edit entries). Issued certificate badges from GET /users/me/certificates. Profile photo upload via presigned S3 URL. Shareable public profile at /profile/:username. Full WCAG 2.1 AA — keyboard nav, ARIA labels, colour contrast.



[DEV]  Employer dashboard UI + Admin panel (React)

Assigned: Leo

Employer: Job post creation form (React Hook Form + zod validation), applicant pipeline kanban board (drag-and-drop stage updates via PATCH), candidate profile drawer. Admin panel: User list with account actions, content moderation queue, platform stats cards. All connected to Blaise's employer endpoints via TanStack Query.



[DEV]  Analytics endpoints + basic job matching

Assigned: Yves

AnalyticsModule: GET /analytics/overview — DAU, MAU, course completion rate, job application volume (aggregated from Prisma). Basic matching: GET /jobs/recommended — score active jobs against req.user skill tags (overlap count), return top 10 sorted. GET /analytics/export?format=csv — stream CSV response. Add matching score to job listing response DTO.





Day 9 (Thursday) — QA, Security & Performance

Day 9

All

[REVIEW]  Full QA pass — all flows end-to-end on staging

Assigned: All

Test all critical paths on Render staging + Vercel preview: Register → onboard → enrol course → complete → cert issued → apply to job → employer sees applicant in ATS. Test on mobile viewport (Chrome DevTools). Axe accessibility scan. Log bugs in GitHub Issues with severity labels.



[DEV]  Security hardening & performance audit

Assigned: Blaise + Leo

Blaise: helmet middleware (HTTP security headers), @nestjs/throttler rate limiting (100 req/15 min), class-validator whitelist on all DTOs, Prisma parameterised queries (no raw SQL), verify no secrets in codebase (git grep). Leo: Lighthouse audit on Vercel preview (target: Performance > 90), code-split heavy routes with React.lazy(), verify WebSocket reconnection logic.



[DESIGN]  UI polish — onboarding, empty states, errors

Assigned: Rosine

Onboarding flow < 5 min: streamlined 3-step wizard (profile → skills → interests). Empty state illustrations for no-courses, no-jobs. React Error Boundary components. Form validation with zod + React Hook Form — inline field errors. Loading skeleton screens (CSS Tailwind animate-pulse). Toast notifications (react-hot-toast). Final mobile sweep.





Day 10 (Friday) — Production Deploy & Demo

Day 10

Ship

[DEVOPS]  Production deployment — Render + Vercel

Assigned: Leo + Blaise

Leo: Merge develop → main via PR with all CI checks green + 2 approvals. Render auto-deploys API from main branch (render.yaml config: type: web, buildCommand: npm run build, startCommand: node dist/main). Vercel auto-deploys web from main. Set all production env vars in Render dashboard and Vercel dashboard (DATABASE_URL, JWT_SECRET, SENDGRID_API_KEY, S3 credentials). Blaise: Run prisma migrate deploy on production DB. Verify HTTPS, check Render logs, confirm daily backup on Render PostgreSQL.



[MEETING]  Final demo & handoff presentation (2h)

Assigned: All

Live demo on production URLs. Each engineer presents their module using the production app. Blaise: Architecture overview. Rosine: UI walkthrough. Yves: API demo via Swagger UI. Leo: CI/CD pipeline and monitoring. Document Phase 2 backlog in GitHub Issues. Write CONTRIBUTING.md and deployment runbook.





✓  Week 2 Milestone — HANGA WORKS Phase 1 LIVE: API on Render · Frontend on Vercel · PostgreSQL migrated · GitHub Actions CI/CD green · All Phase 1 features shipped



6. CI/CD Pipeline Summary





1. Developer pushes

feature branch to GitHub

→

2. GitHub Actions runs

tsc · eslint · jest tests

→

3. PR opened + review

1 approving review required

→

4. Merge to main

CI must be green













Vercel auto-deploys

hanga-web → vercel.app



Render deploys API

hanga-api → onrender.com



Environment variables are never committed to GitHub. They are set in the Render dashboard (API) and Vercel dashboard (Web) only. A .env.example file documents required keys without values.

7. Non-Functional Requirements





Category

Requirement

Target

How we meet it

Performance

Page load (P95)

< 2 seconds

Vercel CDN + Vite code-splitting + React.lazy()

Performance

API response

< 500ms

Redis cache + Prisma connection pool

Performance

WebSocket latency

< 1 second

Socket.io on Render (same region as DB)

Security

Data in transit

TLS 1.2+

Render + Vercel enforce HTTPS automatically

Security

Auth

JWT + refresh

Passport.js strategy, httpOnly cookies

Security

Input validation

All endpoints

@nestjs/class-validator on all DTOs

Scalability

Concurrent users

10,000+

Stateless NestJS + Render autoscale

Reliability

Uptime SLA

99.5%

Render managed infra + daily PG backups

Usability

Onboarding

< 5 min

3-step wizard, < 5 form fields per step

Usability

Accessibility

WCAG 2.1 AA

Tailwind a11y utilities + Axe CI scan



8. Sprint KPIs





API endpoints (Swagger)

30+

React pages / routes

15+

GitHub Actions workflows

2

Target Lighthouse score

90+



Job placement rate (Year 1)

25%+

Course completion rate

60%+

90-day retention target

40%+

Match accuracy (positive)

75%+
