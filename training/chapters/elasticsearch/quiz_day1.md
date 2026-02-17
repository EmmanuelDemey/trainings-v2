---
layout: cover
---

# Quiz - Day 1
## Fundamentals, Mapping and Search

---

# Quiz Day 1 — Question 1

**Quelle est la structure de données principale utilisée par Elasticsearch pour effectuer des recherches rapides ?**

<v-clicks>

- A) Un arbre B+
- B) Une table de hachage
- C) Un index inversé ✅
- D) Un graphe orienté

**Réponse : C** — L'index inversé associe chaque terme à la liste des documents qui le contiennent, permettant des recherches full-text ultra-rapides.

</v-clicks>

---

# Quiz Day 1 — Question 2

**Quel port est utilisé par défaut par l'API REST d'Elasticsearch ?**

<v-clicks>

- A) 5601
- B) 9300
- C) 8080
- D) 9200 ✅

**Réponse : D** — Le port 9200 est le port par défaut pour l'API REST HTTP. Le port 5601 est celui de Kibana, et 9300 celui du transport inter-nœuds.

</v-clicks>

---

# Quiz Day 1 — Question 3

**Que signifie un état de cluster "yellow" dans Elasticsearch ?**

<v-clicks>

- A) Le cluster est totalement opérationnel
- B) Tous les shards primaires sont assignés, mais certains réplicas ne le sont pas ✅
- C) Le cluster est en panne
- D) L'indexation est désactivée

**Réponse : B** — Un cluster yellow indique que les shards primaires fonctionnent, mais que certaines répliques ne sont pas allouées (souvent dans un cluster mono-nœud).

</v-clicks>

---

# Quiz Day 1 — Question 4

**Quelle API faut-il privilégier pour indexer un grand volume de documents ?**

<v-clicks>

- A) L'API `_search`
- B) L'API `_doc` document par document
- C) L'API `_bulk` ✅
- D) L'API `_reindex`

**Réponse : C** — L'API `_bulk` permet d'envoyer plusieurs opérations (index, update, delete) en une seule requête HTTP, réduisant considérablement l'overhead réseau.

</v-clicks>

---

# Quiz Day 1 — Question 5

**Quelle est la différence entre les types `text` et `keyword` dans un mapping ?**

<v-clicks>

- A) `text` est pour les nombres, `keyword` pour les chaînes
- B) `text` est analysé (tokenisé) pour la recherche full-text, `keyword` est stocké tel quel pour les recherches exactes ✅
- C) `keyword` est plus performant que `text` dans tous les cas
- D) Il n'y a aucune différence

**Réponse : B** — Un champ `text` passe par un analyseur (tokenisation, filtres) pour le full-text search. Un champ `keyword` est indexé sans transformation pour les filtres exacts, le tri et les agrégations.

</v-clicks>

---

# Quiz Day 1 — Question 6

**Quel est le rôle d'un analyseur (analyzer) dans Elasticsearch ?**

<v-clicks>

- A) Optimiser les performances réseau du cluster
- B) Transformer le texte en tokens lors de l'indexation et de la recherche ✅
- C) Gérer la réplication des shards
- D) Compresser les données sur le disque

**Réponse : B** — Un analyseur se compose d'un tokenizer et de filtres (lowercase, stemming, stop words, etc.) qui transforment le texte brut en tokens indexables.

</v-clicks>

---

# Quiz Day 1 — Question 7

**Dans une requête `bool`, quelle clause permet de filtrer les documents sans affecter le score de pertinence ?**

<v-clicks>

- A) `must`
- B) `should`
- C) `must_not`
- D) `filter` ✅

**Réponse : D** — La clause `filter` applique un filtre binaire (oui/non) sans calculer de score. Elle est aussi mise en cache pour de meilleures performances.

</v-clicks>

---

# Quiz Day 1 — Question 8

**Quel algorithme de scoring est utilisé par défaut dans Elasticsearch ?**

<v-clicks>

- A) TF/IDF
- B) PageRank
- C) BM25 ✅
- D) Cosine Similarity

**Réponse : C** — BM25 (Best Matching 25) est l'algorithme par défaut depuis Elasticsearch 5.x. C'est une évolution de TF/IDF qui gère mieux la saturation des termes fréquents.

</v-clicks>
