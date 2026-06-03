import {
  PrismaClient,
  Role,
  AccountStatus,
  OrgType,
  ProficiencyLevel,
  EnrollmentStatus,
  ApplicationStatus,
  JobType,
  SessionStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Seeding Hanga-Works database...');

  // ── Clean slate (order respects FK constraints) ───────────────────────────
  await prisma.sessionReview.deleteMany();
  await prisma.mentorSession.deleteMany();
  await prisma.mentorProfile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.application.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.courseSkill.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.skill.deleteMany();

  // ── SkillTags ─────────────────────────────────────────────────────────────
  const skillDefs = [
    { name: 'JavaScript',         tag: 'programming' },
    { name: 'Python',             tag: 'programming' },
    { name: 'React',              tag: 'frontend' },
    { name: 'Node.js',            tag: 'backend' },
    { name: 'SQL',                tag: 'database' },
    { name: 'Digital Marketing',  tag: 'marketing' },
    { name: 'Data Analysis',      tag: 'data' },
    { name: 'Project Management', tag: 'management' },
    { name: 'UI/UX Design',       tag: 'design' },
    { name: 'Mobile Development', tag: 'mobile' },
    { name: 'TypeScript',         tag: 'programming' },
    { name: 'PostgreSQL',         tag: 'database' },
  ];

  const skills = [];
  for (const s of skillDefs) {
    skills.push(await prisma.skill.create({ data: s }));
  }
  const skill = (name: string) => skills.find((s) => s.name === name)!;
  console.log(`✅ ${skills.length} skills`);

  // ── Organizations ─────────────────────────────────────────────────────────
  const institutionOrg = await prisma.organization.create({
    data: { name: 'Hanga Institution', type: OrgType.INSTITUTION, website: 'https://hanga-institution.rw' }
  });
  
  const employerOrg = await prisma.organization.create({
    data: { name: 'Hanga Employer', type: OrgType.EMPLOYER, website: 'https://hanga-employer.rw' }
  });

  // ── Users (One per role) ──────────────────────────────────────────────────
  const sharedPwd = await hash('Password@123');

  const learner = await prisma.user.create({
    data: { name: 'Alice Learner', email: 'learner@hanga.rw', phone: '+250780000001', passwordHash: sharedPwd, role: Role.LEARNER, status: AccountStatus.ACTIVE },
  });

  const employer = await prisma.user.create({
    data: { name: 'Bob Employer', email: 'employer@hanga.rw', phone: '+250780000002', passwordHash: sharedPwd, role: Role.EMPLOYER, status: AccountStatus.ACTIVE, organizationId: employerOrg.id },
  });

  const institutionUser = await prisma.user.create({
    data: { name: 'Charlie Institution', email: 'institution@hanga.rw', phone: '+250780000003', passwordHash: sharedPwd, role: Role.INSTITUTION, status: AccountStatus.ACTIVE, organizationId: institutionOrg.id },
  });

  const mentor = await prisma.user.create({
    data: { name: 'Diana Mentor', email: 'mentor@hanga.rw', phone: '+250780000004', passwordHash: sharedPwd, role: Role.MENTOR, status: AccountStatus.ACTIVE },
  });

  const admin = await prisma.user.create({
    data: { name: 'Eve Admin', email: 'admin@hanga.rw', phone: '+250780000005', passwordHash: sharedPwd, role: Role.ADMIN, status: AccountStatus.ACTIVE },
  });

  console.log(`✅ 5 users (1 for each role)`);

  // ── Courses & Modules (Owned by institutionUser / institutionOrg) ─────────
  type CourseInput = {
    title: string; slug: string; description: string;
    skillNames: string[]; modules: string[];
  };

  const courseDefs: CourseInput[] = [
    {
      title: 'Full-Stack Web Development', slug: 'full-stack-web-dev',
      description: 'Learn HTML, CSS, JavaScript, React, and Node.js to build complete web applications.',
      skillNames: ['JavaScript', 'React', 'Node.js'],
      modules: ['Introduction to the Web', 'HTML & CSS Fundamentals', 'JavaScript Basics', 'React Foundations', 'Node.js & Express', 'Databases with SQL'],
    },
    {
      title: 'Python Programming for Beginners', slug: 'python-beginners',
      description: 'A gentle introduction to Python: syntax, data structures, and problem solving.',
      skillNames: ['Python'],
      modules: ['Setting Up Python', 'Variables & Data Types', 'Control Flow', 'Functions & Modules', 'File Handling'],
    },
    {
      title: 'Data Analysis with Python', slug: 'data-analysis-python',
      description: 'Use Pandas, NumPy, and Matplotlib to analyse and visualise real-world datasets.',
      skillNames: ['Python', 'Data Analysis'],
      modules: ['Intro to Data Analysis', 'Pandas Basics', 'Data Cleaning', 'Visualisation with Matplotlib', 'Capstone Project'],
    },
    {
      title: 'React & TypeScript', slug: 'react-typescript',
      description: 'Build type-safe, production-ready React applications with TypeScript.',
      skillNames: ['React', 'TypeScript', 'JavaScript'],
      modules: ['TypeScript Fundamentals', 'React with TypeScript', 'State Management', 'Testing React Apps', 'Deployment'],
    },
    {
      title: 'Database Design with PostgreSQL', slug: 'postgresql-database-design',
      description: 'Design normalised relational databases and write complex SQL queries.',
      skillNames: ['SQL', 'PostgreSQL'],
      modules: ['Relational Model', 'DDL & DML', 'Joins & Aggregations', 'Indexes & Performance', 'Stored Procedures'],
    },
    {
      title: 'Digital Marketing Fundamentals', slug: 'digital-marketing-fundamentals',
      description: 'SEO, social media, email marketing, and analytics for modern businesses.',
      skillNames: ['Digital Marketing'],
      modules: ['Marketing Strategy', 'SEO Basics', 'Social Media Marketing', 'Email Marketing', 'Analytics & Reporting'],
    },
    {
      title: 'UI/UX Design Principles', slug: 'ui-ux-design-principles',
      description: 'Learn user-centred design, wireframing, prototyping, and usability testing.',
      skillNames: ['UI/UX Design'],
      modules: ['Design Thinking', 'Wireframing', 'Figma Essentials', 'Prototyping', 'Usability Testing'],
    },
    {
      title: 'Project Management Essentials', slug: 'project-management-essentials',
      description: 'Agile, Scrum, and traditional PM frameworks for tech and non-tech projects.',
      skillNames: ['Project Management'],
      modules: ['PM Fundamentals', 'Agile & Scrum', 'Planning & Estimation', 'Risk Management', 'Stakeholder Communication'],
    },
    {
      title: 'Mobile App Development with React Native', slug: 'react-native-mobile',
      description: 'Build cross-platform iOS and Android apps using React Native and Expo.',
      skillNames: ['Mobile Development', 'React', 'JavaScript'],
      modules: ['Expo Setup', 'Core Components', 'Navigation', 'State & Storage', 'Publishing to Stores'],
    },
    {
      title: 'Backend Development with Node.js', slug: 'backend-nodejs',
      description: 'REST APIs, authentication, databases, and deployment with Node.js and Express.',
      skillNames: ['Node.js', 'JavaScript', 'SQL'],
      modules: ['Node.js Core', 'Express Framework', 'REST API Design', 'JWT Authentication', 'Deployment & CI/CD'],
    },
  ];

  const courses = [];
  for (const { skillNames, modules, ...fields } of courseDefs) {
    const course = await prisma.course.create({ 
      data: { ...fields, institutionId: institutionOrg.id, published: true } 
    });
    for (let i = 0; i < modules.length; i++) {
      const videoUrl = i % 2 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : 'https://www.youtube.com/watch?v=M7FIvfx5J10';
      const content = `<h1>${modules[i]}</h1>\n<p>Welcome to this module. Here you will learn the fundamentals of the topic.</p>\n<ul><li>Understanding core concepts</li><li>Applying knowledge in practical scenarios</li><li>Completing the final assignment</li></ul>\n<p>Make sure to watch the video carefully and take notes!</p>`;
      
      await prisma.courseModule.create({ 
        data: { 
          courseId: course.id, 
          title: modules[i], 
          order: i + 1,
          content: content,
          videoUrl: videoUrl
        } 
      });
    }
    for (const n of skillNames) {
      await prisma.courseSkill.create({ data: { courseId: course.id, skillId: skill(n).id } });
    }
    courses.push(course);
  }
  console.log(`✅ ${courses.length} courses with full content modules`);

  // ── Jobs (Owned by employerOrg) ───────────────────────────────────────────
  type JobInput = {
    title: string; slug: string; description: string; location: string;
    jobType: JobType; salaryMin: number; salaryMax: number;
    skillNames: string[];
  };

  const jobDefs: JobInput[] = [
    { title: 'Junior Frontend Developer',     slug: 'junior-frontend',      description: 'Build React UIs for enterprise clients.',           location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 400000, salaryMax: 600000,  skillNames: ['React', 'JavaScript', 'TypeScript'] },
    { title: 'Backend Engineer',               slug: 'backend-engineer',     description: 'Design and maintain REST APIs.',                    location: 'Kigali', jobType: JobType.REMOTE,     salaryMin: 600000, salaryMax: 900000,  skillNames: ['Node.js', 'SQL', 'JavaScript'] },
    { title: 'Data Analyst',                   slug: 'data-analyst',            description: 'Analyse subscriber data and KPIs.',                 location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 500000, salaryMax: 750000,  skillNames: ['Data Analysis', 'SQL', 'Python'] },
    { title: 'Digital Marketing Specialist',   slug: 'digital-marketing',       description: 'Run digital campaigns and SEO strategy.',           location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 350000, salaryMax: 550000,  skillNames: ['Digital Marketing'] },
    { title: 'Software Developer',             slug: 'software-developer',       description: 'Maintain core banking applications.',               location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 700000, salaryMax: 1000000, skillNames: ['JavaScript', 'SQL', 'Node.js'] },
    { title: 'Database Administrator',         slug: 'dba',                      description: 'Manage PostgreSQL clusters.',                        location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 600000, salaryMax: 850000,  skillNames: ['PostgreSQL', 'SQL'] },
    { title: 'Full-Stack Engineer',            slug: 'fullstack',            description: 'Build citizen-facing e-government services.',        location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 700000, salaryMax: 1000000, skillNames: ['React', 'Node.js', 'TypeScript'] },
    { title: 'UI/UX Designer',                 slug: 'uiux',                 description: 'Design accessible government portals.',              location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 450000, salaryMax: 650000,  skillNames: ['UI/UX Design'] },
    { title: 'Mobile Developer',               slug: 'mobile-dev',           description: 'Build iOS/Android apps.',                location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 600000, salaryMax: 900000,  skillNames: ['Mobile Development', 'React', 'JavaScript'] },
    { title: 'Project Manager',                slug: 'pm',                 description: 'Manage IT transformation projects.',                 location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 800000, salaryMax: 1200000, skillNames: ['Project Management'] },
    { title: 'IT Systems Analyst',             slug: 'systems-analyst',    description: 'Analyse and optimise airline systems.',              location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 600000, salaryMax: 850000,  skillNames: ['SQL', 'Data Analysis'] },
    { title: 'React Native Developer',         slug: 'react-native',         description: 'Build mobile apps for African startups.',            location: 'Remote', jobType: JobType.REMOTE,     salaryMin: 700000, salaryMax: 1000000, skillNames: ['Mobile Development', 'React', 'TypeScript'] },
    { title: 'Python Developer',               slug: 'python-dev',           description: 'Automation and ML pipeline work.',                   location: 'Remote', jobType: JobType.REMOTE,     salaryMin: 650000, salaryMax: 950000,  skillNames: ['Python', 'SQL'] },
    { title: 'Business Intelligence Analyst',  slug: 'bi-analyst',              description: 'Build dashboards and BI reports.',                   location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 550000, salaryMax: 800000,  skillNames: ['Data Analysis', 'SQL', 'Python'] },
    { title: 'DevOps Engineer',                slug: 'devops',               description: 'CI/CD, Docker, and cloud infrastructure.',           location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 800000, salaryMax: 1100000, skillNames: ['Node.js', 'PostgreSQL'] },
    { title: 'Cybersecurity Analyst',          slug: 'cybersecurity',            description: 'Monitor and secure infrastructure.',         location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 750000, salaryMax: 1050000, skillNames: ['SQL', 'PostgreSQL'] },
    { title: 'Scrum Master',                   slug: 'scrum-master',         description: 'Facilitate Agile ceremonies for product teams.',     location: 'Remote', jobType: JobType.REMOTE,     salaryMin: 700000, salaryMax: 950000,  skillNames: ['Project Management'] },
    { title: 'Content & SEO Strategist',       slug: 'seo-strategist',          description: 'Own organic growth across digital channels.',   location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 400000, salaryMax: 600000,  skillNames: ['Digital Marketing'] },
    { title: 'TypeScript Engineer',            slug: 'typescript-engineer',  description: 'Maintain large TypeScript mono-repo.',               location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 700000, salaryMax: 1000000, skillNames: ['TypeScript', 'React', 'Node.js'] },
    { title: 'Graduate Software Trainee',      slug: 'grad-trainee',             description: 'Entry-level rotational programme.',                  location: 'Kigali', jobType: JobType.INTERNSHIP, salaryMin: 250000, salaryMax: 400000,  skillNames: ['JavaScript', 'Python'] },
  ];

  const jobs = [];
  for (const { skillNames, ...fields } of jobDefs) {
    const job = await prisma.job.create({
      data: { ...fields, employerId: employerOrg.id },
    });
    for (const n of skillNames) {
      await prisma.jobSkill.create({ data: { jobId: job.id, skillId: skill(n).id } });
    }
    jobs.push(job);
  }
  console.log(`✅ ${jobs.length} jobs`);

  // ── Enrollments (Learner in ALL courses) ─────────────────────────────────
  const statusOptions: EnrollmentStatus[] = [
    EnrollmentStatus.ENROLLED,
    EnrollmentStatus.IN_PROGRESS,
    EnrollmentStatus.IN_PROGRESS,
    EnrollmentStatus.COMPLETED,
  ];

  for (let ci = 0; ci < courses.length; ci++) {
    const pct = Math.floor(Math.random() * 90) + 10;
    const status = pct === 100 ? EnrollmentStatus.COMPLETED : statusOptions[ci % statusOptions.length];
    await prisma.enrollment.create({
      data: {
        userId: learner.id,
        courseId: courses[ci].id,
        progress: pct,
        status,
      },
    });
  }
  console.log(`✅ ${courses.length} enrollments for the Learner`);

  // ── Applications (Learner to ALL jobs) ────────────────────────────────────
  const appStatuses: ApplicationStatus[] = [
    ApplicationStatus.APPLIED,
    ApplicationStatus.REVIEWING,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.HIRED,
  ];

  for (let ji = 0; ji < jobs.length; ji++) {
    await prisma.application.create({
      data: {
        userId: learner.id,
        jobId: jobs[ji].id,
        status: appStatuses[ji % appStatuses.length],
      },
    });
  }
  console.log(`✅ ${jobs.length} job applications for the Learner`);

  // ── UserSkills (Learner has ALL skills) ───────────────────────────────────
  const levels: ProficiencyLevel[] = [
    ProficiencyLevel.BEGINNER,
    ProficiencyLevel.INTERMEDIATE,
    ProficiencyLevel.EXPERT,
  ];

  for (let i = 0; i < skillDefs.length; i++) {
    await prisma.userSkill.create({
      data: {
        userId: learner.id,
        skillId: skill(skillDefs[i].name).id,
        level: levels[i % levels.length],
      },
    });
  }
  console.log(`✅ Learner skill assignments`);

  // ── Mentorship System ─────────────────────────────────────────────────────
  const mentorProfile = await prisma.mentorProfile.create({
    data: {
      userId: mentor.id,
      expertise: 'Software Engineering & Career Growth',
      bio: '10+ years at Big Tech. Here to help you navigate your career.',
      hourlyRate: 50000,
      availability: 'Mon-Wed 5PM-8PM',
    },
  });

  await prisma.mentorSession.create({
    data: {
      mentorId: mentorProfile.id,
      menteeId: learner.id,
      status: SessionStatus.ACCEPTED,
      scheduledAt: new Date(Date.now() + 86400000 * 3),
      notes: 'Please review my resume before the session.',
    },
  });
  console.log(`✅ mentorship profiles and sessions`);

  console.log('\n🎉 Seed complete!');
  console.log('──────────────────────────────────────────');
  console.log('  Login with:');
  console.log('  Learner     : learner@hanga.rw');
  console.log('  Employer    : employer@hanga.rw');
  console.log('  Institution : institution@hanga.rw');
  console.log('  Mentor      : mentor@hanga.rw');
  console.log('  Admin       : admin@hanga.rw');
  console.log('  Password    : Password@123 (for all)');
  console.log('  Run `npm run prisma:studio` to browse data');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
