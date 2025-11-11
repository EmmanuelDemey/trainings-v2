## Lab 3.2: Configuration du Heap JVM

**Topic**: Performance et Dimensionnement - Configuration Système
**Prérequis**: Accès au serveur Elasticsearch, droits root/sudo

### Objectif

Configurer correctement le heap JVM d'Elasticsearch en respectant les règles de sizing (50% RAM, max 32GB, Xms=Xmx) et vérifier l'application de la configuration.

### Contexte

Votre serveur Elasticsearch dispose de 64 GB de RAM. Vous devez configurer le heap JVM de manière optimale pour équilibrer la mémoire entre le heap (JVM) et le cache OS (filesystem cache).

### Exercice de Base

#### Setup

**Avant de commencer**:
1. Vérifiez la RAM totale du serveur:
```bash
free -h
# ou
cat /proc/meminfo | grep MemTotal
```

2. Localisez le fichier `jvm.options`:
```bash
# Installation par package (Debian/Ubuntu)
/etc/elasticsearch/jvm.options

# Installation par archive
config/jvm.options
```

3. Arrêtez Elasticsearch:
```bash
sudo systemctl stop elasticsearch
# ou
bin/elasticsearch stop
```

#### Étapes

**Étape 1**: Calculer le heap optimal

**Règles de sizing**:
1. ✅ **50% de la RAM**: Le heap doit être au maximum 50% de la RAM physique
2. ✅ **Maximum 32 GB**: Ne jamais dépasser 32 GB (limite compressed oops)
3. ✅ **Xms = Xmx**: Les deux valeurs doivent être identiques (évite resizing)

**Pour un serveur avec 64 GB de RAM**:
```
RAM totale:          64 GB
50% de la RAM:       32 GB
Maximum recommandé:  32 GB

Heap configuré:      31 GB (laisse 1 GB de marge pour la JVM elle-même)
OS cache:            33 GB (le reste)
```

**Étape 2**: Modifier jvm.options

Éditez le fichier `jvm.options`:

```bash
sudo vi /etc/elasticsearch/jvm.options
```

Modifiez les lignes `-Xms` et `-Xmx`:

```
################################################################
## IMPORTANT: JVM heap size
################################################################

# Xms represents the initial size of total heap space
# Xmx represents the maximum size of total heap space

-Xms31g
-Xmx31g
```

**Important**: 
- Utilisez `g` pour gigabytes (pas `GB`)
- Les deux valeurs DOIVENT être identiques
- Commentez les anciennes valeurs au lieu de les supprimer (backup)

**Étape 3**: Vérifier les autres paramètres JVM critiques

Dans le même fichier, vérifiez que ces paramètres sont présents:

```
# Utiliser G1GC (garbage collector recommandé)
-XX:+UseG1GC

# Heap dump en cas d'OutOfMemoryError
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/lib/elasticsearch

# GC logging
-Xlog:gc*,gc+age=trace,safepoint:file=/var/log/elasticsearch/gc.log:utctime,pid,tags:filecount=32,filesize=64m
```

**Étape 4**: Redémarrer Elasticsearch

```bash
sudo systemctl start elasticsearch
# ou
bin/elasticsearch -d
```

**Vérifiez les logs de démarrage**:
```bash
sudo tail -f /var/log/elasticsearch/elasticsearch.log
```

Cherchez cette ligne:
```
[INFO ][o.e.e.NodeEnvironment] heap size [31gb], compressed ordinary object pointers [true]
```

**Étape 5**: Vérifier la configuration heap via l'API

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_max_in_bytes
```

**Résultat attendu**:
```json
{
  "nodes": {
    "abc123": {
      "jvm": {
        "mem": {
          "heap_max_in_bytes": 33285996544
        }
      }
    }
  }
}
```

**Conversion**:
```
33,285,996,544 bytes / (1024^3) = 31 GB ✅
```

**Étape 6**: Monitorer l'utilisation du heap

```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent
```

**Résultat**:
```json
{
  "nodes": {
    "abc123": {
      "jvm": {
        "mem": {
          "heap_used_percent": 45
        }
      }
    }
  }
}
```

**Interprétation**:
- ✅ <75%: Sain, pas de problème
- ⚠️ 75-85%: Surveiller, GC plus fréquents
- ❌ >85%: Critique, risque d'OutOfMemoryError

#### Validation

**Commandes de vérification**:

1. Vérifier heap min et max:
```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_max_in_bytes,nodes.*.jvm.mem.heap_committed_in_bytes
```
**Critère**: `heap_committed_in_bytes` doit être égal à `heap_max_in_bytes` (Xms=Xmx)

2. Vérifier compressed oops (< 32 GB):
```bash
GET /_nodes?filter_path=nodes.*.jvm.using_compressed_ordinary_object_pointers
```
**Résultat attendu**: `"using_compressed_ordinary_object_pointers": true`

3. Vérifier GC stats:
```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.gc
```
**Observation**: 
- `collection_time_in_millis` doit croître lentement
- `collection_count` / uptime doit être faible (<10 GC/minute)

4. Tester sous charge (optionnel):
```bash
# Indexer 10,000 documents
for i in {1..10000}; do
  curl -X POST "localhost:9200/test/_doc" -H 'Content-Type: application/json' -d'
  {
    "field": "value",
    "number": '$i'
  }
  '
done

# Vérifier heap après indexation
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent
```

#### Critères de Succès

- ✅ Heap configuré à 31 GB (50% de 64 GB RAM, <32 GB)
- ✅ Xms = Xmx (vérifié avec heap_committed = heap_max)
- ✅ Compressed oops activé (true)
- ✅ Elasticsearch démarre sans erreur
- ✅ Heap usage < 75% en fonctionnement normal

#### Dépannage

**Problème**: Elasticsearch ne démarre pas après modification
→ Vérifiez les logs: `sudo journalctl -u elasticsearch -f`
→ Erreur courante: Syntaxe invalide dans jvm.options (pas d'espace, pas de quotes)
→ Rollback: Restaurez les anciennes valeurs et redémarrez

**Problème**: "Could not reserve enough space for object heap"
→ Le heap demandé dépasse la RAM disponible
→ Réduisez Xms/Xmx (essayez 16g au lieu de 31g)
→ Vérifiez la RAM réellement disponible: `free -h`

**Problème**: Compressed oops = false
→ Heap configuré > 32 GB
→ Réduisez à 31 GB maximum

**Problème**: Heap usage constamment >85%
→ Cluster sous-dimensionné, ajoutez des nœuds
→ Ou augmentez le heap (si RAM disponible et <32 GB)
→ Ou optimisez les requêtes et l'indexation

---

