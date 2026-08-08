# Multi-stage build for the docs site (mapcn-rn.dev).
#
# The build context is the REPO ROOT, not apps/docs -- the pnpm workspace
# lockfile and the sibling package manifests have to be visible to install.
# Dokploy settings that match this file:
#
#   Build Path         /
#   Docker File        ./apps/docs/Dockerfile
#   Docker Context     .
#   Docker Build Stage <empty>
#
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.2.2 --activate
WORKDIR /app

# ---- deps -------------------------------------------------------------
# Manifests only, so the install layer stays cached across source edits.
FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/docs/package.json apps/docs/
COPY apps/demo-maplibre/package.json apps/demo-maplibre/
COPY apps/demo-mapbox/package.json apps/demo-mapbox/
COPY packages/cli/package.json packages/cli/
COPY packages/registry/package.json packages/registry/
COPY packages/shared/package.json packages/shared/

# Installs the docs app and its workspace dependencies only -- the two Expo
# demo apps carry the React Native toolchain and are not needed to build docs.
RUN pnpm install --frozen-lockfile --filter docs...

# ---- builder ----------------------------------------------------------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=deps /app ./
COPY . .

# No registry generation step: apps/docs/public/r (the v2 component registry
# the CLI reads) and apps/docs/public/maps (the frozen v1 shadcn registry) are
# both committed. `pnpm registry:check` in CI guards them against drift.
RUN pnpm --filter docs run build

# ---- runner -----------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Next's standalone output for a workspace app mirrors the repo layout: the
# server entrypoint lands at apps/docs/server.js and the traced node_modules
# at the image root.
COPY --from=builder --chown=nextjs:nodejs /app/apps/docs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/docs/.next/static ./apps/docs/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/docs/public ./apps/docs/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/docs/server.js"]
