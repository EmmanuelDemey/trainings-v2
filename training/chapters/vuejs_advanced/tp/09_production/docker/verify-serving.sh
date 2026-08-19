#!/usr/bin/env bash
#
# PLAN B — the checks a "deploy, refresh, looks fine" never runs.
#
# Usage:  bash docker/verify-serving.sh [base-url]      (default: http://localhost:8080)
#
# Every check here maps to one line of `nginx.conf` / `Caddyfile` — and to one
# box in the Definition of Done. It is red on the skeleton config, and that is
# the point: fix the config until it exits 0.
#
# It only needs `curl`. It works just as well against your Netlify or Vercel URL:
#   bash docker/verify-serving.sh https://my-app.netlify.app

set -u

BASE="${1:-http://localhost:8080}"
BASE="${BASE%/}"

pass=0
fail=0

ok()   { printf '  \033[32mPASS\033[0m  %s\n' "$1"; pass=$((pass + 1)); }
ko()   { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; printf '        %s\n' "$2"; fail=$((fail + 1)); }
info() { printf '  \033[34mINFO\033[0m  %s\n' "$1"; }

status()  { curl -s -o /dev/null -w '%{http_code}' "$1"; }
headers() { curl -s -I "$1"; }
header()  { headers "$1" | tr -d '\r' | grep -i "^$2:" | cut -d' ' -f2- | tr '[:upper:]' '[:lower:]'; }

printf '\nServing checks against %s\n\n' "$BASE"

if ! curl -s -o /dev/null --max-time 5 "$BASE/"; then
  printf '  \033[31mUnreachable\033[0m — is the container up?\n'
  printf '        docker compose -f docker/compose.yml up -d\n\n'
  exit 1
fi

# 1 — the app is served at all.
code=$(status "$BASE/")
if [ "$code" = "200" ]; then
  ok "GET / returns 200"
else
  ko "GET / returns 200" "got $code — did you run \`npm run build\` before starting the container?"
fi

# 2 — history-mode fallback: the bug a hard refresh on a deep link exposes.
code=$(status "$BASE/invoices")
body=$(curl -s "$BASE/invoices")
if [ "$code" = "200" ] && printf '%s' "$body" | grep -q 'id="app"'; then
  ok "GET /invoices returns the app (history-mode fallback)"
else
  ko "GET /invoices returns the app (history-mode fallback)" \
     "got $code — the server looks for a file that does not exist. See TODO B1."
fi

# Find a real, content-hashed asset by reading it off the served index.
asset=$(curl -s "$BASE/" | grep -o '/assets/[A-Za-z0-9._-]*\.js' | head -n 1)

# 3 — index.html must never be cached.
cc=$(header "$BASE/index.html" 'cache-control')
if printf '%s' "$cc" | grep -Eq 'no-cache|no-store|max-age=0'; then
  ok "index.html is not cached (Cache-Control: ${cc})"
else
  ko "index.html is not cached" \
     "Cache-Control: ${cc:-<none>} — users keep loading the previous deployment's manifest. See TODO B2."
fi

# 4 — hashed assets can be cached forever.
if [ -z "$asset" ]; then
  ko "hashed assets are immutable" "no /assets/*.js found in the served index.html"
else
  cc=$(header "$BASE$asset" 'cache-control')
  if printf '%s' "$cc" | grep -q 'immutable' && printf '%s' "$cc" | grep -q 'max-age=31536000'; then
    ok "$asset is immutable for a year"
  else
    ko "$asset is immutable for a year" \
       "Cache-Control: ${cc:-<none>} — the name is content-hashed, cache it. See TODO B2."
  fi
fi

# 5 — the trap: the fallback must not swallow a missing asset.
code=$(status "$BASE/assets/does-not-exist-0000.js")
if [ "$code" = "404" ]; then
  ok "a missing asset 404s instead of returning index.html"
else
  ko "a missing asset 404s instead of returning index.html" \
     "got $code — the browser will parse HTML as JavaScript and report \`Unexpected token '<'\`. See TODO B3."
fi

# Bonus — reported, never enforced: TODO B4 is outside the Definition of Done.
missing=""
for h in x-content-type-options referrer-policy content-security-policy content-security-policy-report-only; do
  [ -z "$(header "$BASE/" "$h")" ] && missing="$missing $h"
done
if [ -n "$missing" ]; then
  info "bonus (TODO B4) — security headers not set:$missing"
else
  info "bonus (TODO B4) — security headers are set"
fi

printf '\n  %s passed, %s failed\n\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
