// Single source of truth for white-label branding. To resell this app under
// a new brand, edit the values below, swap assets/branding/logo.svg + mark.svg,
// then run `npm run branding:icons`. See WHITE_LABEL.md for the full checklist.
export const branding = {
  appName: 'MyCRM',
  tagline: 'Sign in to your workspace',
  logo: require('../assets/branding/logo.png') as number,
  colors: {
    primary: '#4F46E5',
    secondary: '#7C3AED',
  },
};
