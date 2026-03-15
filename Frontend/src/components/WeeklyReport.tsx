import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { AGE_CONTENT } from '../lib/api';
import { CalendarDays, TrendingUp, Check, ArrowUpRight, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export function WeeklyReport() {
  const { chronotype, ageGroup } = useChronoStore();
  if (!chronotype) return null;

  const content = AGE_CONTENT[ageGroup ?? 'young-adult'];

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="0, 230, 118">
      <div className="p-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center">
          <CalendarDays className="w-4 h-4 text-neon-green" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-black dark:text-white">{content.reportType}</h3>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">{content.reportDesc}</p>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4">
        <div className="grid grid-cols-2 gap-2.5">
          <motion.div whileHover={{ scale: 1.03 }} className="glass rounded-xl p-3.5 cursor-default">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Adherence</div>
            <div className="text-2xl font-black text-neon-green tracking-tighter flex items-baseline gap-1">
              94<span className="text-sm opacity-50">%</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neon-green/50" />
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} className="glass rounded-xl p-3.5 cursor-default">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">
              {ageGroup === 'teen' ? 'Mood Score' : 'Efficacy Gain'}
            </div>
            <div className="text-2xl font-black text-neon-cyan tracking-tighter flex items-baseline gap-1">
              +32<span className="text-sm opacity-50">%</span>
              <TrendingUp className="w-3.5 h-3.5 text-neon-cyan/50" />
            </div>
          </motion.div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="w-4 h-4 rounded-full bg-neon-green/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-neon-green" />
            </div>
            {ageGroup === 'teen' ? 'Sleep schedule maintained' : 'No metabolic stacking events'}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="w-4 h-4 rounded-full bg-neon-green/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-neon-green" />
            </div>
            {ageGroup === 'teen' ? 'Screen curfew followed 5/7 nights' : 'Process S synchronized dosing'}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="w-4 h-4 rounded-full bg-neon-green/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-neon-green" />
            </div>
            Circadian alignment maintained
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full glass hover:bg-black/5 dark:bg-white/5 text-black dark:text-white font-semibold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 border border-black/10 dark:border-white/5 hover:border-neon-green/20"
        >
          <Send className="w-3.5 h-3.5" />
          {ageGroup === 'teen' ? 'Send to Parent' :
           ageGroup === 'senior' ? 'Send to Family / GP' :
           'Send to Provider'}
        </motion.button>
      </div>
    </SpotlightCard>
  );
}
