'use client';

import { SimulationResults } from '@/lib/simulation';
import { formatBigNumber } from '@/lib/format';

interface MetricsCardsProps {
  results: SimulationResults;
}

export default function MetricsCards({ results }: MetricsCardsProps) {
  const { shortfallDay, totalShortfall } = results;

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '200px', background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '500', color: '#666666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stockpile Depleted</h3>
        <p style={{ fontSize: '28px', fontWeight: '700', color: '#000000' }}>
          {shortfallDay !== null ? `Day ${shortfallDay}` : 'Never'}
        </p>
        <p style={{ fontSize: '12px', color: '#666666', marginTop: '8px' }}>
          {shortfallDay !== null
            ? `Stockpile runs out on day ${shortfallDay}`
            : 'Stockpile lasts the entire year'}
        </p>
      </div>

      <div style={{ flex: 1, minWidth: '200px', background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '500', color: '#666666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Shortfall (1 Year)</h3>
        <p style={{ fontSize: '28px', fontWeight: '700', color: '#000000' }}>{formatBigNumber(totalShortfall)}</p>
        <p style={{ fontSize: '12px', color: '#666666', marginTop: '8px' }}>
          Cumulative unmet demand over 365 days
        </p>
      </div>
    </div>
  );
}
