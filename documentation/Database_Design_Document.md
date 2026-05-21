# HANGA WORKS Database Design Document

## 1. Purpose
This document describes the relational database design for the SEWI Platform backend. It is based on the current Prisma schema in `backend/prisma/schema.prisma` and the platform requirements defined in `HANGA_WORKS_SRS_v2.0.md`.

The database is designed for PostgreSQL and supports the platform's core domains:
- User management and identity
- Learning management
- Job marketplace and applications
- Certification and verification
- Notifications and audit logging

## 2. Design Goals
The schema follows these principles:
- Normalize core data to reduce duplication.
- Use foreign keys to preserve referential integrity.
- Keep user, learning, and job data separate but connected.
- Support future growth for mentorship, messaging, assessments, and analytics.
- Enforce uniqueness on key business fields such as email, phone, skill name, course slug, job slug, and certificate code.

## 3. Technology Stack
- Database engine: PostgreSQL
- ORM: Prisma
- Migration tool: Prisma Migrate
- API integration: Node.js backend

## 4. Core Entities

### 4.1 User
Stores all platform accounts.

Key fields:
- `id`
- `name`
- `email`
- `phone`
- `role`
- `status`
- `bio`
- `createdAt`
- `updatedAt`

Notes:
- `email` is unique.
- `phone` is unique when present.
- `role` is represented by an enum: `LEARNER`, `EMPLOYER`, `INSTITUTION`, `MENTOR`, `ADMIN`.
- `status` is represented by an enum: `ACTIVE`, `SUSPENDED`, `DEACTIVATED`.

### 4.2 Organization
Stores institutions and employers.

Key fields:
- `id`
- `name`
- `type`
- `website`
- `createdAt`

Notes:
- A user can belong to an organization.
- Organizations can offer courses, post jobs, and issue certifications.

### 4.3 Skill
Stores the master list of skills.

Key fields:
- `id`
- `name`
- `tag`

Notes:
- `name` is unique.
- Skills are linked to users, jobs, and courses through join tables.

### 4.4 UserSkill
Join table that records a user's skills.

Key fields:
- `id`
- `userId`
- `skillId`
- `level`
- `verified`
- `createdAt`

Notes:
- `level` represents proficiency.
- `verified` indicates whether the skill has been validated.
- Unique constraint: one skill record per user and skill pair.

### 4.5 Course
Stores learning programs and courses.

Key fields:
- `id`
- `title`
- `slug`
- `description`
- `published`
- `institutionId`
- `createdAt`

Notes:
- `slug` is unique.
- Courses can belong to an institution.
- Courses can have modules, enrollments, skills, and certifications.

### 4.6 CourseModule
Stores modular course content.

Key fields:
- `id`
- `courseId`
- `title`
- `content`
- `order`

Notes:
- Modules are ordered within a course.
- Each module belongs to one course.

### 4.7 Enrollment
Tracks learner enrollment and progress in a course.

Key fields:
- `id`
- `userId`
- `courseId`
- `progress`
- `status`
- `startedAt`
- `completedAt`

Notes:
- `progress` is stored as a percentage.
- Unique constraint: one enrollment per user and course pair.

### 4.8 Certification
Stores issued certificates and verifiable credentials.

Key fields:
- `id`
- `code`
- `userId`
- `courseId`
- `issuerId`
- `issuedAt`
- `expiresAt`

Notes:
- `code` is unique.
- Certifications can be tied to a course and an issuing organization.
- `expiresAt` is optional for time-limited credentials.

### 4.9 Job
Stores job listings.

Key fields:
- `id`
- `title`
- `slug`
- `description`
- `location`
- `jobType`
- `salaryMin`
- `salaryMax`
- `employerId`
- `postedAt`

Notes:
- `slug` is unique.
- A job belongs to an employer organization.
- `jobType` supports formats such as remote, hybrid, and onsite.

### 4.10 JobSkill
Join table that links jobs to required skills.

Key fields:
- `id`
- `jobId`
- `skillId`

Notes:
- Unique constraint: one skill record per job and skill pair.

### 4.11 CourseSkill
Join table that links courses to skills they teach.

Key fields:
- `id`
- `courseId`
- `skillId`

Notes:
- Unique constraint: one skill record per course and skill pair.

### 4.12 Application
Stores job applications submitted by users.

Key fields:
- `id`
- `userId`
- `jobId`
- `status`
- `appliedAt`
- `updatedAt`

Notes:
- `status` supports the pipeline states: applied, reviewing, shortlisted, rejected, hired.
- Unique constraint: one application per user and job pair.

### 4.13 Notification
Stores in-app notifications for users.

Key fields:
- `id`
- `userId`
- `type`
- `payload`
- `read`
- `createdAt`

Notes:
- `payload` stores flexible JSON-like notification data.
- `read` tracks whether the notification was opened.

### 4.14 AuditLog
Stores sensitive platform actions for traceability.

Key fields:
- `id`
- `actorId`
- `action`
- `meta`
- `createdAt`

Notes:
- `actorId` is optional so system actions can also be logged.
- `meta` stores extra context about the action.

## 5. Relationships

### 5.1 User Relationships
- One user has many user skills.
- One user has many enrollments.
- One user has many certifications.
- One user has many applications.
- One user has many notifications.
- One user has many audit logs.
- A user may belong to one organization.

### 5.2 Organization Relationships
- One organization has many users.
- One organization has many courses.
- One organization has many jobs.
- One organization has many certifications.

### 5.3 Course Relationships
- One course has many modules.
- One course has many enrollments.
- One course has many certifications.
- One course has many course-skill mappings.
- A course may belong to one institution organization.

### 5.4 Skill Relationships
- One skill can appear in many user skills.
- One skill can appear in many job skills.
- One skill can appear in many course skills.

### 5.5 Job Relationships
- One job has many applications.
- One job has many job-skill mappings.
- A job belongs to one employer organization.

## 6. Data Integrity Rules
- Email addresses must be unique.
- Phone numbers must be unique when supplied.
- Skill names must be unique.
- Course slugs must be unique.
- Job slugs must be unique.
- Certification codes must be unique.
- A user cannot enroll in the same course twice.
- A user cannot apply to the same job twice.
- A job cannot link the same skill more than once.
- A course cannot link the same skill more than once.

## 7. Indexing Strategy
The following fields are naturally indexed through uniqueness or foreign keys:
- `User.email`
- `User.phone`
- `Skill.name`
- `Course.slug`
- `Job.slug`
- `Certification.code`
- Foreign keys used in relation tables such as `userId`, `courseId`, `jobId`, `skillId`, `organizationId`, and `issuerId`

Recommended future indexes:
- `Application.status`
- `Enrollment.status`
- `Notification.read`
- `Job.location`
- `Job.jobType`

## 8. Implementation Notes
- Prisma Migrate is used to create and version database changes.
- The current schema is suitable for an initial production-ready foundation.
- Additional modules such as messaging, mentorship sessions, assessments, and analytics can be added later without restructuring the core tables.

## 9. Future Extensions
Planned additions may include:
- Mentorship profiles and booking sessions
- Course assessments and quiz results
- Direct messaging and chat history
- Recommendation engine output tables
- Analytics snapshots and reporting views
- File storage references for uploads and certificates

## 10. Reference Files
- `backend/prisma/schema.prisma`
- `documentation/ERD.mmd`
- `documentation/ERD.svg`
- `documentation/HANGA_WORKS_SRS_v2.0.md`

