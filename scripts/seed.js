const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const prisma = new PrismaClient();

const ALGORITHM = 'aes-256-gcm';
const HEX_KEY = '4a7f289b0d1e3f8a9c2b4d6e8f0a1c3b5d7e9f1a2b4c6d8e0f1a3b5c7d9e1f2a';

function encryptPAN(pan) {
  const key = Buffer.from(HEX_KEY, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(pan, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

async function main() {
  console.log('🌱 Seeding AllotX database...');

  const kfintech = await prisma.registrar.upsert({
    where: { code: 'KFINTECH' },
    update: {},
    create: {
      code: 'KFINTECH',
      name: 'KFin Technologies Limited',
      officialUrl: 'https://ris.kfintech.com/ipostatus/',
      active: true,
      healthStatus: 'OPERATIONAL',
    },
  });

  const linkintime = await prisma.registrar.upsert({
    where: { code: 'LINK_INTIME' },
    update: {},
    create: {
      code: 'LINK_INTIME',
      name: 'Link Intime India Pvt Ltd (MUFG)',
      officialUrl: 'https://linkintime.co.in/initial_offer/public-issues.html',
      active: true,
      healthStatus: 'OPERATIONAL',
    },
  });

  const bigshare = await prisma.registrar.upsert({
    where: { code: 'BIGSHARE' },
    update: {},
    create: {
      code: 'BIGSHARE',
      name: 'Bigshare Services Pvt Ltd',
      officialUrl: 'https://www.bigshareonline.com/ipo_allotment.html',
      active: true,
      healthStatus: 'DEGRADED',
    },
  });

  const cameo = await prisma.registrar.upsert({
    where: { code: 'CAMEO' },
    update: {},
    create: {
      code: 'CAMEO',
      name: 'Cameo Corporate Services',
      officialUrl: 'https://ipo.cameoindia.com/',
      active: true,
      healthStatus: 'OPERATIONAL',
    },
  });

  const ipoDhoot = await prisma.iPO.upsert({
    where: { slug: 'dhoot-transmission-ipo' },
    update: {},
    create: {
      name: 'Dhoot Transmission Limited',
      slug: 'dhoot-transmission-ipo',
      symbol: 'DHOOT',
      marketType: 'MAINBOARD',
      status: 'ALLOTMENT_AVAILABLE',
      priceLow: 620,
      priceHigh: 650,
      lotSize: 23,
      minInvestment: 14950,
      issueSize: '₹1,250 Cr',
      freshIssue: '₹900 Cr',
      ofs: '₹350 Cr',
      faceValue: 5,
      openDate: new Date('2026-08-15'),
      closeDate: new Date('2026-08-18'),
      allotmentDate: new Date('2026-08-19'),
      refundDate: new Date('2026-08-20'),
      dematDate: new Date('2026-08-21'),
      listingDate: new Date('2026-08-22'),
      registrarId: kfintech.id,
    },
  });

  const ipoSwiggy = await prisma.iPO.upsert({
    where: { slug: 'swiggy-limited-ipo' },
    update: {},
    create: {
      name: 'Swiggy Limited',
      slug: 'swiggy-limited-ipo',
      symbol: 'SWIGGY',
      marketType: 'MAINBOARD',
      status: 'OPEN',
      priceLow: 371,
      priceHigh: 390,
      lotSize: 38,
      minInvestment: 14820,
      issueSize: '₹11,327 Cr',
      freshIssue: '₹4,499 Cr',
      ofs: '₹6,828 Cr',
      faceValue: 1,
      openDate: new Date('2026-08-19'),
      closeDate: new Date('2026-08-21'),
      allotmentDate: new Date('2026-08-22'),
      refundDate: new Date('2026-08-25'),
      dematDate: new Date('2026-08-25'),
      listingDate: new Date('2026-08-26'),
      registrarId: linkintime.id,
    },
  });

  const ipoNtpc = await prisma.iPO.upsert({
    where: { slug: 'ntpc-green-energy-ipo' },
    update: {},
    create: {
      name: 'NTPC Green Energy Limited',
      slug: 'ntpc-green-energy-ipo',
      symbol: 'NTPCGREEN',
      marketType: 'MAINBOARD',
      status: 'UPCOMING',
      priceLow: 102,
      priceHigh: 108,
      lotSize: 138,
      minInvestment: 14904,
      issueSize: '₹10,000 Cr',
      freshIssue: '₹10,000 Cr',
      ofs: '₹0',
      faceValue: 10,
      openDate: new Date('2026-08-24'),
      closeDate: new Date('2026-08-26'),
      allotmentDate: new Date('2026-08-27'),
      refundDate: new Date('2026-08-28'),
      dematDate: new Date('2026-08-28'),
      listingDate: new Date('2026-08-31'),
      registrarId: kfintech.id,
    },
  });

  const now = new Date();
  await prisma.iPOGMPHistory.deleteMany({ where: { ipoId: ipoDhoot.id } });

  const dhootGMPData = [
    { gmp: 95, date: new Date(now.getTime() - 4 * 86400000), trend: 'STABLE' },
    { gmp: 105, date: new Date(now.getTime() - 3 * 86400000), trend: 'RISING' },
    { gmp: 115, date: new Date(now.getTime() - 2 * 86400000), trend: 'RISING' },
    { gmp: 120, date: new Date(now.getTime() - 1 * 86400000), trend: 'RISING' },
    { gmp: 120, date: now, trend: 'STABLE' },
  ];

  for (const item of dhootGMPData) {
    const est = 650 + item.gmp;
    const pct = parseFloat(((item.gmp / 650) * 100).toFixed(2));
    await prisma.iPOGMPHistory.create({
      data: {
        ipoId: ipoDhoot.id,
        gmp: item.gmp,
        estimatedListing: est,
        gmpPercent: pct,
        trend: item.trend,
        source: 'CONSENSUS',
        confidence: 'HIGH',
        recordedAt: item.date,
      },
    });
  }

  await prisma.iPOSubscription.deleteMany({ where: { ipoId: ipoDhoot.id } });
  await prisma.iPOSubscription.create({
    data: {
      ipoId: ipoDhoot.id,
      retail: 12.4,
      nii: 42.1,
      qib: 35.2,
      employee: 3.2,
      shareholder: 8.5,
      overall: 24.8,
      snapshotDay: 'Day 3 (Final)',
      snapshotTime: '05:00 PM',
    },
  });

  const group = await prisma.iPOApplicationGroup.create({
    data: {
      userId: 'default-user',
      ipoId: ipoDhoot.id,
      name: 'Family Portfolio Applications',
    },
  });

  const sampleApplicants = [
    { name: 'Lekhan', pan: 'CPRPT3173B', status: 'ALLOTTED', shares: 17, lots: 1, appNo: 'KFIN-847291' },
    { name: 'Vishal', pan: 'IGDPB7739A', status: 'NOT_ALLOTTED', shares: 0, lots: 0, appNo: null },
    { name: 'Utsav', pan: 'HIIPR6924M', status: 'NOT_ALLOTTED', shares: 0, lots: 0, appNo: null },
    { name: 'Sahana', pan: 'STHPS5236Q', status: 'NOT_ALLOTTED', shares: 0, lots: 0, appNo: null },
  ];

  for (const item of sampleApplicants) {
    const enc = encryptPAN(item.pan);
    const masked = `${item.pan.slice(0, 5)}••••${item.pan.slice(9)}`;
    const createdApp = await prisma.applicant.create({
      data: {
        groupId: group.id,
        name: item.name,
        encryptedPan: enc,
        panMasked: masked,
        status: item.status,
        sharesAllotted: item.shares,
        lotsAllotted: item.lots,
        applicationNumber: item.appNo,
        verificationSource: 'KFINTECH',
        lastCheckedAt: new Date(),
      },
    });

    await prisma.allotmentCheck.create({
      data: {
        applicantId: createdApp.id,
        ipoId: ipoDhoot.id,
        registrarCode: 'KFINTECH',
        status: item.status,
        sharesAllotted: item.shares,
        lotsAllotted: item.lots,
        durationMs: 420,
        message: item.status === 'ALLOTTED' ? '17 Shares Allotted' : 'No Allotment',
        checkedAt: new Date(),
      },
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
