import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4F46E5',
    secondary: '#7C3AED',
    error: '#DC2626',
  },
};

export const roleColors: Record<string, string> = {
  super_admin: '#DC2626',
  admin: '#EA580C',
  manager: '#4F46E5',
  clerk: '#0891B2',
};

export const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  clerk: 'Clerk',
};

export const statusColors: Record<string, string> = {
  active: '#16A34A',
  suspended: '#D97706',
  banned: '#DC2626',
  pending: '#D97706',
  approved: '#16A34A',
  rejected: '#DC2626',
};
