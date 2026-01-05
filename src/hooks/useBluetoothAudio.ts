/**
 * Bluetooth Audio Manager for Megavox and other PA systems
 *
 * Handles:
 * - Latency detection and calibration
 * - Audio compensation for Bluetooth delay
 * - Settings persistence
 *
 * Typical Bluetooth latency:
 * - aptX: 40-80ms
 * - AAC: 90-130ms
 * - SBC: 170-270ms
 *
 * Megavox speakers typically use SBC codec, so we default to ~200ms
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const STORAGE_KEY = 'tempo_bluetooth_settings_v1';

export interface BluetoothSettings {
  // Latency compensation in milliseconds
  latencyCompensation: number;
  // Whether to show visual cue ahead of audio
  visualLeadEnabled: boolean;
  // Custom device name (for presets)
  devicePreset: 'megavox' | 'generic' | 'wired' | 'custom';
  // Auto-calibration enabled
  autoCalibrate: boolean;
}

const DEFAULT_SETTINGS: BluetoothSettings = {
  latencyCompensation: 0,
  visualLeadEnabled: true,
  devicePreset: 'wired',
  autoCalibrate: false,
};

// Preset latency values for common devices
const DEVICE_PRESETS = {
  megavox: 200,    // Megavox PA typically uses SBC
  generic: 150,    // Generic Bluetooth speaker
  wired: 0,        // Wired/built-in speaker
  custom: 0,       // User-defined
};

export function useBluetoothAudio() {
  const [settings, setSettings] = useState<BluetoothSettings>(DEFAULT_SETTINGS);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);

  // Calibration data
  const calibrationTaps = useRef<number[]>([]);
  const calibrationStartTime = useRef<number>(0);
  const expectedBeatTime = useRef<number>(0);

  // Load settings
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) {
          try {
            const parsed = JSON.parse(data) as BluetoothSettings;
            setSettings(parsed);
          } catch {
            console.warn('Failed to parse Bluetooth settings');
          }
        }
      })
      .catch(console.warn);
  }, []);

  // Save settings
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(console.warn);
  }, [settings]);

  // Set device preset
  const setDevicePreset = useCallback((preset: BluetoothSettings['devicePreset']) => {
    setSettings((prev) => ({
      ...prev,
      devicePreset: preset,
      latencyCompensation: preset === 'custom' ? prev.latencyCompensation : DEVICE_PRESETS[preset],
    }));
  }, []);

  // Set custom latency
  const setLatencyCompensation = useCallback((ms: number) => {
    setSettings((prev) => ({
      ...prev,
      latencyCompensation: Math.max(0, Math.min(500, ms)),
      devicePreset: 'custom',
    }));
  }, []);

  // Toggle visual lead
  const setVisualLeadEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      visualLeadEnabled: enabled,
    }));
  }, []);

  /**
   * Start calibration process
   * User taps in sync with what they HEAR
   * We compare to when we PLAYED the sound
   * Difference = latency
   */
  const startCalibration = useCallback(() => {
    setIsCalibrating(true);
    setCalibrationStep(0);
    calibrationTaps.current = [];
    calibrationStartTime.current = Date.now();
  }, []);

  /**
   * Record a calibration tap
   * Should be called when user taps in sync with heard beat
   */
  const recordCalibrationTap = useCallback((expectedTime: number) => {
    if (!isCalibrating) return;

    const actualTime = Date.now();
    const difference = actualTime - expectedTime;

    calibrationTaps.current.push(difference);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setCalibrationStep((prev) => prev + 1);

    // After 8 taps, calculate average latency
    if (calibrationTaps.current.length >= 8) {
      // Remove outliers (highest and lowest)
      const sorted = [...calibrationTaps.current].sort((a, b) => a - b);
      const trimmed = sorted.slice(1, -1);

      // Calculate median
      const mid = Math.floor(trimmed.length / 2);
      const median = trimmed.length % 2
        ? trimmed[mid]
        : (trimmed[mid - 1] + trimmed[mid]) / 2;

      // Round to nearest 10ms
      const calibratedLatency = Math.round(median / 10) * 10;

      setSettings((prev) => ({
        ...prev,
        latencyCompensation: Math.max(0, Math.min(500, calibratedLatency)),
        devicePreset: 'custom',
      }));

      setIsCalibrating(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [isCalibrating]);

  // Cancel calibration
  const cancelCalibration = useCallback(() => {
    setIsCalibrating(false);
    setCalibrationStep(0);
    calibrationTaps.current = [];
  }, []);

  /**
   * Get the visual lead time
   * If visual lead is enabled, visuals show ahead of audio
   * by the latency compensation amount
   */
  const getVisualLeadMs = useCallback(() => {
    return settings.visualLeadEnabled ? settings.latencyCompensation : 0;
  }, [settings.visualLeadEnabled, settings.latencyCompensation]);

  /**
   * Get audio delay adjustment
   * This is how much earlier we need to trigger audio
   * so it arrives at the speaker at the right time
   *
   * Note: For Web Audio API, we schedule audio ahead anyway,
   * so this primarily affects the visual/haptic sync
   */
  const getAudioDelayMs = useCallback(() => {
    return settings.latencyCompensation;
  }, [settings.latencyCompensation]);

  return {
    settings,
    isCalibrating,
    calibrationStep,
    calibrationProgress: calibrationStep / 8,

    // Actions
    setDevicePreset,
    setLatencyCompensation,
    setVisualLeadEnabled,
    startCalibration,
    recordCalibrationTap,
    cancelCalibration,

    // Helpers
    getVisualLeadMs,
    getAudioDelayMs,

    // Presets
    devicePresets: DEVICE_PRESETS,
  };
}

export type BluetoothAudioHook = ReturnType<typeof useBluetoothAudio>;
