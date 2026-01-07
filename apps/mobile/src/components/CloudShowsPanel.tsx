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
} from "react-native";
import { colors, spacing, radius } from "../constants/theme";
import { useAuth, useCloudSync, ShowHook } from "../hooks";

interface CloudShowsPanelProps {
  show: ShowHook;
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
            onPress: () => importShow(showId),
          },
        ]
      );
    } else {
      importShow(showId);
    }
  };

  const importShow = async (showId: string) => {
    setImportingShowId(showId);

    const localShow = await cloudSync.fetchShowWithParts(showId);

    if (localShow) {
      // Clear current show and set the new one
      show.clearShow();
      show.setShowName(localShow.name);

      // Add all parts
      for (const part of localShow.parts) {
        show.addPart(part.name, part.tempo, part.beats);
      }

      Alert.alert("Success", `Imported "${localShow.name}" with ${localShow.parts.length} parts`);
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
      <View style={styles.container}>
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
      </View>
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

  // Auth form
  authContainer: {
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.accent.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
  },
  authButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.bg.primary,
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
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
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
    letterSpacing: 1.5,
  },
  refreshBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.accent.primary,
  },

  // Empty state
  empty: {
    paddingVertical: spacing.xl,
    alignItems: "center",
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

  // Shows list
  showsList: {
    flex: 1,
  },
  showCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.sm,
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
    color: colors.text.secondary,
    marginTop: 2,
  },
  importBadge: {
    backgroundColor: colors.accent.subtle,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
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
