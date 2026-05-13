'use client';

import { SimulationResults } from '@/lib/simulation';
import { formatBigNumber, formatPerDay } from '@/lib/format';

interface MetricsCardsProps {
  results: SimulationResults;
}

const cardStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '200px',
  background: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '16px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: '#666666',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const valueStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#000000',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#666666',
  marginTop: '8px',
};

export default function MetricsCards({ results }: MetricsCardsProps) {
  const { shortfallDay, totalShortfall, peakDailyDemand, peakDailyManufacturing } = results;
  // The steady-state gap once manufacturing has fully ramped up — the comparison
  // that makes the demand-vs-production distinction obvious.
  const peakGap = Math.max(0, peakDailyDemand - peakDailyManufacturing);
  const hasShortfall = peakGap > 0;

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <div style={cardStyle}>
        <h3 style={labelStyle}>Peak Daily Demand</h3>
        <p style={valueStyle}>{formatPerDay(peakDailyDemand)}</p>
        <p style={subtitleStyle}>
          What critical workers need each day (after wastage)
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={labelStyle}>Peak Daily Manufacturing</h3>
        <p style={valueStyle}>{formatPerDay(peakDailyManufacturing)}</p>
        <p style={subtitleStyle}>
          Maximum that can be produced per day
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={labelStyle}>Daily Gap at Peak Production</h3>
        <p style={{ ...valueStyle, color: hasShortfall ? '#dc2626' : '#000000' }}>
          {hasShortfall ? formatPerDay(peakGap) : 'None'}
        </p>
        <p style={subtitleStyle}>
          {hasShortfall
            ? 'Daily shortfall even after manufacturing ramps up'
            : 'Production meets demand once ramped up'}
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={labelStyle}>Stockpile Depleted</h3>
        <p style={valueStyle}>
          {shortfallDay !== null ? `Day ${shortfallDay}` : 'Never'}
        </p>
        <p style={subtitleStyle}>
          {shortfallDay !== null
            ? `Stockpile runs out on day ${shortfallDay}`
            : 'Stockpile lasts the entire year'}
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={labelStyle}>Total Shortfall (1 Year)</h3>
        <p style={valueStyle}>{formatBigNumber(totalShortfall)}</p>
        <p style={subtitleStyle}>
          Cumulative unmet demand over 365 days
        </p>
      </div>
    </div>
  );
}
