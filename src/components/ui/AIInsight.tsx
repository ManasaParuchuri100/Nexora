import React from 'react';

export interface AIInsightProps {
  /** What the data shows. */
  observation: React.ReactNode;
  /** What Nexora suggests doing about it. */
  recommendation?: React.ReactNode;
  /** Where the observation comes from, for example "42 conversations this week". */
  evidence?: React.ReactNode;
  /** How recent the data is, for example "Updated 10 min ago". */
  freshness?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
}

/** An AI note that keeps the observation, the recommendation and the evidence apart. */
export function AIInsight({ observation, recommendation, evidence, freshness, action, className = '' }: AIInsightProps) {
  return (
    <aside className={`nx-insight ${className}`} aria-label="AI insight">
      <span className="eyebrow">AI insight</span>
      <div className="mt-1.5">
        <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.8px]">Observation</div>
        <p className="text-[12px]! text-ink! leading-[1.6] mt-0.5!">{observation}</p>
      </div>
      {recommendation && (
        <div className="mt-2.5">
          <div className="text-[11px] font-bold text-brand uppercase tracking-[0.8px]">Recommendation</div>
          <p className="text-[12px]! text-ink-2! leading-[1.6] mt-0.5!">{recommendation}</p>
        </div>
      )}
      {(evidence || freshness) && (
        <p className="text-[11px]! text-ink-3! mt-2.5!">
          {evidence}
          {evidence && freshness ? ' · ' : ''}
          {freshness}
        </p>
      )}
      {action && (
        <button type="button" className="nx-inline-link mt-2.5" onClick={action.onClick}>
          {action.label} →
        </button>
      )}
    </aside>
  );
}
