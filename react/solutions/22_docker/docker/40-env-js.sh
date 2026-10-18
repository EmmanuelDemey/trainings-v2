#!/bin/sh
# Writes the runtime configuration of the app — run by the nginx image at
# startup, like every script of /docker-entrypoint.d/, before nginx itself.
#
# Try it on your machine, without Docker:
#   ENV_JS_PATH=/tmp/env.js API_BASE_URL=https://swapi.example.com/api sh docker/40-env-js.sh
#   cat /tmp/env.js
set -eu

target="${ENV_JS_PATH:-/usr/share/nginx/html/env.js}"

# The values land inside a JavaScript string literal: escape the backslashes
# first, then the double quotes, so no value can close the string and run code
# in every visitor's browser.
js_string() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

# `${VAR:-}`: an unset variable becomes an empty string instead of aborting the
# script under `set -u`. The app then falls back to its build-time value.
cat > "$target" <<JS
window.__ENV__ = {
  API_BASE_URL: "$(js_string "${API_BASE_URL:-}")",
  APP_ENVIRONMENT: "$(js_string "${APP_ENVIRONMENT:-}")",
};
JS

echo "40-env-js.sh: wrote $target"
