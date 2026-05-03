# Mini LMS Mobile App

A premium, production-ready Learning Management System built with React Native and Expo. This app allows users to seamlessly browse, bookmark, and enroll in high-quality software engineering courses, featuring an offline-first architecture and a deeply integrated webview experience.

## Features

- **Authentication**: Secure JWT-based login/register flow utilizing Expo SecureStore.
- **Premium UI**: Udemy-inspired dark theme with responsive linear gradients, haptics, and fluid micro-interactions.
- **Offline-First Course Catalog**: Uses AsyncStorage to cache fetched courses, allowing for browsing even without internet connectivity.
- **Dynamic Content Webview**: Embedded bidirectional communication webview that generates tailored course content dynamically.
- **Local Notifications**: Celebrates user milestones (5+ bookmarks) and issues 24-hour inactivity reminders using `expo-notifications`.
- **High Performance**: Optimized catalog rendering using `@shopify/flash-list`.

---

## 🛠 Tech Stack

The application leverages a modern, high-performance architecture, broken down by layer:

### 📱 Frontend (Mobile App)
- **React Native (v0.81.5)**: Core framework for cross-platform mobile UI development.
- **Expo (SDK 54) & Expo Router**: Application build environment and file-based navigation system.
- **NativeWind / TailwindCSS**: Utility-first CSS styling directly applied to React Native components.
- **Zustand**: Fast, scalable state management for local UI states.
- **React Native Reanimated**: High-performance, declarative 60FPS animations.
- **@shopify/flash-list**: Highly optimized scrolling lists replacing standard FlatLists.

### ⚙️ Backend & External APIs
- **FreeAPI (`api.freeapi.app`)**: Acts as the primary backend providing mock data for authentication, user profiles, and the course catalog.
- **Google Gemini API**: Integrated directly to power the intelligent, AI-driven course recommendation engine.
- **Axios**: Promise-based HTTP client used to reliably communicate with all external backend services.
- **Sentry**: Remote backend service for tracking errors and crash reporting.

### 💾 Local Database & Storage
- **React Native MMKV**: Ultra-fast synchronous key-value database used for caching the course catalog, enabling offline browsing.
- **Expo SecureStore**: Encrypted local storage acting as a secure vault for JWT authentication tokens.
- **AsyncStorage**: Fallback asynchronous storage for application preferences and metadata.

---

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd mini-lms
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npx expo start
   ```

4. **Run on Device / Emulator:**
   - Press `a` for Android
   - Press `i` for iOS
   - Or scan the QR code using the Expo Go app on your physical device.

---

## Environment Variables

Create a `.env` file in the root directory and configure the base API URL:

```env
EXPO_PUBLIC_API_URL=https://api.freeapi.app/
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

*(Note: The app is configured to gracefully fallback if this is not provided, defaulting to FreeAPI).*

---

## Key Architectural Decisions

- **State Management (Zustand):** Chosen over Redux for its lightweight, boilerplate-free architecture. It easily wraps async hydration logic (fetching cached data from storage before mount).
- **Zod & React Hook Form:** Ensures type-safe authentication payloads and displays validation errors instantly without hitting the server.
- **Deterministic Data Mapping:** Since FreeAPI's `randomproducts` returns generic e-commerce items, the `courseMapper.ts` layer deterministically remaps these items into realistic IT/Software courses (e.g., Python, React Native, AI Agents) with Unsplash images.
- **FlashList over FlatList:** Used for the main course catalog to guarantee 60fps scrolling performance, even when rendering hundreds of heavy image cards.

---

## Known Issues / Limitations

- **Theme Toggle constraints:** The app was explicitly designed around a premium "Deep Navy Dark Theme". While a theme preference toggle exists in the profile, the UI tokens are heavily optimized for dark mode.
- **Image Cropping on Android:** The Expo Image Picker crop UI occasionally renders dark text on a dark background on specific Android devices. To bypass this confusing UX, `allowsEditing` has been set to false.
- **Webview Scroll Physics:** The embedded webview has its own scroll context. Fast scrolling might feel slightly detached from the native wrapper, though progress tracking is fully synced.

---

## Screenshots

*(See attached `artifacts` or GitHub release for full resolution screenshots)*

- **Home Catalog:** `media__1777623134283.png`
- **Course Detail & Webview:** `media__1777623383777.png`
- **Bookmarks & Animations:** *(Not pictured, please test interactively)*

---

## Building the APK

### Prerequisites
- An [Expo account](https://expo.dev/signup) (free)
- EAS CLI installed globally:
  ```bash
  npm install -g eas-cli
  ```

### Step 1 — Log in to Expo
```bash
eas login
```
Enter your Expo credentials when prompted.

### Step 2 — Link the project to your Expo account
```bash
eas project:init
```
This creates the project on Expo's build servers if it doesn't exist yet.

### Step 3 — Build the Preview APK (recommended)
This generates a standalone `.apk` file you can install directly on any Android device.

```bash
eas build -p android --profile preview
```

> **Note:** The build happens in Expo's cloud. It takes approximately **5–15 minutes**. You do NOT need Android Studio installed.

### Step 4 — Download and Install
When the build finishes, EAS prints a download URL like:
```
✅ Build successful!  
🤖 Download: https://expo.dev/artifacts/eas/xxxx.apk
```
Download the `.apk` file and transfer it to your Android device. Enable **"Install from unknown sources"** in Settings → Security if prompted.

---

### Alternative: Development Build APK
If you need a build that supports hot reloading (replacing Expo Go):

```bash
eas build -p android --profile development
```

Then start the local dev server:
```bash
npx expo start --dev-client
```

---

### Check Build Status
```bash
eas build:list
```

### View Logs
Visit [https://expo.dev/accounts/[username]/projects/mini-lms/builds](https://expo.dev) to view build logs and download artefacts.

