import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/metronome';
import { AppMode } from '../types';

interface Tab {
  id: AppMode;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'metronome', label: 'Metro', icon: '♩' },
  { id: 'drumPattern', label: 'Drums', icon: '🥁' },
  { id: 'referenceTone', label: 'Tone', icon: '🎵' },
  { id: 'presets', label: 'Presets', icon: '📋' },
];

interface TabBarProps {
  activeTab: AppMode;
  onTabChange: (tab: AppMode) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.tabActive]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.bodyGray,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: 20, // Account for home indicator
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.accent,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.accent,
  },
});
