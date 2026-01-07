import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface BeatRingProps {
  beatNumber: number;
  totalBeats: number;
  isActive: boolean;
  isAccent: boolean;
  isPlaying: boolean;
}

export const BeatRing = memo(function BeatRing({ beatNumber, totalBeats, isActive, isAccent, isPlaying }: BeatRingProps) {
  // Calculate position around a circle
  const angle = ((beatNumber - 1) / totalBeats) * 2 * Math.PI - Math.PI / 2;
  const radius = 110;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  const accentColor = '#FFB347'; // warm gold for accents
  const normalColor = '#D4A574'; // muted gold for normal beats
  const activeColor = isAccent ? accentColor : normalColor;

  return (
    <View
      style={[
        styles.beatDot,
        {
          transform: [
            { translateX: x },
            { translateY: y },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.dotInner,
          {
            backgroundColor: isActive && isPlaying ? activeColor : 'transparent',
            borderColor: isAccent ? accentColor : 'rgba(255,255,255,0.2)',
            borderWidth: isAccent ? 2 : 1,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  beatDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});
