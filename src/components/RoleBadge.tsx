import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Role } from '../types';
import { roleColors, roleLabels } from '../theme';

export function RoleBadge({ role }: { role: Role }) {
  const color = roleColors[role] ?? '#6B7280';
  return (
    <Text style={[styles.chip, { color, borderColor: color, backgroundColor: `${color}1A` }]}>
      {roleLabels[role] ?? role}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
