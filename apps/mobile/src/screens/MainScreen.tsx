import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useMetronome } from '../hooks/useMetronome';
import { useSyncedShow } from '../hooks/useSyncedShow';
import { colors, font, spacing, SUBDIVISIONS } from '../constants/theme';
import { SettingsDrawer } from '../components/SettingsDrawer';
import { ScoreBar } from '../components/ScoreBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = Math.min(SCREEN_WIDTH * 0.65, 280);

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
    countInBeats,
    isCountingIn,
    muteAudio,
    audioLatency,
    isCalibrating,
    calibrationTapCount,
    isAccented,
    toggle,
    setTempo,
    setBeats,
    setSoundType,
    setSubdivision,
    setVolume,
    setAccentPattern,
    setCountInEnabled,
    setCountInBeats,
    setMuteAudio,
    setAudioLatency,
    startCalibration,
    stopCalibration,
    calibrationTap,
    getCalibrationResult,
  } = useMetronome();

  const showManager = useSyncedShow();

  // Handle selecting a part from ScoreBar
  const handleSelectPart = useCallback((part: { id: string; tempo: number; beats: number }) => {
    showManager.setActivePart(part.id);
    setTempo(part.tempo);
    setBeats(part.beats);
  }, [showManager, setTempo, setBeats]);

  useKeepAwake();

  const [showSettings, setShowSettings] = useState(false);

  // Animated values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const ringRotation = useRef(new Animated.Value(0)).current;
  const beatPulseAnims = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  ).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Continuous ring rotation when playing
  useEffect(() => {
    if (isPlaying) {
      const duration = (60 / tempo) * beats * 1000;
      const animation = Animated.loop(
        Animated.timing(ringRotation, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    } else {
      ringRotation.setValue(0);
    }
  }, [isPlaying, tempo, beats, ringRotation]);

  // Wave animation for visual interest
  useEffect(() => {
    if (isPlaying) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isPlaying, waveAnim]);

  // Pulse animation on beat
  useEffect(() => {
    if (isPlaying && currentBeat > 0) {
      // Pulse the tempo number
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate the specific beat indicator
      const beatIndex = currentBeat - 1;
      if (beatIndex >= 0 && beatIndex < beatPulseAnims.length) {
        Animated.sequence([
          Animated.timing(beatPulseAnims[beatIndex], {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(beatPulseAnims[beatIndex], {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }

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
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [currentBeat, isPlaying, pulseAnim, glowAnim, beatPulseAnims]);

  // High-performance gesture handling for tempo using react-native-gesture-handler
  // This runs on the native UI thread for instant responsiveness
  const startTempoRef = useRef(tempo);
  const lastTempoRef = useRef(tempo);

  // Keep refs in sync with latest tempo value
  useEffect(() => {
    lastTempoRef.current = tempo;
  }, [tempo]);

  const panGesture = Gesture.Pan()
    // Near-zero threshold for instant response
    .activeOffsetY([-2, 2])
    // Fail if horizontal swipe to avoid conflicts
    .failOffsetX([-20, 20])
    .onStart(() => {
      startTempoRef.current = lastTempoRef.current;
    })
    .onUpdate((event) => {
      // High sensitivity: 0.8 means ~0.8 BPM per pixel of movement
      // Velocity boost: faster swipes get even more responsive
      const velocityBoost = Math.min(Math.abs(event.velocityY) / 1000, 2);
      const sensitivity = 0.8 + velocityBoost * 0.4;

      // Negative because swipe up should increase tempo
      const delta = -event.translationY * sensitivity;
      const newTempo = Math.round(startTempoRef.current + delta);

      // Clamp to valid range and only update if changed
      const clampedTempo = Math.max(30, Math.min(300, newTempo));
      if (clampedTempo !== lastTempoRef.current) {
        lastTempoRef.current = clampedTempo;
        setTempo(clampedTempo);
      }
    })
    .minDistance(0)
    .minPointers(1)
    .maxPointers(1);

  // Cycle subdivision
  const cycleSubdivision = useCallback(() => {
    const nextSub = subdivision === 4 ? 1 : (subdivision + 1) as 1 | 2 | 3 | 4;
    setSubdivision(nextSub);
  }, [subdivision, setSubdivision]);

  // Cycle time signature
  const cycleTimeSignature = useCallback(() => {
    const nextBeats = beats >= 7 ? 2 : beats + 1;
    setBeats(nextBeats);
  }, [beats, setBeats]);

  // Count-in display
  const displayTempo = isCountingIn ? Math.abs(currentBeat) : tempo;

  // Get current subdivision info
  const currentSubInfo = SUBDIVISIONS.find(s => s.value === subdivision) || SUBDIVISIONS[0];

  // Ring rotation interpolation
  const ringRotationDeg = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Subtle downbeat glow overlay */}
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

      <GestureDetector gesture={panGesture}>
        <SafeAreaView style={styles.safe}>
          {/* Minimal Header */}
          <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.brandMark}>TEMPO</Text>
            <View style={[styles.statusDot, isPlaying && styles.statusDotActive]} />
          </View>
          <Pressable
            onPress={() => setShowSettings(true)}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.pressed,
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Open settings"
            accessibilityRole="button"
          >
            <View style={styles.settingsIcon}>
              <View style={styles.settingsLine} />
              <View style={[styles.settingsLine, styles.settingsLineShort]} />
              <View style={styles.settingsLine} />
            </View>
          </Pressable>
        </View>

        {/* Score Bar - Part Navigation */}
        {showManager.hasShow && (
          <ScoreBar
            showName={showManager.show.name}
            parts={showManager.show.parts}
            activePartId={showManager.show.activePartId}
            onSelectPart={handleSelectPart}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {/* Main Tempo Display - Hero Section */}
        <View style={styles.heroSection}>
          {/* Outer rotating ring */}
          <Animated.View
            style={[
              styles.outerRing,
              {
                transform: [{ rotate: ringRotationDeg }],
                opacity: isPlaying ? 0.8 : 0.2,
              },
            ]}
          >
            <View style={styles.ringMarker} />
          </Animated.View>

          {/* Beat indicators around the ring */}
          <View style={styles.beatRing}>
            {Array.from({ length: beats }).map((_, i) => {
              const angle = (i / beats) * 2 * Math.PI - Math.PI / 2;
              const x = Math.cos(angle) * (RING_SIZE / 2 - 16);
              const y = Math.sin(angle) * (RING_SIZE / 2 - 16);
              const isActive = currentBeat === i + 1 && isPlaying;
              const isAccentBeat = isAccented(i + 1);

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.ringBeat,
                    {
                      transform: [
                        { translateX: x },
                        { translateY: y },
                        {
                          scale: beatPulseAnims[i].interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.4],
                          }),
                        },
                      ],
                    },
                    isActive && styles.ringBeatActive,
                    isAccentBeat && styles.ringBeatAccent,
                  ]}
                />
              );
            })}
          </View>

          {/* Center tempo display - tappable */}
          <Pressable
            onPress={toggle}
            style={({ pressed }) => [
              styles.tempoTouchArea,
              pressed && styles.tempoTouchAreaPressed,
            ]}
            accessibilityLabel={isPlaying ? 'Stop metronome' : 'Start metronome'}
            accessibilityRole="button"
          >
            <Animated.View
              style={[
                styles.tempoContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text
                style={[
                  styles.tempoNumber,
                  isPlaying && styles.tempoNumberActive,
                  isCountingIn && styles.tempoNumberCountIn,
                ]}
              >
                {displayTempo}
              </Text>
              <Text style={styles.bpmLabel}>
                {isCountingIn ? 'COUNT IN' : 'BPM'}
              </Text>
            </Animated.View>
          </Pressable>
        </View>

        {/* Quick Settings Row */}
        <View style={styles.quickSettings}>
          <Pressable
            onPress={cycleTimeSignature}
            style={({ pressed }) => [
              styles.quickSettingButton,
              pressed && styles.pressed,
            ]}
            accessibilityLabel={`Time signature ${beats}/4, tap to change`}
            accessibilityRole="button"
          >
            <Text style={styles.quickSettingValue}>{beats}/4</Text>
            <Text style={styles.quickSettingLabel}>TIME</Text>
          </Pressable>

          <Pressable
            onPress={cycleSubdivision}
            style={({ pressed }) => [
              styles.quickSettingButton,
              styles.quickSettingButtonAccent,
              pressed && styles.pressed,
            ]}
            accessibilityLabel={`Subdivision ${currentSubInfo.name}, tap to change`}
            accessibilityRole="button"
          >
            <Text style={styles.quickSettingValueAccent}>{currentSubInfo.name}</Text>
            <Text style={styles.quickSettingLabelAccent}>DIVISION</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowSettings(true)}
            style={({ pressed }) => [
              styles.quickSettingButton,
              pressed && styles.pressed,
            ]}
            accessibilityLabel={`Sound type ${soundType}, tap to change`}
            accessibilityRole="button"
          >
            <Text style={styles.quickSettingValue}>{soundType.toUpperCase()}</Text>
            <Text style={styles.quickSettingLabel}>SOUND</Text>
          </Pressable>
        </View>

        {/* Bottom Controls - Simplified and Properly Spaced */}
        <View style={styles.controlsContainer}>
          {/* Tempo adjustment row with half/double time */}
          <View style={styles.tempoAdjustRow}>
            <Pressable
              onPress={() => setTempo(Math.round(tempo / 2))}
              style={({ pressed }) => [
                styles.tempoAdjustButton,
                styles.tempoMultiplierButton,
                pressed && styles.tempoAdjustButtonPressed,
              ]}
              accessibilityLabel="Half time - halve tempo"
              accessibilityRole="button"
            >
              <Text style={styles.tempoMultiplierText}>½×</Text>
            </Pressable>

            <Pressable
              onPress={() => setTempo(tempo - 1)}
              style={({ pressed }) => [
                styles.tempoAdjustButton,
                pressed && styles.tempoAdjustButtonPressed,
              ]}
              accessibilityLabel="Decrease tempo by 1"
              accessibilityRole="button"
            >
              <Text style={styles.tempoAdjustText}>−</Text>
            </Pressable>

            <Pressable
              onPress={() => setTempo(tempo + 1)}
              style={({ pressed }) => [
                styles.tempoAdjustButton,
                pressed && styles.tempoAdjustButtonPressed,
              ]}
              accessibilityLabel="Increase tempo by 1"
              accessibilityRole="button"
            >
              <Text style={styles.tempoAdjustText}>+</Text>
            </Pressable>

            <Pressable
              onPress={() => setTempo(tempo * 2)}
              style={({ pressed }) => [
                styles.tempoAdjustButton,
                styles.tempoMultiplierButton,
                pressed && styles.tempoAdjustButtonPressed,
              ]}
              accessibilityLabel="Double time - double tempo"
              accessibilityRole="button"
            >
              <Text style={styles.tempoMultiplierText}>2×</Text>
            </Pressable>
          </View>

          {/* Main action row */}
          <View style={styles.mainActionRow}>
            <Pressable
              onPress={() => setCountInEnabled(!countInEnabled)}
              style={({ pressed }) => [
                styles.secondaryButton,
                countInEnabled && styles.secondaryButtonActive,
                pressed && styles.pressed,
              ]}
              accessibilityLabel={countInEnabled ? 'Count-in enabled, tap to disable' : 'Count-in disabled, tap to enable'}
              accessibilityRole="button"
            >
              <Text style={[
                styles.secondaryButtonText,
                countInEnabled && styles.secondaryButtonTextActive,
              ]}>
                COUNT-IN
              </Text>
            </Pressable>

            {/* Main Play/Stop Button */}
            <Pressable
              onPress={toggle}
              style={({ pressed }) => [
                styles.playButton,
                isPlaying && styles.playButtonActive,
                pressed && styles.playButtonPressed,
              ]}
              accessibilityLabel={isPlaying ? 'Stop' : 'Play'}
              accessibilityRole="button"
            >
              <View style={isPlaying ? styles.stopIcon : styles.playIcon} />
            </Pressable>

            <Pressable
              onPress={() => setShowSettings(true)}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="More settings"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>MORE</Text>
            </Pressable>
          </View>
        </View>

          {/* Subtle hint */}
          <Text style={styles.hint}>Swipe up or down to adjust tempo</Text>
        </SafeAreaView>
      </GestureDetector>

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
        countInBeats={countInBeats}
        setCountInBeats={setCountInBeats}
        muteAudio={muteAudio}
        setMuteAudio={setMuteAudio}
        audioLatency={audioLatency}
        setAudioLatency={setAudioLatency}
        isCalibrating={isCalibrating}
        calibrationTapCount={calibrationTapCount}
        startCalibration={startCalibration}
        stopCalibration={stopCalibration}
        calibrationTap={calibrationTap}
        getCalibrationResult={getCalibrationResult}
        showManager={showManager}
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
    backgroundColor: colors.active.primary,
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.7,
  },

  // Header - Minimal
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.disabled,
  },
  statusDotActive: {
    backgroundColor: colors.active.primary,
    shadowColor: colors.active.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 20,
    gap: 4,
  },
  settingsLine: {
    height: 2,
    backgroundColor: colors.text.tertiary,
    borderRadius: 1,
  },
  settingsLineShort: {
    width: 12,
  },

  // Hero Section - Tempo Display
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 320,
  },
  outerRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
  ringMarker: {
    position: 'absolute',
    top: -5,
    left: RING_SIZE / 2 - 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent.primary,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  beatRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringBeat: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.beat.inactive,
  },
  ringBeatActive: {
    backgroundColor: colors.accent.primary,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  ringBeatAccent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.beat.accent,
  },
  tempoTouchArea: {
    justifyContent: 'center',
    alignItems: 'center',
    width: RING_SIZE - 60,
    height: RING_SIZE - 60,
    borderRadius: (RING_SIZE - 60) / 2,
  },
  tempoTouchAreaPressed: {
    backgroundColor: colors.accent.subtle,
  },
  tempoContainer: {
    alignItems: 'center',
  },
  tempoNumber: {
    fontSize: 96,
    fontWeight: '200',
    letterSpacing: -4,
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
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    color: colors.text.disabled,
    marginTop: -4,
  },

  // Quick Settings Row
  quickSettings: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  quickSettingButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    minWidth: 80,
  },
  quickSettingButtonAccent: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.dim,
  },
  quickSettingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  quickSettingValueAccent: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  quickSettingLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.disabled,
    letterSpacing: 1,
    marginTop: 4,
  },
  quickSettingLabelAccent: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.accent.dim,
    letterSpacing: 1,
    marginTop: 4,
  },

  // Controls Container
  controlsContainer: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },

  // Tempo Adjustment Row
  tempoAdjustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  tempoAdjustButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  tempoAdjustButtonPressed: {
    backgroundColor: colors.bg.elevated,
    borderColor: colors.border.medium,
  },
  tempoAdjustText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tempoMultiplierButton: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.dim,
  },
  tempoMultiplierText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent.primary,
  },

  // Main Action Row
  mainActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  secondaryButton: {
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: 26,
    backgroundColor: colors.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    minWidth: 90,
  },
  secondaryButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  secondaryButtonTextActive: {
    color: colors.bg.primary,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  playButtonActive: {
    backgroundColor: colors.active.glow,
    borderColor: colors.active.primary,
    shadowColor: colors.active.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },
  playButtonPressed: {
    transform: [{ scale: 0.96 }],
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

  // Hint
  hint: {
    fontSize: 12,
    color: colors.text.disabled,
    textAlign: 'center',
    paddingVertical: spacing.lg,
    letterSpacing: 0.3,
  },
});
