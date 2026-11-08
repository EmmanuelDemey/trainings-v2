---
layout: cover
---

# 1 - Elasticsearch

---

# Learning objectives

By the end of this sequence (**~20 min**), you will be able to:

- **Explain** what a search engine does that a database does not
- **Place** Elasticsearch among the other solutions: Lucene, Solr, OpenSearch, SaaS
- **Tell apart** the licences of Elasticsearch over time
- **List** the use cases of Elasticsearch and the products of the Elastic Stack

---

# What is a search engine?

A system built to answer **fast** and **relevant** searches over large volumes of data.

- **Pre-indexes** the documents: the work is done at write time, not at read time
- **Analyzes** the text: case, accents, plurals, synonyms
- **Scores** each result: the most relevant first
- Handles **structured** (numbers, dates, codes) and **unstructured** (free text) data

<br />

> What the use cases have in common: you **write once**, **read a lot**, and want
> an answer in **milliseconds**.

---

# The solutions

| Family | Products |
|---|---|
| **Library** | **Apache Lucene** (Java): embedded in your application |
| **Distributed server** | **Elasticsearch**, Apache Solr, OpenSearch (fork of Elasticsearch 7.10) |
| **Managed service** | Elastic Cloud, Amazon OpenSearch Service, Algolia, Azure AI Search… |

<br />

- Elasticsearch, Solr and OpenSearch all build on **Lucene**
- What they add: distribution, replication, a **REST API**, aggregations, security

---

# Lucene: the engine inside

An open-source Java library that **indexes** and **searches** documents:

```java
QueryParser qp = new QueryParser("title", new StandardAnalyzer());
Query query = new BooleanQuery.Builder()
    .add(qp.parse("foo bar"), BooleanClause.Occur.MUST)
    .add(new TermQuery(new Term("id", "123456")), BooleanClause.Occur.MUST_NOT)
    .build();
```

- Powerful, but **one process, one machine**: no cluster, no HTTP API
- Each **shard** of Elasticsearch is a complete Lucene index

---

# Elasticsearch

A **distributed** search and analytics engine built on Lucene.

- **Distributed** — horizontal scalability through **shards**, resilience through **replicas**
- **RESTful** — everything goes through **HTTP + JSON**
- **Near real time** — a document is searchable about **one second** after it is written
- **Analytics** — aggregations over millions of documents
- **Beyond text** — geo, vectors (kNN, semantic search), ES|QL

<br />

> The training is based on **Elasticsearch 9.5.6**.

---

# The licences

| Versions | Licence |
|---|---|
| **≤ 7.10** | Apache 2.0 |
| **7.11 → 8.15** | SSPL or Elastic License 2.0: selling it "as a service" is forbidden |
| **≥ 8.16** | + **AGPL v3**: open source (OSI) again |

<br />

- For an **end user**, the free tier (**Basic**) covers search, aggregations, security, ILM…
- Some features need a paid licence: machine learning, searchable snapshots, cross-cluster replication…
- **OpenSearch**: the fork of 7.10.2 by AWS (2021), now at the Linux Foundation

---
src: ../../elasticsearch-common/slides/stack/elastic-stack.md
---

---

# The community

- **Eland** — Elasticsearch from Python and pandas; import machine learning models
- **Rally** — the benchmarking tool of Elasticsearch
- **Testcontainers** — an Elasticsearch in Docker for the integration tests (chapter 16)
- **Official clients** — Java, JavaScript, Python, Go, .NET, PHP, Ruby, Rust

---

# Search engine vs database

| | Relational database | Search engine |
|---|---|---|
| **Queries** | Exact: `=`, `>`, `<`, `LIKE` | Full text, typos, synonyms |
| **Relevance** | No notion of score | Results ranked by **score** |
| **Structure** | Strict schema, normalized | JSON documents, **denormalized** |
| **Joins, transactions** | Yes | No (or very limited) |
| **Use cases** | Source of truth, transactions | Search, analytics, logs |

<br />

> Elasticsearch is rarely the **source of truth**: data is usually kept in a database
> and **copied** into Elasticsearch to be searched.

---

# When to use Elasticsearch?

- **Full-text search** — e-commerce catalogue, documentation, intranet: typos, synonyms, suggestions
- **Observability** — logs, metrics, traces: index a lot, aggregate over time
- **Security (SIEM)** — correlate events, detect threats
- **Analytics** — filtering and aggregations, in near real time
- **Geospatial** — "restaurants within 2 km"
- **Vector search** — semantic search, RAG

---

# Quiz

**Which statement about Elasticsearch is true?**

- A) It replaces a relational database, transactions included
- B) Each of its shards is a Lucene index
- C) It is only licensed under SSPL
- D) A document is searchable only after a manual commit

<v-click>

**Answer: B** — Elasticsearch distributes Lucene indices, the shards. No multi-document transactions; AGPL is an option since 8.16; a refresh makes documents searchable every second.

</v-click>
