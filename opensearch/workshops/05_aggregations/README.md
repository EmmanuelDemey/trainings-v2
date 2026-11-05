# Workshop 5 — Aggregations

> Answer the questions of the guide's editor-in-chief: how many, on average, per city, per cuisine, per year — without ever reading a document.

**Duration**: 30 min · **Chapter**: 7 — Aggregations

## Context

The guide is preparing its yearly edition. The editor-in-chief wants figures: the average price, the breakdown per city, the best-rated cuisine, the openings per year. Each question is an aggregation.

## Setup

This workshop stands on its own. Create the `restaurants` index and its twelve documents:

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

Reference: [Aggregations](https://docs.opensearch.org/latest/aggregations/).

## Exercises

### Step 1: The rating statistics

In a single aggregation, get the count, the minimum, the maximum, the average and the sum of the ratings (`rating`). No document in the response.

<details>
<summary>Hint</summary>

`"size": 0`, and the `stats` aggregation.

</details>

**Expected result**:

```json
{ "aggregations": { "ratings": { "count": 12 } } }
```

**Question**: the average is `4.2000…` with many decimals. Why not a round `4.2`? (Look at the type of `rating`.)

### Step 2: How many cuisines?

Count the number of **distinct cuisines**.

<details>
<summary>Hint</summary>

`cardinality`.

</details>

**Expected result**:

```json
{ "aggregations": { "cuisines": { "value": 8 } } }
```

### Step 3: Per city

The number of restaurants per city, and in **each** city, the average price.

<details>
<summary>Hint</summary>

`terms` on `city`, and an `avg` sub-aggregation on `price`.

</details>

**Expected result**:

```json
{
  "aggregations": {
    "by_city": {
      "buckets": [
        { "key": "Paris", "doc_count": 5, "avg_price": { "value": 45.2 } },
        { "key": "Lyon", "doc_count": 4, "avg_price": { "value": 21.75 } },
        { "key": "Marseille", "doc_count": 3, "avg_price": { "value": 31.666666666666668 } }
      ]
    }
  }
}
```

**Question**: does the average price of Paris mean that Paris is expensive? Add a `percentiles` aggregation to judge.

### Step 4: The cuisines, from best to worst rated

The cuisines, sorted by **descending average rating**.

<details>
<summary>Hint</summary>

The `order` parameter of a `terms` accepts the name of a sub-aggregation.

</details>

**Expected result** (the first buckets):

```json
{
  "aggregations": {
    "by_cuisine": {
      "buckets": [
        { "key": "fine dining" },
        { "key": "seafood" }
      ]
    }
  }
}
```

### Step 5: The price ranges

Split the restaurants into three ranges: under €20, from €20 to €50, €50 and above. Name them `budget`, `mid-range`, `high-end`.

<details>
<summary>Hint</summary>

`range`, with a `key` per range. `to` is excluded, `from` included.

</details>

**Expected result**:

```json
{
  "aggregations": {
    "price_ranges": {
      "buckets": [
        { "key": "budget", "doc_count": 4 },
        { "key": "mid-range", "doc_count": 6 },
        { "key": "high-end", "doc_count": 2 }
      ]
    }
  }
}
```

### Step 6: The openings per year, in Paris

The number of **Paris** restaurants opened each year, the years without an opening left out.

<details>
<summary>Hint</summary>

A `query` for Paris, and a `date_histogram` with `calendar_interval`, `format` and `min_doc_count`.

</details>

**Expected result**:

```json
{
  "aggregations": {
    "openings": {
      "buckets": [
        { "key_as_string": "2011", "doc_count": 1 },
        { "key_as_string": "2014", "doc_count": 1 },
        { "key_as_string": "2018", "doc_count": 1 },
        { "key_as_string": "2020", "doc_count": 1 },
        { "key_as_string": "2021", "doc_count": 1 }
      ]
    }
  }
}
```

### Step 7: The most expensive city

Take step 3 again, and add a **pipeline** aggregation that gives the city with the highest average price.

<details>
<summary>Hint</summary>

`max_bucket`, with `"buckets_path": "by_city>avg_price"` — at the same level as `by_city`.

</details>

**Expected result**:

```json
{ "aggregations": { "most_expensive_city": { "keys": ["Paris"], "value": 45.2 } } }
```

## Success criteria

- `size: 0` when only the aggregations matter
- Metrics, buckets and sub-aggregations combined in one request
- An aggregation narrowed by a `query`
- A pipeline aggregation reads other aggregations through `buckets_path`

## Going further

- The best-rated restaurant **of each city**: a `top_hits` sub-aggregation (`size: 1`, sorted by `rating`).
- The restaurants less than 5 km, 5 to 50 km, more than 50 km away from the centre of Lyon (45.7640, 4.8357): `geo_distance`.
- The running total of openings per year: `cumulative_sum` inside the `date_histogram`.

## Troubleshooting

**Problem**: `Text fields are not optimised for operations that require per-document field data`
→ You are aggregating on a `text` field. Use a `keyword` one (`name.keyword`).

**Problem**: `buckets_path must reference either a number value or a single value numeric metric aggregation`
→ The path points to a multi-value or misnamed aggregation: `parent_agg>child_agg`.
