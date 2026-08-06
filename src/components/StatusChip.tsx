import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { statusColors } from '../theme';

export function StatusChip({ status, label }: { status: string; label?: string }) {
  const color = statusColors[status] ?? '#6B7280';
  return (
    <Text style={[styles.chip, { color, borderColor: color, backgroundColor: `${color}1A` }]}>
      {label ?? status}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
