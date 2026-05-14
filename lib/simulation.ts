export interface SimulationParams {
  population: number;
  criticalWorkerPercent: number;
  startingStockpile: number;
  masksPerWorkerPerDay: number;
  currentManufacturingCapacity: number;
  peakManufacturingCapacity: number;
  daysToPeakCapacity: number;
  // Rule-of-thumb inputs (wastageFactor also scales actual daily demand)
  coverageTargetDays: number;
  wastageFactor: number; // e.g. 1.30 = 30% wastage
  costPerRespirator: number;
}

export interface DayData {
  day: number;
  dailyDemand: number;
  dailySupply: number;
  cumulativeDemand: number;
  cumulativeSupply: number;
  stockpile: number;
  protectionRate: number; // Percentage of critical workers protected (0-100)
}

export interface SimulationResults {
  dailyData: DayData[];
  shortfallDay: number | null;
  peakDailyDemand: number;          // constant in this model — what critical workers need each day
  peakDailyManufacturing: number;   // = peakManufacturingCapacity, surfaced for the gap comparison
  peakDailyShortfall: number;       // max(0, demand - peak supply) at peak
  totalShortfall: number;
  minProtectionRate: number;
}

export function runSimulation(params: SimulationParams): SimulationResults {
  const {
    population,
    criticalWorkerPercent,
    startingStockpile,
    masksPerWorkerPerDay,
    currentManufacturingCapacity,
    peakManufacturingCapacity,
    daysToPeakCapacity,
    wastageFactor,
  } = params;

  // Calculate daily demand: (population × critical_worker_%) × masks per day × wastage
  const criticalWorkers = population * (criticalWorkerPercent / 100);
  const dailyDemand = criticalWorkers * masksPerWorkerPerDay * wastageFactor;

  const dailyData: DayData[] = [];
  let cumulativeDemand = 0;
  let cumulativeSupply = 0;
  let shortfallDay: number | null = null;
  let peakDailyShortfall = 0;
  let minProtectionRate = 100;

  // Run simulation for 365 days
  for (let day = 0; day <= 365; day++) {
    // Calculate daily supply with linear ramp-up to peak capacity
    let dailySupply: number;
    if (day < daysToPeakCapacity) {
      // Linear interpolation from current to peak
      dailySupply =
        currentManufacturingCapacity +
        (day * (peakManufacturingCapacity - currentManufacturingCapacity)) / daysToPeakCapacity;
    } else {
      // At peak capacity
      dailySupply = peakManufacturingCapacity;
    }

    cumulativeDemand += dailyDemand;
    cumulativeSupply += dailySupply;

    // Calculate remaining stockpile
    const stockpile = startingStockpile + cumulativeSupply - cumulativeDemand;

    // Track when stockpile is depleted (goes negative or zero)
    if (shortfallDay === null && stockpile <= 0) {
      shortfallDay = day;
    }

    // Calculate daily shortfall (when demand exceeds supply)
    const dailyShortfall = Math.max(0, dailyDemand - dailySupply);
    peakDailyShortfall = Math.max(peakDailyShortfall, dailyShortfall);

    // Calculate protection rate
    // If stockpile is available, we can meet demand = 100% protected
    // Once stockpile is depleted, protection rate = (supply / demand) * 100
    let protectionRate: number;
    if (stockpile > 0) {
      protectionRate = 100;
    } else {
      protectionRate = dailyDemand > 0 ? Math.min(100, (dailySupply / dailyDemand) * 100) : 100;
    }
    minProtectionRate = Math.min(minProtectionRate, protectionRate);

    dailyData.push({
      day,
      dailyDemand,
      dailySupply,
      cumulativeDemand,
      cumulativeSupply,
      stockpile,
      protectionRate,
    });
  }

  // Calculate total shortfall over the year
  const totalShortfall = Math.max(0, cumulativeDemand - (startingStockpile + cumulativeSupply));

  return {
    dailyData,
    shortfallDay,
    peakDailyDemand: dailyDemand,
    peakDailyManufacturing: peakManufacturingCapacity,
    peakDailyShortfall,
    totalShortfall,
    minProtectionRate,
  };
}


// Helper to round up to nearest 100k
export function roundUpTo100k(value: number): number {
  return Math.ceil(value / 100_000) * 100_000;
}

// Default parameters for US scenario
export const DEFAULT_PARAMS: SimulationParams = {
  population: 340_000_000,
  criticalWorkerPercent: 10,
  startingStockpile: 340_000_000, // Matches US population
  masksPerWorkerPerDay: 1,
  currentManufacturingCapacity: roundUpTo100k(340_000_000 * 0.002), // 0.2% of population
  peakManufacturingCapacity: roundUpTo100k(340_000_000 * 0.015), // 1.5% of population
  daysToPeakCapacity: 180,
  coverageTargetDays: 180,
  wastageFactor: 1.3, // 30% wastage
  costPerRespirator: 1, // $1 per N95
};

// Shared rule-of-thumb derivation. Used by RuleOfThumbPanel and any "apply" handler.
export interface Recommendation {
  respirators: number;       // recommended stockpile size in masks
  cost: number;              // total dollar cost = respirators × cost/each
  multiplier: number;        // ratio to population (e.g. 7.0)
}

export function computeRecommendation(params: SimulationParams): Recommendation {
  const {
    population,
    criticalWorkerPercent,
    coverageTargetDays,
    wastageFactor,
    masksPerWorkerPerDay,
    costPerRespirator,
  } = params;
  const respirators =
    population *
    (criticalWorkerPercent / 100) *
    coverageTargetDays *
    wastageFactor *
    masksPerWorkerPerDay;
  return {
    respirators,
    cost: respirators * costPerRespirator,
    multiplier: population > 0 ? respirators / population : 0,
  };
}
