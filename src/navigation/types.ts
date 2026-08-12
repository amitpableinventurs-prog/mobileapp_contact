export type ContactFormParams = { mode: 'create' } | { mode: 'edit'; id: number };
export type UserFormParams = { mode: 'create' } | { mode: 'edit'; id: number };

export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string } | undefined;
  PinLock: undefined;
  Main: undefined;
  ContactDetail: { id: number };
  ContactForm: ContactFormParams;
  Groups: undefined;
  Tags: undefined;
  Users: undefined;
  UserForm: UserFormParams;
  SetPin: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Contacts: undefined;
  Approvals: undefined;
  Manage: undefined;
  Profile: undefined;
};

// Screens nested inside the bottom-tab navigator still need to push root-stack
// screens (e.g. ContactDetail). React Navigation resolves route names by
// walking up the navigator tree at runtime, so it's safe to type every
// screen's navigation prop against the root stack.
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
