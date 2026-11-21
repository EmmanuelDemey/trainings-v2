---
layout: cover
---

# Agenda

---

# Day 1 — From the cluster to the queries

<table>
<tbody>
 <tr style="border: 0; font-size: 0.85em">
    <td>
        <ul>
            <li>Introduction to Elasticsearch 9.x
                <ul>
                    <li>1 - Elasticsearch, the Elastic Stack</li>
                    <li>27 - Deployment options: self-managed, Cloud Hosted, Serverless</li>
                    <li>2 - Core concepts · 3 - Installation, Dev Tools · 4 - Documents, CRUD</li>
                </ul>
            </li>
            <li>Distributed architecture
                <ul>
                    <li>28 - Cluster formation, node roles, routing, replication, recovery</li>
                    <li>Data tiers: 28, then 19 and 22 for the details</li>
                </ul>
            </li>
            <li>Index management
                <ul>
                    <li>5 - Mapping · 6 - Analyzers · 7 - Templates, aliases, reindex</li>
                    <li>20 - Data streams · 29 - Index management in 9.5</li>
                    <li>30 - Index modes: standard, LogsDB, TSDB, Columnar</li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>Search fundamentals
                <ul>
                    <li>8 - Query DSL · 9 - Relevance and scoring</li>
                    <li>10 - Sorting, pagination, highlighting, cross-cluster search</li>
                    <li>11 - Aggregations</li>
                </ul>
            </li>
            <li>ES|QL
                <ul>
                    <li>12 - <code>FROM</code>, <code>WHERE</code>, <code>EVAL</code>, <code>STATS</code>, <code>LOOKUP JOIN</code></li>
                    <li>31 - <code>ENRICH</code>, full text, what's new in 9.5</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Day 2 — AI-powered search and production

<table>
<tbody>
 <tr style="border: 0; font-size: 0.85em">
    <td>
        <ul>
            <li>Advanced search and data modelling
                <ul>
                    <li>32 - Nested objects, parent/child</li>
                    <li>10 - Geospatial search, percolator</li>
                    <li>9 - Boosting, function scores · 6 - Synonyms</li>
                </ul>
            </li>
            <li>AI-powered search
                <ul>
                    <li>13 - Vectors, kNN, <code>semantic_text</code>, retrievers</li>
                    <li>33 - Vector search in 9.5: sparse, HNSW, BBQ, DiskBBQ, VectorDB</li>
                    <li>34 - RAG and Agent Builder</li>
                    <li>Workshop 21 - A hybrid semantic search application</li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>Elasticsearch in production
                <ul>
                    <li>21 - Capacity planning, sharding, JVM heap and file system cache</li>
                    <li>35 - Batched query execution</li>
                    <li>18 - Snapshots, restore, upgrading to 9.x</li>
                    <li>17 - Security: authentication, roles, API keys</li>
                    <li>23 - Monitoring: Stats and Info APIs, Stack Monitoring</li>
                </ul>
            </li>
            <li>25 - Conclusion and recommendations</li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Training goals

By the end of the two days, you will be able to:

- **Understand** the distributed architecture of Elasticsearch 9.x
- **Design** indices, mappings and data streams
- **Write** effective queries with the Query DSL and ES|QL
- **Build** AI-powered search: vector, semantic and hybrid search, RAG
- **Operate**, **monitor** and **tune** a cluster in production
- **Use** the new features of Elasticsearch 9.5

<br />

> The training is based on **Elasticsearch 9.5.6** and **Kibana 9.5.6**.

---

# Audience and prerequisites

**Audience**: DevOps engineers, database administrators, developers.

**Prerequisites**:

- Basic knowledge of **Linux**, **HTTP / REST APIs** and **JSON**
- No prior Elasticsearch or machine learning experience required

**Duration**: 2 days.

**Equipment**: a machine with **Docker** (4 GB of free RAM) and a browser.

---

# Two days, two themes

| | Theme | Chapters |
|---|---|---|
| **Day 1** | The cluster, the indices, the queries | 1, 27, 2 → 8, 28, 20, 29, 30, 9 → 12, 31 |
| **Day 2** | AI-powered search, production | 32, 13, 33, 34, 21, 35, 18, 17, 23, 25 |

<br />

- The workshops are **self-contained**: each one creates its own data
- A **quiz** closes the key chapters, a **final quiz** and a **retrospective** close the training
- Chapters 19 (ILM), 22 (production architecture) and 24 (alerting): **if time allows**, or to read afterwards

---

# Teaching methods

- Alternating **theory** and **hands-on practice**
- Live demos in **Kibana Dev Tools**
- Feedback from the trainer's experience
- Digital materials provided: slides, workshop instructions, solutions

<br />

# Assessment

- A **self-assessment questionnaire** before the session
- **Quizzes** corrected together
- Continuous assessment through the **workshops**
- A **final questionnaire**, mirroring the self-assessment

---

# The lab

One Elasticsearch node and Kibana, locally, with Docker:

<!-- ci: skip -->
```bash
docker network create elastic
docker run -d --name es --net elastic -p 9200:9200 -m 2GB \
  -e discovery.type=single-node -e ELASTIC_PASSWORD=training \
  -e xpack.license.self_generated.type=trial \
  docker.elastic.co/elasticsearch/elasticsearch:9.5.6
```

- Elasticsearch: **https://localhost:9200** — user `elastic`, self-signed certificate
- Kibana, enrolled in chapter 3: **http://localhost:5601** → ☰ menu → **Dev Tools**
- The **trial** licence unlocks the inference models of the AI-powered search chapters

---
layout: two-cols
---

# How to switch to this program

*For the trainer — remove this slide from the deck you deliver.*

The deck is the **3-day** program by default. For this one:

1. `slides/00_intro.md` → `slides/_00_intro.md`
2. `slides/_00_intro_2days.md` → `slides/00_intro_2days.md`
3. Turn off the chapters out of the plan:
   `14_ingest`, `15_transforms`, `16_sdk`,
   `19_retention`, `22_production_architecture`,
   `24_alerting`, `26_appendix_operations`
4. And their workshops:
   `09_ingest`, `10_transforms_pivot`,
   `11_transforms_continuous`, `12_sdk`,
   `15_ilm_retention`, `18_production_architecture`,
   `20_alerting`

::right::

<br /><br />

- Turning off = a `_` at the start of the name
- The **order** stays the one of the numbers: the new chapters 27 → 35 come after the
  conclusion. Move them into place with `pnpm exec training-kit move chapter 27 2` and the like
- `pnpm run list` shows what the deck will hold
