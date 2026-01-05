import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';

import { useMetronome } from '../hooks/useMetronome';
import { colors, font, spacing } from '../constants/theme';
import { SettingsDrawer } from '../components/SettingsDrawer';
import { BeatIndicator } from '../components/BeatIndicator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function MainScreen() {
  const {
    tempo,
    beats,
    isPlaying,
    currentBeat,
    soundType,
    subdivision,
    volume,
    accentPattern,
    countInEnabled,
    isCountingIn,
    muteAudio,
    isAccented,
    toggle,
    setTempo,
    setBeats,
    setSoundType,
    setSubdivision,
    setVolume,
    setAccentPattern,
    setCountInEnabled,
    setMuteAudio,
    tapTempo,
  } = useMetronome();

  useKeepAwake();

  const [showSettings, setShowSettings] = useState(false);

  // Animated values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation on beat
  React.useEffect(() => {
    if (isPlaying && currentBeat > 0) {
      // Quick pulse
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow on downbeat
      if (currentBeat === 1) {
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [currentBeat, isPlaying, pulseAnim, glowAnim]);

  // Gesture handling for tempo
  const lastY = useRef(0);
  const startTempo = useRef(tempo);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dy) > 15 && Math.abs(gs.dy) > Math.abs(gs.dx) * 1.5,
        onPanResponderGrant: () => {
          startTempo.current = tempo;
          lastY.current = 0;
        },
        onPanResponderMove: (_, gs) => {
          const delta = Math.round((lastY.current - gs.dy) * 0.3);
          if (delta !== 0) {
            setTempo(startTempo.current + Math.round(-gs.dy * 0.4));
          }
        },
      }),
    [tempo, setTempo]
  );

  // Count-in display
  const displayTempo = isCountingIn ? Math.abs(currentBeat) : tempo;
  const isDownbeat = currentBeat === 1 && isPlaying;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Subtle glow effect on downbeat */}
      <Animated.View
        style={[
          styles.glowOverlay,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.15],
            }),
          },
        ]}
      />

      <SafeAreaView style={styles.safe} {...panResponder.panHandlers}>
        {/* Minimal header */}
        <View style={styles.header}>
          <Text style={styles.brandMark}>TEMPO</Text>
          <Pressable
            onPress={() => setShowSettings(true)}
            style={({ pressed }) => [
              styles.menuButton,
              pressed && styles.pressed,
            ]}
            hitSlop={20}
          >
            <View style={styles.menuIcon}>
              <View style={styles.menuLine} />
              <View style={[styles.menuLine, styles.menuLineShort]} />
            </View>
          </Pressable>
        </View>

        {/* Main tempo display */}
        <View style={styles.tempoSection}>
          <Animated.View
            style={[
              styles.tempoContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Pressable onPress={toggle} onLongPress={tapTempo}>
              <Text
                style={[
                  styles.tempoNumber,
                  isPlaying && styles.tempoNumberActive,
                  isCountingIn && styles.tempoNumberCountIn,
                ]}
              >
                {displayTempo}
              </Text>
            </Pressable>
          </Animated.View>

          <Text style={styles.bpmLabel}>
            {isCountingIn ? 'COUNT IN' : 'BPM'}
          </Text>

          {/* Subtle tempo adjustment hint */}
          <Text style={styles.hint}>swipe to adjust · tap to play · hold for tap tempo</Text>
        </View>

        {/* Beat indicators */}
        <View style={styles.beatSection}>
          <View style={styles.beatRow}>
            {Array.from({ length: beats }).map((_, i) => (
              <BeatIndicator
                key={i}
                index={i}
                isActive={currentBeat === i + 1 && isPlaying}
                isAccent={isAccented(i + 1)}
                isPlaying={isPlaying}
              />
            ))}
          </View>

          <Text style={styles.timeSignature}>{beats}/4</Text>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [
              styles.quickButton,
              pressed && styles.pressed,
            ]}
            onPress={() => setTempo(tempo - 1)}
          >
            <Text style={styles.quickButtonText}>−</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.playButton,
              isPlaying && styles.playButtonActive,
              pressed && styles.pressed,
            ]}
            onPress={toggle}
          >
            <View style={isPlaying ? styles.stopIcon : styles.playIcon} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickButton,
              pressed && styles.pressed,
            ]}
            onPress={() => setTempo(tempo + 1)}
          >
            <Text style={styles.quickButtonText}>+</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Settings drawer */}
      <SettingsDrawer
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        tempo={tempo}
        setTempo={setTempo}
        beats={beats}
        setBeats={setBeats}
        subdivision={subdivision}
        setSubdivision={setSubdivision}
        soundType={soundType}
        setSoundType={setSoundType}
        volume={volume}
        setVolume={setVolume}
        accentPattern={accentPattern}
        setAccentPattern={setAccentPattern}
        countInEnabled={countInEnabled}
        setCountInEnabled={setCountInEnabled}
        muteAudio={muteAudio}
        setMuteAudio={setMuteAudio}
        tapTempo={tapTempo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accent.primary,
  },
  safe: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  brandMark: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.tertiary,
    letterSpacing: 3,
  },
  menuButton: {
    padding: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  menuIcon: {
    width: 20,
    gap: 5,
  },
  menuLine: {
    height: 2,
    backgroundColor: colors.text.tertiary,
    borderRadius: 1,
  },
  menuLineShort: {
    width: 14,
  },

  // Tempo section
  tempoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  tempoContainer: {
    alignItems: 'center',
  },
  tempoNumber: {
    fontSize: font.tempo.fontSize,
    fontWeight: font.tempo.fontWeight,
    letterSpacing: font.tempo.letterSpacing,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  tempoNumberActive: {
    color: colors.accent.primary,
  },
  tempoNumberCountIn: {
    color: colors.success,
  },
  bpmLabel: {
    fontSize: font.label.fontSize,
    fontWeight: font.label.fontWeight,
    letterSpacing: font.label.letterSpacing,
    color: colors.text.tertiary,
    marginTop: -spacing.md,
  },
  hint: {
    fontSize: font.caption.fontSize,
    color: colors.text.disabled,
    marginTop: spacing.xl,
    letterSpacing: 0.3,
  },

  // Beat section
  beatSection: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  beatRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeSignature: {
    fontSize: font.label.fontSize,
    fontWeight: font.label.fontWeight,
    color: colors.text.disabled,
    marginTop: spacing.md,
    letterSpacing: 1,
  },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  quickButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  quickButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.text.secondary,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  playButtonActive: {
    backgroundColor: colors.active.glow,
    borderColor: colors.active.primary,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 24,
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderLeftColor: colors.text.primary,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 6,
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: colors.text.primary,
    borderRadius: 4,
  },
});
