import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { COLORS } from '../constants/metronome';
import { ReferenceToneSettings } from '../types';

interface ReferenceToneProps {
  settings: ReferenceToneSettings;
  onChange: (settings: ReferenceToneSettings) => void;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [2, 3, 4, 5, 6];

// Calculate frequency for a note
function getFrequency(note: string, octave: number, a4Ref: number): number {
  const noteIndex = NOTES.indexOf(note);
  const a4Index = NOTES.indexOf('A');
  const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - a4Index);
  return a4Ref * Math.pow(2, semitonesFromA4 / 12);
}

// Generate tone as base64 WAV
function generateToneWav(frequency: number, duration: number = 0.5): string {
  const sampleRate = 44100;
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

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.5;
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(44 + i * 2, intSample, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
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

export function ReferenceTone({ settings, onChange }: ReferenceToneProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const frequency = getFrequency(settings.note, settings.octave, settings.a4Reference);

  const playTone = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const wavUri = generateToneWav(frequency, 1);
      const { sound } = await Audio.Sound.createAsync(
        { uri: wavUri },
        { shouldPlay: true, isLooping: true }
      );
      soundRef.current = sound;
    } catch (e) {
      console.log('Failed to play tone');
    }
  };

  const stopTone = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleTone = () => {
    const newPlaying = !settings.isPlaying;
    onChange({ ...settings, isPlaying: newPlaying });
  };

  useEffect(() => {
    if (settings.isPlaying) {
      playTone();
    } else {
      stopTone();
    }
    return () => {
      stopTone();
    };
  }, [settings.isPlaying, settings.note, settings.octave, settings.a4Reference]);

  const changeNote = (direction: number) => {
    const currentIndex = NOTES.indexOf(settings.note);
    let newIndex = currentIndex + direction;
    let newOctave = settings.octave;

    if (newIndex >= NOTES.length) {
      newIndex = 0;
      newOctave = Math.min(6, settings.octave + 1);
    } else if (newIndex < 0) {
      newIndex = NOTES.length - 1;
      newOctave = Math.max(2, settings.octave - 1);
    }

    onChange({ ...settings, note: NOTES[newIndex], octave: newOctave });
  };

  const changeOctave = (direction: number) => {
    const newOctave = Math.max(2, Math.min(6, settings.octave + direction));
    onChange({ ...settings, octave: newOctave });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>REFERENCE TONE</Text>

      {/* Frequency display */}
      <View style={styles.frequencyDisplay}>
        <Text style={styles.frequencyValue}>{frequency.toFixed(1)}</Text>
        <Text style={styles.frequencyUnit}>Hz</Text>
      </View>

      {/* Note selector */}
      <View style={styles.noteSection}>
        <View style={styles.selectorRow}>
          <TouchableOpacity style={styles.arrowButton} onPress={() => changeNote(-1)}>
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>
          <View style={styles.noteDisplay}>
            <Text style={styles.noteName}>{settings.note}</Text>
            <Text style={styles.octaveNumber}>{settings.octave}</Text>
          </View>
          <TouchableOpacity style={styles.arrowButton} onPress={() => changeNote(1)}>
            <Text style={styles.arrowText}>▶</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.selectorRow}>
          <TouchableOpacity style={styles.octaveButton} onPress={() => changeOctave(-1)}>
            <Text style={styles.octaveButtonText}>OCT -</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.octaveButton} onPress={() => changeOctave(1)}>
            <Text style={styles.octaveButtonText}>OCT +</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* A4 Reference slider */}
      <View style={styles.a4Section}>
        <Text style={styles.a4Label}>A4 Reference: {settings.a4Reference} Hz</Text>
        <Slider
          style={styles.slider}
          minimumValue={438}
          maximumValue={445}
          step={1}
          value={settings.a4Reference}
          onValueChange={(v) => onChange({ ...settings, a4Reference: v })}
          minimumTrackTintColor={COLORS.accent}
          maximumTrackTintColor={COLORS.sliderTrack}
          thumbTintColor={COLORS.accent}
        />
      </View>

      {/* Play button */}
      <TouchableOpacity
        style={[styles.playButton, settings.isPlaying && styles.playButtonActive]}
        onPress={toggleTone}
      >
        <Text style={styles.playButtonText}>
          {settings.isPlaying ? '■ STOP' : '▶ PLAY'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.bodyGray,
    borderRadius: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  frequencyDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  frequencyValue: {
    color: COLORS.lcdText,
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  frequencyUnit: {
    color: COLORS.lcdText,
    fontSize: 16,
    marginLeft: 4,
  },
  noteSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.buttonGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  noteDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: COLORS.lcdBackground,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  noteName: {
    color: COLORS.lcdText,
    fontSize: 32,
    fontWeight: 'bold',
  },
  octaveNumber: {
    color: COLORS.lcdText,
    fontSize: 18,
  },
  octaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.buttonGray,
    borderRadius: 4,
  },
  octaveButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  a4Section: {
    marginBottom: 16,
  },
  a4Label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  playButton: {
    backgroundColor: COLORS.buttonGray,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: COLORS.accent,
  },
  playButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
