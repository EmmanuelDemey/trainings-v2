---
layout: cover
---

# 6 - Analyse de texte

---

# Objectifs pédagogiques

À la fin de cette séquence (**~30 min**, TP compris), vous saurez :

- **Décomposer** un analyseur : char filters, tokenizer, token filters
- **Tester** un analyseur avec l'API `_analyze`
- **Choisir** un analyseur de langue
- **Construire** un analyseur personnalisé : accents, synonymes, stop words

---

# Pourquoi analyser ?

L'utilisateur tape **« Pâtes fraiches »**, le document contient **« pâtes fraîches maison »**.

Pour qu'ils se rencontrent, les deux passent par la **même** chaîne :

```text
"Pâtes fraîches maison"
   │ char filters     → nettoie le texte brut (HTML, caractères)
   │ tokenizer        → découpe : [Pâtes] [fraîches] [maison]
   │ token filters    → transforme : minuscules, accents, racines, synonymes
   ▼
[pate] [frai] [maison]   ← les termes de l'index inversé
```

- À l'**indexation** : sur le champ `text`
- À la **recherche** : sur le texte de la requête `match`
- Un `keyword` n'est **pas** analysé (au plus un `normalizer`)

---

# L'API `_analyze`

```json
POST /_analyze
{
  "analyzer": "standard",
  "text": "Les Pâtes fraîches, c'est MAISON !"
}
```

**Résultat attendu** :

```json
{
  "tokens": [
    { "token": "les" }, { "token": "pâtes" }, { "token": "fraîches" },
    { "token": "c'est" }, { "token": "maison" }
  ]
}
```

- `standard` : découpe sur les mots (Unicode), met en minuscules — c'est tout
- Garde les **accents**, les **pluriels** et les mots vides (`les`)

---

# Les analyseurs intégrés

| Analyseur | Effet |
|---|---|
| `standard` | Mots + minuscules — le défaut |
| `simple` | Coupe sur tout ce qui n'est pas une lettre, minuscules |
| `whitespace` | Coupe sur les espaces, rien d'autre |
| `keyword` | Un seul terme : le texte entier |
| `french`, `english`… | Langue : élisions, mots vides, **racinisation** |

```json
POST /_analyze
{ "analyzer": "french", "text": "Les Pâtes fraîches, c'est MAISON !" }
```

**Résultat attendu** :

```json
{ "tokens": [ { "token": "pâte" }, { "token": "fraich" }, { "token": "maison" } ] }
```

---

# Les briques

| Brique | Exemples |
|---|---|
| **Char filters** | `html_strip`, `mapping` (`& → et`), `pattern_replace` |
| **Tokenizer** | `standard`, `whitespace`, `keyword`, `pattern`, `ngram`, `edge_ngram`, `path_hierarchy` |
| **Token filters** | `lowercase`, `asciifolding` (accents), `stop`, `elision`, `stemmer`, `synonym`, `edge_ngram`, `unique` |

On les compose à la volée pour tester :

```json
POST /_analyze
{
  "char_filter": ["html_strip"],
  "tokenizer": "standard",
  "filter": ["lowercase", "asciifolding"],
  "text": "<p>Crème <b>brûlée</b></p>"
}
```

**Résultat attendu** :

```json
{ "tokens": [ { "token": "creme" }, { "token": "brulee" } ] }
```

---

# Un analyseur personnalisé

```json
PUT /menu
{
  "settings": {
    "analysis": {
      "filter": {
        "fr_elision":  { "type": "elision", "articles_case": true, "articles": ["l", "d", "c", "j", "qu"] },
        "fr_stop":     { "type": "stop", "stopwords": "_french_" },
        "fr_synonyms": { "type": "synonym", "synonyms": ["frites, pommes frites", "burger, hamburger"] }
      },
      "analyzer": {
        "menu_fr": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["fr_elision", "lowercase", "fr_stop", "fr_synonyms", "asciifolding"]
        }
      }
    }
  },
  "mappings": { "properties": { "dish": { "type": "text", "analyzer": "menu_fr" } } }
}

POST /menu/_analyze
{ "analyzer": "menu_fr", "text": "L'Hamburger et ses frites" }
```

---

# Analyse à l'indexation, à la recherche

- `analyzer` : utilisé aux **deux** moments, par défaut
- `search_analyzer` : un autre analyseur pour la **requête** seulement

Cas typique — l'**autocomplétion par préfixe** :

```json
"title": {
  "type": "text",
  "analyzer": "autocomplete",
  "search_analyzer": "standard"
}
```

- `autocomplete` = tokenizer `standard` + filtre `edge_ngram` (2 → 10) : `pizza` → `pi`, `piz`, `pizz`, `pizza`
- À la recherche, `piz` reste `piz` : il trouve le préfixe indexé

<br />

> Changer l'analyseur d'un champ existant ? **Impossible** : nouvel index + `_reindex`.

---

# Quiz

**Un champ `text` avec l'analyseur `standard` contient « Crème brûlée ». La requête `match` « creme brulee » le trouve-t-elle ?**

<v-clicks>

- A) Oui, `standard` retire les accents
- B) Non, il faut le filtre `asciifolding` ✅
- C) Oui, `match` ignore les accents
- D) Non, il faut un `keyword`

**Réponse : B** — `standard` ne fait que minuscules : `crème` ≠ `creme`.

</v-clicks>

---

# En pratique

## TP 4 - Analyse de texte
