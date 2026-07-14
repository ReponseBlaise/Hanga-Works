# Hanga-Works

Hanga Works is a skills, employment, and workforce intelligence platform. The workspace contains a NestJS backend and a Vite + React frontend for learner, employer, mentor, and administrator flows.

## Current Coverage

- Registration and login for learner, employer, institution, mentor, and admin roles.
- Role-aware redirects and navigation across the public and authenticated areas.
- Job marketplace search, filtering, saving, application tracking, and salary-range filtering.
- LMS, mentorship, certifications, analytics, and employer dashboard modules.

## Workspace Layout

- `backend/` contains the NestJS API, Prisma schema, and database migrations.
- `frontend/` contains the React application, shared layout components, and page modules.
- `documentation/` contains the SRS and related design references.

## Notes

The job marketplace filters now support salary range queries end-to-end, matching the SRS advanced search requirement.