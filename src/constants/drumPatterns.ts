import { DrumPattern } from '../types';

export const DRUM_PATTERNS: DrumPattern[] = [
  // 8-Beat (4 variations)
  { id: '8beat-1', name: '8-Beat 1', category: '8beat', pattern: [1, 0, 1, 0, 1, 0, 1, 0] },
  { id: '8beat-2', name: '8-Beat 2', category: '8beat', pattern: [1, 0, 0, 1, 1, 0, 0, 1] },
  { id: '8beat-3', name: '8-Beat 3', category: '8beat', pattern: [1, 0, 1, 0, 0, 1, 1, 0] },
  { id: '8beat-4', name: '8-Beat 4', category: '8beat', pattern: [1, 1, 0, 1, 1, 0, 1, 0] },

  // 16-Beat (3 variations)
  { id: '16beat-1', name: '16-Beat 1', category: '16beat', pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
  { id: '16beat-2', name: '16-Beat 2', category: '16beat', pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
  { id: '16beat-3', name: '16-Beat 3', category: '16beat', pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0] },

  // Shuffle (3 variations)
  { id: 'shuffle-1', name: 'Shuffle 1', category: 'shuffle', pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0] },
  { id: 'shuffle-2', name: 'Shuffle 2', category: 'shuffle', pattern: [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1] },
  { id: 'shuffle-3', name: 'Shuffle 3', category: 'shuffle', pattern: [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1] },

  // Funk (2 variations)
  { id: 'funk-1', name: 'Funk 1', category: 'funk', pattern: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0] },
  { id: 'funk-2', name: 'Funk 2', category: 'funk', pattern: [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1] },

  // Jazz (2 variations)
  { id: 'jazz-1', name: 'Jazz 1', category: 'jazz', pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0] },
  { id: 'jazz-2', name: 'Jazz 2', category: 'jazz', pattern: [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0] },

  // Other styles
  { id: 'blues', name: 'Blues', category: 'blues', pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0] },
  { id: 'techno', name: 'Techno', category: 'techno', pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
  { id: 'house', name: 'House', category: 'house', pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
  { id: 'country', name: 'Country', category: 'country', pattern: [1, 0, 1, 0, 1, 0, 1, 0] },
  { id: 'reggae', name: 'Reggae', category: 'reggae', pattern: [0, 0, 1, 0, 0, 0, 1, 0] },

  // Latin - Clave variations
  { id: 'clave-son', name: 'Son Clave', category: 'latin', pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0] },
  { id: 'clave-rumba', name: 'Rumba Clave', category: 'latin', pattern: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0] },
  { id: 'salsa', name: 'Salsa', category: 'latin', pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0] },
  { id: 'rumba', name: 'Rumba', category: 'latin', pattern: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0] },
  { id: 'bossa-nova', name: 'Bossa Nova', category: 'latin', pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0] },
  { id: 'samba', name: 'Samba', category: 'latin', pattern: [1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0] },

  // Ballroom
  { id: 'waltz', name: 'Waltz', category: 'ballroom', pattern: [1, 0, 0, 0, 0, 0] },
  { id: 'tango', name: 'Tango', category: 'ballroom', pattern: [1, 0, 1, 0, 1, 1, 0, 0] },
  { id: 'mambo', name: 'Mambo', category: 'ballroom', pattern: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0] },
  { id: 'cha-cha', name: 'Cha-Cha-Cha', category: 'ballroom', pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0] },
  { id: 'march', name: 'March', category: 'ballroom', pattern: [1, 0, 0, 0, 1, 0, 0, 0] },
];

export const PATTERN_CATEGORIES = [
  { id: '8beat', name: '8-Beat' },
  { id: '16beat', name: '16-Beat' },
  { id: 'shuffle', name: 'Shuffle' },
  { id: 'funk', name: 'Funk' },
  { id: 'jazz', name: 'Jazz' },
  { id: 'blues', name: 'Blues' },
  { id: 'techno', name: 'Techno' },
  { id: 'house', name: 'House' },
  { id: 'country', name: 'Country' },
  { id: 'reggae', name: 'Reggae' },
  { id: 'latin', name: 'Latin' },
  { id: 'ballroom', name: 'Ballroom' },
];
