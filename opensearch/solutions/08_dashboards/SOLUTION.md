# TP 8 — OpenSearch Dashboards : solution

Pour le formateur. Non publié. Ce TP se fait dans l'interface : rien à rejouer en CI.

## Étape 1

`response.keyword` est agrégeable : un `keyword` a des doc values. `response`,
analysé, ne l'est pas — sauf à activer `fielddata`, à proscrire.

## Étape 2

- DQL : `response:503`
- Filtre : `NOT machine.os.keyword: win xp`
- **Inspect** → **Request** sur `bytes > 10000 and extension:css` : une `bool` avec
  un `range` sur `bytes` et un `match` sur `extension`, dans un `filter` avec le
  `range` sur `timestamp` (la période).

## Étape 4

Un `date_histogram` sur `timestamp` (intervalle *auto*), et en sous-agrégation un
`terms` sur `response.keyword`. Le *Count* est le `doc_count` de chaque bucket.

## Étape 6

Non : une carte exige un `geo_point` (ou `geo_shape`). Deux champs `lat`/`lon` en
`float`, ou une chaîne, ne permettent ni agrégation géographique ni couche de
documents.

## Étape 7

1. Le clic crée un filtre `machine.os.keyword: osx`, appliqué à **tous** les
   panneaux, y compris la recherche enregistrée et la carte.
2. La sélection sur l'histogramme change la **période** globale du tableau de bord.

## Étape 8

Le `.ndjson` contient un objet par ligne : le tableau de bord, chaque
visualisation, la recherche, la carte et l'index pattern, avec leurs références.
Il s'importe sur un autre cluster (**Saved objects** → **Import**), à condition
que l'index existe.
