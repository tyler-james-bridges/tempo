import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { getTempoMarking } from '../../utils/tempoMarkings';

interface TempoDisplayProps {
  tempo: number;
  isPlaying: boolean;
  onPress: () => void;
}

export function TempoDisplay({ tempo, isPlaying, onPress }: TempoDisplayProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`Tempo: ${tempo} BPM, ${getTempoMarking(tempo)}. Tap to adjust`}
      accessibilityHint="Opens tempo adjustment dialog"
    >
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
