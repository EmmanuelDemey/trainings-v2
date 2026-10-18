# The image of this app — NAIVE on purpose. It works, and it is wrong in every
# way a production image can be: ~460 MB of Node.js and node_modules, the Vite
# DEV server facing users, running as root, and `npm install` resolving
# versions the lockfile never saw.
#
#   docker build -t react-22-docker .
#   docker run --rm -p 8080:8080 react-22-docker
#
# TODO 3.2: stage 1, `FROM node:24-alpine AS build`: copy package.json and
#   package-lock.json, `RUN npm ci`, THEN copy the sources and `RUN npm run build`.
#   The order is the cache: a change in src/ must not re-run `npm ci`.
# TODO 3.3: stage 2, `FROM nginxinc/nginx-unprivileged:stable-alpine` — nginx
#   already set up to run as a non-root user, listening on 8080:
#   - copy nginx.conf to /etc/nginx/conf.d/default.conf
#   - copy docker/40-env-js.sh to /docker-entrypoint.d/ with `--chmod=755`: the
#     nginx image runs every script of that folder before starting nginx
#   - copy /app/dist from the build stage into /usr/share/nginx/html, owned by
#     the nginx user (`--chown=101:101`), so the script can rewrite env.js
#   - `USER 101` (the base image already does it: say it anyway, it is what
#     a reviewer — and the spec — reads) and `EXPOSE 8080`

FROM node:24-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8080
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "8080"]
