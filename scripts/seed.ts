import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const ALGORITHM = 'aes-256-gcm';
const HEX_KEY = '4a7f289b0d1e3f8a9c2b4d6e8f0a1c3b5d7e9f1a2b4c6d8e0f1a3b5c7d9e1f2a';

function encryptPAN(pan: string): string {
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

  // 1. Seed Registrars
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

  // 2. Seed IPOs
  // IPO 1: Dhoot Transmission (ALLOTMENT_AVAILABLE)
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

  // IPO 2: Swiggy Limited (OPEN NOW)
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

  // IPO 3: NTPC Green Energy (UPCOMING)
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

  // IPO 4: Premier Energies (LISTED)
  const ipoPremier = await prisma.iPO.upsert({
    where: { slug: 'premier-energies-ipo' },
    update: {},
    create: {
      name: 'Premier Energies Limited',
      slug: 'premier-energies-ipo',
      symbol: 'PREMIERENE',
      marketType: 'MAINBOARD',
      status: 'LISTED',
      priceLow: 427,
      priceHigh: 450,
      lotSize: 33,
      minInvestment: 14850,
      issueSize: '₹2,830 Cr',
      freshIssue: '₹1,291 Cr',
      ofs: '₹1,539 Cr',
      faceValue: 1,
      openDate: new Date('2026-08-01'),
      closeDate: new Date('2026-08-05'),
      allotmentDate: new Date('2026-08-06'),
      refundDate: new Date('2026-08-07'),
      dematDate: new Date('2026-08-07'),
      listingDate: new Date('2026-08-08'),
      registrarId: kfintech.id,
    },
  });

  // IPO 5: TechGenius SME (SME OPEN)
  const ipoTechGenius = await prisma.iPO.upsert({
    where: { slug: 'techgenius-solutions-sme-ipo' },
    update: {},
    create: {
      name: 'TechGenius Solutions Limited',
      slug: 'techgenius-solutions-sme-ipo',
      symbol: 'TECHGENIUS',
      marketType: 'SME',
      status: 'OPEN',
      priceLow: 140,
      priceHigh: 145,
      lotSize: 1000,
      minInvestment: 145000,
      issueSize: '₹48 Cr',
      freshIssue: '₹48 Cr',
      ofs: '₹0',
      faceValue: 10,
      openDate: new Date('2026-08-18'),
      closeDate: new Date('2026-08-20'),
      allotmentDate: new Date('2026-08-21'),
      refundDate: new Date('2026-08-24'),
      dematDate: new Date('2026-08-24'),
      listingDate: new Date('2026-08-25'),
      registrarId: bigshare.id,
    },
  });

  // 3. Seed GMP History for Dhoot Transmission
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
        trend: item.trend as any,
        source: 'CONSENSUS',
        confidence: 'HIGH',
        recordedAt: item.date,
      },
    });
  }

  // GMP History for Swiggy
  await prisma.iPOGMPHistory.deleteMany({ where: { ipoId: ipoSwiggy.id } });
  const swiggyGMPData = [
    { gmp: 15, date: new Date(now.getTime() - 3 * 86400000), trend: 'STABLE' },
    { gmp: 22, date: new Date(now.getTime() - 2 * 86400000), trend: 'RISING' },
    { gmp: 25, date: new Date(now.getTime() - 1 * 86400000), trend: 'RISING' },
    { gmp: 20, date: now, trend: 'FALLING' },
  ];

  for (const item of swiggyGMPData) {
    const est = 390 + item.gmp;
    const pct = parseFloat(((item.gmp / 390) * 100).toFixed(2));
    await prisma.iPOGMPHistory.create({
      data: {
        ipoId: ipoSwiggy.id,
        gmp: item.gmp,
        estimatedListing: est,
        gmpPercent: pct,
        trend: item.trend as any,
        source: 'CONSENSUS',
        confidence: 'HIGH',
        recordedAt: item.date,
      },
    });
  }

  // 4. Seed Subscription Data
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

  await prisma.iPOSubscription.deleteMany({ where: { ipoId: ipoSwiggy.id } });
  await prisma.iPOSubscription.create({
    data: {
      ipoId: ipoSwiggy.id,
      retail: 3.1,
      nii: 4.8,
      qib: 8.2,
      overall: 5.4,
      snapshotDay: 'Day 2',
      snapshotTime: '04:30 PM',
    },
  });

  // 5. Seed Default Application Group with Applicants for Dhoot Transmission
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
        status: item.status as any,
        sharesAllotted: item.shares,
        lotsAllotted: item.lots,
        applicationNumber: item.appNo,
        verificationSource: 'KFINTECH',
        lastCheckedAt: new Date(),
      },
    });

    // Create Audit Check History entry
    await prisma.allotmentCheck.create({
      data: {
        applicantId: createdApp.id,
        ipoId: ipoDhoot.id,
        registrarCode: 'KFINTECH',
        status: item.status as any,
        sharesAllotted: item.shares,
        lotsAllotted: item.lots,
        durationMs: 420,
        message: item.status === 'ALLOTTED' ? '17 Shares Allotted' : 'No Allotment',
        checkedAt: new Date(),
      },
    });
  }

  console.log('✅ AllotX database successfully seeded with initial IPOs, GMP, Subscriptions & Applicants!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
