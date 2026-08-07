# mapcn-rn

Small CLI for installing mapcn React Native components through the React Native Reusables CLI.

## Docs

Documentation and setup guides:

[mapcn-rn.dev](https://mapcn-rn.dev)

## Usage

```bash
npx mapcn-rn add
```

You can also skip the prompt:

```bash
npx mapcn-rn add --provider=carto
npx mapcn-rn add --provider=maptiler
npx mapcn-rn add --provider=mapbox
```

## What it does

`mapcn-rn` asks which map provider you want, resolves the correct mapcn registry URL, and runs:

```bash
npx @react-native-reusables/cli@latest add <registry-url>
```

## Providers

- `carto`
- `maptiler`
- `mapbox`
