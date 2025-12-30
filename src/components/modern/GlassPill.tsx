import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';

interface GlassPillProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  accentColor?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function GlassPill({
  label,
  isActive = false,
  onPress,
  accentColor = '#00D9FF',
  size = 'medium',
  style,
  icon,
}: GlassPillProps) {
  const sizeStyles = {
    small: { paddingVertical: 6, paddingHorizontal: 12 },
    medium: { paddingVertical: 10, paddingHorizontal: 18 },
    large: { paddingVertical: 14, paddingHorizontal: 24 },
  };

  const textSizes = {
    small: 11,
    medium: 13,
    large: 15,
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        sizeStyles[size],
        isActive && [styles.pillActive, { borderColor: accentColor }],
        pressed && styles.pillPressed,
        style,
      ]}
    >
      {/* Glass effect background */}
      <View
        style={[
          styles.glassBackground,
          isActive && { backgroundColor: `${accentColor}20` },
        ]}
      />

      {/* Active glow */}
      {isActive && (
        <View
          style={[
            styles.activeGlow,
            { backgroundColor: accentColor, shadowColor: accentColor },
          ]}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {icon}
        <Text
          style={[
            styles.label,
            { fontSize: textSizes[size] },
            isActive && [styles.labelActive, { color: accentColor }],
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  pillActive: {
    borderWidth: 1.5,
  },
  pillPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  labelActive: {
    fontWeight: '700',
  },
});
