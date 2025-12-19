import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/metronome';

interface LEDIndicatorProps {
  beat1: number;
  currentBeat: number;
  isPlaying: boolean;
}

export function LEDIndicator({ beat1, currentBeat, isPlaying }: LEDIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: Math.min(beat1, 9) }, (_, i) => {
        const beatNumber = i + 1;
        const isActive = isPlaying && currentBeat === beatNumber;
        const isFirst = beatNumber === 1;

        return (
          <View
            key={i}
            style={[
              styles.led,
              isFirst ? styles.ledFirst : styles.ledNormal,
              isActive && (isFirst ? styles.ledFirstActive : styles.ledActive),
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  led: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  ledNormal: {
    backgroundColor: COLORS.ledGreenDim,
  },
  ledFirst: {
    backgroundColor: COLORS.ledRedDim,
  },
  ledActive: {
    backgroundColor: COLORS.ledGreen,
    shadowColor: COLORS.ledGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  ledFirstActive: {
    backgroundColor: COLORS.ledRed,
    shadowColor: COLORS.ledRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
});
