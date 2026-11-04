# OpenSearch — TODO relecture formation (1 jour)

État actuel : 12 chapitres (00 → 11), 8 TP, basé sur **OpenSearch 3.9.0**
(`ci/Dockerfile`, `workshops/01_installation/docker-compose.yml`).

3 todos par jour ouvré à partir du vendredi 6 novembre 2026 (mercredi 11
novembre férié sauté). Chaque TP est relu juste après le chapitre qui l'introduit.

## OpenSearch — Vendredi 6 novembre — Lancer OpenSearch en local

- [ ] Trouver / documenter comment lancer OpenSearch en local pour relire et
      rejouer les TP. Pistes :
      - le lab des apprenants : `docker compose up -d` dans
        `workshops/01_installation/` (OpenSearch :9200 + Dashboards :5601)
      - l'image de la CI : `docker build -t training-os ci && docker run -d --rm --name training-os -p 9200:9200 training-os`
- [ ] Vérifier `curl http://localhost:9200` et l'accès à http://localhost:5601
- [ ] Vérifier les prérequis machine (Docker, RAM, `vm.max_map_count` sous Linux)

## OpenSearch — Lundi 9 novembre

- [ ] Rejouer les requêtes : `node ../scripts/check-console.mjs .`
- [ ] Chapitre 00 — Programme (`slides/00_intro.md`)
- [ ] Chapitre 01 — OpenSearch (`slides/01_opensearch.md`)

## OpenSearch — Mardi 10 novembre

- [ ] Chapitre 02 — Architecture et concepts (`slides/02_architecture.md`)
- [ ] Chapitre 03 — Installation et API REST (`slides/03_installation.md`)
- [ ] TP 1 — Installation et premiers pas (`workshops/01_installation`, `solutions/01_installation`)

## OpenSearch — Jeudi 12 novembre

- [ ] Chapitre 04 — Indexation et mapping (`slides/04_indexing_mapping.md`)
- [ ] TP 2 — Indexation et mapping (`workshops/02_indexing_mapping`, `solutions/02_indexing_mapping`)
- [ ] Chapitre 05 — Recherche et pertinence (`slides/05_search_relevance.md`)

## OpenSearch — Vendredi 13 novembre

- [ ] TP 3 — Recherche et pertinence (`workshops/03_search`, `solutions/03_search`)
- [ ] Chapitre 06 — Analyse de texte (`slides/06_analysis.md`)
- [ ] TP 4 — Analyse de texte (`workshops/04_analysis`, `solutions/04_analysis`)

## OpenSearch — Lundi 16 novembre

- [ ] Chapitre 07 — Agrégations (`slides/07_aggregations.md`)
- [ ] TP 5 — Agrégations (`workshops/05_aggregations`, `solutions/05_aggregations`)
- [ ] Chapitre 08 — Fonctions de recherche avancées (`slides/08_advanced_search.md`)

## OpenSearch — Mardi 17 novembre

- [ ] TP 6 — Recherche avancée (`workshops/06_advanced_search`, `solutions/06_advanced_search`)
- [ ] Chapitre 09 — Ingest pipelines (`slides/09_ingest.md`)
- [ ] TP 7 — Ingest pipelines (`workshops/07_ingest`, `solutions/07_ingest`)

## OpenSearch — Mercredi 18 novembre

- [ ] Chapitre 10 — OpenSearch Dashboards (`slides/10_dashboards.md`)
- [ ] TP 8 — OpenSearch Dashboards (`workshops/08_dashboards`, `solutions/08_dashboards`)
- [ ] Chapitre 11 — Conclusion (`slides/11_conclusion.md` + `slides/shared/retro.md`)
