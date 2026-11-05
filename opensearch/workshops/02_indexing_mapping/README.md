# Workshop 2 — Indexing and mapping

> Let OpenSearch guess a mapping and see where it goes wrong, write the right one, load the data with `_bulk`, then fix a field without interrupting reads.

**Duration**: 30 min · **Chapter**: 4 — Indexing and mapping

## Context

An online bookshop wants a search engine on its catalogue. Each book has a title, an author, an ISBN, a price, a publication date, a page count and tags. Before indexing thousands of books, you settle the schema.

## Setup

This workshop is self-contained. Delete whatever a previous attempt may have left:

```json
DELETE /books_guess
DELETE /books_v1
DELETE /books_v2
```

The three books of the workshop:

```text
1  { "title": "The Little Prince", "author": "Antoine de Saint-Exupéry", "isbn": "9782070612758", "price": 7.5,  "published": "1943-04-06", "pages": 96,  "tags": ["tale", "children"] }
2  { "title": "The Stranger",      "author": "Albert Camus",             "isbn": "9782070360024", "price": 6.9,  "published": "1942-05-19", "pages": 184, "tags": ["novel", "absurdism"] }
3  { "title": "Germinal",          "author": "Émile Zola",               "isbn": "9782253004226", "price": 8.2,  "published": "1885-03-01", "pages": 592, "tags": ["novel", "naturalism"] }
```

Reference: [Mappings and field types](https://docs.opensearch.org/latest/field-types/).

## Exercises

### Step 1: The guessed mapping

Index book 1, with the `_id` `1`, into a `books_guess` index that does not exist yet. Display the mapping OpenSearch created.

<details>
<summary>Hint</summary>

`PUT /books_guess/_doc/1` creates the index along the way. Then `GET /books_guess/_mapping`.

</details>

**Expected result** (an excerpt of the mapping):

```json
{
  "books_guess": {
    "mappings": {
      "properties": {
        "isbn": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
        "pages": { "type": "long" },
        "price": { "type": "float" },
        "published": { "type": "date" }
      }
    }
  }
}
```

**Question**: for each field, does the guessed type suit you? What does an `isbn` as `text` + `keyword` cost?

### Step 2: The first document decides

Index into `books_guess`, with the `_id` `2`, a book whose `price` is `"out of print"`.

<details>
<summary>Hint</summary>

The type of a field is set by the first document.

</details>

**Expected result**: a `mapper_parsing_exception` error.

### Step 3: The explicit mapping

Create `books_v1`, 1 shard and 0 replicas, with a mapping that **rejects** any unknown field and where:

- `title` can be searched as full text **and** sorted;
- `author` can be searched as full text;
- `isbn` and `tags` are exact values;
- `price` is a decimal number, `pages` an integer, `published` a date.

<details>
<summary>Hint</summary>

`"dynamic": "strict"` at the `mappings` level. A `fields` multi-field for `title`.

</details>

**Expected result**:

```json
{ "acknowledged": true, "index": "books_v1" }
```

### Step 4: Bulk loading

Index the three books into `books_v1` in **a single** request, with the `_id`s `1`, `2` and `3`, and make them searchable immediately. Then count the documents.

<details>
<summary>Hint</summary>

`POST /books_v1/_bulk?refresh=true`: a `{ "index": { "_id": "…" } }` line, then a document line. Counting: `_count`.

</details>

**Expected result** (the count):

```json
{ "count": 3 }
```

**Try it**: index a document with an extra `editor` field. What does OpenSearch answer?

### Step 5: Fixing a type

The team wants to aggregate on the **author**. Impossible on a plain `text` — and you cannot change the type of an existing field. Create `books_v2`, same mapping, but `author` gets a `keyword` sub-field. Copy the documents of `books_v1` into it, then point the `books` alias to `books_v2`. Finally, search Camus's books through the alias.

<details>
<summary>Hint</summary>

`POST /_reindex`, then `POST /_aliases` with an `add` action. A `match` on `author`, querying `/books/_search`.

</details>

**Expected result** (the search):

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [ { "_index": "books_v2", "_id": "2" } ]
  }
}
```

**Question**: tomorrow, a `books_v3`. How do you switch the alias **without** any moment where it points to nothing?

## Success criteria

- You can read a mapping, and spot a wrongly guessed type
- An index in `dynamic: strict` rejects unexpected fields
- The documents are loaded with `_bulk`
- A type change goes through a new index, `_reindex` and an alias

## Going further

- Create a `books-*` **index template** carrying this mapping, then a `books-2026` index: check that it inherits it.
- Change a price with `_update`, then read the document again: what is `_version`?
- Replay the `_bulk` with the `create` action instead of `index`: what does `items` contain?

## Troubleshooting

**Problem**: `strict_dynamic_mapping_exception`
→ Expected in step 4 with `editor`. Elsewhere: a field of the document is not in the mapping — a typo?

**Problem**: `The bulk request must be terminated by a newline`
→ A `_bulk` body ends with a newline. In Dev Tools, leave an empty line at the end.

**Problem**: `resource_already_exists_exception`
→ The index already exists: run the setup again.
