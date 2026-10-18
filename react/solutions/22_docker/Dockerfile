# syntax=docker/dockerfile:1
#
# The image of this app: built in a Node.js stage, shipped as static files
# served by a non-root nginx. ~90 MB instead of ~460 MB, and no Node.js, no
# sources, no node_modules in what runs in production.
#
#   docker build -t react-22-docker .
#   docker run --rm -p 8080:8080 -e API_BASE_URL=https://swapi.example.com/api react-22-docker

# --- Stage 1: build -----------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

# Manifests first, sources second: this layer — the slow one — is rebuilt only
# when the dependencies change, not on every edit of a component.
COPY package.json package-lock.json ./
# `npm ci`, not `npm install`: exactly the versions of the lockfile, or a failure.
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: serve -----------------------------------------------------------
# The unprivileged variant of the official image: nginx set up to run as the
# `nginx` user (uid 101), listening on 8080, its pid and caches in /tmp.
FROM nginxinc/nginx-unprivileged:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
# The image's entrypoint runs every script of /docker-entrypoint.d/ before
# nginx: this one writes /env.js from the container's environment variables.
COPY --chmod=755 docker/40-env-js.sh /docker-entrypoint.d/40-env-js.sh
# Owned by the nginx user, so the script can overwrite env.js at startup.
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

# Already the base image's user: stated anyway, because it is what a reviewer
# reads — and what `runAsNonRoot` in the Deployment relies on.
USER 101
EXPOSE 8080
