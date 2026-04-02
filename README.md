<div align="center">
  <img src="https://github.com/aikenahac/mapcn-react-native-docs/blob/master/public/banner.png?raw=true" alt="mapcn banner" />

  <h1>mapcn-react-native</h1>
  <p><strong>Beautiful maps, made simple.</strong></p>

  <p>
    Free & open source map components. Zero config, one command setup.<br/>
    Built on <a href="https://maplibre.org/maplibre-react-native/">MapLibre React Native</a>, styled with <a href="https://uniwind.dev/">Uniwind</a>, works seamlessly with <a href="https://reactnativereusables.com/">React Native Reusables</a>.
  </p>

  <p>
    <a href="https://mapcn-rn.aiken.si/">Get Started</a> •
    <a href="https://mapcn-rn.aiken.si/docs/installation">Installation</a> •
    <a href="https://mapcn-rn.aiken.si/docs/basic-map">Examples</a>
  </p>
</div>

---

## Features

- 🎨 **Theme-aware** — Automatically adapts to light/dark mode
- 🎯 **Zero config** — Works out of the box with sensible defaults
- 📦 **shadcn/ui compatible** — Uses the same patterns and styling conventions
- 🗺️ **MapLibre GL powered** — Full access to MapLibre's powerful mapping capabilities
- 🧩 **Composable** — Build complex map UIs with simple, declarative components
- 📍 **Markers & Popups** — Rich marker system with popups, tooltips, and labels
- 🛤️ **Routes** — Draw routes and paths on your maps
- 🎮 **Controls** — Zoom, compass, locate, and fullscreen controls

## Basemap Options

Alternatively use the [mapbox version](https://github.com/aikenahac/mapcn-react-native-mapbox)

This project provides two map component options:

### Option 1: Carto Basemaps (Default)

Import from `@/components/ui/map` to use [CARTO Basemaps](https://docs.carto.com/faqs/carto-basemaps).

- **Commercial use**: Requires a CARTO Enterprise license. [Request a demo](https://carto.com/request-live-demo) for pricing details.
- **Non-commercial use**: Free for CARTO grantees under their [basemap terms](https://carto.com/legal/bmap).

### Option 2: Maptiler (Cheaper Alternative for commercial use)

Import from `@/components/ui/map-maptiler` to use [Maptiler](https://maptiler.com) tiles.

**Setup:**

1. Get a free access token at [https://cloud.maptiler.com/account/keys/](https://cloud.maptiler.com/account/keys/)
2. Create a `.env` file in the project root:
   ```env
   EXPO_PUBLIC_MAPTILER_API_KEY=your_token_here
   ```
3. Update your imports:
   ```tsx
   import { Map } from "@/components/ui/map-maptiler";
   ```

**Pricing:**

- Free 100k requests
- Pricing details: [https://www.maptiler.com/cloud/pricing/](https://www.maptiler.com/cloud/pricing/)

Both components have identical APIs and props. Choose based on your licensing and budget needs.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

#### Inspired by [mapcn](https://mapcn.dev)

## License

MIT License - see the [LICENSE](LICENSE) file for details.
