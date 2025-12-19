// Generate WAV audio data as base64 data URI
// This allows us to create click sounds without external audio files

interface SoundParams {
  frequency: number;
  duration: number;
  decay: number;
  sampleRate?: number;
}

function generateWavBase64({
  frequency,
  duration,
  decay,
  sampleRate = 44100,
}: SoundParams): string {
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Write WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Generate audio samples
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * decay);
    const sample = Math.sin(2 * Math.PI * frequency * t) * envelope;
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(44 + i * 2, intSample, true);
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  // Use btoa if available (web), otherwise manual base64
  if (typeof btoa !== 'undefined') {
    return 'data:audio/wav;base64,' + btoa(binary);
  }

  // Manual base64 encoding for React Native
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  while (i < binary.length) {
    const a = binary.charCodeAt(i++);
    const b = i < binary.length ? binary.charCodeAt(i++) : 0;
    const c = i < binary.length ? binary.charCodeAt(i++) : 0;

    const triplet = (a << 16) | (b << 8) | c;

    result += base64Chars[(triplet >> 18) & 0x3f];
    result += base64Chars[(triplet >> 12) & 0x3f];
    result += i > binary.length + 1 ? '=' : base64Chars[(triplet >> 6) & 0x3f];
    result += i > binary.length ? '=' : base64Chars[triplet & 0x3f];
  }

  return 'data:audio/wav;base64,' + result;
}

// Pre-generated sound configurations for each click type
export const CLICK_SOUND_URI = generateWavBase64({
  frequency: 1000,
  duration: 0.05,
  decay: 80,
});

export const BEEP_SOUND_URI = generateWavBase64({
  frequency: 880,
  duration: 0.08,
  decay: 40,
});

export const WOOD_SOUND_URI = generateWavBase64({
  frequency: 400,
  duration: 0.03,
  decay: 150,
});

// Voice-like sound (complex waveform approximation)
function generateVoiceWav(): string {
  const sampleRate = 44100;
  const duration = 0.15;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Generate voice-like sound with multiple harmonics
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 20) * (1 - Math.exp(-t * 200));
    const fundamental = 220;
    let sample =
      Math.sin(2 * Math.PI * fundamental * t) * 0.5 +
      Math.sin(2 * Math.PI * fundamental * 2 * t) * 0.3 +
      Math.sin(2 * Math.PI * fundamental * 3 * t) * 0.15 +
      Math.sin(2 * Math.PI * fundamental * 4 * t) * 0.05;
    sample *= envelope;
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(44 + i * 2, intSample, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa !== 'undefined') {
    return 'data:audio/wav;base64,' + btoa(binary);
  }

  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let j = 0;
  while (j < binary.length) {
    const a = binary.charCodeAt(j++);
    const b = j < binary.length ? binary.charCodeAt(j++) : 0;
    const c = j < binary.length ? binary.charCodeAt(j++) : 0;
    const triplet = (a << 16) | (b << 8) | c;
    result += base64Chars[(triplet >> 18) & 0x3f];
    result += base64Chars[(triplet >> 12) & 0x3f];
    result += j > binary.length + 1 ? '=' : base64Chars[(triplet >> 6) & 0x3f];
    result += j > binary.length ? '=' : base64Chars[triplet & 0x3f];
  }

  return 'data:audio/wav;base64,' + result;
}

export const VOICE_SOUND_URI = generateVoiceWav();

export const SOUND_URIS = {
  click: CLICK_SOUND_URI,
  beep: BEEP_SOUND_URI,
  wood: WOOD_SOUND_URI,
  voice: VOICE_SOUND_URI,
};
