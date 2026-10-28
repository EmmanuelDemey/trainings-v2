---
layout: cover
---

# Conclusion

---

# Ce que nous avons vu

| Chapitre | À retenir |
|---|---|
| **1 - OpenSearch** | Fork Apache 2.0 d'Elasticsearch 7.10, gouverné par la Linux Foundation |
| **2 - Architecture** | Index inversé, shards primaires et réplicas, `green` / `yellow` / `red` |
| **3 - Installation** | Docker, `opensearch.yml`, heap ≤ 50 % de la RAM, API REST et `_cat` |
| **4 - Mapping** | Mapping explicite, `text` vs `keyword`, `_bulk`, `_reindex` + alias |
| **5 - Recherche** | `match` vs `term`, `bool` : `filter` sans score, BM25, `boost` |
| **6 - Analyse** | Char filters → tokenizer → token filters, `_analyze` |
| **7 - Agrégations** | Metrics, buckets, sous-agrégations, pipeline |
| **8 - Recherche avancée** | `search_after`, highlight, suggesters, géo, percolation |
| **9 - Ingest** | Processeurs, `_simulate`, `on_failure`, `default_pipeline` |
| **10 - Dashboards** | Index pattern, Discover, visualisations, tableaux de bord |

---

# Pour aller plus loin

Ce que la journée n'a pas couvert, et que le programme sur deux jours approfondit :

- **Sécurité** — TLS, utilisateurs, rôles, sécurité au niveau document et champ
- **Index State Management** (ISM) — rollover, passage hot / warm, suppression des vieux index
- **Snapshots** — sauvegarde et restauration
- **Alerting** et **Anomaly Detection**
- **SQL et PPL** — Query Workbench
- **Recherche vectorielle** — k-NN, recherche hybride, neural search
- **Exploitation** — dimensionnement des shards, monitoring, slow logs

<br />

📚 Documentation : **https://docs.opensearch.org** · Forum : **https://forum.opensearch.org**

---

# Quiz final — Question 1

**Un champ `email` doit servir à un filtre exact et à une agrégation. Quel type ?**

<v-clicks>

- A) `text`
- B) `keyword` ✅
- C) `text` avec l'analyseur `email`
- D) `object`

**Réponse : B** — valeur exacte, non analysée, avec doc values.

</v-clicks>

---

# Quiz final — Question 2

**Le cluster d'un seul nœud est `yellow`. Pourquoi ?**

<v-clicks>

- A) Un shard primaire est perdu
- B) Un index a des réplicas qui ne peuvent pas être alloués ✅
- C) La heap JVM est pleine
- D) Le plugin de sécurité est désactivé

**Réponse : B** — un réplica n'est jamais placé sur le nœud de son primaire.

</v-clicks>

---

# Quiz final — Question 3

**On veut extraire l'IP et le code HTTP d'une ligne de log brute avant de l'indexer. Avec quoi ?**

<v-clicks>

- A) Un analyseur personnalisé
- B) Un ingest pipeline avec un processeur `grok` ✅
- C) Une agrégation `terms`
- D) Un index template

**Réponse : B** — l'analyseur découpe du texte pour la recherche ; il ne crée pas de champs.

</v-clicks>

---

# Quiz final — Question 4

**Une visualisation n'affiche aucune donnée, alors que l'index en contient. Première chose à vérifier ?**

<v-clicks>

- A) Le mapping
- B) La période sélectionnée ✅
- C) Le nombre de shards
- D) Le plugin de sécurité

**Réponse : B** — l'index pattern a un champ de temps : la période filtre tout.

</v-clicks>

---
src: ./shared/retro.md
---
