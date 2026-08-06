import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, HelperText, Menu, Snackbar, Text, TextInput } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { createContact, fetchContact, updateContact } from '../api/contacts';
import { fetchGroups } from '../api/groups';
import { fetchTags } from '../api/tags';
import { getErrorMessage } from '../api/client';
import { LoadingView } from '../components/LoadingView';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactForm'>;

const LIFECYCLE_STAGES = ['lead', 'prospect', 'customer', 'partner', 'vendor'];

export default function ContactFormScreen({ route, navigation }: Props) {
  const { mode } = route.params;
  const id = mode === 'edit' ? route.params.id : undefined;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: existing, isLoading: loadingContact } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => fetchContact(id as number),
    enabled: mode === 'edit',
  });
  const { data: groups } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups });
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: fetchTags });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [lifecycleStage, setLifecycleStage] = useState('');
  const [groupId, setGroupId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [stageMenuOpen, setStageMenuOpen] = useState(false);
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setName(existing.name ?? '');
      setPhone(existing.phone ?? '');
      setEmail(existing.email ?? '');
      setCompany(existing.company ?? '');
      setJobTitle(existing.job_title ?? '');
      setWebsite(existing.website ?? '');
      setAddress(existing.address ?? '');
      setNotes(existing.notes ?? '');
      setLifecycleStage(existing.lifecycle_stage ?? '');
      setGroupId(existing.group_id ?? null);
      setSelectedTags((existing.tags ?? []).map((t) => t.id));
    }
  }, [existing]);

  const isManagerEditingExisting = mode === 'edit' && (user?.permissions.is_manager ?? false);

  const mutation = useMutation({
    mutationFn: async () => {
      const values = {
        name,
        phone,
        email,
        company,
        job_title: jobTitle,
        website,
        address,
        notes,
        lifecycle_stage: lifecycleStage,
        group_id: groupId,
        tags: selectedTags,
      };
      if (mode === 'create') {
        return { created: true as const, result: await createContact(values) };
      }
      return { created: false as const, result: await updateContact(id as number, values) };
    },
    onSuccess: ({ created, result }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (created) {
        navigation.goBack();
        return;
      }
      const updateResult = result as Awaited<ReturnType<typeof updateContact>>;
      queryClient.invalidateQueries({ queryKey: ['contact', id] });
      if (updateResult.queued) {
        navigation.goBack();
      } else if (updateResult.contact) {
        navigation.goBack();
      } else {
        setSnackbar(updateResult.message);
      }
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (mode === 'edit' && loadingContact) return <LoadingView />;

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const selectedGroup = groups?.find((g) => g.id === groupId);

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        {isManagerEditingExisting ? (
          <Text style={styles.notice}>
            Your changes will be submitted for Admin approval before they apply.
          </Text>
        ) : null}

        <TextInput mode="outlined" label="Full name *" value={name} onChangeText={setName} style={styles.input} />
        <TextInput
          mode="outlined"
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput mode="outlined" label="Company" value={company} onChangeText={setCompany} style={styles.input} />
        <TextInput mode="outlined" label="Job title" value={jobTitle} onChangeText={setJobTitle} style={styles.input} />
        <TextInput mode="outlined" label="Website" value={website} onChangeText={setWebsite} autoCapitalize="none" style={styles.input} />
        <TextInput mode="outlined" label="Address" value={address} onChangeText={setAddress} multiline style={styles.input} />

        <Menu
          visible={stageMenuOpen}
          onDismiss={() => setStageMenuOpen(false)}
          anchor={
            <TextInput
              mode="outlined"
              label="Lifecycle stage"
              value={lifecycleStage}
              editable={false}
              onPressIn={() => setStageMenuOpen(true)}
              right={<TextInput.Icon icon="chevron-down" onPress={() => setStageMenuOpen(true)} />}
              style={styles.input}
            />
          }
        >
          {LIFECYCLE_STAGES.map((stage) => (
            <Menu.Item
              key={stage}
              title={stage}
              onPress={() => {
                setLifecycleStage(stage);
                setStageMenuOpen(false);
              }}
            />
          ))}
        </Menu>

        {groups && groups.length > 0 ? (
          <Menu
            visible={groupMenuOpen}
            onDismiss={() => setGroupMenuOpen(false)}
            anchor={
              <TextInput
                mode="outlined"
                label="Group"
                value={selectedGroup?.name ?? 'None'}
                editable={false}
                onPressIn={() => setGroupMenuOpen(true)}
                right={<TextInput.Icon icon="chevron-down" onPress={() => setGroupMenuOpen(true)} />}
                style={styles.input}
              />
            }
          >
            <Menu.Item
              title="None"
              onPress={() => {
                setGroupId(null);
                setGroupMenuOpen(false);
              }}
            />
            {groups.map((g) => (
              <Menu.Item
                key={g.id}
                title={g.name}
                onPress={() => {
                  setGroupId(g.id);
                  setGroupMenuOpen(false);
                }}
              />
            ))}
          </Menu>
        ) : null}

        {tags && tags.length > 0 ? (
          <View style={styles.tagsBlock}>
            <Text style={styles.tagsLabel}>Tags</Text>
            <View style={styles.tagsRow}>
              {tags.map((t) => (
                <Chip
                  key={t.id}
                  selected={selectedTags.includes(t.id)}
                  onPress={() => toggleTag(t.id)}
                  style={styles.tagChip}
                >
                  {t.name}
                </Chip>
              ))}
            </View>
          </View>
        ) : null}

        <TextInput
          mode="outlined"
          label="Quick notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        {error ? <HelperText type="error">{error}</HelperText> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={!name.trim() || mutation.isPending}
          style={styles.submitButton}
          contentStyle={styles.submitContent}
        >
          {mode === 'create' ? 'Create contact' : 'Save changes'}
        </Button>
      </View>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar(null)} duration={3000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 4 },
  input: { marginBottom: 12 },
  notice: {
    backgroundColor: '#EEF2FF',
    color: '#3730A3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 13,
  },
  tagsBlock: { marginBottom: 12 },
  tagsLabel: { marginBottom: 8, opacity: 0.7, fontSize: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {},
  footer: { padding: 12, borderTopWidth: 1, borderTopColor: '#EEF0F3', backgroundColor: 'white' },
  submitButton: { borderRadius: 8 },
  submitContent: { paddingVertical: 6 },
});
