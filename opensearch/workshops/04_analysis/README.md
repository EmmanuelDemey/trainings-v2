# TP 4 — Analyse de texte

> Voir ce que deviennent les mots à l'indexation, puis construire un analyseur qui ignore le HTML, les accents et les élisions, et connaît les synonymes de la carte.

**Durée** : 25 min · **Chapitre** : 6 — Analyse de texte

## Contexte

La carte d'un restaurant arrive en HTML. Les clients tapent « burger » quand la carte dit « hamburger », « creme brulee » sans accents. Avec l'analyseur `standard`, rien de tout ça ne se trouve. Vous écrivez l'analyseur qui fait se rencontrer les deux.

## Mise en place

Ce TP est autonome. Supprimez l'index qu'une tentative précédente a pu laisser :

```json
DELETE /dishes
```

Les trois plats du TP, tels que la carte les envoie :

```text
1  <p>L'Hamburger végétarien et ses frites</p>
2  <p>Crème brûlée à la vanille</p>
3  <p>Burger de bœuf, pommes frites</p>
```

Référence : [Text analysis](https://docs.opensearch.org/latest/analyzers/).

## Exercices

### Étape 1 : L'analyseur `standard`

Analysez « L'Hamburger végétarien et ses frites maison » avec l'analyseur `standard`.

<details>
<summary>Indice</summary>

`POST /_analyze`, avec `analyzer` et `text`.

</details>

**Résultat attendu** :

```json
{
  "tokens": [
    { "token": "l'hamburger" }, { "token": "végétarien" }, { "token": "et" },
    { "token": "ses" }, { "token": "frites" }, { "token": "maison" }
  ]
}
```

**Question** : un client qui cherche « hamburger » trouvera-t-il ce plat ?

### Étape 2 : L'analyseur `french`

Analysez le même texte avec l'analyseur `french`.

**Résultat attendu** :

```json
{
  "tokens": [ { "token": "hamburg" }, { "token": "vegetarien" }, { "token": "frit" }, { "token": "maison" } ]
}
```

**Question** : qu'est-ce qui a disparu, et qu'est-ce qui a changé ? « burger » trouvera-t-il ce plat ?

### Étape 3 : Composer à la volée

Sans créer d'index, testez la chaîne : char filter `html_strip`, tokenizer `standard`, filtres `lowercase` et `asciifolding`, sur le texte `<p>Crème brûlée</p>`.

<details>
<summary>Indice</summary>

`_analyze` accepte `char_filter`, `tokenizer` et `filter` au lieu d'`analyzer`.

</details>

**Résultat attendu** :

```json
{ "tokens": [ { "token": "creme" }, { "token": "brulee" } ] }
```

### Étape 4 : L'analyseur personnalisé

Créez l'index `dishes` (1 shard, 0 réplica) avec un analyseur `dish_fr` qui :

- retire le HTML ;
- découpe avec le tokenizer `standard` ;
- retire les élisions (`l'`, `d'`, `c'`, `j'`, `qu'`, `s'`), même en majuscules ;
- met en minuscules ;
- retire les mots vides français ;
- connaît les synonymes `burger, hamburger` et `frites, pommes frites` ;
- retire les accents.

Le champ `dish` de l'index utilise cet analyseur. Vérifiez-le avec `_analyze` sur `<b>L'Hamburger</b> végétarien et ses frites`.

<details>
<summary>Indice</summary>

`settings.analysis` : des `filter` (`elision` avec `articles_case`, `stop` avec `_french_`, `synonym`), puis un `analyzer` de type `custom`. L'ordre des filtres compte : `lowercase` avant `stop` et `synonym`.

</details>

**Résultat attendu** (l'analyse) :

```json
{
  "tokens": [
    { "token": "hamburger" }, { "token": "burger", "type": "SYNONYM" },
    { "token": "vegetarien" }, { "token": "frites" }, { "token": "pommes", "type": "SYNONYM" }
  ]
}
```

### Étape 5 : Le vérifier par la recherche

Indexez les trois plats (`_id` `1`, `2`, `3`) en une requête, cherchables tout de suite. Cherchez ensuite « burger », puis « creme brulee ».

**Résultat attendu** (« burger ») :

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "1" }, { "_id": "3" } ]
  }
}
```

**Résultat attendu** (« creme brulee ») :

```json
{ "hits": { "total": { "value": 1 }, "hits": [ { "_id": "2" } ] } }
```

**Question** : `asciifolding` est placé **après** `synonym`. Que se passerait-il avec un synonyme accentué (`crème, flan`) ?

## Critères de réussite

- Vous savez lire la sortie de `_analyze`, et prévoir ce qu'une recherche trouvera
- Un analyseur `custom` enchaîne char filter, tokenizer et filtres
- La recherche bénéficie de la même analyse que l'indexation

## Pour aller plus loin

- Ajoutez un filtre `stemmer` (`"language": "light_french"`) : « frite » trouve-t-il maintenant « frites » ?
- Créez un analyseur `autocomplete` (`edge_ngram` 2 → 10) et branchez-le sur un sous-champ `dish.prefix`, avec `"search_analyzer": "standard"`. Cherchez « hamb ».
- Ajoutez un `normalizer` (`lowercase`, `asciifolding`) sur un champ `keyword` : un `term` sur « CREME » le trouve-t-il ?

## Dépannage

**Problème** : `failed to build synonyms`
→ Un synonyme contient un mot retiré par un filtre placé avant (mot vide). Vérifiez l'ordre des filtres.

**Problème** : l'analyseur ne s'applique pas à la recherche
→ Vous interrogez un autre champ, ou l'index a été créé sans le mapping : `GET /dishes/_mapping`.
