import React, { memo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/theme';

interface BeatIndicatorProps {
  index: number;
  isActive: boolean;
  isAccent: boolean;
  isPlaying: boolean;
}

export const BeatIndicator = memo(function BeatIndicator({
  index,
  isActive,
  isAccent,
  isPlaying,
}: BeatIndicatorProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isActive && isPlaying) {
      // Pop animation
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.4,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isActive, isPlaying, scaleAnim, opacityAnim]);

  const dotColor = isAccent ? colors.accent.primary : colors.text.primary;

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          backgroundColor: isActive && isPlaying ? dotColor : 'transparent',
          borderColor: isAccent ? colors.accent.primary : colors.beat.inactive,
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
});
