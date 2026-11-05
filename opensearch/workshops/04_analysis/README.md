# Workshop 4 — Text analysis

> See what the words become at index time, then build an analyzer that ignores HTML, accents and possessives, and knows the synonyms of the menu.

**Duration**: 25 min · **Chapter**: 6 — Text analysis

## Context

A restaurant's menu arrives as HTML. The customers type "burger" when the menu says "hamburger", "creme brulee" without accents. With the `standard` analyzer, none of this is found. You write the analyzer that makes both meet.

## Setup

This workshop is self-contained. Delete the index a previous attempt may have left:

```json
DELETE /dishes
```

The three dishes of the workshop, as the menu sends them:

```text
1  <p>The chef's vegetarian Hamburger and its fries</p>
2  <p>Crème brûlée with vanilla</p>
3  <p>Beef burger, French fries</p>
```

Reference: [Text analysis](https://docs.opensearch.org/latest/analyzers/).

## Exercises

### Step 1: The `standard` analyzer

Analyze "The chef's vegetarian Hamburger and its homemade fries" with the `standard` analyzer.

<details>
<summary>Hint</summary>

`POST /_analyze`, with `analyzer` and `text`.

</details>

**Expected result**:

```json
{
  "tokens": [
    { "token": "the" }, { "token": "chef's" }, { "token": "vegetarian" }, { "token": "hamburger" },
    { "token": "and" }, { "token": "its" }, { "token": "homemade" }, { "token": "fries" }
  ]
}
```

**Question**: will a customer searching for "chef" find this dish?

### Step 2: The `english` analyzer

Analyze the same text with the `english` analyzer.

**Expected result**:

```json
{
  "tokens": [
    { "token": "chef" }, { "token": "vegetarian" }, { "token": "hamburg" },
    { "token": "it" }, { "token": "homemad" }, { "token": "fri" }
  ]
}
```

**Question**: what disappeared, and what changed? Will "burger" find this dish?

### Step 3: Compose on the fly

Without creating an index, test the chain: `html_strip` char filter, `standard` tokenizer, `lowercase` and `asciifolding` filters, on the text `<p>Crème brûlée</p>`.

<details>
<summary>Hint</summary>

`_analyze` accepts `char_filter`, `tokenizer` and `filter` instead of `analyzer`.

</details>

**Expected result**:

```json
{ "tokens": [ { "token": "creme" }, { "token": "brulee" } ] }
```

### Step 4: The custom analyzer

Create the `dishes` index (1 shard, 0 replicas) with a `dish_en` analyzer that:

- removes the HTML;
- splits with the `standard` tokenizer;
- lowercases;
- removes the possessives (`chef's` → `chef`);
- removes the English stop words;
- knows the synonyms `burger, hamburger` and `fries, french fries`;
- removes the accents.

The `dish` field of the index uses this analyzer. Check it with `_analyze` on `<b>The Chef's</b> vegetarian Hamburger and its fries`.

<details>
<summary>Hint</summary>

`settings.analysis`: some `filter` (`stemmer` with `possessive_english`, `stop` with `_english_`, `synonym`), then an `analyzer` of type `custom`. The order of the filters matters: `lowercase` before `stop` and `synonym`.

</details>

**Expected result** (the analysis):

```json
{
  "tokens": [
    { "token": "chef" }, { "token": "vegetarian" },
    { "token": "hamburger" }, { "token": "burger", "type": "SYNONYM" },
    { "token": "fries" }, { "token": "french", "type": "SYNONYM" }
  ]
}
```

### Step 5: Check it with a search

Index the three dishes (`_id` `1`, `2`, `3`) in one request, searchable right away. Then search "burger", then "creme brulee".

**Expected result** ("burger"):

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "1" }, { "_id": "3" } ]
  }
}
```

**Expected result** ("creme brulee"):

```json
{ "hits": { "total": { "value": 1 }, "hits": [ { "_id": "2" } ] } }
```

**Question**: `asciifolding` is placed **after** `synonym`. What would happen with an accented synonym (`crème, custard`)?

## Success criteria

- You can read the output of `_analyze`, and predict what a search will find
- A `custom` analyzer chains char filter, tokenizer and filters
- The search benefits from the same analysis as the indexing

## Going further

- Add a `stemmer` filter (`"language": "light_english"`): does "fry" now find "fries"?
- Create an `autocomplete` analyzer (`edge_ngram` 2 → 10) and plug it into a `dish.prefix` sub-field, with `"search_analyzer": "standard"`. Search "hamb".
- Add a `normalizer` (`lowercase`, `asciifolding`) to a `keyword` field: does a `term` on "CREME" find it?

## Troubleshooting

**Problem**: `failed to build synonyms`
→ A synonym holds a word removed by a filter placed before it (a stop word). Check the order of the filters.

**Problem**: the analyzer does not apply to the search
→ You query another field, or the index was created without the mapping: `GET /dishes/_mapping`.
