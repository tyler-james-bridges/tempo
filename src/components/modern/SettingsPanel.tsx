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
}

const SOUND_OPTIONS: { type: SoundType; label: string; icon: string }[] = [
  { type: 'click', label: 'Click', icon: '' },
  { type: 'beep', label: 'Beep', icon: '' },
  { type: 'wood', label: 'Wood', icon: '' },
  { type: 'cowbell', label: 'Bell', icon: '' },
];

const SUBDIVISION_OPTIONS: { type: SubdivisionType; label: string }[] = [
  { type: 1, label: '1/4' },
  { type: 2, label: '1/8' },
  { type: 3, label: 'Triplet' },
  { type: 4, label: '1/16' },
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

          {/* Visual Only Mode */}
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
                label="Visual Only"
                isActive={muteAudio}
                onPress={() => setMuteAudio(true)}
                accentColor="#8B5CF6"
              />
            </View>
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
});
