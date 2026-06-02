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

  const skills = await Promise.all(
    skillDefs.map((s) => prisma.skill.create({ data: s })),
  );
  const skill = (name: string) => skills.find((s) => s.name === name)!;
  console.log(`✅ ${skills.length} skills`);

  // ── Institutions ──────────────────────────────────────────────────────────
  const [alx, kit] = await Promise.all([
    prisma.organization.create({ data: { name: 'ALX Rwanda',                   type: OrgType.INSTITUTION, website: 'https://alxafrica.com' } }),
    prisma.organization.create({ data: { name: 'Kigali Institute of Technology', type: OrgType.INSTITUTION, website: 'https://kit.rw'       } }),
  ]);

  // ── Employer organisations (5) ────────────────────────────────────────────
  const employerOrgs = await Promise.all([
    prisma.organization.create({ data: { name: 'Andela Rwanda',  type: OrgType.EMPLOYER, website: 'https://andela.com'  } }),
    prisma.organization.create({ data: { name: 'MTN Rwanda',     type: OrgType.EMPLOYER, website: 'https://mtn.rw'      } }),
    prisma.organization.create({ data: { name: 'Bank of Kigali', type: OrgType.EMPLOYER, website: 'https://bk.rw'       } }),
    prisma.organization.create({ data: { name: 'Irembo Ltd',     type: OrgType.EMPLOYER, website: 'https://irembo.com'  } }),
    prisma.organization.create({ data: { name: 'RwandAir',       type: OrgType.EMPLOYER, website: 'https://rwandair.com'} }),
  ]);

  // ── 20 Learner users ──────────────────────────────────────────────────────
  const learnerPwd = await hash('Learner@123');
  const learnerRows = [
    { name: 'Alice Uwimana',      email: 'alice.uwimana@email.rw',      phone: '+250780100001' },
    { name: 'Bob Niyonzima',      email: 'bob.niyonzima@email.rw',      phone: '+250780100002' },
    { name: 'Claire Mukamana',    email: 'claire.mukamana@email.rw',    phone: '+250780100003' },
    { name: 'David Habimana',     email: 'david.habimana@email.rw',     phone: '+250780100004' },
    { name: 'Eva Nyirahabimana',  email: 'eva.nyirahabimana@email.rw',  phone: '+250780100005' },
    { name: 'Frank Bizimana',     email: 'frank.bizimana@email.rw',     phone: '+250780100006' },
    { name: 'Grace Ingabire',     email: 'grace.ingabire@email.rw',     phone: '+250780100007' },
    { name: 'Henri Nkurunziza',   email: 'henri.nkurunziza@email.rw',   phone: '+250780100008' },
    { name: 'Irene Uwase',        email: 'irene.uwase@email.rw',        phone: '+250780100009' },
    { name: 'Jean Hakizimana',    email: 'jean.hakizimana@email.rw',    phone: '+250780100010' },
    { name: 'Keza Mutoni',        email: 'keza.mutoni@email.rw',        phone: '+250780100011' },
    { name: 'Louis Nzabonimpa',   email: 'louis.nzabonimpa@email.rw',   phone: '+250780100012' },
    { name: 'Marie Umubyeyi',     email: 'marie.umubyeyi@email.rw',     phone: '+250780100013' },
    { name: 'Nathan Gasana',      email: 'nathan.gasana@email.rw',      phone: '+250780100014' },
    { name: 'Olivia Kamanzi',     email: 'olivia.kamanzi@email.rw',     phone: '+250780100015' },
    { name: 'Patrick Mugabo',     email: 'patrick.mugabo@email.rw',     phone: '+250780100016' },
    { name: 'Queen Ishimwe',      email: 'queen.ishimwe@email.rw',      phone: '+250780100017' },
    { name: 'Robert Twizeyimana', email: 'robert.twizeyimana@email.rw', phone: '+250780100018' },
    { name: 'Sophie Niyomugabo',  email: 'sophie.niyomugabo@email.rw',  phone: '+250780100019' },
    { name: 'Thierry Hakizimana', email: 'thierry.hakizimana@email.rw', phone: '+250780100020' },
  ];

  const learners = await Promise.all(
    learnerRows.map((u) =>
      prisma.user.create({
        data: { ...u, passwordHash: learnerPwd, role: Role.LEARNER, status: AccountStatus.ACTIVE },
      }),
    ),
  );
  console.log(`✅ ${learners.length} learner users`);

  // ── 5 Employer users (one per org) ────────────────────────────────────────
  const employerPwd = await hash('Employer@123');
  const employerRows = [
    { name: 'Amina Kayitesi',   email: 'amina@andela.com',     phone: '+250780200001', orgIdx: 0 },
    { name: 'Bruno Nkusi',      email: 'bruno@mtn.rw',          phone: '+250780200002', orgIdx: 1 },
    { name: 'Celine Uwineza',   email: 'celine@bk.rw',          phone: '+250780200003', orgIdx: 2 },
    { name: 'Denis Rugamba',    email: 'denis@irembo.com',       phone: '+250780200004', orgIdx: 3 },
    { name: 'Elise Murekatete', email: 'elise@rwandair.com',     phone: '+250780200005', orgIdx: 4 },
  ];

  const employers = await Promise.all(
    employerRows.map(({ orgIdx, ...u }) =>
      prisma.user.create({
        data: {
          ...u,
          passwordHash: employerPwd,
          role: Role.EMPLOYER,
          status: AccountStatus.ACTIVE,
          organizationId: employerOrgs[orgIdx].id,
        },
      }),
    ),
  );
  console.log(`✅ ${employers.length} employer users`);

  // ── 10 Courses with modules ───────────────────────────────────────────────
  type CourseInput = {
    title: string; slug: string; description: string;
    institutionId: string; skillNames: string[];
    modules: string[];
  };

  const courseDefs: CourseInput[] = [
    {
      title: 'Full-Stack Web Development', slug: 'full-stack-web-dev',
      description: 'Learn HTML, CSS, JavaScript, React, and Node.js to build complete web applications.',
      institutionId: alx.id, skillNames: ['JavaScript', 'React', 'Node.js'],
      modules: ['Introduction to the Web', 'HTML & CSS Fundamentals', 'JavaScript Basics', 'React Foundations', 'Node.js & Express', 'Databases with SQL'],
    },
    {
      title: 'Python Programming for Beginners', slug: 'python-beginners',
      description: 'A gentle introduction to Python: syntax, data structures, and problem solving.',
      institutionId: kit.id, skillNames: ['Python'],
      modules: ['Setting Up Python', 'Variables & Data Types', 'Control Flow', 'Functions & Modules', 'File Handling'],
    },
    {
      title: 'Data Analysis with Python', slug: 'data-analysis-python',
      description: 'Use Pandas, NumPy, and Matplotlib to analyse and visualise real-world datasets.',
      institutionId: alx.id, skillNames: ['Python', 'Data Analysis'],
      modules: ['Intro to Data Analysis', 'Pandas Basics', 'Data Cleaning', 'Visualisation with Matplotlib', 'Capstone Project'],
    },
    {
      title: 'React & TypeScript', slug: 'react-typescript',
      description: 'Build type-safe, production-ready React applications with TypeScript.',
      institutionId: alx.id, skillNames: ['React', 'TypeScript', 'JavaScript'],
      modules: ['TypeScript Fundamentals', 'React with TypeScript', 'State Management', 'Testing React Apps', 'Deployment'],
    },
    {
      title: 'Database Design with PostgreSQL', slug: 'postgresql-database-design',
      description: 'Design normalised relational databases and write complex SQL queries.',
      institutionId: kit.id, skillNames: ['SQL', 'PostgreSQL'],
      modules: ['Relational Model', 'DDL & DML', 'Joins & Aggregations', 'Indexes & Performance', 'Stored Procedures'],
    },
    {
      title: 'Digital Marketing Fundamentals', slug: 'digital-marketing-fundamentals',
      description: 'SEO, social media, email marketing, and analytics for modern businesses.',
      institutionId: kit.id, skillNames: ['Digital Marketing'],
      modules: ['Marketing Strategy', 'SEO Basics', 'Social Media Marketing', 'Email Marketing', 'Analytics & Reporting'],
    },
    {
      title: 'UI/UX Design Principles', slug: 'ui-ux-design-principles',
      description: 'Learn user-centred design, wireframing, prototyping, and usability testing.',
      institutionId: alx.id, skillNames: ['UI/UX Design'],
      modules: ['Design Thinking', 'Wireframing', 'Figma Essentials', 'Prototyping', 'Usability Testing'],
    },
    {
      title: 'Project Management Essentials', slug: 'project-management-essentials',
      description: 'Agile, Scrum, and traditional PM frameworks for tech and non-tech projects.',
      institutionId: kit.id, skillNames: ['Project Management'],
      modules: ['PM Fundamentals', 'Agile & Scrum', 'Planning & Estimation', 'Risk Management', 'Stakeholder Communication'],
    },
    {
      title: 'Mobile App Development with React Native', slug: 'react-native-mobile',
      description: 'Build cross-platform iOS and Android apps using React Native and Expo.',
      institutionId: alx.id, skillNames: ['Mobile Development', 'React', 'JavaScript'],
      modules: ['Expo Setup', 'Core Components', 'Navigation', 'State & Storage', 'Publishing to Stores'],
    },
    {
      title: 'Backend Development with Node.js', slug: 'backend-nodejs',
      description: 'REST APIs, authentication, databases, and deployment with Node.js and Express.',
      institutionId: alx.id, skillNames: ['Node.js', 'JavaScript', 'SQL'],
      modules: ['Node.js Core', 'Express Framework', 'REST API Design', 'JWT Authentication', 'Deployment & CI/CD'],
    },
  ];

  const courses = await Promise.all(
    courseDefs.map(async ({ skillNames, modules, ...fields }) => {
      const course = await prisma.course.create({ data: { ...fields, published: true } });
      await Promise.all(modules.map((title, i) =>
        prisma.courseModule.create({ data: { courseId: course.id, title, order: i + 1 } }),
      ));
      await Promise.all(skillNames.map((n) =>
        prisma.courseSkill.create({ data: { courseId: course.id, skillId: skill(n).id } }),
      ));
      return course;
    }),
  );
  console.log(`✅ ${courses.length} courses with modules`);

  // ── 20 Jobs ───────────────────────────────────────────────────────────────
  type JobInput = {
    title: string; slug: string; description: string; location: string;
    jobType: JobType; salaryMin: number; salaryMax: number;
    orgIdx: number; skillNames: string[];
  };

  const jobDefs: JobInput[] = [
    { title: 'Junior Frontend Developer',     slug: 'junior-frontend-andela',      description: 'Build React UIs for enterprise clients.',           location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 400000, salaryMax: 600000,  orgIdx: 0, skillNames: ['React', 'JavaScript', 'TypeScript'] },
    { title: 'Backend Engineer',               slug: 'backend-engineer-andela',     description: 'Design and maintain REST APIs.',                    location: 'Kigali', jobType: JobType.REMOTE,     salaryMin: 600000, salaryMax: 900000,  orgIdx: 0, skillNames: ['Node.js', 'SQL', 'JavaScript'] },
    { title: 'Data Analyst',                   slug: 'data-analyst-mtn',            description: 'Analyse subscriber data and KPIs.',                 location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 500000, salaryMax: 750000,  orgIdx: 1, skillNames: ['Data Analysis', 'SQL', 'Python'] },
    { title: 'Digital Marketing Specialist',   slug: 'digital-marketing-mtn',       description: 'Run digital campaigns and SEO strategy.',           location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 350000, salaryMax: 550000,  orgIdx: 1, skillNames: ['Digital Marketing'] },
    { title: 'Software Developer',             slug: 'software-developer-bk',       description: 'Maintain core banking applications.',               location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 700000, salaryMax: 1000000, orgIdx: 2, skillNames: ['JavaScript', 'SQL', 'Node.js'] },
    { title: 'Database Administrator',         slug: 'dba-bk',                      description: 'Manage PostgreSQL clusters.',                        location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 600000, salaryMax: 850000,  orgIdx: 2, skillNames: ['PostgreSQL', 'SQL'] },
    { title: 'Full-Stack Engineer',            slug: 'fullstack-irembo',            description: 'Build citizen-facing e-government services.',        location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 700000, salaryMax: 1000000, orgIdx: 3, skillNames: ['React', 'Node.js', 'TypeScript'] },
    { title: 'UI/UX Designer',                 slug: 'uiux-irembo',                 description: 'Design accessible government portals.',              location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 450000, salaryMax: 650000,  orgIdx: 3, skillNames: ['UI/UX Design'] },
    { title: 'Mobile Developer',               slug: 'mobile-dev-irembo',           description: 'Build iOS/Android apps for Irembo.',                location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 600000, salaryMax: 900000,  orgIdx: 3, skillNames: ['Mobile Development', 'React', 'JavaScript'] },
    { title: 'Project Manager',                slug: 'pm-rwandair',                 description: 'Manage IT transformation projects.',                 location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 800000, salaryMax: 1200000, orgIdx: 4, skillNames: ['Project Management'] },
    { title: 'IT Systems Analyst',             slug: 'systems-analyst-rwandair',    description: 'Analyse and optimise airline systems.',              location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 600000, salaryMax: 850000,  orgIdx: 4, skillNames: ['SQL', 'Data Analysis'] },
    { title: 'React Native Developer',         slug: 'react-native-andela',         description: 'Build mobile apps for African startups.',            location: 'Remote', jobType: JobType.REMOTE,     salaryMin: 700000, salaryMax: 1000000, orgIdx: 0, skillNames: ['Mobile Development', 'React', 'TypeScript'] },
    { title: 'Python Developer',               slug: 'python-dev-andela',           description: 'Automation and ML pipeline work.',                   location: 'Remote', jobType: JobType.REMOTE,     salaryMin: 650000, salaryMax: 950000,  orgIdx: 0, skillNames: ['Python', 'SQL'] },
    { title: 'Business Intelligence Analyst',  slug: 'bi-analyst-mtn',              description: 'Build dashboards and BI reports.',                   location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 550000, salaryMax: 800000,  orgIdx: 1, skillNames: ['Data Analysis', 'SQL', 'Python'] },
    { title: 'DevOps Engineer',                slug: 'devops-irembo',               description: 'CI/CD, Docker, and cloud infrastructure.',           location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 800000, salaryMax: 1100000, orgIdx: 3, skillNames: ['Node.js', 'PostgreSQL'] },
    { title: 'Cybersecurity Analyst',          slug: 'cybersecurity-bk',            description: 'Monitor and secure banking infrastructure.',         location: 'Kigali', jobType: JobType.FULL_TIME,  salaryMin: 750000, salaryMax: 1050000, orgIdx: 2, skillNames: ['SQL', 'PostgreSQL'] },
    { title: 'Scrum Master',                   slug: 'scrum-master-andela',         description: 'Facilitate Agile ceremonies for product teams.',     location: 'Remote', jobType: JobType.REMOTE,     salaryMin: 700000, salaryMax: 950000,  orgIdx: 0, skillNames: ['Project Management'] },
    { title: 'Content & SEO Strategist',       slug: 'seo-strategist-mtn',          description: 'Own organic growth across MTN digital channels.',   location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 400000, salaryMax: 600000,  orgIdx: 1, skillNames: ['Digital Marketing'] },
    { title: 'TypeScript Engineer',            slug: 'typescript-engineer-irembo',  description: 'Maintain large TypeScript mono-repo.',               location: 'Kigali', jobType: JobType.HYBRID,     salaryMin: 700000, salaryMax: 1000000, orgIdx: 3, skillNames: ['TypeScript', 'React', 'Node.js'] },
    { title: 'Graduate Software Trainee',      slug: 'grad-trainee-bk',             description: 'Entry-level rotational programme.',                  location: 'Kigali', jobType: JobType.INTERNSHIP, salaryMin: 250000, salaryMax: 400000,  orgIdx: 2, skillNames: ['JavaScript', 'Python'] },
  ];

  const jobs = await Promise.all(
    jobDefs.map(async ({ skillNames, orgIdx, ...fields }) => {
      const job = await prisma.job.create({
        data: { ...fields, employerId: employerOrgs[orgIdx].id },
      });
      await Promise.all(skillNames.map((n) =>
        prisma.jobSkill.create({ data: { jobId: job.id, skillId: skill(n).id } }),
      ));
      return job;
    }),
  );
  console.log(`✅ ${jobs.length} jobs`);

  // ── Enrollments (learner ↔ course pairs) ─────────────────────────────────
  const enrollmentPairs: [number, number][] = [
    [0, 0], [0, 1],
    [1, 0], [1, 2],
    [2, 3], [2, 4],
    [3, 0], [3, 5],
    [4, 1], [4, 6],
    [5, 2], [5, 7],
    [6, 0], [6, 8],
    [7, 3], [7, 9],
    [8, 4], [8, 1],
    [9, 5], [9, 2],
  ];

  const statusOptions: EnrollmentStatus[] = [
    EnrollmentStatus.ENROLLED,
    EnrollmentStatus.IN_PROGRESS,
    EnrollmentStatus.IN_PROGRESS,
    EnrollmentStatus.COMPLETED,
  ];

  await Promise.all(
    enrollmentPairs.map(([li, ci]) => {
      const pct = Math.floor(Math.random() * 90) + 10;
      const status = pct === 100 ? EnrollmentStatus.COMPLETED : statusOptions[li % statusOptions.length];
      return prisma.enrollment.create({
        data: {
          userId: learners[li].id,
          courseId: courses[ci].id,
          progress: pct,
          status,
        },
      });
    }),
  );
  console.log(`✅ ${enrollmentPairs.length} enrollments`);

  // ── Applications (learner ↔ job) ──────────────────────────────────────────
  const appStatuses: ApplicationStatus[] = [
    ApplicationStatus.APPLIED,
    ApplicationStatus.REVIEWING,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.HIRED,
  ];

  const appPairs: [number, number][] = [
    [0, 0],  [1, 1],  [2, 2],  [3, 4],  [4, 5],
    [5, 6],  [6, 9],  [7, 10], [8, 11], [9, 12],
    [10, 0], [11, 3], [12, 7], [13, 8], [14, 13],
    [15, 14],[16, 15],[17, 16],[18, 17],[19, 19],
  ];

  await Promise.all(
    appPairs.map(([li, ji]) =>
      prisma.application.create({
        data: {
          userId: learners[li].id,
          jobId: jobs[ji].id,
          status: appStatuses[li % appStatuses.length],
        },
      }),
    ),
  );
  console.log(`✅ ${appPairs.length} job applications`);

  // ── UserSkills ────────────────────────────────────────────────────────────
  const levels: ProficiencyLevel[] = [
    ProficiencyLevel.BEGINNER,
    ProficiencyLevel.INTERMEDIATE,
    ProficiencyLevel.EXPERT,
  ];

  const userSkillDefs: [number, string[]][] = [
    [0,  ['JavaScript', 'React']],
    [1,  ['Python', 'Data Analysis']],
    [2,  ['UI/UX Design']],
    [3,  ['Node.js', 'SQL']],
    [4,  ['Digital Marketing']],
    [5,  ['React', 'TypeScript']],
    [6,  ['Mobile Development']],
    [7,  ['Project Management']],
    [8,  ['Python', 'SQL']],
    [9,  ['JavaScript', 'Node.js']],
    [10, ['TypeScript', 'React']],
    [11, ['PostgreSQL', 'SQL']],
  ];

  await Promise.all(
    userSkillDefs.flatMap(([li, names]) =>
      names.map((n, i) =>
        prisma.userSkill.create({
          data: {
            userId: learners[li].id,
            skillId: skill(n).id,
            level: levels[(li + i) % levels.length],
          },
        }),
      ),
    ),
  );
  console.log(` user skill assignments`);

  // ── Mentorship System ─────────────────────────────────────────────────────
  const mentorPwd = await hash('Mentor@123');
  const mentorUsers = await Promise.all([
    prisma.user.create({
      data: { name: 'Dr. Jane Smith', email: 'jane.smith@mentor.rw', phone: '+250783000001', passwordHash: mentorPwd, role: Role.MENTOR },
    }),
    prisma.user.create({
      data: { name: 'Alex Johnson', email: 'alex.johnson@mentor.rw', phone: '+250783000002', passwordHash: mentorPwd, role: Role.MENTOR },
    }),
  ]);

  const mentorProfiles = await Promise.all([
    prisma.mentorProfile.create({
      data: {
        userId: mentorUsers[0].id,
        expertise: 'Software Engineering & Career Growth',
        bio: '10+ years at Big Tech. Here to help you navigate your career.',
        hourlyRate: 50000,
        availability: 'Mon-Wed 5PM-8PM',
      },
    }),
    prisma.mentorProfile.create({
      data: {
        userId: mentorUsers[1].id,
        expertise: 'Data Science & Machine Learning',
        bio: 'Senior Data Scientist. Let\'s talk algorithms and data.',
        hourlyRate: 40000,
        availability: 'Sat-Sun 10AM-2PM',
      },
    }),
  ]);

  await prisma.mentorSession.create({
    data: {
      mentorId: mentorProfiles[0].id,
      menteeId: learners[0].id,
      status: SessionStatus.ACCEPTED,
      scheduledAt: new Date(Date.now() + 86400000 * 3),
      notes: 'Please review my resume before the session.',
    },
  });
  console.log(`✅ mentorship profiles and sessions`);

  // ── Admin User ────────────────────────────────────────────────────────────
  const adminPwd = await hash('Admin@123');
  await prisma.user.create({
    data: { name: 'System Admin', email: 'admin@hanga.rw', phone: '+250780000000', passwordHash: adminPwd, role: Role.ADMIN, status: AccountStatus.ACTIVE },
  });
  console.log(`✅ admin user`);

  console.log('\n🎉 Seed complete!');
  console.log('──────────────────────────────────────────');
  console.log('  Learner password : Learner@123');
  console.log('  Employer password: Employer@123');
  console.log('  Mentor password  : Mentor@123');
  console.log('  Admin password   : Admin@123');
  console.log('  Run `npm run prisma:studio` to browse data');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
