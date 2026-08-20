const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 STEP 1: Running Database Diagnostic...');
  try {
    const totalIPOs = await prisma.iPO.count();
    console.log(`SELECT COUNT(*) FROM IPO: ${totalIPOs}`);

    const statusCounts = await prisma.iPO.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    console.log('Status Counts:', JSON.stringify(statusCounts));

    const totalGMP = await prisma.iPOGMPHistory.count();
    console.log(`Total GMP Records: ${totalGMP}`);

    const totalSub = await prisma.iPOSubscription.count();
    console.log(`Total Subscription Records: ${totalSub}`);

    const sampleIPOs = await prisma.iPO.findMany({ take: 5 });
    console.log('Sample IPOs in DB:', sampleIPOs.map(i => ({ id: i.id, name: i.name, status: i.status })));
  } catch (err) {
    console.error('Database query error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
