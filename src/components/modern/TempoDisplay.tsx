import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface TempoDisplayProps {
  tempo: number;
  isPlaying: boolean;
  onPress: () => void;
}

export function TempoDisplay({ tempo, isPlaying, onPress }: TempoDisplayProps) {
  const getTempoMarking = (bpm: number): string => {
    if (bpm < 40) return 'Grave';
    if (bpm < 60) return 'Largo';
    if (bpm < 66) return 'Larghetto';
    if (bpm < 76) return 'Adagio';
    if (bpm < 108) return 'Andante';
    if (bpm < 120) return 'Moderato';
    if (bpm < 156) return 'Allegro';
    if (bpm < 176) return 'Vivace';
    if (bpm < 200) return 'Presto';
    return 'Prestissimo';
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.tempoContainer}>
        <Text style={styles.tempoValue}>{tempo}</Text>
        <Text style={styles.bpmLabel}>BPM</Text>
      </View>

      <Text style={styles.tempoMarking}>{getTempoMarking(tempo)}</Text>
      <Text style={styles.tapHint}>tap to adjust</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  tempoContainer: {
    alignItems: 'center',
  },
  tempoValue: {
    fontSize: 96,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -4,
    fontVariant: ['tabular-nums'],
  },
  bpmLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: -8,
  },
  tempoMarking: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFB347', // warm gold
    marginTop: 8,
    letterSpacing: 2,
  },
  tapHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 8,
    letterSpacing: 1,
  },
});
