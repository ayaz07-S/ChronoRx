import { useState } from 'react';
import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { Users, Clock, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimeSlot { start: string; end: string; label: string }

const DEFAULT_SLOTS: TimeSlot[] = [
  { start: '06:00', end: '08:00', label: 'Early morning' },
  { start: '08:00', end: '12:00', label: 'Morning' },
  { start: '12:00', end: '14:00', label: 'Afternoon' },
  { start: '18:00', end: '21:00', label: 'Evening' },
];

export function CaregiverWindow() {
  const { ageGroup } = useChronoStore();
  const [selectedSlots, setSelectedSlots] = useState<number[]>([1, 3]); // morning + evening

  if (ageGroup !== 'adult' && ageGroup !== 'senior') return null;

  const isSenior = ageGroup === 'senior';

  const toggleSlot = (i: number) => {
    setSelectedSlots(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  // Mock: optimal biological windows
  const bioWindows = [
    { time: '07:00', med: isSenior ? 'Levothyroxine' : 'Ramipril', match: selectedSlots.includes(0) || selectedSlots.includes(1) },
    { time: '22:00', med: isSenior ? 'Amlodipine' : 'Atorvastatin', match: selectedSlots.includes(3) },
  ];

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="0, 230, 118">
      <div className="p-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neon-green/15 flex items-center justify-center">
          <Users className="w-4 h-4 text-neon-green" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-black dark:text-white">
            {isSenior ? 'Family Coordination Hub' : 'Caregiver Window Negotiator'}
          </h3>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
            {isSenior ? 'Schedule that works for everyone' : 'Bio-optimal + practical timing'}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-3">
        {/* Caregiver availability */}
        <div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold mb-2">
            {isSenior ? 'When can family help?' : 'Caregiver available at:'}
          </div>
          <div className="space-y-1.5">
            {DEFAULT_SLOTS.map((slot, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleSlot(i)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  selectedSlots.includes(i)
                    ? 'glass border border-neon-green/20 text-black dark:text-white'
                    : 'glass border border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">{slot.start}–{slot.end}</span>
                  <span className="text-slate-500">{slot.label}</span>
                </span>
                {selectedSlots.includes(i) && (
                  <div className="w-4 h-4 rounded-full bg-neon-green/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-neon-green" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Result — negotiated windows */}
        <div className="glass rounded-xl p-3 border-l-2 border-neon-green">
          <div className="text-[10px] text-neon-green uppercase tracking-widest font-bold mb-2">
            Negotiated Windows
          </div>
          {bioWindows.map((bw, i) => (
            <div key={i} className="flex items-center gap-2 text-xs py-1">
              <span className={`font-mono font-bold ${bw.match ? 'text-neon-green' : 'text-neon-amber'}`}>
                {bw.time}
              </span>
              <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
              <span className="text-black dark:text-white">{bw.med}</span>
              <span className={`text-[9px] font-bold uppercase ml-auto ${bw.match ? 'text-neon-green' : 'text-neon-amber'}`}>
                {bw.match ? '✓ Aligned' : '⚠ Adjust'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SpotlightCard>
  );
}
