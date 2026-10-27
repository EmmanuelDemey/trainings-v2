# Workshop 4 — Search: Lucene, Query DSL and geo

> Query a dataset of restaurants with the Lucene syntax, then with the Query DSL: full-text, exact, geographic and boolean searches, sorting and pagination.

**Topic**: Search — Lucene, Query DSL

## Context

An online restaurant guide wants a rich search for its readers: by keyword, by city, by rating, around their position. You write the queries of the guide's search engine.

Each step states **what** to find, not **how**: look for the query in the documentation, try it, read the response, adjust. The expected result lets you check your own answer — the hits are listed by `_id`, in any order unless the step asks for one. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. Create the index and load the data:

```json
DELETE /restaurants
PUT /restaurants
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "name":        { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "description": { "type": "text", "analyzer": "english" },
      "city":        { "type": "keyword" },
      "cuisine":     { "type": "keyword" },
      "price":       { "type": "integer" },
      "rating":      { "type": "float" },
      "opened":      { "type": "date" },
      "location":    { "type": "geo_point" }
    }
  }
}

POST /restaurants/_bulk?refresh=true
{"index":{"_id":"1"}}
{"name":"Le Bouchon Lyonnais","description":"Traditional Lyon cooking, quenelles and brioche sausage","city":"Lyon","cuisine":"french","price":35,"rating":4.5,"opened":"2012-03-01","location":{"lat":45.7640,"lon":4.8357}}
{"index":{"_id":"2"}}
{"name":"Sakura","description":"Sushi and ramen prepared by a Japanese chef","city":"Paris","cuisine":"japanese","price":28,"rating":4.2,"opened":"2018-06-15","location":{"lat":48.8686,"lon":2.3330}}
{"index":{"_id":"3"}}
{"name":"La Trattoria","description":"Wood-fired pizzas and homemade pasta","city":"Paris","cuisine":"italian","price":22,"rating":3.9,"opened":"2015-09-10","location":{"lat":48.8530,"lon":2.3499}}
{"index":{"_id":"4"}}
{"name":"Chez Paul","description":"Parisian bistro, seasonal French cooking","city":"Paris","cuisine":"french","price":40,"rating":4.7,"opened":"2005-01-20","location":{"lat":48.8530,"lon":2.3700}}
{"index":{"_id":"5"}}
{"name":"Le Vieux Port","description":"Fresh fish and bouillabaisse facing the sea","city":"Marseille","cuisine":"french","price":55,"rating":4.4,"opened":"2010-05-05","location":{"lat":43.2951,"lon":5.3740}}
{"index":{"_id":"6"}}
{"name":"Pizza Napoli","description":"Authentic Neapolitan pizza, dough proofed for 48 hours","city":"Lyon","cuisine":"italian","price":18,"rating":4.1,"opened":"2020-11-02","location":{"lat":45.7578,"lon":4.8320}}
{"index":{"_id":"7"}}
{"name":"Le Comptoir du Marché","description":"Market cooking, fresh produce from local farms","city":"Lille","cuisine":"french","price":30,"rating":4.0,"opened":"2016-02-14","location":{"lat":50.6372,"lon":3.0633}}
{"index":{"_id":"8"}}
{"name":"Ramen Ya","description":"Ramen in a pork broth simmered for twelve hours","city":"Paris","cuisine":"japanese","price":16,"rating":4.3,"opened":"2021-04-01","location":{"lat":48.8662,"lon":2.3360}}
```

## Part A: The Lucene syntax

The Lucene syntax fits in the `q` parameter of the URL — handy for a quick search, and what Kibana's search bar speaks.

Reference: [Query string syntax](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax).

### Step 1: One word, in every field

Find the restaurants that mention `pizza`, anywhere, with `GET /restaurants/_search?q=…`.

<details>
<summary>Hint</summary>

Without a field name, the word is searched in all the fields.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "3" }, { "_id": "6" }]
  }
}
```

### Step 2: A given field, operators

Find the **French** restaurants of **Paris**, still with `q`.

<details>
<summary>Hint</summary>

The syntax is `field:value`. Look at the boolean operators of the syntax — and at their case.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [{ "_id": "4" }]
  }
}
```

**Try**: write the operator in lowercase. What comes back, and why?

### Step 3: A range

Find the restaurants that cost **20 or less**, still with `q`.

<details>
<summary>Hint</summary>

The syntax has inclusive ranges between square brackets, with `*` for an open bound.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "6" }, { "_id": "8" }]
  }
}
```

**Question**: why is this syntax a bad idea behind a search box open to users? (Try a range left unclosed.)

## Part B: The Query DSL — full-text searches

From now on, the query goes in the body of `GET /restaurants/_search`. Reference: [Full text queries](https://www.elastic.co/docs/reference/query-languages/query-dsl/full-text-queries).

### Step 1: The standard full-text query

Find the restaurants whose **description** speaks of `pizza`. Notice that one of them says « pizzas ».

<details>
<summary>Hint</summary>

The `match` query analyses the text you search with the analyzer of the field. Look at the mapping: which analyzer does `description` use? `_analyze` shows what it does to « pizzas ».

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "3" }, { "_id": "6" }]
  }
}
```

### Step 2: Every word, not any

Find the restaurants whose description holds **both** `ramen` **and** `broth`.

<details>
<summary>Hint</summary>

By default `match` is an **OR** between the words. One of its parameters changes that.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [{ "_id": "8" }]
  }
}
```

**Try**: without that parameter, which other restaurant comes back?

### Step 3: A phrase

Find the restaurants whose description holds `fresh produce`: these two words, side by side, in this order.

<details>
<summary>Hint</summary>

There is a variant of `match` for phrases.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [{ "_id": "7" }]
  }
}
```

**Try**: with a plain `match`, which other restaurant comes back?

### Step 4: Several fields, one boosted

Search `port` in both the **name** and the **description**, the name counting **three times** more.

<details>
<summary>Hint</summary>

One query searches several fields at once. A field can be boosted with `^`.

</details>

**Expected result**:

```json
{
  "hits": {
    "hits": [{ "_id": "5" }]
  }
}
```

### Step 5: Typos

A reader types `sushsi`. Find Sakura anyway.

<details>
<summary>Hint</summary>

Look at the `fuzziness` parameter of `match`, and its `AUTO` value.

</details>

**Expected result**:

```json
{
  "hits": {
    "hits": [{ "_id": "2" }]
  }
}
```

**Question**: how many edits is `sushsi` from `sushi`? How many does `AUTO` allow for a word of that length?

## Part C: Exact searches

Reference: [Term-level queries](https://www.elastic.co/docs/reference/query-languages/query-dsl/term-level-queries).

### Step 1: An exact value

Find the **Japanese** restaurants, with a query that does not analyse its value.

<details>
<summary>Hint</summary>

`cuisine` is a `keyword`: the exact value is what is indexed.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "2" }, { "_id": "8" }]
  }
}
```

**Question**: what does the same query return on `description` with the value `Pizzas`? Why?

### Step 2: Several exact values

Find the restaurants of **Lyon** or **Marseille**, in one condition.

<details>
<summary>Hint</summary>

The exact query has a plural form.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [{ "_id": "1" }, { "_id": "5" }, { "_id": "6" }]
  }
}
```

### Step 3: A range of dates

Find the restaurants opened **on 1 January 2018 or later**.

<details>
<summary>Hint</summary>

A range query works on dates as on numbers.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [{ "_id": "2" }, { "_id": "6" }, { "_id": "8" }]
  }
}
```

## Part D: Geographic searches

The Opéra Garnier is at `48.8719, 2.3316`. Reference: [Geo queries](https://www.elastic.co/docs/reference/query-languages/query-dsl/geo-queries).

### Step 1: Around a point

Find the restaurants **less than 2 km** from the Opéra Garnier.

<details>
<summary>Hint</summary>

A geo query takes a distance and the point it is measured from, on a `geo_point` field.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "2" }, { "_id": "8" }]
  }
}
```

### Step 2: Sort by distance

List the restaurants of **Paris**, the **closest** to the Opéra Garnier **first**, the distances in km.

<details>
<summary>Hint</summary>

This is not a query but a [sort](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/sort-search-results), on a special key for geo distances.

</details>

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_id": "2" },
      { "_id": "8" },
      { "_id": "3" },
      { "_id": "4" }
    ]
  }
}
```

The order matters here. **Question**: where does the response show each distance?

### Step 3: Inside a rectangle

Find the restaurants in the rectangle whose top-left corner is `46.5, 3.5` and bottom-right corner `43.0, 7.5` — the south-east of France.

<details>
<summary>Hint</summary>

One geo query takes the two corners of a box.

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [{ "_id": "1" }, { "_id": "5" }, { "_id": "6" }]
  }
}
```

## Part E: Boolean searches

Reference: [Boolean query](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-bool-query).

### Step 1: Combine the four clauses

A reader looks for `cooking` in the description, in **Paris or Lyon**, **40 or less**, **preferably** rated 4.5 or more, but **no Italian**.

<details>
<summary>Hint</summary>

A `bool` query has four clauses: `must`, `filter`, `should`, `must_not`. Which ones score, which ones only keep or drop documents?

</details>

**Expected result**:

```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [{ "_id": "4" }, { "_id": "1" }]
  }
}
```

**Questions**:
- Remove the « preferably » condition: does the number of hits change? Their order?
- Why put the city and the price under `filter` rather than `must`?

### Step 2: Sort, paginate, pick the fields

List the **3 best-rated** restaurants, the best first, returning only their `name` and `rating`.

<details>
<summary>Hint</summary>

Look at [paginate](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results) and at [source filtering](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/retrieve-selected-fields).

</details>

**Expected result**:

```json
{
  "hits": {
    "hits": [
      { "_id": "4", "_source": { "name": "Chez Paul", "rating": 4.7 } },
      { "_id": "1", "_source": { "name": "Le Bouchon Lyonnais", "rating": 4.5 } },
      { "_id": "5", "_source": { "name": "Le Vieux Port", "rating": 4.4 } }
    ]
  }
}
```

**Try**: fetch the next page.

## Success criteria

- You can turn a Lucene search (`q=`) into Query DSL
- You can tell full-text queries (`match`…) from exact ones (`term`, `range`…)
- The boolean search of part E returns Chez Paul and Le Bouchon Lyonnais

## Troubleshooting

**Problem**: a `term` finds nothing on a `text` field
→ The indexed text was analysed (lowercase, stems…). Use `match`, or a `keyword` field.

**Problem**: a geo query returns nothing
→ The field must be mapped as `geo_point` **before** indexing: a dynamically mapped `lat`/`lon` pair becomes two `float`s.
