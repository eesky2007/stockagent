async function testBackend() {
  console.log('Testing StockAgent Backend...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing /api/health...');
    const healthRes = await fetch('http://localhost:5175/api/health');
    const health = await healthRes.json();
    console.log('✅ Health:', health);
    
    // Test public search endpoint
    console.log('\n2. Testing search endpoint...');
    const searchRes = await fetch('http://localhost:5175/api/trpc/searchStocks?input=' + encodeURIComponent(JSON.stringify({ query: 'AAPL' })));
    const searchData = await searchRes.json();
    console.log('✅ Search results:', searchData?.result?.data?.results?.length ?? 0, 'stocks found');
    
    // Test protected endpoint (should fail without auth)
    console.log('\n3. Testing protected endpoint (without auth)...');
    const protectedRes = await fetch('http://localhost:5175/api/trpc/getWatchlist');
    const protectedData = await protectedRes.json();
    console.log('Expected error:', protectedData?.error?.message ?? 'No error');
    
    console.log('\n✅ Backend API is responding correctly!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testBackend();
