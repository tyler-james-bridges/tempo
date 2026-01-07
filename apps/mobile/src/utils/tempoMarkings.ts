/**
 * Tempo marking utilities
 * Single source of truth for tempo-related labels
 */

/**
 * Get the Italian tempo marking for a given BPM
 * Based on traditional musical terminology
 */
export function getTempoMarking(bpm: number): string {
  if (bpm < 40) return 'Grave';
  if (bpm < 55) return 'Largo';
  if (bpm < 66) return 'Larghetto';
  if (bpm < 76) return 'Adagio';
  if (bpm < 92) return 'Andante';
  if (bpm < 108) return 'Moderato';
  if (bpm < 120) return 'Allegretto';
  if (bpm < 140) return 'Allegro';
  if (bpm < 168) return 'Vivace';
  if (bpm < 200) return 'Presto';
  return 'Prestissimo';
}

/**
 * Get a human-readable subdivision label
 */
export function getSubdivisionLabel(subdivision: number): string {
  switch (subdivision) {
    case 1: return 'Quarter Notes';
    case 2: return 'Eighth Notes';
    case 3: return 'Triplets';
    case 4: return 'Sixteenth Notes';
    default: return `${subdivision} per beat`;
  }
}

/**
 * Get a short subdivision symbol for display
 */
export function getSubdivisionSymbol(subdivision: number): string {
  switch (subdivision) {
    case 1: return '♩';
    case 2: return '♪♪';
    case 3: return '♪³';
    case 4: return '♬';
    default: return String(subdivision);
  }
}
