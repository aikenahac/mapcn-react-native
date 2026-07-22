# mapcn React Native - Documentation

Documentation website for [mapcn-react-native](https://github.com/anmoldeepsingh/mapcn-react-native), a shadcn/ui-compatible map component library for React Native.

## About

This Next.js site documents the React Native version of mapcn. Since React Native maps cannot run in browsers, examples use static screenshots captured from Expo simulators.

## Features

- Beautiful, theme-aware map components for React Native
- Built on @maplibre/maplibre-react-native v11
- shadcn/ui compatible installation pattern
- Comprehensive API documentation
- Screenshot-based interactive examples
- Dark mode support

## Development

```bash
pnpm install
pnpm dev
```

Visit http://localhost:3000

## Building

```bash
pnpm build
pnpm start
```

## Registry System

Build the component registry for shadcn CLI distribution:

```bash
pnpm registry:build
```

This outputs to `public/maps/map.json` for the shadcn CLI.

## Adding Examples

When adding new examples to the documentation:

1. Create example code in `src/app/docs/_components/examples/`
2. Run the mapcn-react-native app on iOS/Android simulator
3. Capture screenshot of the example (Cmd+S on iOS simulator)
4. Optimize and crop image to ~800x400px
5. Save to `public/screenshots/{example-name}.png`
6. Reference in documentation page:
   ```tsx
   <ComponentPreview
     code={exampleSource}
     screenshotName="example-name.png"
   />
   ```

## Screenshot Requirements

- **Example screenshots**: 800x400px minimum, saved to `/public/screenshots/`
- **Home page widgets**: 1200x800px, saved to `/public/screenshots/home/`
- Format: PNG (optimized)
- Background: Light mode preferred (or dark mode consistently)

## Project Structure

```
src/
├── app/
│   ├── (home)/          # Home page
│   └── docs/            # Documentation pages
│       ├── _components/ # Docs components & examples
│       └── */page.tsx   # Doc pages
├── components/          # UI components
├── lib/                 # Utilities
└── registry/
    └── map.tsx          # RN map component (distributed via registry)

public/
├── screenshots/         # Example screenshots
│   └── home/           # Home page widget screenshots
└── maps/               # Built registry (generated)
```

## Contributing

Contributions welcome! The main areas for contribution:

- Adding more example screenshots
- Improving documentation content
- Adding new usage examples
- Fixing typos or clarifying instructions

#### Inspired by [mapcn](https://mapcn.dev)

## License

MIT
