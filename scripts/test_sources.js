async function testSources() {
  console.log('🌐 Fetching Real NSE IPO Data...');

  try {
    const res = await fetch('https://www.nseindia.com/api/ipo-current-issue', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.nseindia.com/market-data/all-upcoming-issues-ipo',
      },
    });

    console.log(`HTTP Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response length: ${text.length} bytes`);
    console.log('First 500 chars:', text.substring(0, 500));
  } catch (err) {
    console.error('NSE Fetch Error:', err.message);
  }
}

testSources();
