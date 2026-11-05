# Workshop 6 — Advanced search

> The features that make a real results page: sorting and pagination, highlighting, autocomplete, "near me", and alerts that fire when a new restaurant matches.

**Duration**: 35 min · **Chapter**: 8 — Advanced search features

## Context

The guide's mobile app needs four screens: a sorted and paginated list, results where the searched word stands out, a search box that completes what you type, and a "near me" map. And the users want to be **alerted** when a restaurant that suits them opens.

## Setup

This workshop stands on its own. Create the `restaurants` index and its twelve documents:

```json
DELETE /restaurant_names
DELETE /alerts
```

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

Reference: [Search features](https://docs.opensearch.org/latest/search-plugins/searching-data/).

## Exercises

### Step 1: Sort and paginate

The restaurants from the **cheapest to the most expensive**, by name at equal price, **4 per page**. Show only the name and the price. Then ask for the **next page** without using `from`.

<details>
<summary>Hint</summary>

`sort` on `price` then `name.keyword`. Each hit carries a `sort` array: pass the one of the **last** hit to `search_after`.

</details>

**Expected result** (page 2):

```json
{
  "hits": {
    "hits": [
      { "_id": "10", "sort": [20, "Taj Mahal"] },
      { "_id": "4", "sort": [22, "La Trattoria"] },
      { "_id": "9", "sort": [25, "La Cantine Provençale"] },
      { "_id": "7", "sort": [28, "Chez Mamie"] }
    ]
  }
}
```

**Question**: why is a second sort criterion (`name.keyword`) essential with `search_after`?

### Step 2: Highlight

Search for "grilled" in the description, and wrap the matched terms in `<em>` … `</em>`. No `_source`.

<details>
<summary>Hint</summary>

A `highlight` block with `pre_tags`, `post_tags` and `fields`.

</details>

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_id": "8", "highlight": { "description": ["Tonkotsu broth ramen and <em>grilled</em> gyoza."] } },
      { "_id": "5", "highlight": { "description": ["Bouillabaisse, <em>grilled</em> fishes and seafood platter facing the harbour."] } }
    ]
  }
}
```

### Step 3: Autocomplete

Create a `restaurant_names` index (1 shard, 0 replicas) with a `suggest` field of type `completion`. Index three names: "Le Bouchon Lyonnais", "Le Vieux Port", "La Trattoria", with the `_id`s `1`, `5` and `4`. Then ask for the completions of "le".

<details>
<summary>Hint</summary>

The mapping `{ "suggest": { "type": "completion" } }`, documents `{ "suggest": "Le Vieux Port" }`, then a `suggest` block with `prefix` and `completion.field`.

</details>

**Expected result**:

```json
{
  "suggest": {
    "names": [
      { "text": "le", "options": [ { "text": "Le Bouchon Lyonnais" }, { "text": "Le Vieux Port" } ] }
    ]
  }
}
```

**Try it**: add `"fuzzy": { "fuzziness": 1 }` and type "la v".

### Step 4: Near me

You are at the Eiffel Tower (lat `48.8584`, lon `2.2945`). Find the restaurants less than **5 km** away, from the closest to the farthest, with the distance in km. Show only the name.

<details>
<summary>Hint</summary>

A `geo_distance` inside a `filter`, and a `_geo_distance` sort with `unit`.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 4 },
    "hits": [
      { "_id": "3", "_source": { "name": "Sushi Zen" } },
      { "_id": "6", "_source": { "name": "Burger Factory" } },
      { "_id": "2", "_source": { "name": "Pizzeria Napoli" } },
      { "_id": "7", "_source": { "name": "Chez Mamie" } }
    ]
  }
}
```

**Question**: where do you read the distance of each restaurant in the response?

### Step 5: Alerts, through percolation

One user wants to be told when a **Japanese** restaurant opens in **Lyon**, another one when a restaurant **under €20** does. Create an `alerts` index (1 shard, 0 replicas) that stores these two queries, with the `_id`s `japanese-lyon` and `budget`. Then submit the new restaurant to it:

```text
{ "name": "Udon Lyon", "cuisine": "japanese", "city": "Lyon", "price": 15 }
```

<details>
<summary>Hint</summary>

The mapping declares a `query` field of type `percolator`, **and** the fields the queries look at (`cuisine`, `city`, `price`). Then a `percolate` search with `document`.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "japanese-lyon" }, { "_id": "budget" } ]
  }
}
```

**Try it**: submit a Japanese restaurant in Paris, at €30.

## Success criteria

- A stable pagination with `sort` and `search_after`
- The matched terms are highlighted
- The autocomplete relies on a `completion` field
- A geographic search filters and sorts by distance
- Stored queries are replayed against an incoming document

## Going further

- Open a **Point in Time** (`POST /restaurants/_search/point_in_time?keep_alive=1m`) and paginate with it: index a new restaurant between two pages — does it show up?
- A `term` suggester on `name`: which correction does it offer for "trattorai"?
- A `geo_distance` aggregation: how many restaurants at 0–5, 5–100, 100+ km from the Eiffel Tower?

## Troubleshooting

**Problem**: `search_after` returns the same page
→ The array you pass must be the one of the **last** hit of the previous page, with the **same** `sort`.

**Problem**: `field [suggest] is not a completion suggest field`
→ The index was created without the mapping: delete it and create it again.

**Problem**: `percolate` finds nothing
→ The fields the stored queries look at must be **in the mapping** of the `alerts` index, with the same types.
