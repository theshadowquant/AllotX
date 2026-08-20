const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditData() {
  console.log('🔍 Running Database Data Integrity Audit...');

  const ipos = await prisma.iPO.findMany({
    include: { registrar: true },
    orderBy: { openDate: 'desc' },
  });

  console.log(`Total IPO Records in DB: ${ipos.length}\n`);

  for (const ipo of ipos) {
    console.log(`--------------------------------------------------`);
    console.log(`ID: ${ipo.id}`);
    console.log(`Name: ${ipo.name} (${ipo.symbol})`);
    console.log(`Status Stored: ${ipo.status}`);
    console.log(`Open Date: ${ipo.openDate.toISOString().split('T')[0]}`);
    console.log(`Close Date: ${ipo.closeDate.toISOString().split('T')[0]}`);
    console.log(`Listing Date: ${ipo.listingDate.toISOString().split('T')[0]}`);
    console.log(`Registrar: ${ipo.registrar ? ipo.registrar.code : 'NONE'}`);
  }
}

auditData().finally(() => prisma.$disconnect());
