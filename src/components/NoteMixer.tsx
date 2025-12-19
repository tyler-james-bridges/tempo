import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS } from '../constants/metronome';
import { NoteMixSettings, NoteValue } from '../types';

interface NoteMixerProps {
  settings: NoteMixSettings;
  onChange: (settings: NoteMixSettings) => void;
}

const NOTE_LABELS: { key: NoteValue; label: string; symbol: string }[] = [
  { key: 'quarter', label: '1/4', symbol: '♩' },
  { key: 'eighth', label: '1/8', symbol: '♪' },
  { key: 'eighthTriplet', label: '1/8T', symbol: '♪³' },
  { key: 'sixteenth', label: '1/16', symbol: '♬' },
  { key: 'sixteenthTriplet', label: '1/16T', symbol: '♬³' },
];

export function NoteMixer({ settings, onChange }: NoteMixerProps) {
  const handleChange = (key: NoteValue, value: number) => {
    onChange({ ...settings, [key]: Math.round(value) });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NOTE MIX</Text>
      <View style={styles.slidersContainer}>
        {NOTE_LABELS.map(({ key, label, symbol }) => (
          <View key={key} style={styles.sliderRow}>
            <View style={styles.labelContainer}>
              <Text style={styles.symbol}>{symbol}</Text>
              <Text style={styles.label}>{label}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={settings[key]}
              onValueChange={(v) => handleChange(key, v)}
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.sliderTrack}
              thumbTintColor={COLORS.accent}
            />
            <Text style={styles.value}>{settings[key]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.bodyGray,
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  slidersContainer: {
    gap: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelContainer: {
    width: 50,
    alignItems: 'center',
  },
  symbol: {
    color: COLORS.lcdText,
    fontSize: 16,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  value: {
    width: 30,
    color: COLORS.textPrimary,
    fontSize: 12,
    textAlign: 'right',
  },
});
