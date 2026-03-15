import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { useMemo } from 'react';
import { Sunrise, Sun, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export function SunriseWindow() {
  const { wakeTime, ageGroup } = useChronoStore();

  const sunData = useMemo(() => {
    // Mock sunrise based on approximate March timing
    const sunriseH = 6;
    const sunriseM = 22;
    const sunrise = `${String(sunriseH).padStart(2, '0')}:${String(sunriseM).padStart(2, '0')}`;

    // Optimal light exposure = sunrise to sunrise + 2 hours
    const lightEndH = sunriseH + 2;
    const lightEnd = `${String(lightEndH).padStart(2, '0')}:${String(sunriseM).padStart(2, '0')}`;

    // Check if wake time is in the optimal window
    const [wH] = wakeTime.split(':').map(Number);
    const isAligned = wH >= sunriseH && wH <= lightEndH;

    return { sunrise, lightEnd, isAligned };
  }, [wakeTime]);

  const labels: Record<string, { title: string; desc: string; tip: string }> = {
    teen: {
      title: 'School Wake Adjustment',
      desc: 'Natural light anchor for your body clock',
      tip: 'Getting 10 min of morning sunlight within 30 min of waking helps reset your delayed sleep phase.',
    },
    'young-adult': {
      title: 'Peak Light Window',
      desc: 'Optimize workout and work timing',
      tip: 'Morning light exposure sets your cortisol peak and enhances cognitive performance through the day.',
    },
    adult: {
      title: 'Seasonal Schedule Correction',
      desc: 'Circadian light anchor',
      tip: 'Consistent morning light exposure stabilizes CYP450 enzyme rhythms that affect your medication metabolism.',
    },
    senior: {
      title: 'Sunrise Circadian Anchor',
      desc: 'Critical for maintaining rhythm',
      tip: 'As circadian rhythms weaken with age, the sunrise light anchor becomes your most important daily reset signal.',
    },
  };

  const label = labels[ageGroup ?? 'young-adult'];

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="255, 171, 0">
      <div className="p-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neon-amber/15 flex items-center justify-center">
          <Sunrise className="w-4 h-4 text-neon-amber" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-black dark:text-white">{label.title}</h3>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">{label.desc}</p>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-3">
        {/* Sunrise display */}
        <div className="glass rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="text-center">
              <Sunrise className="w-5 h-5 text-neon-amber mx-auto mb-1" />
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Sunrise</div>
              <div className="font-mono text-xl font-bold text-neon-amber">{sunData.sunrise}</div>
            </div>

            <div className="flex-1 mx-4 relative">
              <div className="h-1 bg-slate-800 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-neon-amber to-orange-400 rounded-full"
                />
              </div>
              <div className="text-center mt-1">
                <Sun className="w-3 h-3 text-neon-amber mx-auto" />
                <span className="text-[8px] text-slate-500">2h window</span>
              </div>
            </div>

            <div className="text-center">
              <Sun className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Window End</div>
              <div className="font-mono text-xl font-bold text-orange-400">{sunData.lightEnd}</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl ${
          sunData.isAligned ? 'text-neon-green bg-neon-green/10' : 'text-neon-amber bg-neon-amber/10'
        }`}>
          <div className={`w-2 h-2 rounded-full ${sunData.isAligned ? 'bg-neon-green' : 'bg-neon-amber'}`} />
          {sunData.isAligned
            ? 'Your wake time is within the optimal light window ✓'
            : 'Wake time is outside the optimal light window'
          }
        </div>

        {/* Tip */}
        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <Lightbulb className="w-3.5 h-3.5 text-neon-amber flex-shrink-0 mt-0.5" />
          <span>{label.tip}</span>
        </div>
      </div>
    </SpotlightCard>
  );
}
