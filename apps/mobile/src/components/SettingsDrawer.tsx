import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, font, spacing, radius, SUBDIVISIONS, TIME_SIGS } from '../constants/theme';
import { SoundType, SubdivisionType, AccentPattern } from '../hooks/useMetronome';
import { usePresets, TempoPreset } from '../hooks/usePresets';
import { ShowHook } from '../hooks/useShow';
import { BluetoothPanel } from './BluetoothPanel';
import { ScorePanel } from './ScorePanel';
import { CloudShowsPanel } from './CloudShowsPanel';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
  tempo: number;
  setTempo: (t: number) => void;
  beats: number;
  setBeats: (b: number) => void;
  subdivision: SubdivisionType;
  setSubdivision: (s: SubdivisionType) => void;
  soundType: SoundType;
  setSoundType: (s: SoundType) => void;
  volume: number;
  setVolume: (v: number) => void;
  accentPattern: AccentPattern;
  setAccentPattern: (p: AccentPattern) => void;
  countInEnabled: boolean;
  setCountInEnabled: (e: boolean) => void;
  countInBeats: number;
  setCountInBeats: (b: number) => void;
  muteAudio: boolean;
  setMuteAudio: (m: boolean) => void;
  // Audio latency / Bluetooth compensation
  audioLatency: number;
  setAudioLatency: (ms: number) => void;
  isCalibrating: boolean;
  calibrationTapCount: number;
  startCalibration: () => void;
  stopCalibration: (applyResult?: boolean) => void;
  calibrationTap: () => void;
  getCalibrationResult: () => number | null;
  // Show/Score integration
  showManager: ShowHook;
}

const SOUNDS: { type: SoundType; label: string; desc: string }[] = [
  { type: 'click', label: 'Click', desc: 'Classic' },
  { type: 'beep', label: 'Beep', desc: 'Digital' },
  { type: 'wood', label: 'Wood', desc: 'Natural' },
  { type: 'cowbell', label: 'Bell', desc: 'Bright' },
];

type Tab = 'score' | 'tempo' | 'sound' | 'bluetooth' | 'cloud';

export function SettingsDrawer({
  visible,
  onClose,
  tempo,
  setTempo,
  beats,
  setBeats,
  subdivision,
  setSubdivision,
  soundType,
  setSoundType,
  volume,
  setVolume,
  accentPattern,
  setAccentPattern,
  countInEnabled,
  setCountInEnabled,
  countInBeats,
  setCountInBeats,
  muteAudio,
  setMuteAudio,
  audioLatency,
  setAudioLatency,
  isCalibrating,
  calibrationTapCount,
  startCalibration,
  stopCalibration,
  calibrationTap,
  getCalibrationResult,
  showManager,
}: SettingsDrawerProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<Tab>('tempo');
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const presetsManager = usePresets();

  // Calculate count-in options based on time signature
  const getCountInOptions = () => {
    const options = [];
    for (let i = 1; i <= 4; i++) {
      const totalBeats = beats * i;
      options.push({
        multiplier: i,
        label: i === 1 ? `${totalBeats} beats (1 bar)` : `${totalBeats} beats (${i} bars)`,
      });
    }
    return options;
  };

  const handleAddPreset = () => {
    if (newPresetName.trim() || true) {
      presetsManager.addPreset(newPresetName.trim() || `${tempo} BPM`, tempo, beats);
      setNewPresetName('');
      setShowAddPreset(false);
    }
  };

  const handleDeletePreset = (preset: TempoPreset) => {
    Alert.alert(
      'Delete Preset',
      `Are you sure you want to delete "${preset.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => presetsManager.deletePreset(preset.id),
        },
      ]
    );
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 12,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateY }] }]}
      >
        {/* Handle */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tab, activeTab === 'score' && styles.tabActive]}
            onPress={() => setActiveTab('score')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'score' }}
            accessibilityLabel="Score settings"
          >
            <Text style={[styles.tabText, activeTab === 'score' && styles.tabTextActive]}>
              Score
            </Text>
            {showManager.hasShow && (
              <View style={styles.scoreBadge} />
            )}
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'tempo' && styles.tabActive]}
            onPress={() => setActiveTab('tempo')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'tempo' }}
            accessibilityLabel="Tempo settings"
          >
            <Text style={[styles.tabText, activeTab === 'tempo' && styles.tabTextActive]}>
              Tempo
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'sound' && styles.tabActive]}
            onPress={() => setActiveTab('sound')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'sound' }}
            accessibilityLabel="Sound settings"
          >
            <Text style={[styles.tabText, activeTab === 'sound' && styles.tabTextActive]}>
              Sound
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'bluetooth' && styles.tabActive]}
            onPress={() => setActiveTab('bluetooth')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'bluetooth' }}
            accessibilityLabel="Audio output settings"
          >
            <Text style={[styles.tabText, activeTab === 'bluetooth' && styles.tabTextActive]}>
              Output
            </Text>
            {audioLatency > 0 && (
              <View style={styles.latencyBadge}>
                <Text style={styles.latencyBadgeValue}>
                  {audioLatency}
                </Text>
                <Text style={styles.latencyBadgeUnit}>ms</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'cloud' && styles.tabActive]}
            onPress={() => setActiveTab('cloud')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'cloud' }}
            accessibilityLabel="Cloud sync settings"
          >
            <Text style={[styles.tabText, activeTab === 'cloud' && styles.tabTextActive]}>
              Cloud
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'score' && (
            <ScorePanel
              show={showManager}
              currentTempo={tempo}
              currentBeats={beats}
            />
          )}

          {activeTab === 'tempo' && (
            <>
              {/* User Presets */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>MY PRESETS</Text>
                  <Pressable
                    style={styles.addPresetButton}
                    onPress={() => setShowAddPreset(true)}
                  >
                    <Text style={styles.addPresetButtonText}>+ Save Current</Text>
                  </Pressable>
                </View>

                {showAddPreset && (
                  <View style={styles.addPresetForm}>
                    <TextInput
                      style={styles.presetInput}
                      placeholder="Preset name (optional)"
                      placeholderTextColor={colors.text.disabled}
                      value={newPresetName}
                      onChangeText={setNewPresetName}
                      autoFocus
                    />
                    <View style={styles.addPresetActions}>
                      <Pressable
                        style={styles.cancelButton}
                        onPress={() => {
                          setShowAddPreset(false);
                          setNewPresetName('');
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={styles.saveButton}
                        onPress={handleAddPreset}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                <View style={styles.presetGrid}>
                  {presetsManager.presets.map((preset) => (
                    <Pressable
                      key={preset.id}
                      style={[
                        styles.presetChip,
                        tempo === preset.bpm && beats === preset.beats && styles.presetChipActive,
                      ]}
                      onPress={() => {
                        setTempo(preset.bpm);
                        setBeats(preset.beats);
                      }}
                      onLongPress={() => handleDeletePreset(preset)}
                    >
                      <Text
                        style={[
                          styles.presetBpm,
                          tempo === preset.bpm && beats === preset.beats && styles.presetTextActive,
                        ]}
                      >
                        {preset.bpm}
                      </Text>
                      <Text
                        style={[
                          styles.presetName,
                          tempo === preset.bpm && beats === preset.beats && styles.presetTextActive,
                        ]}
                      >
                        {preset.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.presetHint}>Long-press to delete a preset</Text>
              </View>

              {/* Time Signature */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>TIME SIGNATURE</Text>
                <View style={styles.chipRow}>
                  {TIME_SIGS.map((ts) => (
                    <Pressable
                      key={ts.label}
                      style={[
                        styles.chip,
                        beats === ts.beats && styles.chipActive,
                      ]}
                      onPress={() => setBeats(ts.beats)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          beats === ts.beats && styles.chipTextActive,
                        ]}
                      >
                        {ts.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Subdivision */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>SUBDIVISION</Text>
                <View style={styles.chipRow}>
                  {SUBDIVISIONS.map((s) => (
                    <Pressable
                      key={s.value}
                      style={[
                        styles.chip,
                        subdivision === s.value && styles.chipActive,
                      ]}
                      onPress={() => setSubdivision(s.value as SubdivisionType)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          subdivision === s.value && styles.chipTextActive,
                        ]}
                      >
                        {s.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Accent Pattern */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>ACCENT</Text>
                <View style={styles.chipRow}>
                  {[
                    { p: 0 as AccentPattern, label: 'First' },
                    { p: 1 as AccentPattern, label: 'All' },
                    { p: 2 as AccentPattern, label: 'Every 2' },
                    { p: 3 as AccentPattern, label: 'Every 3' },
                    { p: 4 as AccentPattern, label: 'Every 4' },
                  ].map((a) => (
                    <Pressable
                      key={a.p}
                      style={[
                        styles.chip,
                        accentPattern === a.p && styles.chipActive,
                      ]}
                      onPress={() => setAccentPattern(a.p)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          accentPattern === a.p && styles.chipTextActive,
                        ]}
                      >
                        {a.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {activeTab === 'sound' && (
            <>
              {/* Sound */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>CLICK SOUND</Text>
                <View style={styles.soundGrid}>
                  {SOUNDS.map((s) => (
                    <Pressable
                      key={s.type}
                      style={[
                        styles.soundCard,
                        soundType === s.type && styles.soundCardActive,
                      ]}
                      onPress={() => setSoundType(s.type)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: soundType === s.type }}
                      accessibilityLabel={`${s.label} sound, ${s.desc}`}
                    >
                      <Text
                        style={[
                          styles.soundLabel,
                          soundType === s.type && styles.soundLabelActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                      <Text
                        style={[
                          styles.soundDesc,
                          soundType === s.type && styles.soundDescActive,
                        ]}
                      >
                        {s.desc}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Volume */}
              <View style={styles.section}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.sectionLabel}>VOLUME</Text>
                  <Text style={styles.sliderValue}>{Math.round(volume * 100)}%</Text>
                </View>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={volume}
                    onValueChange={setVolume}
                    minimumTrackTintColor={colors.accent.primary}
                    maximumTrackTintColor={colors.border.medium}
                    thumbTintColor={colors.text.primary}
                    accessibilityLabel={`Volume ${Math.round(volume * 100)} percent`}
                  />
                </View>
              </View>

              {/* Count-in Options */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>COUNT-IN</Text>
                <View style={styles.optionsCard}>
                  <Pressable
                    style={styles.optionRow}
                    onPress={() => setCountInEnabled(!countInEnabled)}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: countInEnabled }}
                    accessibilityLabel="Count-in before starting"
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>Enable Count-in</Text>
                      <Text style={styles.optionDesc}>Play count before starting</Text>
                    </View>
                    <View
                      style={[styles.toggle, countInEnabled && styles.toggleActive]}
                    >
                      <View
                        style={[
                          styles.toggleThumb,
                          countInEnabled && styles.toggleThumbActive,
                        ]}
                      />
                    </View>
                  </Pressable>
                  {countInEnabled && (
                    <>
                      <View style={styles.optionDivider} />
                      <View style={styles.countInSection}>
                        <Text style={styles.countInLabel}>Count-in Length</Text>
                        <View style={styles.countInOptions}>
                          {getCountInOptions().map((option) => (
                            <Pressable
                              key={option.multiplier}
                              style={[
                                styles.countInChip,
                                countInBeats === option.multiplier && styles.countInChipActive,
                              ]}
                              onPress={() => setCountInBeats(option.multiplier)}
                            >
                              <Text
                                style={[
                                  styles.countInChipText,
                                  countInBeats === option.multiplier && styles.countInChipTextActive,
                                ]}
                              >
                                {option.label}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Other Options */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>OPTIONS</Text>
                <View style={styles.optionsCard}>
                  <Pressable
                    style={styles.optionRow}
                    onPress={() => setMuteAudio(!muteAudio)}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: muteAudio }}
                    accessibilityLabel="Silent mode, visual only without audio"
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>Silent Mode</Text>
                      <Text style={styles.optionDesc}>Visual only, no audio</Text>
                    </View>
                    <View
                      style={[styles.toggle, muteAudio && styles.toggleActive]}
                    >
                      <View
                        style={[
                          styles.toggleThumb,
                          muteAudio && styles.toggleThumbActive,
                        ]}
                      />
                    </View>
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {activeTab === 'bluetooth' && (
            <BluetoothPanel
              audioLatency={audioLatency}
              setAudioLatency={setAudioLatency}
              isCalibrating={isCalibrating}
              calibrationTapCount={calibrationTapCount}
              startCalibration={startCalibration}
              stopCalibration={stopCalibration}
              calibrationTap={calibrationTap}
              getCalibrationResult={getCalibrationResult}
            />
          )}

          {activeTab === 'cloud' && (
            <CloudShowsPanel
              show={showManager}
              onClose={onClose}
            />
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: colors.bg.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border.subtle,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.text.disabled,
  },

  // Tabs - increased touch targets
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md + 2, // 18px for better touch target
    minHeight: 48, // iOS minimum touch target
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: colors.accent.primary,
  },
  tabBadge: {
    backgroundColor: colors.accent.subtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 2,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent.primary,
  },
  // Latency badge - designed for clean ms value display
  latencyBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.accent.subtle,
    paddingLeft: 8,
    paddingRight: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 2,
    minWidth: 48,
    justifyContent: 'center',
  },
  latencyBadgeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent.primary,
    fontVariant: ['tabular-nums'],
  },
  latencyBadgeUnit: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.accent.dim,
    marginLeft: 1,
  },
  // Score badge - small dot indicator
  scoreBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.primary,
    marginLeft: 4,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },

  // Sections - increased spacing for visual hierarchy
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    ...font.label,
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
    letterSpacing: 1.5,
  },

  // Preset chips - larger touch targets
  presetRow: {
    flexDirection: 'row',
    gap: spacing.sm + 2, // 10px gap
  },
  presetChip: {
    flex: 1,
    paddingVertical: spacing.md + 4, // 20px vertical padding
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    minHeight: 64, // Ensure adequate touch target
  },
  presetChipActive: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.primary,
  },
  presetBpm: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  presetName: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text.disabled,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  presetTextActive: {
    color: colors.accent.primary,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
  },
  presetHint: {
    fontSize: 12,
    color: colors.text.disabled,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addPresetButton: {
    backgroundColor: colors.accent.subtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  addPresetButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  addPresetForm: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  presetInput: {
    backgroundColor: colors.bg.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  addPresetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  saveButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.bg.primary,
  },

  // Count-in options
  countInSection: {
    padding: spacing.lg,
  },
  countInLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  countInOptions: {
    gap: spacing.sm,
  },
  countInChip: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg.primary,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
  countInChipActive: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.primary,
  },
  countInChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  countInChipTextActive: {
    color: colors.accent.primary,
    fontWeight: '600',
  },

  // Chips - improved touch targets and spacing
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2, // 10px gap
  },
  chip: {
    paddingVertical: spacing.md - 2, // 14px
    paddingHorizontal: spacing.lg - 4, // 20px
    backgroundColor: colors.bg.surface,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    minHeight: 44, // iOS minimum touch target
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.primary,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.accent.primary,
    fontWeight: '700',
  },

  // Sound grid - larger cards with descriptions
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  soundCard: {
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
  soundCardActive: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.primary,
    borderWidth: 2,
  },
  soundLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  soundLabelActive: {
    color: colors.accent.primary,
  },
  soundDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.disabled,
  },
  soundDescActive: {
    color: colors.accent.dim,
  },

  // Slider - contained in a visible track
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent.primary,
    fontVariant: ['tabular-nums'],
  },
  sliderContainer: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  slider: {
    height: 44, // Adequate touch target
  },

  // Options card - grouped options with consistent spacing
  optionsCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 72, // Good touch target height
  },
  optionContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  optionDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing.lg,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text.tertiary,
    lineHeight: 18,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg.primary,
    borderWidth: 1.5,
    borderColor: colors.border.medium,
    padding: 3,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text.tertiary,
  },
  toggleThumbActive: {
    backgroundColor: colors.text.primary,
    alignSelf: 'flex-end',
  },
});
