#!/usr/bin/env bash
# Ephemeral-infra integration lane: bring up Postgres, migrate the test database, run the suite.
# The .env file is read through Node's parser, not `source`, because values may contain spaces.
set -euo pipefail
cd "$(dirname "$0")/.."

TEST_DATABASE_URL="${TEST_DATABASE_URL:-$(node --env-file-if-exists=.env -p 'process.env.TEST_DATABASE_URL ?? ""')}"
if [ -z "$TEST_DATABASE_URL" ]; then
  echo "TEST_DATABASE_URL must be set (see .env.example)" >&2
  exit 1
fi

docker compose up -d --wait postgres
DATABASE_URL="$TEST_DATABASE_URL" pnpm --filter @nazariitsubera/core db:migrate:deploy
TEST_DATABASE_URL="$TEST_DATABASE_URL" pnpm --filter @nazariitsubera/core test:integration
