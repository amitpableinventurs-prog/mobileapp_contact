# White-labeling this app for a new client

This codebase is built to be re-skinned and resold under a different brand
per client. Everything that changes between clients is collected in a small
number of places — swap those, rebuild, and ship.

## 1. Swap the logo

Replace the two source files in `assets/branding/`:

- `logo.svg` — the full app icon (background + mark). Used for the app icon
  and the in-app login logo.
- `mark.svg` — the mark alone, transparent background, white fill. Used for
  the Android adaptive icon foreground/monochrome layers and the splash
  screen.

Keep the 1024x1024 canvas and roughly the same amount of padding around the
mark so it isn't clipped once masked into a circle/squircle by Android.

Then regenerate every PNG derived from those two files:

```bash
npm run branding:icons
```

This writes `assets/icon.png`, `assets/android-icon-*.png`,
`assets/splash-icon.png`, `assets/favicon.png`, and
`assets/branding/logo.png` (the one the app itself renders on the login
screen).

If a client hands you a ready-made logo instead of wanting the generated
monogram, drop their file in as `assets/branding/logo.png` directly and
point `src/branding.ts`'s `logo` field at it — you can skip the SVG/script
step for the in-app logo, but you'll still want `mark.svg` for the adaptive
icon/splash layers (a plain silhouette cutout of their logo works).

## 2. Edit the brand config

[src/branding.ts](src/branding.ts) is the single source of truth for the app
name, tagline, and brand colors:

```ts
export const branding = {
  appName: 'MyCRM',
  tagline: 'Sign in to your workspace',
  logo: require('../assets/branding/logo.png'),
  colors: { primary: '#4F46E5', secondary: '#7C3AED' },
};
```

`theme.ts` and every screen that needs a brand accent color import from here,
so changing `colors.primary`/`colors.secondary` re-themes buttons, tabs,
links, and icon accents app-wide without hunting through screens.

## 3. Update app.json

- `expo.name` — the display name shown under the icon (already set from
  step 2's app name).
- `expo.slug` and `expo.android.package` — change these per client before
  publishing a *separate* app to the Play Store. Two clients sharing the same
  `android.package` cannot both be installed/published independently.
- `expo.android.adaptiveIcon.backgroundColor` — set to match
  `branding.colors.primary` for consistency with the generated background
  layer.
- `expo.plugins` → the `expo-image-picker` entry's `photosPermission` string
  — it's shown to the user as a system permission prompt, so it should name
  the client's brand, not "MyCRM".

## 4. Point at the client's backend

[src/config.ts](src/config.ts) holds `API_BASE_URL`. Each client runs their
own Laravel backend instance (or their own team on a shared one) — update
this to their server address.

## 5. Rebuild

```bash
npm run branding:icons   # if the logo changed
npx expo prebuild --clean
```

then build/submit through EAS (or your usual pipeline) as normal.

## What's static vs. dynamic

Branding here is **build-time**, not per-tenant-at-runtime: each client gets
their own build with `src/branding.ts` + `assets/branding/` baked in. The
Laravel backend already has a separate, dynamic branding system (Settings →
Branding, `app/Settings/GeneralSettings.php`) used by its own web UI — that
is not currently wired up to this mobile app. If you later want one shared
app binary to show a different logo per team at runtime (no rebuild), that
means adding an API endpoint that serves the team's logo/colors and fetching
it on launch instead of using `require('../assets/branding/logo.png')` — a
bigger change than this pass covers.
