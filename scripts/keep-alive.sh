#!/usr/bin/env bash
# Keep the Render free-tier sanat-profile awake by pinging /api/health.
#
# Usage:
#   ./scripts/keep-alive.sh              # single ping (good for cron/launchd)
#   ./scripts/keep-alive.sh --loop       # ping repeatedly every $INTERVAL seconds
#
# Environment:
#   PROFILE_URL   base URL of the deployed app (default below)
#   INTERVAL      seconds between pings in --loop mode (default 1500 = 25 min)
#
# To schedule on macOS without keeping a terminal open, add to crontab
# (`crontab -e`), one ping every 25 minutes:
#   */25 * * * * PROFILE_URL=https://sanat-profile.onrender.com /full/path/scripts/keep-alive.sh >> /tmp/sanat-keepalive.log 2>&1
# (Use */10 instead of */25 to actually keep it warm against the 15-min sleep.)

set -euo pipefail

BASE="${PROFILE_URL:-https://sanat-profile.onrender.com}"
URL="${BASE%/}/api/health"
INTERVAL="${INTERVAL:-1500}"

ping_once() {
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 75 "$URL" || echo "000")
  echo "$(date '+%Y-%m-%d %H:%M:%S')  $URL -> $code"
  [ "$code" = "200" ]
}

if [ "${1:-}" = "--loop" ]; then
  echo "Keep-alive loop started: $URL every ${INTERVAL}s. Ctrl+C to stop."
  while true; do
    ping_once || echo "  (non-200 — instance may be waking)"
    sleep "$INTERVAL"
  done
else
  ping_once
fi
