# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

**mapcn-react-native-docs** is a Next.js documentation website for the React Native version of mapcn - a shadcn/ui-compatible map component library built on @maplibre/maplibre-react-native for Expo and React Native apps.

**Key Difference from Web Version:** This documentation uses static screenshots for examples since React Native maps cannot run in browsers.

## Commands

### Development
- `npm run dev` - Start Next.js development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Registry
- `npm run registry:build` - Build shadcn-compatible registry to `./public/maps` (builds the component distribution files that users download)

## Architecture

### Component Registry System

The React Native map component (`src/registry/map.tsx`) is the single source of truth, copied from the mapcn-react-native package. This 650-line file exports: `Map`, `MapMarker`, `MarkerContent`, `MarkerPopup`, `MarkerLabel`, `MapControls`, `MapRoute`, `MapUserLocation`, `useMap`, `useCurrentPosition`, and `LocationManager`.

The component is designed to be installed via shadcn CLI and distributed through a registry system defined in `registry.json`. When users run `npx @react-native-reusables/cli@latest add`, they pull from the built registry in `public/maps/`.

### Documentation Structure

- `src/app/docs/` - All documentation pages follow Next.js App Router conventions
- `src/app/docs/_components/examples/` - Example code snippets (NOT rendered, only displayed as code)
- `public/screenshots/` - Static screenshots of examples captured from React Native simulator
- `src/lib/get-example-source.ts` - Server-side utility that reads example files and transforms import paths from `@/registry/map` to `@/components/ui/map` for display

### Preview System (Screenshot-Based)

**Critical Difference from Web Version:** Uses static images instead of live interactive maps.

- `ComponentPreview` (server component) - Fetches and highlights code server-side
- `ComponentPreviewClient` (client component) - Shows screenshot in Preview tab, code in Code tab
- Screenshots are stored in `public/screenshots/` directory
- Format: PNG files at ~800x400px for examples, ~1200x800px for home widgets

### Code Highlighting

Uses Shiki for syntax highlighting with theme-aware rendering (`src/lib/highlight.ts`). The `highlightCode` function supports both light (github-light) and dark (github-dark) themes.

### Styling

- Tailwind CSS v4 with shadcn/ui conventions for the docs site (NOT for the RN component)
- Uses CSS variables for theming (see `components.json`)
- Path alias: `@/` maps to `src/`
- The React Native component uses StyleSheet and NativeWind

### React Native Component Details

The map component is for React Native and provides:

1. **Dependencies**:
   - `@maplibre/maplibre-react-native` v11.0.0-beta.10 - Core map library
   - `expo-location` v19.0.8 - Location services and permissions

2. **Architecture**:
   - Context-based: `MapContext` provides mapRef, cameraRef, isLoaded, theme
   - Theme integration: Auto-switches CARTO light/dark basemaps based on `useColorScheme()`
   - Uses React Native primitives: View, Text, Pressable, StyleSheet
   - Permission handling via expo-location's LocationManager

3. **Components**:
   - `Map` - Main container with MapView and Camera
   - `MapMarker` - Marker with `coordinate={[lng, lat]}` OR `longitude + latitude` props
   - `MarkerContent`, `MarkerLabel`, `MarkerPopup` (Callout-based)
   - `MapControls` - Zoom and locate buttons
   - `MapRoute` - LineLayer-based polylines using ShapeSource
   - `MapUserLocation` - Shows user location with auto-permission handling
   - `useMap()` hook - Returns `{ mapRef, cameraRef, isLoaded, theme }`
   - `useCurrentPosition()` - Re-exported from MapLibre for location
   - `LocationManager` - Re-exported for manual permission handling

4. **Notable Differences from Web Version**:
   - No `MapClusterLayer` (clustering not available in RN)
   - No `MarkerTooltip` (no hover on mobile)
   - No standalone `MapPopup` (only MarkerPopup via Callout)
   - No draggable markers
   - Props: `onPress` instead of `onClick`, no `onMouseEnter/Leave`
   - Styling: `style` (ViewStyle/TextStyle) instead of `className`
   - MarkerPopup opens on press, not hover

## Important Conventions

- Example files in `src/app/docs/_components/examples/` should import from `@/registry/map` (not `@/components/ui/map`)
- The get-example-source utility automatically transforms these imports for documentation display
- All map-related components are for React Native only
- Use date-fns for any date formatting needs (per global instructions)
- Screenshots must be added to `public/screenshots/` when adding new examples

## Screenshot Workflow

When adding new examples:

1. Create example code in `src/app/docs/_components/examples/`
2. Run the mapcn-react-native app on iOS/Android simulator
3. Navigate to the example and capture screenshot (Cmd+S on iOS simulator)
4. Optimize and crop to ~800x400px
5. Save to `public/screenshots/{example-name}.png`
6. Reference in documentation page:
   ```tsx
   <ComponentPreview
     code={exampleSource}
     screenshotName="example-name.png"
   />
   ```

## API Differences Reference

**Removed Components:**
- MapClusterLayer
- MarkerTooltip
- MapPopup (standalone)

**New Components:**
- MapUserLocation
- useCurrentPosition hook
- LocationManager export

**Prop Changes:**
- `onClick` → `onPress`
- `className` → `style` (ViewStyle/TextStyle)
- `draggable` → not supported

**Styling:**
- Web: Tailwind classes
- RN: `StyleSheet.create()` or NativeWind
