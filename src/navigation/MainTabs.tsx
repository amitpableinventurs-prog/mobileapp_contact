import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { MainTabParamList } from './types';
import DashboardScreen from '../screens/DashboardScreen';
import ContactsListScreen from '../screens/ContactsListScreen';
import ApprovalsScreen from '../screens/ApprovalsScreen';
import ManageHubScreen from '../screens/ManageHubScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { fetchPendingQueue } from '../api/approvals';
import { branding } from '../branding';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  Dashboard: 'view-dashboard-outline',
  Contacts: 'account-multiple-outline',
  Approvals: 'clipboard-check-outline',
  Manage: 'cog-outline',
  Profile: 'account-circle-outline',
};

export default function MainTabs() {
  const { user } = useAuth();
  const canApprove = user?.permissions.approve_contacts || user?.permissions.approve_edits;
  const canManage = user?.permissions.manage_groups || user?.permissions.manage_tags || user?.permissions.manage_users;

  const { data: pending } = useQuery({
    queryKey: ['pending-queue'],
    queryFn: fetchPendingQueue,
    enabled: !!canApprove,
    refetchInterval: 60000,
  });
  const pendingCount = (pending?.contacts.total ?? 0) + (pending?.edit_requests.total ?? 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={ICONS[route.name as keyof MainTabParamList]} color={color} size={size} />
        ),
        tabBarActiveTintColor: branding.colors.primary,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Contacts" component={ContactsListScreen} />
      {canApprove ? (
        <Tab.Screen
          name="Approvals"
          component={ApprovalsScreen}
          options={{ tabBarBadge: pendingCount > 0 ? pendingCount : undefined }}
        />
      ) : null}
      {canManage ? <Tab.Screen name="Manage" component={ManageHubScreen} options={{ title: 'Manage' }} /> : null}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
