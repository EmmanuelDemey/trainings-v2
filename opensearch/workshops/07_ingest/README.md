# Workshop 7 — Ingest pipelines

> Turn customer reviews received as raw CSV into structured documents: split, cast, date, classify — and keep the unreadable lines instead of losing them.

**Duration**: 30 min · **Chapter**: 9 — Ingest pipelines

## Context

The guide receives its readers' reviews through a CSV export: one line per review, `restaurant_id,author,stars,date,comment`. Indexed as is, these lines are useless: no way to filter on the stars, or to follow the reviews over time. You write the pipeline that structures them **before** indexing.

## Setup

This workshop stands on its own. Create the `reviews` index, and delete the pipeline a previous attempt may have left behind:

```json
DELETE /reviews
DELETE /_ingest/pipeline/reviews

PUT /reviews
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "restaurant_id": { "type": "keyword" },
      "author": { "type": "keyword" },
      "stars": { "type": "integer" },
      "comment": { "type": "text", "analyzer": "english" },
      "sentiment": { "type": "keyword" },
      "message": { "type": "text" },
      "error": { "type": "keyword" }
    }
  }
}
```

The four lines of the workshop, each one in a `message` field:

```text
1  3,Camille,5,12/10/2026,"Perfect fish, quick service"
2  6,Hugo,2,13/10/2026,Cold fries
3  12,Inès,4,14/10/2026,Memorable tasting menu
4  broken line
```

Reference: [Ingest pipelines](https://docs.opensearch.org/latest/ingest-pipelines/).

## Exercises

### Step 1: Split the line, without indexing anything

Test, **without creating a pipeline**, a processor that splits line 1 into `restaurant_id`, `author`, `stars`, `date` and `comment`.

<details>
<summary>Hint</summary>

`POST /_ingest/pipeline/_simulate`, with a `pipeline` and some `docs`. The [`csv`](https://docs.opensearch.org/latest/ingest-pipelines/processors/csv/) processor handles quotes. In the JSON of `docs`, a quote is written `\"`.

</details>

**Expected result**:

```json
{
  "docs": [
    {
      "doc": {
        "_source": {
          "restaurant_id": "3",
          "author": "Camille",
          "stars": "5",
          "date": "12/10/2026",
          "comment": "Perfect fish, quick service"
        }
      }
    }
  ]
}
```

**Question**: `"5"` or `5` — the mapping of `stars` says `integer`. Why convert it in the pipeline anyway? (Think of step 3.)

### Step 2: Cast, date, clean up

Add to the simulated pipeline: the conversion of `stars` to an integer, the parsing of `date` (format `dd/MM/yyyy`, Paris time) into `@timestamp`, then the removal of `message` and `date`. Simulate on line 1.

<details>
<summary>Hint</summary>

The `convert`, `date` (`formats`, `target_field`, `timezone`) and `remove` processors — the latter accepts a list of fields.

</details>

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "stars": 5, "@timestamp": "2026-10-12T00:00:00.000+02:00" } } }
  ]
}
```

### Step 3: Positive or negative

Add a `sentiment` field: `positive` for **4 stars or more**, `negative` for **2 or fewer**, nothing otherwise. Simulate on lines 1 and 2.

<details>
<summary>Hint</summary>

Two `set` processors, each with an `if` in Painless: `ctx.stars >= 4`. This is where the conversion of step 2 pays off.

</details>

**Expected result**:

```json
{
  "docs": [
    { "doc": { "_source": { "stars": 5, "sentiment": "positive" } } },
    { "doc": { "_source": { "stars": 2, "sentiment": "negative" } } }
  ]
}
```

### Step 4: Lose nothing, and save

Simulate on line 4: the pipeline fails. Add error handling that keeps the document, writing the error message into `error`. Finally, save the pipeline under the name `reviews`.

<details>
<summary>Hint</summary>

An `on_failure` block at the pipeline level, with a `set` and `{{ _ingest.on_failure_message }}`. Then `PUT /_ingest/pipeline/reviews`.

</details>

**Expected result** (the save):

```json
{ "acknowledged": true }
```

### Step 5: The default pipeline

The applications that write to `reviews` should not have to name the pipeline. Make it the **default** pipeline of the index, then index the four lines — `_id` `1` to `4` — in a single request, searchable right away. Read review `1`, then count the **positive** reviews, and the ones **in error**.

<details>
<summary>Hint</summary>

`index.default_pipeline` is a dynamic setting. A `_bulk` with `{ "message": "…" }` per document. For the errors: the `exists` query on `error`.

</details>

**Expected result** (review 1):

```json
{
  "_id": "1",
  "_source": {
    "restaurant_id": "3",
    "author": "Camille",
    "stars": 5,
    "sentiment": "positive",
    "@timestamp": "2026-10-12T00:00:00.000+02:00"
  }
}
```

**Expected result** (the two counts):

```json
{ "count": 2 }
```

```json
{ "count": 1 }
```

**Try it**: `GET /_nodes/stats/ingest?filter_path=nodes.*.ingest.pipelines.reviews` — what does it tell you?

## Success criteria

- A pipeline tested with `_simulate` before being saved
- `csv`, `convert`, `date`, `remove` and a conditional `set` structure a raw line
- An unreadable line is kept, flagged with `error`
- The index applies the pipeline by default

## Going further

- Add a `script` processor that computes the length of the comment into `comment_length`.
- Replace `csv` with `dissect`: what breaks on line 1, and why?
- Move the clean-up (`remove`) into a second pipeline called with the `pipeline` processor, and attach it as `index.final_pipeline`.

## Troubleshooting

**Problem**: `field [stars] not present as part of path [stars]`
→ Expected on line 4. Anywhere else: the `csv` did not produce `stars` — check `target_fields`.

**Problem**: `unable to parse date [12/10/2026]`
→ The format must match exactly: `dd/MM/yyyy`, `MM` for the month, `mm` for the minutes.

**Problem**: `@timestamp` missing after indexing
→ The document did not go through the pipeline: name it with `?pipeline=reviews`, or set `index.default_pipeline`.
