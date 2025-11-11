## 🌟 Bonus 3.B: Troubleshooting Slow Indexing Performance

**Niveau**: Avancé
**Prérequis**: Lab 3.2 complété, compréhension du Bulk API

### Objectif

Diagnostiquer et résoudre les problèmes de performance d'indexation en utilisant les techniques d'optimisation: Bulk API, refresh_interval tuning, et disable replicas temporairement.

### Contexte

Votre pipeline d'indexation est lent (~1,000 docs/sec au lieu des 10,000 attendus). Vous devez identifier les goulots d'étranglement et appliquer les optimisations appropriées.

### Challenge

**Partie 1**: Benchmark de l'indexation initiale

Créez un index de test:

```bash
PUT /indexing-perf-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "refresh_interval": "1s"
  }
}
```

Indexez 10,000 documents UN PAR UN (méthode lente):

```bash
time for i in {1..10000}; do
  curl -X POST "localhost:9200/indexing-perf-test/_doc" \
    -H 'Content-Type: application/json' \
    -d'{"field":"value","number":'$i'}' \
    -s -o /dev/null
done
```

**Temps mesuré** (exemple): `real 5m30s` → **30 docs/sec** ❌

**Partie 2**: Optimisation 1 - Utiliser Bulk API

Supprimez l'index et recréez-le:

```bash
DELETE /indexing-perf-test
PUT /indexing-perf-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "refresh_interval": "1s"
  }
}
```

Indexez avec Bulk API (batches de 1000 docs):

```bash
# Générer le fichier bulk
for i in {1..10000}; do
  echo '{"index":{}}'
  echo '{"field":"value","number":'$i'}'
done > bulk-data.json

# Indexer avec Bulk
time curl -X POST "localhost:9200/indexing-perf-test/_bulk" \
  -H 'Content-Type: application/x-ndjson' \
  --data-binary @bulk-data.json \
  -s -o /dev/null
```

**Temps mesuré** (exemple): `real 0m15s` → **666 docs/sec** ✅ (×22 plus rapide)

**Partie 3**: Optimisation 2 - Augmenter refresh_interval

```bash
PUT /indexing-perf-test/_settings
{
  "index.refresh_interval": "30s"
}
```

Réindexez avec le même Bulk:

```bash
time curl -X POST "localhost:9200/indexing-perf-test/_bulk" \
  -H 'Content-Type: application/x-ndjson' \
  --data-binary @bulk-data.json \
  -s -o /dev/null
```

**Temps mesuré** (exemple): `real 0m8s` → **1,250 docs/sec** ✅ (×2 amélioration)

**Explication**: Refresh toutes les 30s au lieu de 1s = moins de segments créés = moins d'overhead.

**Partie 4**: Optimisation 3 - Désactiver les replicas pendant l'indexation

```bash
PUT /indexing-perf-test/_settings
{
  "number_of_replicas": 0
}
```

Réindexez:

```bash
time curl -X POST "localhost:9200/indexing-perf-test/_bulk" \
  -H 'Content-Type: application/x-ndjson' \
  --data-binary @bulk-data.json \
  -s -o /dev/null
```

**Temps mesuré** (exemple): `real 0m4s` → **2,500 docs/sec** ✅ (×2 amélioration)

**Important**: Rétablir les replicas après indexation:

```bash
PUT /indexing-perf-test/_settings
{
  "number_of_replicas": 1
}
```

**Partie 5**: Optimisation 4 - Ajuster la taille des batches Bulk

Testez différentes tailles:

```bash
# Batch de 100 docs
split -l 200 bulk-data.json bulk-100-

# Batch de 5000 docs
split -l 10000 bulk-data.json bulk-5000-

# Mesurer la performance pour chaque
```

**Règle générale**: 5-15 MB par batch ou 1000-5000 documents.

**Partie 6**: Identifier d'autres goulots d'étranglement

Vérifiez les métriques d'indexation:

```bash
GET /_nodes/stats/indices?filter_path=nodes.*.indices.indexing
```

**Analyse**:
- `indexing.index_time_in_millis`: Temps total passé à indexer
- `indexing.index_failed`: Documents échoués (doit être 0)
- `indexing.throttle_time_in_millis`: Temps passé en throttling (merge)

Si `throttle_time` est élevé:

```bash
# Augmenter le threshold pour les merges
PUT /_cluster/settings
{
  "persistent": {
    "indices.store.throttle.max_bytes_per_sec": "200mb"
  }
}
```

### Validation

**Tableau récapitulatif des optimisations**:

| Technique | Amélioration | Quand l'utiliser |
|-----------|--------------|------------------|
| Bulk API | ×20-50 | Toujours pour indexation massive |
| refresh_interval: 30s | ×2-3 | Indexation initiale, réindexation |
| replicas: 0 temporaire | ×2 | Indexation initiale uniquement |
| Batch size optimal | ×1.5-2 | Ajuster selon network/heap |
| Disable _source | ×1.2-1.5 | Si _source non nécessaire (rare) |

**Score final de performance**:

```
Baseline (1 par 1):           30 docs/sec
Avec toutes optimisations: 2,500 docs/sec
Amélioration totale:          ×83
```

**Critère de succès**: 
- Comprendre l'impact de chaque optimisation
- Savoir quand appliquer chaque technique
- Mesurer et comparer les performances avant/après

---

