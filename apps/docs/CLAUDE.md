# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- `content/docs/**/*.mdx` - Topic-based documentation pages, rendered through Fumadocs
- `src/mdx-components.tsx` - Registers custom MDX components (`PackageManagerCodeBlock`, `ExamplePreview`)
- No local example-source directory: example code is read live from `apps/demo-maplibre/src/app/examples/<slug>.tsx` at build time

### Preview System (CDN-Hosted Screenshots + QR Codes)

**Critical Difference from Web Version:** Uses static images instead of live interactive maps.

- `src/components/mdx/example-preview.tsx` (server component) - Reads the example's source straight from `apps/demo-maplibre/src/app/examples/<slug>.tsx` and highlights it with `highlightCode`
- `src/components/mdx/example-preview-client.tsx` (client component) - Preview / Code / App Preview (QR) tabs
- Screenshots and QR codes are hosted on the Bunny CDN (`NEXT_PUBLIC_BUNNY_CDN_URL`), not committed to the repo:
  - `${cdnUrl}/screenshots/<slug>.png` - docs-page screenshot, ~800x400px
  - `${cdnUrl}/screenshots/home/<slug>.png` - home-page widget screenshot, ~1200x800px
  - `${cdnUrl}/qr/<slug>.png` - QR code encoding `mapcn-rn://examples/<slug>`, a deep link into the `demo-maplibre` companion app
- Used in MDX as `<ExamplePreview slug="basic-map" />`

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

- Example code lives in `apps/demo-maplibre/src/app/examples/<slug>.tsx` (the demo app is the single source of truth; `ExamplePreview` reads it directly, nothing is duplicated into the docs repo)
- All map-related components are for React Native only
- Use date-fns for any date formatting needs (per global instructions)
- Screenshots and QR codes for a new example must be uploaded to the CDN under `/screenshots/<slug>.png` and `/qr/<slug>.png` before `<ExamplePreview slug="<slug>" />` will render real content

## Screenshot & QR Workflow

When adding a new example:

1. Add the example route in `apps/demo-maplibre/src/app/examples/<slug>.tsx` (and `apps/demo-mapbox` if applicable).
2. Generate a QR code encoding `mapcn-rn://examples/<slug>` (e.g. `npx --yes qrcode "mapcn-rn://examples/<slug>" -o <slug>.png`) and upload it to the CDN at `/qr/<slug>.png`.
3. Run `demo-maplibre` on an iOS/Android simulator, navigate to `/examples/<slug>`, and capture a screenshot.
4. Optimize and crop to ~800x400px, upload to the CDN at `/screenshots/<slug>.png`. If the example is also featured on the docs home page, capture a second, wider crop (~1200x800px) and upload it to `/screenshots/home/<slug>.png`.
5. Reference it in the relevant MDX page:
   ```mdx
   <ExamplePreview slug="<slug>" />
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
