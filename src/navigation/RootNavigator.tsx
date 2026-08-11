import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from './types';
import { LoadingView } from '../components/LoadingView';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import MainTabs from './MainTabs';
import ContactDetailScreen from '../screens/ContactDetailScreen';
import ContactFormScreen from '../screens/ContactFormScreen';
import GroupsScreen from '../screens/GroupsScreen';
import TagsScreen from '../screens/TagsScreen';
import UsersListScreen from '../screens/UsersListScreen';
import UserFormScreen from '../screens/UserFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingView />;

  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ title: 'Reset password' }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{ title: 'New password' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="ContactDetail"
            component={ContactDetailScreen}
            options={{ title: 'Contact' }}
          />
          <Stack.Screen
            name="ContactForm"
            component={ContactFormScreen}
            options={({ route }) => ({
              title: route.params.mode === 'create' ? 'New contact' : 'Edit contact',
            })}
          />
          <Stack.Screen name="Groups" component={GroupsScreen} options={{ title: 'Groups' }} />
          <Stack.Screen name="Tags" component={TagsScreen} options={{ title: 'Tags' }} />
          <Stack.Screen name="Users" component={UsersListScreen} options={{ title: 'Users' }} />
          <Stack.Screen
            name="UserForm"
            component={UserFormScreen}
            options={({ route }) => ({
              title: route.params.mode === 'create' ? 'New user' : 'Edit user',
            })}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
