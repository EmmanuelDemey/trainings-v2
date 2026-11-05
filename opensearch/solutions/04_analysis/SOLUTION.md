# Workshop 4 — Text analysis: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the workshop README, and checks each « Expected result ».

## Step 1

```json
POST /_analyze
{ "analyzer": "standard", "text": "The chef's vegetarian Hamburger and its homemade fries" }
```

**Expected result**:

```json
{
  "tokens": [
    { "token": "the" }, { "token": "chef's" }, { "token": "vegetarian" }, { "token": "hamburger" },
    { "token": "and" }, { "token": "its" }, { "token": "homemade" }, { "token": "fries" }
  ]
}
```

No: the indexed term is `chef's`, possessive included.

## Step 2

```json
POST /_analyze
{ "analyzer": "english", "text": "The chef's vegetarian Hamburger and its homemade fries" }
```

**Expected result**:

```json
{
  "tokens": [
    { "token": "chef" }, { "token": "vegetarian" }, { "token": "hamburg" },
    { "token": "it" }, { "token": "homemad" }, { "token": "fri" }
  ]
}
```

The possessive and the stop words (`the`, `and`) are gone, the words are reduced
to their stem (`its` → `it`: the stemmer does not know it is a stop word). "burger"
still finds nothing: `burger` ≠ `hamburg`. It takes synonyms.

## Step 3

```json
POST /_analyze
{
  "char_filter": ["html_strip"],
  "tokenizer": "standard",
  "filter": ["lowercase", "asciifolding"],
  "text": "<p>Crème brûlée</p>"
}
```

**Expected result**:

```json
{ "tokens": [ { "token": "creme" }, { "token": "brulee" } ] }
```

## Step 4

```json
PUT /dishes
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "filter": {
        "en_possessive": { "type": "stemmer", "language": "possessive_english" },
        "en_stop":       { "type": "stop", "stopwords": "_english_" },
        "en_synonyms":   { "type": "synonym", "synonyms": ["burger, hamburger", "fries, french fries"] }
      },
      "analyzer": {
        "dish_en": {
          "type": "custom",
          "char_filter": ["html_strip"],
          "tokenizer": "standard",
          "filter": ["lowercase", "en_possessive", "en_stop", "en_synonyms", "asciifolding"]
        }
      }
    }
  },
  "mappings": { "properties": { "dish": { "type": "text", "analyzer": "dish_en" } } }
}

POST /dishes/_analyze
{ "analyzer": "dish_en", "text": "<b>The Chef's</b> vegetarian Hamburger and its fries" }
```

**Expected result**:

```json
{
  "tokens": [
    { "token": "chef" }, { "token": "vegetarian" },
    { "token": "hamburger" }, { "token": "burger", "type": "SYNONYM" },
    { "token": "its" }, { "token": "fries" }, { "token": "french", "type": "SYNONYM" }
  ]
}
```

`its` stays: it is not in the `_english_` stop word list.

## Step 5

```json
POST /dishes/_bulk?refresh=true
{ "index": { "_id": "1" } }
{ "dish": "<p>The chef's vegetarian Hamburger and its fries</p>" }
{ "index": { "_id": "2" } }
{ "dish": "<p>Crème brûlée with vanilla</p>" }
{ "index": { "_id": "3" } }
{ "dish": "<p>Beef burger, French fries</p>" }

GET /dishes/_search
{ "query": { "match": { "dish": "burger" } }, "_source": false }
```

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [ { "_id": "1" }, { "_id": "3" } ]
  }
}
```

```json
GET /dishes/_search
{ "query": { "match": { "dish": "creme brulee" } }, "_source": false }
```

**Expected result**:

```json
{ "hits": { "total": { "value": 1 }, "hits": [ { "_id": "2" } ] } }
```

An accented synonym `crème, custard` works: when `synonym` runs, the text still
has its accents (`asciifolding` comes after). The trap is the other way round: a
synonym written **without** accents (`creme, custard`) never matches. Rule: write
the synonyms as the text is **at that point** of the chain.
