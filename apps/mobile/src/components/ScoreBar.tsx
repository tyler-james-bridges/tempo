/**
 * ScoreBar - Horizontal part navigation for main screen
 *
 * Shows the current show name and parts as tappable pills.
 * Tap a part to switch tempo/time signature instantly.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import { Part } from '../hooks/useShow';

interface ScoreBarProps {
  showName: string;
  parts: Part[];
  activePartId: string | null;
  onSelectPart: (part: Part) => void;
  onOpenSettings: () => void;
}

export function ScoreBar({
  showName,
  parts,
  activePartId,
  onSelectPart,
  onOpenSettings,
}: ScoreBarProps) {
  if (parts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Show name */}
      {showName ? (
        <Pressable onPress={onOpenSettings} style={styles.showNameContainer}>
          <Text style={styles.showName} numberOfLines={1}>
            {showName.toUpperCase()}
          </Text>
        </Pressable>
      ) : null}

      {/* Parts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.partsContainer}
      >
        {parts.map((part) => {
          const isActive = part.id === activePartId;
          return (
            <Pressable
              key={part.id}
              style={[styles.partPill, isActive && styles.partPillActive]}
              onPress={() => onSelectPart(part)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${part.name}, ${part.tempo} BPM`}
            >
              <Text
                style={[styles.partName, isActive && styles.partNameActive]}
                numberOfLines={1}
              >
                {part.name}
              </Text>
              <Text
                style={[styles.partTempo, isActive && styles.partTempoActive]}
              >
                {part.tempo}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.md,
  },
  showNameContainer: {
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  showName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  partsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  // Part pill style - matches web's part-card pattern
  partPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    minHeight: 40,
    // Card shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  partPillActive: {
    backgroundColor: colors.accent.muted,
    borderColor: colors.accent.primary,
  },
  partName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    maxWidth: 100,
  },
  partNameActive: {
    color: colors.accent.primary,
  },
  partTempo: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.disabled,
    fontVariant: ['tabular-nums'],
  },
  partTempoActive: {
    color: colors.accent.dim,
  },
});
