---
layout: cover
---

# General Presentation

Search engine fundamentals and Elasticsearch concepts

---

# Learning Objectives

At the end of this section, you will be able to:

- Explain how a search engine works and its use cases
- Understand indexing mechanisms and inverted index structure
- Configure mappings for different data types

---

# What is a Search Engine?

A search engine is a system designed to perform fast and relevant searches on large volumes of data.

**Main characteristics**:
- Pre-indexing of documents for ultra-fast searches
- Text analysis to understand semantics
- Relevance scoring to rank results
- Ability to handle structured and unstructured data

**Common use cases**:
- Full-text search in applications
- Log and metrics analysis
- E-commerce (product search)
- Enterprise search (intranet, documentation)

---

# Elasticsearch: A Distributed Search Engine

Elasticsearch is an [open-source search engine based on Lucene](https://www.elastic.co/guide/en/elasticsearch/reference/current/elasticsearch-intro.html), optimized for scalability and speed.

**Elasticsearch advantages**:
- **Distributed**: Horizontal scalability via sharding
- **RESTful**: Simple and universal HTTP API
- **Native JSON**: Standard data format
- **Real-time**: Near-instant search after indexing
- **Advanced analysis**: Powerful aggregations for analytics

**Elastic Stack ecosystem**:
- **Elasticsearch**: Search and analytics engine
- **Kibana**: Visualization interface
- **Beats**: Lightweight data collectors
- **Logstash**: Data processing pipeline

---

# Search vs Database Queries

| Aspect | Relational Database | Search Engine |
|--------|---------------------|---------------|
| **Queries** | Exact SQL (= , >, <) | Fuzzy search, full-text |
| **Performance** | Expensive JOINs on large volumes | Very fast text search |
| **Relevance** | No notion of score | Relevance scoring |
| **Structure** | Strict schema (tables, columns) | Flexible schema (JSON) |
| **Use cases** | Transactions, relations | Search, analysis, logs |

---

# When to use Elasticsearch?

- Full-text search with typos, synonyms
- Log and metrics analysis
- Complex filtering + aggregations
- Geospatial search

---

# The Inverted Index: Heart of Elasticsearch

An [inverted index](https://www.elastic.co/guide/en/elasticsearch/reference/current/documents-indices.html) is a data structure that maps terms to the documents containing them.

**Example with 3 documents**:
- Doc 1: "Elasticsearch is fast"
- Doc 2: "Kibana visualizes Elasticsearch"
- Doc 3: "Logstash sends to Elasticsearch"

**Resulting inverted index**:
```
elasticsearch → [1, 2, 3]
fast          → [1]
kibana        → [2]
visualizes    → [2]
logstash      → [3]
sends         → [3]
```

Searching "elasticsearch" instantly returns docs 1, 2, 3!

---

# Indexing Process

## 1. Text Analysis

Transformation of raw text into indexable terms via [analyzers](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis.html):

```json
"Elasticsearch is FAST!"
  → Tokenization → ["Elasticsearch", "is", "FAST"]
  → Lowercase    → ["elasticsearch", "is", "fast"]
  → Stop words   → ["elasticsearch", "fast"]
```

## 2. Inverted Index Creation

Each analyzed term is added to the inverted index with:
- **Position** in the document
- **Frequency** of the term (TF - Term Frequency)
- **Metadata** for scoring

---

# Document Lifecycle

**Key steps**:
1. **Reception**: JSON document via REST API
2. **Analysis**: Tokenization and text normalization
3. **Indexing**: Addition to inverted index
4. **Memory write**: Buffer in RAM
5. **Refresh**: Available for search (default: 1s)
6. **Flush**: Persists to disk (fsync)

**Important parameter**: `index.refresh_interval` (default: `1s`)

[Indexing documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/near-real-time.html)

---

# Document Indexing API

**Index a single document**:
```bash
POST /my-index/_doc/1
{
  "title": "Introduction to Elasticsearch",
  "author": "Emmanuel DEMEY",
  "date": "2025-11-10",
  "views": 1250
}
```

**Expected result**:
```json
{
  "_index": "my-index",
  "_id": "1",
  "_version": 1,
  "result": "created"
}
```

More info: [Index API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html)

---

# Bulk API for Massive Indexing

The [Bulk API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html) allows indexing multiple documents in a single request:

```bash
POST /_bulk
{ "index": { "_index": "my-index", "_id": "1" }}
{ "title": "Doc 1", "content": "..." }
{ "index": { "_index": "my-index", "_id": "2" }}
{ "title": "Doc 2", "content": "..." }
```

**Advantages**:
- ✅ Reduced network latency (one request instead of N)
- ✅ Better resource utilization
- ✅ Much higher indexing throughput

**Best practice**: Batches of 5-15 MB or 1000-5000 documents.

---

# Mapping: The Elasticsearch Schema

The [mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html) defines document structure and each field's type.

**Mapping example**:
```json
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "author": { "type": "keyword" },
      "date": { "type": "date" },
      "views": { "type": "integer" },
      "location": { "type": "geo_point" }
    }
  }
}
```

**Why is mapping important?**
- Determines how data is indexed and searchable
- Optimizes storage and performance
- Enables advanced features (geo-search, range queries)

---

# Main Field Types

| Type | Usage | Example |
|------|-------|---------|
| **text** | Full-text search (analyzed) | Articles, descriptions |
| **keyword** | Exact filtering, aggregations | Statuses, tags, IDs |
| **date** | Dates and timestamps | `"2025-11-10"`, `1699632000000` |
| **long/integer** | Integer numbers | Ages, counters |
| **float/double** | Decimal numbers | Prices, coordinates |
| **boolean** | True/false | Flags, states |
| **geo_point** | Geographic coordinates | `{"lat": 48.8566, "lon": 2.3522}` |
| **object** | Nested JSON object | Addresses, metadata |

Complete documentation: [Field types](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html)

---

# Dynamic vs Explicit Mapping

## Dynamic Mapping

Elasticsearch automatically detects field types:
```json
POST /auto-index/_doc/1
{ "name": "Test", "count": 42 }
```
Result: `name` → `text+keyword`, `count` → `long`

**Advantages**: Quick for prototyping

**Disadvantages**: May guess type incorrectly (dates as strings, etc.)

---

# Dynamic vs Explicit Mapping

## Explicit Mapping

Manually define types to control indexing:
```json
PUT /my-index
{
  "mappings": {
    "properties": {
      "name": { "type": "keyword" },
      "count": { "type": "integer" }
    }
  }
}
```

**Best practice**: Always define mapping explicitly in production!

---

# Important Mapping Parameters

```json
{
  "properties": {
    "description": {
      "type": "text",
      "analyzer": "french",
      "fields": { "keyword": { "type": "keyword" } }
    },
    "status": {
      "type": "keyword", "ignore_above": 256
    },
    "metadata": {
      "type": "object", "enabled": false
    }
  }
}
```

**Key parameters**:
- `analyzer`: Defines how text is analyzed
- `fields`: Multi-fields (same data, multiple types)
- `ignore_above`: Ignores strings that are too long
- `enabled`: Enables/disables field indexing

---
layout: two-cols
---

# Glossary: Key Terms (1/2)

| Term | Definition |
|------|------------|
| **Cluster** | Group of nodes working together |
| **Node** | Single Elasticsearch server instance |
| **Index** | Collection of documents (like a DB table) |
| **Document** | Single JSON record in an index |
| **Mapping** | Schema defining field types |
| **Shard** | Horizontal partition of an index |
| **Primary Shard** | Original shard for write operations |
| **Replica** | Copy of a primary shard for HA |

::right::

--- 

# Glossary: Key Terms (2/2)

| Term | Definition |
|------|------------|
| **Segment** | Immutable Lucene file on disk |
| **Refresh** | Make new docs searchable (1s) |
| **Flush** | Persist data to disk (fsync) |
| **Merge** | Combine segments for efficiency |
| **Inverted Index** | Term → Document ID mapping |

---
