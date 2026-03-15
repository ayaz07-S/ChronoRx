import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { useMemo } from 'react';
import { AlertTriangle, ArrowRightLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export function SocialJetlag() {
  const { wakeTime, sleepTime, ageGroup } = useChronoStore();

  const jetlagData = useMemo(() => {
    const [wH] = wakeTime.split(':').map(Number);
    const [sH] = sleepTime.split(':').map(Number);

    // Simulate: weekday midpoint vs weekend midpoint
    const weekdayMid = (wH + (sH < wH ? sH + 24 : sH)) / 2;
    const weekendMid = weekdayMid + 1.8; // Typical weekend drift = ~1.8 hours
    const drift = Math.abs(weekendMid - weekdayMid);
    const isHigh = drift > 1.5;

    return { weekdayMid: weekdayMid.toFixed(1), weekendMid: weekendMid.toFixed(1), drift: drift.toFixed(1), isHigh };
  }, [wakeTime, sleepTime]);

  const labels: Record<string, { title: string; desc: string; warning: string }> = {
    teen: {
      title: 'Weekend Recovery Planner',
      desc: 'How much your body clock drifts over the weekend',
      warning: 'Sleeping in on weekends resets your body clock every Monday. This drift is hurting your school performance.',
    },
    'young-adult': {
      title: 'Social Jetlag Detector',
      desc: 'Weekday/weekend sleep midpoint divergence',
      warning: 'Your social jetlag exceeds 1.5 hours — this is linked to metabolic disorders and reduced medication efficacy.',
    },
    adult: {
      title: 'Schedule Drift Monitor',
      desc: 'Circadian consistency tracking',
      warning: 'Significant drift detected. This can reduce medication efficacy and increase cardiovascular risk.',
    },
    senior: {
      title: 'Schedule Consistency',
      desc: 'How regular your daily routine is',
      warning: 'Keeping a consistent schedule is especially important for your medication timing.',
    },
  };

  const label = labels[ageGroup ?? 'young-adult'];

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="255, 171, 0">
      <div className="p-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neon-amber/15 flex items-center justify-center">
          <ArrowRightLeft className="w-4 h-4 text-neon-amber" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-black dark:text-white">{label.title}</h3>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">{label.desc}</p>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-3">
        {/* Drift visualization */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-center">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Weekday</div>
              <div className="font-mono text-lg font-bold text-neon-cyan mt-0.5">{jetlagData.weekdayMid}h</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-600" />
              <div className={`text-2xl font-black font-mono ${jetlagData.isHigh ? 'text-neon-pink' : 'text-neon-green'}`}>
                {jetlagData.drift}h
              </div>
              <span className="text-[8px] text-slate-500 uppercase font-bold">drift</span>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Weekend</div>
              <div className="font-mono text-lg font-bold text-neon-purple mt-0.5">{jetlagData.weekendMid}h</div>
            </div>
          </div>

          {/* Visual bar */}
          <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (parseFloat(jetlagData.drift) / 3) * 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${jetlagData.isHigh ? 'bg-gradient-to-r from-neon-amber to-neon-pink' : 'bg-gradient-to-r from-neon-cyan to-neon-green'}`}
            />
          </div>
          <div className="flex justify-between text-[8px] text-slate-600 mt-1">
            <span>0h (aligned)</span>
            <span>3h+ (severe)</span>
          </div>
        </div>

        {/* Warning */}
        {jetlagData.isHigh && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed glass rounded-xl p-3 border-l-2 border-neon-amber"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-neon-amber flex-shrink-0 mt-0.5" />
            <span>{label.warning}</span>
          </motion.div>
        )}
      </div>
    </SpotlightCard>
  );
}
