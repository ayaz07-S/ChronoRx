import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useChronoStore } from '../store/useChronoStore';
import { generateProcessCurves, simulateDrugPK } from '../engine/twoProcessModel';
import { AGE_CONTENT } from '../lib/api';
import { SpotlightCard } from './ui/SpotlightCard';
import { Beaker, TrendingUp, Gauge, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function Simulator() {
  const { wakeTime, sleepTime, ageGroup, chronotype, theme } = useChronoStore();
  const [doseTimeIndex, setDoseTimeIndex] = useState(8);
  const content = AGE_CONTENT[ageGroup ?? 'young-adult'];

  const isDark = theme === 'dark';

  const { time, processS, processC, melatonin } = useMemo(
    () => generateProcessCurves(wakeTime, sleepTime, chronotype ?? 'Bear'),
    [wakeTime, sleepTime, chronotype]
  );

  const drugPK = useMemo(() => {
    return time.map((_, i) => simulateDrugPK(doseTimeIndex, i, 4));
  }, [time, doseTimeIndex]);

  const score = useMemo(() => {
    let totalScore = 0;
    for (let i = 0; i < 24; i++) {
      totalScore += (drugPK[i] / 100) * (processC[i] / 100);
    }
    return Math.min(100, Math.max(0, Math.round(totalScore * 5)));
  }, [drugPK, processC]);

  const scoreColor = score > 75 ? 'text-emerald-600 dark:text-emerald-400' : score > 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
  const scoreBg = score > 75 ? 'bg-emerald-50 dark:bg-emerald-500/10' : score > 50 ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-rose-50 dark:bg-rose-500/10';

  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const tickColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';
  const legendColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

  const data = {
    labels: time,
    datasets: [
      {
        label: 'Alertness',
        data: processC,
        borderColor: '#0d9488',
        backgroundColor: isDark ? 'rgba(13, 148, 136, 0.08)' : 'rgba(13, 148, 136, 0.06)',
        tension: 0.45, fill: true, pointRadius: 0, borderWidth: 2,
      },
      {
        label: 'Sleep Pressure',
        data: processS,
        borderColor: isDark ? '#818cf8' : '#6366f1',
        tension: 0.45, pointRadius: 0, borderDash: [6, 4], borderWidth: 1.5,
      },
      {
        label: 'Melatonin',
        data: melatonin,
        borderColor: '#8b5cf6',
        backgroundColor: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)',
        tension: 0.45, fill: true, pointRadius: 0, borderWidth: 2,
      },
      {
        label: 'Drug Level',
        data: drugPK,
        borderColor: '#f59e0b',
        backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)',
        tension: 0.45, fill: true, pointRadius: 0,
        pointHoverRadius: 6, pointHoverBackgroundColor: '#f59e0b',
        borderWidth: 2.5,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    color: legendColor,
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
      x: {
        grid: { color: gridColor, lineWidth: 1 },
        ticks: { color: tickColor, font: { family: 'JetBrains Mono', size: 10 } }
      },
      y: { display: false, min: 0, max: 120 }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: legendColor, usePointStyle: true, pointStyle: 'circle',
          boxWidth: 6, padding: 16, font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#14b8a6' : '#0d9488',
        bodyColor: isDark ? '#e2e8f0' : '#334155',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        borderWidth: 1,
        cornerRadius: 10, padding: 12,
        titleFont: { family: 'JetBrains Mono', weight: 'bold' as const },
        bodyFont: { family: 'Inter' }
      }
    }
  };

  return (
    <SpotlightCard className="p-0 overflow-hidden flex flex-col" glowColor="245, 158, 11">
      <div className="p-5 pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Beaker className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{content.simTitle}</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{content.simDesc}</p>
          </div>
        </div>

        <motion.div
          key={score}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${scoreBg} px-4 py-2 rounded-xl flex items-center gap-3`}
        >
          <Gauge className={`w-4 h-4 ${scoreColor}`} />
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Effectiveness</div>
            <div className={`text-2xl font-bold ${scoreColor} tracking-tighter leading-none`}>{score}<span className="text-sm opacity-50">/100</span></div>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 min-h-0 w-full px-4 py-3" style={{ height: '300px' }}>
        <Line data={data} options={options} />
      </div>

      <div className="p-5 pt-2 border-t border-slate-200 dark:border-slate-700/30">
        <div className="flex justify-between items-center text-xs mb-3">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> {ageGroup === 'teen' ? 'Screen Curfew Time' : 'Dose Timing'}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">{time[doseTimeIndex]}</span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
        <input
          type="range" min="0" max="23" value={doseTimeIndex}
          onChange={(e) => setDoseTimeIndex(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
        </div>
      </div>
    </SpotlightCard>
  );
}
