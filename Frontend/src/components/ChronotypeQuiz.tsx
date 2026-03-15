import { useState } from 'react';
import { useChronoStore } from '../store/useChronoStore';
import { calculateChronotype, getChronotypeInfo } from '../engine/mctqScorer';
import { SpotlightCard } from './ui/SpotlightCard';
import { AGE_CONTENT } from '../lib/api';
import { motion } from 'framer-motion';
import { Clock, Moon, Sun, ArrowRight, Sparkles } from 'lucide-react';

export function ChronotypeQuiz() {
  const { wakeTime, sleepTime, setWakeTime, setSleepTime, setChronotype, ageGroup } = useChronoStore();
  const [isDone, setIsDone] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const content = AGE_CONTENT[ageGroup ?? 'young-adult'];

  const handleComplete = async () => {
    setIsCalculating(true);
    let type = '';
    
    // Create an abort controller with a 2.5s timeout so it doesn't hang forever
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch('http://localhost:8000/api/chronotype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sleep_time: sleepTime, wake_time: wakeTime }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      type = data.chronotype || calculateChronotype(wakeTime, sleepTime);
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn("Backend unavailable or timed out, using local fallback");
      type = calculateChronotype(wakeTime, sleepTime);
    }
    
    setResult(type);
    
    setTimeout(() => {
      setChronotype(type as any);
      setIsDone(true);
      setIsCalculating(false);
    }, 2200);
  };

  if (isDone) return null;

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="13, 148, 136">
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500" />

      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-7"
        >
          {!result ? (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-500/10 mb-5">
                  <Clock className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {content.quizTitle}
                </h2>
                <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-xs mx-auto">
                  {content.quizDesc}
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Wake Time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full rounded-xl px-4 py-3.5 text-slate-900 dark:text-white font-mono text-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep Time
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full rounded-xl px-4 py-3.5 text-slate-900 dark:text-white font-mono text-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleComplete}
                disabled={isCalculating}
                className="w-full group relative overflow-hidden bg-teal-600 hover:bg-teal-700 disabled:opacity-75 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl shadow-sm transition-all duration-300 active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {isCalculating ? 'Calculating...' : 'Find My Chronotype'}
                  {!isCalculating && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center py-6"
            >
              {(() => {
                const info = getChronotypeInfo(result as any);
                return (
                  <>
                    <div className="text-6xl mb-3">{info?.emoji}</div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      You're a {result}
                    </h2>
                    <p className="text-sm text-slate-500 mb-1">{info?.label}</p>
                    <p className="text-xs text-slate-400">Loading your personalized schedule…</p>
                    <div className="mt-5 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: 'linear' }}
                        className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </motion.div>
      </div>
    </SpotlightCard>
  );
}
