---
layout: cover
---

# Installation et Configuration

Déploiement et paramétrage d'Elasticsearch en production

---

# Objectifs d'Apprentissage

À la fin de cette section, vous serez capable de:

- Installer et initialiser des nœuds Elasticsearch avec la configuration de base
- Configurer et former un cluster multi-nœuds avec les mécanismes de découverte
- Gérer les fichiers de configuration (elasticsearch.yml, jvm.options, log4j2.properties)
- Utiliser les APIs de vérification pour diagnostiquer l'état du cluster

---

# Installation d'Elasticsearch

[Elasticsearch peut être installé](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html) de plusieurs manières selon l'environnement cible.

**Méthodes d'installation principales**:
- **Package managers**: APT (Debian/Ubuntu), YUM (RHEL/CentOS), Homebrew (macOS)
- **Archives**: TAR.GZ (Linux/macOS), ZIP (Windows)
- **Docker**: Image officielle `docker.elastic.co/elasticsearch/elasticsearch`
- **Cloud**: Elastic Cloud (SaaS managed)

**Avantages par méthode**:
- Package managers: Intégration système (systemd), mises à jour automatiques
- Archives: Contrôle total, environnements sans privilèges root
- Docker: Isolation, reproductibilité, orchestration (Kubernetes)
- Cloud: Zéro maintenance infrastructure, scaling automatique

**Prérequis communs**: Java 17+ (inclus dans les packages officiels depuis ES 7.x)

---

# Structure de Répertoires Elasticsearch

Après installation, comprendre la structure de fichiers est essentiel pour l'administration.

**Répertoires principaux**:

| Répertoire | Contenu | Description |
|------------|---------|-------------|
| `/usr/share/elasticsearch/` | Binaires & libs | Installation Elasticsearch |
| `/etc/elasticsearch/` | Configuration | elasticsearch.yml, jvm.options, log4j2.properties |
| `/var/lib/elasticsearch/` | Données | Indices, snapshots |
| `/var/log/elasticsearch/` | Logs | Logs applicatifs |

---

# Structure de Répertoires Elasticsearch (détail)

**Personnalisation**: Chemins configurables via `path.data`, `path.logs` dans elasticsearch.yml

**Sous-répertoires importants**:
- **bin/** : Exécutables (elasticsearch, elasticsearch-plugin)
- **lib/** : Librairies Java
- **modules/** : Modules Elasticsearch (x-pack, etc.)
- **certs/** : Certificats TLS (ES 8.x+)

---

# Configuration de Base: elasticsearch.yml

Le fichier [elasticsearch.yml](https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html) contient la configuration principale du nœud.

**Paramètres essentiels**:
```yaml
cluster.name: production-cluster
node.name: node-1

# Rôles du nœud (ES 7.9+)
node.roles: [ master, data, ingest ]

# Réseau
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# Chemins
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# Sécurité (ES 8.x+ activée par défaut)
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
```

**Important**: Redémarrage requis après modification de elasticsearch.yml

---

# Démarrage d'un Nœud Elasticsearch

**Avec systemd (installation par package)**:
```bash
# Démarrer le service
sudo systemctl start elasticsearch

# Vérifier le statut
sudo systemctl status elasticsearch

# Activer au démarrage
sudo systemctl enable elasticsearch

# Consulter les logs en temps réel
sudo journalctl -u elasticsearch -f
```

**Avec archive (démarrage manuel)**:
```bash
# Démarrage en avant-plan (pour debug)
./bin/elasticsearch

# Démarrage en arrière-plan (daemon)
./bin/elasticsearch -d -p pid

# Arrêt propre
kill -SIGTERM $(cat pid)
```

**Premier démarrage ES 8.x**: Note les credentials auto-générés et l'enrollment token dans les logs !

---

# Cluster Setup: Mécanismes de Découverte

Elasticsearch utilise la [découverte automatique](https://www.elastic.co/guide/en/elasticsearch/reference/current/discovery-hosts-providers.html) pour former un cluster à partir de nœuds individuels.

**Mécanismes de découverte**:

1. **discovery.seed_hosts** (ES 7.x+):
```yaml
discovery.seed_hosts:
  - 192.168.1.10:9300
  - 192.168.1.11:9300
  - 192.168.1.12:9300
```
Liste des nœuds à contacter pour joindre le cluster.

2. **cluster.initial_master_nodes** (première initialisation):
```yaml
cluster.initial_master_nodes:
  - node-1
  - node-2
  - node-3
```
**Critique**: Obligatoire au premier démarrage, évite le "split-brain". **Retirer après formation du cluster !**

---

# Formation de Cluster avec Enrollment Tokens

Elasticsearch 8.x introduit les [enrollment tokens](https://www.elastic.co/guide/en/elasticsearch/reference/current/configuring-stack-security.html) pour sécuriser l'ajout de nœuds.

**Workflow de formation de cluster**:

1. **Démarrer le premier nœud (master)**:
```bash
./bin/elasticsearch
# Note l'enrollment token dans les logs de démarrage
```

2. **Générer un enrollment token (si expiré)**:
```bash
./bin/elasticsearch-create-enrollment-token -s node
```

3. **Rejoindre le cluster depuis un nouveau nœud**:
```bash
./bin/elasticsearch --enrollment-token <TOKEN>
```

**Avantages**: 
- ✅ TLS auto-configuré entre nœuds
- ✅ Pas de configuration manuelle de certificats
- ✅ Sécurité par défaut (zero-config security)

---

# Rôles de Nœuds

Chaque nœud peut avoir un ou plusieurs [rôles](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-node.html) définissant ses responsabilités.

**Rôles principaux**:
```yaml
node.roles: [ master, data, ingest, ml, transform ]
```

| Rôle | Responsabilité | Cas d'usage |
|------|---------------|-------------|
| **master** | Gestion du cluster (création d'index, allocation de shards) | Nœuds dédiés master-only pour clusters >10 nœuds |
| **data** | Stockage et recherche de données | Nœuds data-only pour stockage intensif |
| **ingest** | Preprocessing de documents (pipelines) | Transformation avant indexation |
| **ml** | Machine Learning jobs | Détection d'anomalies, forecasting |
| **transform** | Transformations de données | Agrégations continues |

**Architectures recommandées**:
- **Petit cluster (<10 nœuds)**: Tous les rôles sur tous les nœuds
- **Grand cluster**: Séparation master-only / data-only / coordinating-only

---

# Configuration JVM: jvm.options

Le fichier [jvm.options](https://www.elastic.co/guide/en/elasticsearch/reference/current/advanced-configuration.html#set-jvm-options) contrôle les paramètres de la JVM.

**Paramètres critiques**:
```
# Heap size (TOUJOURS identique pour Xms et Xmx)
-Xms4g
-Xmx4g

# Type de garbage collector (G1GC recommandé)
-XX:+UseG1GC
```

---

# Configuration JVM: Monitoring et Dumps

**GC Logging et diagnostics**:

```
# GC logging pour monitoring
-Xlog:gc*,gc+age=trace,safepoint:file=/var/log/elasticsearch/gc.log

# Dumps mémoire en cas d'OutOfMemoryError
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/lib/elasticsearch
```

**Règles de sizing heap**:
- ✅ Maximum 50% de la RAM physique (le reste pour le cache OS)
- ✅ Ne jamais dépasser 32GB (perte de compressed oops)
- ✅ -Xms = -Xmx (évite le resizing dynamique)

---

# Configuration des Logs: log4j2.properties

Elasticsearch utilise [Log4j2](https://www.elastic.co/guide/en/elasticsearch/reference/current/logging.html) pour la journalisation.

**Configuration par défaut**:
```properties
# Niveau de log global
logger.action.name = org.elasticsearch.action
logger.action.level = info

# Logs de recherche lente (slow logs)
index.search.slowlog.threshold.query.warn: 10s
index.search.slowlog.threshold.query.info: 5s
index.search.slowlog.threshold.query.debug: 2s

# Logs d'indexation lente
index.indexing.slowlog.threshold.index.warn: 10s
index.indexing.slowlog.threshold.index.info: 5s
```

---

# Configuration des Logs: log4j2.properties

**Ajustement dynamique** (sans redémarrage):
```bash
PUT /_cluster/settings
{
  "transient": {
    "logger.org.elasticsearch.discovery": "DEBUG"
  }
}
```

**Types de logs**: elasticsearch.log (général), elasticsearch_deprecation.log, gc.log, elasticsearch_index_indexing_slowlog.log

---

# Variables d'Environnement

Elasticsearch supporte la configuration via [variables d'environnement](https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html#_environment_variable_substitution) dans elasticsearch.yml.

**Syntaxe**:
```yaml
node.name: ${HOSTNAME}
network.host: ${ES_NETWORK_HOST}
cluster.name: ${ES_CLUSTER_NAME:my-cluster}  # Valeur par défaut: my-cluster
```

**Variables système importantes**:
```bash
# Heap JVM (alternative à jvm.options)
export ES_JAVA_OPTS="-Xms4g -Xmx4g"

# Chemin de configuration
export ES_PATH_CONF=/etc/elasticsearch

# Nom du cluster
export ES_CLUSTER_NAME=production

# Utilisateur Elasticsearch (démarrage)
export ES_USER=elasticsearch
```

**Cas d'usage**: Déploiements conteneurisés (Docker, Kubernetes), CI/CD, multi-environnements

---

# APIs de Vérification: _cat APIs

Les [_cat APIs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat.html) fournissent des informations lisibles sur l'état du cluster.

**Commandes essentielles**:
```bash
# Santé du cluster (statut global)
GET /_cat/health?v

# Liste des nœuds
GET /_cat/nodes?v

# Liste des indices
GET /_cat/indices?v

# Liste des shards et leur allocation
GET /_cat/shards?v

# Master actuel
GET /_cat/master?v
```

**Paramètres utiles**:
- `?v`: Headers (column names)
- `?h=column1,column2`: Sélection de colonnes
- `?s=column:asc`: Tri par colonne
- `?format=json`: Output JSON au lieu de texte

---

# API Cluster Health

L'API [_cluster/health](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-health.html) retourne l'état détaillé du cluster.

**Requête**:
```bash
GET /_cluster/health
```

**Réponse**:
```json
{
  "cluster_name": "production-cluster",
  "status": "green",
  "timed_out": false,
  "number_of_nodes": 3,
  "number_of_data_nodes": 3,
  "active_primary_shards": 10,
  "active_shards": 20,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 0
}
```

---

# API Cluster Health

**Interprétation des statuts**:
- 🟢 **green**: Tous les shards (primaires + replicas) sont alloués
- 🟡 **yellow**: Tous les primaires alloués, certains replicas manquants
- 🔴 **red**: Au moins un shard primaire manquant (perte de données potentielle)

---

# API Nodes Info et Stats

**_nodes API** retourne les informations et statistiques des nœuds.

**Informations statiques** (_nodes):
```bash
GET /_nodes
GET /_nodes/node-1,node-2  # Nœuds spécifiques
GET /_nodes/_master        # Nœud master actuel
```

Retourne: version, rôles, OS, JVM, plugins installés

**Statistiques dynamiques** (_nodes/stats):
```bash
GET /_nodes/stats
GET /_nodes/stats/jvm,os,process
```

Retourne:
- **JVM**: Heap usage, GC stats, thread count
- **OS**: CPU, memory, swap usage
- **Process**: File descriptors, CPU time
- **Indices**: Indexing/search rates, doc count
- **HTTP**: Requêtes HTTP en cours

---

# API Cat Indices

L'API [_cat/indices](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-indices.html) liste tous les indices avec leurs métriques.

**Requête**:
```bash
GET /_cat/indices?v&s=store.size:desc&h=index,health,status,pri,rep,docs.count,store.size
```

**Résultat typique**:
```
index          health status pri rep docs.count store.size
logs-2023.11   green  open     5   1   15000000      2.5gb
products       green  open     1   1     100000       50mb
users          yellow open     1   1      50000       10mb
```

**Colonnes utiles**:
- **health**: green/yellow/red
- **pri**: Nombre de shards primaires
- **rep**: Nombre de replicas
- **docs.count**: Nombre de documents
- **store.size**: Taille totale (primaires + replicas)

**Cas d'usage**: Monitoring de la croissance des indices, identification des indices volumineux

---

# Résumé

## Points Clés

- L'**installation** d'Elasticsearch supporte plusieurs méthodes (packages, archives, Docker, cloud)
- La **structure de répertoires** sépare binaires (/usr/share), config (/etc), données (/var/lib), logs (/var/log)
- Le fichier **elasticsearch.yml** contient la configuration principale (cluster.name, node.roles, network, sécurité)
- Les **mécanismes de découverte** permettent la formation automatique de clusters (discovery.seed_hosts, enrollment tokens)
- Les **rôles de nœuds** définissent les responsabilités (master, data, ingest, ml, transform)
- Les **APIs de vérification** (_cat, _cluster/health, _nodes) permettent de diagnostiquer l'état du cluster

---

# Résumé

## Concepts Importants

- **cluster.initial_master_nodes**: Obligatoire au premier démarrage, à retirer ensuite
- **Enrollment tokens** (ES 8.x+): Sécurisation automatique de l'ajout de nœuds
- **Heap sizing**: Maximum 50% RAM, ne jamais dépasser 32GB, -Xms = -Xmx
- **Cluster health**: green (parfait), yellow (replicas manquants), red (primaires manquants)

---

# Exercices Pratiques

Passez maintenant au **cahier d'exercices** pour mettre en pratique ces concepts.

**Labs à réaliser**:
- Lab 2.1: Installation et démarrage d'un nœud Elasticsearch
- Lab 2.2: Formation d'un cluster multi-nœuds
- Lab 2.3: Configuration et paramétrage avancé
- Lab 2.4: Utilisation des APIs de vérification et diagnostic

**Ces exercices couvrent**:
- Installation via différentes méthodes (package manager, Docker)
- Configuration de elasticsearch.yml et jvm.options
- Formation de cluster avec enrollment tokens
- Diagnostic avec _cat APIs et _cluster/health
