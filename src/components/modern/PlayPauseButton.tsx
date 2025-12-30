import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onPress: () => void;
  size?: number;
}

export function PlayPauseButton({ isPlaying, onPress, size = 80 }: PlayPauseButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const iconSize = size * 0.4;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          isPlaying && styles.buttonPlaying,
        ]}
      >
        {isPlaying ? (
          <View
            style={[
              styles.stopIcon,
              {
                width: iconSize * 0.7,
                height: iconSize * 0.7,
                borderRadius: 4,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.playIcon,
              {
                borderLeftWidth: iconSize,
                borderTopWidth: iconSize * 0.6,
                borderBottomWidth: iconSize * 0.6,
              },
            ]}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonPlaying: {
    backgroundColor: 'rgba(255,140,66,0.25)', // warm orange
    borderColor: '#FF8C42', // warm orange
  },
  stopIcon: {
    backgroundColor: '#FFFFFF',
  },
  playIcon: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
    marginLeft: 6,
  },
});
