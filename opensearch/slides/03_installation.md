---
layout: cover
---

# 3 - Installation et API REST

---

# Objectifs pédagogiques

À la fin de cette séquence (**~30 min**, TP compris), vous saurez :

- **Démarrer** OpenSearch et OpenSearch Dashboards avec Docker
- **Lire** les fichiers et paramètres de configuration essentiels
- **Vérifier** la santé du cluster avec l'API REST et les API `_cat`
- **Envoyer** des requêtes depuis Dev Tools et depuis `curl`

---

# Les modes d'installation

| Mode | Pour qui |
|---|---|
| **Docker / Docker Compose** | Lab, CI, la plupart des déploiements conteneurisés |
| **Archive `tar.gz`**, paquets **RPM / DEB** | Serveurs classiques, gérés par systemd |
| **Helm chart / Operator** | Kubernetes |
| **Service managé** | Amazon OpenSearch Service, Aiven… |

<br />

- OpenSearch embarque son **JDK** : rien à installer à côté
- **Linux** : `vm.max_map_count` ≥ **262144** (Lucene mappe ses fichiers en mémoire)

---

# Le lab : Docker Compose

```yaml
services:
  opensearch:
    image: opensearchproject/opensearch:3.9.0
    environment:
      - discovery.type=single-node          # un seul nœud, pas d'élection
      - DISABLE_SECURITY_PLUGIN=true        # lab uniquement !
      - OPENSEARCH_JAVA_OPTS=-Xms1g -Xmx1g  # heap JVM
    ports: ["9200:9200"]

  dashboards:
    image: opensearchproject/opensearch-dashboards:3.9.0
    environment:
      - OPENSEARCH_HOSTS=["http://opensearch:9200"]
      - DISABLE_SECURITY_DASHBOARDS_PLUGIN=true
    ports: ["5601:5601"]
```

Le fichier complet : `workshops/01_installation/docker-compose.yml`.

---

# La configuration

`config/opensearch.yml` — ou des variables d'environnement, avec Docker :

```yaml
cluster.name: formation
node.name: node-1
node.roles: [cluster_manager, data, ingest]
path.data: /var/lib/opensearch
network.host: 0.0.0.0
http.port: 9200
discovery.seed_hosts: ["node-1", "node-2", "node-3"]
cluster.initial_cluster_manager_nodes: ["node-1", "node-2", "node-3"]
```

- `config/jvm.options` : la **heap**. Règle : **≤ 50 %** de la RAM, **≤ ~31 Go**, `Xms` = `Xmx`
- `cluster.initial_cluster_manager_nodes` : **une seule fois**, au premier démarrage

---

# La sécurité, en vrai

En production, le **plugin de sécurité** est **activé** :

- **TLS** sur le transport (entre nœuds) et sur HTTP
- **Authentification** : utilisateurs internes, LDAP, SAML, OpenID Connect
- **Autorisations** : rôles, au niveau du cluster, de l'index, du document et du champ
- **Journal d'audit**

<br />

Sans le désactiver, l'image Docker exige un mot de passe admin :

```bash
docker run -e OPENSEARCH_INITIAL_ADMIN_PASSWORD='M0t-de-passe!Fort' \
  -e discovery.type=single-node -p 9200:9200 opensearchproject/opensearch:3.9.0
curl -k -u admin:'M0t-de-passe!Fort' https://localhost:9200
```

---

# L'API REST

Tout passe par **HTTP + JSON** : `MÉTHODE /chemin`, et un corps JSON éventuel.

| Méthode | Usage |
|---|---|
| `GET` | Lire : un document, une recherche, un état |
| `PUT` | Créer ou remplacer à un chemin connu : un index, un document d'`_id` donné |
| `POST` | Créer sans `_id`, ou une action : `_search`, `_bulk`, `_update` |
| `DELETE` | Supprimer |
| `HEAD` | Tester l'existence |

<br />

- Les chemins qui commencent par `_` sont des **API** : `_search`, `_cat`, `_cluster`…
- `?pretty`, `?format=json`, `?v` : options de sortie

---

# Le cluster répond-il ?

```json
GET /
```

**Résultat attendu** :

```json
{
  "version": { "distribution": "opensearch" },
  "tagline": "The OpenSearch Project: https://opensearch.org/"
}
```

```json
GET /_cluster/health
```

- `status` : `green`, `yellow`, `red`
- `number_of_nodes`, `active_shards`, `unassigned_shards`

---

# Les API `_cat`

Des tableaux lisibles par un humain — `?v` ajoute les en-têtes :

```json
GET /_cat/nodes?v
GET /_cat/indices?v
GET /_cat/shards?v
GET /_cat/health?v
```

```text
ip         heap.percent ram.percent cpu load_1m node.role node.roles                                  cluster_manager name
172.18.0.2           24          71   3    0.52 dimr      cluster_manager,data,ingest,remote_cluster_client *  opensearch-node1
```

- `?format=json` : le même tableau, en JSON, pour un script
- `?h=index,health,docs.count` : choisir ses colonnes ; `?s=docs.count:desc` : trier

---

# Dev Tools

OpenSearch Dashboards → menu ☰ → **Management** → **Dev Tools**

- La console envoie la requête **au cluster** : pas besoin de `curl`
- Auto-complétion des API, des index et des champs
- `Ctrl + Entrée` : envoyer la requête sous le curseur
- Clé à molette → **Copy as cURL**

Le même appel, en ligne de commande :

```bash
curl -s 'http://localhost:9200/_cat/indices?v'
curl -s -X PUT 'http://localhost:9200/test' -H 'Content-Type: application/json' \
  -d '{ "settings": { "number_of_replicas": 0 } }'
```

---

# En pratique

## TP 1 - Installation et premiers pas
