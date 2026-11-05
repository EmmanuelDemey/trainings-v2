# Workshop 3 — Search and relevance

> Search full text and exact values, combine the criteria of a faceted search, then bring the best restaurants to the top.

**Duration**: 30 min · **Chapter**: 5 — Search and relevance

## Context

An online restaurant guide. The user types words ("fish"), ticks filters (city, budget), and expects to see the **right** restaurants first. You write the queries behind each interaction.

## Setup

This workshop is self-contained. Create the `restaurants` index and its twelve documents:

<!-- include: ../../data/restaurants.md -->
```json
DELETE /restaurants

PUT /restaurants
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "name": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "description": { "type": "text", "analyzer": "english" },
      "cuisine": { "type": "keyword" },
      "city": { "type": "keyword" },
      "location": { "type": "geo_point" },
      "rating": { "type": "float" },
      "price": { "type": "integer" },
      "opened": { "type": "date" }
    }
  }
}

POST /restaurants/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "name": "Le Bouchon Lyonnais", "description": "Traditional Lyon cuisine: quenelles, sausage in brioche and praline tart.", "cuisine": "french", "city": "Lyon", "location": { "lat": 45.7640, "lon": 4.8357 }, "rating": 4.5, "price": 35, "opened": "2012-03-15" }
{ "index": { "_id": "2" } }
{ "name": "Pizzeria Napoli", "description": "Wood-fired pizzas and homemade fresh pasta.", "cuisine": "italian", "city": "Paris", "location": { "lat": 48.8566, "lon": 2.3522 }, "rating": 4.2, "price": 18, "opened": "2018-06-01" }
{ "index": { "_id": "3" } }
{ "name": "Sushi Zen", "description": "Sushi and sashimi prepared in front of you, fresh fish of the day.", "cuisine": "japanese", "city": "Paris", "location": { "lat": 48.8606, "lon": 2.3376 }, "rating": 4.7, "price": 40, "opened": "2020-09-10" }
{ "index": { "_id": "4" } }
{ "name": "La Trattoria", "description": "Fresh pasta, mushroom risotto and tiramisu.", "cuisine": "italian", "city": "Lyon", "location": { "lat": 45.7578, "lon": 4.8320 }, "rating": 3.9, "price": 22, "opened": "2016-11-20" }
{ "index": { "_id": "5" } }
{ "name": "Le Vieux Port", "description": "Bouillabaisse, grilled fishes and seafood platter facing the harbour.", "cuisine": "seafood", "city": "Marseille", "location": { "lat": 43.2951, "lon": 5.3740 }, "rating": 4.4, "price": 50, "opened": "2010-05-05" }
{ "index": { "_id": "6" } }
{ "name": "Burger Factory", "description": "Gourmet burgers, homemade fries and milkshakes.", "cuisine": "american", "city": "Paris", "location": { "lat": 48.8530, "lon": 2.3499 }, "rating": 3.6, "price": 15, "opened": "2021-02-14" }
{ "index": { "_id": "7" } }
{ "name": "Chez Mamie", "description": "Home-style cuisine: veal blanquette, bœuf bourguignon and tarte tatin.", "cuisine": "french", "city": "Paris", "location": { "lat": 48.8867, "lon": 2.3431 }, "rating": 4.6, "price": 28, "opened": "2014-01-08" }
{ "index": { "_id": "8" } }
{ "name": "Ramen Ya", "description": "Tonkotsu broth ramen and grilled gyoza.", "cuisine": "japanese", "city": "Lyon", "location": { "lat": 45.7676, "lon": 4.8344 }, "rating": 4.1, "price": 16, "opened": "2022-04-22" }
{ "index": { "_id": "9" } }
{ "name": "La Cantine Provençale", "description": "Provençal specialities: ratatouille, tapenade and aioli.", "cuisine": "french", "city": "Marseille", "location": { "lat": 43.2965, "lon": 5.3698 }, "rating": 4.0, "price": 25, "opened": "2019-07-01" }
{ "index": { "_id": "10" } }
{ "name": "Taj Mahal", "description": "Curry, tandoori chicken and cheese naans.", "cuisine": "indian", "city": "Marseille", "location": { "lat": 43.2990, "lon": 5.3810 }, "rating": 3.8, "price": 20, "opened": "2017-10-12" }
{ "index": { "_id": "11" } }
{ "name": "Green Bowl", "description": "Vegetarian bowls, seasonal salads and pressed juices.", "cuisine": "vegetarian", "city": "Lyon", "location": { "lat": 45.7600, "lon": 4.8400 }, "rating": 4.3, "price": 14, "opened": "2023-03-30" }
{ "index": { "_id": "12" } }
{ "name": "L'Étoile du Nord", "description": "Tasting menu, seasonal fine-dining cuisine.", "cuisine": "fine dining", "city": "Paris", "location": { "lat": 48.8800, "lon": 2.3550 }, "rating": 4.9, "price": 125, "opened": "2011-09-01" }
```
<!-- /include -->

Reference: [Query DSL](https://docs.opensearch.org/latest/query-dsl/).

## Exercises

### Step 1: Full text

Find the restaurants whose **description** mentions "fish". Don't return the `_source`.

<details>
<summary>Hint</summary>

A `match` query. `"_source": false` keeps the response short.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "3" }, { "_id": "5" } ]
  }
}
```

**Question**: restaurant 5 mentions "grilled fish**es**". Why is it found? (Read the mapping of `description` again.)

### Step 2: An exact phrase

Find the restaurants that serve "fresh pasta" — both words, **side by side and in this order**.

<details>
<summary>Hint</summary>

`match_phrase`.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "4" }, { "_id": "2" } ]
  }
}
```

### Step 3: The `term` trap

Look for the restaurant named exactly "Sushi Zen" with a `term` query on the `name` field. Then fix the query so that it finds it.

<details>
<summary>Hint</summary>

`name` is a `text`: it is indexed lowercased, word by word. Its sub-field keeps the value as is.

</details>

**Expected result** (the fixed query):

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [ { "_id": "3" } ]
  }
}
```

### Step 4: A faceted search

The user types "cuisine", ticks the cities **Paris** and **Lyon**, and a budget of **€40 at most**. Write the query: only the typed text may count in the score. Return the name only.

<details>
<summary>Hint</summary>

A `bool`: the text in `must`, the ticked boxes in `filter` (`terms`, `range`).

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [
      { "_id": "1", "_source": { "name": "Le Bouchon Lyonnais" } },
      { "_id": "7", "_source": { "name": "Chez Mamie" } }
    ]
  }
}
```

**Question**: the filters don't change the scores. How can you tell?

### Step 5: The name matters more

Search "tart" in both the name and the description, a word found in the **name** being worth **three times** more.

<details>
<summary>Hint</summary>

`multi_match`, and the `field^3` notation.

</details>

**Expected result**:

```json
{ "hits": { "total": { "value": 2 } } }
```

### Step 6: Best rated first

Search "cuisine" in the description, **multiplying** the score by the restaurant's `rating`.

<details>
<summary>Hint</summary>

`function_score` with `field_value_factor` and `"boost_mode": "multiply"`.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [
      { "_id": "12", "_source": { "name": "L'Étoile du Nord" } }
    ]
  }
}
```

**Question**: without `function_score`, which one comes first? Compare with `_explain`.

## Success criteria

- `match` for the typed text, `term` / `range` for exact values
- The yes/no criteria are in `filter`, out of the score
- You know how to boost a field (`^3`) and inject a business value into the score

## Going further

- Search "sushy" with `"fuzziness": "AUTO"`.
- Replace `field_value_factor` with a `gauss` decay on `location`: the restaurants close to the Eiffel Tower (48.8584, 2.2945) come up.
- Add `"explain": true` to a search and spot `idf`, `tf` and the field length.

## Troubleshooting

**Problem**: `term` finds nothing
→ A `term` on a `text` field compares to analyzed terms (lowercased, split). Use the `.keyword` sub-field, or `match`.

**Problem**: `failed to create query` on a `range`
→ Check the field: `price` is an `integer`, `rating` a `float`, `opened` a `date`.
