import { useChronoStore } from './store/useChronoStore';
import { AgeSelector } from './components/AgeSelector';
import { ChronotypeQuiz } from './components/ChronotypeQuiz';
import { MedicationInput } from './components/MedicationInput';
import { PatientApp } from './components/PatientApp';
import { PortalSelector } from './components/PortalSelector';
import { DoctorPortal } from './components/DoctorPortal';
import { ThemeToggle } from './components/ThemeToggle';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { portal, chronotype, ageGroup, medsReady } = useChronoStore();

  // Portal selection first
  if (!portal) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <PortalSelector />
      </div>
    );
  }

  // Doctor portal
  if (portal === 'doctor') {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <DoctorPortal />
      </div>
    );
  }

  // Patient portal
  if (portal === 'patient') {
    const step = !ageGroup ? 'onboarding' : !chronotype ? 'onboarding' : !medsReady ? 'onboarding' : 'app';

    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <AnimatePresence mode="wait">
          {step === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
            >
              <OnboardingFlow />
            </motion.div>
          )}
          {step === 'app' && (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PatientApp />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}

function OnboardingFlow() {
  const { chronotype, ageGroup, medsReady } = useChronoStore();

  const step = !ageGroup ? 'age' : !chronotype ? 'quiz' : !medsReady ? 'meds' : 'done';

  const subtitles: Record<string, string> = {
    age: "Your body clock matters. Tell us about yourself.",
    quiz: "Let's find your natural rhythm.",
    meds: "Add your current medications. We'll optimize the timing.",
  };

  if (step === 'done') return null;

  return (
    <motion.div
      key="onboarding"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen"
    >
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-16 h-16 mb-5"
        >
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Heart className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white text-center"
        >
          ChronoRx <span className="text-teal-600 dark:text-teal-400">Clinic</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-3 text-slate-500 text-sm md:text-base font-medium text-center max-w-md"
        >
          {subtitles[step]}
        </motion.p>

        {/* Step dots */}
        <div className="flex items-center gap-2 mt-5">
          {['age', 'quiz', 'meds'].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step === s
                  ? 'w-6 bg-teal-500'
                  : 'w-2 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 'age' && (
          <motion.div
            key="age-selector"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full"
          >
            <AgeSelector />
          </motion.div>
        )}
        {step === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <ChronotypeQuiz />
          </motion.div>
        )}
        {step === 'meds' && (
          <motion.div
            key="meds"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <MedicationInput />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;
