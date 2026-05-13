'use client';

import { useEffect, useState } from 'react';
import { SimulationParams, roundUpTo100k } from '@/lib/simulation';
import { Country, fetchCountries } from '@/lib/countries';
import { formatBigNumber } from '@/lib/format';

interface InputControlsProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
}

interface SliderCardProps {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  rawValue: number;
  onChange: (value: number) => void;
  id?: string;
}

function SliderCard({ label, value, min, max, step, rawValue, onChange, id }: SliderCardProps) {
  return (
    <div id={id} style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '16px',
      flex: 1,
      border: '1px solid #e0e0e0',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#000000' }}>
          {value}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={rawValue}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #888888 0%, #888888 ' + ((rawValue - min) / (max - min) * 100) + '%, #dddddd ' + ((rawValue - min) / (max - min) * 100) + '%, #dddddd 100%)',
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
        }}
      />
    </div>
  );
}

// Logarithmic slider for masks per worker per day
interface LogSliderCardProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  id?: string;
}

function LogSliderCard({ label, value, onChange, id }: LogSliderCardProps) {
  const minVal = 0.2;
  const maxVal = 5;
  const ratio = maxVal / minVal;

  const valueToPosition = (val: number) => {
    return 100 * Math.log(val / minVal) / Math.log(ratio);
  };

  const positionToValue = (pos: number) => {
    return minVal * Math.pow(ratio, pos / 100);
  };

  const sliderPosition = valueToPosition(value);

  return (
    <div id={id} style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '16px',
      flex: 1,
      border: '1px solid #e0e0e0',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#000000' }}>
          {value.toFixed(1)}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={sliderPosition}
        onChange={(e) => onChange(positionToValue(parseFloat(e.target.value)))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #888888 0%, #888888 ' + sliderPosition + '%, #dddddd ' + sliderPosition + '%, #dddddd 100%)',
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666666', marginTop: '8px' }}>
        <span>0.2</span>
        <span>1</span>
        <span>5</span>
      </div>
    </div>
  );
}

// Logarithmic slider for critical workers (1% left, 20% middle, 100% right)
function CriticalWorkersSlider({ label, value, onChange, id }: LogSliderCardProps) {
  // Piecewise log: 1-20 in first half, 20-100 in second half
  const valueToPosition = (val: number) => {
    if (val <= 20) {
      return 50 * Math.log(val / 1) / Math.log(20);
    } else {
      return 50 + 50 * Math.log(val / 20) / Math.log(5);
    }
  };

  const positionToValue = (pos: number) => {
    if (pos <= 50) {
      return 1 * Math.pow(20, pos / 50);
    } else {
      return 20 * Math.pow(5, (pos - 50) / 50);
    }
  };

  const sliderPosition = valueToPosition(value);

  return (
    <div id={id} style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '16px',
      flex: 1,
      border: '1px solid #e0e0e0',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#000000' }}>
          {Math.round(value)}%
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={sliderPosition}
        onChange={(e) => onChange(positionToValue(parseFloat(e.target.value)))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #888888 0%, #888888 ' + sliderPosition + '%, #dddddd ' + sliderPosition + '%, #dddddd 100%)',
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666666', marginTop: '8px' }}>
        <span>1%</span>
        <span>20%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// Logarithmic slider for Starting Stockpile (1M left, 100M middle, 10B right)
function StockpileSlider({ label, value, onChange, id }: LogSliderCardProps) {
  const minVal = 1_000_000;
  const maxVal = 10_000_000_000;
  const ratio = maxVal / minVal; // 10,000

  const valueToPosition = (val: number) => {
    if (val <= minVal) return 0;
    if (val >= maxVal) return 100;
    return 100 * Math.log(val / minVal) / Math.log(ratio);
  };

  const positionToValue = (pos: number) => {
    if (pos <= 0) return minVal;
    return minVal * Math.pow(ratio, pos / 100);
  };

  const sliderPosition = valueToPosition(value);

  return (
    <div id={id} style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '16px',
      flex: 1,
      border: '1px solid #e0e0e0',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#000000' }}>
          {formatBigNumber(value)}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={sliderPosition}
        onChange={(e) => onChange(positionToValue(parseFloat(e.target.value)))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #888888 0%, #888888 ' + sliderPosition + '%, #dddddd ' + sliderPosition + '%, #dddddd 100%)',
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666666', marginTop: '8px' }}>
        <span>1M</span>
        <span>100M</span>
        <span>10B</span>
      </div>
    </div>
  );
}

// Power-law slider for Current Manufacturing Capacity (0 left, 500k middle, 20M right)
function CurrentMfgSlider({ label, value, onChange, id }: LogSliderCardProps) {
  const maxVal = 20_000_000;
  const midVal = 500_000;
  // k = log(midVal/maxVal) / log(0.5)
  const k = Math.log(midVal / maxVal) / Math.log(0.5); // ≈ 5.32

  const valueToPosition = (val: number) => {
    if (val <= 0) return 0;
    return 100 * Math.pow(val / maxVal, 1 / k);
  };

  const positionToValue = (pos: number) => {
    if (pos <= 0) return 0;
    return maxVal * Math.pow(pos / 100, k);
  };

  const sliderPosition = valueToPosition(value);

  return (
    <div id={id} style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '16px',
      flex: 1,
      border: '1px solid #e0e0e0',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#000000' }}>
          {formatBigNumber(value)}/day
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={sliderPosition}
        onChange={(e) => onChange(positionToValue(parseFloat(e.target.value)))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #888888 0%, #888888 ' + sliderPosition + '%, #dddddd ' + sliderPosition + '%, #dddddd 100%)',
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666666', marginTop: '8px' }}>
        <span>0</span>
        <span>500k</span>
        <span>20M</span>
      </div>
    </div>
  );
}

// Power-law slider for Peak Manufacturing Capacity (0 left, 2M middle, 40M right)
function PeakMfgSlider({ label, value, onChange, id }: LogSliderCardProps) {
  const maxVal = 40_000_000;
  const midVal = 2_000_000;
  // k = log(midVal/maxVal) / log(0.5)
  const k = Math.log(midVal / maxVal) / Math.log(0.5); // ≈ 4.32

  const valueToPosition = (val: number) => {
    if (val <= 0) return 0;
    return 100 * Math.pow(val / maxVal, 1 / k);
  };

  const positionToValue = (pos: number) => {
    if (pos <= 0) return 0;
    return maxVal * Math.pow(pos / 100, k);
  };

  const sliderPosition = valueToPosition(value);

  return (
    <div id={id} style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '16px',
      flex: 1,
      border: '1px solid #e0e0e0',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#000000' }}>
          {formatBigNumber(value)}/day
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={sliderPosition}
        onChange={(e) => onChange(positionToValue(parseFloat(e.target.value)))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #888888 0%, #888888 ' + sliderPosition + '%, #dddddd ' + sliderPosition + '%, #dddddd 100%)',
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666666', marginTop: '8px' }}>
        <span>0</span>
        <span>2M</span>
        <span>40M</span>
      </div>
    </div>
  );
}

// Logarithmic slider for cost per respirator ($0.10 left, $1 middle, $50 right)
function CostSlider({ label, value, onChange, id }: LogSliderCardProps) {
  const minVal = 0.10;
  const maxVal = 50;
  const ratio = maxVal / minVal; // 500

  const valueToPosition = (val: number) => {
    if (val <= minVal) return 0;
    if (val >= maxVal) return 100;
    return 100 * Math.log(val / minVal) / Math.log(ratio);
  };

  const positionToValue = (pos: number) => {
    if (pos <= 0) return minVal;
    return minVal * Math.pow(ratio, pos / 100);
  };

  const sliderPosition = valueToPosition(value);

  return (
    <div id={id} style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '16px',
      flex: 1,
      border: '1px solid #e0e0e0',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#000000' }}>
          ${value.toFixed(2)}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={sliderPosition}
        onChange={(e) => onChange(positionToValue(parseFloat(e.target.value)))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #888888 0%, #888888 ' + sliderPosition + '%, #dddddd ' + sliderPosition + '%, #dddddd 100%)',
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666666', marginTop: '8px' }}>
        <span>$0.10</span>
        <span>$1</span>
        <span>$50</span>
      </div>
    </div>
  );
}

function roundUpTo10M(value: number): number {
  return Math.ceil(value / 10_000_000) * 10_000_000;
}

export default function InputControls({ params, onParamsChange }: InputControlsProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('USA');

  useEffect(() => {
    fetchCountries().then((data) => {
      setCountries(data);
      setLoading(false);
    });
  }, []);

  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    onParamsChange({ ...params, [key]: value });
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const country = countries.find((c) => c.code === countryCode);
    if (country) {
      const roundedStockpile = roundUpTo10M(country.population);
      onParamsChange({
        ...params,
        population: country.population,
        startingStockpile: roundedStockpile,
        currentManufacturingCapacity: roundUpTo100k(country.population * 0.002),
        peakManufacturingCapacity: roundUpTo100k(country.population * 0.015),
      });
    }
  };

  const wastagePercent = Math.round((params.wastageFactor - 1) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Row 1: Country, Critical Workers, Starting Stockpile */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Country selector */}
        <div id="input-country" style={{
          background: '#ffffff',
          borderRadius: '8px',
          padding: '16px',
          flex: 1,
          border: '1px solid #e0e0e0',
        }}>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Country
          </div>
          {loading ? (
            <div style={{ fontSize: '16px', color: '#666666' }}>Loading...</div>
          ) : (
            <select
              value={selectedCountryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#000000',
                background: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({formatBigNumber(country.population)})
                </option>
              ))}
            </select>
          )}
        </div>

        <CriticalWorkersSlider
          id="input-critical-workers"
          label="Critical Workers"
          value={params.criticalWorkerPercent}
          onChange={(v) => updateParam('criticalWorkerPercent', v)}
        />

        <StockpileSlider
          id="input-starting-stockpile"
          label="Starting Stockpile"
          value={params.startingStockpile}
          onChange={(v) => updateParam('startingStockpile', v)}
        />
      </div>

      {/* Row 2: Masks per Worker/Day, Current Mfg, Peak Mfg, Days to Peak */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <LogSliderCard
          id="input-masks-per-day"
          label="N95 Respirators per Worker per Day"
          value={params.masksPerWorkerPerDay}
          onChange={(v) => updateParam('masksPerWorkerPerDay', v)}
        />

        <CurrentMfgSlider
          id="input-current-mfg"
          label="Current Manufacturing Capacity"
          value={params.currentManufacturingCapacity}
          onChange={(v) => updateParam('currentManufacturingCapacity', v)}
        />

        <PeakMfgSlider
          id="input-peak-mfg"
          label="Peak Manufacturing Capacity"
          value={params.peakManufacturingCapacity}
          onChange={(v) => updateParam('peakManufacturingCapacity', v)}
        />

        <SliderCard
          id="input-days-to-peak"
          label="Days to Peak"
          value={`${params.daysToPeakCapacity}`}
          min={30}
          max={365}
          step={1}
          rawValue={params.daysToPeakCapacity}
          onChange={(v) => updateParam('daysToPeakCapacity', v)}
        />
      </div>

      {/* Row 3: Coverage Target, Wastage, Cost — rule-of-thumb inputs */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <SliderCard
          id="input-coverage-days"
          label="Coverage Target"
          value={`${params.coverageTargetDays} days`}
          min={30}
          max={365}
          step={1}
          rawValue={params.coverageTargetDays}
          onChange={(v) => updateParam('coverageTargetDays', v)}
        />

        <SliderCard
          id="input-wastage"
          label="Wastage"
          value={`${wastagePercent}% (${params.wastageFactor.toFixed(2)}×)`}
          min={0}
          max={100}
          step={1}
          rawValue={wastagePercent}
          onChange={(v) => updateParam('wastageFactor', 1 + v / 100)}
        />

        <CostSlider
          id="input-cost-per-respirator"
          label="Cost per Respirator"
          value={params.costPerRespirator}
          onChange={(v) => updateParam('costPerRespirator', v)}
        />

        {/* Spacer to match row 2's 4-column grid */}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
}
