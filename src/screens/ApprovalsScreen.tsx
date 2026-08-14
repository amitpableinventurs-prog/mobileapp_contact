import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { fetchPendingQueue } from '../api/approvals';
import * as approvalsApi from '../api/approvals';
import { getErrorMessage } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { LoadingView } from '../components/LoadingView';
import { RootNavigationProp } from '../navigation/types';
import { Contact, ContactEditRequest } from '../types';
import { branding } from '../branding';

export default function ApprovalsScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['pending-queue'],
    queryFn: () => fetchPendingQueue(),
  });

  // The pending queue is capped at 25 items per section server-side; these
  // track any extra pages fetched via "Load more" and are dropped whenever
  // the base query re-fetches (approve/reject can shift what's on each page).
  const [extraContacts, setExtraContacts] = useState<Contact[]>([]);
  const [extraEdits, setExtraEdits] = useState<ContactEditRequest[]>([]);
  const [contactsPage, setContactsPage] = useState(1);
  const [editsPage, setEditsPage] = useState(1);
  const [loadingMoreContacts, setLoadingMoreContacts] = useState(false);
  const [loadingMoreEdits, setLoadingMoreEdits] = useState(false);

  useEffect(() => {
    setExtraContacts([]);
    setExtraEdits([]);
    setContactsPage(1);
    setEditsPage(1);
  }, [data]);

  const contactsLastPage = data?.contacts.last_page ?? 1;
  const editsLastPage = data?.edit_requests.last_page ?? 1;

  const loadMoreContacts = async () => {
    if (loadingMoreContacts || contactsPage >= contactsLastPage) return;
    setLoadingMoreContacts(true);
    try {
      const next = contactsPage + 1;
      const page = await fetchPendingQueue({ contactsPage: next });
      setExtraContacts((prev) => [...prev, ...page.contacts.data]);
      setContactsPage(next);
    } catch (err) {
      setSnackbar(getErrorMessage(err));
    } finally {
      setLoadingMoreContacts(false);
    }
  };

  const loadMoreEdits = async () => {
    if (loadingMoreEdits || editsPage >= editsLastPage) return;
    setLoadingMoreEdits(true);
    try {
      const next = editsPage + 1;
      const page = await fetchPendingQueue({ editsPage: next });
      setExtraEdits((prev) => [...prev, ...page.edit_requests.data]);
      setEditsPage(next);
    } catch (err) {
      setSnackbar(getErrorMessage(err));
    } finally {
      setLoadingMoreEdits(false);
    }
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pending-queue'] });
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const contactAction = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'approve' | 'reject' }) =>
      action === 'approve' ? approvalsApi.approveContact(id) : approvalsApi.rejectContact(id),
    onSuccess: invalidate,
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const editAction = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'approve' | 'reject' }) => {
      if (action === 'approve') {
        await approvalsApi.approveEditRequest(id);
      } else {
        await approvalsApi.rejectEditRequest(id);
      }
    },
    onSuccess: invalidate,
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  if (isLoading) return <LoadingView />;

  const pendingContacts = [...(data?.contacts.data ?? []), ...extraContacts];
  const pendingEdits = [...(data?.edit_requests.data ?? []), ...extraEdits];
  const totalContacts = data?.contacts.total ?? pendingContacts.length;
  const totalEdits = data?.edit_requests.total ?? pendingEdits.length;

  if (pendingContacts.length === 0 && pendingEdits.length === 0) {
    return <EmptyState icon="check-circle-outline" title="All caught up" subtitle="No pending approvals." />;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {pendingContacts.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New contacts ({totalContacts})</Text>
          {pendingContacts.map((contact) => (
            <View key={contact.id} style={styles.card}>
              <Text
                style={styles.cardTitle}
                onPress={() => navigation.navigate('ContactDetail', { id: contact.id })}
              >
                {contact.name}
              </Text>
              <Text style={styles.cardMeta}>
                {contact.phone ?? contact.email ?? '—'} · submitted by {contact.owner?.name ?? 'Unknown'}
              </Text>
              <View style={styles.actions}>
                <Button
                  mode="contained-tonal"
                  onPress={() => contactAction.mutate({ id: contact.id, action: 'approve' })}
                  loading={contactAction.isPending}
                >
                  Approve
                </Button>
                <Button
                  mode="outlined"
                  textColor="#DC2626"
                  onPress={() => contactAction.mutate({ id: contact.id, action: 'reject' })}
                >
                  Reject
                </Button>
              </View>
            </View>
          ))}
          {contactsPage < contactsLastPage ? (
            <Button onPress={loadMoreContacts} loading={loadingMoreContacts} disabled={loadingMoreContacts} compact>
              Load more
            </Button>
          ) : null}
        </View>
      ) : null}

      {pendingEdits.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit requests ({totalEdits})</Text>
          {pendingEdits.map((edit) => (
            <View key={edit.id} style={styles.card}>
              <Text
                style={styles.cardTitle}
                onPress={() => navigation.navigate('ContactDetail', { id: edit.contact_id })}
              >
                {edit.contact?.name ?? `Contact #${edit.contact_id}`}
              </Text>
              <Text style={styles.cardMeta}>Requested by {edit.requestedBy?.name ?? 'Unknown'}</Text>
              <View style={styles.changesBlock}>
                {Object.entries(edit.changes).map(([field, value]) => {
                  const original = edit.original?.[field];
                  const originalDisplay =
                    original === null || original === undefined || original === '' ? '—' : String(original);
                  return (
                    <Text key={field} style={styles.changeLine}>
                      <Text style={styles.changeField}>{field}: </Text>
                      {originalDisplay} <Text style={styles.changeArrow}>→</Text> {String(value)}
                    </Text>
                  );
                })}
              </View>
              <View style={styles.actions}>
                <Button
                  mode="contained-tonal"
                  onPress={() => editAction.mutate({ id: edit.id, action: 'approve' })}
                  loading={editAction.isPending}
                >
                  Approve
                </Button>
                <Button
                  mode="outlined"
                  textColor="#DC2626"
                  onPress={() => editAction.mutate({ id: edit.id, action: 'reject' })}
                >
                  Reject
                </Button>
              </View>
            </View>
          ))}
          {editsPage < editsLastPage ? (
            <Button onPress={loadMoreEdits} loading={loadingMoreEdits} disabled={loadingMoreEdits} compact>
              Load more
            </Button>
          ) : null}
        </View>
      ) : null}

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar(null)} duration={3000}>
        {snackbar}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 20 },
  section: { gap: 10 },
  sectionTitle: { fontWeight: '700', fontSize: 15, marginBottom: 2 },
  card: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, gap: 6 },
  cardTitle: { fontWeight: '600', fontSize: 15, color: branding.colors.primary },
  cardMeta: { fontSize: 12, opacity: 0.6 },
  changesBlock: { backgroundColor: 'white', borderRadius: 8, padding: 8, gap: 2 },
  changeLine: { fontSize: 12 },
  changeField: { fontWeight: '600' },
  changeArrow: { opacity: 0.5 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
});
