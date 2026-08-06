import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Avatar, Text } from 'react-native-paper';
import { Contact } from '../types';
import { StatusChip } from './StatusChip';

export function ContactCard({ contact, onPress }: { contact: Contact; onPress: () => void }) {
  const initials = contact.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <Avatar.Text size={44} label={initials || '?'} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {contact.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {contact.phone ?? contact.email ?? '—'}
          {contact.company ? ` · ${contact.company}` : ''}
        </Text>
      </View>
      <View style={styles.badges}>
        {contact.approval_status === 'pending' ? <StatusChip status="pending" /> : null}
        {contact.status && contact.status !== 'active' ? (
          <StatusChip status={contact.status} />
        ) : null}
        {contact.group ? (
          <View style={[styles.groupDot, { backgroundColor: contact.group.color ?? '#9CA3AF' }]} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 13, opacity: 0.6 },
  badges: { alignItems: 'flex-end', gap: 6 },
  groupDot: { width: 10, height: 10, borderRadius: 5 },
});
