# Workshop 2 — Documents and bulk

> Manage the life of documents (create, update, delete), and index in bulk with the `_bulk` API.

**Topic**: Indexing — Documents and bulk

## Context

An online bookshop keeps its catalog in Elasticsearch, in the `books-2025` index. You handle its documents one by one, then load the catalog in bulk.

Each step states **what** to do, not **how**: find the API in the documentation, try it, read the response, adjust. The expected result lets you check your own answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. If a previous attempt left `books-*` indices behind, delete them:

<!-- ci: skip -->
```json
DELETE /books-*
```

Reference: [Document APIs](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-document).

## Part A: The life of a document

### Step 1: Create the index

Create `books-2025`, with one primary shard and no replica.

### Step 2: Index a document with an ID you choose

Index this book in `books-2025`, **with the ID `1`**:

```text
{ "title": "The Little Prince", "author": "Antoine de Saint-Exupéry", "year": 1943, "stock": 3 }
```

<details>
<summary>Hint</summary>

The [index API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-index): the ID goes in the path, after `_doc`. Which HTTP method fits a resource whose URL you know?

</details>

**Expected result**:

```json
{
  "_index": "books-2025",
  "_id": "1",
  "_version": 1,
  "result": "created"
}
```

### Step 3: Index a document without an ID

Index this book and **let Elasticsearch generate its ID**:

```text
{ "title": "The Stranger", "author": "Albert Camus", "year": 1942, "stock": 5 }
```

<details>
<summary>Hint</summary>

Same API, no ID in the path — and so not the same HTTP method as step 2.

</details>

**Expected result**: `"result": "created"`, and an `_id` you did not choose.

**Question**: when would you rather use a business ID (an ISBN…) than a generated one?

### Step 4: Read a document

Read back the document `1`.

**Expected result**:

```json
{
  "_id": "1",
  "found": true,
  "_source": { "title": "The Little Prince", "stock": 3 }
}
```

### Step 5: Partial update

Set the `stock` of book `1` to `2`, **sending only that field**. Read it back: the title must still be there.

<details>
<summary>Hint</summary>

The [update API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-update) merges a partial document, given under `doc`, into the stored one.

</details>

**Expected result** (the read):

```json
{
  "_version": 2,
  "_source": { "title": "The Little Prince", "stock": 2 }
}
```

### Step 6: Update with a script

One more copy was sold: **decrement** the stock of book `1` by one, without reading it first — the number sold given as a parameter. Then read back **only** its `stock`.

<details>
<summary>Hint</summary>

The update API also takes a `script`, in Painless: the document is `ctx._source`. Values are passed in `params`. A read can trim the `_source` with a query parameter.

</details>

**Expected result**:

```json
{
  "_source": { "stock": 1 }
}
```

**Question**: why pass the number sold in `params`, rather than writing it in the script?

### Step 7: Full replacement

Index book `1` again, with **only** its title: `{ "title": "The Little Prince" }`. Read it back.

**Expected result**:

```json
{
  "_version": 4,
  "_source": { "title": "The Little Prince" }
}
```

**Question**: where did `author`, `year` and `stock` go?

### Step 8: Delete a document

Delete book `1`, then try to read it.

**Expected result**: the deletion answers `"result": "deleted"`; the read, a `404` with `"found": false`.

## Part B: Bulk indexing

Reference: [the bulk API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-bulk).

### Step 9: Load the catalog

In **one request**, on `books-2025`:

- index the three books below, with their ISBN as ID;
- **create** — fail if it exists — `Germinal`, ID `9782253006329`;
- set the `stock` of `9782070360024` to `6`.

```text
9782070612758  { "title": "The Little Prince", "author": "Antoine de Saint-Exupéry", "year": 1943, "stock": 3 }
9782070360024  { "title": "The Stranger",      "author": "Albert Camus",             "year": 1942, "stock": 5 }
9782070368228  { "title": "The Plague",        "author": "Albert Camus",             "year": 1947, "stock": 2 }
9782253006329  { "title": "Germinal",          "author": "Émile Zola",               "year": 1885, "stock": 4 }
```

<details>
<summary>Hint</summary>

The body is NDJSON: one **action** line (`index`, `create`, `update`, `delete`, with its `_id`), then — except for `delete` — one line of document. Each on a single line, and the body ends with a newline. `?refresh=true` makes the result searchable at once.

</details>

**Expected result**:

```json
{
  "errors": false,
  "items": [
    { "index": { "_id": "9782070612758", "status": 201 } },
    { "index": { "_id": "9782070360024", "status": 201 } },
    { "index": { "_id": "9782070368228", "status": 201 } },
    { "create": { "_id": "9782253006329", "status": 201 } },
    { "update": { "_id": "9782070360024", "status": 200 } }
  ]
}
```

### Step 10: An error does not fail the batch

In one bulk request: **create** `Germinal` again (same ID, it already exists), then index `Madame Bovary`, ID `9782253004226`:

```text
{ "title": "Madame Bovary", "author": "Gustave Flaubert", "year": 1857, "stock": 1 }
```

**Expected result**:

```json
{
  "errors": true,
  "items": [
    { "create": { "status": 409 } },
    { "index": { "status": 201 } }
  ]
}
```

**Question**: which HTTP status does the whole request answer? What must a program that sends bulk requests do when `errors` is `true`?

### Step 11: Every document

Search `books-2025` for **all** its documents. The search API comes later in the training: the query is given. Read it, run it, compare with the expected result.

<!-- ci: skip -->
```json
GET /books-2025/_search
{
  "query": { "match_all": {} }
}
```

**Expected result**:

```json
{
  "hits": { "total": { "value": 6 } }
}
```

**Question**: why 6?

## Success criteria

- You can create, read, update (partially, by script, fully) and delete a document
- A bulk of 5 actions goes through without errors, and you can read its `items` when `errors` is `true`

## Troubleshooting

**Problem**: `version_conflict_engine_exception` on a `create`
→ Expected: `create` refuses an ID that already exists. `index` overwrites.

**Problem**: the bulk answers `The bulk request must be terminated by a newline`
→ The body must end with a newline, and every document fit on **one** line.
