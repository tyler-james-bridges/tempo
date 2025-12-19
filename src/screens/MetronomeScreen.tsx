import React from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  LCDDisplay,
  TempoControl,
  BeatControl,
  PlayButton,
  LEDIndicator,
} from '../components';
import { useMetronome } from '../hooks/useMetronome';
import { COLORS } from '../constants/metronome';

export function MetronomeScreen() {
  const {
    state,
    toggle,
    setTempo,
    setBeat1,
    setBeat2,
    tapTempo,
  } = useMetronome();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>BOSS</Text>
        <Text style={styles.model}>DB-90</Text>
        <Text style={styles.subtitle}>Dr. Beat</Text>
      </View>

      {/* LED Beat Indicators */}
      <LEDIndicator
        beat1={state.beat1}
        currentBeat={state.currentBeat}
        isPlaying={state.isPlaying}
      />

      {/* LCD Display */}
      <LCDDisplay
        tempo={state.tempo}
        beat1={state.beat1}
        beat2={state.beat2}
        currentBeat={state.currentBeat}
        isPlaying={state.isPlaying}
      />

      {/* Controls Section */}
      <View style={styles.controlsSection}>
        {/* Beat Controls */}
        <BeatControl
          beat1={state.beat1}
          beat2={state.beat2}
          onBeat1Change={setBeat1}
          onBeat2Change={setBeat2}
        />

        {/* Tempo Control */}
        <TempoControl
          tempo={state.tempo}
          onTempoChange={setTempo}
          onTapTempo={tapTempo}
        />

        {/* Play/Stop Button */}
        <View style={styles.playButtonContainer}>
          <PlayButton isPlaying={state.isPlaying} onPress={toggle} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  brand: {
    color: COLORS.accent,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  model: {
    color: COLORS.textPrimary,
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 2,
  },
  controlsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});
