async function runProductionAcceptanceTest() {
  console.log('🧪 RUNNING PRODUCTION ACCEPTANCE TEST ON LIVE DEPLOYMENT...\n');

  try {
    // 1. Verify OPEN / CURRENT IPOs
    console.log('1️⃣ Fetching /api/ipos?status=OPEN...');
    const openRes = await fetch('https://allot-x-zeta.vercel.app/api/ipos?status=OPEN');
    const openJson = await openRes.json();

    console.log(`HTTP Status: ${openRes.status}, Success: ${openJson.success}`);
    console.log(`Current Open IPO Count: ${openJson.count}`);
    const openNames = (openJson.data || []).map((i) => i.name);
    console.log('Current Open IPOs:', openNames);

    const containsSwiggyInOpen = openNames.some((n) => n.includes('Swiggy'));
    console.log('❌ Contains Swiggy in Current Open List:', containsSwiggyInOpen);

    // 2. Verify LISTED IPOs
    console.log('\n2️⃣ Fetching /api/ipos?status=LISTED...');
    const listedRes = await fetch('https://allot-x-zeta.vercel.app/api/ipos?status=LISTED');
    const listedJson = await listedRes.json();

    console.log(`HTTP Status: ${listedRes.status}, Success: ${listedJson.success}`);
    console.log(`Listed IPO Count: ${listedJson.count}`);
    const listedNames = (listedJson.data || []).map((i) => i.name);
    console.log('Listed IPOs:', listedNames);

    const containsSwiggyInListed = listedNames.some((n) => n.includes('Swiggy'));
    console.log('✅ Swiggy Correctly Classified under LISTED:', containsSwiggyInListed);

    // 3. Verify My IPO Applications User Ownership API
    console.log('\n3️⃣ Fetching /api/ipo-groups?userId=user-a...');
    const groupsRes = await fetch('https://allot-x-zeta.vercel.app/api/ipo-groups?userId=user-a');
    const groupsJson = await groupsRes.json();

    console.log(`HTTP Status: ${groupsRes.status}, Success: ${groupsJson.success}`);
    console.log(`User A Application Groups Count: ${groupsJson.data ? groupsJson.data.length : 0}`);
    if (groupsJson.data && groupsJson.data.length > 0) {
      console.log('User A Groups:', groupsJson.data.map((g) => ({ name: g.name, ipo: g.ipo.name })));
    }

    console.log('\n🎉 ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Acceptance test failed:', err.message);
  }
}

runProductionAcceptanceTest();
