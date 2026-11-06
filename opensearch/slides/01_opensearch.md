---
layout: cover
---

# 1 - OpenSearch

---

# Learning objectives

By the end of this section (**~20 min**), you will be able to:

- **Place** OpenSearch: a fork of Elasticsearch 7.10 that became a project of its own
- **Tell apart** the licences: Apache 2.0, SSPL, Elastic License, AGPL
- **List** the use cases of a distributed search engine
- **Describe** the role of OpenSearch Dashboards

---

# From Elasticsearch to OpenSearch

- **2010** — Elasticsearch, a distributed search engine built on **Apache Lucene**, under the **Apache 2.0** licence
- **January 2021** — Elastic moves Elasticsearch and Kibana (from 7.11) to **SSPL** and the **Elastic License**: no longer an open source licence in the OSI sense
- **April 2021** — AWS releases **OpenSearch 1.0**, a fork of the last Apache 2.0 release: **Elasticsearch 7.10.2** and **Kibana 7.10.2**
- **September 2024** — OpenSearch joins the **Linux Foundation** (OpenSearch Software Foundation): open governance, no longer AWS alone
- **2025** — **OpenSearch 3.0**: Lucene 10, Java 21, new vector features

<br />

> Since 2021, the two projects have **diverged**: the core APIs stay close, the
> recent features (ES|QL on the Elastic side, PPL or plugins on the OpenSearch side)
> are not portable.

---

# The licences

| Project | Licence | What it changes |
|---|---|---|
| **OpenSearch** | Apache 2.0 | Use, modification, resale as SaaS: all free |
| **Elasticsearch ≤ 7.10** | Apache 2.0 | Same — it is the base of the fork |
| **Elasticsearch 7.11 → 8.15** | SSPL or Elastic License 2.0 | Selling Elasticsearch "as a service" is forbidden |
| **Elasticsearch ≥ 8.16** | + **AGPL v3** | Open source (OSI) again, with the obligation to publish the changes made to a service |

<br />

- For an **end user**, both are free
- The difference lies in **redistribution** and **managed service offerings**
- OpenSearch: **all** features (security, alerting, ML…) are
  free, as **plugins**

---

# What OpenSearch is used for

- **Full-text search** — e-commerce catalogue, documentation, internal search engine:
  relevance, typos, suggestions
- **Observability** — logs, metrics, traces: index a lot, search fast,
  aggregate over time
- **Security (SIEM)** — correlate events, detect anomalies
- **Analytics** — aggregations over millions of documents, in near real time
- **Vector search** — **k-NN** plugin: semantic search, RAG

<br />

> What they have in common: you **write once**, **read a lot**, and want an
> answer in **milliseconds**.

---

# The ecosystem

| Component | Role |
|---|---|
| **OpenSearch** | The engine: stores, indexes, searches, aggregates. REST API on port **9200** |
| **OpenSearch Dashboards** | The web interface (fork of Kibana): Discover, visualizations, dashboards, **Dev Tools**. Port **5601** |
| **Data Prepper** | Server-side ingestion: logs, traces, transformations |
| **Plugins** | Security, Alerting, Index State Management, k-NN, SQL/PPL, Anomaly Detection… |
| **Clients** | Java, Python, JavaScript, Go, .NET, Rust… |

<br />

- Logstash, Fluent Bit and Beats 7.x can also write to OpenSearch
- **Managed services**: Amazon OpenSearch Service, Aiven, Instaclustr…

---

# Quiz

**OpenSearch is a fork of which version of Elasticsearch?**

- A) 6.8
- B) 7.10
- C) 8.0
- D) 8.16

<v-click>

**Answer: B** — 7.10.2 is the last version of Elasticsearch released under Apache 2.0.

</v-click>
