# Workshop 6 — Aggregations

> Use Elasticsearch aggregations to compute statistics and analyse data without fetching every document.

**Topic**: General concepts — Aggregations

## Context

The analytics team wants statistics on the blog posts: average views, posts per author, how publishing evolves over time, and how authors compare. You write the requests that answer them.

Each step states **what** to compute, not **how**: find the right aggregation in the documentation, try it, read the response, adjust. The expected result lets you check your own answer. Hints are folded — open them only once you are stuck.

## Setup

This workshop stands on its own. Create the `blog_posts` index and its data before starting:

```json
DELETE /blog_posts

PUT /blog_posts
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "analyzer": {
        "english_analyzer": {
          "type": "english"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "english_analyzer",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "content": { "type": "text", "analyzer": "english_analyzer" },
      "author": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "published_date": { "type": "date", "format": "yyyy-MM-dd" },
      "views": { "type": "integer" },
      "rating": { "type": "float" },
      "author_location": { "type": "geo_point" }
    }
  }
}

POST /blog_posts/_doc/1
{
  "title": "Getting Started with Elasticsearch",
  "content": "Elasticsearch is a distributed search engine built on Lucene",
  "author": "Jean Dupont",
  "tags": ["elasticsearch", "search", "tutorial"],
  "published_date": "2023-10-15",
  "views": 1250,
  "rating": 4.5,
  "author_location": { "lat": 48.8566, "lon": 2.3522 }
}

POST /blog_posts/_doc/2
{
  "title": "Tuning Elasticsearch Performance",
  "content": "Best practices to get the most out of your cluster",
  "author": "Marie Martin",
  "tags": ["elasticsearch", "performance", "optimization"],
  "published_date": "2023-11-01",
  "views": 890,
  "rating": 4.8,
  "author_location": { "lat": 45.764, "lon": 4.8357 }
}

POST /blog_posts/_doc/3
{
  "title": "Security in Elasticsearch 8.x",
  "content": "Security is enabled by default since Elasticsearch 8",
  "author": "Jean Dupont",
  "tags": ["elasticsearch", "security", "tutorial"],
  "published_date": "2023-11-10",
  "views": 2100,
  "rating": 4.9,
  "author_location": { "lat": 48.8566, "lon": 2.3522 }
}

POST /blog_posts/_doc/4
{
  "title": "An unmapped field",
  "content": "Testing dynamic mapping",
  "author": "Test User",
  "tags": ["test"],
  "published_date": "2023-11-11",
  "views": 0,
  "rating": 3.0,
  "author_location": { "lat": 48.0, "lon": 2.0 }
}
```

## Exercises

All the requests below go to `GET /blog_posts/_search`. You want statistics, not documents: make the response hold **no hits**.

Reference: [Aggregations](https://www.elastic.co/docs/explore-analyze/query-filter/aggregations).

### Step 1: Metrics — statistics on the views

In **a single request**, compute:

- `views_stats`: the count, min, max, average and sum of `views`, all at once;
- `avg_views`: the average of `views`, on its own;
- `max_views`: the maximum of `views`, on its own.

<details>
<summary>Hint</summary>

Look at the [metrics aggregations](https://www.elastic.co/docs/reference/aggregations/metrics): one of them returns the five values together. Several aggregations can sit side by side under the same `aggs` object, each under its own name.

</details>

**Expected result**:

```json
{
  "hits": { "hits": [] },
  "aggregations": {
    "views_stats": {
      "count": 4,
      "min": 0,
      "max": 2100,
      "avg": 1060,
      "sum": 4240
    },
    "avg_views": { "value": 1060 },
    "max_views": { "value": 2100 }
  }
}
```

**Question**: why can you aggregate on `author` but not on `title`? What would you aggregate on to group by title?

### Step 2: Buckets — posts per author

Name the aggregation `posts_per_author`: one bucket per author, with the number of posts each one wrote.

<details>
<summary>Hint</summary>

A [bucket aggregation](https://www.elastic.co/docs/reference/aggregations/bucket) groups documents by the distinct values of a field. `author` is a `keyword`: it can be grouped on as is.

</details>

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

**Question**: in which order do the buckets come back? How would you sort them by author name instead?

### Step 3: Buckets over time — posts per month

Name the aggregation `posts_per_month`: one bucket per calendar month of `published_date`, its key shown as `2023-10`.

<details>
<summary>Hint</summary>

There is a histogram made for dates. Read the difference between `calendar_interval` and `fixed_interval`, and look at its `format` parameter for the `key_as_string`.

</details>

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

**Try**: ask for one bucket per week instead. What happens to the weeks without any post?

### Step 4: Nested aggregations — statistics per author

Name the aggregation `stats_per_author`: for each author, compute `avg_views` (average views), `avg_rating` (average rating) and `total_views` (sum of views).

<details>
<summary>Hint</summary>

A bucket aggregation can hold its own `aggs`: they are then computed once per bucket, on the documents of that bucket only.

</details>

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

**Question**: why is the average rating of Jean Dupont `4.700000047683716` rather than `4.7`? Look at the mapping of `rating`.

**Try**: sort the authors by their total views, highest first.

### Step 5: Pipeline — the average of the averages

Keep the `stats_per_author` buckets with their `avg_views`, and add next to them an aggregation `avg_of_avg_views`: the average of the per-author averages.

<details>
<summary>Hint</summary>

A [pipeline aggregation](https://www.elastic.co/docs/reference/aggregations/pipeline) works on the output of other aggregations, not on documents. It points at them with a `buckets_path`, whose syntax is `parent>child`.

</details>

**Expected result**:

```json
{
  "aggregations": {
    "avg_of_avg_views": { "value": 855 }
  }
}
```

**Question**: the overall average of step 1 was `1060`. Why is this one different? Which of the two answers « how many views does an author get on average »?

## Success criteria

- No hits come back, only aggregations
- Stats of the views computed in one aggregation
- Post count per author, and per month
- Average views, average rating and total views per author
- Average of the per-author averages computed by a pipeline aggregation

## Troubleshooting

**Problem**: `Fielddata is disabled on [title] in [blog_posts]`
→ A `text` field is analysed, so it cannot be aggregated on. Look at the mapping: is there a sub-field that can?

**Problem**: empty aggregation results
→ Check that the documents are there: `GET /blog_posts/_count`

**Problem**: `No aggregation found for path [...]` on a pipeline aggregation
→ The `buckets_path` must name the bucket aggregation, then `>`, then its sub-aggregation, exactly as you named them.
