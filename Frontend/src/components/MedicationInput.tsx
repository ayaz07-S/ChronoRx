import { useState } from 'react';
import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { Plus, X, Pill, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Medication } from '../types';

const SENSITIVITY_OPTIONS: Medication['timingSensitivity'][] = ['High', 'Medium', 'Low'];

const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  teen:           ['ADHD', 'Anxiety', 'Depression', 'Allergy', 'Asthma', 'Other'],
  'young-adult':  ['ADHD', 'SSRI', 'Contraceptive', 'Thyroid', 'Anxiety', 'Other'],
  adult:          ['Statin', 'Antihypertensive', 'Diabetes', 'Thyroid', 'Pain', 'Other'],
  senior:         ['Blood Pressure', 'Cholesterol', 'Diabetes', 'Thyroid', 'Aspirin', 'Pain', 'Other'],
};

export function MedicationInput() {
  const { addMedication, removeMedication, medications, setMedsReady, ageGroup, setMealTimings } = useChronoStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [currentTime, setCurrentTime] = useState('08:00');
  const [sensitivity, setSensitivity] = useState<Medication['timingSensitivity']>('Medium');
  const [showForm, setShowForm] = useState(false);

  const categories = CATEGORY_SUGGESTIONS[ageGroup ?? 'young-adult'];

  const handleAdd = () => {
    if (!name.trim()) return;
    const med: Medication = {
      id: `med-${Date.now()}`,
      name: name.trim(),
      category: category || 'Other',
      timingSensitivity: sensitivity,
      optimalTimeWindow: currentTime,
      pkHalfLife: 4,
      description: `${name} — currently taken at ${currentTime}`,
    };
    addMedication(med);
    setName('');
    setCategory('');
    setCurrentTime('08:00');
    setSensitivity('Medium');
    setShowForm(false);
  };

  const sensitivityStyles: Record<string, string> = {
    High: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
    Medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    Low: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Your Medications
        </h2>
        <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">
          Add your current prescriptions. We'll optimize their timing for your body clock.
        </p>
      </motion.div>

      <SpotlightCard className="p-0 overflow-hidden" glowColor="13, 148, 136">
        <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500" />

        <div className="p-6 space-y-5">

          {/* Meal Timings section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Daily Meal Timings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Breakfast</label>
                <input
                  type="time" 
                  value={useChronoStore.getState().mealTimings?.breakfast || '08:00'}
                  onChange={(e) => setMealTimings({ ...useChronoStore.getState().mealTimings, breakfast: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Lunch</label>
                <input
                  type="time"
                  value={useChronoStore.getState().mealTimings?.lunch || '13:00'}
                  onChange={(e) => setMealTimings({ ...useChronoStore.getState().mealTimings, lunch: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dinner</label>
                <input
                  type="time"
                  value={useChronoStore.getState().mealTimings?.dinner || '19:00'}
                  onChange={(e) => setMealTimings({ ...useChronoStore.getState().mealTimings, dinner: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 text-center">We use meal times to optimize food-sensitive medications.</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Your Medications</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Medication list */}
          <AnimatePresence>
            {medications.map((med) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700"
              >
                <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{med.name}</div>
                  <div className="text-[10px] text-slate-500">{med.category}</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-mono font-semibold flex-shrink-0">
                  <Clock className="w-3 h-3" /> {med.optimalTimeWindow}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeMedication(med.id)}
                  className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add form */}
          <AnimatePresence>
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Medication Name</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Atorvastatin 20mg"
                    className="w-full rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(cat => (
                      <button
                        key={cat} onClick={() => setCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          category === cat
                            ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-500/40'
                            : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Current Time</label>
                    <input
                      type="time" value={currentTime} onChange={(e) => setCurrentTime(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Sensitivity</label>
                    <div className="flex gap-1.5">
                      {SENSITIVITY_OPTIONS.map(s => (
                        <button
                          key={s} onClick={() => setSensitivity(s)}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${
                            sensitivity === s ? sensitivityStyles[s] : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={!name.trim()}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Medication
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="toggle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowForm(true)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-medium py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-600"
              >
                <Plus className="w-4 h-4" /> Add Medication Manually
              </motion.button>
            )}
          </AnimatePresence>

          {/* Continue button */}
          <button
            onClick={setMedsReady}
            className="w-full group relative overflow-hidden bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl shadow-sm active:scale-[0.98] transition-all text-sm"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {medications.length > 0 ? (
                <>Continue with {medications.length} medication{medications.length > 1 ? 's' : ''}</>
              ) : (
                <>Skip — Continue without medications</>
              )}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </SpotlightCard>
    </div>
  );
}
