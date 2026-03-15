/**
 * 2-Process Model of Sleep Regulation
 * Process S: Sleep pressure (builds up during wake, dissipates during sleep)
 * Process C: Circadian rhythm (alertness signal from the circadian clock)
 *
 * Enhanced with chronotype-specific phase shifts
 */

import type { Chronotype } from '../types';

// Phase shift (hours) for Process C peak relative to default
const CHRONOTYPE_SHIFT: Record<Chronotype, number> = {
  Lion: -2,     // Peaks 2 hours earlier
  Bear: 0,      // Default solar alignment
  Wolf: 2.5,    // Peaks 2.5 hours later
  Dolphin: 0.5, // Slightly shifted, more fragmented
};

export function generateProcessCurves(
  wakeTimeString: string,
  sleepTimeString: string,
  chronotype: Chronotype = 'Bear'
) {
  const time = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const parseTime = (ts: string) => {
    const [h, m] = ts.split(':').map(Number);
    return h + (m || 0) / 60;
  };
  const wakeHour = parseTime(wakeTimeString);
  const sleepHour = parseTime(sleepTimeString);
  const shift = CHRONOTYPE_SHIFT[chronotype];

  // Process S: homeostatic sleep pressure
  const processS = time.map((_, i) => {
    const offset = (i - wakeHour + 24) % 24;
    const awakeDuration = (sleepHour - wakeHour + 24) % 24;

    if (offset < awakeDuration) {
      // Building up exponentially during wake
      const t = offset / awakeDuration;
      return (1 - Math.exp(-3 * t)) / (1 - Math.exp(-3)) * 100;
    } else {
      // Dissipating exponentially during sleep
      const asleepDuration = 24 - awakeDuration;
      const sleepOffset = offset - awakeDuration;
      const t = sleepOffset / asleepDuration;
      return 100 * Math.exp(-3 * t);
    }
  });

  // Process C: circadian alertness rhythm
  const processC = time.map((_, i) => {
    const phaseShift = wakeHour - 7 + shift;
    // Sinusoidal with peak in late afternoon
    const base = (Math.sin(((i - phaseShift - 8) / 24) * Math.PI * 2) + 1) * 50;
    // Dolphin has dampened amplitude (more fragmented alertness)
    if (chronotype === 'Dolphin') {
      return base * 0.7 + 15;
    }
    return base;
  });

  // Melatonin: peaks at night, onset based on chronotype
  const melatonin = time.map((_, i) => {
    const phaseShift = wakeHour - 7 + shift;
    const val = Math.sin(((i - phaseShift + 6) / 24) * Math.PI * 2);
    const clamped = Math.max(0, val * 100);
    // Dolphin has lower melatonin amplitude
    if (chronotype === 'Dolphin') {
      return clamped * 0.65;
    }
    return clamped;
  });

  const drugConcentration = time.map(() => 0);

  return { time, processS, processC, melatonin, drugConcentration };
}

export function simulateDrugPK(doseTimeHour: number, currentHour: number, halfLife: number) {
  if (currentHour < doseTimeHour) {
    return 0;
  }
  const hoursSinceDose = currentHour - doseTimeHour;
  const k = Math.LN2 / halfLife;
  return 100 * Math.exp(-k * hoursSinceDose);
}
