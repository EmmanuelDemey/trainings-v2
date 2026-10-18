#!/bin/sh
# Writes the runtime configuration of the app — run by the nginx image at
# startup, like every script of /docker-entrypoint.d/, before nginx itself.
#
# Try it on your machine, without Docker:
#   ENV_JS_PATH=/tmp/env.js API_BASE_URL=https://swapi.example.com/api sh docker/40-env-js.sh
#   cat /tmp/env.js
set -eu

target="${ENV_JS_PATH:-/usr/share/nginx/html/env.js}"

# TODO 2.1: write `window.__ENV__ = { API_BASE_URL: "…", APP_ENVIRONMENT: "…" };`
#   from the variables of the same name — an empty string when one is unset
#   (`${API_BASE_URL:-}`: with `set -u`, a bare `$API_BASE_URL` would abort).
# TODO 2.2: the values end up inside a JavaScript string: escape `\` and `"`
#   first, or `API_BASE_URL='"; alert(1); "'` runs in every visitor's browser.
#   `printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'` does both.
echo 'window.__ENV__ = {};' > "$target"
