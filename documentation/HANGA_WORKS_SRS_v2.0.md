# HANGA WORKS Software Requirements Specification v2.0

[Source: HANGA_WORKS_SRS_v2.0.docx.pdf]

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
HANGA WORKS
Software Requirements Specification
Skills, Employment & Workforce Intelligence Platform
Document Version 	2.0 — Enterprise Edition
Classification 	Commercial Confidential
Document Owner 	HANGA WORKS Product Team
Status 	Draft for Review
Last Updated 	May 2026
Platform Scope 	Web-Based (Responsive)
Prepared for internal engineering, investor, and enterprise stakeholder review.
© 2026 HANGA WORKS. All rights reserved.Page 1

-- 1 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
1. Introduction
1.1 Purpose
HANGA WORKS is a web-based workforce intelligence and employment platform engineered to
unify skills development, verified talent profiling, and structured employment pipelines into a single,
data-driven digital ecosystem.
The platform enables individuals to build verifiable competency profiles, progress through structured
learning pathways, and connect with employment opportunities through intelligent matching
algorithms — replacing the traditional CV-based model with measurable, skills-first hiring.
This document defines the complete functional, non-functional, architectural, and integration
requirements governing the design, development, and deployment of the HANGA WORKS platform.
It is the authoritative reference for all engineering, product, and delivery decisions.
1.2 Scope
HANGA WORKS operates as a fully web-accessible, SaaS-style platform designed for horizontal
scale across education, employment, and enterprise workforce sectors. The platform serves as a
centralized ecosystem where learning, talent verification, hiring, and workforce analytics coexist
within a unified system.
The platform encompasses the following core functional domains:
• Digital learning and competency development
• Intelligent job and talent marketplace
• Career intelligence and recommendation engine
• Digital certification and credential verification
• Employer recruitment and pipeline management dashboard
• Workforce analytics and labor market intelligence
These domains are architecturally interconnected to create a continuous lifecycle:
Learn → Certify → Match → Employ → Improve
1.3 Strategic Objectives
HANGA WORKS is designed to address a structural gap between education systems and labor
markets. The platform's strategic objectives are:
1. Establish skills-based hiring as the dominant recruitment model, replacing fragmented
CV-driven processes.
2. Improve access to structured employment pathways for underserved talent populations.
3. Reduce unemployment friction through intelligent, real-time job-to-talent matching.
4. Standardize digital skill verification and credentials across institutions and employers.
© 2026 HANGA WORKS. All rights reserved.Page 2

-- 2 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
5. Support continuous workforce upskilling through personalized learning recommendations.
6. Provide employers with pre-qualified, data-enriched candidate pipelines.
7. Generate actionable workforce intelligence for institutions, employers, and policy
stakeholders.
1.4 Value Proposition
HANGA WORKS transforms fragmented education and employment infrastructure into a single
intelligent platform where:
Stakeholder 	Core Value Delivered
Job Seekers / Learners 	Structured skills development, verified credentials, and intelligent job
matching
Employers 	Access to pre-qualified, skills-verified candidates; reduced
time-to-hire
Training Institutions 	A digital pipeline to connect graduates directly with employment
opportunities
Workforce Planners /
Government
Real-time labor market intelligence and skills gap analysis
1.5 Definitions & Key Terms
Term 	Definition
User 	Any registered individual on the HANGA WORKS platform
Learner 	A user actively enrolled in a learning program or course
Employer 	An organization using the platform to recruit talent
Skill Profile 	A structured, verified digital representation of a user's competencies
Job Match Score 	An algorithm-generated compatibility rating between a user and a job
listing
Certification 	A digitally issued, verifiable credential confirming competency completion
Workforce Intelligence 	Aggregated data insights on labor market demand, talent supply, and skill
gaps
LMS 	Learning Management System — the platform module governing course
delivery
ATS 	Applicant Tracking System — the module managing employer
recruitment workflows
RBAC 	Role-Based Access Control — the security model governing user
permissions
© 2026 HANGA WORKS. All rights reserved.Page 3

-- 3 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
Term 	Definition
SRS 	Software Requirements Specification — this document
© 2026 HANGA WORKS. All rights reserved.Page 4

-- 4 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
2. System Overview
2.1 Platform Description
HANGA WORKS is a modular, cloud-ready SaaS platform that replaces fragmented hiring and
education workflows with a centralized, data-driven ecosystem. It improves talent visibility, learning
outcomes, and recruitment efficiency by connecting all stakeholders — learners, employers,
institutions, and administrators — within a single operating environment.
2.2 Architectural Layers
The system is organized into five interconnected architectural layers:
Layer 	Function 	Key Components
User Layer 	Manages all actor identities, roles,
and access
Registration, Auth, RBAC, Profiles
Learning Layer 	Delivers structured skills
development pathways
LMS, Assessments, Certifications
Employment Layer Manages job discovery,
applications, and hiring
Job Marketplace, ATS, Employer
Dashboard
Intelligence Layer 	Generates recommendations and
market insights
Matching Engine, Analytics, Career AI
Administration
Layer
Governs platform operations and
data integrity
Moderation, Reporting, System Config
2.3 Platform Lifecycle
The system operates as a continuous user journey:
8. User registers and completes identity verification
9. Skill profile is created via self-assessment and prior certification import
10. Interest mapping and career goal setting
11. Personalized learning pathway is generated
12. User completes courses, assessments, and evaluations
13. Digital certification is issued and made verifiable
14. Intelligent job matching generates ranked opportunity recommendations
15. Employer reviews candidate, initiates hiring workflow
16. Post-hire: continuous learning loop is re-engaged for upskilling
© 2026 HANGA WORKS. All rights reserved.Page 5

-- 5 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
2.4 User Roles & Access Model
Role 	Description 	Core Capabilities
Learner / Job
Seeker
Individual using the platform to
develop skills and access
employment
Learn, certify, apply, track progress
Employer 	Organization recruiting talent via the
platform
Post jobs, search candidates, manage
pipeline
Institution 	Educational or training body
providing certified content
Create courses, issue credentials, track
learners
Mentor 	Industry professional offering career
guidance
Accept bookings, conduct sessions,
review mentees
Administrator 	Platform operator managing
governance and data
Manage users, content, analytics,
configurations
© 2026 HANGA WORKS. All rights reserved.Page 6

-- 6 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
3. Functional Requirements
3.1 User Management & Identity System
Manages secure identity creation, authentication, and role-based access for all platform actors.
3.1.1 Core Features
• Email and phone-based registration with verification flow
• JWT-based session management with refresh token rotation
• Role-Based Access Control (RBAC) with granular permission sets
• Multi-factor authentication (MFA) support
• User profile management: personal info, skills, experience, preferences
• Skill tagging, categorization, and proficiency self-rating
• Account status management: active, suspended, deactivated
• Audit log of user activity and account changes
3.2 Learning Management System (LMS)
Delivers structured, outcome-driven learning experiences with progress tracking and assessment
capabilities.
3.2.1 Course Management
• Course creation, publishing, and version control
• Multi-format content: video, documents, interactive modules, SCORM support
• Structured learning path design with prerequisite chaining
• Drafts, review, and approval workflow for institution-published content
3.2.2 Learner Experience
• Personalized learning dashboard with progress metrics
• Course progress tracking and completion milestones
• Quizzes, assessments, and practical evaluations
• Discussion and peer learning forums per course
• Skill-based course recommendations (intelligence-layer driven)
• Offline access support for selected content
3.3 Job Marketplace
© 2026 HANGA WORKS. All rights reserved.Page 7

-- 7 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
Provides a structured, searchable environment for job discovery, application, and tracking.
3.3.1 Job Discovery
• Job posting with structured data: title, description, required skills, salary, type
• Advanced search and filter: skill, location, job type, salary range, experience level
• Remote, hybrid, on-site, internship, and freelance listings
• Employer-branded job pages
• Recommended jobs powered by the matching engine
3.3.2 Application Management
• One-click application using Skill Profile
• Application status tracking: applied, reviewing, shortlisted, rejected, hired
• Saved jobs and alert subscriptions
• Application history and timeline view
3.4 Career Intelligence Engine
Provides users with data-driven career direction and personalized growth recommendations.
• Skill gap analysis: compares current profile to target role requirements
• Career pathway mapping: visualizes progression routes to target roles
• Industry trend insights: highlights high-demand skills and sectors
• Recommended next steps: courses, certifications, and experiences
• Salary benchmarking by role, location, and experience level
• Job role compatibility scoring based on current profile
3.5 Certification & Verification System
Ensures trust, portability, and verifiability of all platform-issued credentials.
• Automated digital certificate generation upon course or program completion
• Unique certificate IDs with tamper-evident verification links
• Skill badge system with shareable public profile integration
• Employer-facing certificate validation portal
• Institution-issued credentials with institutional branding
• Certificate expiry and renewal tracking for time-sensitive credentials
3.6 Employer Recruitment Dashboard
© 2026 HANGA WORKS. All rights reserved.Page 8

-- 8 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
Provides organizations with end-to-end hiring workflow tools integrated with the platform's talent
pool.
• Job posting creation, scheduling, and management
• Skills-based candidate search and discovery
• AI-ranked candidate shortlists based on job requirements
• Applicant Tracking System (ATS): manage candidates across pipeline stages
• Talent pipeline management: save, tag, and revisit candidate profiles
• Employer analytics: application volume, time-to-shortlist, diversity metrics
• Team collaboration: multiple recruiter seats with role-scoped access
3.7 Mentorship System
Connects learners with industry professionals for structured career guidance.
• Mentor profile creation: expertise, availability, bio, and experience
• Mentor discovery with search and category filters
• Session booking and calendar scheduling integration
• In-platform messaging and video call link sharing
• Session notes, goals, and progress tracking per mentee
• Mentor ratings and review system
3.8 Notification & Engagement System
Drives real-time engagement across all user types with contextual, targeted alerts.
Trigger Event 	Delivery Channel 	Target User
New matching job posted 	In-app + Email 	Learner / Job Seeker
Application status updated 	In-app + Email + SMS 	Learner / Job Seeker
Course completion 	In-app + Email 	Learner
New applicant received 	In-app + Email 	Employer
Certification issued 	In-app + Email 	Learner
Mentor session reminder 	In-app + Email + SMS 	Learner + Mentor
Platform announcements 	In-app 	All Users
3.9 Analytics & Reporting System
Provides platform-wide intelligence for operational, strategic, and compliance reporting.
© 2026 HANGA WORKS. All rights reserved.Page 9

-- 9 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
• User engagement metrics: DAU, MAU, retention, session depth
• Job market trend analysis: demand by skill, sector, and location
• Skill demand heatmaps: identify emerging and declining skill categories
• Course performance metrics: completion rates, assessment scores, drop-off points
• Employer activity reports: post volume, application rates, conversion
• Platform-wide performance dashboards for administrators
• Exportable reports in CSV, PDF, and Excel formats
© 2026 HANGA WORKS. All rights reserved.Page 10

-- 10 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
4. Intelligence Layer
The Intelligence Layer is the analytical core of HANGA WORKS. It processes behavioral, profile, and
market data to generate personalized recommendations, matching scores, and workforce insights
across all platform modules.
4.1 Job Matching Engine
Generates ranked job recommendations for each learner based on a multi-factor scoring model.
Signal 	Weight 	Description
Skill alignment 	High 	Overlap between user skills and job required skills
Experience level 	High 	Years of experience vs. role requirement
Certification match 	Medium 	Presence of required or preferred certifications
Location preference 	Medium 	User location preference vs. job location/remote policy
Engagement behaviour 	Low 	Jobs saved, viewed, and applied to previously
Career goal alignment 	Low 	Fit with user's stated career trajectory
4.2 Learning Recommendation Engine
Suggests the most relevant courses and learning paths to each user based on their goals and gaps.
• Skill gap analysis against target roles or industry benchmarks
• Behavioral signals: courses started, completed, dropped, searched
• Peer benchmarking: what learners with similar profiles are completing
• Employer demand signals: courses linked to in-demand job skills
4.3 Workforce Insight Engine
Aggregates platform-wide data to produce labor market intelligence reports for employers,
institutions, and administrators.
• Real-time skill demand tracking across active job listings
• Talent supply analysis by skill category, location, and qualification
• Emerging skill trend identification and alert system
• Regional workforce gap reporting
© 2026 HANGA WORKS. All rights reserved.Page 11

-- 11 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
4.4 Predictive Career Modelling
Forecasts future career trajectories and role viability based on market trend data.
• Role viability scoring: likelihood of employment given current market demand
• Skill deprecation alerts: flags skills trending out of employer demand
• Suggested pivot pathways: alternative roles compatible with existing skill sets
© 2026 HANGA WORKS. All rights reserved.Page 12

-- 12 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
5. Non-Functional Requirements
Category 	Requirement 	Target / Standard
Performance 	Page load time 	< 2 seconds (P95) on standard broadband
Performance 	API response time 	< 500ms for standard requests
Performance 	Real-time updates 	WebSocket latency < 1 second
Security 	Data transmission 	TLS 1.2+ enforced on all endpoints
Security 	Authentication 	JWT with refresh rotation; MFA support
Security 	Access control 	RBAC with least-privilege enforcement
Security 	Data privacy 	GDPR-aligned data handling; right to erasure
Scalability 	Architecture 	Horizontally scalable microservice-ready design
Scalability 	Cloud infrastructure 	Cloud-native deployment (containerized)
Scalability 	Concurrent users 	Designed for 10,000+ concurrent sessions
Reliability 	System availability 	99.5% uptime SLA target
Reliability 	Data backups 	Automated daily backups with point-in-time
recovery
Reliability 	Fault tolerance 	Graceful degradation under component failure
Usability 	UI/UX 	Clean, accessible, responsive design (WCAG
2.1 AA)
Usability 	Onboarding 	User activated within < 5 minutes from
registration
Usability 	Mobile support 	Fully responsive for all screen sizes
Maintainability 	Codebase 	Modular architecture with documented APIs
Maintainability 	Monitoring 	Real-time error tracking and alerting
© 2026 HANGA WORKS. All rights reserved.Page 13

-- 13 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
6. System Architecture
6.1 Technology Stack
Layer 	Technology 	Rationale
Frontend 	React.js (TypeScript) 	Component-based, scalable UI with strong
ecosystem support
Backend API 	Node.js — NestJS
framework
Modular, enterprise-grade structure with
built-in DI and testing
Primary Database 	PostgreSQL 	Relational integrity for structured user, job,
and certification data
Cache Layer 	Redis 	Session management, rate limiting, and
real-time data caching
Real-time Layer 	WebSockets (Socket.io) 	Live notifications, application status updates,
chat
File Storage 	Cloud Object Storage
(S3-compatible)
Certificates, course media, profile assets
Search Engine 	Elasticsearch (planned) 	Fast full-text job and candidate search at
scale
Containerization 	Docker + Kubernetes
(planned)
Portable, scalable deployment environment
6.2 API Design
• RESTful API design adhering to OpenAPI 3.0 specification
• All endpoints return structured JSON responses with standardized error codes
• API versioning via URI path (e.g. /api/v1/)
• Rate limiting enforced per user and per endpoint
• WebSocket channels for real-time notifications and status updates
6.3 Security Architecture
• HTTPS enforced platform-wide; HTTP requests redirected
• JWT access tokens (15-minute expiry) with refresh token rotation
• Secrets managed via environment variables and secrets manager — never hardcoded
• SQL injection, XSS, and CSRF protections applied at framework level
• Input validation and sanitization on all API endpoints
• Audit logging of all sensitive operations
© 2026 HANGA WORKS. All rights reserved.Page 14

-- 14 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
© 2026 HANGA WORKS. All rights reserved.Page 15

-- 15 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
7. External Integrations
Integration 	Purpose 	Phase
Email Service (SendGrid / SES) Transactional emails, alerts,
notifications
Phase 1
SMS Gateway (Africa's Talking /
Twilio)
SMS alerts for applications and
sessions
Phase 1
Payment Gateway (Stripe /
Flutterwave)
Course purchases and premium
subscriptions
Phase 2
Calendar APIs (Google /
Outlook)
Mentor session scheduling integration Phase 2
Job Board APIs (LinkedIn, etc.) 	Inbound job feed expansion 	Phase 3
HR Systems (SAP
SuccessFactors, etc.)
Enterprise ATS integration 	Phase 3
National Skills Registry 	Credential portability and official
recognition
Phase 3
LMS Standards (SCORM / xAPI) Third-party course content import 	Phase 2
© 2026 HANGA WORKS. All rights reserved.Page 16

-- 16 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
8. Implementation Roadmap
Phase 	Scope 	Target Milestone
Phase 1 — Core
Platform
User management, LMS, basic job marketplace,
certification, notifications
Month 1–4
Phase 2 — Intelligence
Layer
Matching engine, career intelligence, employer
dashboard, mentorship
Month 5–8
Phase 3 — Analytics &
Scale
Workforce analytics, advanced AI matching,
payment integration, API expansions
Month 9–12
Phase 4 — Enterprise &
Global
HR integrations, national registry, cross-border
expansion, white-labelling
Month 13+
© 2026 HANGA WORKS. All rights reserved.Page 17

-- 17 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
9. Success Metrics & KPIs
Metric 	Definition 	Target (Year 1)
Monthly Active Users (MAU) 	Unique users active in a 30-day window 10,000+
Job Placement Rate 	Learners who secured employment via
the platform
25%+
Employer Adoption Rate 	Active employers posting jobs in a
given month
100+
Course Completion Rate 	Enrolled users who complete a full
course
> 60%
Matching Accuracy 	User-rated relevance of recommended
jobs
> 75% positive
Time-to-Hire Reduction 	Vs. industry average for employer users 30% reduction
Platform Retention Rate 	Users active 90 days after registration 	> 40%
Certification Issue Rate 	Learners who earn at least one
credential
> 50%
© 2026 HANGA WORKS. All rights reserved.Page 18

-- 18 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
10. Future Enhancements
• Advanced generative AI for personalized career coaching and interview preparation
• Integrated video interview and async screening module
• Global freelance and gig marketplace with escrow payment support
• National and regional skills registry integration for formal credential recognition
• Automated hiring workflows: AI-driven screening, scheduling, and offer management
• White-label platform offering for governments and large enterprises
• Cross-border job matching with work permit guidance and compliance tools
• Employer diversity and inclusion analytics module
• Mobile application (iOS and Android) for learner and employer access
© 2026 HANGA WORKS. All rights reserved.Page 19

-- 19 of 20 --

HANGA WORKS | Software Requirements Specification | v2.0CONFIDENTIAL
11. Conclusion
HANGA WORKS is engineered to become a critical piece of digital infrastructure for workforce
development and employment efficiency. By replacing fragmented, credential-blind hiring processes
with a unified, intelligence-driven platform, HANGA WORKS creates measurable value for every
stakeholder in the employment ecosystem.
The platform is designed with scalability, security, and institutional trust at its core — making it ready
for enterprise adoption, government partnership, and international expansion from day one.
This SRS defines the complete technical and functional blueprint for the HANGA WORKS platform
and serves as the governing document for all product, engineering, and delivery decisions
throughout its development lifecycle.
— End of Document —
© 2026 HANGA WORKS. All rights reserved.Page 20

-- 20 of 20 --
