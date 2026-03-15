import { useEffect, useState } from 'react';
import { useChronoStore } from '../store/useChronoStore';
import { fetchMedicationRankings } from '../lib/api';
import { SpotlightCard } from './ui/SpotlightCard';
import { Activity, ShieldCheck, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Ranking {
  id: string;
  name: string;
  rank: number;
  reason: string;
  bestTime: string;
}

const RANK_COLORS = [
  { text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/10' },
  { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
];

export function MedicationRanker() {
  const { chronotype, medications, ageGroup } = useChronoStore();
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chronotype) return;
    const ids = medications.length > 0 ? medications.map(m => m.id) : ['1', '2'];
    fetchMedicationRankings(ids, chronotype, ageGroup).then(data => {
      setRankings(data);
      setLoading(false);
    });
  }, [chronotype, medications, ageGroup]);

  if (!chronotype || rankings.length === 0) return null;

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="13, 148, 136">
      <div className="p-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Medication Timing</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
              {ageGroup === 'teen' ? 'ADHD & Anxiety Focus' :
               ageGroup === 'senior' ? 'Simplified Schedule' :
               'Ranked by importance'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-3 stagger">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            </div>
          ))
        ) : (
          rankings.map((med, index) => {
            const color = RANK_COLORS[index % RANK_COLORS.length];
            return (
              <motion.div
                key={med.id}
                whileHover={{ x: 3 }}
                className="relative bg-white dark:bg-slate-800/60 rounded-xl p-4 group cursor-default border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center`}>
                    <span className={`text-lg font-bold ${color.text}`}>{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{med.name}</h4>
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{med.reason}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-md">
                        <Clock className="w-2.5 h-2.5" /> {med.bestTime}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </SpotlightCard>
  );
}
