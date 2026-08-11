import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { RootNavigationProp, RootStackParamList } from '../navigation/types';
import { branding } from '../branding';

function HubCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={24} color={branding.colors.primary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default function ManageHubScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<RootNavigationProp>();

  const items: { key: keyof RootStackParamList; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; title: string; subtitle: string }[] = [
    { key: 'Groups', icon: 'folder-multiple-outline', title: 'Groups', subtitle: 'Organize contacts into categories' },
    { key: 'Tags', icon: 'tag-multiple-outline', title: 'Tags', subtitle: 'Label contacts for filtering' },
  ];
  if (user?.permissions.manage_users) {
    items.push({ key: 'Users', icon: 'account-cog-outline', title: 'Users', subtitle: 'Manage team member accounts' });
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {items.map((item) => (
        <HubCard
          key={item.key}
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          onPress={() => navigation.navigate(item.key as never)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontWeight: '700', fontSize: 15 },
  cardSubtitle: { fontSize: 12, opacity: 0.6, marginTop: 2 },
});
