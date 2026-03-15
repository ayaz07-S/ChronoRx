import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';

import { Monitor, Moon, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export function ScreenCurfew() {
  const { wakeTime, sleepTime, ageGroup } = useChronoStore();

  // Calculate screen curfew: 2 hours before melatonin onset (which is ~2h before sleep)
  const curfewData = useMemo(() => {
    const [sleepH, sleepM] = sleepTime.split(':').map(Number);
    // Melatonin onset ≈ 2h before sleep, screen curfew ≈ 2h before that = 4h before sleep
    // But more realistically: screen curfew = 2h before sleep for melatonin protection
    let curfewH = sleepH - 2;
    if (curfewH < 0) curfewH += 24;
    const curfewTime = `${String(curfewH).padStart(2, '0')}:${String(sleepM).padStart(2, '0')}`;

    // Melatonin onset ≈ 1h before sleep
    let melH = sleepH - 1;
    if (melH < 0) melH += 24;
    const melatoninOnset = `${String(melH).padStart(2, '0')}:${String(sleepM).padStart(2, '0')}`;

    // Calculate hours until curfew from now
    const now = new Date();
    const curfewDate = new Date();
    curfewDate.setHours(curfewH, sleepM, 0);
    if (curfewDate < now) curfewDate.setDate(curfewDate.getDate() + 1);
    const hoursUntil = Math.max(0, (curfewDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    return { curfewTime, melatoninOnset, hoursUntil, wakeTime };
  }, [sleepTime, wakeTime]);

  // Only show for teens and young adults
  if (ageGroup !== 'teen' && ageGroup !== 'young-adult') return null;

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="124, 77, 255">
      <div className="p-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neon-purple/15 flex items-center justify-center">
          <Monitor className="w-4 h-4 text-neon-purple" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-black dark:text-white">Screen Curfew Calculator</h3>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
            {ageGroup === 'teen' ? 'Melatonin suppression protection' : 'Blue light management'}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4">
        {/* Main curfew time display */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-xl p-5 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-neon-blue/5" />
          <div className="relative z-10">
            <div className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold mb-2">
              Dim your screen by
            </div>
            <div className="text-4xl font-black text-neon-purple font-mono tracking-tight neon-text">
              {curfewData.curfewTime}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {curfewData.hoursUntil > 0
                ? `${curfewData.hoursUntil.toFixed(1)}h from now`
                : 'Screen curfew active now!'
              }
            </div>
          </div>
        </motion.div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-1 text-[9px] font-bold text-neon-amber uppercase tracking-widest mb-1">
              <Moon className="w-2.5 h-2.5" /> Melatonin Onset
            </div>
            <div className="font-mono text-base font-bold text-black dark:text-white">{curfewData.melatoninOnset}</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-1 text-[9px] font-bold text-neon-cyan uppercase tracking-widest mb-1">
              <Clock className="w-2.5 h-2.5" /> Wake Target
            </div>
            <div className="font-mono text-base font-bold text-black dark:text-white">{curfewData.wakeTime}</div>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <Zap className="w-3.5 h-3.5 text-neon-amber flex-shrink-0 mt-0.5" />
          <span>
            {ageGroup === 'teen'
              ? 'Blue light from your phone delays melatonin by up to 3 hours. Switching to warm light at this time protects your sleep.'
              : 'Screen blue light suppresses melatonin production. Enable warm/night mode after this time for better sleep quality.'
            }
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}
