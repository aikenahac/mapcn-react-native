# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo SDK 55, using file-based routing via Expo Router. The app features MapLibre-based map integration with location services and uses Uniwind (Tailwind CSS v4) for styling.

## Development Commands

### Starting the App
```bash
npm start              # Start Expo development server
npm run ios            # Open in iOS simulator
npm run android        # Open in Android emulator
npm run web            # Open in web browser
```

### Building
```bash
npm run build          # Custom build script
npm run lint           # Run ESLint
npx expo prebuild --clean   # Regenerate native projects on demand for local native validation
```

### EAS Build Profiles (see eas.json)
```bash
eas build --profile development          # Development build
eas build --profile ios-simulator        # iOS simulator build
eas build --profile preview              # Preview/internal distribution
eas build --profile production           # Production build (auto-increment version, APK for Android)
```

## Architecture

### Routing & Navigation
- **Expo Router**: File-based routing with Stack navigator
- Entry point: `app/_layout.tsx` sets up ThemeProvider and PortalHost
- Main screen: `app/index.tsx`
- `unstable_settings.anchor` set to `'(tabs)'` in root layout

### Styling System
- **Uniwind**: Tailwind CSS v4 for React Native
  - Metro config: `metro.config.js` includes `withUniwindConfig` with `global.css` input
  - Babel config: No custom Babel config is required; Expo's default preset is enough
  - Global CSS: `global.css` defines the theme tokens and semantic color utilities
  - Use `className` prop for styling components

### Map Integration (@maplibre/maplibre-react-native)
- **Custom Map Component**: `components/ui/map.tsx` provides React-friendly wrapper around MapLibre
  - `<Map>`: Main container with theme-aware styles (Carto basemaps by default)
  - `<MapMarker>`: Marker with content, labels, and popups
  - `<MapRoute>`: LineString rendering for routes
  - `<MapControls>`: Zoom and location controls
  - `<MapUserLocation>`: User location display with permission handling
  - Context-based API: `useMap()` hook provides access to mapRef, cameraRef, isLoaded state

- **Location Permissions**:
  - Request permissions using `expo-location` before rendering map components that need location
  - See `app/index.tsx` for permission request pattern
  - MapLibre's `useCurrentPosition()` must be called unconditionally (rules of hooks)

### TypeScript Configuration
- Path alias: `@/*` maps to project root
- Strict mode enabled
- Includes Uniwind types via `uniwind-env.d.ts`

### Native Configuration (app.json)
- **React Native New Architecture**: Enabled by default in Expo SDK 55
- **iOS**:
  - `NSAppTransportSecurity.NSAllowsArbitraryLoads: true` - Required for map tile loading
  - Location permission descriptions configured
- **Android**:
  - Location permissions: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
- **Plugins**: expo-router, expo-location, expo-splash-screen

## Important Patterns

### Adding Location Features
1. Request permissions via `expo-location` in parent component
2. Conditionally render map components that use location only after permission granted
3. Call hooks like `useCurrentPosition()` unconditionally (not inside conditionals)

### Rebuilding After Config Changes
This repo uses Continuous Native Generation, so `ios/` and `android/` are generated only when needed. After modifying `app.json` (permissions, plugins, native settings):
```bash
npx expo prebuild --clean
npx expo run:ios    # or run:android
```

### Map Styling
- Map component automatically switches between light/dark themes based on system color scheme
- Default styles use Carto basemaps (dark-matter for dark mode, positron for light mode)
- Override with custom map style URLs via `styles` prop on `<Map>`

### Component Structure
- UI components in `src/components/ui/`
- Hooks in `src/hooks/`
- Utilities in `src/lib/`
- App screens in `src/app/`
