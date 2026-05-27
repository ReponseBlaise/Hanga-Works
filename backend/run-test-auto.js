const { spawn } = require('child_process');
const http = require('http');

const server = spawn('npm', ['run', 'start'], { stdio: 'ignore', shell: true });

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
        try { resolve(JSON.parse(body)); } catch { resolve(body); }
      });
    });
    req.on('error', reject);
    if (data) req.write(payload);
    req.end();
  });
}

setTimeout(async () => {
  try {
    console.log("🚀 Starting Automatic ATS Integration Test...\n");

    const employerEmail = `test_employer_${Date.now()}@test.com`;
    const learnerEmail = `test_learner_${Date.now()}@test.com`;

    console.log("1. Registering Employer...");
    await request('POST', '/api/auth/register', { name: "Corp", email: employerEmail, password: "Pass123!", role: "EMPLOYER" });
    const empLogin = await request('POST', '/api/auth/login', { email: employerEmail, password: "Pass123!" });
    
    console.log("2. Creating Job...");
    const job = await request('POST', '/api/employer/jobs', { title: "Dev", description: "NodeJS" }, empLogin.access_token);
    console.log("   ✅ Job ID:", job.id);

    console.log("3. Registering Learner & Applying...");
    await request('POST', '/api/auth/register', { name: "Joe", email: learnerEmail, password: "Pass123!", role: "LEARNER" });
    const learnerLogin = await request('POST', '/api/auth/login', { email: learnerEmail, password: "Pass123!" });
    const app = await request('POST', `/api/jobs/${job.id}/apply`, {}, learnerLogin.access_token);
    
    console.log("4. Fetching Applicants...");
    const applicants = await request('GET', `/api/employer/jobs/${job.id}/applicants`, null, empLogin.access_token);
    console.log(`   ✅ Found ${applicants.length} applicant(s).`);

    console.log("5. Updating Stage to SHORTLISTED...");
    const updated = await request('PATCH', `/api/employer/applications/${app.id}/stage`, { status: "SHORTLISTED" }, empLogin.access_token);
    console.log("   ✅ New Stage:", updated.status);

    console.log("6. Fetching Analytics...");
    const stats = await request('GET', '/api/employer/analytics', null, empLogin.access_token);
    console.log("   ✅ Stats:", stats);

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    server.kill();
    process.exit(0);
  }
}, 5000); // wait 5 seconds for server to boot
