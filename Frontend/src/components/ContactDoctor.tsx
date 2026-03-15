import { useState } from 'react';
import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { Phone, Send, AlertCircle, Check, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ContactDoctor() {
  const { chronotype, ageGroup } = useChronoStore();
  const [sent, setSent] = useState(false);

  if (!chronotype) return null;

  const isSenior = ageGroup === 'senior';
  const isTeen = ageGroup === 'teen';

  const labels: Record<string, { title: string; recipientLabel: string; buttonText: string; previewMsg: string }> = {
    teen: {
      title: 'Contact Parent / School Nurse',
      recipientLabel: 'Parent / Guardian',
      buttonText: 'Send Alert to Parent',
      previewMsg: `Hi, ChronoRx detected a circadian pattern that may need attention. Your child's sleep midpoint has shifted by >2 hours this week. Their chronotype (${chronotype}) suggests they may benefit from a schedule adjustment. Full data is attached.`,
    },
    'young-adult': {
      title: 'Contact Doctor',
      recipientLabel: 'GP / Doctor',
      buttonText: 'Send Data to GP via WhatsApp',
      previewMsg: `Dr., my ChronoRx data shows a ChronoScore drop. Chronotype: ${chronotype}. Medication timing and circadian alignment data are attached for your review. I'd like to discuss timing adjustments at our next appointment.`,
    },
    adult: {
      title: 'Contact GP',
      recipientLabel: 'GP / Specialist',
      buttonText: 'Send Clinical Report via WhatsApp',
      previewMsg: `Dr., attached is my ChronoRx circadian health report. Chronotype: ${chronotype}. It includes my medication timing analysis, adherence data, and efficacy scores. Key finding: current dosing misses the CYP450 peak window by ~3 hours.`,
    },
    senior: {
      title: 'Emergency Contact',
      recipientLabel: 'Family / GP',
      buttonText: '📞 Contact Family / Doctor Now',
      previewMsg: `Hello, this is an automated message from ChronoRx. The medication schedule has changed significantly. Current chronotype: ${chronotype}. Please review the attached daily schedule and medication timing report.`,
    },
  };

  const label = labels[ageGroup ?? 'young-adult'];

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(label.previewMsg)}`;

  const handleSend = () => {
    window.open(whatsappUrl, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor={isSenior ? '239, 68, 68' : '13, 148, 136'}>
      <div className="p-5 pb-3 flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg ${isSenior ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-teal-50 dark:bg-teal-500/10'} flex items-center justify-center`}>
          <Phone className={`w-4 h-4 ${isSenior ? 'text-rose-500' : 'text-teal-600 dark:text-teal-400'}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{label.title}</h3>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
            {isTeen ? 'Safety net alert system' : 'Pre-filled WhatsApp report'}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-3">
        {/* Trigger conditions */}
        {!isSenior && (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1.5 border border-slate-200 dark:border-slate-700">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Auto-triggers when</div>
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              Circadian drift {'>'} 2 hours detected
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              ChronoScore drops {'>'} 10 points
            </div>
          </div>
        )}

        {/* Message preview */}
        <div className="bg-emerald-50 dark:bg-emerald-500/8 rounded-xl p-3 border-l-3 border-emerald-500">
          <div className="flex items-center gap-1.5 text-[9px] text-emerald-700 dark:text-emerald-400 uppercase tracking-widest font-bold mb-1.5">
            <MessageSquare className="w-2.5 h-2.5" /> Pre-filled WhatsApp message
          </div>
          <p className={`text-slate-700 dark:text-slate-300 leading-relaxed ${isSenior ? 'text-sm' : 'text-xs'}`}>
            {label.previewMsg}
          </p>
        </div>

        {/* Send button */}
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm"
            >
              <Check className="w-4 h-4" /> Message Sent ✓
            </motion.div>
          ) : (
            <motion.button
              key="send"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              className={`w-full font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                isSenior
                  ? 'bg-rose-600 hover:bg-rose-700 text-white py-5 text-lg shadow-lg shadow-rose-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-sm shadow-sm'
              }`}
            >
              <Send className={isSenior ? 'w-5 h-5' : 'w-3.5 h-3.5'} />
              {label.buttonText}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </SpotlightCard>
  );
}
