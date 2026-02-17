---
layout: cover
---

# Quiz - Day 2
## Advanced Features, Architecture and Production

---

# Quiz Day 2 — Question 9

**À quoi sert le routing personnalisé dans Elasticsearch ?**

<v-clicks>

- A) À chiffrer les données en transit
- B) À diriger les documents vers un shard spécifique pour optimiser les recherches ✅
- C) À configurer les règles réseau du cluster
- D) À définir l'ordre de réplication

**Réponse : B** — Le routing permet de stocker et rechercher les documents sur un shard précis, évitant le fan-out sur tous les shards. C'est très utile en architecture multi-tenant.

</v-clicks>

---

# Quiz Day 2 — Question 10

**Qu'est-ce que la percolation dans Elasticsearch ?**

<v-clicks>

- A) Un mécanisme de compression des données
- B) L'exécution de requêtes stockées contre un document pour détecter des correspondances ✅
- C) Le transfert de données entre nœuds
- D) Un type d'agrégation avancée

**Réponse : B** — La percolation inverse le paradigme classique : au lieu de chercher des documents avec une requête, on vérifie quelles requêtes stockées correspondent à un document donné. Idéal pour les alertes en temps réel.

</v-clicks>

---

# Quiz Day 2 — Question 11

**Quelle agrégation permet de compter le nombre de valeurs distinctes d'un champ ?**

<v-clicks>

- A) `value_count`
- B) `terms`
- C) `cardinality` ✅
- D) `stats`

**Réponse : C** — L'agrégation `cardinality` utilise l'algorithme HyperLogLog++ pour estimer le nombre de valeurs uniques d'un champ, avec une faible marge d'erreur.

</v-clicks>

---

# Quiz Day 2 — Question 12

**Quel est l'avantage principal des alias d'index dans Elasticsearch ?**

<v-clicks>

- A) Ils accélèrent les requêtes de 10x
- B) Ils permettent de découpler l'application des index physiques et de réindexer sans downtime ✅
- C) Ils doublent automatiquement le nombre de réplicas
- D) Ils compressent les données stockées

**Réponse : B** — Les alias fournissent un niveau d'indirection : l'application pointe vers un alias, ce qui permet de basculer entre index (reindexation, migration) de manière transparente et sans interruption.

</v-clicks>

---

# Quiz Day 2 — Question 13

**Dans une pipeline d'ingest, quel processeur est utilisé pour parser des lignes de log non structurées ?**

<v-clicks>

- A) `set`
- B) `lowercase`
- C) `grok` ✅
- D) `split`

**Réponse : C** — Le processeur `grok` utilise des patterns (expressions régulières nommées) pour extraire des champs structurés à partir de texte non structuré, comme des lignes de log Apache ou Nginx.

</v-clicks>

---

# Quiz Day 2 — Question 14

**Dans l'Index Lifecycle Management (ILM), quelles sont les phases du cycle de vie d'un index, dans l'ordre ?**

<v-clicks>

- A) Create → Active → Archive → Delete
- B) Hot → Warm → Cold → Frozen → Delete ✅
- C) Primary → Replica → Snapshot → Delete
- D) Index → Search → Aggregate → Purge

**Réponse : B** — ILM gère automatiquement le cycle de vie des index à travers ces phases, permettant d'optimiser les coûts en déplaçant les données vers du matériel moins coûteux au fil du temps.

</v-clicks>

---

# Quiz Day 2 — Question 15

**Quelle est la taille recommandée pour un shard en production ?**

<v-clicks>

- A) 1-5 Go
- B) 20-50 Go ✅
- C) 100-200 Go
- D) La taille n'a aucune importance

**Réponse : B** — Elastic recommande des shards entre 20 et 50 Go. Des shards trop petits créent un overhead de gestion excessif, tandis que des shards trop grands ralentissent la récupération et le rééquilibrage.

</v-clicks>
