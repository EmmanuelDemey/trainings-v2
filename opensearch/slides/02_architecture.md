---
layout: cover
---

# 2 - Architecture et concepts

---

# Objectifs pédagogiques

À la fin de cette séquence (**~30 min**), vous saurez :

- **Expliquer** pourquoi un index inversé répond en millisecondes
- **Décrire** un cluster : nœuds, rôles, index, shards primaires et réplicas
- **Suivre** une requête de recherche d'un nœud à l'autre
- **Raisonner** sur la scalabilité et la tolérance aux pannes

---

# L'index inversé

Une base relationnelle lit les lignes pour trouver un mot. Un moteur de recherche
**inverse** la relation : pour chaque **terme**, la liste des documents qui le contiennent.

| Document | Texte |
|---|---|
| 1 | Pâtes fraîches maison |
| 2 | Pizza et pâtes |
| 3 | Pizza au feu de bois |

| Terme | Documents |
|---|---|
| `pâtes` | 1, 2 |
| `pizza` | 2, 3 |
| `fraîches` | 1 |
| `bois` | 3 |

- Chercher « pizza pâtes » : deux lectures dans le dictionnaire, une **union** de listes
- Construit par **Apache Lucene** à l'indexation — d'où l'importance de l'**analyse** (chapitre 6)

---

# Document, index

- **Document** — un objet **JSON**, l'unité stockée et retournée. Identifié par un `_id`
- **Index** — une collection de documents de même nature (`restaurants`, `logs-2026.10.27`)
- **Mapping** — le schéma de l'index : le **type** de chaque champ (chapitre 4)

```json
{
  "_index": "restaurants",
  "_id": "2",
  "_source": {
    "name": "Pizzeria Napoli",
    "cuisine": "italienne",
    "rating": 4.2
  }
}
```

<br />

> Un index n'est **pas** une table : pas de jointure, pas de transaction multi-documents.
> On **dénormalise**.

---

# Shards et réplicas

- Un index est découpé en **shards primaires** : chacun est un index Lucene complet
- Chaque primaire a **0 à n réplicas** : copies sur d'**autres** nœuds
- Un document va dans **un** shard : `shard = hash(_id) % nombre_de_primaires`

```text
             Nœud 1           Nœud 2           Nœud 3
restaurants  [P0] [R1]        [P1] [R2]        [P2] [R0]
```

| | Fixé | Rôle |
|---|---|---|
| **Primaires** | À la création de l'index | Répartir les **données** et l'écriture |
| **Réplicas** | Modifiable à chaud | **Résilience**, et débit de **lecture** |

> Un réplica n'est **jamais** sur le même nœud que son primaire.

---

# Nœuds et rôles

| Rôle | Fait quoi |
|---|---|
| `cluster_manager` | Tient l'**état du cluster** : index, mappings, placement des shards. Un seul élu, 3 éligibles en production |
| `data` | Stocke les shards, exécute recherches et agrégations |
| `ingest` | Exécute les **ingest pipelines** (chapitre 9) |
| `coordinating` | (aucun rôle) Reçoit les requêtes, les distribue, fusionne les résultats |
| `search` | Nœud dédié aux réplicas de recherche (searchable snapshots, remote store) |

<br />

- Par défaut, un nœud a **tous** les rôles — parfait pour un lab
- OpenSearch dit **cluster manager** là où Elasticsearch dit **master**

---

# Une recherche, pas à pas

1. Le client envoie `GET /restaurants/_search` à **n'importe quel** nœud : il devient **coordinateur**
2. **Query** — le coordinateur interroge **une copie** (primaire ou réplica) de **chaque** shard ; chacun renvoie ses meilleurs `_id` et scores
3. Le coordinateur **fusionne** et trie
4. **Fetch** — il récupère le `_source` des documents retenus, sur les shards qui les ont
5. Il répond au client

<br />

> Plus de shards = plus de **parallélisme**, mais aussi plus de **coût de fusion**.
> Ordre de grandeur : un shard de **10 à 50 Go**.

---

# Scalabilité et résilience

- **Ajouter un nœud** : le cluster manager **déplace** des shards vers lui, sans interruption
- **Perdre un nœud** : ses réplicas ailleurs sont **promus** primaires, de nouveaux réplicas sont recréés

| Statut | Signification |
|---|---|
| 🟢 `green` | Tous les primaires et réplicas sont alloués |
| 🟡 `yellow` | Tous les primaires sont là, au moins un réplica ne l'est pas |
| 🔴 `red` | Au moins un primaire manque : des données sont inaccessibles |

<br />

> Sur un nœud unique, un index avec `number_of_replicas: 1` est **jaune** : le réplica
> n'a nulle part où aller. C'est normal dans le lab.

---

# Near real time

- Un document indexé est d'abord dans un **buffer** mémoire et le **translog** (durabilité)
- Toutes les **secondes** (`refresh_interval`), un **refresh** crée un nouveau segment Lucene : le document devient **cherchable**
- `GET /index/_doc/1` le voit **tout de suite**, `_search` après le refresh

<br />

- Indexation massive : `refresh_interval: -1` le temps du chargement, puis remettre `1s`
- Dans les TP : `?refresh=true` sur l'écriture, pour chercher juste après

---

# Quiz

**Un index a 3 shards primaires et 1 réplica. Combien de shards en tout ?**

<v-clicks>

- A) 3
- B) 4
- C) 6 ✅
- D) 9

**Réponse : C** — 1 réplica **par primaire** : 3 primaires + 3 réplicas.

</v-clicks>
