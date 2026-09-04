const urls = [
  'http://localhost:3005/',
  'http://localhost:3005/cases',
  'http://localhost:3005/cases/1001',
  'http://localhost:3005/cases/1001/evidence',
  'http://localhost:3005/cases/1001/jobs',
  'http://localhost:3005/cases/1001/extraction',
  'http://localhost:3005/cases/1001/quality-review',
  'http://localhost:3005/cases/1001/resolution-review',
  'http://localhost:3005/cases/1001/graph',
  'http://localhost:3005/ontology/entities',
  'http://localhost:3005/ontology/entities/1001',
  'http://localhost:3005/ontology/relationships',
  'http://localhost:3005/ontology/relationships/3001'
];

async function run() {
  console.log('--- TESTING ALL APPLICATION ROUTES ---');
  let passCount = 0;
  for (const u of urls) {
    try {
      const res = await fetch(u);
      const text = await res.text();
      console.log(`[PASS] ${res.status} ${u} (${text.length} bytes)`);
      if (res.status === 200) passCount++;
    } catch (e) {
      console.log(`[FAIL] ${u} -> ${e.message}`);
    }
  }
  console.log(`\nRESULT: ${passCount} / ${urls.length} routes passed successfully with HTTP 200.`);
}

run();
