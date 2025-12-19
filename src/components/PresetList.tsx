import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS } from '../constants/metronome';
import { MetronomePreset } from '../types';

interface PresetListProps {
  presets: MetronomePreset[];
  onSelect: (preset: MetronomePreset) => void;
  onDelete: (id: string) => void;
  currentTempo?: number;
}

export function PresetList({ presets, onSelect, onDelete, currentTempo }: PresetListProps) {
  const handleLongPress = (preset: MetronomePreset) => {
    Alert.alert(
      'Delete Preset',
      `Delete "${preset.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(preset.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PRESETS</Text>
      <Text style={styles.hint}>Tap to load • Long press to delete</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {presets.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetItem,
              currentTempo === preset.tempo && styles.presetItemActive,
            ]}
            onPress={() => onSelect(preset)}
            onLongPress={() => handleLongPress(preset)}
          >
            <View style={styles.presetInfo}>
              <Text style={styles.presetName}>{preset.name}</Text>
              <Text style={styles.presetDetails}>
                {preset.tempo} BPM • {preset.beat1}/{preset.beat2 || 4} • {preset.clickSound}
              </Text>
            </View>
            <View style={styles.tempoDisplay}>
              <Text style={styles.tempoValue}>{preset.tempo}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bodyGray,
    borderRadius: 8,
    padding: 12,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  presetItemActive: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '20',
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  presetDetails: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  tempoDisplay: {
    backgroundColor: COLORS.lcdBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  tempoValue: {
    color: COLORS.lcdText,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});
