import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { SpotlightCard } from './ui/SpotlightCard';

interface TimeWindow {
  start: number; // 0-24
  end: number;   // 0-24
}

interface EnzymeData {
  name: string;
  type: string;
  activeWindow: TimeWindow; // The biological peak window
  color: string;
  description: string;
}

// Map common drug categories to hypothetical/known metabolic enzymes & their active windows
const ENZYME_MAP: Record<string, EnzymeData> = {
  'Statin': {
    name: 'HMG-CoA Reductase',
    type: 'Synthesis Enzyme',
    activeWindow: { start: 22, end: 24 }, // Midnight peak (2 hrs)
    color: 'emerald',
    description: 'Cholesterol synthesis peaks precisely during nocturnal fasting.'
  },
  'Antihypertensive': {
    name: 'RAAS Pathway',
    type: 'Hormonal System',
    activeWindow: { start: 6, end: 8 }, // Morning surge (2 hrs)
    color: 'rose',
    description: 'Blood pressure and RAAS activation spike right before waking.'
  },
  'ADHD': {
    name: 'CYP2D6 / Dopamine Transporter',
    type: 'Metabolic & Reuptake',
    activeWindow: { start: 8, end: 10 }, // Morning cognitive peak (2 hrs)
    color: 'amber',
    description: 'Dopaminergic activity aligns closely with initial daytime cognitive demands.'
  },
  'Thyroid': {
    name: 'Deiodinases (D1/D2)',
    type: 'Conversion Enzyme',
    activeWindow: { start: 23, end: 1 }, // Deep sleep conversion (2 hrs)
    color: 'indigo',
    description: 'T4 to T3 conversion optimizes strongly during restorative sleep.'
  },
  'SSRI': {
    name: 'Serotonin Transporter (SERT)',
    type: 'Reuptake Protein',
    activeWindow: { start: 7, end: 9 }, // Morning rise (2 hrs)
    color: 'blue',
    description: 'Serotonergic tone naturally surges during the initial wakefulness period.'
  },
  'Default': {
    name: 'Hepatic CYP450 System',
    type: 'General Metabolism',
    activeWindow: { start: 9, end: 11 }, // Morning metabolism (2 hrs)
    color: 'teal',
    description: 'Peak liver filtration and initial metabolic clearance occurs post-breakfast.'
  }
};

interface EnzymeTimelineProps {
  category: string;
  timeString: string | null; // e.g., "22:00"
}

export function EnzymeTimeline({ category, timeString }: EnzymeTimelineProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const enzyme = ENZYME_MAP[category] || ENZYME_MAP['Default'];
  
  // Parse input time (e.g. "22:30" -> 22.5)
  let prescribedHour = null;
  if (timeString) {
    const [h, m] = timeString.split(':').map(Number);
    prescribedHour = h + (m / 60);
  }

  // Check if a specific hour is within the active window (handles midnight crossing)
  const isWithinWindow = (hour: number, window: TimeWindow) => {
    if (window.start < window.end) {
      return hour >= window.start && hour < window.end;
    } else {
      // Crosses midnight (e.g., 20 to 4)
      return hour >= window.start || hour < window.end;
    }
  };

  // Check if prescribed time is aligned with enzyme activity
  const isAligned = prescribedHour !== null && isWithinWindow(prescribedHour, enzyme.activeWindow);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald': return 'from-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.6)] text-emerald-500 border-emerald-400';
      case 'rose': return 'from-rose-400 to-rose-500 shadow-[0_0_15px_rgba(251,113,133,0.6)] text-rose-500 border-rose-400';
      case 'amber': return 'from-amber-400 to-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.6)] text-amber-500 border-amber-400';
      case 'indigo': return 'from-indigo-400 to-indigo-500 shadow-[0_0_15px_rgba(129,140,248,0.6)] text-indigo-500 border-indigo-400';
      case 'blue': return 'from-blue-400 to-blue-500 shadow-[0_0_15px_rgba(96,165,250,0.6)] text-blue-500 border-blue-400';
      default: return 'from-teal-400 to-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.6)] text-teal-500 border-teal-400';
    }
  };

  const p = getColorClasses(enzyme.color).split(' ');
  const bgClasses = `${p[0]} ${p[1]}`;
  const shadowClasses = p[2];
  const textClasses = p[3];
  const borderClasses = p[4];

  if (!mounted) return null;

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="14, 165, 233">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className={`w-4 h-4 ${textClasses}`} />
              Clinical Support: Enzyme Alignment
            </h3>
            <p className="text-xs text-slate-500 mt-1">Cross-verifying timing against biological enzyme states.</p>
          </div>
          {prescribedHour !== null && (
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
              isAligned 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30'
            }`}>
              {isAligned ? 'Optimal Alignment' : 'Suboptimal Timing'}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Enzyme Details */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Pathway</div>
            <div className={`text-lg font-black ${textClasses}`}>{enzyme.name}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">{enzyme.type}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700/50 max-w-xs">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "{enzyme.description}"
            </p>
          </div>
        </div>

        {/* 24-Hour Timeline */}
        <div className="relative pt-6 pb-2">
          
          {/* Timeline Bar Background */}
          <div className="absolute top-10 left-0 right-0 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/80 shadow-inner">
            {/* Active Window Overlay */}
            <motion.div 
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              key={enzyme.name}
              className={`absolute top-0 bottom-0 bg-gradient-to-r ${bgClasses} ${shadowClasses} opacity-90 border-x ${borderClasses}`}
              style={{
                left: enzyme.activeWindow.start < enzyme.activeWindow.end 
                  ? `${(enzyme.activeWindow.start / 24) * 100}%`
                  : '0%', // If it crosses midnight, start at 0
                width: enzyme.activeWindow.start < enzyme.activeWindow.end
                  ? `${((enzyme.activeWindow.end - enzyme.activeWindow.start) / 24) * 100}%`
                  : `${(enzyme.activeWindow.end / 24) * 100}%`, // Width from midnight to end
                transformOrigin: 'left'
              }}
            >
              {/* Highlight Line inside window */}
              <div className="absolute inset-0 bg-white/20 blur-[1px] rounded-full scale-y-50" />
            </motion.div>

            {enzyme.activeWindow.start > enzyme.activeWindow.end && (
               // Second half of midnight-crossing window (start to midnight)
               <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                key={enzyme.name + '-cross'}
                className={`absolute top-0 bottom-0 bg-gradient-to-r ${bgClasses} ${shadowClasses} opacity-90 border-x ${borderClasses}`}
                style={{
                  left: `${(enzyme.activeWindow.start / 24) * 100}%`,
                  width: `${((24 - enzyme.activeWindow.start) / 24) * 100}%`,
                  transformOrigin: 'left'
                }}
              >
                 <div className="absolute inset-0 bg-white/20 blur-[1px] rounded-full scale-y-50" />
              </motion.div>
            )}
          </div>

          {/* Prescribed Time Marker */}
          {prescribedHour !== null && (
            <motion.div 
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              key={`marker-${prescribedHour}`}
              className="absolute z-10 flex flex-col items-center"
              style={{ left: `${(prescribedHour / 24) * 100}%`, top: '4px', transform: 'translateX(-50%)' }}
            >
              <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shadow-lg mb-1 whitespace-nowrap">
                {timeString}
              </div>
              <div className={`w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 ${isAligned ? 'border-emerald-500' : 'border-rose-500'} shadow-lg`} />
              <div className="w-px h-6 bg-slate-400 dark:bg-slate-500" />
            </motion.div>
          )}

          {/* Hour Labels */}
          <div className="relative mt-12 flex justify-between px-1">
            {[0, 6, 12, 18, 24].map((h) => (
              <div key={h} className="flex flex-col items-center" style={{ position: 'absolute', left: `${(h/24)*100}%`, transform: 'translateX(-50%)' }}>
                <div className="w-px h-2 bg-slate-300 dark:bg-slate-600 mb-1" />
                <span className="text-[9px] font-mono text-slate-400 font-semibold">
                  {h === 0 || h === 24 ? '12A' : h === 12 ? '12P' : h > 12 ? `${h-12}P` : `${h}A`}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded bg-gradient-to-r ${bgClasses} ${shadowClasses} shadow-sm opacity-80`} />
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Enzyme Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700 shadow-sm" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Dormant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-slate-400" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Prescribed Dose</span>
          </div>
        </div>

      </div>
    </SpotlightCard>
  );
}
