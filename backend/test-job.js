const http = require('http');

// 1. Log in as Kirabo Winnie
const loginData = JSON.stringify({ email: 'winniekirabo@gmail.com', password: 'Password123!' });
const loginOptions = { hostname: 'localhost', port: 3000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length } };

const req = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    if(!data.access_token) {
        console.log('❌ Login failed! Did you use the right password?');
        return;
    }
    console.log('✅ 1. Login successful! Got token.');

    // 2. Post a job using that token
    const jobData = JSON.stringify({
      title: 'Junior Frontend Developer',
      slug: 'junior-frontend-dev-kigali-2026',
      description: 'We need someone who knows React and Tailwind! Must have great communication skills.',
      location: 'Kigali',
      jobType: 'FULL_TIME',
      salaryMin: 500,
      salaryMax: 1200
    });

    const jobOptions = { 
        hostname: 'localhost', port: 3000, path: '/api/v1/jobs', method: 'POST', 
        headers: { 
            'Content-Type': 'application/json', 
            'Content-Length': jobData.length, 
            'Authorization': 'Bearer ' + data.access_token 
        } 
    };
    
    const req2 = http.request(jobOptions, (res2) => {
        let body2 = '';
        res2.on('data', chunk => body2 += chunk);
        res2.on('end', () => {
            console.log('✅ 2. JOB CREATION STATUS:', res2.statusCode);
            console.log('✅ 3. RESPONSE:', body2);
        });
    });
    req2.write(jobData);
    req2.end();
  });
});
req.write(loginData);
req.end();
