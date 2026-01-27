# PPE Stockpile Simulator

A Next.js application that models respirator supply and demand during a pandemic to answer: "How long until we run out of masks?"

## Features

- Interactive simulation with real-time updates
- Preset countries (US, UK, Germany, France) or custom population
- Adjustable demand parameters (critical workers, mask usage, reuse factor)
- Adjustable supply parameters (stockpile size, manufacturing capacity)
- Visual chart showing supply vs demand over 365 days
- Key metrics cards displaying shortfall analysis
- Dark mode support
- Fully client-side - no external API calls

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS 4
- Recharts for data visualization

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default US Scenario

The application loads with US defaults that demonstrate a realistic pandemic scenario:

- Population: 340 million
- Critical workers: 15% (~51 million)
- Starting stockpile: 500 million N95 respirators
- Daily demand: 10.2 million (workers wearing 1 mask/day, reusing each 5 times)
- Current manufacturing: 1 million/day
- Peak manufacturing: 5 million/day (reached after 6 months)
- Result: Stockpile depletes around day 50-60, after which severe shortfalls begin

## How It Works

### Simulation Logic

- **Daily Demand** = (Population × Critical Worker %) × Masks per Day / Reuse Factor
- **Daily Supply** = Current Capacity + (Day × (Peak - Current) / Days to Peak)
  - Supply scales linearly from current to peak capacity
  - Capped at peak capacity once reached
- **Stockpile** = Starting Stockpile + Cumulative Supply - Cumulative Demand
- **Shortfall Day** = First day when stockpile reaches zero

### Adjustable Parameters

**Country/Population:**
- Choose preset countries or set custom population

**Demand Parameters:**
- % of critical workers (1-50%)
- Masks needed per worker per day (1-5)
- Mask reuse factor (1-10x)

**Supply Parameters:**
- Starting stockpile size (0-2B masks)
- Current manufacturing capacity (0-20M/day)
- Peak manufacturing capacity (0-50M/day)
- Time to reach peak capacity (30-365 days)

## Build for Production

```bash
npm run build
npm start
```

## License

ISC
