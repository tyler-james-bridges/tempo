import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, METRONOME_CONFIG } from '../constants/metronome';

interface BeatControlProps {
  beat1: number;
  beat2: number | null;
  onBeat1Change: (beat: number) => void;
  onBeat2Change: (beat: number | null) => void;
}

export function BeatControl({
  beat1,
  beat2,
  onBeat1Change,
  onBeat2Change,
}: BeatControlProps) {
  const incrementBeat1 = (amount: number) => {
    const newBeat = beat1 + amount;
    if (newBeat >= METRONOME_CONFIG.minBeat && newBeat <= METRONOME_CONFIG.maxBeat) {
      onBeat1Change(newBeat);
    }
  };

  const incrementBeat2 = (amount: number) => {
    if (beat2 === null) {
      if (amount > 0) {
        onBeat2Change(1);
      }
      return;
    }

    const newBeat = beat2 + amount;
    if (newBeat < METRONOME_CONFIG.minBeat) {
      onBeat2Change(null); // Turn OFF
    } else if (newBeat <= METRONOME_CONFIG.maxBeat) {
      onBeat2Change(newBeat);
    }
  };

  return (
    <View style={styles.container}>
      {/* BEAT1 Control */}
      <View style={styles.beatGroup}>
        <Text style={styles.label}>BEAT1</Text>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => incrementBeat1(-1)}
          >
            <Text style={styles.buttonText}>−</Text>
          </TouchableOpacity>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{beat1}</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => incrementBeat1(1)}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BEAT2 Control */}
      <View style={styles.beatGroup}>
        <Text style={styles.label}>BEAT2</Text>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => incrementBeat2(-1)}
          >
            <Text style={styles.buttonText}>−</Text>
          </TouchableOpacity>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{beat2 === null ? 'OFF' : beat2}</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => incrementBeat2(1)}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginVertical: 16,
  },
  beatGroup: {
    alignItems: 'center',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.buttonGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '300',
  },
  valueContainer: {
    minWidth: 50,
    alignItems: 'center',
    backgroundColor: COLORS.bodyGray,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
