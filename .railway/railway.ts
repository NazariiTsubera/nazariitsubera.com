// Railway infrastructure as code for the production environment. Plan with `railway config plan`,
// apply with `railway config apply`. Variable values stay on Railway (preserve()); only their
// names are listed here. See AGENTS.md, "Deployment".
import { defineRailway, github, postgres, preserve, project, redis, service, volume } from "railway/iac";

export default defineRailway(() => {
  const repo = github("NazariiTsubera/nazariitsubera.com", { checkSuites: false });

  const Postgres = postgres("Postgres", { region: "sfo" });
  Postgres.networking = { privateNetworkEndpoint: "postgres" };
  const Redis = redis("Redis", { region: "sfo" });
  Redis.deploy = {
    startCommand:
      '/bin/sh -c "rm -rf $RAILWAY_VOLUME_MOUNT_PATH/lost+found/ && exec docker-entrypoint.sh redis-server --requirepass $REDIS_PASSWORD --save 60 1 --dir $RAILWAY_VOLUME_MOUNT_PATH"',
  };
  Redis.networking = { privateNetworkEndpoint: "redis" };
  const postgresVolume = volume("postgres-volume", {
    alerts: { usage: { "100": {}, "80": {}, "95": {} } },
    allowOnlineResize: true,
    region: "sfo",
    sizeMB: 5000,
  });
  const redisVolume = volume("redis-volume", {
    alerts: { usage: { "100": {}, "80": {}, "95": {} } },
    allowOnlineResize: true,
    region: "sfo",
    sizeMB: 5000,
  });

  // Shared by web and worker: the env schema in packages/core/src/env.
  const shared = {
    DATABASE_URL: preserve(),
    REDIS_URL: preserve(),
    SITE_ROOT_DOMAIN: preserve(),
    NEXT_PUBLIC_APP_URL: preserve(),
    OPERATOR_NAME: preserve(),
    OPERATOR_PHONE: preserve(),
    PREVIEW_DAYS: preserve(),
    PROVIDERS_MODE: preserve(),
    STORAGE_DIR: preserve(),
    ASSETS_PUBLIC_URL: preserve(),
  };

  // Next.js app: marketing pages, console, API routes, vendor sites by hostname.
  const web = service("nazariitsubera.com", {
    source: repo,
    replicas: { sfo: 1 },
    domains: ["*.nazariitsubera.com", "nazariitsubera.com"],
    networking: { privateNetworkEndpoint: "nazariitsuberacom" },
    env: {
      ...shared,
      BETTER_AUTH_SECRET: preserve(),
      BETTER_AUTH_URL: preserve(),
      HUBSPOT_PORTAL_ID: preserve(),
      HUBSPOT_FORM_GUID: preserve(),
    },
  });
  web.build = { builder: "RAILPACK", buildCommand: "pnpm --filter web build" };
  web.deploy = {
    startCommand: "pnpm --filter web start",
    preDeployCommand: ["pnpm --filter @nazariitsubera/core db:migrate:deploy"],
    healthcheckPath: "/api/health",
    healthcheckTimeout: 180,
    restartPolicyType: "ON_FAILURE",
    restartPolicyMaxRetries: 5,
  };

  // BullMQ worker. Built from a Dockerfile on the Playwright image because the gate needs Chromium.
  const worker = service("worker", {
    source: repo,
    replicas: { sfo: 1 },
    env: { ...shared, WORKER_CONCURRENCY: preserve() },
  });
  worker.build = { builder: "DOCKERFILE", dockerfilePath: "apps/worker/Dockerfile" };
  worker.deploy = { restartPolicyType: "ALWAYS" };

  return project("nazariitsubera.com", {
    resources: [web, worker, Postgres, Redis, postgresVolume, redisVolume],
  });
});
