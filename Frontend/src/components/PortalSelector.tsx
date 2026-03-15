import { useChronoStore } from '../store/useChronoStore';
import { motion } from 'framer-motion';
import { Stethoscope, User, ArrowRight, Heart } from 'lucide-react';

export function PortalSelector() {
  const { setPortal } = useChronoStore();

  const portals = [
    {
      id: 'doctor' as const,
      icon: Stethoscope,
      title: 'Doctor Portal',
      desc: 'Upload prescriptions, view patient location, and approve circadian-optimized medication schedules.',
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-500/10',
      border: 'border-teal-200 dark:border-teal-500/20',
      hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-400/40',
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      id: 'patient' as const,
      icon: User,
      title: 'Patient Portal',
      desc: 'View your personalized medication schedule, set reminders, and share your location with your doctor.',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-500/20',
      hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-400/40',
      gradient: 'from-blue-500 to-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 mb-5 shadow-lg shadow-teal-500/20">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            ChronoRx <span className="text-teal-600 dark:text-teal-400">Clinic</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Medication timing personalized to your body clock. Choose your portal to get started.
          </p>
        </motion.div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {portals.map((portal, i) => {
            const Icon = portal.icon;
            return (
              <motion.button
                key={portal.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                onClick={() => setPortal(portal.id)}
                className={`text-left p-6 rounded-2xl border-2 ${portal.border} ${portal.hoverBorder} bg-white dark:bg-slate-800/60 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-xl ${portal.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${portal.color}`} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {portal.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {portal.desc}
                </p>
                <div className={`inline-flex items-center gap-2 text-sm font-semibold ${portal.color} group-hover:gap-3 transition-all`}>
                  Enter
                  <ArrowRight className="w-4 h-4" />
                </div>

                {/* Bottom accent */}
                <div className={`h-1 w-full bg-gradient-to-r ${portal.gradient} rounded-full mt-5 opacity-30 group-hover:opacity-100 transition-opacity`} />
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-slate-400 mt-10"
        >
          © 2026 ChronoRx Clinic · ByteCamp HealthTech Track
        </motion.p>
      </div>
    </div>
  );
}
