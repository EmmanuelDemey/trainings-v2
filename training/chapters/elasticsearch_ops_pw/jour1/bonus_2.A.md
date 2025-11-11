## 🌟 Bonus 2.A: Shard Allocation Awareness

**Niveau**: Avancé
**Prérequis**: Lab 2.1 et 2.2 complétés

### Objectif

Configurer la "shard allocation awareness" pour répartir intelligemment les shards en fonction d'attributs personnalisés (zone de disponibilité, rack serveur) et forcer la relocation de shards.

### Contexte

Votre cluster Elasticsearch est déployé sur plusieurs zones de disponibilité (AZ1, AZ2, AZ3). Vous souhaitez garantir que les replicas ne sont JAMAIS sur la même zone que leur primaire (résilience aux pannes de zone).

### Challenge

**Partie 1**: Définir des attributs personnalisés

Éditez `elasticsearch.yml` de chaque nœud pour définir un attribut `zone`:

```yaml
# Nœud 1 (AZ1)
node.name: node-az1
node.attr.zone: az1

# Nœud 2 (AZ2)
node.name: node-az2
node.attr.zone: az2

# Nœud 3 (AZ3 - optionnel)
node.name: node-az3
node.attr.zone: az3
```

Redémarrez les nœuds pour appliquer la configuration.

**Vérification**:
```bash
GET /_cat/nodeattrs?v&h=node,attr,value
```

**Résultat attendu**:
```
node      attr  value
node-az1  zone  az1
node-az2  zone  az2
node-az3  zone  az3
```

**Partie 2**: Activer la shard allocation awareness

Configurez le cluster pour être "aware" de l'attribut `zone`:

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone"
  }
}
```

**Effet**: Elasticsearch évitera de placer un replica sur le même `zone` que son primaire.

**Partie 3**: Forcer l'allocation avec forced awareness

Pour garantir qu'au moins un shard est dans chaque zone:

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone",
    "cluster.routing.allocation.awareness.force.zone.values": "az1,az2,az3"
  }
}
```

**Effet**: Si une zone devient indisponible, Elasticsearch NE réallouera PAS les replicas manquants sur les autres zones (attend le retour de la zone).

**Partie 4**: Créer un index et vérifier la distribution

```bash
PUT /zone-aware-index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}

# Vérifier l'allocation
GET /_cat/shards/zone-aware-index?v&h=index,shard,prirep,state,node
```

**Observation**: Pour chaque shard primaire, son replica est sur un nœud avec un `zone` différent.

**Partie 5**: Forcer la relocation d'un shard

Identifiez un shard à déplacer:

```bash
GET /_cat/shards/zone-aware-index?v&h=index,shard,prirep,node
```

Forcez la relocation d'un shard primaire du nœud A vers le nœud B:

```bash
POST /_cluster/reroute
{
  "commands": [
    {
      "move": {
        "index": "zone-aware-index",
        "shard": 0,
        "from_node": "node-az1",
        "to_node": "node-az2"
      }
    }
  ]
}
```

**Résultat attendu**: Le shard 0 commence à se déplacer (état RELOCATING), puis atteint STARTED sur node-az2.

**Suivi de la relocation**:
```bash
GET /_cat/recovery/zone-aware-index?v&h=index,shard,stage,source_node,target_node
```

**Partie 6**: Exclure un nœud de l'allocation

Simulez la mise en maintenance d'un nœud en excluant tous les shards:

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": "node-az1"
  }
}
```

**Effet**: Tous les shards quittent `node-az1` et sont réalloués sur les autres nœuds.

**Retour à la normale**:
```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": null
  }
}
```

### Validation

**Questions à répondre**:

1. **Quelle est la différence entre `awareness` et `forced awareness` ?**
   - `awareness`: Préférence, Elasticsearch essaie de respecter les zones mais réallouera ailleurs si nécessaire
   - `forced awareness`: Strict, Elasticsearch refuse de réallouer si la zone cible n'est pas disponible

2. **Quand utiliser `cluster.routing.allocation.exclude` ?**
   - Mise en maintenance d'un nœud (vidage des shards avant arrêt)
   - Retrait progressif d'un nœud du cluster
   - Isolation d'un nœud problématique

3. **Comment annuler une relocation manuelle ?**
   - Utilisez `cancel` dans `_cluster/reroute`:
   ```bash
   POST /_cluster/reroute
   {
     "commands": [
       {
         "cancel": {
           "index": "zone-aware-index",
           "shard": 0,
           "node": "node-az2"
         }
       }
     ]
   }
   ```

**Critère de succès**: 
- Comprendre les stratégies d'allocation awareness
- Savoir forcer la relocation de shards manuellement
- Maîtriser l'exclusion de nœuds pour maintenance

---

