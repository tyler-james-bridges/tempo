/**
 * ScorePanel - Show/Parts editor for settings drawer
 *
 * Allows setting up a show with multiple parts/movements,
 * each with their own tempo and time signature.
 * Now with AI-powered sheet music analysis!
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import { ShowHook, Part } from '../hooks/useShow';
import { ScoreImport } from './ScoreImport';

interface ScorePanelProps {
  show: ShowHook;
  currentTempo: number;
  currentBeats: number;
}

export function ScorePanel({ show, currentTempo, currentBeats }: ScorePanelProps) {
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [newPartName, setNewPartName] = useState('');
  const [newPartTempo, setNewPartTempo] = useState(currentTempo);
  const [newPartBeats, setNewPartBeats] = useState(currentBeats);

  const handleAddPart = () => {
    show.addPart(newPartName || `Part ${show.show.parts.length + 1}`, newPartTempo, newPartBeats);
    setNewPartName('');
    setNewPartTempo(currentTempo);
    setNewPartBeats(currentBeats);
    setIsAddingPart(false);
  };

  const handleDeletePart = (part: Part) => {
    Alert.alert(
      'Delete Part',
      `Delete "${part.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => show.deletePart(part.id),
        },
      ]
    );
  };

  const handleClearShow = () => {
    Alert.alert(
      'Clear Show',
      'Remove all parts and show name?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => show.clearShow(),
        },
      ]
    );
  };

  const startEditPart = (part: Part) => {
    setEditingPartId(part.id);
    setNewPartName(part.name);
    setNewPartTempo(part.tempo);
    setNewPartBeats(part.beats);
  };

  const saveEditPart = () => {
    if (editingPartId) {
      show.updatePart(editingPartId, {
        name: newPartName,
        tempo: newPartTempo,
        beats: newPartBeats,
      });
      setEditingPartId(null);
      setNewPartName('');
    }
  };

  const cancelEdit = () => {
    setEditingPartId(null);
    setIsAddingPart(false);
    setNewPartName('');
    setNewPartTempo(currentTempo);
    setNewPartBeats(currentBeats);
  };

  return (
    <View style={styles.container}>
      {/* Show Name */}
      <View style={styles.section}>
        <Text style={styles.label}>SHOW NAME</Text>
        <TextInput
          style={styles.input}
          value={show.show.name}
          onChangeText={show.setShowName}
          placeholder="e.g., Flux 2026"
          placeholderTextColor={colors.text.disabled}
        />
      </View>

      {/* Parts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>PARTS</Text>
          {!isAddingPart && !editingPartId && (
            <Pressable
              style={styles.addButton}
              onPress={() => {
                setNewPartTempo(currentTempo);
                setNewPartBeats(currentBeats);
                setIsAddingPart(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Part</Text>
            </Pressable>
          )}
        </View>

        {/* Add/Edit Form */}
        {(isAddingPart || editingPartId) && (
          <View style={styles.form}>
            <TextInput
              style={styles.formInput}
              value={newPartName}
              onChangeText={setNewPartName}
              placeholder="Part name"
              placeholderTextColor={colors.text.disabled}
              autoFocus
            />

            {/* Tempo adjuster */}
            <View style={styles.tempoRow}>
              <Text style={styles.formLabel}>Tempo</Text>
              <View style={styles.tempoControls}>
                <Pressable
                  style={styles.tempoBtn}
                  onPress={() => setNewPartTempo((t) => Math.max(30, t - 10))}
                >
                  <Text style={styles.tempoBtnText}>-10</Text>
                </Pressable>
                <Pressable
                  style={styles.tempoBtn}
                  onPress={() => setNewPartTempo((t) => Math.max(30, t - 1))}
                >
                  <Text style={styles.tempoBtnText}>-</Text>
                </Pressable>
                <Text style={styles.tempoValue}>{newPartTempo}</Text>
                <Pressable
                  style={styles.tempoBtn}
                  onPress={() => setNewPartTempo((t) => Math.min(300, t + 1))}
                >
                  <Text style={styles.tempoBtnText}>+</Text>
                </Pressable>
                <Pressable
                  style={styles.tempoBtn}
                  onPress={() => setNewPartTempo((t) => Math.min(300, t + 10))}
                >
                  <Text style={styles.tempoBtnText}>+10</Text>
                </Pressable>
              </View>
            </View>

            {/* Time signature */}
            <View style={styles.beatsRow}>
              <Text style={styles.formLabel}>Time</Text>
              <View style={styles.beatsControls}>
                {[2, 3, 4, 5, 6, 7].map((b) => (
                  <Pressable
                    key={b}
                    style={[
                      styles.beatChip,
                      newPartBeats === b && styles.beatChipActive,
                    ]}
                    onPress={() => setNewPartBeats(b)}
                  >
                    <Text
                      style={[
                        styles.beatChipText,
                        newPartBeats === b && styles.beatChipTextActive,
                      ]}
                    >
                      {b}/4
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.formActions}>
              <Pressable style={styles.cancelBtn} onPress={cancelEdit}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.saveBtn}
                onPress={editingPartId ? saveEditPart : handleAddPart}
              >
                <Text style={styles.saveBtnText}>
                  {editingPartId ? 'Save' : 'Add'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* AI Import */}
        {show.show.parts.length === 0 && !isAddingPart && (
          <ScoreImport
            onImportComplete={() => {
              // Parts are auto-added by the analyzer hook
            }}
          />
        )}

        {/* Parts List */}
        {show.show.parts.length === 0 && !isAddingPart ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>— or —</Text>
            <Text style={styles.emptyHint}>
              Manually add parts for each movement
            </Text>
          </View>
        ) : (
          <View style={styles.partsList}>
            {show.show.parts.map((part, index) => (
              <Pressable
                key={part.id}
                style={[
                  styles.partCard,
                  show.activePart?.id === part.id && styles.partCardActive,
                ]}
                onPress={() => startEditPart(part)}
                onLongPress={() => handleDeletePart(part)}
              >
                <View style={styles.partIndex}>
                  <Text style={styles.partIndexText}>{index + 1}</Text>
                </View>
                <View style={styles.partInfo}>
                  <Text style={styles.partName}>{part.name}</Text>
                  <Text style={styles.partMeta}>
                    {part.tempo} BPM · {part.beats}/4
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {show.show.parts.length > 0 && (
          <Text style={styles.hint}>Tap to edit · Long-press to delete</Text>
        )}
      </View>

      {/* Clear button */}
      {show.hasShow && (
        <Pressable style={styles.clearBtn} onPress={handleClearShow}>
          <Text style={styles.clearBtnText}>Clear Show</Text>
        </Pressable>
      )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.accent.subtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent.primary,
  },

  // Form
  form: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  formInput: {
    backgroundColor: colors.bg.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
    width: 50,
  },
  tempoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempoControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tempoBtn: {
    width: 40,
    height: 36,
    backgroundColor: colors.bg.primary,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  tempoBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tempoValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.accent.primary,
    minWidth: 60,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  beatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beatsControls: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  beatChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bg.primary,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  beatChipActive: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.primary,
  },
  beatChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  beatChipTextActive: {
    color: colors.accent.primary,
    fontWeight: '700',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  saveBtn: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.bg.primary,
  },

  // Empty state
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.text.disabled,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // Parts list
  partsList: {
    gap: spacing.sm,
  },
  partCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  partCardActive: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.subtle,
  },
  partIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  partIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  partInfo: {
    flex: 1,
  },
  partName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  partMeta: {
    fontSize: 13,
    color: colors.accent.primary,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    color: colors.text.disabled,
    textAlign: 'center',
    marginTop: spacing.md,
  },

  // Clear button
  clearBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
});
