import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog,
  FAB,
  HelperText,
  IconButton,
  Menu,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import {
  changeUserPassword,
  deleteUser,
  fetchUsers,
  lockUser,
  unlockUser,
} from '../api/users';
import { getErrorMessage } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { LoadingView } from '../components/LoadingView';
import { RoleBadge } from '../components/RoleBadge';
import { FullUser } from '../types';
import { RootNavigationProp } from '../navigation/types';

export default function UsersListScreen() {
  const { user: me } = useAuth();
  const navigation = useNavigation<RootNavigationProp>();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(1),
  });

  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [passwordDialogUser, setPasswordDialogUser] = useState<FullUser | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  const lockMutation = useMutation({
    mutationFn: ({ id, lock }: { id: number; lock: boolean }) =>
      lock ? lockUser(id) : unlockUser(id),
    onSuccess: invalidate,
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: invalidate,
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      changeUserPassword(passwordDialogUser!.id, password, passwordConfirm),
    onSuccess: () => {
      setPasswordDialogUser(null);
      setPassword('');
      setPasswordConfirm('');
      setSnackbar('Password changed.');
    },
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  if (isLoading) return <LoadingView />;

  const users = data?.data ?? [];
  const canLock = me?.permissions.is_admin || me?.permissions.is_super_admin;
  const canCreate = canLock;

  return (
    <View style={styles.flex}>
      {users.length === 0 ? (
        <EmptyState icon="account-cog-outline" title="No users to manage" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => String(u.id)}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowMeta}>{item.email}</Text>
                <View style={styles.badgeRow}>
                  <RoleBadge role={item.role} />
                  {!item.is_active ? <Text style={styles.inactive}>Inactive</Text> : null}
                  {item.locked_at ? <Text style={styles.locked}>Locked</Text> : null}
                </View>
              </View>
              <Menu
                visible={menuFor === item.id}
                onDismiss={() => setMenuFor(null)}
                anchor={
                  <IconButton icon="dots-vertical" onPress={() => setMenuFor(item.id)} />
                }
              >
                <Menu.Item
                  title="Edit"
                  leadingIcon="pencil-outline"
                  onPress={() => {
                    setMenuFor(null);
                    navigation.navigate('UserForm', { mode: 'edit', id: item.id });
                  }}
                />
                <Menu.Item
                  title="Change password"
                  leadingIcon="lock-reset"
                  onPress={() => {
                    setMenuFor(null);
                    setPasswordDialogUser(item);
                  }}
                />
                {canLock ? (
                  <Menu.Item
                    title={item.locked_at ? 'Unlock' : 'Lock'}
                    leadingIcon={item.locked_at ? 'lock-open-variant-outline' : 'lock-outline'}
                    onPress={() => {
                      setMenuFor(null);
                      lockMutation.mutate({ id: item.id, lock: !item.locked_at });
                    }}
                  />
                ) : null}
                <Menu.Item
                  title="Delete"
                  leadingIcon="trash-can-outline"
                  onPress={() => {
                    setMenuFor(null);
                    deleteMutation.mutate(item.id);
                  }}
                />
              </Menu>
            </View>
          )}
        />
      )}

      {canCreate ? (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('UserForm', { mode: 'create' })}
        />
      ) : null}

      <Portal>
        <Dialog visible={!!passwordDialogUser} onDismiss={() => setPasswordDialogUser(null)}>
          <Dialog.Title>Change password</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text style={styles.dialogSubtitle}>{passwordDialogUser?.name}</Text>
            <TextInput
              mode="outlined"
              label="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              mode="outlined"
              label="Confirm password"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
            />
            {password && passwordConfirm && password !== passwordConfirm ? (
              <HelperText type="error">Passwords do not match.</HelperText>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordDialogUser(null)}>Cancel</Button>
            <Button
              onPress={() => passwordMutation.mutate()}
              loading={passwordMutation.isPending}
              disabled={!password || password !== passwordConfirm}
            >
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
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: { fontWeight: '600', fontSize: 14 },
  rowMeta: { fontSize: 12, opacity: 0.6 },
  badgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 2 },
  inactive: { fontSize: 11, color: '#DC2626' },
  locked: { fontSize: 11, color: '#D97706' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  dialogContent: { gap: 12 },
  dialogSubtitle: { opacity: 0.6 },
});
