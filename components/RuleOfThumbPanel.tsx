'use client';

import { useState } from 'react';
import { SimulationParams, computeRecommendation } from '@/lib/simulation';
import { formatBigNumber, formatCurrency } from '@/lib/format';

interface RuleOfThumbPanelProps {
  params: SimulationParams;
  onApplyRecommendation: (respirators: number) => void;
}

interface Row {
  op: string;           // '×' or blank for the first row
  label: string;
  value: string;
  hint?: string;
  targetId: string;     // id of the input slider this row refers to
}

function focusInput(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  el.animate(
    [
      { boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)', borderColor: '#e0e0e0' },
      { boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.35)', borderColor: '#8b5cf6' },
      { boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)', borderColor: '#e0e0e0' },
    ],
    { duration: 1200, easing: 'ease-out' }
  );
}

export default function RuleOfThumbPanel({ params, onApplyRecommendation }: RuleOfThumbPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const rec = computeRecommendation(params);
  const reuseDays = params.masksPerWorkerPerDay > 0
    ? (1 / params.masksPerWorkerPerDay).toFixed(1)
    : '∞';

  const rows: Row[] = [
    {
      op: '',
      label: 'Population',
      value: formatBigNumber(params.population),
      targetId: 'input-country',
    },
    {
      op: '×',
      label: 'Critical workers',
      value: `${Math.round(params.criticalWorkerPercent)}%`,
      targetId: 'input-critical-workers',
    },
    {
      op: '×',
      label: 'Coverage target',
      value: `${params.coverageTargetDays} days`,
      targetId: 'input-coverage-days',
    },
    {
      op: '×',
      label: 'Wastage factor',
      value: `${params.wastageFactor.toFixed(2)}×`,
      targetId: 'input-wastage',
    },
    {
      op: '×',
      label: 'Daily usage rate',
      value: `${params.masksPerWorkerPerDay.toFixed(2)}/day`,
      hint: `≈ ${reuseDays}-day reuse`,
      targetId: 'input-masks-per-day',
    },
  ];

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px 24px',
    }}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={expanded}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-block',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 120ms ease',
              fontSize: '12px',
              color: '#666666',
            }}
            aria-hidden
          >
            ▶
          </span>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000000', margin: 0 }}>
            How much should you stockpile?
          </h2>
        </div>
        <div style={{ fontSize: '14px', color: '#666666' }}>
          <span style={{ color: '#000000', fontWeight: 600 }}>
            {formatBigNumber(rec.respirators)}
          </span>{' '}
          respirators · <span style={{ color: '#000000', fontWeight: 600 }}>
            {rec.multiplier.toFixed(1)}×
          </span>{' '}
          population · <span style={{ color: '#000000', fontWeight: 600 }}>
            {formatCurrency(rec.cost)}
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{ marginTop: '16px' }}>
          {/* Multiplication table */}
          <div style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '14px',
            color: '#1a1a1a',
          }}>
            {rows.map((row) => (
              <div
                key={row.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '20px 1fr auto auto',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '6px 0',
                }}
              >
                <span style={{ color: '#888888', fontSize: '14px' }}>{row.op}</span>
                <span style={{ color: '#666666' }}>{row.label}</span>
                <button
                  type="button"
                  onClick={() => focusInput(row.targetId)}
                  style={{
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '2px 10px',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#000000',
                    cursor: 'pointer',
                    minWidth: '90px',
                    textAlign: 'right',
                  }}
                  title="Jump to slider"
                >
                  {row.value}
                </button>
                <span style={{ color: '#999999', fontSize: '12px', minWidth: '110px' }}>
                  {row.hint ?? ''}
                </span>
              </div>
            ))}

            {/* Divider + recommended */}
            <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: '20px 1fr auto auto',
              gap: '12px',
              alignItems: 'center',
              padding: '6px 0',
            }}>
              <span style={{ color: '#888888', fontSize: '14px' }}>=</span>
              <span style={{ color: '#000000', fontWeight: 600 }}>Recommended stockpile</span>
              <span style={{ fontWeight: 700, color: '#000000', minWidth: '90px', textAlign: 'right' }}>
                {formatBigNumber(rec.respirators)}
              </span>
              <span style={{ color: '#666666', fontSize: '12px', minWidth: '110px' }}>
                {rec.multiplier.toFixed(1)}× population
              </span>
            </div>

            {/* Cost rows */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '20px 1fr auto auto',
              gap: '12px',
              alignItems: 'center',
              padding: '6px 0',
            }}>
              <span style={{ color: '#888888', fontSize: '14px' }}>×</span>
              <span style={{ color: '#666666' }}>Cost per respirator</span>
              <button
                type="button"
                onClick={() => focusInput('input-cost-per-respirator')}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '2px 10px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000000',
                  cursor: 'pointer',
                  minWidth: '90px',
                  textAlign: 'right',
                }}
              >
                {formatCurrency(params.costPerRespirator)}
              </button>
              <span style={{ minWidth: '110px' }} />
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: '20px 1fr auto auto',
              gap: '12px',
              alignItems: 'center',
              padding: '6px 0',
            }}>
              <span style={{ color: '#888888', fontSize: '14px' }}>=</span>
              <span style={{ color: '#000000', fontWeight: 600 }}>Total stockpile cost</span>
              <span style={{ fontWeight: 700, color: '#000000', minWidth: '90px', textAlign: 'right' }}>
                {formatCurrency(rec.cost)}
              </span>
              <span style={{ minWidth: '110px' }} />
            </div>
          </div>

          {/* Apply button */}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => onApplyRecommendation(rec.respirators)}
              style={{
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Set stockpile to recommended →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
