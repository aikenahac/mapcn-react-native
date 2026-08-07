# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo SDK 55, using file-based routing via Expo Router. The app features Mapbox-based map integration (`@rnmapbox/maps`) with location services and uses Uniwind (Tailwind CSS v4) for styling. This is a demo/example app showcasing the mapcn React Native map component library for Mapbox.

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
npx expo prebuild --clean   # Regenerate native projects (after app.json changes)
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
- Entry point: `src/app/_layout.tsx` sets up ThemeProvider and PortalHost
- Main screen: `src/app/index.tsx` (examples list)
- Examples in: `src/app/examples/`

### Styling System
- **Uniwind**: Tailwind CSS v4 for React Native
  - Metro config: `metro.config.js` includes `withUniwindConfig` with `global.css` input
  - Babel config: Uses the standard Expo preset only; Uniwind does not need a Babel preset
  - Global CSS: `global.css` defines the theme tokens and semantic color utilities
  - Use `className` prop for styling components

### Map Integration (@rnmapbox/maps)
- **Mapbox Setup**: Requires `EXPO_PUBLIC_MAPBOX_API_KEY` environment variable
  - Get free token at: https://account.mapbox.com/access-tokens/
  - Add to `.env` file as `EXPO_PUBLIC_MAPBOX_API_KEY=your_token_here`

- **Custom Map Component**: `src/components/ui/map.tsx` provides React-friendly wrapper around Mapbox
  - `<Map>`: Main container with theme-aware styles (Mapbox Dark/Street styles by default)
  - `<MapMarker>`: Marker with content, labels, and popups using `Mapbox.MarkerView`
  - `<MapRoute>`: LineString rendering for routes using `Mapbox.ShapeSource` and `Mapbox.LineLayer`
  - `<MapControls>`: Zoom and location controls with customizable position
  - `<MapUserLocation>`: User location display using `Mapbox.LocationPuck` with auto-permission handling
  - Context-based API: `useMap()` hook provides access to mapRef, cameraRef, isLoaded state, and theme
  - MapLibre-compatible camera API: `flyTo()` and `easeTo()` methods for smooth animations

- **Location Permissions**:
  - Request permissions using `expo-location` before rendering map components that need location
  - See `src/app/examples/map-controls.tsx` for permission request pattern
  - `MapUserLocation` component can auto-request permissions with `autoRequestPermission={true}`

### TypeScript Configuration
- Path alias: `@/*` maps to project root
- Strict mode enabled
- Includes Uniwind types via `uniwind-env.d.ts`

### Native Configuration (app.json)
- **React Native New Architecture**: Enabled (`newArchEnabled: true`)
- **iOS**:
  - `NSAppTransportSecurity.NSAllowsArbitraryLoads: true` - Required for map tile loading
  - Location permission descriptions configured
- **Android**:
  - Location permissions: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
- **Plugins**: expo-router, expo-location, expo-splash-screen, @rnmapbox/maps

## Important Patterns

### Adding Location Features
1. Request permissions via `expo-location` in parent component, OR
2. Use `<MapUserLocation autoRequestPermission={true} />` to auto-request permissions
3. Conditionally render location-dependent components only after permission granted
4. Example pattern in `src/app/examples/map-controls.tsx`

### Rebuilding After Config Changes
After modifying `app.json` (permissions, plugins, native settings):
```bash
npx expo prebuild --clean
npx expo run:ios    # or run:android
```

### Map Styling
- Map component automatically switches between light/dark themes based on system color scheme
- Default styles use Mapbox built-in styles (`Mapbox.StyleURL.Dark` for dark mode, `Mapbox.StyleURL.Street` for light mode)
- Override with custom Mapbox style URLs via `styles` prop on `<Map>`:
  ```tsx
  <Map styles={{ light: "mapbox://styles/...", dark: "mapbox://styles/..." }}>
  ```

### Component Structure
- UI components in `src/components/ui/`
- Icons and utilities in `src/lib/`
- App screens in `src/app/`
- Examples in `src/app/examples/`

### Environment Variables
Required environment variables (create `.env` file in project root):
```bash
EXPO_PUBLIC_MAPBOX_API_KEY=your_mapbox_token_here
```

## Map Component API

### Basic Usage
```tsx
import { Map, MapMarker, MapControls, MapUserLocation } from '@/components/ui/map';

<Map center={[-122.4194, 37.7749]} zoom={12}>
  <MapMarker coordinate={[-122.4194, 37.7749]} label="San Francisco" />
  <MapUserLocation visible />
  <MapControls showZoom showLocate />
</Map>
```

### Available Components
- **`<Map>`**: Main map container with theme support
- **`<MapMarker>`**: Place markers with optional labels and popups
- **`<MapRoute>`**: Draw polylines/routes between coordinates
- **`<MapControls>`**: Built-in zoom and location controls
- **`<MapUserLocation>`**: Display user's current location
- **`<MarkerContent>`**: Custom marker content wrapper
- **`<MarkerLabel>`**: Text label for markers
- **`<MarkerPopup>`**: Callout/popup content

### Hooks
- **`useMap()`**: Access mapRef, cameraRef, isLoaded state, and current theme
