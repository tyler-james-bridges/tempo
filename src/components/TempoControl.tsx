import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { COLORS, METRONOME_CONFIG } from '../constants/metronome';

interface TempoControlProps {
  tempo: number;
  onTempoChange: (tempo: number) => void;
  onTapTempo: () => void;
}

export function TempoControl({
  tempo,
  onTempoChange,
  onTapTempo,
}: TempoControlProps) {
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (
        _event: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        // Vertical drag changes tempo
        const delta = -gestureState.dy * 0.5;
        const newTempo = Math.round(tempo + delta);
        onTempoChange(
          Math.max(
            METRONOME_CONFIG.minTempo,
            Math.min(METRONOME_CONFIG.maxTempo, newTempo)
          )
        );
      },
    })
  ).current;

  const incrementTempo = (amount: number) => {
    const newTempo = tempo + amount;
    onTempoChange(
      Math.max(
        METRONOME_CONFIG.minTempo,
        Math.min(METRONOME_CONFIG.maxTempo, newTempo)
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Tempo adjustment buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => incrementTempo(-10)}
        >
          <Text style={styles.adjustButtonText}>-10</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => incrementTempo(-1)}
        >
          <Text style={styles.adjustButtonText}>-1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => incrementTempo(1)}
        >
          <Text style={styles.adjustButtonText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => incrementTempo(10)}
        >
          <Text style={styles.adjustButtonText}>+10</Text>
        </TouchableOpacity>
      </View>

      {/* Rotary dial visual */}
      <View style={styles.dialContainer} {...panResponder.panHandlers}>
        <View style={styles.dial}>
          <View style={styles.dialKnob}>
            <View
              style={[
                styles.dialIndicator,
                {
                  transform: [
                    {
                      rotate: `${
                        ((tempo - METRONOME_CONFIG.minTempo) /
                          (METRONOME_CONFIG.maxTempo - METRONOME_CONFIG.minTempo)) *
                          270 -
                        135
                      }deg`,
                    },
                  ],
                },
              ]}
            />
          </View>
          <Text style={styles.dialLabel}>TEMPO</Text>
        </View>
      </View>

      {/* Tap tempo button */}
      <TouchableOpacity style={styles.tapButton} onPress={onTapTempo}>
        <Text style={styles.tapButtonText}>TAP</Text>
        <Text style={styles.tapButtonSubtext}>TEMPO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  adjustButton: {
    backgroundColor: COLORS.buttonGray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#555',
    minWidth: 50,
    alignItems: 'center',
  },
  adjustButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  dialContainer: {
    marginVertical: 16,
  },
  dial: {
    alignItems: 'center',
  },
  dialKnob: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.bodyAccent,
    borderWidth: 3,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  dialIndicator: {
    position: 'absolute',
    width: 4,
    height: 35,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    top: 8,
  },
  dialLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  tapButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  tapButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tapButtonSubtext: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.8,
  },
});
