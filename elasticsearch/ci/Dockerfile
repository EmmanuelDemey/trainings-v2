# The Elasticsearch every workshop README is replayed against in the CI
# (scripts/check-console.mjs) — the one place its version is written. Dependabot
# (.github/dependabot.yml) opens a pull request for each new release, whose CI
# replays every workshop on it.
#
#   docker build -t training-es elasticsearch/ci
#   docker run --rm -p 9200:9200 training-es
#   ES_PASSWORD=training node scripts/check-console.mjs elasticsearch
FROM docker.elastic.co/elasticsearch/elasticsearch:9.5.5

# One node, as in a learner's Docker setup; security on, as by default, but over
# plain HTTP. The trial license unlocks what the workshops use beyond the basic one
# (machine learning for the inference endpoints, the security APIs…).
ENV discovery.type=single-node \
    xpack.security.enabled=true \
    xpack.security.http.ssl.enabled=false \
    xpack.license.self_generated.type=trial \
    ELASTIC_PASSWORD=training \
    path.repo=/usr/share/elasticsearch/backups \
    ES_JAVA_OPTS="-Xms2g -Xmx2g"
