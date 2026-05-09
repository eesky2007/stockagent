const API_BASE = 'http://localhost:5175';

async function test() {
  console.log('Testing StockAgent Backend with Mock Data...\n');

  try {
    // 1. Test health
    console.log('1. Testing health endpoint...');
    const health = await fetch(`${API_BASE}/api/health`).then(r => r.json());
    console.log('✅ Health:', health, '\n');

    // 2. Test search
    console.log('2. Testing search for "apple"...');
    const searchRes = await fetch(`${API_BASE}/api/trpc/searchStocks?input={"query":"apple"}`, {
      credentials: 'include'
    }).then(r => r.json());
    console.log('✅ Search result:', JSON.stringify(searchRes, null, 2), '\n');

    // 3. Test quote for mock stock
    console.log('3. Testing quote for AAPL...');
    const quoteRes = await fetch(`${API_BASE}/api/trpc/getStockQuote?input={"symbol":"AAPL"}`, {
      credentials: 'include'
    }).then(r => r.json());
    console.log('✅ Quote result:', JSON.stringify(quoteRes, null, 2), '\n');

    // 4. Test search for TSLA
    console.log('4. Testing search for "tesla"...');
    const teslaRes = await fetch(`${API_BASE}/api/trpc/searchStocks?input={"query":"tesla"}`, {
      credentials: 'include'
    }).then(r => r.json());
    console.log('✅ Tesla search:', JSON.stringify(teslaRes, null, 2), '\n');

    console.log('✅ All tests completed successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

test().then(() => process.exit(0));
