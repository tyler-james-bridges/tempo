import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, font, spacing, radius } from '../constants/theme';
import { BluetoothAudioHook } from '../hooks/useBluetoothAudio';

interface BluetoothPanelProps {
  bluetooth: BluetoothAudioHook;
}

const PRESETS = [
  { key: 'wired' as const, label: 'Wired', desc: '0ms', icon: '🔌' },
  { key: 'generic' as const, label: 'Bluetooth', desc: '150ms', icon: '📶' },
  { key: 'megavox' as const, label: 'Megavox', desc: '200ms', icon: '📢' },
  { key: 'custom' as const, label: 'Custom', desc: 'Manual', icon: '⚙️' },
];

export function BluetoothPanel({ bluetooth }: BluetoothPanelProps) {
  const {
    settings,
    isCalibrating,
    calibrationStep,
    setDevicePreset,
    setLatencyCompensation,
    setVisualLeadEnabled,
    startCalibration,
    cancelCalibration,
  } = bluetooth;

  return (
    <View style={styles.container}>
      {/* Device Preset */}
      <Text style={styles.label}>OUTPUT DEVICE</Text>
      <View style={styles.presetGrid}>
        {PRESETS.map((preset) => (
          <Pressable
            key={preset.key}
            style={[
              styles.presetCard,
              settings.devicePreset === preset.key && styles.presetCardActive,
            ]}
            onPress={() => setDevicePreset(preset.key)}
          >
            <Text style={styles.presetIcon}>{preset.icon}</Text>
            <Text
              style={[
                styles.presetLabel,
                settings.devicePreset === preset.key && styles.presetLabelActive,
              ]}
            >
              {preset.label}
            </Text>
            <Text style={styles.presetDesc}>{preset.desc}</Text>
          </Pressable>
        ))}
      </View>

      {/* Latency slider */}
      <View style={styles.sliderSection}>
        <View style={styles.sliderHeader}>
          <Text style={styles.label}>LATENCY COMPENSATION</Text>
          <Text style={styles.sliderValue}>{settings.latencyCompensation}ms</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={500}
          step={10}
          value={settings.latencyCompensation}
          onValueChange={setLatencyCompensation}
          minimumTrackTintColor={colors.accent.primary}
          maximumTrackTintColor={colors.border.medium}
          thumbTintColor={colors.text.primary}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>0ms</Text>
          <Text style={styles.sliderLabel}>250ms</Text>
          <Text style={styles.sliderLabel}>500ms</Text>
        </View>
      </View>

      {/* Visual Lead Toggle */}
      <View style={styles.optionRow}>
        <View>
          <Text style={styles.optionLabel}>Visual Lead</Text>
          <Text style={styles.optionDesc}>
            Show beat indicator ahead of audio
          </Text>
        </View>
        <Pressable
          style={[styles.toggle, settings.visualLeadEnabled && styles.toggleActive]}
          onPress={() => setVisualLeadEnabled(!settings.visualLeadEnabled)}
        >
          <View
            style={[
              styles.toggleThumb,
              settings.visualLeadEnabled && styles.toggleThumbActive,
            ]}
          />
        </Pressable>
      </View>

      {/* Calibration */}
      <View style={styles.calibrationSection}>
        <Text style={styles.label}>AUTO-CALIBRATE</Text>
        {isCalibrating ? (
          <View style={styles.calibrationActive}>
            <Text style={styles.calibrationText}>
              Tap when you HEAR the beat ({calibrationStep}/8)
            </Text>
            <View style={styles.calibrationProgress}>
              <View
                style={[
                  styles.calibrationBar,
                  { width: `${(calibrationStep / 8) * 100}%` },
                ]}
              />
            </View>
            <Pressable style={styles.cancelButton} onPress={cancelCalibration}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.calibrateButton} onPress={startCalibration}>
            <Text style={styles.calibrateButtonText}>Start Calibration</Text>
            <Text style={styles.calibrateButtonDesc}>
              Tap in sync with what you hear to detect latency
            </Text>
          </Pressable>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>About Bluetooth Latency</Text>
        <Text style={styles.infoText}>
          Bluetooth audio has inherent delay. Megavox speakers typically have
          ~200ms latency. Use calibration or adjust manually for perfect sync.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  label: {
    ...font.label,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },

  // Presets
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  presetCardActive: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.primary,
  },
  presetIcon: {
    fontSize: 24,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  presetLabelActive: {
    color: colors.accent.primary,
  },
  presetDesc: {
    fontSize: 11,
    color: colors.text.disabled,
  },

  // Slider
  sliderSection: {
    marginTop: spacing.sm,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent.primary,
    fontVariant: ['tabular-nums'],
  },
  slider: {
    height: 40,
    marginHorizontal: -spacing.sm,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 10,
    color: colors.text.disabled,
  },

  // Option row
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.text.disabled,
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.medium,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.text.tertiary,
  },
  toggleThumbActive: {
    backgroundColor: colors.text.primary,
    marginLeft: 'auto',
  },

  // Calibration
  calibrationSection: {},
  calibrationActive: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  calibrationText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  calibrationProgress: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border.subtle,
    borderRadius: 2,
    overflow: 'hidden',
  },
  calibrationBar: {
    height: '100%',
    backgroundColor: colors.accent.primary,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.tertiary,
  },
  calibrateButton: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    padding: spacing.lg,
    alignItems: 'center',
  },
  calibrateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  calibrateButtonDesc: {
    fontSize: 12,
    color: colors.text.disabled,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // Info
  infoBox: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.dim,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
});
