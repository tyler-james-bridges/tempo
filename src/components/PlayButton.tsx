import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/metronome';

interface PlayButtonProps {
  isPlaying: boolean;
  onPress: () => void;
}

export function PlayButton({ isPlaying, onPress }: PlayButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, isPlaying && styles.buttonPlaying]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {isPlaying ? (
          // Stop icon (square)
          <View style={styles.stopIcon} />
        ) : (
          // Play icon (triangle)
          <View style={styles.playIcon} />
        )}
      </View>
      <Text style={styles.label}>{isPlaying ? 'STOP' : 'START'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.buttonGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#555',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPlaying: {
    backgroundColor: '#4a2020',
    borderColor: COLORS.ledRed,
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 24,
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderLeftColor: COLORS.ledGreen,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 6,
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.ledRed,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
