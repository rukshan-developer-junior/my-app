# Star Wars Characters App

A React Native (Expo) app that lists Star Wars characters from the [SWAPI](https://swapi.dev/) API with search, pagination, and the ability to add characters locally. Built with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Frameworks & libraries

| Category | Choice | Why we use it |
|----------|--------|----------------|
| **App framework** | [Expo](https://expo.dev) | Single codebase for iOS, Android, and web; managed tooling (builds, OTA), and a rich set of native modules without ejecting. |
| **UI / runtime** | React 19 + React Native | Component-based UI, shared logic with the web ecosystem, and native performance via the RN bridge. |
| **Navigation** | [React Navigation](https://reactnavigation.org/) (native-stack) | Declarative, native-feel navigation (stack, modals) and deep linking; widely used and well documented. |
| **Server state** | [TanStack Query](https://tanstack.com/query/latest) (React Query) | Caching, loading/error states, refetch, and **infinite queries** for paginated lists; keeps server data out of Redux and avoids manual cache logic. |
| **Client state** | [Redux Toolkit](https://redux-toolkit.js.org/) + [redux-persist](https://github.com/rt2zz/redux-persist) | Predictable global state for “added” characters and a simple way to **persist** that state to AsyncStorage so it survives app restarts. |
| **HTTP** | [Axios](https://axios-http.com/) | Clear API (interceptors, typed responses), timeouts, and request/response logging for the SWAPI client. |
| **Connectivity** | [@react-native-community/netinfo](https://github.com/react-native-community/netinfo) | Detect online/offline so we can disable or refetch API calls when the device has no network. |
| **Safe areas** | [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) | Correct insets for notches and home indicators so list, detail, and modals don’t sit under system UI. |

**Why both React Query and Redux?**  
- **React Query** holds **server state**: the paginated list from the API. It handles loading, errors, refetch, and “load more” without storing that list in Redux.  
- **Redux** holds **client state**: the list of characters added by the user (e.g. from the “Add person” flow). That list is persisted and merged with the API list in the UI. Keeping server and client state separate keeps the app simpler and avoids duplicating API data in Redux.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the dev server

   ```bash
   npx expo start
   ```

3. Run the app

   After the dev server starts, run the app on a device or simulator:

   - **iOS simulator:** Press `i` in the terminal, or run `npm run ios`
   - **Android emulator:** Press `a` in the terminal, or run `npm run android`
   - **Expo Go (physical device):** Scan the QR code with the Expo Go app ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

   For more options (e.g. development builds), see the [Expo docs](https://docs.expo.dev/workflow/ios-simulator/).

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Build & deploy

**Prerequisites:** [Node.js](https://nodejs.org/) (LTS), [Expo account](https://expo.dev/signup). For store release: Apple Developer account (iOS) and a keystore or EAS-managed credentials (Android).

1. **Install EAS CLI and log in**

   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure EAS once** (creates `eas.json`)

   ```bash
   eas build:configure
   ```

3. **Build the app**

   ```bash
   # iOS
   eas build --platform ios

   # Android
   eas build --platform android

   # Both
   eas build --platform all
   ```

   Builds run in the cloud. When done, EAS gives you a link to download the app (IPA or APK/AAB).

4. **Deploy to the stores**

   After a build finishes:

   ```bash
   eas submit --platform ios --latest
   eas submit --platform android --latest
   ```

   Or upload the built app from the [Expo dashboard](https://expo.dev/).
