import { useMemo } from 'react';
import type { PatientPrescription } from '../types';

interface BodyClockProps {
  prescriptions: PatientPrescription[];
  sunriseTime?: string;
  sunsetTime?: string;
}

const COLORS = [
  { fill: '#0d9488', stroke: '#14b8a6', bg: '#ccfbf1' },
  { fill: '#3b82f6', stroke: '#60a5fa', bg: '#dbeafe' },
  { fill: '#f59e0b', stroke: '#fbbf24', bg: '#fef3c7' },
  { fill: '#ef4444', stroke: '#f87171', bg: '#fee2e2' },
  { fill: '#8b5cf6', stroke: '#a78bfa', bg: '#ede9fe' },
  { fill: '#ec4899', stroke: '#f472b6', bg: '#fce7f3' },
];

export function BodyClock({ prescriptions, sunriseTime, sunsetTime }: BodyClockProps) {
  const center = 150;
  const radius = 120;
  const innerR = 85;

  const timeToAngle = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const hours = h + (m || 0) / 60;
    return ((hours / 24) * 360 - 90); // 0:00 at top
  };

  const sunArcs = useMemo(() => {
    if (!sunriseTime || !sunsetTime) return null;
    const sunriseAngle = timeToAngle(sunriseTime);
    const sunsetAngle = timeToAngle(sunsetTime);
    return { sunriseAngle, sunsetAngle };
  }, [sunriseTime, sunsetTime]);

  const describeArc = (startAngle: number, endAngle: number, r: number, rInner: number) => {
    const start = polarToCartesian(center, center, r, endAngle);
    const end = polarToCartesian(center, center, r, startAngle);
    const startInner = polarToCartesian(center, center, rInner, startAngle);
    const endInner = polarToCartesian(center, center, rInner, endAngle);

    let sweep = endAngle - startAngle;
    if (sweep < 0) sweep += 360;
    const largeArc = sweep > 180 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} L ${startInner.x} ${startInner.y} A ${rInner} ${rInner} 0 ${largeArc} 1 ${endInner.x} ${endInner.y} Z`;
  };

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const approvedRx = prescriptions.filter(p => p.approved && p.approvedTime);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 300" className="w-full max-w-[280px]">
        {/* Background circle */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-700" />
        <circle cx={center} cy={center} r={innerR} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-700" />

        {/* Sun/Moon shading */}
        {sunArcs && (
          <>
            <path
              d={describeArc(sunArcs.sunriseAngle, sunArcs.sunsetAngle, radius, innerR)}
              fill="rgba(251, 191, 36, 0.08)"
              stroke="none"
            />
            <path
              d={describeArc(sunArcs.sunsetAngle, sunArcs.sunriseAngle, radius, innerR)}
              fill="rgba(99, 102, 241, 0.06)"
              stroke="none"
            />
          </>
        )}

        {/* Hour ticks */}
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i / 24) * 360 - 90;
          const p1 = polarToCartesian(center, center, radius, angle);
          const p2 = polarToCartesian(center, center, radius - (i % 6 === 0 ? 10 : 5), angle);
          const labelP = polarToCartesian(center, center, radius + 14, angle);
          return (
            <g key={i}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="currentColor" strokeWidth={i % 6 === 0 ? 2 : 1}
                className={i % 6 === 0 ? "text-slate-400 dark:text-slate-500" : "text-slate-300 dark:text-slate-600"}
              />
              {i % 6 === 0 && (
                <text x={labelP.x} y={labelP.y} textAnchor="middle" dominantBaseline="middle"
                  className="fill-slate-500 dark:fill-slate-400" fontSize="10" fontWeight="600" fontFamily="Inter"
                >
                  {`${String(i).padStart(2, '0')}`}
                </text>
              )}
            </g>
          );
        })}

        {/* Medication markers */}
        {approvedRx.map((rx, i) => {
          const angle = timeToAngle(rx.approvedTime!);
          const color = COLORS[i % COLORS.length];
          const markerR = (radius + innerR) / 2;
          const pos = polarToCartesian(center, center, markerR, angle);
          return (
            <g key={rx.id}>
              <circle cx={pos.x} cy={pos.y} r={10} fill={color.fill} opacity={0.85} />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize="9" fontWeight="700" fontFamily="Inter"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Center text */}
        <text x={center} y={center - 6} textAnchor="middle"
          className="fill-slate-900 dark:fill-white" fontSize="13" fontWeight="800" fontFamily="Inter"
        >
          24h
        </text>
        <text x={center} y={center + 10} textAnchor="middle"
          className="fill-slate-400" fontSize="9" fontFamily="Inter"
        >
          Body Clock
        </text>
      </svg>

      {/* Legend */}
      {approvedRx.length > 0 && (
        <div className="mt-4 space-y-1.5 w-full">
          {approvedRx.map((rx, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <div key={rx.id} className="flex items-center gap-2.5 text-xs">
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ background: color.fill }}
                >
                  {i + 1}
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200 flex-1 truncate">{rx.medication.name}</span>
                <span className="font-mono font-semibold text-slate-500 flex-shrink-0">{rx.approvedTime}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
