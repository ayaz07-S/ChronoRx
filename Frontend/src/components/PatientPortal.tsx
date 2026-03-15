import { useState, useEffect, useCallback } from 'react';
import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { BodyClock } from './BodyClock';
import { requestGeolocation } from '../lib/api';
import {
  ArrowLeft, MapPin, Bell, BellOff, Clock, Pill,
  Sun, Check, Share2
} from 'lucide-react';
import { motion } from 'framer-motion';

export function PatientPortal() {
  const {
    chronotype, prescriptions, geoLocation, setGeoLocation,
    remindersEnabled, setRemindersEnabled, resetPortal
  } = useChronoStore();

  const [locationShared, setLocationShared] = useState(!!geoLocation);
  const [sharingLocation, setSharingLocation] = useState(false);

  const approvedRx = prescriptions.filter(p => p.approved && p.approvedTime);

  // Request notification permission
  const toggleReminders = useCallback(async () => {
    if (remindersEnabled) {
      setRemindersEnabled(false);
      return;
    }
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setRemindersEnabled(true);
        // Schedule reminders for each approved medication
        approvedRx.forEach(rx => {
          if (!rx.approvedTime) return;
          const [h, m] = rx.approvedTime.split(':').map(Number);
          const now = new Date();
          const target = new Date();
          target.setHours(h, m, 0, 0);
          if (target <= now) target.setDate(target.getDate() + 1);

          const delay = target.getTime() - now.getTime();
          if (delay > 0 && delay < 86400000) {
            setTimeout(() => {
              new Notification('ChronoRx Reminder', {
                body: `Time to take ${rx.medication.name} (${rx.approvedTime})`,
                icon: '💊',
              });
            }, delay);
          }
        });
      }
    }
  }, [remindersEnabled, setRemindersEnabled, approvedRx]);

  const handleShareLocation = async () => {
    setSharingLocation(true);
    try {
      const geo = await requestGeolocation();
      setGeoLocation(geo);
      setLocationShared(true);
    } catch {
      // Fallback
      setGeoLocation({
        lat: 28.6, lng: 77.2,
        sunriseTime: '06:22', sunsetTime: '18:22',
        city: '28.6°N, 77.2°E'
      });
      setLocationShared(true);
    }
    setSharingLocation(false);
  };

  // Determine time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto p-5 md:p-8">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-700/50"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={resetPortal}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{greeting}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your personalized medication schedule
              </p>
            </div>
          </div>

          {chronotype && (
            <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full">
              <span className="text-base">
                {chronotype === 'Lion' ? '🦁' : chronotype === 'Bear' ? '🐻' : chronotype === 'Wolf' ? '🐺' : '🐬'}
              </span>
              {chronotype}
            </div>
          )}
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Body Clock */}
          <div className="lg:col-span-2 space-y-5">
            <SpotlightCard className="p-5" glowColor="59, 130, 246">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Your Body Clock
              </h3>
              <BodyClock
                prescriptions={prescriptions}
                sunriseTime={geoLocation?.sunriseTime}
                sunsetTime={geoLocation?.sunsetTime}
              />
            </SpotlightCard>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleShareLocation}
                disabled={sharingLocation || locationShared}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm ${
                  locationShared
                    ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 bg-white dark:bg-slate-800/60'
                }`}
              >
                {locationShared ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span className="font-medium text-xs">Location Shared</span>
                  </>
                ) : (
                  <>
                    <Share2 className={`w-5 h-5 ${sharingLocation ? 'animate-pulse' : ''}`} />
                    <span className="font-medium text-xs">Share Location</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleReminders}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm ${
                  remindersEnabled
                    ? 'border-blue-300 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800/60'
                }`}
              >
                {remindersEnabled ? (
                  <>
                    <Bell className="w-5 h-5" />
                    <span className="font-medium text-xs">Reminders On</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-5 h-5" />
                    <span className="font-medium text-xs">Set Reminders</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Schedule */}
          <div className="lg:col-span-3 space-y-5">

            {/* Medication Schedule */}
            <SpotlightCard className="p-0 overflow-hidden" glowColor="13, 148, 136">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700/30">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Today's Medications
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {approvedRx.length > 0
                    ? `${approvedRx.length} medication${approvedRx.length > 1 ? 's' : ''} scheduled for today`
                    : 'No medications scheduled yet. Your doctor will approve your schedule.'
                  }
                </p>
              </div>

              {approvedRx.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
                  {approvedRx
                    .sort((a, b) => (a.approvedTime ?? '').localeCompare(b.approvedTime ?? ''))
                    .map((rx, i) => {
                      const now = new Date();
                      const [rH, rM] = (rx.approvedTime ?? '').split(':').map(Number);
                      const isPast = now.getHours() > rH || (now.getHours() === rH && now.getMinutes() > rM);
                      const isNow = now.getHours() === rH;

                      return (
                        <motion.div
                          key={rx.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={`p-4 flex items-center gap-4 ${isNow ? 'bg-teal-50/50 dark:bg-teal-500/5' : ''}`}
                        >
                          {/* Time */}
                          <div className={`text-center flex-shrink-0 w-14 ${isPast ? 'opacity-50' : ''}`}>
                            <div className={`font-mono text-xl font-bold ${
                              isNow ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-200'
                            }`}>
                              {rx.approvedTime}
                            </div>
                          </div>

                          {/* Status dot */}
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            isPast ? 'bg-slate-300 dark:bg-slate-600' :
                            isNow ? 'bg-teal-500 animate-gentle-pulse' :
                            'bg-blue-400'
                          }`} />

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-semibold ${isPast ? 'text-slate-400' : 'text-slate-900 dark:text-white'} truncate`}>
                              {rx.medication.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {rx.medication.dose} · {rx.medication.frequency ?? 'Once daily'}
                            </p>
                          </div>

                          {/* Status badge */}
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-md flex-shrink-0 ${
                            isPast ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' :
                            isNow ? 'bg-teal-100 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400' :
                            'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}>
                            {isPast ? 'Done' : isNow ? 'Now' : 'Upcoming'}
                          </span>
                        </motion.div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Pill className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Waiting for doctor to approve your medication schedule</p>
                </div>
              )}
            </SpotlightCard>

            {/* Location & Sunrise Info */}
            {geoLocation && (
              <SpotlightCard className="p-5" glowColor="245, 158, 11">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Your Local Sun Times
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-center">
                    <div className="text-[9px] text-amber-600/70 dark:text-amber-400/70 uppercase font-bold">Sunrise</div>
                    <div className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">{geoLocation.sunriseTime}</div>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-3 text-center">
                    <div className="text-[9px] text-indigo-600/70 dark:text-indigo-400/70 uppercase font-bold">Sunset</div>
                    <div className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">{geoLocation.sunsetTime}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Location</div>
                    <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 mt-1.5 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {geoLocation.city}
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
