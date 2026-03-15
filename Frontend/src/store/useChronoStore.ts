import { create } from 'zustand';
import type { UserState, Chronotype, Medication, AgeGroup, Portal, GeoLocation, PatientPrescription } from '../types';

interface ChronoStore extends UserState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  medsReady: boolean;
  setPortal: (portal: Portal) => void;
  setAgeGroup: (group: AgeGroup) => void;
  setChronotype: (type: Chronotype) => void;
  setWakeTime: (time: string) => void;
  setSleepTime: (time: string) => void;
  mealTimings: { breakfast: string; lunch: string; dinner: string };
  setMealTimings: (mealTimings: { breakfast: string; lunch: string; dinner: string }) => void;
  addMedication: (med: Medication) => void;
  removeMedication: (id: string) => void;
  setMedsReady: () => void;
  takeDoseNow: (id: string) => void;
  lastDoses: Record<string, number>;
  setGeoLocation: (geo: GeoLocation) => void;
  addPrescription: (rx: PatientPrescription) => void;
  removePrescription: (id: string) => void;
  approvePrescription: (id: string, approvedTime: string) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  resetPortal: () => void;
}

export const useChronoStore = create<ChronoStore>((set) => ({
  theme: 'dark',
  portal: null,
  chronotype: null,
  ageGroup: null,
  medsReady: false,
  wakeTime: '07:00',
  sleepTime: '23:00',
  mealTimings: { breakfast: '08:00', lunch: '13:00', dinner: '19:00' },
  medications: [],
  lastDoses: {},
  geoLocation: null,
  prescriptions: [],
  approvedSchedule: [],
  remindersEnabled: false,

  setTheme: (theme) => set({ theme }),
  setPortal: (portal) => set({ portal }),
  setAgeGroup: (group) => set({ ageGroup: group }),
  setChronotype: (type) => set({ chronotype: type }),
  setWakeTime: (time) => set({ wakeTime: time }),
  setSleepTime: (time) => set({ sleepTime: time }),
  setMealTimings: (timings) => set({ mealTimings: timings }),
  addMedication: (med) => set((state) => ({ medications: [...state.medications, med] })),
  removeMedication: (id) => set((state) => ({ medications: state.medications.filter((m) => m.id !== id) })),
  setMedsReady: () => set({ medsReady: true }),
  takeDoseNow: (id) => set((state) => ({
    lastDoses: { ...state.lastDoses, [id]: Date.now() }
  })),
  setGeoLocation: (geo) => set({ geoLocation: geo }),
  addPrescription: (rx) => set((state) => ({
    prescriptions: [...state.prescriptions, rx]
  })),
  removePrescription: (id) => set((state) => ({
    prescriptions: state.prescriptions.filter((p) => p.id !== id)
  })),
  approvePrescription: (id, approvedTime) => set((state) => {
    const updated = state.prescriptions.map((p) =>
      p.id === id ? { ...p, approved: true, approvedTime } : p
    );
    return {
      prescriptions: updated,
      approvedSchedule: updated.filter((p) => p.approved)
    };
  }),
  setRemindersEnabled: (enabled) => set({ remindersEnabled: enabled }),
  resetPortal: () => set({ portal: null }),
}));
