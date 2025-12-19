import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/metronome';
import { DRUM_PATTERNS, PATTERN_CATEGORIES } from '../constants/drumPatterns';
import { DrumPattern, DrumCategory } from '../types';

interface DrumPatternSelectorProps {
  selectedPattern: DrumPattern | null;
  onPatternSelect: (pattern: DrumPattern | null) => void;
}

export function DrumPatternSelector({
  selectedPattern,
  onPatternSelect,
}: DrumPatternSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<DrumCategory | null>(null);

  const filteredPatterns = selectedCategory
    ? DRUM_PATTERNS.filter((p) => p.category === selectedCategory)
    : DRUM_PATTERNS;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DRUM PATTERNS</Text>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[styles.categoryTab, !selectedCategory && styles.categoryTabActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {PATTERN_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryTab,
              selectedCategory === cat.id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(cat.id as DrumCategory)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pattern list */}
      <ScrollView style={styles.patternList} nestedScrollEnabled>
        <TouchableOpacity
          style={[styles.patternItem, !selectedPattern && styles.patternItemActive]}
          onPress={() => onPatternSelect(null)}
        >
          <Text style={[styles.patternName, !selectedPattern && styles.patternNameActive]}>
            OFF (Metronome Only)
          </Text>
        </TouchableOpacity>
        {filteredPatterns.map((pattern) => (
          <TouchableOpacity
            key={pattern.id}
            style={[
              styles.patternItem,
              selectedPattern?.id === pattern.id && styles.patternItemActive,
            ]}
            onPress={() => onPatternSelect(pattern)}
          >
            <Text
              style={[
                styles.patternName,
                selectedPattern?.id === pattern.id && styles.patternNameActive,
              ]}
            >
              {pattern.name}
            </Text>
            <View style={styles.patternPreview}>
              {pattern.pattern.slice(0, 8).map((beat, i) => (
                <View
                  key={i}
                  style={[styles.patternDot, beat === 1 && styles.patternDotActive]}
                />
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bodyGray,
    borderRadius: 8,
    padding: 12,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  categoryScroll: {
    maxHeight: 40,
    marginBottom: 12,
  },
  categoryContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.buttonGray,
  },
  categoryTabActive: {
    backgroundColor: COLORS.accent,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  patternList: {
    flex: 1,
    maxHeight: 200,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: COLORS.background,
  },
  patternItemActive: {
    backgroundColor: COLORS.accent + '30',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  patternName: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  patternNameActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  patternPreview: {
    flexDirection: 'row',
    gap: 3,
  },
  patternDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.buttonGray,
  },
  patternDotActive: {
    backgroundColor: COLORS.lcdText,
  },
});
