# The worker runs BullMQ processors and the gate, which drives Chromium through Playwright.
# The Playwright image ships the browser build that matches the `playwright` version pinned in
# packages/core, so keep the two versions in step. Build context is the repository root.
FROM mcr.microsoft.com/playwright:v1.63.0-noble

ENV CI=1
RUN npm install -g pnpm@10.6.1

WORKDIR /app

# Manifests first so the dependency layer is cached until a package.json or the lockfile changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY apps/worker/package.json apps/worker/
COPY packages/core/package.json packages/core/
# `prisma generate` runs in core's postinstall and needs the schema.
COPY packages/core/prisma packages/core/prisma
RUN pnpm install --frozen-lockfile --filter worker...

COPY apps/worker apps/worker
COPY packages/core packages/core

ENV NODE_ENV=production
CMD ["pnpm", "--filter", "worker", "start"]
