## Lab 3.1: Dimensionnement de Cluster - Calcul du Nombre de Shards

**Topic**: Performance et Dimensionnement - Planification de Capacité
**Durée Estimée**: 25-30 minutes
**Prérequis**: Compréhension des concepts de shards et replicas

### Objectif

Apprendre à calculer le nombre optimal de shards pour un cas d'usage donné en prenant en compte le volume de données, la croissance, et les contraintes de performance.

### Contexte

Vous êtes chargé de dimensionner un cluster Elasticsearch pour un système de logs applicatifs. L'équipe vous fournit les exigences suivantes et vous devez déterminer la configuration optimale.

### Exercice de Base

#### Scénario

**Cas d'usage**: Logs d'application e-commerce

**Exigences**:
- Volume initial: 500 GB de logs
- Croissance: 50 GB/jour (nouveaux logs)
- Rétention: 30 jours
- Replicas: 1 (haute disponibilité)
- Taux d'indexation: 10,000 documents/seconde (pics)
- Taux de recherche: 100 requêtes/seconde
- Latence cible: p95 < 200ms pour les recherches

**Infrastructure disponible**:
- Nœuds data: 5 nœuds
- CPU par nœud: 16 cores
- RAM par nœud: 64 GB (31 GB heap, 33 GB OS cache)
- Disque par nœud: 2 TB SSD

#### Étapes

**Étape 1**: Calculer le volume total après 30 jours

```
Volume initial:     500 GB
Croissance (30j):   50 GB/jour × 30 = 1,500 GB
Volume total:       500 + 1,500 = 2,000 GB
```

Avec 1 replica (×2):
```
Volume avec replicas: 2,000 GB × 2 = 4,000 GB
```

**Étape 2**: Déterminer la taille cible d'un shard

**Règles de sizing**:
- ✅ Taille optimale: 10-50 GB par shard
- ⚠️ Maximum recommandé: 50 GB (au-delà, performance dégradée)
- ⚠️ Minimum recommandé: 1 GB (trop de petits shards = overhead)

**Choix**: 30 GB par shard (milieu de la plage optimale)

**Étape 3**: Calculer le nombre de shards primaires nécessaires

```
Nombre de shards primaires = Volume total (sans replicas) / Taille cible par shard
                            = 2,000 GB / 30 GB
                            = 66.67
                            ≈ 67 shards primaires
```

**Étape 4**: Vérifier la contrainte de shards par nœud

**Règle**: Maximum 20 shards par GB de heap JVM

```
Heap par nœud:       31 GB
Max shards/nœud:     31 GB × 20 = 620 shards
Shards totaux:       67 primaires + 67 replicas = 134 shards
Shards par nœud:     134 / 5 nœuds = 26.8 ≈ 27 shards/nœud
```

**Validation**: 27 shards/nœud << 620 max → ✅ OK

**Étape 5**: Stratégie d'indexation - Index par jour (Time-Based Indices)

Au lieu d'un seul gros index, utilisez des index quotidiens:

```
Pattern: logs-YYYY.MM.DD
Exemple: logs-2023.11.10

Volume par jour:     50 GB
Taille par shard:    30 GB
Shards par index:    50 / 30 = 1.67 ≈ 2 shards primaires par index
```

**Configuration recommandée**:
```bash
# Template pour tous les index logs-*
PUT /_index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "refresh_interval": "5s"
    }
  }
}
```

**Avantages**:
- ✅ Suppression facile des vieux logs (DELETE index entier)
- ✅ Réduction de la taille de l'index (recherches plus rapides)
- ✅ Gestion ILM simplifiée (Index Lifecycle Management)

**Étape 6**: Valider avec les contraintes de performance

**Indexation**:
```
Taux cible:          10,000 docs/sec
Nombre de nœuds:     5
Load par nœud:       2,000 docs/sec
```
Avec 16 cores/nœud, chaque core gère ~125 docs/sec → ✅ Faisable

**Recherche**:
```
Taux cible:          100 requêtes/sec
Shards actifs/jour:  2 primaires + 2 replicas = 4 shards
```
Latence dépend de la complexité des requêtes, mais avec SSD et cache OS: ✅ p95 < 200ms atteignable

#### Validation

**Formule de vérification finale**:

```
Volume total (30j avec replicas) = 4,000 GB
Capacité cluster (5 × 2TB)       = 10,000 GB (10 TB)
Utilisation disque               = 4,000 / 10,000 = 40%
```

**Marge de sécurité**: 60% disponible → ✅ Excellent (recommandé >20%)

**Vérification des watermarks**:
```
Disk usage:          40%
Watermark LOW:       85% (pas encore atteint)
Watermark HIGH:      90% (safe)
Watermark FLOOD:     95% (safe)
```

**Tableau récapitulatif**:

| Métrique | Valeur | Validation |
|----------|--------|------------|
| Volume total (avec replicas) | 4,000 GB | ✅ |
| Shards primaires par jour | 2 | ✅ |
| Shards totaux (30 jours) | 120 (60p + 60r) | ✅ |
| Shards par nœud | 24 | ✅ (< 620 max) |
| Utilisation disque | 40% | ✅ (< 85%) |
| Indexation par nœud | 2,000 docs/sec | ✅ |
| Latence recherche (estimée) | < 200ms (p95) | ✅ |

#### Critères de Succès

- ✅ Volume total calculé correctement (4 TB avec replicas)
- ✅ Taille de shard dans la plage optimale (30 GB)
- ✅ Nombre de shards par nœud < 620 (règle 20/GB heap)
- ✅ Utilisation disque < 85% (watermark safe)
- ✅ Stratégie time-based indices adoptée (logs-YYYY.MM.DD)

#### Dépannage

**Problème**: Trop de shards (>1000 dans le cluster)
→ Augmentez la taille cible par shard (40-50 GB au lieu de 30 GB)
→ Réduisez la rétention (20 jours au lieu de 30)
→ Utilisez ILM pour forcer-merger les vieux index (réduire les segments)

**Problème**: Disque plein trop rapidement
→ Activez la compression: `"index.codec": "best_compression"`
→ Réduisez le nombre de replicas sur les index anciens (0 replica après 7 jours)
→ Archivez dans S3 avec searchable snapshots (Elasticsearch 7.10+)

**Problème**: Latence de recherche >200ms
→ Réduisez le nombre de shards (moins de shards à interroger)
→ Utilisez des filtres cachés (bool query avec filter context)
→ Ajoutez du routing pour limiter les shards scannés

---

