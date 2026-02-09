# Elasticsearch Sparks Training - Practical Exercises Day 1

## Overview

All exercises use the Kibana Dev Tools console. Access it at: `http://localhost:5601/app/dev_tools#/console`

**Shared dataset**: Throughout Day 1, we build and reuse a **library** dataset (books, authors, reviews). Each part enriches or queries the same data.

---

# Part 1: Installation and Configuration

## Exercise 1.1: Starting Elasticsearch and Kibana

**Objective**: Install and start Elasticsearch and Kibana locally, then verify they're running correctly.

### Step 1: Install and Start Elasticsearch

```bash
# Download and extract Elasticsearch
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-9.0.0-linux-x86_64.tar.gz
tar -xzf elasticsearch-9.0.0-linux-x86_64.tar.gz
cd elasticsearch-9.0.0

# Configure Elasticsearch for single-node (edit config/elasticsearch.yml)
echo "discovery.type: single-node" >> config/elasticsearch.yml
echo "xpack.security.enabled: false" >> config/elasticsearch.yml

# Start Elasticsearch (in the background or in a separate terminal)
./bin/elasticsearch
```

**Note**: Keep this terminal open or run in background. Elasticsearch will start on port 9200.

### Step 2: Install and Start Kibana

Open a **new terminal** window:

```bash
# Download and extract Kibana
wget https://artifacts.elastic.co/downloads/kibana/kibana-9.0.0-linux-x86_64.tar.gz
tar -xzf kibana-9.0.0-linux-x86_64.tar.gz
cd kibana-9.0.0

# Configure Kibana to connect to Elasticsearch (edit config/kibana.yml)
echo "elasticsearch.hosts: ['http://localhost:9200']" >> config/kibana.yml

# Start Kibana
./bin/kibana
```

### Step 3: Verify Installation

```bash
# In Kibana Dev Tools
GET /

GET /_cluster/health

GET /_cat/nodes?v
```

**Expected Results**:
- Elasticsearch responds on port 9200
- Kibana interface is accessible on port 5601
- Cluster status should be `green` or `yellow`

### Step 4: Explore Cluster Information

```bash
GET /_cluster/health?level=indices

GET /_cluster/state?filter_path=cluster_name,cluster_uuid

GET /_nodes?filter_path=nodes.*.name,nodes.*.roles,nodes.*.jvm.mem
```

**Challenge**: What is your cluster's UUID? What are the default node roles?

> **Answer**: The UUID is unique per cluster (check `cluster_uuid` in the response). Default roles on a single-node cluster are typically `[data, data_cold, data_content, data_frozen, data_hot, data_warm, ingest, master, ml, remote_cluster_client, transform]`.

---

## Exercise 1.2: Node Configuration Analysis

**Objective**: Understand your node configuration and identify key settings.

**Instructions**:

1. Get detailed node information:
```bash
GET /_nodes?filter_path=nodes.*.name,nodes.*.roles,nodes.*.jvm.mem,nodes.*.os.name
```

2. Analyze JVM configuration:
```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent,nodes.*.jvm.mem.heap_max_in_bytes
```

3. Check thread pools:
```bash
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected,completed
```

4. Check cluster routing settings:
```bash
GET /_cluster/settings?include_defaults=true&filter_path=defaults.cluster.routing
```

**Challenge**: What percentage of heap is currently being used? Is it within safe limits (< 75%)?

> **Answer**: Read the `heap_used_percent` field. If it's below 75%, you're in good shape. Above 85% is a warning sign.

---

# Part 2: Indexing

## Exercise 2.1: Create the Library Dataset

**Objective**: Create the shared dataset we'll use throughout Day 1.

**Instructions**:

1. Create the `books` index with explicit mapping:
```bash
PUT /books
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "1s"
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
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
```

2. Bulk index the library catalog:
```bash
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
{"title":"Clean Code","author":"Robert C. Martin","genre":"technology","description":"A handbook of agile software craftsmanship. Learn to write code that is easy to read, maintain, and extend. Covers naming conventions, functions, comments, and error handling.","published_date":"2008-08-01","pages":464,"price":35.99,"rating":4.6,"in_stock":false,"tags":["programming","best-practices","agile"],"publisher":"Prentice Hall","language":"en","location":{"lat":40.7128,"lon":-74.0060}}
{"index":{"_index":"books","_id":"6"}}
{"title":"Designing Data-Intensive Applications","author":"Martin Kleppmann","genre":"technology","description":"The big ideas behind reliable, scalable, and maintainable data systems. Covers distributed systems, replication, partitioning, and stream processing.","published_date":"2017-03-16","pages":616,"price":42.99,"rating":4.8,"in_stock":true,"tags":["distributed","data","architecture"],"publisher":"O'Reilly","language":"en","location":{"lat":51.5074,"lon":-0.1278}}
{"index":{"_index":"books","_id":"7"}}
{"title":"L'Étranger","author":"Albert Camus","genre":"fiction","description":"Meursault, un jeune employé de bureau à Alger, commet un meurtre absurde sur une plage. Un roman sur l'absurdité de l'existence humaine.","published_date":"1942-06-01","pages":123,"price":7.99,"rating":4.4,"in_stock":true,"tags":["classic","philosophy","existentialism"],"publisher":"Gallimard","language":"fr","location":{"lat":48.8566,"lon":2.3522}}
{"index":{"_index":"books","_id":"8"}}
{"title":"Site Reliability Engineering","author":"Betsy Beyer","genre":"technology","description":"How Google runs production systems. Covers monitoring, alerting, incident response, and capacity planning for large-scale distributed infrastructure.","published_date":"2016-03-23","pages":552,"price":48.99,"rating":4.5,"in_stock":true,"tags":["sre","devops","monitoring","production"],"publisher":"O'Reilly","language":"en","location":{"lat":37.7749,"lon":-122.4194}}
```

3. Verify:
```bash
GET /books/_count

GET /books/_doc/1
```

4. Retrieve a document and check the response fields:
```bash
GET /books/_doc/4
```

**Challenge**: What is the `_version` of document 4? What does `_seq_no` represent?

> **Answer**: `_version` is 1 (first indexation). `_seq_no` is the sequence number in the shard's operation log, used for optimistic concurrency control.

---

## Exercise 2.2: CRUD Operations

**Objective**: Practice update, delete, and concurrency control on the library dataset.

**Instructions**:

1. Partial update - change the price of a book:
```bash
POST /books/_update/5
{
  "doc": {
    "price": 29.99,
    "in_stock": true
  }
}
```

2. Verify the update:
```bash
GET /books/_doc/5
```

3. Optimistic concurrency control - get the sequence numbers first:
```bash
GET /books/_doc/1
```

4. Update with concurrency control (use `_seq_no` and `_primary_term` from the previous response):
```bash
POST /books/_update/1?if_seq_no=0&if_primary_term=1
{
  "doc": {
    "rating": 4.8
  }
}
```

5. Try the same update again with the old seq_no - this should fail:
```bash
POST /books/_update/1?if_seq_no=0&if_primary_term=1
{
  "doc": {
    "rating": 4.9
  }
}
```

6. Delete a document and verify:
```bash
DELETE /books/_doc/8

GET /books/_doc/8
```

7. Re-index it (we'll need it later):
```bash
POST /books/_doc/8
{
  "title": "Site Reliability Engineering",
  "author": "Betsy Beyer",
  "genre": "technology",
  "description": "How Google runs production systems. Covers monitoring, alerting, incident response, and capacity planning for large-scale distributed infrastructure.",
  "published_date": "2016-03-23",
  "pages": 552,
  "price": 48.99,
  "rating": 4.5,
  "in_stock": true,
  "tags": ["sre", "devops", "monitoring", "production"],
  "publisher": "O'Reilly",
  "language": "en",
  "location": {"lat": 37.7749, "lon": -122.4194}
}
```

**Challenge**: What HTTP status code do you get for a version conflict (step 5)?

> **Answer**: HTTP 409 Conflict.

---

## Exercise 2.3: Bulk Indexing and Error Handling

**Objective**: Understand partial failures in bulk operations.

**Instructions**:

1. Bulk with intentional errors - note that `books` has an explicit mapping with `price` as `float`:
```bash
POST /_bulk
{"index":{"_index":"books","_id":"100"}}
{"title":"Bad Book","price":"not-a-number","genre":"error"}
{"index":{"_index":"books","_id":"101"}}
{"title":"Good Book","price":19.99,"genre":"fiction","published_date":"2025-01-01","pages":200,"rating":3.5,"in_stock":true,"tags":["test"],"publisher":"Test","language":"en","author":"Test Author"}
```

2. Analyze the response carefully:
```bash
GET /books/_doc/100

GET /books/_doc/101
```

3. Clean up:
```bash
DELETE /books/_doc/101
```

**Challenge**: Did the entire bulk fail, or only the problematic document? Why?

> **Answer**: Only document 100 fails (the `price` field rejects `"not-a-number"` for a `float` type). Document 101 is indexed successfully. Bulk operations are independent - each action succeeds or fails on its own.

---

# Part 3: Mapping and Analyzers

## Exercise 3.1: Analyzer Exploration

**Objective**: Understand how analyzers transform text.

**Instructions**:

1. Compare analyzer behaviors:
```bash
POST /_analyze
{
  "analyzer": "standard",
  "text": "The Elasticsearch Definitive Guide (2024 edition)"
}

POST /_analyze
{
  "analyzer": "simple",
  "text": "The Elasticsearch Definitive Guide (2024 edition)"
}

POST /_analyze
{
  "analyzer": "french",
  "text": "Un aviateur tombe en panne dans le désert du Sahara"
}
```

2. **Your turn**: Without running it, predict how many tokens the `standard` analyzer will produce for: `"user-123 logged in from café at 10:30AM"`. Then verify:
```bash
POST /_analyze
{
  "analyzer": "standard",
  "text": "user-123 logged in from café at 10:30AM"
}
```

3. Create and test a custom analyzer:
```bash
PUT /analyzer-test
{
  "settings": {
    "analysis": {
      "analyzer": {
        "multilingual_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding"]
        }
      }
    }
  }
}

POST /analyzer-test/_analyze
{
  "analyzer": "multilingual_analyzer",
  "text": "Connexion réussie depuis un café à Paris"
}
```

**Challenge**: Does "cafe" (no accent) match "café" (with accent) when using the `multilingual_analyzer`?

> **Answer**: Yes. The `asciifolding` filter converts `café` to `cafe`, so both produce the same token `cafe`.

---

## Exercise 3.2: Mapping Modifications and Multi-fields

**Objective**: Add fields to the existing `books` mapping and understand multi-fields.

**Instructions**:

1. Check the current mapping:
```bash
GET /books/_mapping
```

2. Add a new field to the mapping (you can add fields but not change existing ones):
```bash
PUT /books/_mapping
{
  "properties": {
    "summary": {
      "type": "text",
      "analyzer": "french",
      "fields": {
        "english": {
          "type": "text",
          "analyzer": "english"
        }
      }
    }
  }
}
```

3. **Your turn**: Add a field called `isbn` of type `keyword` to the `books` mapping. Write the request yourself.

<details>
<summary>Solution</summary>

```bash
PUT /books/_mapping
{
  "properties": {
    "isbn": { "type": "keyword" }
  }
}
```
</details>

4. Verify:
```bash
GET /books/_mapping
```

**Challenge**: Can you change the type of the `title` field from `text` to `keyword`? Why not?

> **Answer**: No. Mapping changes are not allowed for existing fields because existing data has already been indexed with the original type. You would need to create a new index and reindex the data.

---

## Exercise 3.3: Nested Objects

**Objective**: Understand the nested type problem and its solution.

**Instructions**:

1. Create a `bookstores` index WITHOUT nested type:
```bash
PUT /bookstores-flat
{
  "mappings": {
    "properties": {
      "name": { "type": "keyword" },
      "staff": {
        "properties": {
          "name": { "type": "text" },
          "role": { "type": "keyword" }
        }
      }
    }
  }
}

POST /bookstores-flat/_doc
{
  "name": "Shakespeare & Co",
  "staff": [
    { "name": "Alice", "role": "manager" },
    { "name": "Bob", "role": "cashier" }
  ]
}
```

2. Search for "Alice as cashier" - this should NOT match but it does:
```bash
GET /bookstores-flat/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "staff.name": "Alice" } },
        { "term": { "staff.role": "cashier" } }
      ]
    }
  }
}
```

3. Now create the correct version with nested:
```bash
PUT /bookstores-nested
{
  "mappings": {
    "properties": {
      "name": { "type": "keyword" },
      "staff": {
        "type": "nested",
        "properties": {
          "name": { "type": "text" },
          "role": { "type": "keyword" }
        }
      }
    }
  }
}

POST /bookstores-nested/_doc
{
  "name": "Shakespeare & Co",
  "staff": [
    { "name": "Alice", "role": "manager" },
    { "name": "Bob", "role": "cashier" }
  ]
}
```

4. Same search with nested query:
```bash
GET /bookstores-nested/_search
{
  "query": {
    "nested": {
      "path": "staff",
      "query": {
        "bool": {
          "must": [
            { "match": { "staff.name": "Alice" } },
            { "term": { "staff.role": "cashier" } }
          ]
        }
      }
    }
  }
}
```

**Challenge**: Why does the flat version match incorrectly?

> **Answer**: Without `nested`, Elasticsearch flattens the arrays into `staff.name: ["Alice", "Bob"]` and `staff.role: ["manager", "cashier"]`. The relationship between name and role is lost. The `nested` type preserves the association.

---

## Exercise 3.4: Index Templates

**Objective**: Create reusable templates for standardized index creation.

**Instructions**:

1. Create a component template:
```bash
PUT /_component_template/base-settings
{
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "refresh_interval": "10s"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" }
      }
    }
  }
}
```

2. Create an index template composing it:
```bash
PUT /_index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "composed_of": ["base-settings"],
  "template": {
    "mappings": {
      "properties": {
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "message": { "type": "text" }
      }
    }
  },
  "priority": 200
}
```

**Note ES 9.x**: La priorité est définie à 200 (au lieu de 100) pour éviter les conflits avec les templates built-in d'Elasticsearch 9.x (`logs`, `metrics`, `synthetics`) qui ont une priorité de 100.

3. **Your turn**: Index a document into `logs-2025-01-15` and verify the template was applied. Check the settings and mapping yourself.

<details>
<summary>Solution</summary>

```bash
POST /logs-2025-01-15/_doc
{
  "@timestamp": "2025-01-15T10:00:00Z",
  "level": "INFO",
  "service": "api-gateway",
  "message": "Request processed successfully"
}

GET /logs-2025-01-15/_settings
GET /logs-2025-01-15/_mapping
```
</details>

**Challenge**: Does the index have 1 shard and 0 replicas as expected?

> **Answer**: Yes. The component template `base-settings` is applied automatically because the index name matches `logs-*`.

---

# Part 4: Search

## Exercise 4.1: Full-Text Search and Relevance

**Objective**: Practice full-text search on the `books` dataset.

**Instructions**:

1. Simple match query:
```bash
GET /books/_search
{
  "query": {
    "match": {
      "description": "distributed search"
    }
  }
}
```

2. Match with operator:
```bash
GET /books/_search
{
  "query": {
    "match": {
      "description": {
        "query": "distributed search",
        "operator": "and"
      }
    }
  }
}
```

3. Multi-match with field boosting:
```bash
GET /books/_search
{
  "query": {
    "multi_match": {
      "query": "elasticsearch",
      "fields": ["title^3", "description"],
      "type": "best_fields"
    }
  }
}
```

4. Phrase match:
```bash
GET /books/_search
{
  "query": {
    "match_phrase": {
      "description": "production systems"
    }
  }
}
```

5. **Your turn**: Write a `multi_match` query that searches for "data pipeline" across `title` (boosted x2) and `description`. Which books match?

<details>
<summary>Solution</summary>

```bash
GET /books/_search
{
  "query": {
    "multi_match": {
      "query": "data pipeline",
      "fields": ["title^2", "description"]
    }
  }
}
```
</details>

6. Function score to boost by rating:
```bash
GET /books/_search
{
  "query": {
    "function_score": {
      "query": {
        "match": { "description": "distributed" }
      },
      "functions": [
        {
          "field_value_factor": {
            "field": "rating",
            "modifier": "log1p"
          }
        }
      ],
      "boost_mode": "multiply"
    }
  }
}
```

7. Explain API:
```bash
GET /books/_explain/1
{
  "query": {
    "match": { "description": "distributed" }
  }
}
```

**Challenge**: Why does document 6 ("Designing Data-Intensive Applications") score higher than document 1 for "distributed"?

> **Answer**: Document 6 has `rating: 4.8` while document 1 has `rating: 4.7` (after our update). With `field_value_factor` on `rating` and `boost_mode: multiply`, the higher rating boosts the score. Also, field length normalization matters - shorter fields with the term get a higher base score.

---

## Exercise 4.2: Term-Level, Range, and Boolean Queries

**Objective**: Practice exact matching, ranges, and combined queries.

**Instructions**:

1. Term query on keyword field:
```bash
GET /books/_search
{
  "query": {
    "term": { "genre": "technology" }
  }
}
```

2. Range queries:
```bash
GET /books/_search
{
  "query": {
    "range": {
      "price": { "gte": 40, "lte": 55 }
    }
  }
}

GET /books/_search
{
  "query": {
    "range": {
      "published_date": { "gte": "2020-01-01" }
    }
  }
}
```

3. Bool query:
```bash
GET /books/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "description": "distributed" } }
      ],
      "should": [
        { "term": { "publisher": "O'Reilly" } }
      ],
      "filter": [
        { "term": { "in_stock": true } },
        { "range": { "rating": { "gte": 4.5 } } }
      ]
    }
  }
}
```

4. **Your turn**: Write a bool query that finds fiction books (`genre: fiction`) published before 1950 with a rating above 4.0. Use `filter` for the non-scoring conditions.

<details>
<summary>Solution</summary>

```bash
GET /books/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "genre": "fiction" } },
        { "range": { "published_date": { "lt": "1950-01-01" } } },
        { "range": { "rating": { "gt": 4.0 } } }
      ]
    }
  }
}
```
</details>

5. Fuzzy query (typo-tolerant):
```bash
GET /books/_search
{
  "query": {
    "fuzzy": {
      "title": {
        "value": "elastisearch",
        "fuzziness": "AUTO"
      }
    }
  }
}
```

**Challenge**: What is the difference between `must` and `filter` in a bool query?

> **Answer**: Both require matching, but `must` contributes to the relevance score while `filter` does not (it's a yes/no check). Filters are also cached for better performance. Use `filter` when you don't need scoring (exact values, ranges).

---

## Exercise 4.3: Geo Queries

**Objective**: Practice geographic search queries on the `books` dataset.

**Instructions**:

1. Find books published near Paris (within 50km):
```bash
GET /books/_search
{
  "query": {
    "geo_distance": {
      "distance": "50km",
      "location": {
        "lat": 48.8566,
        "lon": 2.3522
      }
    }
  }
}
```

2. Sort all books by distance from New York:
```bash
GET /books/_search
{
  "query": { "match_all": {} },
  "sort": [
    {
      "_geo_distance": {
        "location": { "lat": 40.7128, "lon": -74.0060 },
        "order": "asc",
        "unit": "km"
      }
    }
  ]
}
```

3. **Your turn**: Write a query that finds books within a bounding box covering the UK (top_left: lat 59, lon -8; bottom_right: lat 50, lon 2).

<details>
<summary>Solution</summary>

```bash
GET /books/_search
{
  "query": {
    "geo_bounding_box": {
      "location": {
        "top_left": { "lat": 59, "lon": -8 },
        "bottom_right": { "lat": 50, "lon": 2 }
      }
    }
  }
}
```
</details>

**Challenge**: Which books are published near Paris?

> **Answer**: "Le Petit Prince" and "L'Étranger" - both have location set to Paris coordinates.

---

## Exercise 4.4: Highlighting

**Objective**: Practice highlighting matching terms in search results.

**Instructions**:

1. Basic highlighting:
```bash
GET /books/_search
{
  "query": {
    "match": {
      "description": "distributed search analytics"
    }
  },
  "highlight": {
    "fields": {
      "description": {}
    }
  }
}
```

2. Custom tags and multiple fields:
```bash
GET /books/_search
{
  "query": {
    "multi_match": {
      "query": "elasticsearch",
      "fields": ["title", "description"]
    }
  },
  "highlight": {
    "pre_tags": ["**"],
    "post_tags": ["**"],
    "fields": {
      "title": {},
      "description": {
        "fragment_size": 100,
        "number_of_fragments": 2
      }
    }
  }
}
```

3. Highlighting with bool query:
```bash
GET /books/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "description": "monitoring" } }
      ],
      "should": [
        { "match": { "title": "elastic" } }
      ]
    }
  },
  "highlight": {
    "fields": {
      "title": {},
      "description": {}
    }
  }
}
```

**Challenge**: What is the default tag used by the highlighter? What does `number_of_fragments: 0` do?

> **Answer**: Default tags are `<em>` and `</em>`. Setting `number_of_fragments: 0` returns the entire field content with highlights instead of fragments.

---

## Exercise 4.5: Sorting and Pagination

**Objective**: Practice sorting and pagination strategies.

**Instructions**:

1. Sort by price descending:
```bash
GET /books/_search
{
  "query": { "match_all": {} },
  "sort": [{ "price": "desc" }]
}
```

2. Multi-field sort:
```bash
GET /books/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "genre": "asc" },
    { "rating": "desc" }
  ]
}
```

3. Pagination with from/size:
```bash
# Page 1
GET /books/_search
{
  "from": 0,
  "size": 3,
  "sort": [{ "published_date": "desc" }]
}

# Page 2
GET /books/_search
{
  "from": 3,
  "size": 3,
  "sort": [{ "published_date": "desc" }]
}
```

4. **Your turn**: Use `search_after` to paginate results sorted by `price` descending then `_doc` ascending. Get the first page (size 3), then write the `search_after` request for page 2 using the last hit's sort values.

<details>
<summary>Solution</summary>

```bash
# Page 1
GET /books/_search
{
  "size": 3,
  "sort": [
    { "price": "desc" },
    { "_doc": "asc" }
  ]
}

# Page 2 (use sort values from last hit of page 1)
GET /books/_search
{
  "size": 3,
  "sort": [
    { "price": "desc" },
    { "_doc": "asc" }
  ],
  "search_after": [42.99, 0]
}
```

**Note ES 9.x**: On utilise `_doc` au lieu de `_id` car l'accès fielddata sur `_id` est désactivé par défaut dans ES 9.x pour économiser la mémoire. `_doc` utilise l'ordre naturel d'insertion des documents, ce qui est plus performant et recommandé pour la pagination profonde.

**Pourquoi `_doc` ?**
- `_id` nécessiterait l'activation de fielddata (coûteux en mémoire)
- `_doc` utilise l'ordre naturel des documents (gratuit et rapide)
- `_doc` est le tri le plus performant pour `search_after`
- La valeur dans `search_after` sera un entier (internal doc ID) au lieu d'un string

</details>

5. Source filtering:
```bash
GET /books/_search
{
  "_source": ["title", "author", "price"],
  "sort": [{ "price": "desc" }]
}
```

**Challenge**: Why is `from/size` not recommended for deep pagination?

> **Answer**: `from/size` requires the coordinating node to fetch `from + size` documents from each shard, sort them all, and discard the first `from`. At deep offsets (e.g., from=10000), this becomes very expensive in memory and CPU. `search_after` avoids this by using the sort values of the last result as a cursor.

---

# Part 5: Synthesis Exercise

## Exercise 5.1: Build a Book Search API

**Objective**: Combine everything you learned today into a realistic search scenario.

**Your turn** - Write the queries yourself for each requirement:

1. **Faceted search**: Find all technology books in stock, sorted by rating descending. Only return `title`, `author`, `rating`, and `price`. Highlight matches in the `description`.

2. **Combined query**: Find books whose description mentions "monitoring" OR "production", published after 2015, priced between 30 and 50 euros. Exclude books by "Robert C. Martin".

3. **Geo + text**: Find books published within 100km of London (lat: 51.5074, lon: -0.1278) that mention "analytics" in title or description. Sort by distance.

<details>
<summary>Solution 1: Faceted search</summary>

```bash
GET /books/_search
{
  "_source": ["title", "author", "rating", "price"],
  "query": {
    "bool": {
      "must": [
        { "match": { "description": "technology" } }
      ],
      "filter": [
        { "term": { "genre": "technology" } },
        { "term": { "in_stock": true } }
      ]
    }
  },
  "sort": [{ "rating": "desc" }],
  "highlight": {
    "fields": { "description": {} }
  }
}
```
</details>

<details>
<summary>Solution 2: Combined query</summary>

```bash
GET /books/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "description": {
              "query": "monitoring production",
              "operator": "or"
            }
          }
        }
      ],
      "must_not": [
        { "term": { "author": "Robert C. Martin" } }
      ],
      "filter": [
        { "range": { "published_date": { "gte": "2015-01-01" } } },
        { "range": { "price": { "gte": 30, "lte": 50 } } }
      ]
    }
  }
}
```
</details>

<details>
<summary>Solution 3: Geo + text</summary>

```bash
GET /books/_search
{
  "query": {
    "bool": {
      "must": [
        { "multi_match": { "query": "analytics", "fields": ["title", "description"] } }
      ],
      "filter": [
        {
          "geo_distance": {
            "distance": "100km",
            "location": { "lat": 51.5074, "lon": -0.1278 }
          }
        }
      ]
    }
  },
  "sort": [
    {
      "_geo_distance": {
        "location": { "lat": 51.5074, "lon": -0.1278 },
        "order": "asc",
        "unit": "km"
      }
    }
  ]
}
```
</details>

---

# Cleanup

## Remove All Test Indices

```bash
DELETE /books
DELETE /bookstores-flat
DELETE /bookstores-nested
DELETE /analyzer-test
DELETE /logs-2025-01-15
DELETE /_index_template/logs-template
DELETE /_component_template/base-settings
```

---

# Summary

## Exercises Completed - Day 1

| Part | Topic | Skills Practiced |
|------|-------|-----------------|
| 1 | Installation | Cluster setup, health check, node analysis |
| 2 | Indexing | Shared dataset, CRUD, bulk, concurrency control |
| 3 | Mapping | Analyzers, multi-fields, nested, templates |
| 4 | Search | Full-text, term, range, bool, geo, highlighting, sorting, pagination |
| 5 | Synthesis | Combined real-world search scenarios |
