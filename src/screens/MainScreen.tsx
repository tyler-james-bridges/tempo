import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';

import { useMetronome, SoundType, SubdivisionType, AccentPattern } from '../hooks/useMetronome';
import { BeatRing } from '../components/modern/BeatRing';
import { TempoDisplay } from '../components/modern/TempoDisplay';
import { GlassPill } from '../components/modern/GlassPill';
import { PlayPauseButton } from '../components/modern/PlayPauseButton';
import { SettingsPanel } from '../components/modern/SettingsPanel';
import { NumberPickerModal } from '../components/NumberPickerModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [showTempoPicker, setShowTempoPicker] = useState(false);

  const lastTempoRef = useRef(tempo);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        lastTempoRef.current = tempo;
      },
      onPanResponderMove: (_, gestureState) => {
        const sensitivity = 0.5;
        const delta = -gestureState.dy * sensitivity;
        const newTempo = Math.round(lastTempoRef.current + delta);
        setTempo(newTempo);
      },
    })
  ).current;

  const handleTapTempo = useCallback(() => {
    tapTempo();
  }, [tapTempo]);

  const shouldAccent = (beat: number) => {
    if (accentPattern === 0) return beat === 1;
    if (accentPattern === 1) return true;
    return (beat - 1) % accentPattern === 0;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Colored gradient orbs for depth */}
      <View style={styles.gradientOrb1} />
      <View style={styles.gradientOrb2} />
      <View style={styles.gradientOrb3} />

      <SafeAreaView style={styles.safeArea} {...panResponder.panHandlers}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Tempo</Text>
          <Pressable
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setShowSettings(true)}
          >
            <View style={styles.settingsIcon}>
              <View style={styles.settingsDot} />
              <View style={styles.settingsDot} />
              <View style={styles.settingsDot} />
            </View>
          </Pressable>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Beat Ring with colored glow */}
          <View style={styles.beatRingOuter}>
            {/* Ambient glow */}
            <View style={[
              styles.ambientGlow,
              isPlaying && styles.ambientGlowActive,
            ]} />

            {/* Ring track */}
            <View style={styles.ringTrack} />

            <View style={styles.beatRingContainer}>
              {Array.from({ length: beats }).map((_, i) => (
                <BeatRing
                  key={i}
                  beatNumber={i + 1}
                  totalBeats={beats}
                  isActive={currentBeat === i + 1}
                  isAccent={shouldAccent(i + 1)}
                  isPlaying={isPlaying}
                />
              ))}

              {isCountingIn ? (
                <View style={styles.countInContainer}>
                  <Text style={styles.countInNumber}>{Math.abs(currentBeat)}</Text>
                  <Text style={styles.countInLabel}>COUNT IN</Text>
                </View>
              ) : (
                <TempoDisplay
                  tempo={tempo}
                  isPlaying={isPlaying}
                  onPress={() => setShowTempoPicker(true)}
                />
              )}
            </View>
          </View>

          {/* Quick info pills */}
          <View style={styles.infoPills}>
            <Pressable
              style={({ pressed }) => [
                styles.infoPill,
                pressed && styles.infoPillPressed,
              ]}
              onPress={() => setShowSettings(true)}
            >
              <Text style={styles.infoPillText}>{beats}/4</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.infoPill,
                styles.infoPillAccent,
                pressed && styles.infoPillPressed,
              ]}
              onPress={() => setShowSettings(true)}
            >
              <Text style={[styles.infoPillText, styles.infoPillTextAccent]}>
                {subdivision === 1 ? '♩' : subdivision === 2 ? '♪♪' : subdivision === 3 ? '♪³' : '♬'}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.infoPill,
                pressed && styles.infoPillPressed,
              ]}
              onPress={() => setShowSettings(true)}
            >
              <Text style={styles.infoPillText}>
                {soundType.charAt(0).toUpperCase() + soundType.slice(1)}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Tempo adjustment buttons */}
          <View style={styles.tempoControls}>
            {[-5, -1, +1, +5].map((delta) => (
              <Pressable
                key={delta}
                style={({ pressed }) => [
                  styles.tempoAdjustButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => setTempo(tempo + delta)}
              >
                <Text style={styles.tempoAdjustText}>
                  {delta > 0 ? `+${delta}` : delta}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Main action buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.sideButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleTapTempo}
            >
              <Text style={styles.sideButtonText}>TAP</Text>
            </Pressable>

            <PlayPauseButton
              isPlaying={isPlaying}
              onPress={toggle}
              size={88}
            />

            <Pressable
              style={({ pressed }) => [
                styles.sideButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setShowSettings(true)}
            >
              <Text style={styles.sideButtonText}>EDIT</Text>
            </Pressable>
          </View>

          <Text style={styles.swipeHint}>Swipe up/down to adjust tempo</Text>
        </View>
      </SafeAreaView>

      <SettingsPanel
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
        soundType={soundType}
        setSoundType={setSoundType}
        subdivision={subdivision}
        setSubdivision={setSubdivision}
        accentPattern={accentPattern}
        setAccentPattern={setAccentPattern}
        volume={volume}
        setVolume={setVolume}
        beats={beats}
        setBeats={setBeats}
        countInEnabled={countInEnabled}
        setCountInEnabled={setCountInEnabled}
        muteAudio={muteAudio}
        setMuteAudio={setMuteAudio}
      />

      <NumberPickerModal
        visible={showTempoPicker}
        title="Set Tempo"
        value={tempo}
        min={30}
        max={250}
        onSelect={(val) => val !== null && setTempo(val)}
        onClose={() => setShowTempoPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
  // Warm gradient orbs - musician-friendly amber/gold tones
  gradientOrb1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#1a1408', // warm brown
  },
  gradientOrb2: {
    position: 'absolute',
    top: '40%',
    right: -150,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#1a0f08', // deep amber
  },
  gradientOrb3: {
    position: 'absolute',
    bottom: -50,
    left: '20%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#0f0d0a', // warm charcoal
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  buttonPressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    transform: [{ scale: 0.96 }],
  },
  settingsIcon: {
    flexDirection: 'row',
    gap: 5,
  },
  settingsDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  beatRingOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 300,
  },
  ambientGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#FFB347', // warm gold
    opacity: 0.04,
  },
  ambientGlowActive: {
    opacity: 0.15,
    shadowColor: '#FFB347',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
  },
  ringTrack: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  beatRingContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  infoPills: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 48,
  },
  infoPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoPillAccent: {
    backgroundColor: 'rgba(255,179,71,0.12)',
    borderColor: 'rgba(255,179,71,0.3)',
  },
  infoPillPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  infoPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  infoPillTextAccent: {
    color: '#FFB347', // warm gold
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  tempoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 28,
  },
  tempoAdjustButton: {
    width: 60,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tempoAdjustText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  sideButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sideButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
  },
  swipeHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 0.5,
  },
  countInContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  countInNumber: {
    fontSize: 96,
    fontWeight: '300',
    color: '#10B981',
    letterSpacing: -4,
  },
  countInLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
