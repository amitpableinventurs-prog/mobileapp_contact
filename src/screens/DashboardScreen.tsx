import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { fetchDashboard } from '../api/dashboard';
import { RoleBadge } from '../components/RoleBadge';
import { LoadingView } from '../components/LoadingView';

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card style={styles.statCard} mode="elevated">
      <Card.Content style={styles.statContent}>
        <View style={[styles.iconCircle, { backgroundColor: `${color}1A` }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  if (isLoading) return <LoadingView />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.greeting}>
          Hi, {user?.name?.split(' ')[0]}
        </Text>
        {user ? <RoleBadge role={user.role} /> : null}
        {user?.team_name ? <Text style={styles.team}>{user.team_name}</Text> : null}
      </View>

      <View style={styles.grid}>
        <StatCard
          icon="account-multiple"
          label="Contacts"
          value={data?.total_contacts ?? 0}
          color="#4F46E5"
        />
        {user?.permissions.approve_contacts ? (
          <StatCard
            icon="clock-alert-outline"
            label="Pending contacts"
            value={data?.pending_contacts_count ?? 0}
            color="#D97706"
          />
        ) : null}
        {user?.permissions.approve_edits ? (
          <StatCard
            icon="pencil-outline"
            label="Pending edits"
            value={data?.pending_edits_count ?? 0}
            color="#0891B2"
          />
        ) : null}
        {user?.permissions.is_manager ? (
          <StatCard
            icon="account-clock-outline"
            label="My pending submissions"
            value={data?.my_pending_contacts_count ?? 0}
            color="#7C3AED"
          />
        ) : null}
        {user?.permissions.is_clerk || user?.permissions.is_manager ? (
          <StatCard
            icon="magnify"
            label="Searches used"
            value={data?.searches_used ?? 0}
            color="#16A34A"
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  header: { gap: 6, marginBottom: 4 },
  greeting: { fontWeight: '700' },
  team: { opacity: 0.6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', borderRadius: 14 },
  statContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { opacity: 0.6, fontSize: 12 },
});
