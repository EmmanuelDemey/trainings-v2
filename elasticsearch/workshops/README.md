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

Un seul nœud suffit pour la plupart des TP (statut `yellow` accepté) ; le TP 4
en monte plusieurs.

## Les TP

| TP | Dossier | Sujet |
|----|---------|-------|
| 1 | `01_indexing_search/` | Créer un index, indexer des documents, `match` et `bool` |
| 2 | `02_mapping_analyzers/` | Mapping explicite, `text` vs `keyword`, analyzers |
| 3 | `03_aggregations/` | Agrégations de métriques et de buckets |
| 4 | `04_cluster_setup/` | Former un cluster multi-nœuds, rôles des nœuds |
| 5 | `05_cat_apis/` | Inspecter le cluster avec les `_cat` APIs |
| 6 | `06_sizing_performance/` | Nombre de shards, heap JVM, thread pools |
| 7 | `07_ilm_retention/` | Architecture hot-warm-cold et policies ILM |
| 8 | `08_monitoring/` | Cluster health, statistiques des nœuds, slow logs |
| 9 | `09_snapshots/` | Repositories, snapshots et restaurations |
| 10 | `10_alerting_rbac/` | Kibana Rules, webhooks, utilisateurs et rôles |
| 11 | `11_production_architecture/` | Allocation awareness, SLM, Field-Level Security |
