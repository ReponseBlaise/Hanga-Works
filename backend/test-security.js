const http = require('http');

async function testSecurity() {
  console.log("🔒 Starting Security Verification...\n");

  // Fire 101 requests rapidly to trigger rate limiting
  let requests = [];
  for (let i = 0; i < 105; i++) {
    requests.push(new Promise((resolve) => {
      http.get('http://localhost:3000/api/courses', (res) => {
        resolve({
          status: res.statusCode,
          headers: res.headers
        });
      }).on('error', () => resolve({ status: 500 }));
    }));
  }

  const results = await Promise.all(requests);
  
  // Check headers on the first response
  const firstRes = results[0];
  console.log("Headers attached by Helmet:");
  console.log("- Strict-Transport-Security:", firstRes.headers['strict-transport-security'] ? "✅ PRESENT" : "❌ MISSING");
  console.log("- X-DNS-Prefetch-Control:", firstRes.headers['x-dns-prefetch-control'] ? "✅ PRESENT" : "❌ MISSING");
  console.log("- X-Frame-Options:", firstRes.headers['x-frame-options'] ? "✅ PRESENT" : "❌ MISSING");
  console.log("- Content-Security-Policy:", firstRes.headers['content-security-policy'] ? "✅ PRESENT" : "❌ MISSING");

  // Check rate limiting
  const tooManyRequests = results.filter(r => r.status === 429);
  console.log("\nRate Limiting Check (100 req/15m):");
  console.log(`Total Requests Sent: ${results.length}`);
  console.log(`Requests Blocked (429): ${tooManyRequests.length}`);
  
  if (tooManyRequests.length > 0) {
    console.log("✅ Rate Limiting is perfectly active! The server successfully blocked excess requests.");
  } else {
    console.log("❌ Rate Limiting did not trigger. Server might not have restarted or config is wrong.");
  }
}

testSecurity().catch(console.error);
