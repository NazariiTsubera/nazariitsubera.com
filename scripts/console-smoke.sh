#!/usr/bin/env bash
# End-to-end pass over the console's real HTTP surface: sign in, create a vendor,
# presign and upload a photo, tag it, and enqueue a generation. Requires the app on :3000,
# Postgres and Redis up, and a seeded operator.
set -euo pipefail
cd "$(dirname "$0")/.."

BASE="${BASE:-http://localhost:3000}"
JAR=$(mktemp)
trap 'rm -f "$JAR"' EXIT

EMAIL=$(node --env-file-if-exists=.env -p 'process.env.OPERATOR_EMAIL')
PASS=$(node --env-file-if-exists=.env -p 'process.env.OPERATOR_PASSWORD')

say() { printf '%-34s %s\n' "$1" "$2"; }

curl -sS -X POST "$BASE/api/auth/sign-in/email" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" -c "$JAR" -o /dev/null
say "signed in" "$(grep -c session_token "$JAR") cookie"

say "console page" "$(curl -sS -o /dev/null -w '%{http_code}' -b "$JAR" "$BASE/console")"

VENDOR=$(curl -sS -X POST "$BASE/api/console/vendors" -b "$JAR" -H 'Content-Type: application/json' \
  -d "{\"businessName\":\"Smoke Test $(date +%s)\",\"phone\":\"(210) 555-0142\",\"consent\":true}")
VENDOR_ID=$(node -e "console.log(JSON.parse(process.argv[1]).id)" "$VENDOR")
say "vendor created" "$(node -e "console.log(JSON.parse(process.argv[1]).slug)" "$VENDOR")"

# A one-pixel PNG stands in for a booth photo.
PNG=$(mktemp).png
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82' > "$PNG"
SHA=$(shasum -a 256 "$PNG" | cut -d' ' -f1)
BYTES=$(wc -c < "$PNG" | tr -d ' ')

PRESIGN=$(curl -sS -X POST "$BASE/api/console/uploads" -b "$JAR" -H 'Content-Type: application/json' \
  -d "{\"vendorId\":\"$VENDOR_ID\",\"kind\":\"asset\",\"contentType\":\"image/png\",\"sha256\":\"$SHA\",\"bytes\":$BYTES}")
ASSET_ID=$(node -e "console.log(JSON.parse(process.argv[1]).id)" "$PRESIGN")
UPLOAD_URL=$(node -e "console.log(JSON.parse(process.argv[1]).upload.url)" "$PRESIGN")
say "presigned upload" "asset $ASSET_ID"

say "uploaded bytes" "$(curl -sS -o /dev/null -w '%{http_code}' -X PUT -b "$JAR" \
  -H 'Content-Type: image/png' --data-binary "@$PNG" "$BASE$UPLOAD_URL")"

curl -sS -X POST "$BASE/api/console/assets" -b "$JAR" -H 'Content-Type: application/json' \
  -d "{\"action\":\"kind\",\"id\":\"$ASSET_ID\",\"kind\":\"scene\"}" -o /dev/null
curl -sS -X POST "$BASE/api/console/assets" -b "$JAR" -H 'Content-Type: application/json' \
  -d "{\"action\":\"hero\",\"id\":\"$ASSET_ID\"}" -o /dev/null
say "tagged scene + hero" "ok"

say "vendor page" "$(curl -sS -o /dev/null -w '%{http_code}' -b "$JAR" "$BASE/console/$VENDOR_ID")"
say "media served" "$(curl -sS -o /dev/null -w '%{http_code}' -b "$JAR" "$BASE/media/uploads/$VENDOR_ID/$SHA.png")"

JOB=$(curl -sS -X POST "$BASE/api/console/actions" -b "$JAR" -H 'Content-Type: application/json' \
  -d "{\"action\":\"generate\",\"vendorId\":\"$VENDOR_ID\"}")
say "generation enqueued" "$(node -e "console.log(JSON.parse(process.argv[1]).jobId ?? process.argv[1])" "$JOB")"

sleep 3
say "job status" "$(curl -sS -b "$JAR" "$BASE/api/console/jobs?vendorId=$VENDOR_ID" \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);console.log(j.status)})')"

echo "VENDOR_ID=$VENDOR_ID"
