# TP 8 — OpenSearch Dashboards

> Explorer les logs d'un site web dans Discover, construire quatre visualisations et une carte, puis les assembler en un tableau de bord interactif à partager.

**Durée** : 45 min · **Chapitre** : 10 — OpenSearch Dashboards

## Contexte

L'équipe d'exploitation d'un site web veut un tableau de bord : le trafic dans le temps, les erreurs, les systèmes des visiteurs, et d'où ils viennent. OpenSearch Dashboards fournit un jeu de **logs web d'exemple** : vous partez de lui, et construisez **votre** tableau de bord — sans regarder celui qu'il fournit.

## Mise en place

1. Ouvrez **http://localhost:5601**.
2. Page d'accueil → **Add sample data** (ou menu ☰ → **Home** → **Sample data**).
3. Sur **Sample web logs**, cliquez **Add data**.

L'index `opensearch_dashboards_sample_data_logs` contient environ **14 000** requêtes HTTP, réparties sur quelques semaines **autour d'aujourd'hui**. Champs utiles :

| Champ | Type | Contenu |
|---|---|---|
| `timestamp` | `date` | Date de la requête |
| `response` / `response.keyword` | `text` / `keyword` | Code HTTP : `200`, `404`, `503` |
| `bytes` | `long` | Taille de la réponse |
| `machine.os.keyword` | `keyword` | Système du visiteur |
| `extension.keyword` | `keyword` | Extension du fichier demandé |
| `geo.src` | `keyword` | Pays d'origine (code ISO) |
| `geo.coordinates` | `geo_point` | Position du visiteur |
| `clientip` | `ip` | IP du visiteur |

Référence : [OpenSearch Dashboards](https://docs.opensearch.org/latest/dashboards/).

## Exercices

### Étape 1 : L'index pattern

L'ajout des données d'exemple a créé un index pattern. Créez-en **un autre**, à vous : motif `opensearch_dashboards_sample_data_logs*`, champ de temps `timestamp`.

<details>
<summary>Indice</summary>

Menu ☰ → **Dashboards Management** → **Index patterns** → **Create index pattern**.

</details>

**Résultat attendu** : l'index pattern liste une trentaine de champs ; `geo.coordinates` est de type `geo_point`, `bytes` de type `number`, agrégeable.

**Question** : `response` apparaît deux fois, `response` et `response.keyword`. Lequel est **agrégeable** ? Pourquoi ?

### Étape 2 : Discover

Dans **Discover**, avec votre index pattern :

1. Réglez la période sur les **7 derniers jours**.
2. Affichez les colonnes `clientip`, `request`, `response`, `bytes`.
3. Avec **DQL**, trouvez les erreurs serveur : les réponses **503**.
4. Ajoutez un **filtre** qui exclut le système `win xp`.
5. Enregistrez la recherche sous le nom `Erreurs 503`.

<details>
<summary>Indice</summary>

DQL : `response:503`. Pour le filtre : **+ Add filter**, `machine.os.keyword` **is not** `win xp` — ou survolez une valeur dans un document, et cliquez la loupe barrée.

</details>

**Résultat attendu** : quelques dizaines de documents, tous en `503`, aucun `win xp`.

**Essayez** : dans la barre DQL, `bytes > 10000 and extension:css`. Puis **Inspect** → **Request** : à quoi ressemble la requête envoyée à OpenSearch ?

### Étape 3 : Une métrique

Menu ☰ → **Visualize** → **Create visualization** → **Metric**. Affichez le **nombre total de requêtes** et le **volume moyen** (`bytes`). Enregistrez-la sous `Trafic — chiffres clés`.

<details>
<summary>Indice</summary>

**Metrics** → **Add** → *Average* sur `bytes`. La première métrique, *Count*, est déjà là.

</details>

### Étape 4 : Le trafic dans le temps, par code HTTP

Une **Vertical bar** : en X, un **Date Histogram** sur `timestamp` ; les barres **empilées** par code HTTP (`response.keyword`). Enregistrez-la sous `Trafic par code HTTP`.

<details>
<summary>Indice</summary>

**Buckets** → **Add** → **X-axis** → *Date Histogram*. Puis **Add** → **Split series** → *Terms* sur `response.keyword`. Le panneau de droite → **Metrics & axes** → **Mode** : *stacked*.

</details>

**Question** : quelles agrégations du chapitre 7 cette visualisation envoie-t-elle ? Vérifiez avec **Inspect** → **Requests**.

### Étape 5 : Les systèmes des visiteurs

Un **Pie** (en anneau, *donut*) : la part de chaque système (`machine.os.keyword`), puis, à l'intérieur de chaque système, la part de chaque extension (`extension.keyword`, top 3). Enregistrez-le sous `Systèmes et fichiers`.

<details>
<summary>Indice</summary>

Deux **Split slices** : un *Terms* sur `machine.os.keyword`, puis un *Terms* sur `extension.keyword`. L'ordre des buckets compte.

</details>

### Étape 6 : La carte

Menu ☰ → **Maps** → **Create map**. Ajoutez une couche **Documents** sur votre index pattern, champ géo `geo.coordinates`. Colorez les points selon `response.keyword`. Enregistrez la carte sous `Visiteurs`.

<details>
<summary>Indice</summary>

**Add layer** → **Documents**. Onglet **Style** → couleur par champ. Si **Maps** n'apparaît pas, utilisez **Visualize** → **Coordinate Map**, avec une agrégation *Geohash* sur `geo.coordinates`.

</details>

**Question** : sans le type `geo_point` dans le mapping, cette carte serait-elle possible ?

### Étape 7 : Le tableau de bord

Menu ☰ → **Dashboards** → **Create** → **Dashboard**. Ajoutez vos quatre visualisations et la recherche `Erreurs 503`. Disposez-les, puis enregistrez sous `Exploitation du site`.

Puis, **sur le tableau de bord** :

1. Cliquez sur le secteur `osx` du camembert : que deviennent **tous** les panneaux ?
2. Sélectionnez à la souris une plage de l'histogramme : que devient la période ?
3. Retirez les filtres.

### Étape 8 : Partager

1. **Share** → **Copy link** : ouvrez le lien dans une fenêtre privée.
2. Menu ☰ → **Dashboards Management** → **Saved objects** : exportez le tableau de bord **avec ses objets liés**. Ouvrez le fichier `.ndjson` obtenu : que contient-il ?

## Critères de réussite

- Un index pattern avec un champ de temps
- Une recherche DQL et un filtre, enregistrés
- Quatre visualisations : métrique, histogramme empilé, anneau, carte
- Un tableau de bord interactif, exporté en `.ndjson`

## Pour aller plus loin

- Créez votre propre index pattern sur `restaurants` (TP 3) — sans champ de temps — et une carte de ses restaurants.
- Une visualisation **TSVB** : le trafic, et en surimpression la moyenne mobile sur 1 h.
- Menu ☰ → **Query Workbench** : la même question que l'étape 4, en **PPL** :
  `source = opensearch_dashboards_sample_data_logs | stats count() by span(timestamp, 1d), response`.

## Dépannage

**Problème** : Discover affiche « No results match your search criteria »
→ La **période** ne couvre pas les données : élargissez-la (*Last 30 days*).

**Problème** : `response` n'est pas proposé dans *Terms*
→ C'est un `text` : prenez `response.keyword`.

**Problème** : un nouveau champ du mapping n'apparaît pas
→ **Index patterns** → votre pattern → bouton **Refresh field list**.
