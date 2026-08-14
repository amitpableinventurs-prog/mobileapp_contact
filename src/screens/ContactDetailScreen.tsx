import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Avatar,
  Button,
  Dialog,
  Divider,
  IconButton,
  Menu,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { branding } from '../branding';
import {
  banContact,
  deleteContact,
  fetchContact,
  rateContact,
  reactivateContact,
  suspendContact,
} from '../api/contacts';
import * as approvalsApi from '../api/approvals';
import { addNote, deleteNote } from '../api/notes';
import { logCall } from '../api/calls';
import { getErrorMessage } from '../api/client';
import { LoadingView } from '../components/LoadingView';
import { StatusChip } from '../components/StatusChip';
import { resolvePhotoUrl } from '../utils/photoUrl';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactDetail'>;

export default function ContactDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => fetchContact(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['contact', id] });
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['pending-queue'] });
  };

  const contactApprovalMutation = useMutation({
    mutationFn: (decision: 'approve' | 'reject') =>
      decision === 'approve' ? approvalsApi.approveContact(id) : approvalsApi.rejectContact(id),
    onSuccess: (_, decision) => {
      invalidate();
      setSnackbar(decision === 'approve' ? 'Contact approved.' : 'Contact rejected.');
    },
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const editApprovalMutation = useMutation({
    mutationFn: async ({ editId, decision }: { editId: number; decision: 'approve' | 'reject' }) => {
      if (decision === 'approve') {
        await approvalsApi.approveEditRequest(editId);
      } else {
        await approvalsApi.rejectEditRequest(editId);
      }
    },
    onSuccess: (_, { decision }) => {
      invalidate();
      setSnackbar(decision === 'approve' ? 'Edit approved.' : 'Edit rejected.');
    },
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const actionMutation = useMutation({
    mutationFn: async (action: 'suspend' | 'ban' | 'reactivate' | 'delete') => {
      if (action === 'suspend') return suspendContact(id);
      if (action === 'ban') return banContact(id);
      if (action === 'reactivate') return reactivateContact(id);
      return deleteContact(id);
    },
    onSuccess: (_, action) => {
      invalidate();
      if (action === 'delete') {
        navigation.goBack();
      } else {
        setSnackbar('Updated.');
      }
    },
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const noteMutation = useMutation({
    mutationFn: () => addNote(id, noteText.trim()),
    onSuccess: () => {
      setNoteText('');
      invalidate();
    },
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const rateMutation = useMutation({
    mutationFn: (rating: number) => rateContact(id, rating),
    onSuccess: invalidate,
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => deleteNote(id, noteId),
    onSuccess: invalidate,
    onError: (err) => setSnackbar(getErrorMessage(err)),
  });

  // Best-effort: the dialer opens regardless of whether logging succeeds, so
  // failures here are silent rather than interrupting the call with a snackbar.
  const callLogMutation = useMutation({
    mutationFn: () => logCall(id),
    onSuccess: invalidate,
  });

  const handleCall = () => {
    if (!contact?.phone) return;
    Linking.openURL(`tel:${contact.phone}`);
    callLogMutation.mutate();
  };

  const handleWhatsApp = () => {
    if (!contact?.phone) return;
    const digits = contact.phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${digits}`);
  };

  const handleEmail = () => {
    if (!contact?.email) return;
    Linking.openURL(`mailto:${contact.email}`);
  };

  if (isLoading || !contact) return <LoadingView />;

  const canManage = user?.permissions.contacts_manage ?? false;
  const canDelete = user?.permissions.contacts_delete ?? false;
  const canReactivate = user?.permissions.contacts_reactivate ?? false;
  const canEdit = (user?.permissions.contacts_update ?? false) && contact.approval_status !== 'pending';
  const canApproveContacts = user?.permissions.approve_contacts ?? false;
  const canApproveEdits = user?.permissions.approve_edits ?? false;
  const pendingEdit = contact.editRequests?.find((e) => e.status === 'pending');

  const initials = contact.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const photoUrl = resolvePhotoUrl(contact.photo);

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {photoUrl ? (
            <Avatar.Image size={72} source={{ uri: photoUrl }} />
          ) : (
            <Avatar.Text size={72} label={initials || '?'} />
          )}
          <Text variant="headlineSmall" style={styles.name}>
            {contact.name}
          </Text>
          <View style={styles.chipsRow}>
            {contact.approval_status && contact.approval_status !== 'approved' ? (
              <StatusChip status={contact.approval_status} />
            ) : null}
            {contact.status && contact.status !== 'active' ? (
              <StatusChip status={contact.status} />
            ) : null}
            {contact.group ? (
              <StatusChip status="approved" label={contact.group.name} />
            ) : null}
          </View>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => rateMutation.mutate(star)}
                disabled={rateMutation.isPending}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <MaterialCommunityIcons
                  name={star <= Math.round(Number(contact.rating ?? 0)) ? 'star' : 'star-outline'}
                  size={26}
                  color="#F59E0B"
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.quickActions}>
            {contact.phone ? (
              <QuickAction icon="phone" label="Call" color="#16A34A" onPress={handleCall} />
            ) : null}
            {contact.phone ? (
              <QuickAction icon="whatsapp" label="WhatsApp" color="#22C55E" onPress={handleWhatsApp} />
            ) : null}
            {contact.email ? (
              <QuickAction icon="email-outline" label="Email" color={branding.colors.primary} onPress={handleEmail} />
            ) : null}
          </View>
        </View>

        {contact.approval_status === 'pending' && canApproveContacts ? (
          <View style={styles.approvalBanner}>
            <Text style={styles.approvalBannerText}>This contact is awaiting your approval.</Text>
            <View style={styles.approvalActions}>
              <Button
                mode="contained-tonal"
                compact
                onPress={() => contactApprovalMutation.mutate('approve')}
                loading={contactApprovalMutation.isPending}
              >
                Approve
              </Button>
              <Button
                mode="outlined"
                compact
                textColor="#DC2626"
                onPress={() => contactApprovalMutation.mutate('reject')}
                disabled={contactApprovalMutation.isPending}
              >
                Reject
              </Button>
            </View>
          </View>
        ) : null}

        {pendingEdit ? (
          <View style={styles.pendingBanner}>
            <View style={styles.pendingBannerHeader}>
              <MaterialCommunityIcons name="clock-alert-outline" size={18} color="#92400E" />
              <Text style={styles.pendingBannerText}>
                An edit to this contact is awaiting approval.
              </Text>
            </View>
            {canApproveEdits ? (
              <View style={styles.approvalActions}>
                <Button
                  mode="contained-tonal"
                  compact
                  onPress={() => editApprovalMutation.mutate({ editId: pendingEdit.id, decision: 'approve' })}
                  loading={editApprovalMutation.isPending}
                >
                  Approve edit
                </Button>
                <Button
                  mode="outlined"
                  compact
                  textColor="#DC2626"
                  onPress={() => editApprovalMutation.mutate({ editId: pendingEdit.id, decision: 'reject' })}
                  disabled={editApprovalMutation.isPending}
                >
                  Reject edit
                </Button>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <InfoRow icon="phone" value={contact.phone} onPress={contact.phone ? handleCall : undefined} />
          <InfoRow
            icon="email"
            value={contact.email}
            onPress={contact.email ? () => Linking.openURL(`mailto:${contact.email}`) : undefined}
          />
          <InfoRow icon="office-building" value={contact.company} />
          <InfoRow icon="briefcase-outline" value={contact.job_title} />
          <InfoRow icon="map-marker-outline" value={contact.address ?? contact.city} />
          <InfoRow
            icon="web"
            value={contact.website}
            onPress={contact.website ? () => Linking.openURL(contact.website!) : undefined}
          />
        </View>

        {contact.tags && contact.tags.length > 0 ? (
          <View style={styles.tagsRow}>
            {contact.tags.map((t) => (
              <Text key={t.id} style={styles.tag}>
                #{t.name}
              </Text>
            ))}
          </View>
        ) : null}

        {contact.notes ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Quick notes</Text>
            <Text style={styles.quickNote}>{contact.notes}</Text>
          </View>
        ) : null}

        {(contact.calls ?? []).length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Call log</Text>
            {contact.calls!.map((call) => (
              <View key={call.id} style={styles.callRow}>
                <MaterialCommunityIcons name="phone-outgoing-outline" size={16} color="#6B7280" />
                <Text style={styles.callText}>
                  {call.user?.name ?? 'Unknown'} called {new Date(call.sent_at).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Activity notes</Text>
          {(contact.contactNotes ?? []).length === 0 ? (
            <Text style={styles.emptyNotes}>No notes yet.</Text>
          ) : (
            contact.contactNotes!.map((note) => (
              <View key={note.id} style={styles.noteRow}>
                <View style={styles.noteBody}>
                  <Text style={styles.noteAuthor}>{note.author?.name ?? 'Unknown'}</Text>
                  <Text style={styles.noteText}>{note.note_html}</Text>
                </View>
                {canManage || note.user_id === user?.id ? (
                  <IconButton
                    icon="delete-outline"
                    size={18}
                    onPress={() => deleteNoteMutation.mutate(note.id)}
                  />
                ) : null}
              </View>
            ))
          )}

          <Divider style={styles.divider} />
          <TextInput
            mode="outlined"
            placeholder="Add a note…"
            value={noteText}
            onChangeText={setNoteText}
            multiline
            style={styles.noteInput}
          />
          <Button
            mode="contained-tonal"
            onPress={() => noteMutation.mutate()}
            disabled={!noteText.trim() || noteMutation.isPending}
            loading={noteMutation.isPending}
            style={styles.noteButton}
          >
            Add note
          </Button>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        {canEdit ? (
          <Button
            mode="contained"
            icon="pencil"
            style={styles.editButton}
            onPress={() => navigation.navigate('ContactForm', { mode: 'edit', id })}
            disabled={!!pendingEdit}
          >
            Edit
          </Button>
        ) : null}
        {canManage ? (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton icon="dots-vertical" mode="outlined" onPress={() => setMenuVisible(true)} />
            }
          >
            {contact.status !== 'suspended' ? (
              <Menu.Item
                title="Suspend"
                leadingIcon="pause-circle-outline"
                onPress={() => {
                  setMenuVisible(false);
                  actionMutation.mutate('suspend');
                }}
              />
            ) : null}
            {contact.status !== 'banned' ? (
              <Menu.Item
                title="Ban"
                leadingIcon="cancel"
                onPress={() => {
                  setMenuVisible(false);
                  actionMutation.mutate('ban');
                }}
              />
            ) : null}
            {canReactivate && contact.status && contact.status !== 'active' ? (
              <Menu.Item
                title="Reactivate"
                leadingIcon="check-circle-outline"
                onPress={() => {
                  setMenuVisible(false);
                  actionMutation.mutate('reactivate');
                }}
              />
            ) : null}
            {canDelete ? (
              <Menu.Item
                title="Delete"
                leadingIcon="trash-can-outline"
                onPress={() => {
                  setMenuVisible(false);
                  setConfirmDelete(true);
                }}
              />
            ) : null}
          </Menu>
        ) : null}
      </View>

      <Portal>
        <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)}>
          <Dialog.Title>Delete contact?</Dialog.Title>
          <Dialog.Content>
            <Text>This moves {contact.name} to trash. This can't be undone from the app.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              onPress={() => {
                setConfirmDelete(false);
                actionMutation.mutate('delete');
              }}
              textColor="#DC2626"
            >
              Delete
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

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}1A` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function InfoRow({
  icon,
  value,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  value?: string | null;
  onPress?: () => void;
}) {
  if (!value) return null;
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.infoRow} onPress={onPress} activeOpacity={0.6}>
      <MaterialCommunityIcons name={icon} size={20} color="#6B7280" />
      <Text style={[styles.infoValue, onPress ? styles.link : null]}>{value}</Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 24, gap: 12 },
  header: { alignItems: 'center', gap: 8, marginBottom: 8 },
  name: { fontWeight: '700', textAlign: 'center' },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  starsRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  quickActions: { flexDirection: 'row', gap: 24, marginTop: 12 },
  quickAction: { alignItems: 'center', gap: 4 },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 11, opacity: 0.7 },
  pendingBanner: {
    gap: 10,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
  },
  pendingBannerHeader: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pendingBannerText: { color: '#92400E', flex: 1 },
  approvalBanner: {
    gap: 10,
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 10,
  },
  approvalBannerText: { color: '#3730A3', fontSize: 14 },
  approvalActions: { flexDirection: 'row', gap: 8 },
  card: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoValue: { fontSize: 14, flex: 1 },
  link: { color: branding.colors.primary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { fontSize: 12, color: branding.colors.primary, backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  sectionTitle: { fontWeight: '700', marginBottom: 4 },
  quickNote: { fontSize: 14, opacity: 0.8 },
  emptyNotes: { opacity: 0.5, fontSize: 13 },
  callRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  callText: { fontSize: 13, opacity: 0.8 },
  noteRow: { flexDirection: 'row', gap: 8, paddingVertical: 6 },
  noteBody: { flex: 1 },
  noteAuthor: { fontWeight: '600', fontSize: 13 },
  noteText: { fontSize: 14 },
  divider: { marginVertical: 8 },
  noteInput: { backgroundColor: 'white' },
  noteButton: { marginTop: 8, alignSelf: 'flex-end' },
  actionBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F3',
    backgroundColor: 'white',
  },
  editButton: { flex: 1 },
});
