import { useState, useRef, useMemo } from 'react';
import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { generateCircadianRecommendation, requestGeolocation, calculateSunriseSunset } from '../lib/api';
import {
  Upload, Plus, X, Check, Edit3, MapPin, Sunrise, Sunset,
  Clock, Pill, FileText, ArrowLeft, Trash2, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Medication, PatientPrescription, GeoLocation } from '../types';

export function DoctorPortal() {
  const {
    chronotype, ageGroup, prescriptions, addPrescription,
    removePrescription, approvePrescription, geoLocation, setGeoLocation, resetPortal
  } = useChronoStore();

  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [patientGeo, setPatientGeo] = useState<GeoLocation | null>(geoLocation);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sunData = useMemo(() => {
    if (!patientGeo) return null;
    return calculateSunriseSunset(patientGeo.lat, patientGeo.lng);
  }, [patientGeo]);

  const handleAddPrescription = () => {
    if (!name.trim()) return;
    const sunrise = sunData?.sunrise ?? '06:22';
    const rec = generateCircadianRecommendation(
      chronotype ?? 'Bear',
      category || 'Other',
      sunrise
    );

    const med: Medication = {
      id: `rx-${Date.now()}`,
      name: name.trim(),
      category: category || 'Other',
      dose,
      frequency,
      timingSensitivity: 'Medium',
      optimalTimeWindow: rec.recommendedTime,
      pkHalfLife: 4,
      description: `${name} ${dose}`,
    };

    const rx: PatientPrescription = {
      id: med.id,
      medication: med,
      aiRecommendedTime: rec.recommendedTime,
      approvedTime: null,
      approved: false,
      chronotype: chronotype ?? 'Bear',
      reason: rec.reason,
    };

    addPrescription(rx);
    setName('');
    setDose('');
    setCategory('');
    setShowForm(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Simulate OCR extraction
    const demoMeds = [
      { name: 'Atorvastatin', dose: '20mg', cat: 'Statin' },
      { name: 'Ramipril', dose: '5mg', cat: 'Antihypertensive' },
      { name: 'Metformin', dose: '500mg', cat: 'Diabetes' },
    ];
    const sunrise = sunData?.sunrise ?? '06:22';

    demoMeds.forEach(m => {
      const rec = generateCircadianRecommendation(chronotype ?? 'Bear', m.cat, sunrise);
      const med: Medication = {
        id: `rx-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: `${m.name} ${m.dose}`,
        category: m.cat,
        dose: m.dose,
        frequency: 'Once daily',
        timingSensitivity: 'High',
        optimalTimeWindow: rec.recommendedTime,
        pkHalfLife: 4,
        description: `Extracted from prescription`,
      };
      addPrescription({
        id: med.id,
        medication: med,
        aiRecommendedTime: rec.recommendedTime,
        approvedTime: null,
        approved: false,
        chronotype: chronotype ?? 'Bear',
        reason: rec.reason,
      });
    });
  };

  const handleGetLocation = async () => {
    try {
      const geo = await requestGeolocation();
      setPatientGeo(geo);
      setGeoLocation(geo);
    } catch {
      // Fallback: simulate New Delhi location
      const fallback: GeoLocation = {
        lat: 28.6, lng: 77.2,
        sunriseTime: '06:22', sunsetTime: '18:22',
        city: '28.6°N, 77.2°E'
      };
      setPatientGeo(fallback);
      setGeoLocation(fallback);
    }
  };

  const categories = ['ADHD', 'SSRI', 'Statin', 'Antihypertensive', 'Diabetes', 'Thyroid', 'Blood Pressure', 'Pain', 'Allergy', 'Other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto p-5 md:p-8">

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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Doctor Portal</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage prescriptions · Patient chronotype: <span className="font-semibold text-teal-600 dark:text-teal-400">{chronotype ?? 'Not set'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-gentle-pulse" />
            Connected
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Prescription Upload */}
          <div className="lg:col-span-2 space-y-5">

            {/* Upload Zone */}
            <SpotlightCard className="p-0 overflow-hidden" glowColor="13, 148, 136">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700/30">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Prescription Upload
                </h2>
                <p className="text-xs text-slate-500 mt-1">Drag and drop a prescription or add medications manually</p>
              </div>

              <div className="p-5 space-y-4">
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center gap-3 py-6 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl hover:border-teal-400 dark:hover:border-teal-500 transition-colors group bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-500/20 transition-colors">
                    <Upload className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Upload Prescription</p>
                    <p className="text-xs text-slate-400 mt-0.5">Photo or PDF — medications will be extracted automatically</p>
                  </div>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">or add manually</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </div>

                {/* Manual Form */}
                <AnimatePresence>
                  {showForm ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Medication</label>
                          <input
                            type="text" value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Atorvastatin"
                            className="w-full rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dose</label>
                          <input
                            type="text" value={dose} onChange={(e) => setDose(e.target.value)}
                            placeholder="e.g. 20mg"
                            className="w-full rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                          />
                        </div>
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
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Frequency</label>
                        <div className="relative">
                          <select
                            value={frequency} onChange={(e) => setFrequency(e.target.value)}
                            className="w-full rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                          >
                            <option>Once daily</option>
                            <option>Twice daily</option>
                            <option>Three times daily</option>
                            <option>As needed</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleAddPrescription}
                          disabled={!name.trim()}
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Add to Prescription
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
                      onClick={() => setShowForm(true)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-medium py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-600"
                    >
                      <Plus className="w-4 h-4" /> Add Medication Manually
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </SpotlightCard>

            {/* Prescription List with AI Recommendations */}
            {prescriptions.length > 0 && (
              <SpotlightCard className="p-0 overflow-hidden" glowColor="59, 130, 246">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700/30">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-500" />
                    Circadian Timing Recommendations
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Review and approve the suggested timing for each medication</p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {rx.medication.name}
                            </h4>
                            {rx.approved && (
                              <span className="badge-status bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                                <Check className="w-3 h-3" /> Approved
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed mb-3">{rx.reason}</p>

                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg">
                              <Clock className="w-3 h-3" />
                              Suggested: {rx.aiRecommendedTime}
                            </div>
                            {rx.approvedTime && (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                <Check className="w-3 h-3" />
                                Approved: {rx.approvedTime}
                              </div>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium">
                              {rx.medication.dose} · {rx.medication.frequency ?? 'Once daily'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {!rx.approved ? (
                            <>
                              {editingId === rx.id ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="time" value={editTime}
                                    onChange={(e) => setEditTime(e.target.value)}
                                    className="rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-mono"
                                  />
                                  <button
                                    onClick={() => { approvePrescription(rx.id, editTime); setEditingId(null); }}
                                    className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-colors"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => approvePrescription(rx.id, rx.aiRecommendedTime)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" /> Approve
                                  </button>
                                  <button
                                    onClick={() => { setEditingId(rx.id); setEditTime(rx.aiRecommendedTime); }}
                                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </>
                          ) : null}
                          <button
                            onClick={() => removePrescription(rx.id)}
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SpotlightCard>
            )}
          </div>

          {/* Right: Patient Location & Sunrise */}
          <div className="space-y-5">
            {/* Location Card */}
            <SpotlightCard className="p-0 overflow-hidden" glowColor="245, 158, 11">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700/30">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  Patient Location
                </h3>
              </div>

              <div className="p-5 space-y-4">
                {patientGeo ? (
                  <>
                    {/* Mini Map Placeholder */}
                    <div className="relative h-36 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border border-slate-200 dark:border-slate-600">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-1" />
                          <p className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300">
                            {patientGeo.city}
                          </p>
                        </div>
                      </div>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                    </div>

                    {/* Sunrise/Sunset */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-center border border-amber-200/50 dark:border-amber-500/20">
                        <Sunrise className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                        <div className="text-[9px] text-amber-600/70 dark:text-amber-400/70 uppercase font-bold tracking-wider">Sunrise</div>
                        <div className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">{sunData?.sunrise}</div>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-200/50 dark:border-indigo-500/20">
                        <Sunset className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                        <div className="text-[9px] text-indigo-600/70 dark:text-indigo-400/70 uppercase font-bold tracking-wider">Sunset</div>
                        <div className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">{sunData?.sunset}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={handleGetLocation}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all flex flex-col items-center gap-2"
                  >
                    <MapPin className="w-6 h-6" />
                    <span className="text-sm font-medium">Get Patient Location</span>
                    <span className="text-xs text-slate-400">Uses browser geolocation</span>
                  </button>
                )}
              </div>
            </SpotlightCard>

            {/* Chronotype Summary */}
            <SpotlightCard className="p-5" glowColor="99, 102, 241">
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {chronotype === 'Lion' ? '🦁' : chronotype === 'Bear' ? '🐻' : chronotype === 'Wolf' ? '🐺' : chronotype === 'Dolphin' ? '🐬' : '❓'}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Patient is a {chronotype ?? 'Unknown'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {chronotype === 'Lion' ? 'Early riser — medications shifted earlier' :
                   chronotype === 'Bear' ? 'Solar tracker — follows standard schedule' :
                   chronotype === 'Wolf' ? 'Night owl — medications shifted later' :
                   chronotype === 'Dolphin' ? 'Light sleeper — timing windows are narrower' :
                   'Complete the quiz to determine chronotype'}
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
}
