import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, font, spacing, radius } from '../constants/theme';

interface BluetoothPanelProps {
  audioLatency: number;
  setAudioLatency: (ms: number) => void;
  isCalibrating: boolean;
  calibrationTapCount: number;
  startCalibration: () => void;
  stopCalibration: (applyResult?: boolean) => void;
  calibrationTap: () => void;
  getCalibrationResult: () => number | null;
}

// Device presets with typical latency values
const PRESETS = [
  { key: 'wired', label: 'Wired', latency: 0, approx: false },
  { key: 'generic', label: 'Bluetooth', latency: 150, approx: true },
  { key: 'megavox', label: 'Megavox', latency: 200, approx: true },
];

export function BluetoothPanel({
  audioLatency,
  setAudioLatency,
  isCalibrating,
  calibrationTapCount,
  startCalibration,
  stopCalibration,
  calibrationTap,
}: BluetoothPanelProps) {
  // Determine which preset is active based on current latency
  const activePreset = PRESETS.find(p => p.latency === audioLatency)?.key || 'custom';

  return (
    <View style={styles.container}>
      {/* Device Preset */}
      <View style={styles.section}>
        <Text style={styles.label}>OUTPUT DEVICE</Text>
        <View style={styles.presetGrid}>
          {PRESETS.map((preset) => {
            const isActive = activePreset === preset.key;
            const latencyLabel = preset.latency === 0
              ? 'No delay'
              : `${preset.approx ? '~' : ''}${preset.latency} ms`;
            return (
              <Pressable
                key={preset.key}
                style={[styles.presetCard, isActive && styles.presetCardActive]}
                onPress={() => setAudioLatency(preset.latency)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${preset.label}, ${latencyLabel}`}
              >
                <Text style={[styles.presetLabel, isActive && styles.presetLabelActive]}>
                  {preset.label}
                </Text>
                <View style={styles.presetLatencyRow}>
                  {preset.approx && (
                    <Text style={[styles.presetApprox, isActive && styles.presetDescActive]}>~</Text>
                  )}
                  <Text style={[styles.presetLatencyValue, isActive && styles.presetLatencyValueActive]}>
                    {preset.latency}
                  </Text>
                  <Text style={[styles.presetLatencyUnit, isActive && styles.presetDescActive]}>
                    ms
                  </Text>
                </View>
              </Pressable>
            );
          })}
          {/* Custom preset card */}
          <Pressable
            style={[styles.presetCard, activePreset === 'custom' && styles.presetCardActive]}
            onPress={() => {}} // No action - just shows when custom value is set
            accessibilityRole="button"
            accessibilityState={{ selected: activePreset === 'custom' }}
            accessibilityLabel={`Custom, ${audioLatency} milliseconds`}
          >
            <Text style={[styles.presetLabel, activePreset === 'custom' && styles.presetLabelActive]}>
              Custom
            </Text>
            <Text style={[styles.presetDesc, activePreset === 'custom' && styles.presetDescActive]}>
              Manual
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Latency slider */}
      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={styles.label}>LATENCY COMPENSATION</Text>
          <View style={styles.sliderValueContainer}>
            <Text style={styles.sliderValue}>{audioLatency}</Text>
            <Text style={styles.sliderValueUnit}>ms</Text>
          </View>
        </View>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={500}
            step={10}
            value={audioLatency}
            onValueChange={setAudioLatency}
            minimumTrackTintColor={colors.accent.primary}
            maximumTrackTintColor={colors.border.medium}
            thumbTintColor={colors.text.primary}
            accessibilityLabel={`Latency compensation ${audioLatency} milliseconds`}
          />
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>0ms</Text>
          <Text style={styles.sliderLabel}>250ms</Text>
          <Text style={styles.sliderLabel}>500ms</Text>
        </View>
      </View>

      {/* Calibration */}
      <View style={styles.section}>
        <Text style={styles.label}>AUTO-CALIBRATE</Text>
        {isCalibrating ? (
          <View style={styles.calibrationActive}>
            <Text style={styles.calibrationText}>
              Tap when you HEAR the beat
            </Text>
            <Text style={styles.calibrationStep}>
              {calibrationTapCount} of 8 taps
            </Text>
            <View style={styles.calibrationProgress}>
              <View
                style={[
                  styles.calibrationBar,
                  { width: `${(calibrationTapCount / 8) * 100}%` },
                ]}
              />
            </View>
            <Pressable
              style={styles.tapArea}
              onPress={calibrationTap}
              accessibilityRole="button"
              accessibilityLabel="Tap when you hear the beat"
            >
              <Text style={styles.tapAreaText}>TAP HERE</Text>
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={() => stopCalibration(false)}
              accessibilityRole="button"
              accessibilityLabel="Cancel calibration"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.calibrateButton}
            onPress={startCalibration}
            accessibilityRole="button"
            accessibilityLabel="Start automatic latency calibration"
          >
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
    gap: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  label: {
    ...font.label,
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
    letterSpacing: 1.5,
  },

  // Presets - improved grid with larger touch targets
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  presetCard: {
    width: '47%',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  presetCardActive: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.primary,
    borderWidth: 2,
  },
  presetLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  presetLabelActive: {
    color: colors.accent.primary,
  },
  presetDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.disabled,
    textAlign: 'center',
  },
  presetDescActive: {
    color: colors.accent.dim,
  },
  // Latency display in preset cards
  presetLatencyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  presetApprox: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.text.disabled,
    marginRight: 1,
  },
  presetLatencyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.disabled,
    fontVariant: ['tabular-nums'],
  },
  presetLatencyValueActive: {
    color: colors.accent.primary,
  },
  presetLatencyUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text.disabled,
    marginLeft: 2,
  },

  // Slider - consistent with SettingsDrawer
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sliderValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 60,
    justifyContent: 'flex-end',
  },
  sliderValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent.primary,
    fontVariant: ['tabular-nums'],
  },
  sliderValueUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent.dim,
    marginLeft: 2,
  },
  sliderContainer: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  slider: {
    height: 44,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.disabled,
    fontVariant: ['tabular-nums'],
  },

  // Calibration - more prominent design
  calibrationActive: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  calibrationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  calibrationStep: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent.primary,
    marginBottom: spacing.lg,
  },
  calibrationProgress: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border.subtle,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  calibrationBar: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 3,
  },
  tapArea: {
    backgroundColor: colors.accent.subtle,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
  },
  tapAreaText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent.primary,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  calibrateButton: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.medium,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    minHeight: 72,
    justifyContent: 'center',
  },
  calibrateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent.primary,
    marginBottom: 4,
  },
  calibrateButtonDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Info box - refined styling
  infoBox: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.dim,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text.tertiary,
    lineHeight: 20,
  },
});
