# TP 2 — Indexation et mapping

> Laisser OpenSearch deviner un mapping et voir où il se trompe, écrire le bon, charger les données en `_bulk`, puis corriger un champ sans interrompre les lectures.

**Durée** : 30 min · **Chapitre** : 4 — Indexation et mapping

## Contexte

Une librairie en ligne veut un moteur de recherche sur son catalogue. Chaque livre a un titre, un auteur, un ISBN, un prix, une date de parution, un nombre de pages et des tags. Avant d'indexer des milliers de livres, vous fixez le schéma.

## Mise en place

Ce TP est autonome. Supprimez ce qu'une tentative précédente a pu laisser :

```json
DELETE /books_guess
DELETE /books_v1
DELETE /books_v2
```

Les trois livres du TP :

```text
1  { "title": "Le Petit Prince", "author": "Antoine de Saint-Exupéry", "isbn": "9782070612758", "price": 7.5,  "published": "1943-04-06", "pages": 96,  "tags": ["conte", "jeunesse"] }
2  { "title": "L'Étranger",      "author": "Albert Camus",             "isbn": "9782070360024", "price": 6.9,  "published": "1942-05-19", "pages": 184, "tags": ["roman", "absurde"] }
3  { "title": "Germinal",        "author": "Émile Zola",               "isbn": "9782253004226", "price": 8.2,  "published": "1885-03-01", "pages": 592, "tags": ["roman", "naturalisme"] }
```

Référence : [Mappings and field types](https://docs.opensearch.org/latest/field-types/).

## Exercices

### Étape 1 : Le mapping deviné

Indexez le livre 1, avec l'`_id` `1`, dans un index `books_guess` qui n'existe pas encore. Affichez le mapping qu'OpenSearch a créé.

<details>
<summary>Indice</summary>

`PUT /books_guess/_doc/1` crée l'index au passage. Puis `GET /books_guess/_mapping`.

</details>

**Résultat attendu** (un extrait du mapping) :

```json
{
  "books_guess": {
    "mappings": {
      "properties": {
        "isbn": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
        "pages": { "type": "long" },
        "price": { "type": "float" },
        "published": { "type": "date" }
      }
    }
  }
}
```

**Question** : pour chaque champ, le type deviné vous convient-il ? Que coûte un `isbn` en `text` + `keyword` ?

### Étape 2 : Le premier document décide

Indexez dans `books_guess`, avec l'`_id` `2`, un livre dont le `price` vaut `"épuisé"`.

<details>
<summary>Indice</summary>

Le type du champ est fixé par le premier document.

</details>

**Résultat attendu** : une erreur `mapper_parsing_exception`.

### Étape 3 : Le mapping explicite

Créez `books_v1`, 1 shard et 0 réplica, avec un mapping qui **refuse** tout champ inconnu et où :

- `title` se cherche en plein texte **et** se trie ;
- `author` se cherche en plein texte ;
- `isbn` et `tags` sont des valeurs exactes ;
- `price` est un nombre décimal, `pages` un entier, `published` une date.

<details>
<summary>Indice</summary>

`"dynamic": "strict"` au niveau de `mappings`. Un multi-field `fields` pour `title`.

</details>

**Résultat attendu** :

```json
{ "acknowledged": true, "index": "books_v1" }
```

### Étape 4 : Charger en masse

Indexez les trois livres dans `books_v1` en **une seule** requête, avec les `_id` `1`, `2` et `3`, et rendez-les cherchables immédiatement. Puis comptez les documents.

<details>
<summary>Indice</summary>

`POST /books_v1/_bulk?refresh=true` : une ligne `{ "index": { "_id": "…" } }`, puis une ligne de document. Compter : `_count`.

</details>

**Résultat attendu** (le comptage) :

```json
{ "count": 3 }
```

**Essayez** : indexez un document avec un champ `editor` en plus. Que répond OpenSearch ?

### Étape 5 : Corriger un type

L'équipe veut agréger sur l'**auteur**. Impossible sur un `text` seul — et on ne change pas le type d'un champ existant. Créez `books_v2`, même mapping, mais `author` a un sous-champ `keyword`. Copiez-y les documents de `books_v1`, puis faites pointer l'alias `books` vers `books_v2`. Cherchez enfin via l'alias les livres de Camus.

<details>
<summary>Indice</summary>

`POST /_reindex`, puis `POST /_aliases` avec une action `add`. Un `match` sur `author`, en interrogeant `/books/_search`.

</details>

**Résultat attendu** (la recherche) :

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [ { "_index": "books_v2", "_id": "2" } ]
  }
}
```

**Question** : demain, un `books_v3`. Comment basculer l'alias **sans** instant où il ne pointe sur rien ?

## Critères de réussite

- Vous savez lire un mapping, et repérer un type mal deviné
- Un index en `dynamic: strict` refuse les champs imprévus
- Les documents sont chargés en `_bulk`
- Un changement de type passe par un nouvel index, `_reindex` et un alias

## Pour aller plus loin

- Créez un **index template** `books-*` qui porte ce mapping, puis un index `books-2026` : vérifiez qu'il en hérite.
- Changez un prix avec `_update`, puis relisez le document : que vaut `_version` ?
- Rejouez le `_bulk` avec l'action `create` au lieu de `index` : que contient `items` ?

## Dépannage

**Problème** : `strict_dynamic_mapping_exception`
→ Attendu à l'étape 4 avec `editor`. Ailleurs : un champ du document n'est pas dans le mapping — une faute de frappe ?

**Problème** : `The bulk request must be terminated by a newline`
→ Le corps `_bulk` se termine par un retour à la ligne. Dans Dev Tools, laissez une ligne vide à la fin.

**Problème** : `resource_already_exists_exception`
→ L'index existe déjà : relancez la mise en place.
