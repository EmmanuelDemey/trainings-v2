---
layout: cover
---

# Opérations de Maintenance

Gestion des sauvegardes, redémarrages et mises à jour

---

# Objectifs d'Apprentissage

À la fin de ce module, vous serez capable de :

- **Configurer et gérer** des snapshots (sauvegardes) et restaurations
- **Planifier et exécuter** des redémarrages de nœuds sans interruption de service
- **Préparer et réaliser** des mises à jour de version Elasticsearch
- **Utiliser les outils Kibana** pour faciliter les opérations de maintenance

---

# Pourquoi la Maintenance est Critique

Les opérations de maintenance garantissent la **disponibilité** et la **durabilité** de votre cluster :

**Scénarios courants nécessitant une maintenance** :
1. 💾 **Sauvegarde régulière** : Protection contre la perte de données (corruption, suppression accidentelle, disaster recovery)
2. 🔄 **Redémarrages planifiés** : Mise à jour de configuration, maintenance matérielle, optimisation système
3. ⬆️ **Mises à jour de version** : Nouvelles fonctionnalités, correctifs de sécurité, améliorations de performance
4. 🔧 **Maintenance du matériel** : Remplacement de disques, ajout de mémoire, migration vers nouveau serveur
5. 🚨 **Récupération après incident** : Restauration suite à une panne, corruption de données, attaque

**Principe clé** : Toute opération de maintenance doit minimiser l'impact sur la disponibilité du service (**Rolling Operations**).

---
layout: section
---

# Partie 1: Procédures de Sauvegarde et Restauration

Snapshots, repositories, et Snapshot Lifecycle Management

---

# Concepts des Snapshots Elasticsearch

Un **snapshot** est une sauvegarde incrémentale du cluster ou d'indices spécifiques.

**Caractéristiques clés** :
- 📸 **Sauvegarde incrémentale** : Seuls les segments non sauvegardés précédemment sont copiés
- ⚡ **Performance optimisée** : Les snapshots n'impactent pas significativement les performances du cluster
- 🎯 **Granularité flexible** : Sauvegarder tout le cluster, des indices spécifiques, ou des data streams
- 🔄 **Restauration sélective** : Restaurer le cluster complet, des indices individuels, ou même des alias
- 📦 **Compatibilité de version** : Snapshots créés en version N peuvent être restaurés en version N ou N+1

**Documentation** : [Snapshot and Restore](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html)

---

# Types de Repositories de Snapshots

Un **repository** est l'emplacement de stockage des snapshots.

| Type | Description | Use Case |
|------|-------------|----------|
| **fs** (Filesystem) | Système de fichiers partagé (NFS, SMB) | Environnements on-premise avec stockage réseau |
| **s3** | Amazon S3 bucket | Clusters hébergés sur AWS ou cloud hybride |
| **gcs** | Google Cloud Storage | Clusters hébergés sur GCP |
| **azure** | Azure Blob Storage | Clusters hébergés sur Azure |
| **hdfs** | Hadoop HDFS | Intégration avec écosystème Hadoop |
| **url** | Repository en lecture seule (HTTP/HTTPS/FTP) | Partage de snapshots entre clusters |

**Prérequis communs** :
- Tous les nœuds data et master doivent avoir accès au repository
- Le chemin du repository doit être déclaré dans `path.repo` dans `elasticsearch.yml`

---

# Configuration d'un Repository Filesystem

**Étape 1** : Configurer `path.repo` dans `elasticsearch.yml` sur **tous les nœuds** :

```yaml
path.repo: ["/mnt/elasticsearch/backups"]
```

**Étape 2** : Redémarrer les nœuds pour appliquer la configuration

**Étape 3** : Créer le repository via l'API :

```bash
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/mnt/elasticsearch/backups",
    "compress": true,
    "chunk_size": "128mb",
    "max_restore_bytes_per_sec": "40mb",
    "max_snapshot_bytes_per_sec": "40mb"
  }
}
```

**Étape 4** : Vérifier le repository :

```bash
GET /_snapshot/my_backup
```

---

# Création de Snapshots

**Snapshot complet du cluster** :

```bash
PUT /_snapshot/my_backup/snapshot_1
{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true,
  "metadata": {
    "taken_by": "ops-team",
    "taken_because": "daily-backup"
  }
}
```

**Snapshot d'indices spécifiques** :

```bash
PUT /_snapshot/my_backup/snapshot_products_2024_01_15
{
  "indices": "products-*,orders-2024-01-*",
  "ignore_unavailable": false,
  "include_global_state": false,
  "partial": false
}
```

**Paramètres importants** :
- `include_global_state: true` : Inclut les templates, ILM policies, ingest pipelines
- `partial: false` : Échoue si un shard primaire n'est pas disponible
- `ignore_unavailable: true` : Ignore les indices qui n'existent pas

---

# Surveillance et Gestion des Snapshots

**Lister tous les snapshots d'un repository** :

```bash
GET /_snapshot/my_backup/_all
```

**Obtenir le statut d'un snapshot en cours** :

```bash
GET /_snapshot/my_backup/snapshot_1/_status
```

**Résultat** :
```json
{
  "snapshots": [{
    "snapshot": "snapshot_1",
    "repository": "my_backup",
    "state": "IN_PROGRESS",
    "shards_stats": {
      "initializing": 0,
      "started": 15,
      "finalizing": 0,
      "done": 85,
      "failed": 0,
      "total": 100
    },
    "stats": {
      "incremental": {
        "file_count": 1250,
        "size_in_bytes": 5368709120
      }
    }
  }]
}
```

---

# Restauration depuis un Snapshot

**Restaurer tous les indices** :

```bash
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "*",
  "include_global_state": true,
  "ignore_unavailable": true
}
```

**Restaurer avec renommage** (pour tester ou comparer) :

```bash
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "products",
  "rename_pattern": "(.+)",
  "rename_replacement": "restored_$1",
  "include_aliases": false
}
```

---

# Restauration depuis un Snapshot

**Restauration partielle** (uniquement certains indices) :

```bash
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "orders-2024-01-*",
  "ignore_unavailable": true,
  "include_global_state": false,
  "index_settings": {
    "index.number_of_replicas": 1
  }
}
```

**Note** : La restauration nécessite que les indices ciblés n'existent pas déjà (ou soient fermés).

---

# Snapshot Lifecycle Management (SLM)

**SLM** automatise la création et la suppression de snapshots selon des politiques définies.

**Créer une politique SLM** :

```bash
PUT /_slm/policy/daily-snapshots
{
  "schedule": "0 30 1 * * ?",
  "name": "<daily-snap-{now/d}>",
  "repository": "my_backup",
  "config": {
    "indices": "*",
    "ignore_unavailable": true,
    "include_global_state": true
  },
  "retention": {
    "expire_after": "30d",
    "min_count": 5,
    "max_count": 50
  }
}
```

---

# Snapshot Lifecycle Management (SLM)

**Paramètres clés** :
- `schedule` : Expression cron (ici : 1h30 du matin tous les jours)
- `name` : Template de nom avec date (génère `daily-snap-2024-01-15`)
- `retention.expire_after` : Supprimer les snapshots de plus de 30 jours
- `retention.min_count` : Garder au moins 5 snapshots même si expirés
- `retention.max_count` : Ne jamais dépasser 50 snapshots

---

# Gestion des Politiques SLM

**Exécuter manuellement une politique SLM** :

```bash
POST /_slm/policy/daily-snapshots/_execute
```

**Vérifier le statut d'une politique** :

```bash
GET /_slm/policy/daily-snapshots
```

**Afficher l'historique des exécutions** :

```bash
GET /_slm/policy/daily-snapshots/_status
```

---

# Gestion des Politiques SLM

**Résultat** :
```json
{
  "daily-snapshots": {
    "policy": { ... },
    "version": 1,
    "modified_date_millis": 1705305600000,
    "last_success": {
      "snapshot_name": "daily-snap-2024-01-15",
      "time": 1705306800000
    },
    "last_failure": null,
    "next_execution_millis": 1705393200000,
    "stats": {
      "snapshots_taken": 28,
      "snapshots_failed": 0,
      "snapshots_deleted": 3
    }
  }
}
```

---

# Supprimer des Snapshots

**Supprimer un snapshot spécifique** :

```bash
DELETE /_snapshot/my_backup/snapshot_1
```

**Attention** : La suppression d'un snapshot :
- Libère l'espace disque des segments uniques à ce snapshot
- N'affecte **pas** les segments partagés avec d'autres snapshots (snapshots incrémentaux)
- Peut prendre du temps pour les gros snapshots

**Supprimer un repository** (et tous ses snapshots) :

```bash
DELETE /_snapshot/my_backup
```

**Best Practice** : Utilisez SLM avec `retention` pour automatiser le nettoyage et éviter l'accumulation de snapshots obsolètes.

---
layout: section
---

# Partie 2: Stratégies de Redémarrage de Nœuds

Rolling restarts et graceful shutdown

---

# Pourquoi un Rolling Restart ?

Un **rolling restart** permet de redémarrer les nœuds un par un sans interruption de service.

**Scénarios courants** :
- 🔧 **Changement de configuration** : Modification de `elasticsearch.yml` ou `jvm.options`
- 💾 **Mise à jour du système** : Patches OS, mises à jour de sécurité
- 🖥️ **Maintenance matérielle** : Ajout de RAM, remplacement de disques
- 🔄 **Optimisation système** : Changement de paramètres kernel, file descriptors

**Principe clé** : Désactiver temporairement l'allocation des shards pour éviter les déplacements inutiles pendant les redémarrages.

---

# Procédure de Rolling Restart (1/2)

**Étape 1** : Désactiver l'allocation des shards

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}
```

**Options** :
- `"all"` : Allouer tous les shards (primaires et répliques) - **valeur normale**
- `"primaries"` : Allouer uniquement les shards primaires - **pour rolling restart**
- `"new_primaries"` : Allouer uniquement les primaires de nouveaux indices
- `"none"` : N'allouer aucun shard - **utilisation avancée uniquement**

**Étape 2** : Arrêter l'indexing syncing (optionnel mais recommandé)

```bash
POST /_flush/synced
```

Ceci accélère la récupération des shards après le redémarrage.

---

# Procédure de Rolling Restart (2/2)

**Étape 3** : Arrêter un nœud

```bash
# Méthode 1 : Arrêt gracieux via systemd
sudo systemctl stop elasticsearch

# Méthode 2 : Arrêt via script
sudo /usr/share/elasticsearch/bin/elasticsearch-service-mgmt.sh stop

# Méthode 3 : Kill gracieux (SIGTERM)
kill -SIGTERM <pid>
```

**Étape 4** : Effectuer la maintenance (changement de config, update OS, etc.)

**Étape 5** : Redémarrer le nœud

```bash
sudo systemctl start elasticsearch
```

**Étape 6** : Vérifier que le nœud a rejoint le cluster

```bash
GET /_cat/nodes?v&h=name,node.role,uptime,heap.percent,cpu,load_1m
```

Attendez que le nœud soit **UP** et que l'uptime soit faible (indiquant un redémarrage récent).

---

# Fin de la Procédure de Rolling Restart

**Étape 7** : Vérifier la santé du cluster avant de passer au nœud suivant

```bash
GET /_cluster/health?wait_for_status=yellow&timeout=5m
```

**Étape 8** : Répéter les étapes 3-7 pour chaque nœud

**Étape 9** : Réactiver l'allocation complète des shards

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "all"
  }
}
```

**Étape 10** : Vérifier le statut final du cluster

```bash
GET /_cluster/health?wait_for_status=green&timeout=10m
```

**Astuce** : Utilisez `wait_for_status` et `timeout` pour bloquer jusqu'à ce que le cluster soit stable.

---

# Graceful Shutdown : Éviter les Interruptions

Un **graceful shutdown** arrête proprement Elasticsearch en terminant les opérations en cours.

**Ce qui se passe pendant un graceful shutdown** :
1. 🛑 Elasticsearch cesse d'accepter de nouvelles requêtes
2. 💾 Les requêtes en cours sont finalisées (avec timeout)
3. 🔄 Les shards primaires sont synchronisés avec leurs répliques
4. 📝 Les translog sont flushés sur disque
5. ✅ Le processus se termine proprement

**Signaux système** :
- **SIGTERM** : Shutdown gracieux (recommandé)
- **SIGKILL** : Arrêt brutal (éviter, risque de corruption)

```bash
# Bon : Graceful shutdown
kill -SIGTERM $(cat /var/run/elasticsearch/elasticsearch.pid)

# Mauvais : Brutal kill (utiliser seulement si le processus est bloqué)
kill -9 $(cat /var/run/elasticsearch/elasticsearch.pid)
```

---

# Vérification de l'État des Shards Pendant Restart

**Surveiller l'allocation des shards** :

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason&s=state
```

**États des shards** :
- `STARTED` : Shard actif et prêt
- `INITIALIZING` : Shard en cours de récupération
- `RELOCATING` : Shard en cours de déplacement vers un autre nœud
- `UNASSIGNED` : Shard non assigné (normal pendant le restart d'un nœud)

**Identifier les shards non assignés** :

```bash
GET /_cluster/allocation/explain
{
  "index": "my-index",
  "shard": 0,
  "primary": true
}
```

Ceci fournit une explication détaillée de pourquoi un shard n'est pas assigné.

---
layout: section
---

# Partie 3: Planification de Mise à Jour de Version

Rolling upgrades et compatibilité

---

# Chemins de Mise à Jour Supportés

Elasticsearch suit des règles strictes de compatibilité de version.

**Règles de mise à jour** :
- ✅ **Minor upgrade** : 8.10 → 8.11 → 8.12 (toujours supporté)
- ✅ **Rolling upgrade** : 8.x → 8.y (un nœud à la fois, sans downtime)
- ✅ **Major upgrade** : 7.17 → 8.x (dernier minor de 7.x requis)
- ❌ **Sauter une version majeure** : 7.x → 9.x (NON supporté)
- ❌ **Downgrade** : 8.5 → 8.4 (NON supporté - restaurer depuis snapshot)

**Version minimale pour upgrade vers 8.x** :
- Vous devez être en **Elasticsearch 7.17** minimum pour migrer vers 8.x
- Les snapshots créés en 7.x peuvent être restaurés en 8.x

**Documentation** : [Upgrade Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-upgrade.html)

---

# Préparation de la Mise à Jour

**Étape 1** : Exécuter l'Upgrade Assistant (Kibana)

- Accéder à **Stack Management** → **Upgrade Assistant**
- Identifier les **breaking changes** et **deprecations**
- Résoudre les problèmes signalés (mappings obsolètes, settings dépréciés, etc.)

**Étape 2** : Vérifier les compatibilités

```bash
GET /_migration/deprecations
```

**Résultat** :
```json
{
  "cluster_settings": [
    {
      "level": "warning",
      "message": "Setting [cluster.routing.allocation.enable] is deprecated",
      "url": "https://www.elastic.co/guide/..."
    }
  ],
  "node_settings": [],
  "index_settings": {
    "my-old-index": [
      {
        "level": "critical",
        "message": "Index uses deprecated mapping type '_doc'",
        "url": "https://www.elastic.co/guide/..."
      }
    ]
  }
}
```

---

# Préparation de la Mise à Jour (Suite)

**Étape 3** : Créer un snapshot complet

```bash
PUT /_snapshot/my_backup/pre_upgrade_snapshot
{
  "indices": "*",
  "include_global_state": true,
  "metadata": {
    "taken_by": "ops-team",
    "taken_before": "upgrade-to-8.12"
  }
}
```

**Étape 4** : Tester la mise à jour dans un environnement de test

1. Restaurer le snapshot dans un cluster de test
2. Effectuer la mise à jour sur le cluster de test
3. Valider le bon fonctionnement (tests applicatifs, requêtes, indexation)
4. Noter les éventuels problèmes rencontrés

**Étape 5** : Planifier une fenêtre de maintenance

- Pour les **rolling upgrades** : Prévoir 1-2h selon la taille du cluster
- Pour les **full cluster restarts** : Prévoir un downtime de 15-30 minutes

---

# Procédure de Rolling Upgrade (1/2)

**Étape 1** : Désactiver le shard allocation

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}
```

**Étape 2** : Arrêter les tâches de machine learning et monitoring (si applicable)

```bash
POST _ml/set_upgrade_mode?enabled=true
```

**Étape 3** : Stopper un nœud non-master

```bash
sudo systemctl stop elasticsearch
```

**Ordre recommandé** : data nodes → ingest nodes → coordinating nodes → master nodes

---

# Procédure de Rolling Upgrade (2/2)

**Étape 4** : Mettre à jour Elasticsearch sur le nœud arrêté

```bash
# Debian/Ubuntu
sudo apt-get update
sudo apt-get install elasticsearch=8.12.0

# RHEL/CentOS
sudo yum update elasticsearch-8.12.0
```

**Étape 5** : Mettre à jour les plugins (si installés)

```bash
sudo /usr/share/elasticsearch/bin/elasticsearch-plugin list
sudo /usr/share/elasticsearch/bin/elasticsearch-plugin remove <plugin-name>
sudo /usr/share/elasticsearch/bin/elasticsearch-plugin install <plugin-name>
```

**Étape 6** : Démarrer le nœud mis à jour

```bash
sudo systemctl start elasticsearch
```

---

# Fin de la Procédure de Rolling Upgrade

**Étape 7** : Vérifier que le nœud a rejoint le cluster

```bash
GET /_cat/nodes?v&h=name,version,node.role,uptime
```

Vous devriez voir la nouvelle version pour le nœud redémarré.

**Étape 8** : Réactiver shard allocation

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "all"
  }
}
```

**Étape 9** : Attendre que le cluster soit GREEN

```bash
GET /_cluster/health?wait_for_status=green&timeout=10m
```

**Étape 10** : Répéter les étapes 3-9 pour chaque nœud restant

**Étape 11** : Réactiver le machine learning

```bash
POST _ml/set_upgrade_mode?enabled=false
```

---

# Vérification Post-Upgrade

**Vérifier les versions de tous les nœuds** :

```bash
GET /_cat/nodes?v&h=name,version,build,jdk
```

**Vérifier les indices et leurs versions** :

```bash
GET /_cat/indices?v&h=index,health,status,pri,rep,docs.count,store.size
```

**Exécuter des tests de fumée** :
1. Indexer un document test
2. Rechercher le document
3. Exécuter une agrégation simple
4. Vérifier les dashboards Kibana

```bash
# Test d'indexation
POST /test-post-upgrade/_doc
{"timestamp": "2024-01-15T10:00:00Z", "message": "Post-upgrade test"}

# Test de recherche
GET /test-post-upgrade/_search
```

---

# Gestion des Problèmes d'Upgrade

**Problème** : Un nœud ne redémarre pas après l'upgrade

**Solutions** :
1. Consulter les logs : `/var/log/elasticsearch/<cluster-name>.log`
2. Vérifier la compatibilité JVM (Elasticsearch 8.x requiert Java 17+)
3. Vérifier les paramètres mémoire (`jvm.options`)
4. Vérifier les permissions sur les répertoires data et logs

**Problème** : Les shards restent UNASSIGNED après l'upgrade

**Solutions** :
1. Vérifier l'allocation : `GET /_cluster/allocation/explain`
2. Forcer l'allocation si nécessaire (dernier recours) :

```bash
POST /_cluster/reroute
{
  "commands": [{
    "allocate_replica": {
      "index": "my-index",
      "shard": 0,
      "node": "node-1"
    }
  }]
}
```

---
layout: section
---

# Partie 4: Outils de Gestion Kibana

Interfaces graphiques pour faciliter la maintenance

---

# Kibana Stack Management : Vue d'Ensemble

**Stack Management** centralise tous les outils d'administration Elasticsearch et Kibana.

**Accès** : Menu latéral Kibana → Icône d'engrenage ⚙️ → **Stack Management**

**Sections principales pour les opérations** :

| Section | Outils disponibles |
|---------|-------------------|
| **Data** | Index Management, Index Lifecycle Policies, Snapshot and Restore, Rollup Jobs, Transforms |
| **Ingest** | Ingest Pipelines, Logstash Pipelines |
| **Alerts and Insights** | Rules, Connectors, Cases |
| **Stack** | License Management, Upgrade Assistant |
| **Security** | Users, Roles, API Keys |

Nous nous concentrerons sur les outils liés à la **maintenance** : Index Management, Snapshot and Restore, et Upgrade Assistant.

---

# Index Management UI

**Accès** : Stack Management → Data → **Index Management**

**Fonctionnalités** :

1. **Vue d'ensemble des indices**
   - Liste tous les indices avec taille, nombre de documents, santé
   - Filtrage et recherche par nom d'index
   - Tri par différentes colonnes

2. **Actions sur les indices** (bouton Actions) :
   - 🔒 **Close / Open** : Fermer/ouvrir un index (libère la mémoire sans supprimer)
   - 🔄 **Force merge** : Optimiser les segments (recommandé pour indices non modifiés)
   - ❄️ **Freeze / Unfreeze** : Geler un index (minimal memory footprint)
   - 🗑️ **Delete** : Supprimer définitivement un index
   - 📝 **Edit settings** : Modifier les settings (replicas, refresh_interval, etc.)

3. **Gestion des templates et component templates**
   - Créer, modifier, supprimer des index templates
   - Visualiser les templates appliqués à un index

---

# Index Management : Cas d'Usage

**Cas d'usage 1** : Augmenter le nombre de répliques pour un index critique

1. Sélectionner l'index dans la liste
2. Cliquer sur **Manage** → **Edit settings**
3. Modifier `number_of_replicas` :

```json
{
  "index.number_of_replicas": 2
}
```

4. Cliquer sur **Save**

**Cas d'usage 2** : Forcer un merge après une purge importante

1. Sélectionner l'index
2. Cliquer sur **Manage** → **Force merge**
3. Configurer :
   - **Max number of segments** : 1 (pour optimisation maximale)
   - ⚠️ Attention : Le force merge est intensif en I/O, à réaliser en heures creuses

**Cas d'usage 3** : Fermer temporairement des indices inactifs

1. Sélectionner les indices à fermer
2. Cliquer sur **Manage** → **Close index**
3. Les indices fermés n'utilisent plus de mémoire mais restent sur disque

---

# Snapshot and Restore UI

**Accès** : Stack Management → Data → **Snapshot and Restore**

**Onglet "Repositories"** :
- Voir tous les repositories configurés
- Ajouter un nouveau repository (fs, S3, GCS, Azure)
- Vérifier la connectivité d'un repository
- Supprimer un repository

**Onglet "Snapshots"** :
- Lister tous les snapshots de tous les repositories
- Créer un nouveau snapshot (avec sélecteur d'indices graphique)
- Voir les détails d'un snapshot (indices inclus, taille, durée)
- Supprimer des snapshots
- **Restaurer un snapshot** avec options graphiques

**Onglet "Policies"** (SLM) :
- Créer, modifier, supprimer des politiques SLM
- Voir l'historique des exécutions
- Exécuter manuellement une politique

---

# Snapshot and Restore UI : Créer un Snapshot

**Workflow graphique** :

1. Aller dans **Snapshots** → Cliquer sur **Create a snapshot**

2. **Étape 1 : Repository**
   - Sélectionner le repository dans le menu déroulant

3. **Étape 2 : Snapshot settings**
   - **Snapshot name** : Nom du snapshot (supporter les variables de date)
   - **Indices** : Sélecteur graphique avec autocomplétion
   - **Include global state** : Cocher pour sauvegarder templates, ILM policies, etc.
   - **Ignore unavailable indices** : Tolérer les indices manquants

4. **Étape 3 : Review**
   - Récapitulatif de la configuration
   - Cliquer sur **Create snapshot**

5. **Monitoring** :
   - La liste des snapshots se met à jour en temps réel
   - État : `IN_PROGRESS` → `SUCCESS` ou `FAILED`

---

# Snapshot and Restore UI : Restaurer un Snapshot

**Workflow graphique** :

1. Dans la liste des snapshots, cliquer sur le nom du snapshot

2. Cliquer sur **Restore**

3. **Étape 1 : Select indices**
   - Cocher les indices à restaurer
   - Option : **Restore all indices**

4. **Étape 2 : Customize index settings** (optionnel)
   - Renommer les indices restaurés : `restored_*`
   - Modifier les settings (replicas, etc.)
   - Activer/désactiver la restauration des alias

5. **Étape 3 : Review and restore**
   - Vérifier la configuration
   - Cliquer sur **Restore snapshot**

6. **Monitoring** :
   - Suivre la progression dans **Index Management**
   - Les indices restaurés apparaissent avec leur nouveau nom

---

# Upgrade Assistant

**Accès** : Stack Management → Stack → **Upgrade Assistant**

**Fonctionnalités** :

1. **Overview** :
   - Version actuelle du cluster
   - Version cible de l'upgrade
   - Nombre de problèmes critiques, warnings, et info

2. **Deprecation issues** :
   - Liste des problèmes organisés par catégorie :
     - 🔴 **Critical** : Doit être résolu avant l'upgrade
     - 🟡 **Warning** : Recommandé de résoudre
     - 🔵 **Info** : Information seulement

3. **Automated fixes** :
   - Certains problèmes peuvent être résolus automatiquement
   - Cliquer sur **Fix** pour appliquer la correction
   - Exemple : Reindex automatique pour mettre à jour des mappings obsolètes

4. **Reindex helper** :
   - Assistant pour réindexer les indices incompatibles
   - Génère automatiquement la configuration de reindexation

---

# Upgrade Assistant : Résoudre les Deprecations

**Exemple de problème critique** :

```
Index 'logs-2023' uses deprecated mapping parameter 'include_in_all'
```

**Solution via Upgrade Assistant** :

1. Cliquer sur le problème pour afficher les détails
2. Consulter la documentation liée (lien fourni)
3. Options de résolution :
   - **Option A** : Réindexer l'index sans le paramètre obsolète
   - **Option B** : Supprimer l'index si les données ne sont plus nécessaires

4. **Utiliser le Reindex Helper** :
   - Cliquer sur **Reindex**
   - Configuration automatique générée :

```json
{
  "source": { "index": "logs-2023" },
  "dest": { "index": "logs-2023-v2" },
  "script": { /* scripts de transformation si nécessaire */ }
}
```

5. Lancer la réindexation et surveiller la progression

---

# Data Visualizer et Canvas pour Monitoring

**Data Visualizer** (Machine Learning) :

- Analyser automatiquement la structure des données d'un index
- Identifier les champs, types, cardinalités
- Détecter les anomalies dans les distributions de valeurs
- Utile pour comprendre un index avant une migration

**Canvas** (Kibana) :

- Créer des dashboards de présentation personnalisés
- Intégrer des données en temps réel et des métriques statiques
- Utile pour créer des rapports de maintenance pour management

**Accès** :
- Data Visualizer : Menu Kibana → **Machine Learning** → **Data Visualizer**
- Canvas : Menu Kibana → **Canvas**

---

# Résumé : Opérations de Maintenance

| Opération | Outils | Fréquence | Impact |
|-----------|--------|-----------|--------|
| **Snapshots** | API `/_snapshot`, SLM, Kibana UI | Quotidien / Hebdomadaire | Minimal (opération asynchrone) |
| **Rolling Restart** | Scripts, systemctl | Mensuel / Ad-hoc | Aucun (si bien exécuté) |
| **Rolling Upgrade** | Package manager, Upgrade Assistant | Trimestriel / Annuel | Minimal (Rolling) |
| **Force Merge** | API `/_forcemerge`, Kibana Index Management | Après bulk delete | Élevé (I/O intensif) |
| **Reindex** | API `/_reindex`, Upgrade Assistant | Ad-hoc (deprecations) | Élevé (CPU + I/O) |

**Principes clés** :
1. ✅ **Toujours créer un snapshot** avant toute opération de maintenance majeure
2. ✅ **Tester en environnement de test** avant la production
3. ✅ **Planifier en heures creuses** pour minimiser l'impact
4. ✅ **Surveiller les métriques** pendant et après les opérations
5. ✅ **Documenter les procédures** et les résultats pour les futures opérations

---

# Points Clés à Retenir

**Snapshots et Restauration** :
- Les snapshots sont **incrémentaux** et optimisés pour minimiser l'espace disque
- **SLM** automatise la création et le nettoyage des snapshots
- Configurez `path.repo` dans `elasticsearch.yml` pour les repositories filesystem
- Utilisez `include_global_state: true` pour sauvegarder templates et policies

**Rolling Restarts** :
- Désactiver temporairement l'allocation des shards avec `"primaries"` uniquement
- Redémarrer les nœuds **un par un** en attendant que le cluster revienne à GREEN
- Utiliser **SIGTERM** pour un shutdown gracieux, jamais SIGKILL

**Upgrades** :
- Utiliser **Upgrade Assistant** pour identifier et résoudre les deprecations
- Toujours créer un **snapshot complet** avant l'upgrade
- Respecter les **chemins de mise à jour** supportés (pas de saut de version majeure)
- Tester l'upgrade en environnement de test avant la production

**Outils Kibana** :
- **Index Management** pour gérer settings, force merge, et open/close
- **Snapshot and Restore UI** pour interface graphique des snapshots
- **Upgrade Assistant** pour préparer et valider les mises à jour

---

# Exercices Pratiques

Rendez-vous dans le workbook pratique pour réaliser les labs suivants :

**Lab 6.1** : Création et Restauration de Snapshots  
Configurer un repository, créer des snapshots, et restaurer des indices

**🌟 Bonus Challenge 6.A** : Snapshot Lifecycle Management  
Configurer des politiques SLM avec rétention automatique

---

# Ressources et Documentation

**Documentation officielle Elasticsearch** :
- [Snapshot and Restore](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html)
- [Rolling Upgrades](https://www.elastic.co/guide/en/elasticsearch/reference/current/rolling-upgrades.html)
- [Cluster-level shard allocation](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-cluster.html)

**Guides pratiques** :
- [Backup and Restore Best Practices](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore-apis.html)
- [Upgrade Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-upgrade.html)

**Kibana Documentation** :
- [Index Management](https://www.elastic.co/guide/en/kibana/current/index-mgmt.html)
- [Snapshot and Restore UI](https://www.elastic.co/guide/en/kibana/current/snapshot-repositories.html)
