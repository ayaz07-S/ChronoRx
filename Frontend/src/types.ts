export type Chronotype = 'Lion' | 'Bear' | 'Wolf' | 'Dolphin';

export type AgeGroup = 'teen' | 'young-adult' | 'adult' | 'senior';

export type Portal = 'doctor' | 'patient' | null;

export interface Medication {
  id: string;
  name: string;
  category: string;
  dose?: string;
  frequency?: string;
  timingSensitivity: 'High' | 'Medium' | 'Low';
  optimalTimeWindow: string; // e.g., "06:00 - 08:00"
  pkHalfLife: number; // hours
  description: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  sunriseTime: string;
  sunsetTime: string;
  city?: string;
}

export interface PatientPrescription {
  id: string;
  medication: Medication;
  aiRecommendedTime: string;
  approvedTime: string | null;
  approved: boolean;
  chronotype: Chronotype;
  reason: string;
}

export interface UserState {
  portal: Portal;
  chronotype: Chronotype | null;
  ageGroup: AgeGroup | null;
  wakeTime: string; // HH:mm
  sleepTime: string; // HH:mm
  medications: Medication[];
  geoLocation: GeoLocation | null;
  prescriptions: PatientPrescription[];
  approvedSchedule: PatientPrescription[];
  remindersEnabled: boolean;
}

export interface SimulationData {
  time: string[];
  processS: number[];
  processC: number[];
  melatonin: number[];
  drugConcentration: number[];
}
