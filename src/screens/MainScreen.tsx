import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, TextInput, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  LCDDisplay,
  TempoControl,
  BeatControl,
  PlayButton,
  LEDIndicator,
  SoundSelector,
  DrumPatternSelector,
  ReferenceTone,
  PresetList,
  TabBar,
} from '../components';
import { useMetronome } from '../hooks/useMetronome';
import { usePresets } from '../hooks/usePresets';
import { COLORS } from '../constants/metronome';
import { AppMode, DrumPattern, ReferenceToneSettings, MetronomePreset } from '../types';

export function MainScreen() {
  const [activeTab, setActiveTab] = useState<AppMode>('metronome');
  const [selectedDrumPattern, setSelectedDrumPattern] = useState<DrumPattern | null>(null);
  const [toneSettings, setToneSettings] = useState<ReferenceToneSettings>({
    note: 'A',
    octave: 4,
    a4Reference: 440,
    isPlaying: false,
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  const {
    state,
    toggle,
    setTempo,
    setBeat1,
    setBeat2,
    setClickSound,
    tapTempo,
  } = useMetronome();

  const {
    metronomePresets,
    saveMetronomePreset,
    deleteMetronomePreset,
  } = usePresets();

  const handlePresetSelect = (preset: MetronomePreset) => {
    setTempo(preset.tempo);
    setBeat1(preset.beat1);
    setBeat2(preset.beat2);
    setClickSound(preset.clickSound);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      Alert.alert('Error', 'Please enter a preset name');
      return;
    }

    await saveMetronomePreset({
      name: presetName.trim(),
      tempo: state.tempo,
      beat1: state.beat1,
      beat2: state.beat2,
      clickSound: state.clickSound,
    });

    setPresetName('');
    setShowSaveModal(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'drumPattern':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <DrumPatternSelector
              selectedPattern={selectedDrumPattern}
              onPatternSelect={setSelectedDrumPattern}
            />
          </ScrollView>
        );

      case 'referenceTone':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <ReferenceTone
              settings={toneSettings}
              onChange={setToneSettings}
            />
          </ScrollView>
        );

      case 'presets':
        return (
          <View style={styles.tabContent}>
            <PresetList
              presets={metronomePresets}
              onSelect={handlePresetSelect}
              onDelete={deleteMetronomePreset}
              currentTempo={state.tempo}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setShowSaveModal(true)}
            >
              <Text style={styles.saveButtonText}>+ Save Current as Preset</Text>
            </TouchableOpacity>
          </View>
        );

      case 'metronome':
      default:
        return (
          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.metronomeContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.playButtonContainer}>
              <PlayButton isPlaying={state.isPlaying} onPress={toggle} />
            </View>

            <BeatControl
              beat1={state.beat1}
              beat2={state.beat2}
              onBeat1Change={setBeat1}
              onBeat2Change={setBeat2}
            />

            <SoundSelector
              selectedSound={state.clickSound}
              onSoundChange={setClickSound}
            />

            <TempoControl
              tempo={state.tempo}
              onTempoChange={setTempo}
              onTapTempo={tapTempo}
            />
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

      {/* Tab Content */}
      {renderContent()}

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Save Preset Modal */}
      <Modal visible={showSaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Preset</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Preset name"
              placeholderTextColor={COLORS.textSecondary}
              value={presetName}
              onChangeText={setPresetName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSavePreset}
              >
                <Text style={styles.modalButtonTextPrimary}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 10,
    paddingBottom: 6,
  },
  brand: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  model: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 3,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  metronomeContent: {
    paddingBottom: 20,
  },
  playButtonContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.bodyGray,
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.buttonGray,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.accent,
  },
  modalButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
