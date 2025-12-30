import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  TextInput,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tempo markings based on traditional Italian terms
const getTempoMarking = (tempo: number): string => {
  if (tempo < 40) return 'Grave';
  if (tempo < 55) return 'Largo';
  if (tempo < 66) return 'Larghetto';
  if (tempo < 76) return 'Adagio';
  if (tempo < 92) return 'Andante';
  if (tempo < 108) return 'Moderato';
  if (tempo < 120) return 'Allegretto';
  if (tempo < 140) return 'Allegro';
  if (tempo < 168) return 'Vivace';
  if (tempo < 200) return 'Presto';
  return 'Prestissimo';
};

// Common tempo presets - warm gold/amber gradient
const TEMPO_PRESETS = [
  { label: '60', value: 60, color: '#D4A574' },
  { label: '80', value: 80, color: '#DBA96A' },
  { label: '100', value: 100, color: '#E5AE5C' },
  { label: '120', value: 120, color: '#FFB347' },
  { label: '140', value: 140, color: '#FFAA33' },
  { label: '160', value: 160, color: '#FF9F1C' },
  { label: '180', value: 180, color: '#FF8C42' },
  { label: '200', value: 200, color: '#FF7B29' },
];

interface NumberPickerModalProps {
  visible: boolean;
  title: string;
  value: number | null;
  min: number;
  max: number;
  allowNull?: boolean;
  nullLabel?: string;
  onSelect: (value: number | null) => void;
  onClose: () => void;
}

export function NumberPickerModal({
  visible,
  title,
  value,
  min,
  max,
  allowNull = false,
  nullLabel = 'None',
  onSelect,
  onClose,
}: NumberPickerModalProps) {
  const [currentValue, setCurrentValue] = useState(value ?? min);
  const [isEditing, setIsEditing] = useState(true); // Start in edit mode
  const [editText, setEditText] = useState((value ?? min).toString());

  const animatedScale = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track gesture velocity for momentum
  const lastY = useRef(0);
  const velocity = useRef(0);

  useEffect(() => {
    if (visible) {
      const initialValue = value ?? min;
      setCurrentValue(initialValue);
      setEditText(initialValue.toString());
      setIsEditing(true); // Always start in edit mode
      Animated.parallel([
        Animated.spring(animatedScale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          stiffness: 300,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      animatedScale.setValue(0);
      animatedOpacity.setValue(0);
    }
  }, [visible, value, min]);

  const clampValue = useCallback((val: number) => {
    return Math.min(max, Math.max(min, Math.round(val)));
  }, [min, max]);

  const adjustValue = useCallback((delta: number) => {
    setCurrentValue(prev => clampValue(prev + delta));
    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [clampValue]);

  // Pan responder for vertical swipe
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        lastY.current = 0;
        velocity.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        const sensitivity = 0.3;
        const delta = (lastY.current - gestureState.dy) * sensitivity;
        velocity.current = gestureState.vy;

        if (Math.abs(delta) >= 1) {
          const change = Math.round(delta);
          setCurrentValue(prev => clampValue(prev + change));
          lastY.current = gestureState.dy;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Apply momentum
        if (Math.abs(gestureState.vy) > 0.5) {
          const momentum = Math.round(-gestureState.vy * 10);
          setCurrentValue(prev => clampValue(prev + momentum));
        }
      },
    })
  ).current;

  const startHold = useCallback((delta: number) => {
    adjustValue(delta);
    holdTimeout.current = setTimeout(() => {
      holdInterval.current = setInterval(() => {
        adjustValue(delta);
      }, 50);
    }, 300);
  }, [adjustValue]);

  const stopHold = useCallback(() => {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    Animated.parallel([
      Animated.timing(animatedScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSelect(currentValue);
      onClose();
    });
  }, [currentValue, onSelect, onClose]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(animatedScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [onClose]);

  const handlePresetSelect = useCallback((preset: number) => {
    setCurrentValue(clampValue(preset));
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 10,
      }),
    ]).start();
  }, [clampValue]);

  const handleEditSubmit = useCallback(() => {
    const num = parseInt(editText, 10);
    if (!isNaN(num)) {
      setCurrentValue(clampValue(num));
    }
    setIsEditing(false);
    setEditText('');
  }, [editText, clampValue]);

  const tempoMarking = getTempoMarking(currentValue);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: animatedOpacity }]}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: animatedScale }],
              opacity: animatedOpacity,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>x</Text>
            </Pressable>
          </View>

          {/* Tempo Marking */}
          <Text style={styles.tempoMarking}>{tempoMarking}</Text>

          {/* Main Tempo Display with Gesture */}
          <View style={styles.tempoSection} {...panResponder.panHandlers}>
            {/* Decrease buttons */}
            <View style={styles.adjustColumn}>
              <Pressable
                style={styles.adjustButton}
                onPress={() => adjustValue(-10)}
                onPressIn={() => startHold(-10)}
                onPressOut={stopHold}
              >
                <Text style={styles.adjustButtonText}>-10</Text>
              </Pressable>
              <Pressable
                style={[styles.adjustButton, styles.adjustButtonSmall]}
                onPress={() => adjustValue(-1)}
                onPressIn={() => startHold(-1)}
                onPressOut={stopHold}
              >
                <Text style={styles.adjustButtonTextSmall}>-1</Text>
              </Pressable>
            </View>

            {/* Central tempo display */}
            <Pressable
              style={styles.tempoDisplayContainer}
              onPress={() => {
                setEditText(currentValue.toString());
                setIsEditing(true);
              }}
            >
              <Animated.View
                style={[
                  styles.tempoDisplay,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                {isEditing ? (
                  <TextInput
                    style={styles.tempoInput}
                    value={editText}
                    onChangeText={setEditText}
                    keyboardType="number-pad"
                    maxLength={3}
                    autoFocus
                    selectTextOnFocus
                    selection={{ start: 0, end: editText.length }}
                    onBlur={handleEditSubmit}
                    onSubmitEditing={handleEditSubmit}
                  />
                ) : (
                  <>
                    <Text style={styles.tempoValue}>{currentValue}</Text>
                    <Text style={styles.bpmLabel}>BPM</Text>
                  </>
                )}
              </Animated.View>
              <Text style={styles.swipeHint}>Swipe to adjust</Text>
            </Pressable>

            {/* Increase buttons */}
            <View style={styles.adjustColumn}>
              <Pressable
                style={styles.adjustButton}
                onPress={() => adjustValue(10)}
                onPressIn={() => startHold(10)}
                onPressOut={stopHold}
              >
                <Text style={styles.adjustButtonText}>+10</Text>
              </Pressable>
              <Pressable
                style={[styles.adjustButton, styles.adjustButtonSmall]}
                onPress={() => adjustValue(1)}
                onPressIn={() => startHold(1)}
                onPressOut={stopHold}
              >
                <Text style={styles.adjustButtonTextSmall}>+1</Text>
              </Pressable>
            </View>
          </View>

          {/* Range indicator */}
          <View style={styles.rangeContainer}>
            <View style={styles.rangeTrack}>
              <View
                style={[
                  styles.rangeFill,
                  {
                    width: `${((currentValue - min) / (max - min)) * 100}%`,
                  },
                ]}
              />
              <View
                style={[
                  styles.rangeThumb,
                  {
                    left: `${((currentValue - min) / (max - min)) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeLabel}>{min}</Text>
              <Text style={styles.rangeLabel}>{max}</Text>
            </View>
          </View>

          {/* Preset buttons */}
          <View style={styles.presetsSection}>
            <Text style={styles.presetsLabel}>Quick Select</Text>
            <View style={styles.presetsGrid}>
              {TEMPO_PRESETS.map((preset) => (
                <Pressable
                  key={preset.value}
                  style={({ pressed }) => [
                    styles.presetButton,
                    currentValue === preset.value && styles.presetButtonActive,
                    currentValue === preset.value && { borderColor: preset.color },
                    pressed && styles.presetButtonPressed,
                  ]}
                  onPress={() => handlePresetSelect(preset.value)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      currentValue === preset.value && { color: preset.color },
                    ]}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Allow null option if enabled */}
          {allowNull && (
            <Pressable
              style={[
                styles.nullButton,
                value === null && styles.nullButtonActive,
              ]}
              onPress={() => {
                onSelect(null);
                onClose();
              }}
            >
              <Text style={[
                styles.nullButtonText,
                value === null && styles.nullButtonTextActive,
              ]}>
                {nullLabel}
              </Text>
            </Pressable>
          )}

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Set Tempo</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: '#0A0B14',
    borderRadius: 28,
    padding: 24,
    width: Math.min(SCREEN_WIDTH - 40, 380),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '400',
    marginTop: -2,
  },
  tempoMarking: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFB347', // warm gold
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  tempoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  adjustColumn: {
    gap: 8,
  },
  adjustButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  adjustButtonSmall: {
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  adjustButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  adjustButtonTextSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  tempoDisplayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  tempoDisplay: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 2,
    borderColor: 'rgba(255,179,71,0.25)', // warm gold border
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB347',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  tempoValue: {
    fontSize: 64,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -4,
  },
  bpmLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 3,
    marginTop: -4,
  },
  tempoInput: {
    fontSize: 64,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -4,
    textAlign: 'center',
    width: 140,
    padding: 0,
  },
  swipeHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  rangeContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  rangeTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    position: 'relative',
  },
  rangeFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    backgroundColor: '#FFB347', // warm gold
    borderRadius: 2,
  },
  rangeThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginLeft: -6,
    shadowColor: '#FFB347',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
  },
  presetsSection: {
    marginBottom: 24,
  },
  presetsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  presetButton: {
    width: 68,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  presetButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
  },
  presetButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  presetText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  nullButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  nullButtonActive: {
    backgroundColor: 'rgba(255,179,71,0.2)',
    borderColor: '#FFB347',
  },
  nullButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  nullButtonTextActive: {
    color: '#FFB347',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#FFB347', // warm gold
    alignItems: 'center',
    shadowColor: '#FFB347',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0B14',
    letterSpacing: 0.5,
  },
});
