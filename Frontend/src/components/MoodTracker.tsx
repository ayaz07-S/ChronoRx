import { useState } from 'react';
import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { Smile, Meh, Frown, TrendingUp, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

type MoodLevel = 1 | 2 | 3 | 4 | 5;
interface MoodEntry { day: string; mood: MoodLevel; sleepScore: number }

const MOOD_ICONS = [Frown, Frown, Meh, Smile, Smile];
const MOOD_COLORS = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-lime-400', 'text-neon-green'];
const MOOD_BG = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-neon-green'];

// 7-day mock history
const MOCK_HISTORY: MoodEntry[] = [
  { day: 'Mon', mood: 3, sleepScore: 65 },
  { day: 'Tue', mood: 4, sleepScore: 78 },
  { day: 'Wed', mood: 2, sleepScore: 45 },
  { day: 'Thu', mood: 4, sleepScore: 82 },
  { day: 'Fri', mood: 5, sleepScore: 90 },
  { day: 'Sat', mood: 3, sleepScore: 55 },
  { day: 'Sun', mood: 4, sleepScore: 72 },
];

export function MoodTracker() {
  const { ageGroup } = useChronoStore();
  const [todayMood, setTodayMood] = useState<MoodLevel | null>(null);
  const [history] = useState<MoodEntry[]>(MOCK_HISTORY);

  // Only show for teens and young adults
  if (ageGroup !== 'teen' && ageGroup !== 'young-adult') return null;

  const isTeen = ageGroup === 'teen';
  const correlation = 0.78; // Mock Pearson correlation

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="255, 171, 0">
      <div className="p-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neon-amber/15 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-neon-amber" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-black dark:text-white">
            {isTeen ? 'Mood vs Sleep Tracker' : 'Energy vs Timing'}
          </h3>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">7-day personal data</p>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4">
        {/* Today's mood entry */}
        <div className="glass rounded-xl p-4">
          <div className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold mb-3">
            {isTeen ? "How do you feel today?" : "Rate your energy today"}
          </div>
          <div className="flex justify-between gap-2">
            {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => {
              const Icon = MOOD_ICONS[level - 1];
              const isSelected = todayMood === level;
              return (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setTodayMood(level)}
                  className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    isSelected
                      ? `glass border border-black/30 dark:border-white/20 ${MOOD_COLORS[level - 1]}`
                      : 'text-slate-600 hover:text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold">{level}</span>
                </motion.button>
              );
            })}
          </div>
          {todayMood && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 text-[10px] text-neon-green font-semibold text-center"
            >
              ✓ Logged! Check back in 7 days for your correlation.
            </motion.div>
          )}
        </div>

        {/* 7-day chart (simple bar visualization) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">7-Day History</span>
            <span className="text-[10px] text-slate-500 font-mono">r = {correlation.toFixed(2)}</span>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {history.map((entry, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5">
                  {/* Sleep bar */}
                  <div
                    className="w-full rounded-t bg-neon-cyan/30"
                    style={{ height: `${entry.sleepScore * 0.5}px` }}
                  />
                  {/* Mood dot */}
                  <div className={`w-2.5 h-2.5 rounded-full ${MOOD_BG[entry.mood - 1]}`} />
                </div>
                <span className="text-[8px] text-slate-600 font-mono">{entry.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2 text-[8px] text-slate-500">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-neon-cyan/30" /> Sleep</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-lime-400" /> Mood</span>
          </div>
        </div>

        {/* Insight */}
        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <TrendingUp className="w-3.5 h-3.5 text-neon-amber flex-shrink-0 mt-0.5" />
          <span>
            Strong positive correlation (r=0.78) between sleep quality and {isTeen ? 'mood' : 'energy levels'}.
            Poor sleep on Wednesday directly predicted low {isTeen ? 'mood' : 'energy'}.
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}
