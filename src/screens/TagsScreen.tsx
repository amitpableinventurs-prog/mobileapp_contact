import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Dialog, FAB, IconButton, Portal, Snackbar, Text, TextInput } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTag, deleteTag, fetchTags, updateTag } from '../api/tags';
import { getErrorMessage } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { LoadingView } from '../components/LoadingView';
import { Tag } from '../types';

export default function TagsScreen() {
  const queryClient = useQueryClient();
  const { data: tags, isLoading } = useQuery({ queryKey: ['tags'], queryFn: fetchTags });

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tags'] });

  const saveMutation = useMutation({
    mutationFn: () => (editing ? updateTag(editing.id, name) : createTag(name)),
    onSuccess: () => {
      invalidate();
      setDialogVisible(false);
    },
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onSuccess: invalidate,
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDialogVisible(true);
  };

  const openEdit = (tag: Tag) => {
    setEditing(tag);
    setName(tag.name);
    setDialogVisible(true);
  };

  if (isLoading) return <LoadingView />;

  return (
    <View style={styles.flex}>
      {!tags || tags.length === 0 ? (
        <EmptyState icon="tag-multiple-outline" title="No tags yet" subtitle="Create one to label contacts." />
      ) : (
        <FlatList
          data={tags}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>#{item.name}</Text>
                <Text style={styles.rowMeta}>{item.contacts_count ?? 0} contacts</Text>
              </View>
              <IconButton icon="pencil-outline" size={20} onPress={() => openEdit(item)} />
              <IconButton icon="delete-outline" size={20} onPress={() => deleteMutation.mutate(item.id)} />
            </View>
          )}
        />
      )}

      <FAB icon="plus" style={styles.fab} onPress={openCreate} />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editing ? 'Edit tag' : 'New tag'}</Dialog.Title>
          <Dialog.Content>
            <TextInput mode="outlined" label="Name" value={name} onChangeText={setName} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => saveMutation.mutate()} loading={saveMutation.isPending} disabled={!name.trim()}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar(null)} duration={3000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowBody: { flex: 1 },
  rowTitle: { fontWeight: '600', fontSize: 14 },
  rowMeta: { fontSize: 12, opacity: 0.6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
