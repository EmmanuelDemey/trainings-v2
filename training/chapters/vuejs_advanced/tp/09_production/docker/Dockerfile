# PLAN B — the image you would actually ship.
#
# Note what is NOT here: no `npm ci`, no `vite build`. The artifact was built
# once, by the CI job, and this image only copies it in — the same rule as step 7
# of the workshop. A Dockerfile that rebuilds the app ships something no test
# ever ran against.
#
# Build it from the PROJECT ROOT, after `npm run build`:
#   docker build -f docker/Dockerfile -t tp09-production .
#   docker run --rm -p 8080:80 tp09-production
#
# The multi-stage variant (`FROM node AS build` … `COPY --from=build /app/dist`)
# is the one you will see most often online. It is convenient, and it quietly
# rebuilds the artifact at deploy time. Know which trade-off you are making.

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/

EXPOSE 80
