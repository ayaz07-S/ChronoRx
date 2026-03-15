import { useChronoStore } from '../store/useChronoStore';
import { motion } from 'framer-motion';
import { Gamepad2, Laptop, Home, Sunrise, ArrowRight } from 'lucide-react';
import type { AgeGroup } from '../types';

const AGE_GROUPS: { id: AgeGroup; emoji: string; icon: typeof Gamepad2; label: string; range: string; tagline: string; color: string; bg: string; border: string }[] = [
  {
    id: 'teen', emoji: '🎮', icon: Gamepad2,
    label: 'Teenager', range: '13–17 years',
    tagline: 'Fix your sleep. Play better. Feel less burnt out.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-500/20',
  },
  {
    id: 'young-adult', emoji: '💻', icon: Laptop,
    label: 'Young Adult', range: '18–35 years',
    tagline: 'Optimize your peak hours. Stop wasting your best brain time.',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    border: 'border-teal-200 dark:border-teal-500/20',
  },
  {
    id: 'adult', emoji: '🏠', icon: Home,
    label: 'Adult & Parent', range: '36–59 years',
    tagline: "Multiple medications? Make sure timing isn't working against you.",
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
  },
  {
    id: 'senior', emoji: '🌅', icon: Sunrise,
    label: 'Senior Citizen', range: '60+ years',
    tagline: "Your medications work better at the right time. Let's find that time.",
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
  },
];

export function AgeSelector() {
  const { setAgeGroup } = useChronoStore();

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Who are you?
        </h2>
        <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
          ChronoRx adapts its language, features, and medication focus to your life stage.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AGE_GROUPS.map((group, i) => {
          const Icon = group.icon;
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                className={`w-full text-left p-5 rounded-2xl border-2 ${group.border} bg-white dark:bg-slate-800/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group/age`}
                onClick={() => setAgeGroup(group.id)}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{group.emoji}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${group.bg} ${group.color}`}>
                    {group.range}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{group.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed flex-1">{group.tagline}</p>

                <div className={`mt-4 flex items-center gap-2 text-xs font-semibold ${group.color} group-hover/age:gap-3 transition-all`}>
                  <Icon className="w-3.5 h-3.5" />
                  Select
                  <ArrowRight className="w-3 h-3 group-hover/age:translate-x-1 transition-transform" />
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
