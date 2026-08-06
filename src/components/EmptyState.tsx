import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function EmptyState({
  icon = 'inbox-outline',
  title,
  subtitle,
}: {
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={48} color="#9CA3AF" />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 6 },
  title: { fontSize: 16, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  subtitle: { opacity: 0.6, textAlign: 'center' },
});
