import type { AgeGroup, Chronotype, GeoLocation } from '../types';

// Age-specific medication mock data
const MEDICATION_DATA: Record<AgeGroup, { id: string; name: string; rank: number; reason: string; bestTime: string }[]> = {
  teen: [
    { id: 'med-1', name: 'Methylphenidate (ADHD)', rank: 1, reason: 'Stimulants taken too late disrupt sleep. Best taken early morning to avoid melatonin interference.', bestTime: '07:30' },
    { id: 'med-2', name: 'Sertraline (Anxiety)', rank: 2, reason: 'SSRIs work best in the morning when serotonin transporters are most active.', bestTime: '08:00' },
  ],
  'young-adult': [
    { id: 'med-1', name: 'Adderall XR (ADHD)', rank: 1, reason: 'Extended-release stimulant peak should align with your cognitive performance window.', bestTime: '07:00' },
    { id: 'med-2', name: 'Escitalopram (SSRI)', rank: 2, reason: 'Morning dosing aligns with your natural serotonin rhythm for maximum benefit.', bestTime: '08:00' },
    { id: 'med-3', name: 'Levonorgestrel (Contraceptive)', rank: 3, reason: 'Hormonal consistency matters. Evening dosing aligns with your progesterone cycle.', bestTime: '22:00' },
  ],
  adult: [
    { id: 'med-1', name: 'Atorvastatin (Statin)', rank: 1, reason: 'Liver enzyme activity peaks at night. Bedtime dosing achieves better cholesterol reduction.', bestTime: '22:00' },
    { id: 'med-2', name: 'Ramipril (Antihypertensive)', rank: 2, reason: 'Bedtime dosing reduces morning blood pressure surge — shown in the HYGIA trial.', bestTime: '22:00' },
    { id: 'med-3', name: 'Metformin (Type 2 Diabetes)', rank: 3, reason: 'Evening dosing aligns with your natural insulin sensitivity cycle.', bestTime: '20:00' },
  ],
  senior: [
    { id: 'med-1', name: 'Amlodipine (Blood Pressure)', rank: 1, reason: 'Morning blood pressure surge is strongest in older adults. Bedtime dosing is critical.', bestTime: '22:00' },
    { id: 'med-2', name: 'Atorvastatin (Cholesterol)', rank: 2, reason: 'Cholesterol synthesis peaks overnight. Night dosing has better LDL reduction.', bestTime: '21:00' },
    { id: 'med-3', name: 'Levothyroxine (Thyroid)', rank: 3, reason: 'Needs an empty stomach. Take 30 minutes before breakfast for best absorption.', bestTime: '06:30' },
    { id: 'med-4', name: 'Metformin (Diabetes)', rank: 4, reason: 'Evening dosing works with your natural insulin sensitivity patterns.', bestTime: '19:00' },
    { id: 'med-5', name: 'Aspirin (Cardioprotective)', rank: 5, reason: 'Bedtime aspirin reduces morning platelet aggregation — the highest-risk period.', bestTime: '22:00' },
  ],
};

// Chronotype-specific time adjustments (hours to shift from base)
const CHRONOTYPE_OFFSET: Record<Chronotype, number> = {
  Lion: -1.5,
  Bear: 0,
  Wolf: 2,
  Dolphin: 0.5,
};

function adjustTimeForChronotype(baseTime: string, chronotype: Chronotype): string {
  const [h, m] = baseTime.split(':').map(Number);
  const offset = CHRONOTYPE_OFFSET[chronotype];
  let newH = h + offset;
  if (newH < 0) newH += 24;
  if (newH >= 24) newH -= 24;
  return `${String(Math.floor(newH)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const fetchMedicationRankings = async (_medIds: string[], chronotype: string, ageGroup?: AgeGroup | null) => {
  const group = ageGroup ?? 'adult';
  const meds = MEDICATION_DATA[group];

  // Adjust times based on chronotype
  if (chronotype && chronotype in CHRONOTYPE_OFFSET) {
    return meds.map(med => ({
      ...med,
      bestTime: adjustTimeForChronotype(med.bestTime, chronotype as Chronotype),
    }));
  }

  return meds;
};

export const generateWeeklyReport = async (userId: string) => {
  console.log('Fetching report for', userId);
  return null;
};

/**
 * Calculate sunrise/sunset from coordinates and date
 * Simplified calculation using the solar declination method
 */
export function calculateSunriseSunset(lat: number, _lng: number): { sunrise: string; sunset: string } {
  // Simplified: use March 14 approximate values adjusted by latitude
  const dayOfYear = 73; // March 14
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
  const latRad = lat * Math.PI / 180;
  const decRad = declination * Math.PI / 180;

  const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decRad)) * 180 / Math.PI;
  const sunriseHour = 12 - hourAngle / 15;
  const sunsetHour = 12 + hourAngle / 15;

  const formatTime = (h: number) => {
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  return { sunrise: formatTime(sunriseHour), sunset: formatTime(sunsetHour) };
}

/**
 * Generate circadian timing recommendation
 */
export function generateCircadianRecommendation(
  chronotype: Chronotype,
  medicationCategory: string,
  sunriseTime: string
): { recommendedTime: string; reason: string } {
  const [sH] = sunriseTime.split(':').map(Number);
  const offset = CHRONOTYPE_OFFSET[chronotype];

  // Category-based recommendations relative to sunrise
  const categoryTiming: Record<string, { hourAfterSunrise: number; reason: string }> = {
    'ADHD': { hourAfterSunrise: 1, reason: 'Stimulants work best 1 hour after your natural wake time to align with cortisol rise.' },
    'SSRI': { hourAfterSunrise: 1.5, reason: 'SSRIs have peak serotonin transporter activity in the morning.' },
    'Anxiety': { hourAfterSunrise: 1.5, reason: 'Anti-anxiety medications absorb best with morning cortisol rhythm.' },
    'Statin': { hourAfterSunrise: 14, reason: 'Liver enzyme (CYP3A4) activity peaks at night. Take before bedtime.' },
    'Antihypertensive': { hourAfterSunrise: 14.5, reason: 'Evening dosing prevents dangerous morning blood pressure surge.' },
    'Blood Pressure': { hourAfterSunrise: 14.5, reason: 'Evening dosing prevents dangerous morning blood pressure surge.' },
    'Diabetes': { hourAfterSunrise: 12, reason: 'Insulin sensitivity follows a circadian pattern, peaking in the evening.' },
    'Thyroid': { hourAfterSunrise: -0.5, reason: 'Take on empty stomach, 30 minutes before breakfast for best absorption.' },
    'Contraceptive': { hourAfterSunrise: 14, reason: 'Evening timing aligns with natural progesterone cycle.' },
    'Cholesterol': { hourAfterSunrise: 13, reason: 'Cholesterol synthesis peaks overnight. Evening dosing is most effective.' },
    'Aspirin': { hourAfterSunrise: 14.5, reason: 'Bedtime aspirin targets the morning platelet aggregation peak.' },
    'Pain': { hourAfterSunrise: 2, reason: 'Anti-inflammatory response is strongest when taken with morning cortisol.' },
    'Allergy': { hourAfterSunrise: -0.5, reason: 'Antihistamines work best taken before allergen exposure, ideally before going outside.' },
    'Asthma': { hourAfterSunrise: 0, reason: 'Bronchodilators are most effective during the cortisol morning rise.' },
  };

  const timing = categoryTiming[medicationCategory] ?? { hourAfterSunrise: 2, reason: 'Timed to align with your circadian peak activity window.' };

  let recHour = sH + timing.hourAfterSunrise + offset;
  if (recHour < 0) recHour += 24;
  if (recHour >= 24) recHour -= 24;

  const recTime = `${String(Math.floor(recHour)).padStart(2, '0')}:${String(Math.round((recHour % 1) * 60)).padStart(2, '0')}`;

  return { recommendedTime: recTime, reason: timing.reason };
}

// Age-specific content configuration
export const AGE_CONTENT = {
  teen: {
    quizTitle: 'Find Your Body Clock Type',
    quizDesc: "Can't sleep until 2am? That's biology, not laziness. Let's find your chronotype.",
    fingerprint: 'Your body clock is naturally shifted later than adults. ChronoRx works with your biology.',
    simTitle: 'How Timing Affects Your Meds',
    simDesc: 'See how dose timing changes how well your medication works',
    missedDose: "I forgot my ADHD med this morning — should I take it now?",
    reportType: 'Summary for Parents',
    reportDesc: 'Share with your parents or school nurse',
    prescTitle: 'Your Schedule Card',
    dashTagline: 'Better Sleep. Better Focus. Better Days.',
    pitchLine: 'Your school tells you when to wake up. Your body says something different. ChronoRx helps you find the balance.',
  },
  'young-adult': {
    quizTitle: 'Find Your Peak Performance Hours',
    quizDesc: "You have 4–6 hours of peak cognitive performance per day. Let's find them.",
    fingerprint: 'Your circadian profile reveals when your brain, body, and medications work best.',
    simTitle: 'Medication Timing Simulator',
    simDesc: 'Drag the slider to see how timing changes medication effectiveness',
    missedDose: "I missed my morning SSRI — what happens now?",
    reportType: 'Weekly Summary',
    reportDesc: 'Performance metrics and medication adherence',
    prescTitle: 'Your Prescription Schedule',
    dashTagline: 'Optimize Your Peak Hours',
    pitchLine: 'You optimize your calendar, diet, and workout. ChronoRx helps you optimize the thing that controls all of them — your body clock.',
  },
  adult: {
    quizTitle: 'Calibrate Your Medication Times',
    quizDesc: 'Multiple medications from different doctors? None factor in your body clock. ChronoRx does.',
    fingerprint: 'Your circadian profile determines when each medication reaches peak effectiveness.',
    simTitle: 'Dose Timing vs Effectiveness',
    simDesc: 'See how shifting your dose time changes real effectiveness',
    missedDose: "I forgot my blood pressure tablet this morning — should I take it now?",
    reportType: 'Doctor Report',
    reportDesc: 'Summary for your next appointment',
    prescTitle: 'Your Medication Schedule',
    dashTagline: 'Multiple Medications? Get the Timing Right.',
    pitchLine: 'Your doctors prescribe what to take. ChronoRx tells you when — backed by clinical evidence.',
  },
  senior: {
    quizTitle: 'Find Your Best Timing',
    quizDesc: 'Simple questions to personalise your daily medication schedule.',
    fingerprint: 'Your body has followed the same clock for decades. ChronoRx makes your medications follow it too.',
    simTitle: 'Your Daily Medicine Window',
    simDesc: 'A clear view of when each medication works best for you',
    missedDose: "I forgot my blood pressure pill — is it safe to take it now?",
    reportType: 'Doctor Visit Summary',
    reportDesc: 'Large-text summary for your doctor',
    prescTitle: 'Daily Schedule',
    dashTagline: 'Your Medications Work Better at the Right Time',
    pitchLine: 'Your body has been following the same clock for decades. ChronoRx helps your medications finally follow it too.',
  },
} as const;

/**
 * Get geolocation from browser
 */
export function requestGeolocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const { sunrise, sunset } = calculateSunriseSunset(latitude, longitude);
        resolve({
          lat: latitude,
          lng: longitude,
          sunriseTime: sunrise,
          sunsetTime: sunset,
          city: `${latitude.toFixed(1)}°N, ${longitude.toFixed(1)}°E`,
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  });
}
