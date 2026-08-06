import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Menu, Switch, Text, TextInput } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { createUser, fetchUsers, updateUser } from '../api/users';
import { getErrorMessage } from '../api/client';
import { LoadingView } from '../components/LoadingView';
import { Role } from '../types';
import { roleLabels } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'UserForm'>;

function allowedRolesFor(actorRole?: Role): Role[] {
  if (actorRole === 'super_admin') return ['super_admin', 'admin', 'manager', 'clerk'];
  if (actorRole === 'admin') return ['manager', 'clerk'];
  return ['clerk'];
}

export default function UserFormScreen({ route, navigation }: Props) {
  const { mode } = route.params;
  const id = mode === 'edit' ? route.params.id : undefined;
  const { user: me } = useAuth();
  const queryClient = useQueryClient();

  // No single-user GET is exposed for editing beyond the list, so reuse the
  // cached list query and find the row we're editing.
  const { data: usersPage, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(1),
    enabled: mode === 'edit',
  });
  const existing = usersPage?.data.find((u) => u.id === id);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<Role>('clerk');
  const [isActive, setIsActive] = useState(true);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setEmail(existing.email);
      setRole(existing.role);
      setIsActive(existing.is_active);
    }
  }, [existing]);

  const roleOptions = allowedRolesFor(me?.role);

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === 'create') {
        return createUser({ name, email, password, password_confirmation: passwordConfirm, role });
      }
      return updateUser(id as number, { name, email, role, is_active: isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigation.goBack();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (mode === 'edit' && loadingUsers) return <LoadingView />;

  const canSubmit =
    name.trim() &&
    email.trim() &&
    (mode === 'edit' || (password.length >= 8 && password === passwordConfirm));

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput mode="outlined" label="Full name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {mode === 'create' ? (
          <>
            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Confirm password"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              style={styles.input}
            />
            {password && password.length < 8 ? (
              <HelperText type="error">Password must be at least 8 characters.</HelperText>
            ) : null}
          </>
        ) : null}

        <Menu
          visible={roleMenuOpen}
          onDismiss={() => setRoleMenuOpen(false)}
          anchor={
            <TextInput
              mode="outlined"
              label="Role"
              value={roleLabels[role]}
              editable={false}
              onPressIn={() => setRoleMenuOpen(true)}
              right={<TextInput.Icon icon="chevron-down" onPress={() => setRoleMenuOpen(true)} />}
              style={styles.input}
            />
          }
        >
          {roleOptions.map((r) => (
            <Menu.Item
              key={r}
              title={roleLabels[r]}
              onPress={() => {
                setRole(r);
                setRoleMenuOpen(false);
              }}
            />
          ))}
        </Menu>

        {mode === 'edit' ? (
          <View style={styles.switchRow}>
            <Text>Active</Text>
            <Switch value={isActive} onValueChange={setIsActive} />
          </View>
        ) : null}

        {error ? <HelperText type="error">{error}</HelperText> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={!canSubmit || mutation.isPending}
          contentStyle={styles.submitContent}
        >
          {mode === 'create' ? 'Create user' : 'Save changes'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16 },
  input: { marginBottom: 12 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  footer: { padding: 12, borderTopWidth: 1, borderTopColor: '#EEF0F3', backgroundColor: 'white' },
  submitContent: { paddingVertical: 6 },
});
