const http = require('http');

const loginData = JSON.stringify({
  email: `test1779721118748@test.com`,
  password: "Password123!"
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const response = JSON.parse(body);
    console.log('Login Response:', response);
    
    if (response.access_token) {
      const jobData = JSON.stringify({
        title: "Test Job",
        description: "Test Desc"
      });
      
      const jobReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/employer/jobs',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': jobData.length,
          'Authorization': `Bearer ${response.access_token}`
        }
      }, (jobRes) => {
        let jobBody = '';
        jobRes.on('data', d => jobBody += d);
        jobRes.on('end', () => {
          console.log('Job Create Response:', JSON.parse(jobBody));
        });
      });
      jobReq.write(jobData);
      jobReq.end();
    }
  });
});

req.write(loginData);
req.end();
