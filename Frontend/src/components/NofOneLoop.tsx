import { useState } from 'react';
import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { FlaskConical, Plus, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry { medTime: string; energy: number; mood: number }

const MOCK_LOG: LogEntry[] = [
  { medTime: '07:00', energy: 7, mood: 7 },
  { medTime: '07:30', energy: 8, mood: 8 },
  { medTime: '09:00', energy: 5, mood: 6 },
  { medTime: '07:15', energy: 9, mood: 8 },
  { medTime: '08:00', energy: 6, mood: 7 },
  { medTime: '06:45', energy: 8, mood: 9 },
  { medTime: '10:00', energy: 4, mood: 5 },
];

export function NofOneLoop() {
  const { ageGroup } = useChronoStore();
  const [showAdd, setShowAdd] = useState(false);
  const [log] = useState<LogEntry[]>(MOCK_LOG);

  // Only for young adults and adults
  if (ageGroup !== 'young-adult' && ageGroup !== 'adult') return null;

  const isAdult = ageGroup === 'adult';

  // Pearson correlation (mock)
  const correlation = -0.72; // Earlier dosing → better energy

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="41, 121, 255">
      <div className="p-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neon-blue/15 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-neon-blue" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black dark:text-white">N-of-1 Evidence Loop</h3>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
              {isAdult ? 'Side effects vs timing' : 'Your personal data insights'}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAdd(!showAdd)}
          className="w-7 h-7 rounded-lg bg-neon-blue/10 flex items-center justify-center text-neon-blue hover:bg-neon-blue/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <div className="px-5 pb-5 space-y-3">
        {/* Quick add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-xl p-3 space-y-2 overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Med Time</label>
                  <input type="time" defaultValue="07:00" className="w-full glass rounded-lg px-2 py-1.5 text-black dark:text-white font-mono text-xs border border-black/10 dark:border-white/5" />
                </div>
                <div>
                  <label className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Energy</label>
                  <input type="number" min="1" max="10" defaultValue="7" className="w-full glass rounded-lg px-2 py-1.5 text-black dark:text-white font-mono text-xs border border-black/10 dark:border-white/5" />
                </div>
                <div>
                  <label className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Mood</label>
                  <input type="number" min="1" max="10" defaultValue="7" className="w-full glass rounded-lg px-2 py-1.5 text-black dark:text-white font-mono text-xs border border-black/10 dark:border-white/5" />
                </div>
              </div>
              <button className="w-full bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue text-xs font-semibold py-1.5 rounded-lg transition-colors">
                Log Entry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scatter plot (simplified as positioned dots) */}
        <div className="glass rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">Dose Time vs Energy</span>
            <span className={`text-[10px] font-mono font-bold ${correlation < -0.5 ? 'text-neon-green' : 'text-neon-amber'}`}>
              r = {correlation.toFixed(2)}
            </span>
          </div>
          <div className="relative h-20 border-l border-b border-black/20 dark:border-white/10">
            {log.map((entry, i) => {
              const [h] = entry.medTime.split(':').map(Number);
              const x = ((h - 6) / 5) * 100; // normalize 6:00-11:00 to 0-100%
              const y = (1 - entry.energy / 10) * 100;
              return (
                <div
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full bg-neon-blue shadow-[0_0_6px_rgba(41,121,255,0.6)]"
                  style={{ left: `${Math.min(95, Math.max(5, x))}%`, top: `${Math.min(90, Math.max(5, y))}%` }}
                />
              );
            })}
            {/* Axis labels */}
            <span className="absolute -bottom-4 left-0 text-[7px] text-slate-600">06:00</span>
            <span className="absolute -bottom-4 right-0 text-[7px] text-slate-600">11:00</span>
            <span className="absolute -left-3 top-0 text-[7px] text-slate-600 -rotate-90 origin-bottom-left">High</span>
          </div>
        </div>

        {/* Insight */}
        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <TrendingUp className="w-3.5 h-3.5 text-neon-blue flex-shrink-0 mt-0.5" />
          <span>
            Strong negative correlation: earlier medication times correlate with higher {isAdult ? 'fewer side effects' : 'energy levels'}.
            Optimal window: <span className="text-neon-cyan font-mono font-bold">06:45–07:30</span>.
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}
