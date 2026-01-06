/**
 * ScoreImport - AI-powered sheet music analysis and import
 *
 * Allows users to upload a PDF or image of sheet music, which is then
 * analyzed by Claude to extract tempo, time signature, and structure.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, radius } from '../constants/theme';
import { useScoreAnalyzer } from '../hooks/useScoreAnalyzer';
import { AnalyzedScore } from '../types/scoreAnalysis';

const API_KEY_STORAGE_KEY = 'anthropic_api_key';

interface ScoreImportProps {
  /** Callback when a score is successfully imported */
  onImportComplete?: (analysis: AnalyzedScore) => void;
  /** Callback when import is cancelled */
  onCancel?: () => void;
}

export function ScoreImport({ onImportComplete, onCancel }: ScoreImportProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isLoadingKey, setIsLoadingKey] = useState(true);

  const analyzer = useScoreAnalyzer();

  // Load API key on mount
  useEffect(() => {
    SecureStore.getItemAsync(API_KEY_STORAGE_KEY)
      .then((key) => {
        setApiKey(key);
        setIsLoadingKey(false);
      })
      .catch(() => {
        setIsLoadingKey(false);
      });
  }, []);

  const saveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    try {
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKeyInput.trim());
      setApiKey(apiKeyInput.trim());
      setShowApiKeyModal(false);
      setApiKeyInput('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const handlePickDocument = async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      if (!asset) {
        return;
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: 'base64',
      });

      // Determine MIME type
      const mimeType = asset.mimeType || getMimeTypeFromExtension(asset.name);

      if (!mimeType) {
        Alert.alert('Error', 'Could not determine file type');
        return;
      }

      // Analyze the file
      const analysis = await analyzer.analyzeBase64(base64, mimeType, apiKey, true);

      if (onImportComplete) {
        onImportComplete(analysis);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred during analysis';
      Alert.alert('Analysis Failed', errorMessage);
    }
  };

  if (isLoadingKey) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main import button */}
      <Pressable style={styles.importButton} onPress={handlePickDocument}>
        {analyzer.isAnalyzing ? (
          <View style={styles.analyzing}>
            <ActivityIndicator color={colors.accent.primary} />
            <Text style={styles.analyzingText}>{analyzer.progressMessage || 'Analyzing...'}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.importIcon}>🎼</Text>
            <Text style={styles.importTitle}>Import Sheet Music</Text>
            <Text style={styles.importSubtitle}>
              Upload a PDF or image to auto-detect tempos
            </Text>
          </>
        )}
      </Pressable>

      {/* Error display */}
      {analyzer.analysisError && (
        <View style={styles.error}>
          <Text style={styles.errorText}>{analyzer.analysisError}</Text>
          <Pressable onPress={analyzer.clearError}>
            <Text style={styles.errorDismiss}>Dismiss</Text>
          </Pressable>
        </View>
      )}

      {/* Last analysis summary */}
      {analyzer.lastAnalysis && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>
            {analyzer.lastAnalysis.title || 'Imported Score'}
          </Text>
          <Text style={styles.summaryMeta}>
            {analyzer.lastAnalysis.initialTempo} BPM ·{' '}
            {analyzer.lastAnalysis.initialTimeSignature.numerator}/
            {analyzer.lastAnalysis.initialTimeSignature.denominator} ·{' '}
            {analyzer.show.parts.length} parts
          </Text>
          {analyzer.lastAnalysis.confidence < 0.7 && (
            <Text style={styles.lowConfidence}>
              Low confidence analysis - please verify
            </Text>
          )}
        </View>
      )}

      {/* API Key settings */}
      <Pressable style={styles.settingsButton} onPress={() => setShowApiKeyModal(true)}>
        <Text style={styles.settingsText}>
          {apiKey ? 'Update Claude API Key' : 'Set Claude API Key'}
        </Text>
      </Pressable>

      {/* API Key Modal */}
      <Modal visible={showApiKeyModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowApiKeyModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Claude API Key</Text>
            <Text style={styles.modalSubtitle}>
              Enter your Anthropic API key to enable AI-powered sheet music analysis
            </Text>

            <TextInput
              style={styles.apiKeyInput}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="sk-ant-..."
              placeholderTextColor={colors.text.disabled}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => {
                  setShowApiKeyModal(false);
                  setApiKeyInput('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={saveApiKey}>
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>

            <Text style={styles.modalHint}>
              Get your API key at console.anthropic.com
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/**
 * Get MIME type from file extension
 */
function getMimeTypeFromExtension(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },

  importButton: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.accent.dim,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  importIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  importTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  importSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  analyzing: {
    alignItems: 'center',
    gap: spacing.md,
  },
  analyzingText: {
    fontSize: 15,
    color: colors.accent.primary,
    fontWeight: '500',
  },

  error: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    flex: 1,
  },
  errorDismiss: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
    marginLeft: spacing.md,
  },

  summary: {
    backgroundColor: colors.accent.subtle,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent.dim,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  summaryMeta: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  lowConfidence: {
    fontSize: 12,
    color: colors.warning,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },

  settingsButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textDecorationLine: 'underline',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.bg.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  apiKeyInput: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalCancel: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  modalSave: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.bg.primary,
  },
  modalHint: {
    fontSize: 12,
    color: colors.text.disabled,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
