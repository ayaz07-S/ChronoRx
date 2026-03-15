import { useState } from 'react';
import { Home as HomeIcon, LayoutDashboard, Heart } from 'lucide-react';
import { FingerprintCard } from './FingerprintCard';
import { PrescriptionCard } from './PrescriptionCard';
import { MissedDoseRescue } from './MissedDoseRescue';
import { Simulator } from './Simulator';
import { MedicationRanker } from './MedicationRanker';
import { ContactDoctor } from './ContactDoctor';
import { motion, AnimatePresence } from 'framer-motion';

export function PatientApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard'>('home');

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 flex flex-col gap-8 flex-shrink-0">
        <div className="flex items-center gap-3 mt-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight">ChronoRx</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
            }`}
          >
            <HomeIcon className="w-4 h-4" /> Overview
          </button>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Clinical Dashboard
          </button>
        </nav>

        <div className="mt-auto px-2">
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            © 2026 ChronoRx Clinic<br />
            ByteCamp HealthTech<br />
            Chronotherapy Engine v2.1
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-8 lg:p-12 relative">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <motion.h1
              key={activeTab}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
            >
              {activeTab === 'home' ? 'Welcome Back' : 'Clinical Dashboard'}
            </motion.h1>
            <motion.p
              key={`p-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-slate-500"
            >
              {activeTab === 'home'
                ? 'Your personalized biological profile and safety protocols.'
                : 'Advanced pharmacokinetic insights and efficacy optimization.'}
            </motion.p>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'home' ? (
              <motion.div
                key="home-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-6">
                  <FingerprintCard />
                  <PrescriptionCard />
                </div>
                <div className="space-y-6">
                  <MissedDoseRescue />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Simulator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MedicationRanker />
                  <ContactDoctor />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
