# TP 12 — ES|QL: Explorer des Logs en Pipes

> Interroger des logs avec ES|QL: filtrer, calculer, agréger, joindre une table de référence, et rechercher en plein texte — le tout dans une seule requête lisible de haut en bas.

**Topic**: ES|QL

## Contexte

L'équipe d'exploitation d'une boutique en ligne veut investiguer les erreurs de son site sans écrire de Query DSL: combien d'erreurs, sur quelles pages, depuis quels pays, à quelle heure. Vous allez répondre à ces questions avec ES|QL, depuis Kibana Dev Tools (et, si vous le souhaitez, depuis Discover en mode ES|QL).

## Setup

Ce TP est autonome. Créez l'index des logs et chargez les données:

```bash
DELETE /web-logs

PUT /web-logs
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "url": { "type": "keyword" },
      "message": { "type": "text" },
      "status": { "type": "integer" },
      "bytes": { "type": "long" },
      "country_code": { "type": "keyword" },
      "response_ms": { "type": "integer" }
    }
  }
}

POST /web-logs/_bulk?refresh=true
{"index":{}}
{"@timestamp":"2026-10-01T10:00:00Z","url":"/home","message":"GET /home served","status":200,"bytes":1200,"country_code":"FR","response_ms":45}
{"index":{}}
{"@timestamp":"2026-10-01T10:05:00Z","url":"/cart","message":"POST /cart failed: payment timeout","status":500,"bytes":300,"country_code":"DE","response_ms":3000}
{"index":{}}
{"@timestamp":"2026-10-01T10:20:00Z","url":"/old","message":"GET /old not found","status":404,"bytes":0,"country_code":"FR","response_ms":12}
{"index":{}}
{"@timestamp":"2026-10-01T10:40:00Z","url":"/home","message":"GET /home served","status":200,"bytes":1500,"country_code":"ES","response_ms":60}
{"index":{}}
{"@timestamp":"2026-10-01T11:10:00Z","url":"/cart","message":"POST /cart failed: stock service unavailable","status":503,"bytes":250,"country_code":"FR","response_ms":1500}
{"index":{}}
{"@timestamp":"2026-10-01T11:30:00Z","url":"/product/42","message":"GET /product/42 served","status":200,"bytes":5400,"country_code":"DE","response_ms":80}
{"index":{}}
{"@timestamp":"2026-10-01T11:45:00Z","url":"/cart","message":"POST /cart failed: payment timeout","status":500,"bytes":310,"country_code":"ES","response_ms":3000}
{"index":{}}
{"@timestamp":"2026-10-01T11:50:00Z","url":"/home","message":"GET /home served","status":200,"bytes":1300,"country_code":"FR","response_ms":50}
```

## Exercice

### Étape 1: Une première requête

Une requête ES|QL commence par une **commande source** (`FROM`), suivie de **commandes de traitement** séparées par `|`. Affichez les 3 requêtes les plus lentes:

```bash
POST /_query?format=txt
{
  "query": """
    FROM web-logs
    | SORT response_ms DESC
    | KEEP @timestamp, url, status, response_ms
    | LIMIT 3
  """
}
```

**Questions**:
- Que se passe-t-il si vous retirez `KEEP` ?
- Et si vous retirez `LIMIT` ? (ES|QL renvoie au plus 1000 lignes par défaut)

### Étape 2: Filtrer les erreurs

Comptez les erreurs serveur (`status >= 500`). Avec `format=json`, la réponse est un tableau de colonnes et de lignes:

```bash
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | WHERE status >= 500
    | STATS errors = COUNT(*)
  """
}
```

**Résultat attendu**:
```json
{
  "columns": [ { "name": "errors", "type": "long" } ],
  "values": [ [ 3 ] ]
}
```

### Étape 3: Calculer des colonnes avec EVAL

Classez chaque requête en `ok`, `client error` ou `server error`, et convertissez la taille en kilo-octets:

```bash
POST /_query?format=txt
{
  "query": """
    FROM web-logs
    | EVAL family = CASE(status >= 500, "server error",
                         status >= 400, "client error",
                         "ok"),
           kb = ROUND(bytes / 1024.0, 2)
    | KEEP url, status, family, kb
  """
}
```

### Étape 4: Agréger avec STATS … BY

Nombre d'erreurs et temps de réponse moyen, par page:

```bash
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | WHERE status >= 400
    | STATS errors = COUNT(*), avg_ms = AVG(response_ms) BY url
    | SORT errors DESC
  """
}
```

**Résultat attendu**:
```json
{
  "values": [
    [ 3, 2500.0, "/cart" ],
    [ 1, 12.0, "/old" ]
  ]
}
```

L'ordre des colonnes suit la requête: d'abord les agrégats, puis les clés du `BY`.

### Étape 5: Agréger dans le temps

Nombre de requêtes par tranche de 30 minutes, avec `BUCKET`:

```bash
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | STATS requests = COUNT(*) BY slot = BUCKET(@timestamp, 30 minutes)
    | SORT slot
  """
}
```

**Résultat attendu**:
```json
{
  "values": [
    [ 3, "2026-10-01T10:00:00.000Z" ],
    [ 1, "2026-10-01T10:30:00.000Z" ],
    [ 1, "2026-10-01T11:00:00.000Z" ],
    [ 3, "2026-10-01T11:30:00.000Z" ]
  ]
}
```

### Étape 6: Joindre une table de référence avec LOOKUP JOIN

Les logs ne contiennent qu'un code pays. Créez une **lookup index** (`index.mode: lookup`: un seul shard, répliqué sur tous les nœuds) avec le nom de chaque pays:

```bash
DELETE /countries

PUT /countries
{
  "settings": { "index.mode": "lookup" },
  "mappings": {
    "properties": {
      "country_code": { "type": "keyword" },
      "country_name": { "type": "keyword" }
    }
  }
}

POST /countries/_bulk?refresh=true
{"index":{}}
{"country_code":"FR","country_name":"France"}
{"index":{}}
{"country_code":"DE","country_name":"Allemagne"}
{"index":{}}
{"country_code":"ES","country_name":"Espagne"}
```

Puis comptez les erreurs serveur par pays:

```bash
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | WHERE status >= 500
    | LOOKUP JOIN countries ON country_code
    | STATS errors = COUNT(*) BY country_name
    | SORT country_name
  """
}
```

**Résultat attendu**:
```json
{
  "values": [
    [ 1, "Allemagne" ],
    [ 1, "Espagne" ],
    [ 1, "France" ]
  ]
}
```

**Question**: quelle différence avec `ENRICH` ? (Indice: pas de policy à créer ni à exécuter; la lookup index se met à jour comme n'importe quel index.)

### Étape 7: Recherche plein texte

`MATCH` utilise l'index inversé, comme une requête `match` du Query DSL. `METADATA _score` donne accès au score de pertinence:

```bash
POST /_query?format=json
{
  "query": """
    FROM web-logs METADATA _score
    | WHERE MATCH(message, "payment timeout")
    | STATS failures = COUNT(*)
  """
}
```

**Résultat attendu**:
```json
{
  "values": [ [ 2 ] ]
}
```

### Étape 8: Paramétrer une requête

Ne concaténez jamais une saisie utilisateur dans une requête: passez des **paramètres**.

```bash
POST /_query?format=json
{
  "query": """
    FROM web-logs
    | WHERE url == ?page AND response_ms > ?slow_ms
    | STATS slow = COUNT(*)
  """,
  "params": [ { "page": "/cart" }, { "slow_ms": 2000 } ]
}
```

**Résultat attendu**:
```json
{
  "values": [ [ 2 ] ]
}
```

## Pour aller plus loin

- Ouvrez **Discover**, passez en mode ES|QL et collez la requête de l'étape 5: Kibana trace l'histogramme.
- Créez une règle d'alerte de type **ES|QL** (Stack Management → Rules) qui se déclenche quand la requête de l'étape 2 renvoie plus de 2 erreurs.
- Essayez `INLINE STATS`: `FROM web-logs | INLINE STATS max_ms = MAX(response_ms) BY url | KEEP url, response_ms, max_ms`.

## Critères de Succès

- Écrire une requête ES|QL avec `FROM`, `WHERE`, `EVAL`, `STATS … BY`, `SORT`, `KEEP`, `LIMIT`
- Lire une réponse `format=json` (`columns` + `values`)
- Agréger dans le temps avec `BUCKET`
- Joindre une lookup index avec `LOOKUP JOIN`
- Rechercher en plein texte avec `MATCH`, et paramétrer une requête

## Dépannage

**Problème**: `Unknown index [countries]` dans un `LOOKUP JOIN`
→ L'index doit exister et avoir été créé avec `"index.mode": "lookup"` (ce mode ne peut pas être ajouté après coup).

**Problème**: `Unknown column [...]`
→ Une colonne retirée par `KEEP`/`DROP`, ou renommée par `STATS`, n'existe plus pour les commandes suivantes: l'ordre des commandes compte.

**Problème**: Les résultats s'arrêtent à 1000 lignes
→ C'est la limite par défaut: ajoutez un `LIMIT` explicite (10 000 au maximum).
