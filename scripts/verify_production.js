async function verifyProductionAPI() {
  console.log('🌐 Verifying Live Production API /api/ipos...');
  try {
    const res = await fetch('https://allot-x-zeta.vercel.app/api/ipos', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    console.log(`HTTP Status: ${res.status}`);
    const json = await res.json();
    console.log(`Production API Response Success: ${json.success}`);
    if (json.data && Array.isArray(json.data)) {
      console.log(`Total IPOs returned by production API: ${json.data.length}`);
      console.log('IPOs:', json.data.map(i => ({ id: i.id, name: i.name, symbol: i.symbol, status: i.status })));
    } else {
      console.log('Full JSON response:', json);
    }
  } catch (err) {
    console.error('Error fetching production API:', err.message);
  }
}

verifyProductionAPI();
