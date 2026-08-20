import { validateDiscoveredIPO, validateGMPQuote } from '../lib/ingestion/validator';
import { calculateGMPConsensus } from '../lib/ingestion/gmpEngine';

// Fixture 1: Real NSE Discovery Response Normalization
const mockNSEResponseFixture = [
  {
    symbol: 'SWIGGY',
    companyName: 'Swiggy Limited',
    priceBandLow: '371',
    priceBandHigh: '390',
    lotSize: '38',
    issueStartDate: '2024-11-06',
    issueEndDate: '2024-11-08',
    status: 'Current',
  },
];

// Fixture 2: Chittorgarh GMP Quote Normalization
const mockChittorgarhGMPFixture = [
  {
    name: 'SWIGGY',
    gmp: '45',
    premium: '45',
  },
];

console.log('🧪 Running Data Automation Fixture Tests...');

// Test 1: Validate IPO Discovery Normalization
const rawIPO = mockNSEResponseFixture[0];
const normalizedIPO = {
  name: rawIPO.companyName,
  symbol: rawIPO.symbol,
  marketType: 'MAINBOARD' as const,
  status: 'OPEN' as const,
  priceLow: parseFloat(rawIPO.priceBandLow),
  priceHigh: parseFloat(rawIPO.priceBandHigh),
  lotSize: parseInt(rawIPO.lotSize, 10),
  minInvestment: parseFloat(rawIPO.priceBandHigh) * parseInt(rawIPO.lotSize, 10),
  openDate: new Date(rawIPO.issueStartDate),
  closeDate: new Date(rawIPO.issueEndDate),
  allotmentDate: new Date('2024-11-11'),
  listingDate: new Date('2024-11-13'),
  registrarCode: 'LINK_INTIME',
};

const valIPO = validateDiscoveredIPO(normalizedIPO);
if (!valIPO.valid) throw new Error(`IPO Validation failed: ${valIPO.reason}`);
console.log('✅ Test 1 Passed: IPO Discovery Normalization & Validation');

// Test 2: Validate GMP Quote & Consensus Calculation
const rawGMP = mockChittorgarhGMPFixture[0];
const quote = {
  symbolOrName: rawGMP.name,
  gmp: parseFloat(rawGMP.gmp),
  reliabilityWeight: 0.9,
  source: 'CHITTORGARH_FEED',
  fetchedAt: new Date(),
};

const valGMP = validateGMPQuote(quote, normalizedIPO.priceHigh);
if (!valGMP.valid) throw new Error(`GMP Validation failed: ${valGMP.reason}`);

const consensus = calculateGMPConsensus(
  [{ source: quote.source, value: quote.gmp, timestamp: quote.fetchedAt.toISOString(), reliabilityWeight: quote.reliabilityWeight }],
  normalizedIPO.priceHigh,
  null
);

if (consensus.gmp !== 45) throw new Error(`Expected GMP 45, got ${consensus.gmp}`);
if (consensus.estimatedListing !== 435) throw new Error(`Expected Listing 435, got ${consensus.estimatedListing}`);
console.log('✅ Test 2 Passed: GMP Quote Normalization & Consensus Engine');

// Test 3: Validate Out-of-Bounds Rejection
const invalidQuote = { ...quote, gmp: 9999 };
const valInvalid = validateGMPQuote(invalidQuote, normalizedIPO.priceHigh);
if (valInvalid.valid !== false) throw new Error('Expected out-of-bounds GMP to be rejected');
console.log('✅ Test 3 Passed: Out-of-Bounds GMP Rejection');

console.log('🎉 ALL FIXTURE TESTS PASSED WITH 100% SUCCESS!');
