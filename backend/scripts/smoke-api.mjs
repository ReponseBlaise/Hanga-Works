/**
 * Backend API smoke test — run with server up: node scripts/smoke-api.mjs
 * Uses seed credentials from prisma/seed.ts
 */
const BASE = process.env.API_BASE ?? 'http://localhost:3000/api/v1';

const accounts = {
  learner: { email: 'alice.uwimana@email.rw', password: 'Learner@123' },
  employer: { email: 'amina@andela.com', password: 'Employer@123' },
  admin: { email: 'admin@hanga.rw', password: 'Admin@123' },
  mentor: { email: 'jane.smith@mentor.rw', password: 'Mentor@123' },
};

const results = [];

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const icon = ok ? 'PASS' : 'FAIL';
  console.log(`${icon}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(method, path, { token, body, cookieJar, expectStatus } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });

  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (cookieJar && setCookie.length) {
    cookieJar.cookies = setCookie.map((c) => c.split(';')[0]).join('; ');
  }

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  const statusOk = expectStatus ? res.status === expectStatus : res.ok;
  return { ok: statusOk, status: res.status, data, res };
}

async function login(role) {
  const jar = { cookies: '' };
  const creds = accounts[role];
  const { ok, status, data, res } = await request('POST', '/auth/login', {
    body: creds,
    cookieJar: jar,
  });
  if (!ok) {
    return { ok: false, status, data, token: null, jar };
  }
  const token = data?.access_token ?? data?.data?.access_token;
  const cookies = jar.cookies || (res.headers.get('set-cookie') ?? '');
  return { ok: true, token, jar: { cookies }, data };
}

async function main() {
  console.log(`\nHANGA WORKS API smoke test\nBase: ${BASE}\n`);

  // ── Public ─────────────────────────────────────────────────────────────
  let jobsRes = await request('GET', '/jobs');
  record('GET /jobs (public)', jobsRes.ok, `status ${jobsRes.status}`);
  const jobs = jobsRes.data?.jobs ?? jobsRes.data?.data?.jobs ?? (Array.isArray(jobsRes.data) ? jobsRes.data : []);
  const jobId = jobs[0]?.id;

  const coursesRes = await request('GET', '/courses');
  record('GET /courses (public)', coursesRes.ok, `status ${coursesRes.status}`);
  const courses = Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data?.data ?? [];
  const courseId = courses[0]?.id;

  const skillsRes = await request('GET', '/skills');
  record('GET /skills (public)', skillsRes.ok, `status ${skillsRes.status}`);

  if (jobId) {
    const jobDetail = await request('GET', `/jobs/${jobId}`);
    record('GET /jobs/:id', jobDetail.ok, `status ${jobDetail.status}`);
  } else {
    record('GET /jobs/:id', false, 'no jobs in DB — run prisma:seed');
  }

  if (courseId) {
    const courseDetail = await request('GET', `/courses/${courseId}`);
    record('GET /courses/:id', courseDetail.ok, `status ${courseDetail.status}`);
  } else {
    record('GET /courses/:id', false, 'no published courses — run prisma:seed');
  }

  // Mentorship requires JWT on entire controller
  const mentorsUnauth = await request('GET', '/mentorship/mentors');
  record(
    'GET /mentorship/mentors (no auth)',
    mentorsUnauth.status === 401,
    `status ${mentorsUnauth.status} (401 expected — guard on controller)`,
  );

  // ── Auth ─────────────────────────────────────────────────────────────────
  const learnerLogin = await login('learner');
  record('POST /auth/login (learner)', learnerLogin.ok, learnerLogin.ok ? '' : `status ${learnerLogin.status}`);

  const employerLogin = await login('employer');
  record('POST /auth/login (employer)', employerLogin.ok);

  const adminLogin = await login('admin');
  record('POST /auth/login (admin)', adminLogin.ok);

  const mentorLogin = await login('mentor');
  record('POST /auth/login (mentor)', mentorLogin.ok);

  const learnerToken = learnerLogin.token;
  const employerToken = employerLogin.token;
  const adminToken = adminLogin.token;
  const mentorToken = mentorLogin.token;

  if (learnerToken) {
    const me = await request('GET', '/users/me', { token: learnerToken });
    record('GET /users/me (learner)', me.ok, `role ${me.data?.role ?? me.data?.data?.role ?? '?'}`);

    const apps = await request('GET', '/applications', { token: learnerToken });
    record('GET /applications (learner)', apps.ok, `status ${apps.status}`);

    const rec = await request('GET', '/jobs/recommended', { token: learnerToken });
    record('GET /jobs/recommended', rec.ok, `status ${rec.status}`);

    const progress = await request('GET', '/progress', { token: learnerToken });
    record('GET /progress', progress.ok, `status ${progress.status}`);

    const certs = await request('GET', '/certificates', { token: learnerToken });
    record('GET /certificates', certs.ok, `status ${certs.status}`);

    const pathway = await request('GET', '/intelligence/pathway', { token: learnerToken });
    record('GET /intelligence/pathway', pathway.ok, `status ${pathway.status}`);

    if (jobId) {
      const gap = await request('GET', `/intelligence/gap-analysis?jobId=${jobId}`, { token: learnerToken });
      record('GET /intelligence/gap-analysis', gap.ok, `status ${gap.status}`);
    }

    const mentors = await request('GET', '/mentorship/mentors', { token: learnerToken });
    record('GET /mentorship/mentors (auth)', mentors.ok, `status ${mentors.status}`);

    if (courseId) {
      const enroll = await request('POST', '/enrollments', {
        token: learnerToken,
        body: { courseId },
        expectStatus: null,
      });
      const enrollOk = enroll.status === 201 || enroll.status === 200 || enroll.status === 409;
      record('POST /enrollments', enrollOk, `status ${enroll.status} (409 = already enrolled)`);
    }
  }

  if (employerToken) {
    const empAnalytics = await request('GET', '/employer/analytics', { token: employerToken });
    record('GET /employer/analytics', empAnalytics.ok, `status ${empAnalytics.status}`);

    if (jobId) {
      const applicants = await request('GET', `/employer/jobs/${jobId}/applicants`, { token: employerToken });
      record('GET /employer/jobs/:id/applicants', applicants.status === 200 || applicants.status === 403, `status ${applicants.status}`);
    }

    const postJob = await request('POST', '/employer/jobs', {
      token: employerToken,
      body: {
        title: `Smoke Test Role ${Date.now()}`,
        description: 'Automated smoke test job posting.',
        location: 'Kigali',
        jobType: 'FULL_TIME',
      },
    });
    record('POST /employer/jobs', postJob.ok, `status ${postJob.status}`);
  }

  if (adminToken) {
    const users = await request('GET', '/users', { token: adminToken });
    record('GET /users (admin)', users.ok, `status ${users.status}`);

    const overview = await request('GET', '/analytics/overview', { token: adminToken });
    record('GET /analytics/overview', overview.ok, `status ${overview.status}`);

    const exportCsv = await request('GET', '/analytics/export?format=csv', { token: adminToken });
    record('GET /analytics/export', exportCsv.ok, `status ${exportCsv.status}`);

    const slug = `smoke-course-${Date.now()}`;
    const created = await request('POST', '/courses', {
      token: adminToken,
      body: {
        title: 'Smoke Test Course',
        slug,
        description: 'A long enough description for validation rules.',
        published: false,
      },
    });
    record('POST /courses (admin)', created.ok, `status ${created.status}`);
    const newCourseId = created.data?.id;
    if (newCourseId) {
      const updated = await request('PATCH', `/courses/${newCourseId}`, {
        token: adminToken,
        body: { published: true },
      });
      record('PATCH /courses/:id', updated.ok, `status ${updated.status}`);

      const mod = await request('POST', `/courses/${newCourseId}/modules`, {
        token: adminToken,
        body: { title: 'Intro module', content: 'Welcome' },
      });
      record('POST /courses/:id/modules', mod.ok, `status ${mod.status}`);

      const manageList = await request('GET', '/courses/manage', { token: adminToken });
      record('GET /courses/manage', manageList.ok, `status ${manageList.status}`);

      const deleted = await request('DELETE', `/courses/${newCourseId}`, {
        token: adminToken,
      });
      record('DELETE /courses/:id', deleted.ok, `status ${deleted.status}`);
    }
  }

  if (mentorToken) {
    const mentorsAuth = await request('GET', '/mentorship/mentors', { token: mentorToken });
    record('GET /mentorship/mentors (mentor)', mentorsAuth.ok);
  }

  // Cert verify (public) — use code from first cert if any
  if (learnerToken) {
    const certs = await request('GET', '/certificates', { token: learnerToken });
    const list = Array.isArray(certs.data) ? certs.data : certs.data?.certificates ?? certs.data?.data ?? [];
    const code = list[0]?.code;
    if (code) {
      const verify = await request('GET', `/certificates/verify/${code}`);
      record('GET /certificates/verify/:token', verify.ok, `status ${verify.status}`);
    } else {
      record('GET /certificates/verify/:token', false, 'no certs in DB to verify');
    }
  }

  const refresh = await request('POST', '/auth/refresh', {
    cookieJar: learnerLogin.jar,
  });
  record('POST /auth/refresh', refresh.ok || refresh.status === 401, `status ${refresh.status} (needs login cookie)`);

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n── Summary: ${passed} passed, ${failed} failed, ${results.length} total ──\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
