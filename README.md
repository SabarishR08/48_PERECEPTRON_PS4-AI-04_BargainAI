# BargainAI: GenAI-Powered Local Market Price Negotiation Assistant

> **InnovateX – Problem Statement AI-04**  
> *Buyers and small sellers in local markets often don't know if a price is fair. Build an AI assistant where you describe/photo an item and your location, and it suggests a fair price range along with tips on how to negotiate — explaining why it picked that price.*

---

## 🌟 Overview

**BargainAI** is a full-stack Next.js web application that empowers local market shoppers and street vendors with transparent, fair pricing and tactical negotiation guidance.

### Key Capabilities:
- **Multimodal Item Assessment**: Photograph an item directly at a stall or upload a photo. Google Gemini Vision identifies the product, classifies its category, and grades condition/freshness.
- **Locality-Aware Fair Price Estimation**: Leverages Supabase PostgreSQL reference price bands across Tier 1 metros (Mumbai, Delhi, Bangalore), Tier 2 cities (Jaipur, Lucknow), and rural mandis with dynamic locality multipliers.
- **Deep Explanatory Reasoning**: Explains *why* that specific price range was selected, tying baseline data, local supply overheads, and item condition together.
- **Actionable Negotiation Playbook**: Generates realistic counter-offers, optimal target prices, hard walk-away limits, concession rules, and authentic spoken negotiation phrases in vernacular idioms (with English translations).
- **Graceful Ambiguity Handling**: Flags unsupported or unclear items with low confidence and helpful clarifying suggestions.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS, Lucide React
- **Database**: Supabase (PostgreSQL with `price_bands` schema and seeds)
- **AI Core**: Google Gemini API (`@google/generative-ai`) — single provider handling both multimodal vision and JSON-structured price reasoning
- **Deployment Ready**: Vercel

---

## 📂 Deliverable Structure

```text
BargainAI/
├── app/
│   ├── api/
│   │   ├── categories/route.ts      # GET: List supported market categories & popular items
│   │   ├── identify-item/route.ts   # POST: Standalone Gemini vision photo assessor
│   │   └── estimate/route.ts        # POST: Orchestrates Vision -> Supabase -> Gemini Pricing
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                     # Main interactive UI
├── components/
│   ├── Header.tsx                   # Top navigation with branding
│   ├── ImageUploader.tsx            # Camera/file input with preview & instant vision hook
│   ├── ItemInputForm.tsx            # Form for photo, description, category, and locality
│   ├── PriceResultCard.tsx          # Price display, baseline breakdown, and "Why this price?"
│   └── NegotiationTipsCard.tsx      # Opening offer, targets, tips, and colloquial phrases
├── lib/
│   ├── gemini.ts                    # Google Gemini API client and call wrappers
│   ├── supabase.ts                  # Supabase client + fallback seeded baseline query
│   ├── types.ts                     # Full TypeScript data contracts
│   └── prompts/
│       ├── vision.ts                # Gemini multimodal vision system prompt & schema
│       └── pricing.ts               # Gemini market negotiator prompt & JSON schema
├── supabase/
│   └── seed.sql                     # Table schema + 15-20 realistic entries per category
├── .env.local.example               # Environment variables template
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- npm or pnpm or yarn
- Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))
- (Optional) Supabase project credentials ([Supabase](https://supabase.com/))

### 2. Installation
```bash
git clone <repo-url>
cd BargainAI
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.local.example .env.local
```

Update `.env.local`:
```env
GEMINI_API_KEY=AIzaSy...your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> **Note on Zero-Config Offline Testing**: If Supabase credentials are not provided initially, BargainAI includes a built-in baseline dataset that mirrors `supabase/seed.sql`. The app queries Supabase automatically when credentials are set, and falls back gracefully to the seeded data without breaking.

### 4. Database Setup (Supabase)
1. Open the SQL Editor in your Supabase Dashboard.
2. Paste and run the contents of [`supabase/seed.sql`](supabase/seed.sql).
3. This creates the `price_bands` table with indexes and inserts realistic baseline rows across:
   - **Fresh Produce** (Tomatoes, Onions, Potatoes, Bananas, Apples, etc.)
   - **Electronics Accessories** (USB-C cables, earphones, wall chargers, tempered glass)
   - **Apparel** (Cotton t-shirts, kurtis, denim jeans, socks, belts)

### 5. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Data Strategy

### 1. MVP Approach (Seeded Reference Price Bands)
For the MVP, we intentionally **do not perform unverified live web scraping**. Local market and street-side prices in bazaars, sabzi mandis, and weekly flea markets differ fundamentally from e-commerce prices (Amazon/Blinkit) because:
- Street vendors do not carry digital listing fees or warehousing overheads.
- Prices vary widely by locality tier:
  - **Tier 1 Metros** (Delhi, Mumbai, Bengaluru): Higher commercial rent and transport costs incur an average **+15% to +30%** markup.
  - **Tier 2 Cities** (Jaipur, Lucknow): Baseline market benchmark.
  - **Rural / Village Mandis**: Direct farm-gate or local distribution yields **-15% to -25%** lower consumer prices.

Our seeded dataset in `supabase/seed.sql` captures these realistic price corridors, units (kg, dozen, piece), and tier multipliers.

### 2. Scaling to Real-World Data Sourcing (Future Roadmap)

To transition BargainAI from a seeded reference model to live real-time local market parity, we propose a three-pillar data architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                 BargainAI Data Sourcing Engine              │
└─────────────────────────────────────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Pillar 1    │       │  Pillar 2    │       │  Pillar 3    │
│  Vendor &    │       │ Crowdsourced │       │ APMC / Mandi │
│  Vyapar Mandal│      │ Community    │       │ Open Data    │
│  Partnership │       │ Reports      │       │ Feeds        │
└──────────────┘       └──────────────┘       └──────────────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ▼
               ┌───────────────────────────────┐
               │ Supabase Edge Functions &     │
               │ Anomaly Detection / Outliers  │
               └───────────────────────────────┘
                               │
                               ▼
               ┌───────────────────────────────┐
               │ Verified Daily Price Corridor │
               └───────────────────────────────┘
```

1. **Vendor Association & Vyapar Mandal Partnerships**:
   - Partner with local vendor unions and market associations (e.g., Delhi Vyapar Mahasangh, Sabzi Mandi Associations).
   - Provide vendors with a lightweight WhatsApp bot or simple UI to log morning wholesale clearing rates in exchange for free weekly demand forecasts.

2. **Incentivized Crowdsourced Price Reporting**:
   - Allow buyers to upload purchase receipts, UPI transaction amounts, or voice-note price confirmations immediately after a purchase.
   - Use reputation scores and micro-rewards (e.g. discount vouchers, community badges) to prevent spam.
   - Run outlier rejection algorithms (interquartile range filtering) on incoming submissions.

3. **Government & APMC Open Data Integration**:
   - Integrate daily agricultural commodity wholesale prices from government open data APIs (such as India's Agmarknet / APMC portal).
   - Apply a dynamic retail transport + spoilage margin to calculate realistic street-level prices.

---

## 🛡️ Non-Functional Capabilities
- **Response Speed**: Under 3 seconds average response for fast bargaining at stalls.
- **Fail-Safe Operation**: If Gemini Vision fails or an image is ambiguous, BargainAI defaults to `confidence: "low"` and prompts the user for clarification rather than giving inaccurate financial advice.
- **Stateless & Private**: No mandatory user accounts or tracking required for MVP demo.
- **Clean Architecture**: System prompts isolated under `/lib/prompts`, types under `/lib/types.ts`, and database decoupled in `/lib/supabase.ts`.

---

## 📜 License
MIT License. Built for the InnovateX Hackathon.
