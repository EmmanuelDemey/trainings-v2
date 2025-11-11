## Lab 4.3: Configuration et Analyse des Slow Query Logs

**Topic**: Monitoring - Analyse des Logs
**Durée Estimée**: 20-25 minutes
**Prérequis**: Cluster Elasticsearch, accès aux fichiers de logs

### Objectif

Configurer les slow query logs pour capturer les requêtes lentes, exécuter une requête intentionnellement lente, et analyser les logs pour identifier les optimisations possibles.

### Contexte

Les utilisateurs se plaignent de lenteur sur certaines recherches. Vous devez activer les slow logs pour identifier les requêtes problématiques et leur temps d'exécution.

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Créez un index de test avec des données:

```bash
PUT /slowlog-test
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "content": { "type": "text" },
      "category": { "type": "keyword" },
      "views": { "type": "integer" }
    }
  }
}

# Indexer des documents (1000 pour avoir du volume)
POST /slowlog-test/_bulk
{"index":{}}
{"title":"Article 1","content":"Long content here...","category":"tech","views":100}
{"index":{}}
{"title":"Article 2","content":"Another long content...","category":"science","views":200}
... (répéter jusqu'à 1000 docs)
```

#### Étapes

**Étape 1**: Configurer les seuils de slow query log

```bash
PUT /slowlog-test/_settings
{
  "index.search.slowlog.threshold.query.warn": "500ms",
  "index.search.slowlog.threshold.query.info": "250ms",
  "index.search.slowlog.threshold.query.debug": "100ms",
  "index.search.slowlog.threshold.query.trace": "50ms",
  "index.search.slowlog.level": "info"
}
```

**Explication des niveaux**:
- **WARN** (500ms): Requêtes très lentes
- **INFO** (250ms): Requêtes lentes
- **DEBUG** (100ms): Requêtes moyennement lentes
- **TRACE** (50ms): Toutes les requêtes un peu lentes

**Note**: Seuls les logs du niveau configuré et au-dessus sont écrits (`level: info` → logs ≥250ms).

**Étape 2**: Configurer les slow indexing logs (optionnel)

```bash
PUT /slowlog-test/_settings
{
  "index.indexing.slowlog.threshold.index.warn": "1s",
  "index.indexing.slowlog.threshold.index.info": "500ms",
  "index.indexing.slowlog.threshold.index.debug": "250ms",
  "index.indexing.slowlog.threshold.index.trace": "100ms",
  "index.indexing.slowlog.level": "info"
}
```

**Étape 3**: Localiser les fichiers de slow logs

**Emplacement par défaut**:
```
/var/log/elasticsearch/<cluster_name>_index_search_slowlog.log
/var/log/elasticsearch/<cluster_name>_index_indexing_slowlog.log
```

**Vérifier les logs existent**:
```bash
ls -lh /var/log/elasticsearch/*slowlog.log
# ou si installation par archive:
ls -lh logs/*slowlog.log
```

**Étape 4**: Exécuter une requête lente

Créez une requête intentionnellement coûteuse (wildcard sur gros volume):

```bash
GET /slowlog-test/_search
{
  "query": {
    "wildcard": {
      "content": "*long*content*"
    }
  },
  "size": 100
}
```

**Note**: Les requêtes wildcard sont lentes car elles ne peuvent pas utiliser l'index inversé efficacement.

Ou utilisez une agrégation complexe:

```bash
GET /slowlog-test/_search
{
  "size": 0,
  "aggs": {
    "categories": {
      "terms": {
        "field": "category",
        "size": 100
      },
      "aggs": {
        "avg_views": {
          "avg": { "field": "views" }
        },
        "top_hits": {
          "top_hits": {
            "size": 10,
            "_source": ["title", "views"]
          }
        }
      }
    }
  }
}
```

**Étape 5**: Analyser les slow logs

Consultez le fichier de slow log:

```bash
tail -f /var/log/elasticsearch/elasticsearch_index_search_slowlog.log
```

**Format d'une entrée slow log**:
```
[2023-11-10T10:30:15,123][INFO ][i.s.s.query] [node-1] [slowlog-test][0] 
took[312ms], took_millis[312], total_hits[100 hits], 
types[], stats[], search_type[QUERY_THEN_FETCH], total_shards[1], 
source[{"query":{"wildcard":{"content":"*long*content*"}},"size":100}]
```

**Analyse**:
- **took**: 312 ms (au-dessus du seuil INFO de 250ms)
- **total_hits**: 100 résultats
- **source**: La requête complète (JSON)

**Étape 6**: Identifier les patterns de requêtes lentes

Recherchez dans les logs les requêtes fréquemment lentes:

```bash
# Compter les occurrences de wildcard
grep "wildcard" /var/log/elasticsearch/*_index_search_slowlog.log | wc -l

# Extraire les temps took
grep -oP 'took\[\K[0-9]+ms' /var/log/elasticsearch/*_index_search_slowlog.log | sort -n

# Identifier les index les plus impactés
grep "slowlog-test" /var/log/elasticsearch/*_index_search_slowlog.log | wc -l
```

**Étape 7**: Optimiser la requête identifiée

**Avant** (wildcard lent):
```bash
GET /slowlog-test/_search
{
  "query": {
    "wildcard": {
      "content": "*long*content*"
    }
  }
}
```
Temps: ~300ms

**Après** (match query rapide):
```bash
GET /slowlog-test/_search
{
  "query": {
    "match": {
      "content": "long content"
    }
  }
}
```
Temps: ~10ms ✅ (×30 plus rapide)

**Étape 8**: Désactiver les slow logs (si nécessaire)

```bash
PUT /slowlog-test/_settings
{
  "index.search.slowlog.threshold.query.warn": "-1",
  "index.search.slowlog.threshold.query.info": "-1",
  "index.search.slowlog.threshold.query.debug": "-1",
  "index.search.slowlog.threshold.query.trace": "-1"
}
```

**Note**: `-1` désactive le logging pour ce niveau.

#### Validation

**Commandes de vérification**:

1. Vérifier la configuration slow log d'un index:
```bash
GET /slowlog-test/_settings?include_defaults&filter_path=*.index.search.slowlog*,*.index.indexing.slowlog*
```

2. Forcer une requête lente et vérifier le log immédiatement:
```bash
# Exécuter une requête lente
GET /slowlog-test/_search?scroll=1m
{
  "size": 1000,
  "query": { "match_all": {} }
}

# Vérifier le slow log (dernières 10 lignes)
tail -10 /var/log/elasticsearch/elasticsearch_index_search_slowlog.log
```

3. Statistiques des slow logs (avec script):
```bash
# Extraire tous les temps took et calculer la moyenne
grep -oP 'took\[\K[0-9]+' /var/log/elasticsearch/*_index_search_slowlog.log | \
  awk '{ sum += $1; n++ } END { if (n > 0) print "Average: " sum/n " ms" }'
```

#### Critères de Succès

- ✅ Configurer les seuils slowlog avec `PUT /index/_settings`
- ✅ Localiser les fichiers de logs slowlog
- ✅ Exécuter une requête lente (>250ms)
- ✅ Lire et interpréter une entrée de slow log
- ✅ Identifier le type de requête lente (wildcard, agrégation complexe)
- ✅ Proposer une optimisation

#### Dépannage

**Problème**: Aucun slow log généré même avec requêtes lentes
→ Vérifiez le niveau de log: `index.search.slowlog.level` doit être au bon niveau
→ Vérifiez que la requête dépasse effectivement le seuil (mesurez avec `?profile=true`)
→ Vérifiez les permissions du fichier de log: `ls -l /var/log/elasticsearch/`

**Problème**: Fichier de slow log devient trop volumineux
→ Configurez la rotation des logs dans `log4j2.properties`:
```properties
appender.index_search_slowlog_rolling.type = RollingFile
appender.index_search_slowlog_rolling.filePattern = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}_index_search_slowlog-%d{yyyy-MM-dd}.log
appender.index_search_slowlog_rolling.policies.type = Policies
appender.index_search_slowlog_rolling.policies.time.type = TimeBasedTriggeringPolicy
appender.index_search_slowlog_rolling.policies.time.interval = 1
```

**Problème**: Trop de slow logs, bruit important
→ Augmentez les seuils: 500ms → 1s, 250ms → 500ms
→ Activez uniquement le niveau WARN (requêtes très lentes)

---

