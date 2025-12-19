import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, CLICK_SOUNDS } from '../constants/metronome';
import { ClickSound } from '../types/metronome';

interface SoundSelectorProps {
  selectedSound: ClickSound;
  onSoundChange: (sound: ClickSound) => void;
}

export function SoundSelector({ selectedSound, onSoundChange }: SoundSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>SOUND</Text>
      <View style={styles.buttonRow}>
        {CLICK_SOUNDS.map((sound) => (
          <TouchableOpacity
            key={sound.id}
            style={[
              styles.button,
              selectedSound === sound.id && styles.buttonSelected,
            ]}
            onPress={() => onSoundChange(sound.id)}
          >
            <Text
              style={[
                styles.buttonText,
                selectedSound === sound.id && styles.buttonTextSelected,
              ]}
            >
              {sound.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    alignItems: 'center',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: COLORS.buttonGray,
    borderWidth: 1,
    borderColor: '#555',
  },
  buttonSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  buttonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  buttonTextSelected: {
    color: '#fff',
  },
});
