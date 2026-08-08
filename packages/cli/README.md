# mapcn-rn

CLI for [mapcn-rn](https://mapcn-rn.dev) — shadcn-style, copy-owned spatial UI
primitives for React Native and Expo.

It installs map components into your project as source files you own, tracks
what it wrote so it can tell you what you've since customized, and configures
the renderer (MapLibre or Mapbox) and basemap provider for you.

## Quick start

```bash
npx mapcn-rn init
npx mapcn-rn add map marker controls
```

`init` detects your project (package manager, `src` layout, tsconfig aliases,
uniwind/nativewind), installs the renderer package, wires the Expo config
plugin, writes `mapcn.json`, and sets up the provider API key env var.

## Commands

| Command | What it does |
| --- | --- |
| `init` | Set up mapcn-rn in the current project. `--renderer maplibre\|mapbox`, `--provider maptiler\|carto\|custom\|mapbox`, `--yes` |
| `add <component...>` | Install components and their dependencies. `--overwrite`, `--yes`, `--renderer` |
| `list` | List every registry component and show which are installed |
| `diff [component]` | Compare installed files against the registry, showing local edits |
| `doctor` | Check the project for config, dependency, permission, and env problems. `--json`, `--verbose` |
| `provider <target>` | Switch basemap provider (and renderer, when they differ). `--yes`, `--force` |
| `migrate` | Upgrade a v1 `components/ui/map.tsx` project to v2. `--yes` |

Global option: `--registry <url>` overrides the registry base URL
(default `https://mapcn-rn.dev/r`).

## Components

`core`, `map`, `marker`, `popup`, `controls`, `route`, `geojson`, `circle`,
`polygon`, `cluster`, `heatmap`, `choropleth`, `legend`, `location`,
`location-puck`, `style-switcher`.

Run `mapcn-rn list` for the current set, or browse the
[component reference](https://mapcn-rn.dev/docs/reference/components-index).

## Renderers and providers

One `Map` component, two renderers. You pick at `init` time and the CLI
installs the matching implementation:

- **MapLibre** (`@maplibre/maplibre-react-native`) with **CARTO** (no API key)
  or **MapTiler**
- **Mapbox** (`@rnmapbox/maps`)
- **custom** — bring your own style URLs

Switch later with `mapcn-rn provider mapbox`.

## Files it manages

`mapcn.json` in your project root records the renderer, provider, styling
system, aliases, and a hash per installed file. `diff` uses those hashes to
detect local edits, and `add` writes to a sidecar instead of overwriting a file
you've changed unless you pass `--overwrite` (overwritten files are backed up
under `.mapcn-backup/`).

## Coming from v1?

```bash
npx mapcn-rn migrate
```

It backs up your v1 `components/ui/map.tsx`, writes a v2 config, installs the
component graph, and prints line-specific notes for every API change. See the
[upgrade guide](https://mapcn-rn.dev/docs/getting-started/upgrade-to-v2).

## Docs

[mapcn-rn.dev](https://mapcn-rn.dev) ·
[CLI reference](https://mapcn-rn.dev/docs/reference/cli-command-reference)

## License

MIT
