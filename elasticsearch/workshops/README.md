# Elasticsearch — Travaux pratiques

Les exercices pratiques de la formation **Elasticsearch**. Chaque TP est
**guidé** : les requêtes à envoyer et les réponses attendues sont dans son
énoncé, avec des critères de succès et une section de dépannage.

## Ce qu'il faut

- un cluster **Elasticsearch** accessible (`GET /` doit répondre) ;
- **Kibana**, pour envoyer les requêtes depuis **Dev Tools** (Console) — les
  blocs `GET /…`, `PUT /…`, `POST /…` des énoncés s'y collent tels quels ;
- un terminal, pour les TP qui touchent à la configuration des nœuds (TP 4, 6,
  7, 9 et 11) et aux appels `curl`.

Un seul nœud suffit pour la plupart des TP (statut `yellow` accepté) ; le TP 2
en monte plusieurs. Le TP 8 se fait en code (Node.js, ou le langage de votre
choix) et demande **Docker** pour Testcontainers.

Chaque TP est **autonome** : il crée lui-même les index et les données dont il a
besoin, et peut être fait sans avoir fait les précédents.

Tous les TP sont rejoués par la CI sur la dernière version d'Elasticsearch
(9.5.5) : les requêtes passent, et les réponses ont la forme annoncée.

## Les TP

| Jour | TP | Dossier | Sujet |
|------|----|---------|-------|
| 1 | 1 | `01_indexing_search/` | Créer un index, indexer des documents, `match` et `bool` |
| 1 | 2 | `02_cluster_setup/` | Former un cluster multi-nœuds, rôles des nœuds |
| 1 | 3 | `03_documents_alias_templates/` | CRUD de documents, `_bulk`, alias, index templates |
| 1 | 4 | `04_mapping_analyzers/` | Mapping explicite, `text` vs `keyword`, analyzers |
| 2 | 5 | `05_search/` | Lucene, Query DSL : plein texte, exact, géo, booléen, Cross Cluster Search |
| 2 | 6 | `06_aggregations/` | Agrégations de métriques, de buckets et pipeline |
| 2 | 7 | `07_esql/` | ES\|QL : filtrer, agréger, `LOOKUP JOIN`, plein texte |
| 3 | 8 | `08_sdk/` | Client officiel, tests avec Testcontainers |
| 3 | 9 | `09_sizing_performance/` | Nombre de shards, heap JVM, thread pools |
| 3 | 10 | `10_alerting_rbac/` | Kibana Rules, webhooks, utilisateurs et rôles |
| 3 | 11 | `11_ilm_retention/` | Architecture hot-warm-cold et policies ILM |
| 3 | 12 | `12_snapshots/` | Repositories, snapshots et restaurations |
| 3 | 13 | `13_cat_apis/` | Inspecter le cluster avec les `_cat` APIs |
| 3 | 14 | `14_monitoring/` | Cluster health, statistiques des nœuds, slow logs |
| 3 | 15 | `15_production_architecture/` | Allocation awareness, SLM, Field-Level Security |
