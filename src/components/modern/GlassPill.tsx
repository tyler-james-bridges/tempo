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
  // Ensure minimum 44px touch target for accessibility (iOS HIG)
  const sizeStyles = {
    small: { paddingVertical: 10, paddingHorizontal: 14, minHeight: 44 },
    medium: { paddingVertical: 12, paddingHorizontal: 20, minHeight: 44 },
    large: { paddingVertical: 16, paddingHorizontal: 28, minHeight: 48 },
  };

  const textSizes = {
    small: 13,
    medium: 14,
    large: 16,
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}
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
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  pillActive: {
    borderWidth: 2,
  },
  pillPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
    gap: 8,
  },
  label: {
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.3,
  },
  labelActive: {
    fontWeight: '700',
  },
});
