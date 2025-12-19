import { Audio, AVPlaybackStatus } from 'expo-av';

// Audio pool for better performance - reuse sound objects
const soundPool: Audio.Sound[] = [];
const POOL_SIZE = 4;

let isAudioInitialized = false;

export async function initializeAudio(): Promise<void> {
  if (isAudioInitialized) return;

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });

  isAudioInitialized = true;
}

// Simple click sound player using system sounds as fallback
// In production, you would bundle actual WAV/MP3 files
export async function playClickSound(
  frequency: 'high' | 'medium' | 'low' = 'medium',
  volume: number = 1.0
): Promise<void> {
  try {
    // Try to play bundled sound if available
    const { sound } = await Audio.Sound.createAsync(
      // Placeholder - will be replaced with actual sound files
      { uri: '' }, // Empty URI will fail gracefully
      { shouldPlay: false, volume }
    );

    await sound.playAsync();

    // Clean up after playback
    sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    // Fallback: no sound yet - visual feedback only
    // Sound files will be added in a future update
  }
}

export async function cleanupAudio(): Promise<void> {
  for (const sound of soundPool) {
    try {
      await sound.unloadAsync();
    } catch {
      // Ignore cleanup errors
    }
  }
  soundPool.length = 0;
}

// Generate a simple beep tone as base64 WAV
// This creates a minimal click sound programmatically
export function generateClickWav(
  frequency: number = 1000,
  duration: number = 0.05,
  sampleRate: number = 44100
): string {
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, 1, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Generate sine wave with envelope
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 50); // Quick decay
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
  return 'data:audio/wav;base64,' + btoa(binary);
}
