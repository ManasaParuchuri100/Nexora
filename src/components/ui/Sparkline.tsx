import React from 'react';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  tone?: 'brand' | 'ok' | 'warn' | 'danger';
}

export function Sparkline({
  data,
  width = 64,
  height = 20,
  className = '',
  tone = 'brand',
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * innerW;
      const y = height - (padding + ((val - min) / range) * innerH);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColorClass =
    tone === 'ok'
      ? 'stroke-ok'
      : tone === 'warn'
      ? 'stroke-warn'
      : tone === 'danger'
      ? 'stroke-danger'
      : 'stroke-brand';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeColorClass}
        points={points}
      />
    </svg>
  );
}
