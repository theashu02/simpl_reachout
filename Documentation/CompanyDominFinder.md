# 🔍 Company Domain Finder

A high-performance domain verification system that finds official company websites using Google Search API (Serper).

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Confidence Scoring](#confidence-scoring)
- [Setup](#setup)
- [Usage Examples](#usage-examples)

---

## Overview

This system takes a company name as input and returns:

- Whether the company exists
- The official domain (e.g., `stripe.com`)
- Confidence score (0-100%)
- Verification status
- Source of data (Knowledge Graph vs Search Results)

### Key Features

- ⚡ **Fast Response** - ~200ms average response time
- 🎯 **High Accuracy** - Uses Google Knowledge Graph for verified results
- 🛡️ **Smart Filtering** - Automatically filters social media and job sites
- 📊 **Confidence Scoring** - Transparent scoring based on match quality

---

## System Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend   │────▶│  Backend (Bun)   │────▶│   Serper API    │
│   (React)    │◀────│  DomainScraper   │◀────│  (Google Search)│
└──────────────┘     └──────────────────┘     └─────────────────┘
     │                       │                        │
     │  POST /api/domain     │  HTTP POST             │
     │  /verify              │  google.serper.dev     │
     │                       │                        │
     ▼                       ▼                        ▼
 User Input:            Process &               Returns:
 "Stripe"               Score Results           knowledgeGraph
                                                + organic results
```

### Components

| Component      | Path                                                    | Description       |
| -------------- | ------------------------------------------------------- | ----------------- |
| Frontend UI    | `apps/frontend/app/products/hyper-mail/search/page.tsx` | React interface   |
| API Routes     | `apps/backend/src/DomainScraper/routes.ts`              | Elysia endpoints  |
| Verifier Logic | `apps/backend/src/DomainScraper/verifier.ts`            | Core search logic |

---

## How It Works

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOMAIN VERIFICATION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

STEP 1: USER INPUT
══════════════════
User enters company name: "Stripe"
                    │
                    ▼

STEP 2: BUILD SEARCH QUERY
══════════════════════════
Query: '"Stripe" official website'

Why this format?
• Quotes ensure exact match for company name
• "official website" prioritizes official sources
                    │
                    ▼

STEP 3: CALL SERPER API
═══════════════════════
POST https://google.serper.dev/search
Headers: { X-API-KEY: "your-key" }
Body: { q: query, num: 5 }
                    │
                    ▼

STEP 4: PROCESS RESPONSE
════════════════════════
Serper returns two types of data:

┌─────────────────────────────────────┐
│ A) KNOWLEDGE GRAPH (Preferred)      │
├─────────────────────────────────────┤
│ {                                   │
│   title: "Stripe",                  │
│   website: "https://stripe.com",    │
│   description: "Payment platform"   │
│ }                                   │
│                                     │
│ ✅ Most reliable - Google verified  │
│ ✅ Confidence: 95%                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ B) ORGANIC RESULTS (Fallback)       │
├─────────────────────────────────────┤
│ [                                   │
│   { link: "stripe.com", ... },      │
│   { link: "linkedin.com/...", ... } │
│ ]                                   │
│                                     │
│ ⚠️ Less reliable - needs filtering  │
│ ⚠️ Confidence: 60-85%               │
└─────────────────────────────────────┘
                    │
                    ▼

STEP 5: FILTER RESULTS
══════════════════════
Remove non-company domains:
❌ linkedin.com      (professional network)
❌ facebook.com      (social media)
❌ twitter.com       (social media)
❌ wikipedia.org     (encyclopedia)
❌ glassdoor.com     (job reviews)
❌ indeed.com        (job board)
❌ crunchbase.com    (company database)
                    │
                    ▼

STEP 6: CALCULATE CONFIDENCE
════════════════════════════
┌────────────────────────────────────────┐
│ From Knowledge Graph?                  │
│   └─▶ 95% confidence (Verified ✓)      │
│                                        │
│ From Organic Results?                  │
│   ├─▶ Title contains "Stripe"? → 85%  │
│   ├─▶ Domain contains "stripe"? → 75% │
│   └─▶ No direct match? → 60%          │
└────────────────────────────────────────┘
                    │
                    ▼

STEP 7: EXTRACT DOMAIN
══════════════════════
URL: "https://www.stripe.com/pricing"
           │
           ▼
Domain: "stripe.com"

(Removes: protocol, www, path)
                    │
                    ▼

STEP 8: RETURN RESPONSE
═══════════════════════
{
  "company_name": "Stripe",
  "exists": true,
  "domain": "stripe.com",
  "confidence": 95,
  "verified": true,
  "source": "knowledge_graph",
  "title": "Stripe",
  "description": "Financial infrastructure..."
}
```

---

## API Reference

### Verify Single Company

```http
POST /api/domain/verify
Content-Type: application/json

{
  "companyName": "Stripe"
}
```

**Response:**

```json
{
  "company_name": "Stripe",
  "exists": true,
  "domain": "stripe.com",
  "confidence": 95,
  "verified": true,
  "source": "knowledge_graph",
  "title": "Stripe",
  "description": "Stripe is a technology company...",
  "url": "https://stripe.com"
}
```

### Verify Multiple Companies

```http
POST /api/domain/verify-bulk
Content-Type: application/json

{
  "companies": ["Stripe", "OpenAI", "Tesla"]
}
```

**Response:**

```json
{
  "results": [...],
  "count": 3,
  "verified": 3
}
```

---

## Confidence Scoring

| Score   | Source          | Condition                    | Meaning                |
| ------- | --------------- | ---------------------------- | ---------------------- |
| **95%** | Knowledge Graph | Google verified entity       | ✅ Highly reliable     |
| **85%** | Organic         | Title contains company name  | ✅ Very likely correct |
| **75%** | Organic         | Domain contains company name | ✅ Likely correct      |
| **60%** | Organic         | No direct match              | ⚠️ Review recommended  |
| **40%** | Organic         | Only social media found      | ⚠️ No official site    |
| **0%**  | None            | Company not found            | ❌ Does not exist      |

### Verification Status

- **Verified** (`verified: true`): Confidence ≥ 75%
- **Exists** (`exists: true, verified: false`): Found but low confidence
- **Not Found** (`exists: false`): No results

---

## Setup

### Prerequisites

- Bun runtime
- Serper API key ([Get one here](https://serper.dev))

### Environment Variables

Add to `apps/backend/.env`:

```env
SERPER_API_KEY=your_serper_api_key_here
```

### Start the Server

```bash
cd apps/backend
bun run dev
```

---

## Usage Examples

### cURL

```bash
# Single company
curl -X POST http://localhost:5000/api/domain/verify \
  -H "Content-Type: application/json" \
  -d '{"companyName": "OpenAI"}'

# Bulk verify
curl -X POST http://localhost:5000/api/domain/verify-bulk \
  -H "Content-Type: application/json" \
  -d '{"companies": ["Google", "Microsoft", "Apple"]}'
```

### JavaScript

```javascript
const response = await fetch("http://localhost:5000/api/domain/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ companyName: "Netflix" }),
});

const result = await response.json();
console.log(result.domain); // "netflix.com"
```

---

## Error Handling

| Error                    | Cause           | Solution           |
| ------------------------ | --------------- | ------------------ |
| `SERPER_API_KEY not set` | Missing API key | Add to `.env`      |
| `Serper API error: 401`  | Invalid API key | Check key validity |
| `Serper API error: 429`  | Rate limited    | Wait and retry     |

---

## License

MIT
