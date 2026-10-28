# TP 7 — Ingest pipelines

> Transformer des avis clients reçus en CSV brut en documents structurés : découper, typer, dater, classer — et garder les lignes illisibles au lieu de les perdre.

**Durée** : 30 min · **Chapitre** : 9 — Ingest pipelines

## Contexte

Le guide reçoit les avis de ses lecteurs par un export CSV : une ligne par avis, `restaurant_id,auteur,étoiles,date,commentaire`. Indexées telles quelles, ces lignes sont inutilisables : impossible de filtrer sur les étoiles ou de tracer les avis dans le temps. Vous écrivez le pipeline qui les structure **avant** l'indexation.

## Mise en place

Ce TP est autonome. Créez l'index `reviews`, et supprimez le pipeline qu'une tentative précédente a pu laisser :

```json
DELETE /reviews
DELETE /_ingest/pipeline/reviews

PUT /reviews
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "restaurant_id": { "type": "keyword" },
      "author": { "type": "keyword" },
      "stars": { "type": "integer" },
      "comment": { "type": "text", "analyzer": "french" },
      "sentiment": { "type": "keyword" },
      "message": { "type": "text" },
      "error": { "type": "keyword" }
    }
  }
}
```

Les quatre lignes du TP, chacune dans un champ `message` :

```text
1  3,Camille,5,12/10/2026,"Poisson parfait, service rapide"
2  6,Hugo,2,13/10/2026,Frites froides
3  12,Inès,4,14/10/2026,Menu dégustation mémorable
4  ligne cassée
```

Référence : [Ingest pipelines](https://docs.opensearch.org/latest/ingest-pipelines/).

## Exercices

### Étape 1 : Découper la ligne, sans rien indexer

Testez, **sans créer de pipeline**, un processeur qui découpe la ligne 1 en `restaurant_id`, `author`, `stars`, `date` et `comment`.

<details>
<summary>Indice</summary>

`POST /_ingest/pipeline/_simulate`, avec un `pipeline` et des `docs`. Le processeur [`csv`](https://docs.opensearch.org/latest/ingest-pipelines/processors/csv/) gère les guillemets. Dans le JSON de `docs`, un guillemet s'écrit `\"`.

</details>

**Résultat attendu** :

```json
{
  "docs": [
    {
      "doc": {
        "_source": {
          "restaurant_id": "3",
          "author": "Camille",
          "stars": "5",
          "date": "12/10/2026",
          "comment": "Poisson parfait, service rapide"
        }
      }
    }
  ]
}
```

**Question** : `"5"` ou `5` — le mapping de `stars` dit `integer`. Pourquoi convertir quand même dans le pipeline ? (Pensez à l'étape 3.)

### Étape 2 : Typer, dater, nettoyer

Ajoutez au pipeline simulé : la conversion de `stars` en entier, la lecture de `date` (format `dd/MM/yyyy`, heure de Paris) vers `@timestamp`, puis la suppression de `message` et `date`. Simulez sur la ligne 1.

<details>
<summary>Indice</summary>

Les processeurs `convert`, `date` (`formats`, `target_field`, `timezone`) et `remove` — qui accepte une liste de champs.

</details>

**Résultat attendu** :

```json
{
  "docs": [
    { "doc": { "_source": { "stars": 5, "@timestamp": "2026-10-12T00:00:00.000+02:00" } } }
  ]
}
```

### Étape 3 : Positif ou négatif

Ajoutez un champ `sentiment` : `positive` pour **4 étoiles ou plus**, `negative` pour **2 ou moins**, rien sinon. Simulez sur les lignes 1 et 2.

<details>
<summary>Indice</summary>

Deux processeurs `set`, chacun avec un `if` en Painless : `ctx.stars >= 4`. C'est là que la conversion de l'étape 2 sert.

</details>

**Résultat attendu** :

```json
{
  "docs": [
    { "doc": { "_source": { "stars": 5, "sentiment": "positive" } } },
    { "doc": { "_source": { "stars": 2, "sentiment": "negative" } } }
  ]
}
```

### Étape 4 : Ne rien perdre, et enregistrer

Simulez sur la ligne 4 : le pipeline échoue. Ajoutez-lui une gestion d'erreur qui garde le document en écrivant le message d'erreur dans `error`. Enregistrez enfin le pipeline sous le nom `reviews`.

<details>
<summary>Indice</summary>

Un bloc `on_failure` au niveau du pipeline, avec un `set` et `{{ _ingest.on_failure_message }}`. Puis `PUT /_ingest/pipeline/reviews`.

</details>

**Résultat attendu** (l'enregistrement) :

```json
{ "acknowledged": true }
```

### Étape 5 : Le pipeline par défaut

Les applications qui écrivent dans `reviews` ne doivent pas avoir à nommer le pipeline. Faites-en le pipeline **par défaut** de l'index, puis indexez les quatre lignes — `_id` `1` à `4` — en une requête, cherchables tout de suite. Lisez l'avis `1`, puis comptez les avis **positifs**, et ceux **en erreur**.

<details>
<summary>Indice</summary>

`index.default_pipeline` est un setting dynamique. Un `_bulk` avec `{ "message": "…" }` par document. Pour les erreurs : la requête `exists` sur `error`.

</details>

**Résultat attendu** (l'avis 1) :

```json
{
  "_id": "1",
  "_source": {
    "restaurant_id": "3",
    "author": "Camille",
    "stars": 5,
    "sentiment": "positive",
    "@timestamp": "2026-10-12T00:00:00.000+02:00"
  }
}
```

**Résultat attendu** (les deux comptages) :

```json
{ "count": 2 }
```

```json
{ "count": 1 }
```

**Essayez** : `GET /_nodes/stats/ingest?filter_path=nodes.*.ingest.pipelines.reviews` — que vous dit-il ?

## Critères de réussite

- Un pipeline testé avec `_simulate` avant d'être enregistré
- `csv`, `convert`, `date`, `remove` et un `set` conditionnel structurent une ligne brute
- Une ligne illisible est gardée, marquée `error`
- L'index applique le pipeline par défaut

## Pour aller plus loin

- Ajoutez un processeur `script` qui calcule la longueur du commentaire dans `comment_length`.
- Remplacez `csv` par `dissect` : qu'est-ce qui casse sur la ligne 1, et pourquoi ?
- Mettez le nettoyage (`remove`) dans un second pipeline appelé avec le processeur `pipeline`, et branchez-le en `index.final_pipeline`.

## Dépannage

**Problème** : `field [stars] not present as part of path [stars]`
→ Attendu sur la ligne 4. Ailleurs : le `csv` n'a pas produit `stars` — vérifiez `target_fields`.

**Problème** : `unable to parse date [12/10/2026]`
→ Le format doit correspondre exactement : `dd/MM/yyyy`, `MM` pour le mois, `mm` pour les minutes.

**Problème** : `@timestamp` absent après l'indexation
→ Le document n'est pas passé par le pipeline : nommez-le avec `?pipeline=reviews`, ou réglez `index.default_pipeline`.
