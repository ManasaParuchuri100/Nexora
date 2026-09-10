import React, { useState } from 'react';

interface DayData {
  day: string;
  website: number;
  ads: number;
  referral: number;
  total: number;
  x: number;
}

const DAYS_DATA: DayData[] = [
  { day: 'Mon', website: 4, ads: 5, referral: 3, total: 12, x: 45 },
  { day: 'Tue', website: 4, ads: 6, referral: 4, total: 14, x: 110 },
  { day: 'Wed', website: 3, ads: 5, referral: 3, total: 11, x: 175 },
  { day: 'Thu', website: 6, ads: 13, referral: 4, total: 23, x: 240 },
  { day: 'Fri', website: 4, ads: 8, referral: 3, total: 15, x: 305 },
  { day: 'Sat', website: 5, ads: 9, referral: 4, total: 18, x: 370 },
  { day: 'Sun', website: 4, ads: 11, referral: 5, total: 20, x: 435 },
];

export default function NewCustomersChart() {
  // Default hovered to Thursday to match user's screenshot
  const [activeDayIndex, setActiveDayIndex] = useState<number>(3);

  const activeData = DAYS_DATA[activeDayIndex] || DAYS_DATA[3];

  // Map data to SVG coordinates (viewBox: 0 0 480 230)
  // Baseline Y = 195, Top Y = 25 (range 170 units for value 25)
  const baseY = 195;
  const scale = 7; // 1 unit = 7px

  const getY = (val: number) => Math.max(20, baseY - val * scale);

  // Generate smooth cubic bezier SVG path from points
  const makeSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  // Stack 1: Referral (Bottom)
  const layer1Points = DAYS_DATA.map(d => ({ x: d.x, y: getY(d.referral) }));
  // Stack 2: Ads (Middle: referral + ads)
  const layer2Points = DAYS_DATA.map(d => ({ x: d.x, y: getY(d.referral + d.ads) }));
  // Stack 3: Website (Top: referral + ads + website)
  const layer3Points = DAYS_DATA.map(d => ({ x: d.x, y: getY(d.total) }));

  // Closed paths for filled areas
  const layer1Area = `${makeSmoothPath(layer1Points)} L ${DAYS_DATA[DAYS_DATA.length - 1].x} ${baseY} L ${DAYS_DATA[0].x} ${baseY} Z`;
  
  // Layer 2 closed area between Layer 2 and Layer 1
  const reversedLayer1 = [...layer1Points].reverse();
  const layer2Area = `${makeSmoothPath(layer2Points)} L ${reversedLayer1[0].x} ${reversedLayer1[0].y} ${reversedLayer1.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} Z`;

  // Layer 3 closed area between Layer 3 and Layer 2
  const reversedLayer2 = [...layer2Points].reverse();
  const layer3Area = `${makeSmoothPath(layer3Points)} L ${reversedLayer2[0].x} ${reversedLayer2[0].y} ${reversedLayer2.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} Z`;

  return (
    <div className="border border-[rgba(169,191,165,0.2)] bg-[#071C1A] p-5 flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="serif text-xl sm:text-2xl font-light text-[#E8E9D8] tracking-tight">
          New customers
        </h3>
        <div className="flex items-center space-x-3 text-[10px] font-mono text-[#A9BFA5]/80">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            <span>Website</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#A9BFA5]" />
            <span>Ads</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span>Referral</span>
          </span>
        </div>
      </div>

      {/* Interactive SVG Stacked Area Chart */}
      <div className="relative w-full h-[210px]">
        <svg
          viewBox="0 0 480 220"
          className="w-full h-full overflow-visible select-none"
        >
          <defs>
            {/* Soft gradient for Layer 3 (Website - Sky/Teal) */}
            <linearGradient id="websiteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.65" />
            </linearGradient>

            {/* Soft gradient for Layer 2 (Ads - Sage/Lime) */}
            <linearGradient id="adsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A9BFA5" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.75" />
            </linearGradient>

            {/* Soft gradient for Layer 1 (Referral - Cobalt/Navy) */}
            <linearGradient id="referralGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Y Axis Grid lines & Ticks */}
          {[
            { val: 20, y: getY(20) },
            { val: 10, y: getY(10) },
            { val: 0, y: baseY }
          ].map(tick => (
            <g key={tick.val}>
              <line
                x1="30"
                y1={tick.y}
                x2="465"
                y2={tick.y}
                stroke="rgba(169, 191, 165, 0.12)"
                strokeDasharray={tick.val === 0 ? undefined : '3 3'}
              />
              <text
                x="18"
                y={tick.y + 4}
                fill="#A9BFA5"
                opacity="0.6"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Filled Stacked Areas */}
          {/* Layer 3: Website (Top Area) */}
          <path d={layer3Area} fill="url(#websiteGrad)" />

          {/* Layer 2: Ads (Middle Area) */}
          <path d={layer2Area} fill="url(#adsGrad)" />

          {/* Layer 1: Referral (Bottom Area) */}
          <path d={layer1Area} fill="url(#referralGrad)" />

          {/* Vertical Active Cursor Guideline */}
          <line
            x1={activeData.x}
            y1={20}
            x2={activeData.x}
            y2={baseY}
            stroke="#071C1A"
            strokeWidth="2"
          />
          <circle
            cx={activeData.x}
            cy={getY(activeData.total)}
            r="3.5"
            fill="#E8E9D8"
            stroke="#071C1A"
            strokeWidth="1.5"
          />

          {/* X Axis Labels (Mon - Sun) */}
          {DAYS_DATA.map((d, idx) => (
            <g
              key={d.day}
              className="cursor-pointer"
              onMouseEnter={() => setActiveDayIndex(idx)}
              onClick={() => setActiveDayIndex(idx)}
            >
              {/* Invisible touch/hover target column */}
              <rect
                x={d.x - 25}
                y={20}
                width={50}
                height={baseY - 20}
                fill="transparent"
              />
              <text
                x={d.x}
                y={baseY + 18}
                fill={activeDayIndex === idx ? '#E8E9D8' : '#A9BFA5'}
                opacity={activeDayIndex === idx ? '1' : '0.6'}
                fontSize="11"
                fontWeight={activeDayIndex === idx ? '600' : '400'}
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {d.day}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Tooltip matching image.png exactly */}
        <div
          className="absolute z-20 pointer-events-none transition-all duration-200"
          style={{
            left: `${(activeData.x / 480) * 100}%`,
            top: '25px',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-[#051513] border border-[rgba(169,191,165,0.3)] shadow-xl px-3 py-2 rounded-[2px] text-[11px] font-mono space-y-1 min-w-[100px]">
            <div className="flex items-center space-x-2 text-[#E8E9D8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
              <span className="text-[#A9BFA5]/80">Website -</span>
              <span className="font-semibold text-white">{activeData.website}</span>
            </div>
            <div className="flex items-center space-x-2 text-[#E8E9D8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A9BFA5]" />
              <span className="text-[#A9BFA5]/80">Ads -</span>
              <span className="font-semibold text-white">{activeData.ads}</span>
            </div>
            <div className="flex items-center space-x-2 text-[#E8E9D8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              <span className="text-[#A9BFA5]/80">Referral -</span>
              <span className="font-semibold text-white">{activeData.referral}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
