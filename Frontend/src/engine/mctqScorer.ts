import type { Chronotype } from '../types';

/**
 * Enhanced Chronotype Scorer
 * Uses both wake time and sleep time to determine chronotype.
 * Based on Dr. Breus's 4 chronotype animals + MCTQ mid-sleep methodology.
 *
 * Lion   – Early bird: wakes early, sleeps early, 7-8h sleep
 * Bear   – Solar tracker: follows the sun, most common (~55%), 7-8h sleep  
 * Wolf   – Night owl: late to bed, late to rise, peaks after sunset
 * Dolphin – Light/fragmented sleeper: short sleep (<6h), irregular patterns
 */
export function calculateChronotype(wakeTime: string, sleepTime: string): Chronotype {
  const wakeHour = parseTimeToHours(wakeTime);
  const sleepHour = parseTimeToHours(sleepTime);

  // Calculate sleep duration (handles crossing midnight)
  let sleepDuration = wakeHour - sleepHour;
  if (sleepDuration <= 0) sleepDuration += 24;

  // Calculate mid-sleep point (MSF - mid-sleep on free days)
  let midSleep = sleepHour + sleepDuration / 2;
  if (midSleep >= 24) midSleep -= 24;

  // Dolphin: short sleepers (<6h) or very fragmented (mid-sleep very early/late)
  if (sleepDuration < 6) {
    return 'Dolphin';
  }

  // Lion: early bird — mid-sleep before 2:30 AM AND wakes before 6:30
  if (midSleep < 2.5 && wakeHour < 6.5) {
    return 'Lion';
  }

  // Wolf: night owl — mid-sleep after 4:00 AM OR wakes after 9:00
  if (midSleep > 4 || wakeHour >= 9) {
    return 'Wolf';
  }

  // Bear: solar tracker — the default, mid-sleep 2:30-4:00 AM, wake 6:30-9:00
  return 'Bear';
}

/**
 * Parse "HH:mm" string to decimal hours (e.g., "07:30" → 7.5)
 */
function parseTimeToHours(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m || 0) / 60;
}

/**
 * Get chronotype description for display
 */
export function getChronotypeInfo(type: Chronotype) {
  const info: Record<Chronotype, { emoji: string; label: string; desc: string; peakWindow: string; color: string }> = {
    Lion: {
      emoji: '🦁',
      label: 'Early Bird',
      desc: 'You wake naturally at dawn. Your cortisol peaks early, making mornings your most productive time.',
      peakWindow: '6:00 AM – 10:00 AM',
      color: '#f59e0b',
    },
    Bear: {
      emoji: '🐻',
      label: 'Solar Tracker',
      desc: 'Your rhythm follows the sun. You have steady energy through the day with a natural afternoon dip.',
      peakWindow: '10:00 AM – 2:00 PM',
      color: '#10b981',
    },
    Wolf: {
      emoji: '🐺',
      label: 'Night Owl',
      desc: 'You come alive in the evening. Your creativity and focus peak after sunset.',
      peakWindow: '5:00 PM – 9:00 PM',
      color: '#6366f1',
    },
    Dolphin: {
      emoji: '🐬',
      label: 'Light Sleeper',
      desc: 'You have a sensitive sleep pattern. Your alertness comes in waves — timing medication around these windows is critical.',
      peakWindow: '10:00 AM – 12:00 PM',
      color: '#06b6d4',
    },
  };
  return info[type];
}
