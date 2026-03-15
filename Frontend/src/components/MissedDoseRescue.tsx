import { useState } from 'react';
import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { AGE_CONTENT } from '../lib/api';
import { AlertTriangle, Clock, RotateCcw, Pill, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MissedDoseRescue() {
  const { medications, chronotype, ageGroup } = useChronoStore();
  const [selectedMed, setSelectedMed] = useState<string>('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!chronotype) return null;

  const content = AGE_CONTENT[ageGroup ?? 'young-adult'];

  const handleAskAI = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });
      
      const data = await res.json();
      if (data.response) {
        setResponse(data.response);
      } else {
        setResponse('Sorry, I encountered an error. Please try again later.');
      }
    } catch (error) {
      setResponse('Failed to connect to AI server. Make sure it is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="239, 68, 68">
      <div className="p-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Missed Dose & AI Rescue</h3>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
            {ageGroup === 'senior' ? 'Simple safety guidance & chat' : 'Biological recovery protocol & chat'}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5">
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 italic">"{content.missedDose}"</p>

        {medications.length > 0 ? (
          <select
            className="w-full rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 mb-3 transition-all"
            value={selectedMed}
            onChange={(e) => setSelectedMed(e.target.value)}
          >
            <option value="">Select medication…</option>
            {medications.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-3 italic flex items-center gap-2 border border-slate-200 dark:border-slate-700">
            <Pill className="w-3.5 h-3.5" /> No active medications to rescue.
          </div>
        )}

        <AnimatePresence>
          {selectedMed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-2.5 overflow-hidden"
            >
              <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3.5 border-l-3 border-amber-500">
                <h4 className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3 h-3" /> Shifted Window
                </h4>
                <p className={`text-slate-900 dark:text-white font-mono ${ageGroup === 'senior' ? 'text-base' : 'text-sm'}`}>
                  Take now <span className="text-slate-400 mx-1">|</span> Wait until <span className="text-teal-600 dark:text-teal-400 font-bold">+12h</span>
                </p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-3.5 border-l-3 border-rose-500">
                <h4 className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <RotateCcw className="w-3 h-3" /> Biological Impact
                </h4>
                <p className={`text-slate-700 dark:text-slate-300 leading-relaxed ${ageGroup === 'senior' ? 'text-sm' : 'text-xs'}`}>
                  {ageGroup === 'senior'
                    ? "Taking it late is usually better than skipping it entirely. But if it's close to your next dose, skip this one. Don't double up."
                    : `Phase II liver enzymes are down-regulated after > 4h delay. Absorption drops ~32%. Delay tomorrow's dose by 2h to avoid PK stacking.`
                  }
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Chat Integration - Always Visible */}
        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Ask ChronoRx AI</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              placeholder={selectedMed ? `e.g. Can I take ${medications.find(m => m.id === selectedMed)?.name || 'this'} now?` : "Ask about your medications..."}
              className="flex-1 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-slate-900 dark:text-white"
            />
            <button
              onClick={handleAskAI}
              disabled={isLoading || !query.trim()}
              className="p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[40px]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          
          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-sm text-slate-700 dark:text-slate-300"
              >
                <p className="whitespace-pre-wrap leading-relaxed">{response}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SpotlightCard>
  );
}
