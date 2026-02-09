---
layout: intro
---

# Elasticsearch - Sparks Training
## Utiliser ElasticSearch en production (2 jours)

Programme Sparks

By Emmanuel DEMEY

---

# Day 1 Agenda
## Fundamentals, Mapping and Search (9am-5pm)

**Morning (9am-12:30pm)**:
- Introductory chapter: Terminology and basic concepts
- Installation and configuration
- Indexing and document management (CRUD, Bulk API)

**Afternoon (2pm-5pm)**:
- Mapping and Schemas
- Analyzers
- Search principles: QueryDSL, Full-text, Exact, Geo
- Highlighting
- Sorting and Pagination

---

# Day 2 Agenda
## Advanced Features, Architecture and Production (9am-5pm)

**Morning (9am-12:30pm)**:
- Routing and Percolation
- Aggregations (metrics, buckets, sub-aggregations)
- Multi-tenant Architecture (aliases, multi-index, data streams)
- Design Patterns for Big Data

**Afternoon (2pm-5pm)**:
- Ingest Pipelines
- Data Retention and ILM
- Shard Allocation and Low-Level Replication
- Elasticsearch in Production (sizing, performance, best practices)
- Conclusion and Recommendations

---
src: ./chapters/elasticsearch/01_presentation_general.md
hide: false
---

---
src: ./chapters/elasticsearch/01_general_concepts.md
hide: false
---

---
src: ./chapters/elasticsearch/02_installation_config.md
hide: false
---

---
src: ./chapters/elasticsearch/03_indexation.md
hide: false
---

---

# Morning Recap - Day 1

<v-clicks>

**What we covered this morning**:
- Elasticsearch is a **distributed search engine** built on Lucene
- The **inverted index** is the core data structure
- Documents are indexed as **JSON** via a REST API
- The **Bulk API** is essential for efficient ingestion
- An Elasticsearch cluster is composed of **nodes**, **indices**, **shards**, and **replicas**
- Cluster health: **green** / **yellow** / **red**

**Key takeaway**: Always verify your cluster health before and after operations!

</v-clicks>

---
layout: center
---

# Lunch Break - Day 1
## 12:30pm - 2:00pm

Back at 2pm for: **Mapping, Analyzers and Search**

---
src: ./chapters/elasticsearch/04_mapping.md
hide: false
---

---
src: ./chapters/elasticsearch/04_analyzers.md
hide: false
---

---
src: ./chapters/elasticsearch/05_search.md
hide: false
---

---
src: ./chapters/elasticsearch/05_highlighting.md
hide: false
---

---
layout: end
---

# End of Day 1

## Questions?

<v-clicks>

**What we covered today**:
- Elasticsearch fundamentals: cluster, indexing, CRUD
- Mapping: explicit types, multi-fields, nested, templates
- Analyzers: tokenizers, filters, custom analyzers
- Search: full-text, term, range, bool, geo, highlighting

**Tomorrow**: Routing, Percolation, Aggregations, Multi-tenancy, Big Data Patterns, Ingest, ILM, Production

</v-clicks>

**See you tomorrow at 9am for Day 2**

Contact: demey.emmanuel@gmail.com

---
layout: intro
---

# Day 2
## Advanced Features, Architecture and Production

---
src: ./chapters/elasticsearch/05_routing.md
hide: false
---

---
src: ./chapters/elasticsearch/05_percolation.md
hide: false
---

---
src: ./chapters/elasticsearch/05_agregation.md
hide: false
---

---
src: ./chapters/elasticsearch/03_multitenancy.md
hide: false
---

---
src: ./chapters/elasticsearch/06_bigdata_patterns.md
hide: false
---

---

# Morning Recap - Day 2

<v-clicks>

**What we covered this morning**:
- **Routing**: Custom shard targeting for multi-tenant performance
- **Percolation**: Stored queries for real-time alerting
- **Aggregations**: Metrics, buckets, sub-aggregations for analytics
- **Multi-tenancy**: Aliases, filtered aliases, cross-index, data streams
- **Big Data Patterns**: Time-based indices, denormalization, rollover

**Key takeaway**: Aliases and data streams are the foundation of production data management!

</v-clicks>

---
layout: center
---

# Lunch Break - Day 2
## 12:30pm - 2:00pm

Back at 2pm for: **Ingest, ILM, Production and Conclusion**

---
src: ./chapters/elasticsearch/06_ingest.md
hide: false
---

---
src: ./chapters/elasticsearch/07_retention_ilm.md
hide: false
---

---
src: ./chapters/elasticsearch/06_shard_allocation.md
hide: false
---

---
src: ./chapters/elasticsearch/06_sizing_performance.md
hide: false
---

---
src: ./chapters/elasticsearch/08_production_best_practices.md
hide: false
---

---
src: ./chapters/elasticsearch/08_troubleshooting.md
hide: false
---

---

# Conclusion and Recommendations

<v-clicks>

**Key Takeaways**:
- **Mapping matters**: Always define explicit mappings in production
- **Shard sizing**: Target 20-50 GB per shard, monitor shard count
- **Aliases**: Use them to decouple applications from physical indices
- **ILM**: Automate data lifecycle for cost optimization
- **Monitoring**: Set up alerts on heap, disk, and cluster health
- **Testing**: Load test your queries and indexing pipeline

**Next Steps**:
- Practice with real-world data
- Set up a monitoring stack (Kibana Stack Monitoring)
- Implement ILM policies for your use case
- Review Elasticsearch documentation for updates

</v-clicks>

---

# Resources

**Official Documentation**:
- [Elasticsearch Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Elastic Blog](https://www.elastic.co/blog)
- [Elastic Community](https://discuss.elastic.co/)

**Tools**:
- [Rally](https://esrally.readthedocs.io/) - Benchmarking tool for Elasticsearch
- [Curator](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/index.html) - Index management
- [TestContainers](https://testcontainers.com/) - Integration testing with Elasticsearch

---
layout: end
---

# Thank You!

## Questions?

Contact: demey.emmanuel@gmail.com

## Elasticsearch - Sparks Training

2-day Training - Complete

By Emmanuel DEMEY
