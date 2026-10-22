# TP 1 — Le lab, Fleet et un premier Elastic Agent

> Démarrer la stack du lab, vérifier le Fleet Server, créer une agent policy avec l'intégration System, et enrôler un Elastic Agent.

**Topic** : Stack Overview — Fleet et Elastic Agent

## Contexte

Le SOC démarre : avant de détecter quoi que ce soit, il faut **collecter**. Vous montez la stack, puis vous déployez un premier agent, géré par Fleet, qui envoie les logs et les métriques de sa machine.

## Setup

Ce dossier contient la stack du lab : `docker-compose.yml` et `kibana.yml`. Il faut **Docker** (Compose v2) et **8 Go de RAM** libres.

```bash
docker compose up -d --wait
```

- Kibana : <http://localhost:5601> — utilisateur `elastic`, mot de passe `changeme`
- Elasticsearch : <http://localhost:9200>
- Fleet Server : <http://localhost:8220>, démarré et enrôlé automatiquement

> Pas de Docker ? Un essai **Elastic Cloud** (14 jours) fait aussi l'affaire : Fleet Server y est déjà déployé. Les noms d'hôte du TP changent, le reste non.

## Exercice 1 — La stack répond

Dans Kibana, ouvrez **Dev Tools** (menu ☰ → Management → Dev Tools) et envoyez :

```json
GET /
```

Résultat attendu (extrait) :

```json
{
  "tagline": "You Know, for Search"
}
```

Puis la santé du cluster :

```json
GET /_cluster/health?filter_path=status,number_of_nodes
```

Un seul nœud : statut `green` ou `yellow`.

## Exercice 2 — Le Fleet Server

1. Ouvrez **Fleet** (menu ☰ → Management → Fleet).
2. Dans l'onglet **Agents**, un agent est déjà là : le **Fleet Server**, dans la policy *Fleet Server*, statut **Healthy**.
3. Onglet **Settings** : notez l'URL du Fleet Server (`http://fleet-server:8220`) et l'output (`http://elasticsearch:9200`).

> Qui a créé cette policy ? `kibana.yml` (`xpack.fleet.agentPolicies`) : la configuration de Fleet peut être **du code**, versionné avec le reste.

## Exercice 3 — Une agent policy

1. **Agent policies** → **Create agent policy**.
2. Nom : `Lab - Linux servers`, gardez **Collect system logs and metrics** coché.
3. Ouvrez la policy : elle contient déjà l'intégration **System** (`system-1`).
4. Cliquez sur l'intégration : repérez les trois blocs — *Collect logs from System instances*, *Collect events from the Windows event log*, *Collect metrics from System instances*.

**Question** : dans quel data stream arriveront les logs d'authentification Linux ?

<details>
<summary>Réponse</summary>

`logs-system.auth-default` : type `logs`, dataset `system.auth`, namespace `default` — le namespace de la policy.

</details>

## Exercice 4 — Ajouter une intégration

1. Dans la policy, **Add integration** → cherchez **Network Packet Capture**.
2. Gardez DNS et HTTP, désactivez le reste. Ajoutez-la à `Lab - Linux servers`.
3. Revenez à la policy : elle a maintenant deux intégrations, et sa **révision** a augmenté.

> Tous les agents de la policy recevront cette révision au prochain *check-in* — sans toucher aux machines.

## Exercice 5 — Enrôler un Elastic Agent

1. **Agents** → **Add agent** → policy `Lab - Linux servers`.
2. *Enroll in Fleet* : Kibana affiche la commande d'installation, avec un **enrollment token**. Copiez le token (`--enrollment-token=…`).
3. L'agent du lab tourne dans un conteneur, sur le réseau du lab :

```bash
docker run -d --name lab-agent --user root \
  --network elastic-security-lab_default \
  -e FLEET_ENROLL=1 \
  -e FLEET_URL=http://fleet-server:8220 \
  -e FLEET_INSECURE=1 \
  -e FLEET_ENROLLMENT_TOKEN=<votre token> \
  docker.elastic.co/elastic-agent/elastic-agent:9.5.5
```

4. Dans **Agents**, un deuxième agent apparaît, statut **Healthy** en moins d'une minute.

## Exercice 6 — Les données arrivent

<!-- ci: skip -->
```json
GET /_data_stream/logs-system*,metrics-system*?filter_path=data_streams.name
```

Vous devez voir au moins `metrics-system.cpu-default`, `metrics-system.memory-default`… — les logs viennent dès que la machine en écrit.

Puis, dans **Discover**, data view `metrics-*` : filtrez sur `agent.type: metricbeat` et `host.name` de votre agent.

## Critères de succès

- [ ] `GET /` répond, le cluster est `green` ou `yellow`
- [ ] Le Fleet Server est **Healthy**
- [ ] La policy `Lab - Linux servers` contient System et Network Packet Capture
- [ ] Le nouvel agent est **Healthy** et rattaché à cette policy
- [ ] Des data streams `metrics-system.*` existent

## Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `docker compose up` échoue sur Kibana | Mémoire insuffisante | Libérez de la RAM, ou baissez `ES_JAVA_OPTS` à `-Xms1g -Xmx1g` |
| Agent bloqué en *Enrolling* | Fleet Server injoignable | `docker logs lab-agent` : vérifiez `--network` et `FLEET_URL` |
| Agent **Unhealthy** | Output injoignable | Fleet → Settings → Outputs : `http://elasticsearch:9200` |
| `network … not found` | Nom du projet Compose différent | `docker network ls`, prenez le réseau `…_default` du lab |

## Pour aller plus loin

- Fleet → **Agents** → votre agent → **Logs** : les logs de l'agent lui-même, collectés par son monitoring.
- **Upgrade agent**, **Unenroll**, **Assign to new policy** : tout se fait depuis Kibana.
