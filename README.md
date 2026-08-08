<div align="center">
  <img src="https://github.com/aikenahac/mapcn-react-native-docs/blob/master/public/banner.png?raw=true" alt="mapcn banner" />

  <h1>mapcn-rn</h1>
  <p><strong>shadcn-style, copy-owned spatial UI primitives for React Native.</strong></p>

  <p>
    <a href="https://mapcn-rn.dev/">Docs</a> •
    <a href="https://mapcn-rn.dev/docs/installation">Installation</a>
  </p>
</div>

---

## Layout

```
apps/
  demo-maplibre/   Expo app — canonical MapLibre component source + examples
  demo-mapbox/     Expo app — canonical Mapbox component source + examples
  docs/            Next.js docs site (mapcn-rn.dev), serves the component registry
packages/
  cli/             the `mapcn-rn` CLI (npx mapcn-rn ...)
  shared/          renderer-independent source: types, geo/scale/color utils,
                   high-level components — materialized into both demo apps
  registry/        registry manifest + sync/check tooling
```

Component source is edited in `apps/demo-maplibre` and `apps/demo-mapbox` (or
`packages/shared` for renderer-independent pieces) and synchronized into the
CLI's registry — see `packages/registry` once the sync tooling lands.

## Development

```bash
pnpm install
pnpm --filter demo-maplibre start
pnpm --filter demo-mapbox start
pnpm --filter docs dev
pnpm --filter mapcn-rn dev   # CLI, package name "mapcn-rn"
```

`pnpm lint` / `pnpm typecheck` / `pnpm test` run across every workspace
package. `pnpm registry:sync` / `pnpm registry:check` are not implemented yet.

## Basemap options (current, pre-2.0 API)

- **MapLibre + CARTO** (default) — `@/components/ui/map` in `apps/demo-maplibre`
- **MapLibre + MapTiler** — `@/components/ui/map-maptiler` in `apps/demo-maplibre`
- **Mapbox** — `@/components/ui/map` in `apps/demo-mapbox`

2.0 replaces the per-provider file fork with a single `Map` component
configured by a renderer + basemap-provider choice at `init` time.

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
