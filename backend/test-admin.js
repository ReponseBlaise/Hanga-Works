const http = require('http');

const loginData = JSON.stringify({
  email: 'kafurukaleo66@gmail.com',
  password: 'leo@ABC2025!!'
});

const req = http.request('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Login Response Status:', res.statusCode);
    const response = JSON.parse(body);
    const token = response.access_token;
    if (!token) return console.log('No token obtained. Body:', body);

    const req2 = http.request('http://localhost:3000/api/v1/users', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, (res2) => {
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        console.log('GET /users Status:', res2.statusCode);
        console.log('GET /users Body:', body2.substring(0, 500));
      });
    });
    req2.end();
  });
});

req.write(loginData);
req.end();
