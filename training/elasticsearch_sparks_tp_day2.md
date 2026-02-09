# Elasticsearch Sparks Training - Practical Exercises Day 2

## Overview

All exercises use the Kibana Dev Tools console. Access it at: `http://localhost:5601/app/dev_tools#/console`

**Shared dataset**: We continue building on the **library** dataset from Day 1 and add new datasets for aggregations and production exercises.

---

# Setup: Recreate the Library Dataset

If you cleaned up yesterday, recreate the `books` index:

```bash
PUT /books
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "title": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "author": { "type": "keyword" },
      "genre": { "type": "keyword" },
      "description": { "type": "text" },
      "published_date": { "type": "date" },
      "pages": { "type": "integer" },
      "price": { "type": "float" },
      "rating": { "type": "float" },
      "in_stock": { "type": "boolean" },
      "tags": { "type": "keyword" },
      "publisher": { "type": "keyword" },
      "language": { "type": "keyword" },
      "location": { "type": "geo_point" }
    }
  }
}

POST /_bulk
{"index":{"_index":"books","_id":"1"}}
{"title":"Elasticsearch: The Definitive Guide","author":"Clinton Gormley","genre":"technology","description":"A distributed real-time search and analytics engine. This comprehensive guide covers everything from basic concepts to advanced features for production deployments.","published_date":"2024-03-15","pages":420,"price":45.99,"rating":4.7,"in_stock":true,"tags":["search","distributed","lucene"],"publisher":"O'Reilly","language":"en","location":{"lat":37.7749,"lon":-122.4194}}
{"index":{"_index":"books","_id":"2"}}
{"title":"Learning Elastic Stack 8.0","author":"Pranav Shukla","genre":"technology","description":"Build powerful real-time data processing pipelines with the Elastic Stack. Covers Elasticsearch, Kibana, Beats, and Logstash for monitoring and analytics.","published_date":"2023-09-20","pages":380,"price":39.99,"rating":4.3,"in_stock":true,"tags":["elastic-stack","monitoring","analytics"],"publisher":"Packt","language":"en","location":{"lat":51.5074,"lon":-0.1278}}
{"index":{"_index":"books","_id":"3"}}
{"title":"Data Engineering with Apache Spark","author":"Gerard Maas","genre":"technology","description":"Learn to build scalable data pipelines using Apache Spark. Covers streaming, batch processing, and machine learning integration.","published_date":"2024-01-10","pages":520,"price":52.99,"rating":4.5,"in_stock":true,"tags":["big-data","spark","data-engineering"],"publisher":"Manning","language":"en","location":{"lat":40.7128,"lon":-74.0060}}
{"index":{"_index":"books","_id":"4"}}
{"title":"Le Petit Prince","author":"Antoine de Saint-Exupéry","genre":"fiction","description":"Un aviateur tombe en panne dans le désert du Sahara et rencontre un petit garçon venu d'une autre planète. Un conte philosophique sur l'amitié et l'essentiel.","published_date":"1943-04-06","pages":96,"price":8.99,"rating":4.9,"in_stock":true,"tags":["classic","philosophy","children"],"publisher":"Gallimard","language":"fr","location":{"lat":48.8566,"lon":2.3522}}
{"index":{"_index":"books","_id":"5"}}
{"title":"Clean Code","author":"Robert C. Martin","genre":"technology","description":"A handbook of agile software craftsmanship. Learn to write code that is easy to read, maintain, and extend. Covers naming conventions, functions, comments, and error handling.","published_date":"2008-08-01","pages":464,"price":29.99,"rating":4.6,"in_stock":true,"tags":["programming","best-practices","agile"],"publisher":"Prentice Hall","language":"en","location":{"lat":40.7128,"lon":-74.0060}}
{"index":{"_index":"books","_id":"6"}}
{"title":"Designing Data-Intensive Applications","author":"Martin Kleppmann","genre":"technology","description":"The big ideas behind reliable, scalable, and maintainable data systems. Covers distributed systems, replication, partitioning, and stream processing.","published_date":"2017-03-16","pages":616,"price":42.99,"rating":4.8,"in_stock":true,"tags":["distributed","data","architecture"],"publisher":"O'Reilly","language":"en","location":{"lat":51.5074,"lon":-0.1278}}
{"index":{"_index":"books","_id":"7"}}
{"title":"L'Étranger","author":"Albert Camus","genre":"fiction","description":"Meursault, un jeune employé de bureau à Alger, commet un meurtre absurde sur une plage. Un roman sur l'absurdité de l'existence humaine.","published_date":"1942-06-01","pages":123,"price":7.99,"rating":4.4,"in_stock":true,"tags":["classic","philosophy","existentialism"],"publisher":"Gallimard","language":"fr","location":{"lat":48.8566,"lon":2.3522}}
{"index":{"_index":"books","_id":"8"}}
{"title":"Site Reliability Engineering","author":"Betsy Beyer","genre":"technology","description":"How Google runs production systems. Covers monitoring, alerting, incident response, and capacity planning for large-scale distributed infrastructure.","published_date":"2016-03-23","pages":552,"price":48.99,"rating":4.5,"in_stock":true,"tags":["sre","devops","monitoring","production"],"publisher":"O'Reilly","language":"en","location":{"lat":37.7749,"lon":-122.4194}}
```

---

# Part 1: Routing

## Exercise 1.1: Custom Routing

**Objective**: Understand and practice custom routing for multi-tenant scenarios.

**Instructions**:

1. Create an index with required routing:
```bash
PUT /tenant-data
{
  "mappings": {
    "_routing": { "required": true },
    "properties": {
      "tenant": { "type": "keyword" },
      "message": { "type": "text" },
      "value": { "type": "float" }
    }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 0
  }
}
```

2. Index documents with routing:
```bash
POST /tenant-data/_doc?routing=tenant_A
{ "tenant": "tenant_A", "message": "Order placed for books", "value": 100.00 }

POST /tenant-data/_doc?routing=tenant_A
{ "tenant": "tenant_A", "message": "Payment received", "value": 100.00 }

POST /tenant-data/_doc?routing=tenant_B
{ "tenant": "tenant_B", "message": "Order placed for magazines", "value": 250.00 }
```

3. Try indexing without routing (should fail):
```bash
POST /tenant-data/_doc
{ "tenant": "tenant_C", "message": "This should fail" }
```

4. Search with routing (targeted shard) vs without (all shards):
```bash
# Targeted: only queries the shard containing tenant_A data
POST /tenant-data/_search?routing=tenant_A
{ "query": { "match": { "message": "order" } } }

# Fan-out: queries ALL shards
POST /tenant-data/_search
{ "query": { "match": { "message": "order" } } }
```

5. Check shard distribution:
```bash
GET /_cat/shards/tenant-data?v
```

**Challenge**: Compare the `total` shards value in both search responses. What's the difference?

> **Answer**: With routing, only 1 shard is queried (`total: 1`). Without routing, all 3 shards are queried (`total: 3`). The results are the same, but the routed query is more efficient.

---

# Part 2: Percolation

## Exercise 2.1: Building a Rule-Based Alert System

**Objective**: Use the percolator to match documents against stored queries.

**Instructions**:

1. Create a percolator index:
```bash
PUT /book-alerts
{
  "mappings": {
    "properties": {
      "query": { "type": "percolator" },
      "genre": { "type": "keyword" },
      "price": { "type": "float" },
      "title": { "type": "text" },
      "rating": { "type": "float" }
    }
  }
}
```

2. Register alert rules:
```bash
# Alert when a cheap book is added (< 10 euros)
POST /book-alerts/_doc/cheap-book
{
  "query": { "range": { "price": { "lt": 10 } } }
}

# Alert for highly-rated fiction
POST /book-alerts/_doc/top-fiction
{
  "query": {
    "bool": {
      "must": [
        { "term": { "genre": "fiction" } },
        { "range": { "rating": { "gte": 4.5 } } }
      ]
    }
  }
}

# Alert for books mentioning "distributed"
POST /book-alerts/_doc/distributed-tech
{
  "query": { "match": { "title": "distributed" } }
}
```

3. Percolate a new book that should trigger multiple alerts:
```bash
POST /book-alerts/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "title": "Introduction to Distributed Fiction",
        "genre": "fiction",
        "price": 9.99,
        "rating": 4.7
      }
    }
  }
}
```

4. Percolate a book that triggers no alerts:
```bash
POST /book-alerts/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "title": "Cooking for Beginners",
        "genre": "cooking",
        "price": 25.99,
        "rating": 3.8
      }
    }
  }
}
```

5. **Your turn**: Create a new alert rule that triggers when a book has more than 500 pages. Then percolate a document with 600 pages to verify it works.

<details>
<summary>Solution</summary>

```bash
# First, add "pages" field mapping to the percolator index
PUT /book-alerts/_mapping
{
  "properties": {
    "pages": { "type": "integer" }
  }
}

POST /book-alerts/_doc/long-book
{
  "query": { "range": { "pages": { "gt": 500 } } }
}

POST /book-alerts/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "title": "Very Long Book",
        "genre": "technology",
        "price": 59.99,
        "rating": 4.0,
        "pages": 600
      }
    }
  }
}
```
</details>

**Challenge**: How many alerts match the "Introduction to Distributed Fiction" book? Which ones and why?

> **Answer**: 3 alerts match: `cheap-book` (price 9.99 < 10), `top-fiction` (genre fiction + rating 4.7 >= 4.5), and `distributed-tech` (title contains "distributed").

---

# Part 3: Aggregations

## Exercise 3.1: Metric Aggregations

**Objective**: Analyze the `books` dataset with metric aggregations.

**Instructions**:

1. Basic metrics on books:
```bash
GET /books/_search
{
  "size": 0,
  "aggs": {
    "avg_price": { "avg": { "field": "price" } },
    "max_pages": { "max": { "field": "pages" } },
    "min_rating": { "min": { "field": "rating" } },
    "total_books": { "value_count": { "field": "price" } }
  }
}
```

2. Stats aggregation:
```bash
GET /books/_search
{
  "size": 0,
  "aggs": {
    "price_stats": { "stats": { "field": "price" } },
    "pages_stats": { "stats": { "field": "pages" } }
  }
}
```

3. Percentiles:
```bash
GET /books/_search
{
  "size": 0,
  "aggs": {
    "price_percentiles": {
      "percentiles": {
        "field": "price",
        "percents": [25, 50, 75, 90]
      }
    }
  }
}
```

4. Cardinality:
```bash
GET /books/_search
{
  "size": 0,
  "aggs": {
    "unique_publishers": { "cardinality": { "field": "publisher" } },
    "unique_genres": { "cardinality": { "field": "genre" } }
  }
}
```

**Challenge**: What is the median (50th percentile) price? How many unique publishers are there?

> **Answer**: Check the `50.0` key in `price_percentiles`. There are 4 unique publishers (O'Reilly, Packt, Manning, Gallimard, Prentice Hall = 5 actually).

---

## Exercise 3.2: Bucket Aggregations

**Objective**: Group and analyze data with bucket aggregations.

**Instructions**:

1. Group by genre with revenue:
```bash
GET /books/_search
{
  "size": 0,
  "aggs": {
    "by_genre": {
      "terms": { "field": "genre" },
      "aggs": {
        "total_price": { "sum": { "field": "price" } },
        "avg_rating": { "avg": { "field": "rating" } }
      }
    }
  }
}
```

2. Group by publisher with nested stats:
```bash
GET /books/_search
{
  "size": 0,
  "aggs": {
    "by_publisher": {
      "terms": { "field": "publisher" },
      "aggs": {
        "avg_pages": { "avg": { "field": "pages" } },
        "avg_price": { "avg": { "field": "price" } }
      }
    }
  }
}
```

3. Range aggregation on price:
```bash
GET /books/_search
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "key": "budget", "to": 15 },
          { "key": "mid-range", "from": 15, "to": 45 },
          { "key": "premium", "from": 45 }
        ]
      }
    }
  }
}
```

4. **Your turn**: Write a nested aggregation that groups by `language`, then by `genre`, showing the average `rating` for each combination.

<details>
<summary>Solution</summary>

```bash
GET /books/_search
{
  "size": 0,
  "aggs": {
    "by_language": {
      "terms": { "field": "language" },
      "aggs": {
        "by_genre": {
          "terms": { "field": "genre" },
          "aggs": {
            "avg_rating": { "avg": { "field": "rating" } }
          }
        }
      }
    }
  }
}
```
</details>

5. Filtered aggregation:
```bash
GET /books/_search
{
  "size": 0,
  "aggs": {
    "technology_only": {
      "filter": { "term": { "genre": "technology" } },
      "aggs": {
        "avg_price": { "avg": { "field": "price" } },
        "by_publisher": {
          "terms": { "field": "publisher" }
        }
      }
    }
  }
}
```

**Challenge**: Which genre has the highest average rating?

> **Answer**: Fiction, because "Le Petit Prince" has 4.9 and "L'Étranger" has 4.4, averaging 4.65. Technology books average lower due to wider range.

---

# Part 4: Multi-tenancy and Aliases

## Exercise 4.1: Index Aliases and Zero-Downtime Reindex

**Objective**: Practice aliases for seamless index management.

**Instructions**:

1. Create an alias pointing to books:
```bash
POST /_aliases
{
  "actions": [
    { "add": { "index": "books", "alias": "library" } }
  ]
}
```

2. Search via the alias:
```bash
POST /library/_search
{ "query": { "match_all": {} } }
```

3. Create filtered aliases per language:
```bash
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "books",
        "alias": "library-en",
        "filter": { "term": { "language": "en" } }
      }
    },
    {
      "add": {
        "index": "books",
        "alias": "library-fr",
        "filter": { "term": { "language": "fr" } }
      }
    }
  ]
}
```

4. Search per language through aliases:
```bash
POST /library-en/_search
{ "query": { "match_all": {} } }

POST /library-fr/_search
{ "query": { "match_all": {} } }
```

5. **Your turn**: Create a filtered alias called `library-premium` that only shows books priced above 40 euros. Then search it.

<details>
<summary>Solution</summary>

```bash
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "books",
        "alias": "library-premium",
        "filter": { "range": { "price": { "gt": 40 } } }
      }
    }
  ]
}

POST /library-premium/_search
{ "query": { "match_all": {} } }
```
</details>

**Challenge**: How many books does `library-fr` return? How many does `library-premium` return?

> **Answer**: `library-fr` returns 2 books (Le Petit Prince and L'Étranger). `library-premium` returns 4 books (those priced above 40: Elasticsearch Guide 45.99, Data Engineering 52.99, Designing Data-Intensive 42.99, SRE 48.99).

---

# Part 5: Design Patterns for Big Data

## Exercise 5.1: Time-Based Indices and Rollover

**Objective**: Practice the rollover pattern.

**Important**: Rollover does **not** happen automatically with the Rollover API - you must call it explicitly (or use ILM to automate it). The API checks the conditions and performs the rollover if they are met.

**Instructions**:

1. Create the first index with rollover alias:
```bash
PUT /app-logs-000001
{
  "aliases": {
    "app-logs-write": { "is_write_index": true },
    "app-logs-read": {}
  },
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "message": { "type": "text" }
    }
  }
}
```

2. Index 3 documents via the write alias:
```bash
POST /_bulk
{"index":{"_index":"app-logs-write"}}
{"@timestamp":"2025-01-15T10:00:00Z","level":"INFO","message":"App started"}
{"index":{"_index":"app-logs-write"}}
{"@timestamp":"2025-01-15T10:01:00Z","level":"ERROR","message":"Connection failed"}
{"index":{"_index":"app-logs-write"}}
{"@timestamp":"2025-01-15T10:02:00Z","level":"INFO","message":"Request processed"}
```

3. Try rollover with max_docs=5 (should NOT roll over yet):
```bash
POST /app-logs-write/_rollover
{
  "conditions": { "max_docs": 5 }
}
```

4. Check the response - `rolled_over` should be `false`:
```bash
GET /_cat/indices/app-logs-*?v
```

5. Now rollover with max_docs=2 (should roll over):
```bash
POST /app-logs-write/_rollover
{
  "conditions": { "max_docs": 2 }
}
```

6. Verify the rollover:
```bash
GET /_cat/indices/app-logs-*?v
GET /_aliases?filter_path=app-logs-*
```

7. Index a new document and verify it goes to the new index:
```bash
POST /app-logs-write/_doc
{ "@timestamp": "2025-01-15T10:03:00Z", "level": "WARN", "message": "High memory" }

# Search via read alias (should return all 4 docs across both indices)
POST /app-logs-read/_search
{ "sort": [{ "@timestamp": "desc" }] }
```

**Challenge**: After rollover, which index is the write index? Does the read alias still query both?

> **Answer**: `app-logs-000002` becomes the write index. The read alias queries both `app-logs-000001` and `app-logs-000002`.

---

## Exercise 5.2: Data Streams

**Objective**: Use data streams for time-series data.

**Instructions**:

1. Create an index template for data streams:
```bash
PUT /_index_template/metrics-template
{
  "index_patterns": ["metrics-*"],
  "data_stream": {},
  "template": {
    "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "host": { "type": "keyword" },
        "cpu_percent": { "type": "float" },
        "memory_percent": { "type": "float" }
      }
    }
  }
}
```

2. Index documents (data stream created automatically):
```bash
POST /metrics-servers/_doc
{ "@timestamp": "2025-01-15T10:00:00Z", "host": "server-1", "cpu_percent": 45.2, "memory_percent": 72.1 }

POST /metrics-servers/_doc
{ "@timestamp": "2025-01-15T10:01:00Z", "host": "server-2", "cpu_percent": 88.5, "memory_percent": 91.3 }

POST /metrics-servers/_doc
{ "@timestamp": "2025-01-15T10:02:00Z", "host": "server-1", "cpu_percent": 52.1, "memory_percent": 73.5 }
```

3. Check the data stream:
```bash
GET /_data_stream/metrics-servers
```

4. Aggregate per host:
```bash
GET /metrics-servers/_search
{
  "size": 0,
  "aggs": {
    "by_host": {
      "terms": { "field": "host" },
      "aggs": {
        "avg_cpu": { "avg": { "field": "cpu_percent" } },
        "max_memory": { "max": { "field": "memory_percent" } }
      }
    }
  }
}
```

**Challenge**: Can you update a document in a data stream? Why?

> **Answer**: No. Data streams are **append-only** by design (optimized for time-series). You can't update or delete individual documents. To correct data, you must use `update_by_query` or reindex.

---

# Part 6: Ingest Pipelines

## Exercise 6.1: Grok and Enrichment Pipeline

**Objective**: Create ingest pipelines to transform data before indexing.

**Instructions**:

1. Create a pipeline:
```bash
PUT /_ingest/pipeline/log-enrichment
{
  "description": "Enrich log data",
  "processors": [
    {
      "set": {
        "field": "ingested_at",
        "value": "{{{_ingest.timestamp}}}"
      }
    },
    {
      "grok": {
        "field": "message",
        "patterns": ["%{IP:client_ip} %{WORD:method} %{URIPATH:path} %{NUMBER:status:int}"],
        "ignore_failure": true
      }
    },
    {
      "set": {
        "field": "severity",
        "value": "low",
        "if": "ctx.level == 'INFO'"
      }
    },
    {
      "set": {
        "field": "severity",
        "value": "high",
        "if": "ctx.level == 'ERROR'"
      }
    }
  ]
}
```

2. Test with simulate:
```bash
POST /_ingest/pipeline/log-enrichment/_simulate
{
  "docs": [
    {
      "_source": {
        "level": "ERROR",
        "message": "192.168.1.10 GET /api/users 500"
      }
    },
    {
      "_source": {
        "level": "INFO",
        "message": "Application started successfully"
      }
    }
  ]
}
```

3. Index using the pipeline:
```bash
POST /enriched-logs/_doc?pipeline=log-enrichment
{
  "level": "ERROR",
  "message": "10.0.0.5 POST /api/orders 503",
  "@timestamp": "2025-01-15T10:00:00Z"
}

POST /enriched-logs/_doc?pipeline=log-enrichment
{
  "level": "INFO",
  "message": "Cache cleared",
  "@timestamp": "2025-01-15T10:01:00Z"
}
```

4. Verify:
```bash
GET /enriched-logs/_search
```

**Challenge**: Does grok extract `client_ip` and `status` from the first doc? What about the second (non-matching) doc?

> **Answer**: First doc: grok extracts `client_ip: "10.0.0.5"`, `method: "POST"`, `path: "/api/orders"`, `status: 503`. Second doc: grok doesn't match but `ignore_failure: true` means the doc is indexed without those fields.

---

## Exercise 6.2: Dissect Processor

**Objective**: Compare dissect (faster, simpler) with grok (regex-based).

**Instructions**:

1. Create a dissect pipeline:
```bash
PUT /_ingest/pipeline/access-log-parser
{
  "processors": [
    {
      "dissect": {
        "field": "message",
        "pattern": "%{timestamp} [%{level}] %{service} - %{detail}"
      }
    },
    {
      "date": {
        "field": "timestamp",
        "formats": ["yyyy-MM-dd HH:mm:ss"],
        "target_field": "@timestamp"
      }
    },
    {
      "remove": { "field": "timestamp" }
    }
  ]
}
```

2. Test:
```bash
POST /_ingest/pipeline/access-log-parser/_simulate
{
  "docs": [
    {
      "_source": {
        "message": "2025-01-15 10:30:45 [ERROR] payment-api - Transaction declined for user u123"
      }
    }
  ]
}
```

3. **Your turn**: Create a dissect pipeline called `csv-parser` that parses CSV lines with format `title;author;price`. Test it with `"message": "Clean Code;Robert Martin;35.99"`.

<details>
<summary>Solution</summary>

```bash
PUT /_ingest/pipeline/csv-parser
{
  "processors": [
    {
      "dissect": {
        "field": "message",
        "pattern": "%{title};%{author};%{price}"
      }
    },
    {
      "convert": {
        "field": "price",
        "type": "float"
      }
    }
  ]
}

POST /_ingest/pipeline/csv-parser/_simulate
{
  "docs": [
    { "_source": { "message": "Clean Code;Robert Martin;35.99" } }
  ]
}
```
</details>

**Challenge**: When should you use dissect instead of grok?

> **Answer**: Use dissect when the log format is fixed/predictable (delimiters are consistent). Dissect is faster because it doesn't use regex. Use grok when the format is variable or requires regex matching (e.g., optional fields, variable-length tokens).

---

# Part 7: ILM and Shard Allocation

## Exercise 7.1: ILM Policy

**Objective**: Create and apply an ILM policy.

**Instructions**:

1. Create an ILM policy with a low rollover threshold (for testing):
```bash
PUT /_ilm/policy/logs-lifecycle
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_docs": 5
          },
          "set_priority": { "priority": 100 }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": { "delete": {} }
      }
    }
  }
}
```

2. Create a template using the policy:
```bash
PUT /_index_template/ilm-logs-template
{
  "index_patterns": ["ilm-logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "index.lifecycle.name": "logs-lifecycle",
      "index.lifecycle.rollover_alias": "ilm-logs-write"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "message": { "type": "text" },
        "level": { "type": "keyword" }
      }
    }
  }
}
```

3. Create the initial index:
```bash
PUT /ilm-logs-000001
{
  "aliases": {
    "ilm-logs-write": { "is_write_index": true },
    "ilm-logs-read": {}
  }
}
```

4. Index 6 documents (exceeds the max_docs=5 threshold):
```bash
POST /_bulk
{"index":{"_index":"ilm-logs-write"}}
{"@timestamp":"2025-01-15T10:00:00Z","message":"Log 1","level":"INFO"}
{"index":{"_index":"ilm-logs-write"}}
{"@timestamp":"2025-01-15T10:00:01Z","message":"Log 2","level":"INFO"}
{"index":{"_index":"ilm-logs-write"}}
{"@timestamp":"2025-01-15T10:00:02Z","message":"Log 3","level":"WARN"}
{"index":{"_index":"ilm-logs-write"}}
{"@timestamp":"2025-01-15T10:00:03Z","message":"Log 4","level":"ERROR"}
{"index":{"_index":"ilm-logs-write"}}
{"@timestamp":"2025-01-15T10:00:04Z","message":"Log 5","level":"INFO"}
{"index":{"_index":"ilm-logs-write"}}
{"@timestamp":"2025-01-15T10:00:05Z","message":"Log 6","level":"DEBUG"}
```

5. Check ILM status (ILM runs on a poll interval, so you may need to wait or force a check):
```bash
GET /ilm-logs-000001/_ilm/explain

# If ILM hasn't run yet, you can reduce the poll interval:
PUT /_cluster/settings
{
  "transient": {
    "indices.lifecycle.poll_interval": "1s"
  }
}
```

6. Wait a few seconds, then check again:
```bash
GET /_cat/indices/ilm-logs-*?v
GET /_aliases?filter_path=ilm-logs-*
```

**Challenge**: Did the rollover happen automatically? In which phase is the original index?

> **Answer**: Yes, ILM triggers the rollover automatically when `max_docs: 5` is exceeded and the poll runs. The original `ilm-logs-000001` transitions to the next phase, and `ilm-logs-000002` becomes the new write index.

---

## Exercise 7.2: Shard Allocation Diagnostics

**Objective**: Diagnose and fix shard allocation issues.

**Instructions**:

1. Create an index with replicas (on a single-node cluster):
```bash
PUT /shard-test
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  }
}
```

2. Check cluster health and shard status:
```bash
GET /_cluster/health?filter_path=status,unassigned_shards

GET /_cat/shards/shard-test?v
```

3. Diagnose unassigned replicas:
```bash
GET /_cluster/allocation/explain
{
  "index": "shard-test",
  "shard": 0,
  "primary": false
}
```

4. Fix by reducing replicas:
```bash
PUT /shard-test/_settings
{ "number_of_replicas": 0 }

GET /_cluster/health?filter_path=status,unassigned_shards
```

5. Explore segments:
```bash
POST /_bulk
{"index":{"_index":"shard-test"}}
{"message":"doc 1"}
{"index":{"_index":"shard-test"}}
{"message":"doc 2"}
{"index":{"_index":"shard-test"}}
{"message":"doc 3"}

POST /shard-test/_refresh

GET /_cat/segments/shard-test?v
```

6. Force merge:
```bash
POST /shard-test/_forcemerge?max_num_segments=1

GET /_cat/segments/shard-test?v
```

**Challenge**: Why can't a replica be on the same node as its primary?

> **Answer**: The purpose of a replica is fault tolerance. If the primary and replica are on the same node and that node fails, both copies are lost. Elasticsearch enforces this constraint: a replica must be allocated to a different node than its primary.

---

# Part 8: Production Monitoring

## Exercise 8.1: Cluster Health and Monitoring

**Objective**: Practice the essential monitoring APIs.

**Instructions**:

1. Cluster health:
```bash
GET /_cluster/health
GET /_cluster/health?level=indices
```

2. JVM stats:
```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem
```

3. Thread pools:
```bash
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected&s=rejected:desc
```

4. Index stats:
```bash
GET /_cat/indices?v&s=store.size:desc
```

5. Profile a query:
```bash
GET /books/_search
{
  "profile": true,
  "query": {
    "bool": {
      "must": [
        { "match": { "description": "distributed" } }
      ],
      "filter": [
        { "range": { "price": { "gte": 40 } } }
      ]
    }
  }
}
```

**Challenge**: What is your current heap usage percentage?

> **Answer**: Read `heap_used_percent` from the JVM stats. Below 75% is healthy. Above 85% requires investigation.

---

# Part 9: Synthesis Exercise

## Exercise 9.1: Build a Complete Observability Pipeline

**Your turn** - Combine Day 2 concepts to build a mini observability stack:

1. Create an ingest pipeline called `obs-pipeline` that:
   - Extracts `client_ip`, `method`, `path`, and `status` from messages formatted as `"IP METHOD PATH STATUS"`
   - Adds an `ingested_at` timestamp
   - Sets `severity` to "critical" if status >= 500, "warning" if status >= 400, "ok" otherwise

2. Create an index template for `obs-logs-*` that uses data streams and your pipeline as default.

3. Index 5 log entries through the data stream.

4. Write an aggregation that shows the count of logs per severity level.

5. Create a percolator that alerts on any log with severity "critical".

<details>
<summary>Solution</summary>

```bash
# 1. Pipeline
PUT /_ingest/pipeline/obs-pipeline
{
  "processors": [
    { "set": { "field": "ingested_at", "value": "{{{_ingest.timestamp}}}" } },
    { "grok": { "field": "message", "patterns": ["%{IP:client_ip} %{WORD:method} %{URIPATH:path} %{NUMBER:status:int}"], "ignore_failure": true } },
    { "set": { "field": "severity", "value": "critical", "if": "ctx.status != null && ctx.status >= 500" } },
    { "set": { "field": "severity", "value": "warning", "if": "ctx.status != null && ctx.status >= 400 && ctx.status < 500" } },
    { "set": { "field": "severity", "value": "ok", "if": "ctx.status != null && ctx.status < 400" } }
  ]
}

# 2. Template
PUT /_index_template/obs-template
{
  "index_patterns": ["obs-logs-*"],
  "data_stream": {},
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "default_pipeline": "obs-pipeline"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "message": { "type": "text" },
        "severity": { "type": "keyword" },
        "status": { "type": "integer" },
        "client_ip": { "type": "ip" },
        "method": { "type": "keyword" },
        "path": { "type": "keyword" }
      }
    }
  }
}

# 3. Index
POST /obs-logs-app/_doc
{ "@timestamp": "2025-01-15T10:00:00Z", "message": "10.0.0.1 GET /api/users 200" }
POST /obs-logs-app/_doc
{ "@timestamp": "2025-01-15T10:01:00Z", "message": "10.0.0.2 POST /api/orders 201" }
POST /obs-logs-app/_doc
{ "@timestamp": "2025-01-15T10:02:00Z", "message": "10.0.0.3 GET /api/users 404" }
POST /obs-logs-app/_doc
{ "@timestamp": "2025-01-15T10:03:00Z", "message": "10.0.0.1 POST /api/payments 503" }
POST /obs-logs-app/_doc
{ "@timestamp": "2025-01-15T10:04:00Z", "message": "10.0.0.4 GET /api/health 500" }

# 4. Aggregation
GET /obs-logs-app/_search
{
  "size": 0,
  "aggs": {
    "by_severity": {
      "terms": { "field": "severity" }
    }
  }
}

# 5. Percolator
PUT /obs-alerts
{
  "mappings": {
    "properties": {
      "query": { "type": "percolator" },
      "severity": { "type": "keyword" }
    }
  }
}

POST /obs-alerts/_doc/critical-alert
{
  "query": { "term": { "severity": "critical" } }
}

POST /obs-alerts/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": { "severity": "critical" }
    }
  }
}
```
</details>

---

# Cleanup

## Remove All Test Indices and Resources

```bash
DELETE /books
DELETE /tenant-data
DELETE /book-alerts
DELETE /app-logs-*
DELETE /shard-test
DELETE /ilm-logs-*
DELETE /enriched-logs
DELETE /parsed-logs
DELETE /obs-alerts

DELETE /_data_stream/metrics-servers
DELETE /_data_stream/obs-logs-app
DELETE /_index_template/metrics-template
DELETE /_index_template/ilm-logs-template
DELETE /_index_template/obs-template
DELETE /_ilm/policy/logs-lifecycle
DELETE /_ingest/pipeline/log-enrichment
DELETE /_ingest/pipeline/access-log-parser
DELETE /_ingest/pipeline/csv-parser
DELETE /_ingest/pipeline/obs-pipeline

# Reset ILM poll interval
PUT /_cluster/settings
{ "transient": { "indices.lifecycle.poll_interval": null } }
```

---

# Summary

## Exercises Completed - Day 2

| Part | Topic | Skills Practiced |
|------|-------|-----------------|
| 1 | Routing | Custom routing, required routing, targeted search |
| 2 | Percolation | Stored queries, alerting rules, multi-doc percolation |
| 3 | Aggregations | Metrics, buckets, nested aggs, filtered aggs |
| 4 | Multi-tenancy | Aliases, filtered aliases, language isolation |
| 5 | Big Data Patterns | Rollover, data streams |
| 6 | Ingest Pipelines | Grok, dissect, enrichment, simulate |
| 7 | ILM & Shards | ILM policy, allocation diagnostics, force merge |
| 8 | Production | Monitoring APIs, query profiling |
| 9 | Synthesis | Complete observability pipeline |
