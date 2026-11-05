# Workshop 6 — Advanced search: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the workshop README, and checks each « Expected result ».

## Step 1

```json
GET /restaurants/_search
{
  "size": 4,
  "sort": [ { "price": "asc" }, { "name.keyword": "asc" } ],
  "_source": ["name", "price"]
}
```

The last hit carries `"sort": [18, "Pizzeria Napoli"]`.

```json
GET /restaurants/_search
{
  "size": 4,
  "sort": [ { "price": "asc" }, { "name.keyword": "asc" } ],
  "search_after": [18, "Pizzeria Napoli"],
  "_source": ["name", "price"]
}
```

**Expected result**:

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

Without a second criterion, two restaurants at the same price have no guaranteed order:
`search_after` would skip or repeat one of them. The second criterion must be unique.

## Step 2

```json
GET /restaurants/_search
{
  "query": { "match": { "description": "grilled" } },
  "highlight": {
    "pre_tags": ["<em>"],
    "post_tags": ["</em>"],
    "fields": { "description": {} }
  },
  "_source": false
}
```

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

## Step 3

```json
PUT /restaurant_names
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": { "properties": { "suggest": { "type": "completion" } } }
}

POST /restaurant_names/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "suggest": "Le Bouchon Lyonnais" }
{ "index": { "_id": "5" } }
{ "suggest": "Le Vieux Port" }
{ "index": { "_id": "4" } }
{ "suggest": "La Trattoria" }

GET /restaurant_names/_search
{
  "suggest": {
    "names": { "prefix": "le", "completion": { "field": "suggest" } }
  }
}
```

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

## Step 4

```json
GET /restaurants/_search
{
  "query": {
    "bool": {
      "filter": {
        "geo_distance": { "distance": "5km", "location": { "lat": 48.8584, "lon": 2.2945 } }
      }
    }
  },
  "sort": [
    { "_geo_distance": { "location": { "lat": 48.8584, "lon": 2.2945 }, "order": "asc", "unit": "km" } }
  ],
  "_source": ["name"]
}
```

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

The distance is the `sort` value of each hit, in km.

## Step 5

```json
PUT /alerts
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "query":   { "type": "percolator" },
      "cuisine": { "type": "keyword" },
      "city":    { "type": "keyword" },
      "price":   { "type": "integer" }
    }
  }
}

PUT /alerts/_doc/japanese-lyon
{ "query": { "bool": { "filter": [ { "term": { "cuisine": "japanese" } }, { "term": { "city": "Lyon" } } ] } } }

PUT /alerts/_doc/budget?refresh=true
{ "query": { "range": { "price": { "lt": 20 } } } }

GET /alerts/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": { "name": "Udon Lyon", "cuisine": "japanese", "city": "Lyon", "price": 15 }
    }
  }
}
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "japanese-lyon" }, { "_id": "budget" } ]
  }
}
```
