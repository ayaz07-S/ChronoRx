import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { fetchMedicationRankings } from '../lib/api';
import { CalendarCheck, Clock, Pill } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ScheduleItem { time: string; name: string; urgency: 'on-time' | 'approaching' | 'missed' }

export function DailySchedule() {
  const { chronotype, ageGroup } = useChronoStore();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    fetchMedicationRankings([], chronotype ?? '', ageGroup).then(meds => {
      const now = new Date();
      const currentH = now.getHours();

      setSchedule(meds.map(med => {
        const [h] = med.bestTime.split(':').map(Number);
        let urgency: ScheduleItem['urgency'] = 'on-time';
        if (currentH > h + 2) urgency = 'missed';
        else if (currentH > h - 1) urgency = 'approaching';
        return { time: med.bestTime, name: med.name, urgency };
      }));
    });
  }, [chronotype, ageGroup]);

  // Only show for seniors primarily, but available for adults
  if (ageGroup !== 'senior' && ageGroup !== 'adult') return null;

  const urgencyStyles = {
    'on-time':     { bg: 'bg-neon-green/10', border: 'border-neon-green/30', text: 'text-neon-green', label: 'On time' },
    'approaching': { bg: 'bg-neon-amber/10', border: 'border-neon-amber/30', text: 'text-neon-amber', label: 'Coming up' },
    'missed':      { bg: 'bg-neon-pink/10',  border: 'border-neon-pink/30',  text: 'text-neon-pink',  label: 'Overdue' },
  };

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="0, 230, 118">
      <div className="p-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neon-green/15 flex items-center justify-center">
          <CalendarCheck className="w-4 h-4 text-neon-green" />
        </div>
        <div>
          <h3 className={`font-bold text-black dark:text-white ${ageGroup === 'senior' ? 'text-base' : 'text-sm'}`}>
            Daily Schedule
          </h3>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
            Today's medication times
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-2">
        {schedule.map((item, i) => {
          const style = urgencyStyles[item.urgency];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 ${style.bg} border ${style.border} rounded-xl p-3`}
            >
              <div className="flex-shrink-0">
                <Clock className={`w-4 h-4 ${style.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-mono font-bold ${ageGroup === 'senior' ? 'text-xl' : 'text-base'} ${style.text}`}>
                  {item.time}
                </div>
                <div className={`font-medium truncate ${ageGroup === 'senior' ? 'text-base text-black dark:text-white' : 'text-sm text-black dark:text-white'}`}>
                  {item.name}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Pill className={`w-3.5 h-3.5 ${style.text}`} />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${style.text}`}>{style.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SpotlightCard>
  );
}
