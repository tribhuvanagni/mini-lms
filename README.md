# Mini LMS

A learning app built as a take-home assignment. React Native Expo, TypeScript,
Expo Router, Zustand, MMKV.

## Screenshots

[home screen] [course detail] [webview] [bookmarks] [profile]

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in values
4. `npx expo start`
5. Scan the QR with Expo Go, or press `a` for Android emulator

Tested on Android 13 (Pixel 6a) and iOS 17 (iPhone 14).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| API_BASE_URL | yes | https://api.freeapi.app |
| SENTRY_DSN | no | error tracking |
| OPENAI_API_KEY | no | AI course recommendations |

## Tech stack

- React Native Expo (SDK 54), TypeScript strict mode
- Expo Router for file-based navigation
- NativeWind v4 (Tailwind CSS for RN)
- Zustand for state management
- MMKV for fast local persistence
- expo-secure-store for auth tokens
- Axios with token refresh interceptor
- expo-notifications for bookmark milestones and inactivity reminders
- expo-image-picker for profile avatar
- OpenAI API for AI-powered course recommendations (optional)

## Architecture

```
src/
  api/         — axios client, auth + course endpoints
  store/       — zustand slices (auth, courses, prefs, recommendations)
  services/    — storage wrappers, notifications, webview bridge, AI
  components/  — reusable UI (Button, Input, CourseCard, SearchBar, etc.)
  hooks/       — useNetworkStatus, useNotifications
  constants/   — theme colors, env config
  types/       — TypeScript interfaces for API, auth, courses
  utils/       — retry, logger, error messages, course mapper

app/
  (auth)/      — login, register screens
  (tabs)/      — home (explore), bookmarks, profile
  course/[id]  — course detail with enroll + AI recommendations
  webview/[id] — WebView with local HTML template
```

## Why these choices

**MMKV over AsyncStorage** — MMKV is synchronous and 30x faster on benchmarks
I ran. AsyncStorage blocks the bridge on large payloads. The only trade-off is
a slightly bigger native build size, which doesn't matter at this scale.

**Zustand over Redux** — Redux would've added a lot of boilerplate for no
benefit here. Zustand stores are just functions with `set`, and testing them
is straightforward. I've used Redux on larger teams where the structure
mattered; for a 3-store app it's overkill.

**SecureStore for tokens** — non-negotiable. AsyncStorage is plaintext on disk
on both platforms. SecureStore uses Keychain (iOS) and EncryptedSharedPreferences
(Android). There's no reason to use anything else for auth credentials.

**Axios over fetch** — the interceptor pattern for token refresh is much cleaner
than rolling it with fetch. The retry helper wraps any axios call in 3 lines.

## AI recommendations

Optional feature. Set `OPENAI_API_KEY` in your `.env` file. Uses GPT-3.5-turbo
to suggest 3 related courses based on the current course's title and category.
Results are cached in MMKV so we don't re-request on back-navigate. If the key
is missing or the request fails, the section just doesn't show up.

## Running tests

```bash
npm test
npm test -- --coverage
```

## Building the APK

```bash
npm install -g eas-cli
eas login
eas build --profile development --platform android
```

Or for a local build:
```bash
npx expo run:android --configuration Release
```

## Known issues

- Profile picture upload hits the same freeapi endpoint as profile GET but
  the API doesn't actually persist avatar changes. The UI optimistically
  updates the avatar locally.
- Dark mode uses `system` default but some NativeWind classes on Android
  need a restart to pick up the OS theme change (RN limitation).
- WebView progress tracking via scroll events is approximate on short content.
- AI recommendations need network access and a valid OpenAI API key.

## Demo

[link to YouTube/Loom video]
