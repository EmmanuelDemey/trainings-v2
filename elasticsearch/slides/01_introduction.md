---
layout: cover
---

# Introduction

Search engine fundamentals and Elasticsearch concepts

---

# Learning Objectives

At the end of this section, you will be able to:

- Explain how a search engine works and its use cases
- Place Elasticsearch among the other solutions and in the Elastic Stack
- Understand the inverted index and the life of an indexed document
- Use the vocabulary of the training: cluster, node, index, shard, document

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

# Existing Solutions

* Several search engine solutions exist, including:
    * Java library: Lucene
    * Cluster: Solr, Elasticsearch, OpenSearch (fork of Elasticsearch 7.10)
    * SaaS Solution: Algolia, Amazon, Azure, GCP, Elastic Cloud...

---

# Lucene

* An open-source Java library for indexing documents.
* Can be integrated into your applications.
* Here is an example of Lucene code:

```java
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.TermQuery;

QueryParser qp = new QueryParser("title", new StandardAnalyzer());
Query query = new BooleanQuery.Builder()
    .add(qp.parse("foo bar"), BooleanClause.Occur.MUST)
    .add(new TermQuery(new Term("id", "123456")), BooleanClause.Occur.MUST_NOT)
    .build();
```

---

# Elasticsearch: A Distributed Search Engine

Elasticsearch is a [search engine based on Lucene](https://www.elastic.co/guide/en/elasticsearch/reference/current/elasticsearch-intro.html), optimized for scalability and speed.

**Elasticsearch advantages**:
- **Distributed**: Horizontal scalability via sharding
- **RESTful**: Simple and universal HTTP API
- **Native JSON**: Standard data format
- **Real-time**: Near-instant search after indexing
- **Advanced analysis**: Powerful aggregations for analytics

**License**: Apache 2.0 until 7.10, then SSPL / Elastic License, and AGPL added as an open-source option since 8.16.

---
src: ../../elasticsearch-common/slides/stack/elastic-stack.md
---

---

# The Community

* Eland: Elasticsearch from Python and pandas, and machine learning models
* Rally: the benchmarking tool of Elasticsearch
* Testcontainers: an Elasticsearch in Docker for the integration tests

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

# Glossary: The Cluster

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
logstash      → [3]
sends         → [3]
visualizes    → [2]
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
  → Stop words   → ["elasticsearch", "fast"]   (english analyzer, not the default standard one)
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
4. **Memory write**: Buffer in RAM, and the operation is appended to the **translog**, fsynced before the request is acknowledged: this is what makes the write durable
5. **Refresh**: Buffer written as a new segment, available for search (default: 1s)
6. **Flush**: Lucene commit of the segments to disk, then the translog is trimmed

**Important parameter**: `index.refresh_interval` (default: `1s`)

[Indexing documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/near-real-time.html)

---

# Glossary: Storage

| Term | Definition |
|------|------------|
| **Segment** | Immutable Lucene file on disk |
| **Translog** | Log of the operations not yet committed, replayed after a crash |
| **Refresh** | Make new docs searchable (1s) |
| **Flush** | Lucene commit to disk, translog trimmed |
| **Merge** | Combine segments for efficiency |
| **Inverted Index** | Term → Document ID mapping |

---

# API

* Any endpoint containing a `_` corresponds to an Elasticsearch API
    * _search
    * _explain
    * _analyze
    * _cat
    * _reindex
    * ...

---

# Interacting with Elasticsearch

* You can interact with Elasticsearch using:
    * curl
    * an SDK (Java, JavaScript, Python, ...)
    * Postman
    * Kibana Dev Tools

---
layout: cover
---
# Elasticsearch and Kibana Demo
