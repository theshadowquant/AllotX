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
  console.log('🌱 Seeding AllotX database with accurate historical and live IPO data...');

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

  // 1. Tempsens Instruments (LIVE ISSUE 20 AUG 2026)
  const ipoTempsens = await prisma.iPO.upsert({
    where: { slug: 'tempsens-instruments-ipo' },
    update: {
      status: 'OPEN',
      openDate: new Date('2026-08-20T00:00:00Z'),
      closeDate: new Date('2026-08-24T23:59:59Z'),
    },
    create: {
      name: 'Tempsens Instruments (India) Limited',
      slug: 'tempsens-instruments-ipo',
      symbol: 'TEMPSENS',
      marketType: 'MAINBOARD',
      status: 'OPEN',
      priceLow: 285,
      priceHigh: 300,
      lotSize: 50,
      minInvestment: 15000,
      issueSize: '₹1,518 Cr',
      openDate: new Date('2026-08-20T00:00:00Z'),
      closeDate: new Date('2026-08-24T23:59:59Z'),
      allotmentDate: new Date('2026-08-25T00:00:00Z'),
      listingDate: new Date('2026-08-27T00:00:00Z'),
      registrarId: kfintech.id,
    },
  });

  // 2. Gaja Alternative Asset (LIVE ISSUE 20 AUG 2026)
  const ipoGaja = await prisma.iPO.upsert({
    where: { slug: 'gaja-alternative-asset-ipo' },
    update: {
      status: 'OPEN',
      openDate: new Date('2026-08-19T00:00:00Z'),
      closeDate: new Date('2026-08-21T23:59:59Z'),
    },
    create: {
      name: 'Gaja Alternative Asset Management Limited',
      slug: 'gaja-alternative-asset-ipo',
      symbol: 'GAJA',
      marketType: 'MAINBOARD',
      status: 'OPEN',
      priceLow: 152,
      priceHigh: 160,
      lotSize: 90,
      minInvestment: 14400,
      issueSize: '₹405 Cr',
      openDate: new Date('2026-08-19T00:00:00Z'),
      closeDate: new Date('2026-08-21T23:59:59Z'),
      allotmentDate: new Date('2026-08-24T00:00:00Z'),
      listingDate: new Date('2026-08-26T00:00:00Z'),
      registrarId: linkintime.id,
    },
  });

  // 3. Swiggy Limited (ACTUAL HISTORICAL LISTED IPO: NOV 2024)
  const ipoSwiggy = await prisma.iPO.upsert({
    where: { slug: 'swiggy-limited-ipo' },
    update: {
      status: 'LISTED',
      openDate: new Date('2024-11-06T00:00:00Z'),
      closeDate: new Date('2024-11-08T23:59:59Z'),
      allotmentDate: new Date('2024-11-11T00:00:00Z'),
      listingDate: new Date('2024-11-13T00:00:00Z'),
    },
    create: {
      name: 'Swiggy Limited',
      slug: 'swiggy-limited-ipo',
      symbol: 'SWIGGY',
      marketType: 'MAINBOARD',
      status: 'LISTED',
      priceLow: 371,
      priceHigh: 390,
      lotSize: 38,
      minInvestment: 14820,
      issueSize: '₹11,327 Cr',
      openDate: new Date('2024-11-06T00:00:00Z'),
      closeDate: new Date('2024-11-08T23:59:59Z'),
      allotmentDate: new Date('2024-11-11T00:00:00Z'),
      listingDate: new Date('2024-11-13T00:00:00Z'),
      registrarId: linkintime.id,
    },
  });

  // 4. Premier Energies Limited (ACTUAL HISTORICAL LISTED IPO: AUG 2024)
  const ipoPremier = await prisma.iPO.upsert({
    where: { slug: 'premier-energies-ipo' },
    update: {
      status: 'LISTED',
      openDate: new Date('2024-08-27T00:00:00Z'),
      closeDate: new Date('2024-08-29T23:59:59Z'),
      allotmentDate: new Date('2024-08-30T00:00:00Z'),
      listingDate: new Date('2024-09-03T00:00:00Z'),
    },
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
      openDate: new Date('2024-08-27T00:00:00Z'),
      closeDate: new Date('2024-08-29T23:59:59Z'),
      allotmentDate: new Date('2024-08-30T00:00:00Z'),
      listingDate: new Date('2024-09-03T00:00:00Z'),
      registrarId: kfintech.id,
    },
  });

  // Seed Subscriptions for Tempsens
  await prisma.iPOSubscription.deleteMany({ where: { ipoId: ipoTempsens.id } });
  await prisma.iPOSubscription.create({
    data: {
      ipoId: ipoTempsens.id,
      retail: 3.2,
      nii: 4.8,
      qib: 2.1,
      overall: 3.68,
      snapshotDay: 'Day 1',
      snapshotTime: '05:00 PM',
    },
  });

  // Seed Application Groups with Explicit User Ownership
  await prisma.iPOApplicationGroup.deleteMany({ where: { userId: 'user-a' } });

  const groupA = await prisma.iPOApplicationGroup.create({
    data: {
      userId: 'user-a',
      ipoId: ipoTempsens.id,
      name: 'User A — Tempsens Portfolio',
    },
  });

  await prisma.applicant.create({
    data: {
      groupId: groupA.id,
      name: 'Lekhan (User A)',
      encryptedPan: encryptPAN('CPRPT3173B'),
      panMasked: 'CPRPT••••B',
      status: 'PENDING',
      verificationSource: 'KFINTECH',
    },
  });

  console.log('✅ Historical data corrected & live database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
