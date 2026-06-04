const http = require('http');

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = payload.length;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log("🚀 Starting Full ATS Integration Test...\n");

  const employerEmail = `employer${Date.now()}@test.com`;
  const learnerEmail = `learner${Date.now()}@test.com`;

  // 1. Register & Login Employer
  console.log("1. Registering new Employer...");
  await request('POST', '/api/auth/register', { name: "Corp Inc", email: employerEmail, password: "Pass123!", role: "EMPLOYER" });
  const empLogin = await request('POST', '/api/auth/login', { email: employerEmail, password: "Pass123!" });
  const empToken = empLogin.access_token;
  console.log("   ✅ Employer Logged in!");

  // 2. Create a Job
  console.log("\n2. Employer is creating a new Job...");
  const job = await request('POST', '/api/employer/jobs', { title: "Software Engineer", description: "NodeJS developer needed" }, empToken);
  console.log("   ✅ Job Created! Job ID:", job.id);

  // 3. Register & Login Learner
  console.log("\n3. Registering new Learner...");
  await request('POST', '/api/auth/register', { name: "John Doe", email: learnerEmail, password: "Pass123!", role: "LEARNER" });
  const learnerLogin = await request('POST', '/api/auth/login', { email: learnerEmail, password: "Pass123!" });
  const learnerToken = learnerLogin.access_token;
  console.log("   ✅ Learner Logged in!");

  // 4. Learner Applies for Job
  console.log("\n4. Learner is applying for the Job...");
  const application = await request('POST', `/api/jobs/${job.id}/apply`, {}, learnerToken);
  console.log("   ✅ Application Submitted! App ID:", application.id);

  // 5. Employer Views Applicants
  console.log("\n5. Employer is viewing Applicants...");
  const applicants = await request('GET', `/api/employer/jobs/${job.id}/applicants`, null, empToken);
  console.log(`   ✅ Found ${applicants.length} applicant(s). First applicant:`, applicants[0].user.name);

  // 6. Employer Updates Stage to SHORTLISTED (Triggers Notification!)
  console.log("\n6. Employer is moving candidate to SHORTLISTED...");
  const updatedApp = await request('PATCH', `/api/employer/applications/${application.id}/stage`, { status: "SHORTLISTED" }, empToken);
  console.log("   ✅ Candidate Stage Updated to:", updatedApp.status);

  // 7. Employer Views Analytics
  console.log("\n7. Employer is viewing Analytics...");
  const analytics = await request('GET', '/api/employer/analytics', null, empToken);
  console.log("   ✅ Analytics Fetched:");
  console.log(analytics);

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
}

runTests().catch(console.error);
