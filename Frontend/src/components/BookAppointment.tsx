import { useState } from 'react';
import { SpotlightCard } from './ui/SpotlightCard';
import { Calendar, Clock, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:30 AM', 
  '02:00 PM', '03:30 PM', '05:00 PM'
];

export function BookAppointment() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simple min date logic (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleBook = () => {
    if (!selectedDate || !selectedTime) return;
    setIsBooking(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsBooking(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="14, 165, 233">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700/30">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-500" />
          Book Consultation
        </h3>
        <p className="text-xs text-slate-500 mt-1 pb-1">
          Schedule a follow-up appointment with your chronotherapy specialist.
        </p>
      </div>

      <div className="p-5 space-y-5">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Appointment Confirmed!</p>
              <p className="text-xs text-slate-500 max-w-[200px]">
                You are scheduled for {new Date(selectedDate).toLocaleDateString()} at {selectedTime}. We'll send a reminder.
              </p>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedDate('');
                  setSelectedTime('');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
              >
                Book Another
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-5"
            >
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Select Date
                </label>
                <input 
                  type="date" 
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all cursor-pointer"
                />
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Select Time
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      disabled={!selectedDate}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                        !selectedDate ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700' :
                        selectedTime === time 
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 border border-sky-600' 
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500/50 hover:bg-sky-50 dark:hover:bg-sky-500/5'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctor Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Dr. Sarah Jenkins</p>
                  <p className="text-[10px] text-slate-500">Chronotherapy Specialist</p>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={handleBook}
                disabled={!selectedDate || !selectedTime || isBooking}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isBooking ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Confirming...
                  </span>
                ) : (
                  <>
                    Confirm Schedule <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SpotlightCard>
  );
}
