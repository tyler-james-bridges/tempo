/**
 * CloudShowsPanel - Cloud sync for settings drawer
 *
 * Allows signing in and importing shows from Tempo Cloud.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, spacing, radius } from "../constants/theme";
import { useAuth, useCloudSync, ShowHook, SyncedShowHook } from "../hooks";

interface CloudShowsPanelProps {
  show: ShowHook | SyncedShowHook;
  onClose: () => void;
}

export function CloudShowsPanel({ show, onClose }: CloudShowsPanelProps) {
  const auth = useAuth();
  const cloudSync = useCloudSync(auth.user?.id ?? null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [importingShowId, setImportingShowId] = useState<string | null>(null);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setAuthLoading(true);
    const result = isSignUp
      ? await auth.signUp(email, password)
      : await auth.signIn(email, password);

    setAuthLoading(false);

    if (!result.success) {
      Alert.alert("Error", result.error || "Authentication failed");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleImportShow = async (showId: string, showName: string) => {
    // Confirm if current show has content
    if (show.hasShow) {
      Alert.alert(
        "Replace Current Show?",
        `This will replace "${show.show.name || "your current show"}" with "${showName}".`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Replace",
            onPress: () => doImportShow(showId),
          },
        ]
      );
    } else {
      doImportShow(showId);
    }
  };

  const doImportShow = async (showId: string) => {
    setImportingShowId(showId);

    const localShow = await cloudSync.fetchShowWithParts(showId);

    if (localShow) {
      // Import the show with cloud link preserved
      show.importShow(localShow);

      Alert.alert(
        "Success",
        `Imported "${localShow.name}" with ${localShow.parts.length} parts.\n\nChanges will sync between mobile and web.`
      );
      onClose();
    } else {
      Alert.alert("Error", "Failed to import show");
    }

    setImportingShowId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  // Not authenticated - show login form
  if (!auth.isAuthenticated) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.authScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authContainer}>
            <Text style={styles.title}>Tempo Cloud</Text>
            <Text style={styles.subtitle}>
              Sign in to sync shows from the web app
            </Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.text.disabled}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.text.disabled}
              secureTextEntry
            />

            <Pressable
              style={[styles.authButton, authLoading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color={colors.bg.primary} />
              ) : (
                <Text style={styles.authButtonText}>
                  {isSignUp ? "Create Account" : "Sign In"}
                </Text>
              )}
            </Pressable>

            <Pressable onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.switchText}>
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </Text>
            </Pressable>

            {auth.error && <Text style={styles.errorText}>{auth.error}</Text>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Authenticated - show cloud shows
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>TEMPO CLOUD</Text>
          <Text style={styles.userEmail}>{auth.user?.email}</Text>
        </View>
        <Pressable style={styles.signOutBtn} onPress={auth.signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>YOUR SHOWS</Text>
          <Pressable
            style={styles.refreshBtn}
            onPress={cloudSync.fetchShows}
            disabled={cloudSync.loading}
          >
            {cloudSync.loading ? (
              <ActivityIndicator size="small" color={colors.accent.primary} />
            ) : (
              <Text style={styles.refreshText}>Refresh</Text>
            )}
          </Pressable>
        </View>

        {cloudSync.error && (
          <Text style={styles.errorText}>{cloudSync.error}</Text>
        )}

        {cloudSync.readyShows.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No shows yet</Text>
            <Text style={styles.emptyHint}>
              Upload sheet music at tempo-cloud.vercel.app
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.showsList} showsVerticalScrollIndicator={false}>
            {cloudSync.readyShows.map((cloudShow) => (
              <Pressable
                key={cloudShow.id}
                style={styles.showCard}
                onPress={() => handleImportShow(cloudShow.id, cloudShow.name)}
                disabled={importingShowId === cloudShow.id}
              >
                <View style={styles.showInfo}>
                  <Text style={styles.showName}>{cloudShow.name}</Text>
                  <Text style={styles.showMeta}>
                    {cloudShow.source_filename || "Manual"} •{" "}
                    {formatDate(cloudShow.created_at)}
                  </Text>
                </View>
                {importingShowId === cloudShow.id ? (
                  <ActivityIndicator size="small" color={colors.accent.primary} />
                ) : (
                  <View style={styles.importBadge}>
                    <Text style={styles.importBadgeText}>Import</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}

        {cloudSync.lastSynced && (
          <Text style={styles.hint}>
            Last synced: {cloudSync.lastSynced.toLocaleTimeString()}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Auth form - matches web's login page design
  authScrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  authContainer: {
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  // Input style matching web's .input class
  input: {
    backgroundColor: colors.bg.elevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
  },
  // Primary button style matching web btn-primary
  authButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: spacing.sm,
    // Shadow like web btn-primary
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  switchText: {
    fontSize: 14,
    color: colors.accent.primary,
    textAlign: "center",
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing.sm,
    backgroundColor: colors.errorMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  userEmail: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  signOutBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.error,
  },

  // Section
  section: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.tertiary,
    letterSpacing: 1,
  },
  refreshBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent.muted,
    borderRadius: 6,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.accent.primary,
  },

  // Empty state - matches web's empty card pattern
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.text.disabled,
    marginTop: spacing.xs,
    textAlign: "center",
  },

  // Shows list - card-interactive style matching web
  showsList: {
    flex: 1,
  },
  showCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.sm,
    // Card shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  showInfo: {
    flex: 1,
  },
  showName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  showMeta: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 2,
  },
  // Badge style matching web's badge pattern
  importBadge: {
    backgroundColor: colors.accent.muted,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  importBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent.primary,
  },
  hint: {
    fontSize: 12,
    color: colors.text.disabled,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
