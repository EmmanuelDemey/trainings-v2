# The OpenSearch every request of the workshops and of the slides is replayed
# against in the CI (scripts/check-console.mjs) — the one place its version is
# written. Dependabot (.github/dependabot.yml) opens a pull request for each new
# release, whose CI replays every workshop on it.
#
#   docker build -t training-os opensearch/ci
#   docker run --rm -p 9200:9200 training-os
#   node scripts/check-console.mjs opensearch
FROM opensearchproject/opensearch:3.9.0

# One node, as in the learners' lab (lab/docker-compose.yml). The security plugin
# is off, as in the lab: plain HTTP, no user — the checker's credentials are
# ignored.
ENV discovery.type=single-node \
    DISABLE_SECURITY_PLUGIN=true \
    DISABLE_INSTALL_DEMO_CONFIG=true \
    OPENSEARCH_JAVA_OPTS="-Xms1g -Xmx1g"
