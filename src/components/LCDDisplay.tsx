import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/metronome';

interface LCDDisplayProps {
  tempo: number;
  beat1: number;
  beat2: number | null;
  currentBeat: number;
  isPlaying: boolean;
}

export function LCDDisplay({
  tempo,
  beat1,
  beat2,
  currentBeat,
  isPlaying,
}: LCDDisplayProps) {
  const formatTempo = (t: number): string => {
    return t.toString().padStart(3, ' ');
  };

  return (
    <View style={styles.container}>
      {/* LCD Screen bezel */}
      <View style={styles.bezel}>
        {/* LCD Screen */}
        <View style={styles.screen}>
          {/* Top row - Mode indicator */}
          <View style={styles.topRow}>
            <Text style={styles.modeText}>METRONOME</Text>
            <Text style={styles.modeText}>
              {isPlaying ? '▶' : '■'}
            </Text>
          </View>

          {/* Main tempo display */}
          <View style={styles.tempoRow}>
            <Text style={styles.tempoValue}>{formatTempo(tempo)}</Text>
            <Text style={styles.tempoUnit}>BPM</Text>
          </View>

          {/* Beat display */}
          <View style={styles.beatRow}>
            <View style={styles.beatSection}>
              <Text style={styles.beatLabel}>BEAT1</Text>
              <Text style={styles.beatValue}>{beat1}</Text>
            </View>
            <View style={styles.beatDivider} />
            <View style={styles.beatSection}>
              <Text style={styles.beatLabel}>BEAT2</Text>
              <Text style={styles.beatValue}>
                {beat2 === null ? 'OFF' : beat2}
              </Text>
            </View>
          </View>

          {/* Beat indicator dots */}
          <View style={styles.beatIndicatorRow}>
            {Array.from({ length: beat1 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.beatDot,
                  isPlaying && currentBeat === i + 1 && styles.beatDotActive,
                  i === 0 && styles.beatDotFirst,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  bezel: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  screen: {
    backgroundColor: COLORS.lcdBackground,
    borderRadius: 4,
    padding: 16,
    minWidth: 280,
    borderWidth: 1,
    borderColor: '#0a200a',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modeText: {
    color: COLORS.lcdText,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  tempoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 12,
  },
  tempoValue: {
    color: COLORS.lcdText,
    fontSize: 64,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 4,
    textShadowColor: COLORS.lcdText,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tempoUnit: {
    color: COLORS.lcdText,
    fontSize: 18,
    fontFamily: 'monospace',
    marginLeft: 8,
    opacity: 0.8,
  },
  beatRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lcdTextDim,
  },
  beatSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  beatLabel: {
    color: COLORS.lcdText,
    fontSize: 10,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  beatValue: {
    color: COLORS.lcdText,
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  beatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.lcdTextDim,
  },
  beatIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  beatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.lcdTextDim,
  },
  beatDotActive: {
    backgroundColor: COLORS.lcdText,
    shadowColor: COLORS.lcdText,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  beatDotFirst: {
    backgroundColor: COLORS.ledOrangeDim,
  },
});
