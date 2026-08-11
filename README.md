# LaraContact Mobile (Android)

A React Native (Expo) client for the LaraContact CRM, with full role-based
access for all four roles: Super Admin, Admin, Manager, Clerk.

Built to be white-labeled and resold per client — see
[WHITE_LABEL.md](WHITE_LABEL.md) for how to swap the logo, brand colors, and
app name.

## Prerequisites

- The backend must be running: `http://localhost/laracontact` (XAMPP Apache + MariaDB, already set up).
- Your phone and computer must be on the **same Wi-Fi network**.
- Install the **Expo Go** app on your Android phone from the Play Store.

## Run it

```bash
npm install   # first time only
npm start
```

This prints a QR code in the terminal. Open **Expo Go** on your Android phone
and scan it. The app loads over your Wi-Fi network — no cable, no Android
Studio, no build step needed.

## Connecting to the backend

The app talks to the Laravel API at the address in [src/config.ts](src/config.ts):

```ts
export const API_BASE_URL = 'http://192.168.1.35/laracontact/public/api';
```

`192.168.1.35` is this computer's current Wi-Fi IP address. **If you switch
networks or this changes**, find the new one with `ipconfig` (look for the
`IPv4 Address` under your Wi-Fi adapter) and update this file.

If you use an Android *emulator* on this same machine instead of a physical
phone, use `http://10.0.2.2/laracontact/public/api` instead — see the
comment in `src/config.ts`.

## Test accounts (all roles)

| Role        | Email                  | Password      |
|-------------|-------------------------|---------------|
| Super Admin | superadmin@test.com     | Password@123  |
| Admin       | admin@test.com          | Password@123  |
| Manager     | manager@test.com        | Password@123  |
| Clerk       | clerk@test.com          | Password@123  |

All four share one workspace, so you can see the approval workflow play out
across roles (e.g. sign in as Manager, create/edit a contact, then sign in as
Admin to approve it).

## What each role can do

- **Clerk** — search contacts by phone number (3+ digits; no open browsing),
  view details, add notes. Cannot create, edit, or delete contacts.
- **Manager** — everything a Clerk can, plus create/browse/edit contacts and
  manage Groups/Tags/Clerk accounts. New contacts and edits to existing ones
  go into a pending queue for Admin approval rather than applying immediately.
- **Admin** — everything a Manager can, plus approve/reject pending contacts
  and edits, delete/reactivate contacts, and manage Manager & Clerk accounts.
- **Super Admin** — everything, across every team.

## What's in this build

Auth, Dashboard, Contacts (search/create/edit/delete/suspend/ban/reactivate/
rate), contact notes, the Manager→Admin approval workflow, Groups, Tags, and
User management — all permission-gated to match the web app exactly.

Not included (stayed web-only for this pass): SMS/WhatsApp/Email messaging,
click-to-call logging, bulk send, team/workspace invites, site settings,
audit/login logs, 2FA, CSV import/export.

## Project structure

```
src/
  api/          One file per resource; thin wrappers around axios calls
  components/   Small reusable UI pieces
  context/      AuthContext (token storage, current user, sign in/out)
  navigation/   Root stack + role-aware bottom tabs
  screens/      One screen per file
  config.ts     API_BASE_URL
  branding.ts   App name, tagline, logo, brand colors (see WHITE_LABEL.md)
  theme.ts      Colors, role badges, status chip colors
  types.ts      TypeScript types matching the API's JSON shapes
assets/
  branding/     logo.svg, mark.svg — edit these, then `npm run branding:icons`
```
