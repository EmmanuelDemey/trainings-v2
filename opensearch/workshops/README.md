# OpenSearch — Travaux pratiques

Les exercices de la formation **OpenSearch**. Chaque TP vous donne les données et un
objectif par étape, **pas la requête** : vous la trouvez dans la documentation, vous
l'essayez, vous lisez la réponse, vous ajustez. Le résultat attendu vous permet de
vérifier ; un indice replié aide si vous bloquez — essayez d'abord sans.

## Ce qu'il vous faut

- **Docker** (Docker Desktop ou Docker Engine + Compose), 4 Go de RAM libres ;
- un navigateur ;
- un terminal, pour démarrer le lab et pour quelques appels `curl`.

Le lab est dans `01_installation/docker-compose.yml` : un nœud **OpenSearch** et
**OpenSearch Dashboards**, plugin de sécurité désactivé. Les requêtes se collent
telles quelles dans **Dev Tools** (menu ☰ → Management → Dev Tools).

Chaque TP est **autonome** : il crée les index et les données dont il a besoin, et
peut se faire sans les précédents.

La CI rejoue chaque TP sur OpenSearch 3.9.0, avec les solutions du formateur :
chaque résultat attendu est celui qu'obtient une bonne réponse.

## Les TP

| Moment | TP | Dossier | Sujet |
|-----|----|---------|-------|
| Matin | 1 | `01_installation/` | Démarrer le lab, santé du cluster, `_cat`, réplicas |
| Matin | 2 | `02_indexing_mapping/` | Mapping dynamique vs explicite, `_bulk`, `_reindex`, alias |
| Matin | 3 | `03_search/` | `match`, `term`, `bool`, `boost`, `function_score` |
| Après-midi | 4 | `04_analysis/` | `_analyze`, analyseur personnalisé, synonymes |
| Après-midi | 5 | `05_aggregations/` | Metrics, buckets, sous-agrégations, pipeline |
| Après-midi | 6 | `06_advanced_search/` | Tri, `search_after`, surlignage, complétion, géo, percolation |
| Après-midi | 7 | `07_ingest/` | `_simulate`, `csv`, `date`, conditions, `on_failure`, pipeline par défaut |
| Après-midi | 8 | `08_dashboards/` | Index pattern, Discover, visualisations, carte, tableau de bord |

Chaque TP se termine par **« Pour aller plus loin »** : de quoi prolonger après la
session, ce que la journée ne laisse pas le temps de faire.
