import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, font, spacing, radius, SUBDIVISIONS, TIME_SIGS, DRUMLINE_PRESETS, SHOW_PRESETS } from '../constants/theme';
import { SoundType, SubdivisionType, AccentPattern } from '../hooks/useMetronome';
import { useBluetoothAudio } from '../hooks/useBluetoothAudio';
import { useSetlist } from '../hooks/useSetlist';
import { BluetoothPanel } from './BluetoothPanel';
import { SetlistPanel } from './SetlistPanel';

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
  muteAudio: boolean;
  setMuteAudio: (m: boolean) => void;
  tapTempo: () => void;
}

const SOUNDS: { type: SoundType; label: string }[] = [
  { type: 'click', label: 'Click' },
  { type: 'beep', label: 'Beep' },
  { type: 'wood', label: 'Wood' },
  { type: 'cowbell', label: 'Bell' },
];

type Tab = 'tempo' | 'sound' | 'setlist' | 'bluetooth';

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
  muteAudio,
  setMuteAudio,
  tapTempo,
}: SettingsDrawerProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<Tab>('tempo');

  const bluetooth = useBluetoothAudio();
  const setlistManager = useSetlist();

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
            style={[styles.tab, activeTab === 'tempo' && styles.tabActive]}
            onPress={() => setActiveTab('tempo')}
          >
            <Text style={[styles.tabText, activeTab === 'tempo' && styles.tabTextActive]}>
              Tempo
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'sound' && styles.tabActive]}
            onPress={() => setActiveTab('sound')}
          >
            <Text style={[styles.tabText, activeTab === 'sound' && styles.tabTextActive]}>
              Sound
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'setlist' && styles.tabActive]}
            onPress={() => setActiveTab('setlist')}
          >
            <Text style={[styles.tabText, activeTab === 'setlist' && styles.tabTextActive]}>
              Setlist
            </Text>
            {setlistManager.activeSetlist && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {setlistManager.activeItemIndex + 1}/{setlistManager.activeSetlist.items.length}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'bluetooth' && styles.tabActive]}
            onPress={() => setActiveTab('bluetooth')}
          >
            <Text style={[styles.tabText, activeTab === 'bluetooth' && styles.tabTextActive]}>
              Output
            </Text>
            {bluetooth.settings.devicePreset !== 'wired' && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {bluetooth.settings.latencyCompensation}ms
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'tempo' && (
            <>
              {/* Drumline Presets */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>DRUMLINE</Text>
                <View style={styles.presetRow}>
                  {DRUMLINE_PRESETS.map((p) => (
                    <Pressable
                      key={p.bpm}
                      style={[
                        styles.presetChip,
                        tempo === p.bpm && styles.presetChipActive,
                      ]}
                      onPress={() => setTempo(p.bpm)}
                    >
                      <Text
                        style={[
                          styles.presetBpm,
                          tempo === p.bpm && styles.presetTextActive,
                        ]}
                      >
                        {p.bpm}
                      </Text>
                      <Text
                        style={[
                          styles.presetName,
                          tempo === p.bpm && styles.presetTextActive,
                        ]}
                      >
                        {p.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Show Presets */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>SHOW TEMPOS</Text>
                <View style={styles.chipRow}>
                  {SHOW_PRESETS.map((p) => (
                    <Pressable
                      key={p.bpm}
                      style={[
                        styles.chip,
                        tempo === p.bpm && styles.chipActive,
                      ]}
                      onPress={() => setTempo(p.bpm)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          tempo === p.bpm && styles.chipTextActive,
                        ]}
                      >
                        {p.bpm}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Tap Tempo */}
              <View style={styles.section}>
                <Pressable style={styles.tapButton} onPress={tapTempo}>
                  <Text style={styles.tapButtonText}>TAP TEMPO</Text>
                </Pressable>
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
                    >
                      <Text
                        style={[
                          styles.soundLabel,
                          soundType === s.type && styles.soundLabelActive,
                        ]}
                      >
                        {s.label}
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
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={volume}
                  onValueChange={setVolume}
                  minimumTrackTintColor={colors.accent.primary}
                  maximumTrackTintColor={colors.border.medium}
                  thumbTintColor={colors.text.primary}
                />
              </View>

              {/* Options */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>OPTIONS</Text>
                <View style={styles.optionRow}>
                  <Text style={styles.optionLabel}>Count-in (1 bar)</Text>
                  <Pressable
                    style={[styles.toggle, countInEnabled && styles.toggleActive]}
                    onPress={() => setCountInEnabled(!countInEnabled)}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        countInEnabled && styles.toggleThumbActive,
                      ]}
                    />
                  </Pressable>
                </View>
                <View style={styles.optionRow}>
                  <View>
                    <Text style={styles.optionLabel}>Silent Mode</Text>
                    <Text style={styles.optionDesc}>Visual only, no audio</Text>
                  </View>
                  <Pressable
                    style={[styles.toggle, muteAudio && styles.toggleActive]}
                    onPress={() => setMuteAudio(!muteAudio)}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        muteAudio && styles.toggleThumbActive,
                      ]}
                    />
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {activeTab === 'setlist' && (
            <SetlistPanel
              setlist={setlistManager}
              onSelectTempo={(newTempo, newBeats) => {
                setTempo(newTempo);
                setBeats(newBeats);
              }}
            />
          )}

          {activeTab === 'bluetooth' && (
            <BluetoothPanel bluetooth={bluetooth} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.disabled,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.accent.primary,
  },
  tabBadge: {
    backgroundColor: colors.accent.subtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.accent.primary,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...font.label,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },

  // Preset chips
  presetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  presetChip: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.primary,
  },
  presetBpm: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  presetName: {
    fontSize: 10,
    color: colors.text.disabled,
    marginTop: 2,
  },
  presetTextActive: {
    color: colors.accent.primary,
  },

  // Tap tempo
  tapButton: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  tapButtonText: {
    ...font.label,
    color: colors.text.secondary,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  chipActive: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.accent.primary,
    fontWeight: '600',
  },

  // Sound grid
  soundGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  soundCard: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  soundCardActive: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.primary,
  },
  soundLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  soundLabelActive: {
    color: colors.accent.primary,
  },

  // Slider
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  slider: {
    height: 40,
  },

  // Options
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  optionLabel: {
    fontSize: 15,
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
});
