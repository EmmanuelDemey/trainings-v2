---
layout: cover
---

# 10 - OpenSearch Dashboards

---

# Objectifs pédagogiques

À la fin de cette séquence (**~50 min**, TP compris), vous saurez :

- **Naviguer** dans OpenSearch Dashboards
- **Déclarer** un index pattern et son champ de temps
- **Explorer** les données dans Discover : filtres, DQL, période
- **Construire** des visualisations : métriques, barres, courbes, camemberts, cartes
- **Assembler** et **partager** un tableau de bord interactif

---

# L'interface

| Menu | Pour |
|---|---|
| **Discover** | Explorer les documents bruts, filtrer, chercher |
| **Visualize** | Créer une visualisation : métrique, graphique, carte, tableau |
| **Dashboards** | Assembler des visualisations, filtrer le tout d'un clic |
| **Maps** | Cartes multi-couches à partir de données géographiques |
| **Dev Tools** | La console de l'API REST |
| **Dashboards Management** | Index patterns, objets sauvegardés, paramètres avancés |

Et, selon les plugins : Alerting, Anomaly Detection, Index Management, Query Workbench (SQL / PPL), Observability…

---

# L'index pattern

Dashboards ne lit pas un index : il lit un **index pattern**.

- Un **motif** : `restaurants`, `logs-*`, `opensearch_dashboards_sample_data_logs`
- Un **champ de temps** (optionnel) : active le **sélecteur de période** et les histogrammes
- La liste des champs, leurs types, s'ils sont **agrégeables** et **cherchables**

**Dashboards Management** → **Index patterns** → **Create index pattern**

<br />

> Un nouveau champ dans le mapping ? **Rafraîchir** la liste des champs de l'index pattern.

---

# Discover

- **Sélecteur de période** — en haut à droite : *Last 15 minutes*, absolu, relatif
- **Barre de recherche** — **DQL** (par défaut) ou Lucene
- **Filtres** — `+ Add filter`, ou un clic sur la loupe à côté d'une valeur
- **Histogramme** — le nombre de documents dans le temps
- **Colonnes** — choisir les champs affichés ; **Save** : une recherche réutilisable

<br />

> Aucun document ? Neuf fois sur dix, la **période** ne couvre pas les données.

---

# DQL — Dashboards Query Language

| Requête | Trouve |
|---|---|
| `response:404` | Un champ égal à une valeur |
| `response:(404 or 503)` | Une valeur parmi plusieurs |
| `bytes > 10000` | Une plage |
| `machine.os:win*` | Un préfixe |
| `not response:200` | La négation |
| `extension:css and geo.src:FR` | Une combinaison |
| `tags:*` | Le champ existe |
| `message:"page not found"` | Une phrase |

- DQL se traduit en Query DSL : **Inspect** → **Request** le montre
- Les **filtres** (pastilles) et la requête se **cumulent**

---

# Les visualisations

| Type | Pour |
|---|---|
| **Metric**, **Gauge** | Un chiffre clé : nombre de requêtes, temps moyen |
| **Vertical / Horizontal bar** | Comparer des catégories, ou le temps |
| **Line**, **Area** | Une tendance dans le temps |
| **Pie** | Une répartition — peu de catégories |
| **Data table** | Le détail chiffré |
| **Heat map** | Deux dimensions croisées |
| **Coordinate / Region map**, **Maps** | Des données géographiques |
| **TSVB**, **Vega** | Séries temporelles avancées, graphiques sur mesure |
| **VisBuilder** | Glisser-déposer, le plus simple pour commencer |

---

# Une visualisation = des agrégations

Une **barre verticale** « requêtes par jour, par code HTTP » :

| Dans l'éditeur | En Query DSL |
|---|---|
| **Metrics** → Y-axis : *Count* | `value_count` (le `doc_count`) |
| **Buckets** → X-axis : *Date Histogram* sur `timestamp` | `date_histogram` |
| **Buckets** → Split series : *Terms* sur `response.keyword` | `terms`, en sous-agrégation |

<br />

- Exactement les agrégations du **chapitre 7**
- **Inspect** → **Requests** : la requête envoyée, la réponse, les données

---

# Les cartes

- Un champ **`geo_point`** (ou `geo_shape`) dans le mapping — un `float` lat / lon ne suffit pas
- **Maps** : fond de carte, couches de **documents**, de **grilles** (`geotile_grid`), de **régions**
- **Coordinate map** : une agrégation géographique sur un fond de carte
- **Region map** : colorer des pays ou régions selon une métrique (code ISO)

<br />

> Le mapping fait tout : un champ de position indexé en `text` ne sera **jamais** une carte.
> C'est le chapitre 4 qui se rappelle à nous.

---

# Le tableau de bord

- **Dashboards** → **Create** → **Add** : des visualisations et des recherches sauvegardées
- Glisser, redimensionner ; **Save**, avec ou sans la période (*Store time with dashboard*)
- **Interactif** : un clic sur une barre ou un secteur crée un **filtre** appliqué à **tout** le tableau
- La barre de recherche et la période filtrent aussi tous les panneaux

<br />

**Partager** :

- **Share** → lien (court ou complet), **iframe** à intégrer
- **Reporting** : PDF / PNG, à la demande ou planifié
- **Saved objects** → **Export** : un fichier `.ndjson`, à importer sur un autre cluster

---

# En pratique

## TP 8 - OpenSearch Dashboards
