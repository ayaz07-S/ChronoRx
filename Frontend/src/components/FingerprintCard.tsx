import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { AGE_CONTENT } from '../lib/api';
import { getChronotypeInfo } from '../engine/mctqScorer';
import { Fingerprint, Sunrise, Moon, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function FingerprintCard() {
  const { chronotype, wakeTime, sleepTime, ageGroup } = useChronoStore();
  if (!chronotype) return null;

  const info = getChronotypeInfo(chronotype);
  const content = AGE_CONTENT[ageGroup ?? 'young-adult'];

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor={info.color.replace('#', '').match(/.{2}/g)?.map(h => parseInt(h, 16)).join(', ') ?? '13, 148, 136'}>
      {/* Header band */}
      <div className="h-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${info.color}22 0%, ${info.color}11 100%)` }}>
        <div className="relative z-10 flex items-center gap-3 p-5">
          <span className="text-4xl">{info.emoji}</span>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Fingerprint className="w-3 h-3" /> Your Circadian Profile
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight">{chronotype}</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">{info.label}</p>
          <p className="text-xs text-slate-500 leading-relaxed">{content.fingerprint}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 border border-amber-200/50 dark:border-amber-500/20 cursor-default">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600/70 dark:text-amber-400/70 uppercase tracking-widest mb-1">
              <Sunrise className="w-3 h-3" /> Wake
            </div>
            <div className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400">{wakeTime}</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-3 border border-indigo-200/50 dark:border-indigo-500/20 cursor-default">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest mb-1">
              <Moon className="w-3 h-3" /> Sleep
            </div>
            <div className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400">{sleepTime}</div>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700">
          <Clock className="w-3.5 h-3.5 text-teal-500" />
          Peak hours: {info.peakWindow}
        </div>
      </div>
    </SpotlightCard>
  );
}
