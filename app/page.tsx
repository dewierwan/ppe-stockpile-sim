'use client';

import { useState, useMemo } from 'react';
import InputControls from '@/components/InputControls';
import RuleOfThumbPanel from '@/components/RuleOfThumbPanel';
import SupplyDemandChart from '@/components/SupplyDemandChart';
import StockpileChart from '@/components/StockpileChart';
import ProtectionChart from '@/components/ProtectionChart';
import MetricsCards from '@/components/MetricsCards';
import { SimulationParams, DEFAULT_PARAMS, runSimulation } from '@/lib/simulation';

export default function Home() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const results = useMemo(() => runSimulation(params), [params]);

  return (
    <main style={{
      minHeight: '100vh',
      background: '#ffffff',
      padding: '32px',
      color: '#000000',
    }}>
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '8px',
          }}>
            N95 Respirator Stockpile Simulation
          </h1>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <InputControls params={params} onParamsChange={setParams} />

          <RuleOfThumbPanel
            params={params}
            onApplyRecommendation={(n) => setParams({ ...params, startingStockpile: n })}
          />

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}><SupplyDemandChart results={results} /></div>
            <div style={{ flex: 1 }}><StockpileChart results={results} /></div>
            <div style={{ flex: 1 }}><ProtectionChart results={results} /></div>
          </div>

          <MetricsCards results={results} />
        </div>
      </div>
    </main>
  );
}
