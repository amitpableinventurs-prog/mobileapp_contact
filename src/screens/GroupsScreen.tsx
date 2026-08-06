import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Dialog, FAB, IconButton, Portal, Snackbar, Text, TextInput } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createGroup, deleteGroup, fetchGroups, updateGroup } from '../api/groups';
import { getErrorMessage } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { LoadingView } from '../components/LoadingView';
import { Group } from '../types';

const PALETTE = ['#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#D97706', '#16A34A', '#0891B2'];

export default function GroupsScreen() {
  const queryClient = useQueryClient();
  const { data: groups, isLoading } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups });

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['groups'] });

  const saveMutation = useMutation({
    mutationFn: () => (editing ? updateGroup(editing.id, name, color) : createGroup(name, color)),
    onSuccess: () => {
      invalidate();
      setDialogVisible(false);
    },
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteGroup(id),
    onSuccess: invalidate,
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const openCreate = () => {
    setEditing(null);
    setName('');
    setColor(PALETTE[0]);
    setDialogVisible(true);
  };

  const openEdit = (group: Group) => {
    setEditing(group);
    setName(group.name);
    setColor(group.color ?? PALETTE[0]);
    setDialogVisible(true);
  };

  if (isLoading) return <LoadingView />;

  return (
    <View style={styles.flex}>
      {!groups || groups.length === 0 ? (
        <EmptyState icon="folder-multiple-outline" title="No groups yet" subtitle="Create one to organize contacts." />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => String(g.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: item.color ?? '#9CA3AF' }]} />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.name}</Text>
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
          <Dialog.Title>{editing ? 'Edit group' : 'New group'}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput mode="outlined" label="Name" value={name} onChangeText={setName} />
            <View style={styles.paletteRow}>
              {PALETTE.map((c) => (
                <IconButton
                  key={c}
                  icon={color === c ? 'check-circle' : 'circle'}
                  iconColor={c}
                  size={28}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>
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
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 4 },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 8 },
  rowBody: { flex: 1 },
  rowTitle: { fontWeight: '600', fontSize: 14 },
  rowMeta: { fontSize: 12, opacity: 0.6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  dialogContent: { gap: 12 },
  paletteRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
