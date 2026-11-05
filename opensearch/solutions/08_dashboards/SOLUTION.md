# Workshop 8 — OpenSearch Dashboards: solution

For the trainer. Not published. This workshop is done in the UI: nothing to replay in the CI.

## Step 1

`response.keyword` is aggregatable: a `keyword` has doc values. `response`,
analyzed, is not — unless you enable `fielddata`, which you should never do.

## Step 2

- DQL: `response:503`
- Filter: `NOT machine.os.keyword: win xp`
- **Inspect** → **Request** on `bytes > 10000 and extension:css`: a `bool` with
  a `range` on `bytes` and a `match` on `extension`, in a `filter` alongside the
  `range` on `timestamp` (the time range).

## Step 4

A `date_histogram` on `timestamp` (*auto* interval), and as a sub-aggregation a
`terms` on `response.keyword`. The *Count* is the `doc_count` of each bucket.

## Step 6

No: a map requires a `geo_point` (or `geo_shape`). Two `lat`/`lon` fields as
`float`, or a string, allow neither a geographic aggregation nor a documents
layer.

## Step 7

1. The click creates a `machine.os.keyword: osx` filter, applied to **every**
   panel, the saved search and the map included.
2. The selection on the histogram changes the global **time range** of the dashboard.

## Step 8

The `.ndjson` holds one object per line: the dashboard, each visualization, the
search, the map and the index pattern, with their references. It can be imported
into another cluster (**Saved objects** → **Import**), provided the index exists.
