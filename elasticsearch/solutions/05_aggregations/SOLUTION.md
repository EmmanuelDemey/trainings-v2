# Workshop 5 — Aggregations: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Step 1

```json
POST /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "views_stats": { "stats": { "field": "views" } },
    "avg_views": { "avg": { "field": "views" } },
    "max_views": { "max": { "field": "views" } }
  }
}
```

**Expected result**:

```json
{
  "hits": { "hits": [] },
  "aggregations": {
    "views_stats": { "count": 4, "min": 0, "max": 2100, "avg": 1060, "sum": 4240 },
    "avg_views": { "value": 1060 },
    "max_views": { "value": 2100 }
  }
}
```

`title` is a `text` field: analysed, it has no doc values, hence the
`Fielddata is disabled` error. Aggregate on `title.keyword`.

## Step 2

```json
POST /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "posts_per_author": { "terms": { "field": "author", "size": 10 } }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "posts_per_author": {
      "buckets": [
        { "key": "Jean Dupont", "doc_count": 2 },
        { "key": "Marie Martin", "doc_count": 1 },
        { "key": "Test User", "doc_count": 1 }
      ]
    }
  }
}
```

Buckets come by `doc_count` descending; `"order": { "_key": "asc" }` sorts them
by name.

## Step 3

```json
POST /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "posts_per_month": {
      "date_histogram": {
        "field": "published_date",
        "calendar_interval": "month",
        "format": "yyyy-MM"
      }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "posts_per_month": {
      "buckets": [
        { "key_as_string": "2023-10", "doc_count": 1 },
        { "key_as_string": "2023-11", "doc_count": 3 }
      ]
    }
  }
}
```

With `"calendar_interval": "week"`, the empty weeks between the first and the
last post come back with `doc_count: 0` (`min_doc_count` is 0 by default for a
histogram).

## Step 4

```json
POST /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "stats_per_author": {
      "terms": { "field": "author", "size": 10 },
      "aggs": {
        "avg_views": { "avg": { "field": "views" } },
        "avg_rating": { "avg": { "field": "rating" } },
        "total_views": { "sum": { "field": "views" } }
      }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "stats_per_author": {
      "buckets": [
        {
          "key": "Jean Dupont",
          "doc_count": 2,
          "avg_views": { "value": 1675 },
          "avg_rating": { "value": 4.700000047683716 },
          "total_views": { "value": 3350 }
        },
        {
          "key": "Marie Martin",
          "doc_count": 1,
          "avg_views": { "value": 890 },
          "total_views": { "value": 890 }
        }
      ]
    }
  }
}
```

`rating` is a `float`: 4.5 and 4.9 are stored in single precision, then
averaged as doubles. A `scaled_float` or `double` would avoid it.

Sorted by total views: `"order": { "total_views": "desc" }` on the `terms`.

## Step 5

```json
POST /blog_posts/_search
{
  "size": 0,
  "aggs": {
    "stats_per_author": {
      "terms": { "field": "author" },
      "aggs": {
        "avg_views": { "avg": { "field": "views" } }
      }
    },
    "avg_of_avg_views": {
      "avg_bucket": { "buckets_path": "stats_per_author>avg_views" }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "avg_of_avg_views": { "value": 855 }
  }
}
```

(1675 + 890 + 0) / 3 = 855: each author weighs the same, whatever the number of
posts, while 1060 weighs each post the same. The first answers « per author ».
