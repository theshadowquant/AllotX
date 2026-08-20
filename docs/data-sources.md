# AllotX Production Data Source Matrix & Integration Documentation

This document documents the upstream data sources, endpoint contracts, authentication requirements, rate limits, and normalization rules for **AllotX**.

---

## 1. Data Provider Overview

| Domain | Target Provider Interface | Primary Source | Secondary / Fallback Source | Access Method | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IPO Discovery & Dates** | `IPODataProvider` | NSE Official IPO Issue Feed | BSE Public Issue Directory | Public JSON / CSV Endpoint | None |
| **Category Subscription** | `SubscriptionProvider` | NSE Bidding Category Summary Feed | BSE Category Subscription Feed | Public JSON Endpoint | None |
| **Grey Market Premium** | `GMPProvider` | Chittorgarh / InvestorGain OTC Consensus Feed | IPOWatch OTC Market Feed | Public JSON / HTML Parser | None |
| **Allotment Enquiries** | `RegistrarAdapter` | Official Registrar Query Interfaces (KFintech, Link Intime, Bigshare, Cameo) | Registrar Portal Action Links | HTTP Session Form Post + CAPTCHA | User CAPTCHA |

---

## 2. Upstream Source Matrix

### A. IPO Discovery & Dates Source (`IPODataProvider`)

#### Primary Source: NSE Official IPO Issue Feed
- **Organization**: National Stock Exchange of India (NSE India)
- **Official URL**: `https://www.nseindia.com/market-data/all-upcoming-issues-ipo`
- **Endpoint**: `https://www.nseindia.com/api/ipo-current-issue`
- **HTTP Method**: `GET`
- **Required Headers**:
  ```json
  {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/market-data/all-upcoming-issues-ipo"
  }
  ```
- **Authentication**: Session cookie initialization required (`GET https://www.nseindia.com` first to store session cookie).
- **Rate Limit**: 1 request every 5–10 seconds.
- **Terms / Access**: Public informational market feed.
- **Fields Extracted**:
  - `symbol` (e.g. `"SWIGGY"`)
  - `companyName` (e.g. `"Swiggy Limited"`)
  - `issueType` (`"EQ"` -> `MAINBOARD` / `SME`)
  - `issueStartDate` (e.g. `"06-Nov-2024"`)
  - `issueEndDate` (e.g. `"08-Nov-2024"`)
  - `priceBand` (e.g. `"371 - 390"`)
  - `issueSize` (e.g. `"11327.43 Cr"`)
  - `status` (`"Current"`, `"Upcoming"`, `"Closed"`)

#### Secondary Fallback: BSE Public Issue Directory
- **Organization**: Bombay Stock Exchange (BSE India)
- **Official URL**: `https://www.bseindia.com/markets/PublicIssues/IPOGetCurrentIssue.aspx`
- **Endpoint**: `https://api.bseindia.com/BseIndiaAPI/api/IPOList/w`
- **HTTP Method**: `GET`

---

### B. Category Subscription Bidding Source (`SubscriptionProvider`)

#### Primary Source: NSE Category Subscription Summary Feed
- **Organization**: National Stock Exchange of India (NSE India)
- **Endpoint**: `https://www.nseindia.com/api/ipo-bid-details?symbol={SYMBOL}`
- **HTTP Method**: `GET`
- **Required Headers**: Standard NSE session headers (`User-Agent`, `Referer`, `Cookie`).
- **Fields Extracted**:
  - `qib` (Qualified Institutional Buyers subscription multiple)
  - `nii` (Non-Institutional Investors / HNI subscription multiple)
  - `retail` (Retail Individual Investors subscription multiple)
  - `employee` (Employee reservation subscription multiple)
  - `overall` (Overall combined issue subscription multiple)
  - `snapshotDay` / `snapshotTime`

---

### C. Grey Market Premium (GMP) Sources (`GMPProvider` & `FallbackGMPProvider`)

> [!IMPORTANT]
> **GMP Data Distinction**:
> Grey Market Premium (GMP) is unofficial, unregulated OTC sentiment data. It does NOT exist on official exchange order books (NSE/BSE).

#### Primary Source (`ConsensusGMPProvider`): Chittorgarh OTC Aggregator Feed
- **Organization**: Chittorgarh / InvestorGain IPO Tracker
- **Endpoint / Feed**: `https://www.chittorgarh.com/ipo/ipo_gmp.asp` (Public JSON / HTML Feed)
- **HTTP Method**: `GET`
- **Fields Extracted**:
  - `symbolOrName`
  - `gmp` (Absolute INR premium e.g. `120`)
  - `gmpPercent` (Percentage gain relative to upper price band)
  - `estimatedListing` (PriceBandHigh + GMP)
  - `reliabilityWeight` (`0.90`)

#### Secondary Fallback (`FallbackGMPProvider`): IPOWatch OTC Market Feed
- **Organization**: IPOWatch Grey Market Aggregator
- **Endpoint / Feed**: `https://ipowatch.in/ipo-gmp-top-gainer/`
- **HTTP Method**: `GET`
- **Fields Extracted**:
  - `symbolOrName`
  - `gmp`
  - `reliabilityWeight` (`0.75`)

---

## 3. Data Integrity & Event Transition Fix

### Event Engine Rule Update:
In previous versions, status was set to `ALLOTMENT_AVAILABLE` if `currentDate >= allotmentDate`.
**Correction**:
- If `currentDate >= allotmentDate`, status transitions to `ALLOTMENT_PENDING`.
- Status transitions to `ALLOTMENT_AVAILABLE` **ONLY** when registrar verification or explicit allotment confirmation is detected!

---

## 4. Source Health & Monitoring Metrics

Every provider fetch logs an audit record to `DataUpdateLog` and updates `DataSource`:
- `sourceCode`
- `status` (`HEALTHY`, `STALE`, `FAILED`, `DISABLED`)
- `lastSuccessfulUpdate`
- `recordsFetched`, `recordsAccepted`, `recordsRejected`
- `durationMs`
- `errorMessage`
