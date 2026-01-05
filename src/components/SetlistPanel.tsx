import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { colors, font, spacing, radius } from '../constants/theme';
import { SetlistHook, Setlist, SetlistItem } from '../hooks/useSetlist';

interface SetlistPanelProps {
  setlist: SetlistHook;
  onSelectTempo: (tempo: number, beats: number) => void;
}

export function SetlistPanel({ setlist, onSelectTempo }: SetlistPanelProps) {
  const [view, setView] = useState<'list' | 'detail' | 'create' | 'addItem'>(
    'list'
  );
  const [newName, setNewName] = useState('');
  const [editingSetlist, setEditingSetlist] = useState<Setlist | null>(null);
  const [newItem, setNewItem] = useState({ name: '', tempo: 120, beats: 4 });

  const {
    setlists,
    activeSetlist,
    activeItemIndex,
    currentItem,
    hasNext,
    hasPrev,
    createSetlist,
    deleteSetlist,
    setActiveSetlist,
    addItem,
    removeItem,
    nextItem,
    prevItem,
    goToItem,
  } = setlist;

  // Handle creating new setlist
  const handleCreate = () => {
    if (newName.trim()) {
      const created = createSetlist(newName.trim());
      setNewName('');
      setEditingSetlist(created);
      setView('detail');
    }
  };

  // Handle adding item
  const handleAddItem = () => {
    if (editingSetlist && newItem.name.trim()) {
      addItem(editingSetlist.id, {
        name: newItem.name.trim(),
        tempo: newItem.tempo,
        beats: newItem.beats,
      });
      setNewItem({ name: '', tempo: 120, beats: 4 });
      setView('detail');
    }
  };

  // Handle delete setlist
  const handleDelete = (id: string) => {
    Alert.alert('Delete Setlist', 'Are you sure you want to delete this setlist?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteSetlist(id);
          if (editingSetlist?.id === id) {
            setEditingSetlist(null);
            setView('list');
          }
        },
      },
    ]);
  };

  // Handle selecting a setlist item
  const handleSelectItem = (item: SetlistItem, index: number) => {
    if (editingSetlist) {
      setActiveSetlist(editingSetlist.id);
    }
    goToItem(index);
    onSelectTempo(item.tempo, item.beats);
  };

  // Render setlist list
  if (view === 'list') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>SETLISTS</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setView('create')}
          >
            <Text style={styles.addButtonText}>+ New</Text>
          </Pressable>
        </View>

        {setlists.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No setlists yet</Text>
            <Text style={styles.emptyHint}>
              Create a setlist to save tempo sequences for your show
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scroll}>
            {setlists.map((s) => (
              <Pressable
                key={s.id}
                style={[
                  styles.setlistCard,
                  activeSetlist?.id === s.id && styles.setlistCardActive,
                ]}
                onPress={() => {
                  setEditingSetlist(s);
                  setView('detail');
                }}
              >
                <View style={styles.setlistInfo}>
                  <Text style={styles.setlistName}>{s.name}</Text>
                  <Text style={styles.setlistMeta}>
                    {s.items.length} item{s.items.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDelete(s.id)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  // Render create form
  if (view === 'create') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setView('list')}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>NEW SETLIST</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>NAME</Text>
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="e.g., Competition Show"
            placeholderTextColor={colors.text.disabled}
            autoFocus
          />

          <Pressable
            style={[styles.submitButton, !newName.trim() && styles.submitButtonDisabled]}
            onPress={handleCreate}
            disabled={!newName.trim()}
          >
            <Text style={styles.submitButtonText}>Create Setlist</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Render add item form
  if (view === 'addItem' && editingSetlist) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setView('detail')}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>ADD ITEM</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>NAME</Text>
          <TextInput
            style={styles.input}
            value={newItem.name}
            onChangeText={(text) => setNewItem((prev) => ({ ...prev, name: text }))}
            placeholder="e.g., Movement 1"
            placeholderTextColor={colors.text.disabled}
            autoFocus
          />

          <Text style={styles.label}>TEMPO</Text>
          <View style={styles.tempoRow}>
            <Pressable
              style={styles.tempoButton}
              onPress={() =>
                setNewItem((prev) => ({ ...prev, tempo: Math.max(30, prev.tempo - 10) }))
              }
            >
              <Text style={styles.tempoButtonText}>-10</Text>
            </Pressable>
            <Pressable
              style={styles.tempoButton}
              onPress={() =>
                setNewItem((prev) => ({ ...prev, tempo: Math.max(30, prev.tempo - 1) }))
              }
            >
              <Text style={styles.tempoButtonText}>-1</Text>
            </Pressable>
            <Text style={styles.tempoValue}>{newItem.tempo}</Text>
            <Pressable
              style={styles.tempoButton}
              onPress={() =>
                setNewItem((prev) => ({ ...prev, tempo: Math.min(300, prev.tempo + 1) }))
              }
            >
              <Text style={styles.tempoButtonText}>+1</Text>
            </Pressable>
            <Pressable
              style={styles.tempoButton}
              onPress={() =>
                setNewItem((prev) => ({ ...prev, tempo: Math.min(300, prev.tempo + 10) }))
              }
            >
              <Text style={styles.tempoButtonText}>+10</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>TIME SIGNATURE</Text>
          <View style={styles.beatsRow}>
            {[2, 3, 4, 5, 6, 7].map((b) => (
              <Pressable
                key={b}
                style={[
                  styles.beatChip,
                  newItem.beats === b && styles.beatChipActive,
                ]}
                onPress={() => setNewItem((prev) => ({ ...prev, beats: b }))}
              >
                <Text
                  style={[
                    styles.beatChipText,
                    newItem.beats === b && styles.beatChipTextActive,
                  ]}
                >
                  {b}/4
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[
              styles.submitButton,
              !newItem.name.trim() && styles.submitButtonDisabled,
            ]}
            onPress={handleAddItem}
            disabled={!newItem.name.trim()}
          >
            <Text style={styles.submitButtonText}>Add Item</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Render setlist detail
  if (view === 'detail' && editingSetlist) {
    // Refresh editing setlist from state
    const currentSetlist = setlists.find((s) => s.id === editingSetlist.id);
    if (!currentSetlist) {
      setView('list');
      return null;
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setView('list')}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {currentSetlist.name.toUpperCase()}
          </Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setView('addItem')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>

        {currentSetlist.items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items yet</Text>
            <Text style={styles.emptyHint}>
              Add tempo entries for each movement in your show
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scroll}>
            {currentSetlist.items.map((item, index) => (
              <Pressable
                key={item.id}
                style={[
                  styles.itemCard,
                  activeSetlist?.id === currentSetlist.id &&
                    activeItemIndex === index &&
                    styles.itemCardActive,
                ]}
                onPress={() => handleSelectItem(item, index)}
              >
                <View style={styles.itemNumber}>
                  <Text style={styles.itemNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.tempo} BPM · {item.beats}/4
                  </Text>
                </View>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => removeItem(currentSetlist.id, item.id)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Navigation controls when setlist is active */}
        {activeSetlist?.id === currentSetlist.id && currentSetlist.items.length > 1 && (
          <View style={styles.navControls}>
            <Pressable
              style={[styles.navButton, !hasPrev && styles.navButtonDisabled]}
              onPress={prevItem}
              disabled={!hasPrev}
            >
              <Text style={styles.navButtonText}>← Prev</Text>
            </Pressable>
            <Text style={styles.navPosition}>
              {activeItemIndex + 1} / {currentSetlist.items.length}
            </Text>
            <Pressable
              style={[styles.navButton, !hasNext && styles.navButtonDisabled]}
              onPress={nextItem}
              disabled={!hasNext}
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...font.label,
    color: colors.text.tertiary,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    fontSize: 14,
    color: colors.accent.primary,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: colors.accent.subtle,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent.primary,
  },

  // Empty state
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.text.disabled,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },

  // Scroll
  scroll: {
    flex: 1,
  },

  // Setlist card
  setlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  setlistCardActive: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.subtle,
  },
  setlistInfo: {
    flex: 1,
  },
  setlistName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  setlistMeta: {
    fontSize: 12,
    color: colors.text.disabled,
    marginTop: 2,
  },

  // Item card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  itemCardActive: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.subtle,
  },
  itemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.accent.primary,
    marginTop: 2,
  },

  // Delete button
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
    color: colors.text.disabled,
    fontWeight: '300',
  },

  // Form
  form: {
    paddingTop: spacing.md,
  },
  label: {
    ...font.label,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
  },
  tempoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  tempoButton: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  tempoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  tempoValue: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.accent.primary,
    minWidth: 80,
    textAlign: 'center',
  },
  beatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  beatChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  beatChipActive: {
    backgroundColor: colors.accent.subtle,
    borderColor: colors.accent.primary,
  },
  beatChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  beatChipTextActive: {
    color: colors.accent.primary,
  },
  submitButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitButtonDisabled: {
    backgroundColor: colors.bg.surface,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.bg.primary,
  },

  // Navigation
  navControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    marginTop: spacing.md,
  },
  navButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent.primary,
  },
  navPosition: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontVariant: ['tabular-nums'],
  },
});
