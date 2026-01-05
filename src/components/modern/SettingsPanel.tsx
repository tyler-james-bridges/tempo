import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { GlassPill } from './GlassPill';
import { SoundType, SubdivisionType, AccentPattern } from '../../hooks/useMetronome';

interface SettingsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  soundType: SoundType;
  setSoundType: (type: SoundType) => void;
  subdivision: SubdivisionType;
  setSubdivision: (sub: SubdivisionType) => void;
  accentPattern: AccentPattern;
  setAccentPattern: (pattern: AccentPattern) => void;
  volume: number;
  setVolume: (vol: number) => void;
  beats: number;
  setBeats: (beats: number) => void;
  countInEnabled: boolean;
  setCountInEnabled: (enabled: boolean) => void;
  muteAudio: boolean;
  setMuteAudio: (muted: boolean) => void;
  // Bluetooth latency compensation
  audioLatency: number;
  setAudioLatency: (latency: number) => void;
  isCalibrating: boolean;
  startCalibration: () => void;
  stopCalibration: (applyResult?: boolean) => void;
  calibrationTap: () => void;
  getCalibrationResult: () => number | null;
}

const SOUND_OPTIONS: { type: SoundType; label: string; icon: string }[] = [
  { type: 'click', label: 'Click', icon: '' },
  { type: 'beep', label: 'Beep', icon: '' },
  { type: 'wood', label: 'Wood', icon: '' },
  { type: 'cowbell', label: 'Bell', icon: '' },
];

const SUBDIVISION_OPTIONS: { type: SubdivisionType; label: string; accessibilityLabel: string }[] = [
  { type: 1, label: 'Quarter', accessibilityLabel: 'Quarter notes - 1 per beat' },
  { type: 2, label: 'Eighth', accessibilityLabel: 'Eighth notes - 2 per beat' },
  { type: 3, label: 'Triplet', accessibilityLabel: 'Triplets - 3 per beat' },
  { type: 4, label: '16th', accessibilityLabel: 'Sixteenth notes - 4 per beat' },
];

const ACCENT_OPTIONS: { type: AccentPattern; label: string }[] = [
  { type: 0, label: 'First' },
  { type: 1, label: 'All' },
  { type: 2, label: 'Every 2' },
  { type: 3, label: 'Every 3' },
  { type: 4, label: 'Every 4' },
];

export function SettingsPanel({
  isVisible,
  onClose,
  soundType,
  setSoundType,
  subdivision,
  setSubdivision,
  accentPattern,
  setAccentPattern,
  volume,
  setVolume,
  beats,
  setBeats,
  countInEnabled,
  setCountInEnabled,
  muteAudio,
  setMuteAudio,
  audioLatency,
  setAudioLatency,
  isCalibrating,
  startCalibration,
  stopCalibration,
  calibrationTap,
  getCalibrationResult,
}: SettingsPanelProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isVisible ? 1 : 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [isVisible, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Panel */}
      <Animated.View style={[styles.panel, { transform: [{ translateY }] }]}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Beats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time Signature</Text>
            <View style={styles.optionRow}>
              {[2, 3, 4, 5, 6, 7, 8, 9].map((b) => (
                <GlassPill
                  key={b}
                  label={`${b}/4`}
                  isActive={beats === b}
                  onPress={() => setBeats(b)}
                  accentColor="#E5AE5C"
                  size="small"
                />
              ))}
            </View>
          </View>

          {/* Sound */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sound</Text>
            <View style={styles.optionRow}>
              {SOUND_OPTIONS.map((option) => (
                <GlassPill
                  key={option.type}
                  label={option.label}
                  isActive={soundType === option.type}
                  onPress={() => setSoundType(option.type)}
                  accentColor="#FFB347"
                />
              ))}
            </View>
          </View>

          {/* Subdivision */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subdivision</Text>
            <View style={styles.optionRow}>
              {SUBDIVISION_OPTIONS.map((option) => (
                <GlassPill
                  key={option.type}
                  label={option.label}
                  isActive={subdivision === option.type}
                  onPress={() => setSubdivision(option.type)}
                  accentColor="#D4A574"
                />
              ))}
            </View>
          </View>

          {/* Accent */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accent Pattern</Text>
            <View style={styles.optionRow}>
              {ACCENT_OPTIONS.map((option) => (
                <GlassPill
                  key={option.type}
                  label={option.label}
                  isActive={accentPattern === option.type}
                  onPress={() => setAccentPattern(option.type)}
                  accentColor="#F59E0B"
                  size="small"
                />
              ))}
            </View>
          </View>

          {/* Count-in */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Count-in</Text>
            <View style={styles.optionRow}>
              <GlassPill
                label="Off"
                isActive={!countInEnabled}
                onPress={() => setCountInEnabled(false)}
                accentColor="#9CA3AF"
              />
              <GlassPill
                label="1 Bar"
                isActive={countInEnabled}
                onPress={() => setCountInEnabled(true)}
                accentColor="#10B981"
              />
            </View>
          </View>

          {/* Silent Mode */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audio</Text>
            <View style={styles.optionRow}>
              <GlassPill
                label="Sound On"
                isActive={!muteAudio}
                onPress={() => setMuteAudio(false)}
                accentColor="#3B82F6"
              />
              <GlassPill
                label="Silent Mode"
                isActive={muteAudio}
                onPress={() => setMuteAudio(true)}
                accentColor="#8B5CF6"
              />
            </View>
            {muteAudio && (
              <Text style={styles.modeHint}>Visual beat indicator only - no sound</Text>
            )}
          </View>

          {/* Volume */}
          <View style={styles.section}>
            <View style={styles.volumeHeader}>
              <Text style={styles.sectionTitle}>Volume</Text>
              <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
            </View>
            <View style={styles.volumeSliderContainer}>
              <Slider
                style={styles.volumeSlider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onValueChange={setVolume}
                minimumTrackTintColor="#FFB347"
                maximumTrackTintColor="rgba(255,255,255,0.1)"
                thumbTintColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Bluetooth Latency Compensation */}
          <View style={styles.section}>
            <View style={styles.volumeHeader}>
              <Text style={styles.sectionTitle}>Bluetooth Latency</Text>
              <Text style={styles.latencyValue}>{audioLatency}ms</Text>
            </View>
            <Text style={styles.latencyHint}>
              Compensate for Bluetooth speaker delay. Use calibration for best accuracy.
            </Text>

            {isCalibrating ? (
              <View style={styles.calibrationContainer}>
                <Text style={styles.calibrationTitle}>Tap when you HEAR the beat</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.calibrationTapButton,
                    pressed && styles.calibrationTapButtonPressed,
                  ]}
                  onPress={calibrationTap}
                >
                  <Text style={styles.calibrationTapText}>TAP</Text>
                </Pressable>
                <Text style={styles.calibrationProgress}>
                  {getCalibrationResult() !== null
                    ? `Measured: ${getCalibrationResult()}ms`
                    : 'Tap at least 4 times...'}
                </Text>
                <View style={styles.calibrationButtons}>
                  <Pressable
                    style={styles.calibrationCancelButton}
                    onPress={() => stopCalibration(false)}
                  >
                    <Text style={styles.calibrationCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.calibrationApplyButton,
                      getCalibrationResult() === null && styles.calibrationButtonDisabled,
                    ]}
                    onPress={() => stopCalibration(true)}
                    disabled={getCalibrationResult() === null}
                  >
                    <Text style={styles.calibrationApplyText}>Apply</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.volumeSliderContainer}>
                  <Slider
                    style={styles.volumeSlider}
                    minimumValue={0}
                    maximumValue={500}
                    step={10}
                    value={audioLatency}
                    onValueChange={setAudioLatency}
                    minimumTrackTintColor="#3B82F6"
                    maximumTrackTintColor="rgba(255,255,255,0.1)"
                    thumbTintColor="#FFFFFF"
                  />
                </View>
                <View style={styles.latencyPresets}>
                  <GlassPill
                    label="0ms"
                    isActive={audioLatency === 0}
                    onPress={() => setAudioLatency(0)}
                    accentColor="#9CA3AF"
                    size="small"
                  />
                  <GlassPill
                    label="100ms"
                    isActive={audioLatency === 100}
                    onPress={() => setAudioLatency(100)}
                    accentColor="#3B82F6"
                    size="small"
                  />
                  <GlassPill
                    label="200ms"
                    isActive={audioLatency === 200}
                    onPress={() => setAudioLatency(200)}
                    accentColor="#3B82F6"
                    size="small"
                  />
                  <GlassPill
                    label="300ms"
                    isActive={audioLatency === 300}
                    onPress={() => setAudioLatency(300)}
                    accentColor="#3B82F6"
                    size="small"
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.calibrateButton,
                    pressed && styles.calibrateButtonPressed,
                  ]}
                  onPress={startCalibration}
                >
                  <Text style={styles.calibrateButtonText}>Auto-Calibrate</Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Spacer for safe area */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  panel: {
    backgroundColor: '#12100D', // warm dark background
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderColor: 'rgba(255,179,71,0.15)',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFB347', // warm gold
  },
  volumeSliderContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
  },
  volumeSlider: {
    height: 40,
  },
  modeHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Bluetooth Latency styles
  latencyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  latencyHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
    lineHeight: 16,
  },
  latencyPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  calibrateButton: {
    marginTop: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  calibrateButtonPressed: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  calibrateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
  calibrationContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  calibrationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  calibrationTapButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  calibrationTapButtonPressed: {
    backgroundColor: '#2563EB',
    transform: [{ scale: 0.95 }],
  },
  calibrationTapText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  calibrationProgress: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
    textAlign: 'center',
  },
  calibrationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  calibrationCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  calibrationCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  calibrationApplyButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  calibrationButtonDisabled: {
    opacity: 0.4,
  },
  calibrationApplyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
