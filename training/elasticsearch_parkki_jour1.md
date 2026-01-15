---
theme: seriph
highlighter: shiki
lineNumbers: true
css: unocss
download: true
exportFilename: elasticsearch-parkki-jour1-slides
info: |
  ## Elasticsearch - Parkki Training - Day 1
  By Emmanuel DEMEY - HumanCoders

  Customized training for Parkki: Fundamentals and Architecture
  Focus on specific issues: JVM, indexing, costs
drawings:
  persist: false
---

# Elasticsearch

--- 
layout: intro
---

# Day 1 Agenda
## Fundamentals and Architecture (9am-5pm)

**Morning (9am-12:30pm)**:
- General presentation and concepts
- Installation and configuration
- Indexing and document management

**Afternoon (2pm-5pm)**:
- Mapping and Schemas - Critical for your use case
- Basic search

---
src: ./chapters/elasticsearch/01_general_concepts.md
hide: false
---


---
src: ./chapters/elasticsearch/02_installation_config.md
hide: false
---

# Node Types: Impact for You

For an Observability cluster with 15M logs/day:

<v-clicks>

| Type | Role | Importance for you |
|------|------|---------------------|
| **Master** | Cluster management | Critical (stability) |
| **Data (Hot)** | Recent logs | Very critical (performance) |
| **Data (Warm)** | Older logs | Important (costs) |
| **Ingest** | Preprocessing | Optional depending on pipeline |
| **Coordinating** | Request routing | Important (Kibana) |

</v-clicks>

<br>

<v-click>

> Recommended architecture: **Hot/Warm** to optimize costs and performance

</v-click>

---
src: ./chapters/elasticsearch/03_indexation.md
hide: false
---

# Bulk API: Best Practices

For your 15M logs/day:

```json
POST /_bulk
{"index":{"_index":"logs-app-2025.01.15"}}
{"timestamp":"2025-01-15T10:30:00","level":"ERROR","message":"..."}
{"index":{"_index":"logs-app-2025.01.15"}}
{"timestamp":"2025-01-15T10:30:01","level":"INFO","message":"..."}
```

<v-clicks>

**Recommendations**:
- Batch size: **5-15 MB** (optimal)
- Use **data streams** for logs
- Disable refresh during massive bulk
- Monitor bulk errors

</v-clicks>


---
layout: center
---

# Lunch Break
## 12:30pm - 2:00pm

Back at 2pm for the most critical part: **Mapping and Schemas**

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

# Tomorrow: Day 2

**Performance, Optimization and Production**

<v-clicks>

**Morning**:
- **Aggregations** (Kibana dashboards)
- **Sizing and Capacity Planning** ⭐ (15M logs/day)
- **Data Retention and ILM** ⭐ (optimize costs)

**Afternoon**:
- **Operating and Troubleshooting** ⭐ (JVM)
- **Audit of your cluster** 🎯


</v-clicks>

---
layout: end
---

# Thank You!

## Questions?

**See you tomorrow at 9am for Day 2**

Contact: demey.emmanuel@gmail.com

## Day 2: Performance, Optimization and Production

Customized 3-day training

By Emmanuel DEMEY

---
layout: center
---

# Day 1 Recap

<v-clicks>

- **Core concepts**: Cluster, Index, Shard, Document
- **Mapping**: text vs keyword (critical for JVM)
- **Templates**: Index templates, component templates
- **Search**: Query DSL, bool query

</v-clicks>

<br>

<v-click>

> Today: Let's tackle the **real problems**!

</v-click>

---
layout: intro
---

# Day 2 Agenda
## Performance, Optimization and Production (9am-5pm)

**Morning (9am-12:30pm)**:
- Aggregations
- Ingest Pipelines
- Data Retention and ILM

**Afternoon (2pm-5pm)**:
- Operating and Troubleshooting
- Audit of your cluster

---
src: ./chapters/elasticsearch/05_agregation.md
hide: false
---

---
src: ./chapters/elasticsearch/06_ingest.md
hide: false
---

---
src: ./chapters/elasticsearch/07_retention_ilm.md
hide: false
---

---
layout: center
---

# Lunch Break
## 12:30pm - 2:00pm

Back at 2pm for: **Operating and Troubleshooting**

---
src: ./chapters/elasticsearch/08_troubleshooting.md
hide: false
---

---
src: ./chapters/elasticsearch/09_audit.md
hide: false
---

---
layout: center
---

# Day 2 Summary

---

# What We Covered Today

<v-clicks>

1. **Aggregations**: Metrics, buckets, dashboards
2. **Sizing**: Shard calculation, memory:data ratios
3. **Thread Pools**: Rejection monitoring
4. **Watermarks**: Disk space management
5. **ILM**: Automated Hot/Warm/Delete
6. **Data Streams**: Simplified log management
7. **Troubleshooting**: JVM, shards, slowlogs debugging
8. **Audit**: Analysis of your cluster

</v-clicks>

---

# Impact for Parkki

<v-clicks>

| Action | Impact |
|--------|--------|
| ILM Hot/Warm/Delete | **-65% RAM** |
| refresh_interval: 30s | **Stabilized JVM** |
| keyword vs text | **Less fielddata** |
| 1 shard/daily index | **Reduced overhead** |
| Thread pool monitoring | **Problem anticipation** |

</v-clicks>

---

# Tomorrow: Day 3

**Monitoring, Security and APM**

<v-clicks>

**Morning**:
- **Deep monitoring** (anticipate problems)
- **Alerting** (react proactively)

**Afternoon**:
- **Security** (authentication, authorization)
- **APM** (your use case)
- **Summary and action plan**

</v-clicks>


---
layout: center
---

# Days 1 and 2 Recap

<v-clicks>

**Day 1**:
- Concepts, Mapping (critical!), Search

**Day 2**:
- Sizing, ILM, JVM Troubleshooting

</v-clicks>

<br>

<v-click>

> Today: **Monitoring, Security and APM** for stable production

</v-click>

---
layout: intro
---

# Day 3 Agenda
## Monitoring, Security and APM (9am-5pm)

**Morning (9am-12:30pm)**:
- Deep monitoring
- Alerting

**Afternoon (2pm-5pm)**:
- Security
- APM and Application Logs
- Summary and Q&A

---
src: ./chapters/elasticsearch/10_monitoring_fleet.md
hide: false
---

---
src: ./chapters/elasticsearch/11_synthetic_rum.md
hide: false
---

---
src: ./chapters/elasticsearch/12_alerting.md
hide: false
---

---
layout: center
---

# Lunch Break
## 12:30pm - 2:00pm

Back at 2pm for: **Security and APM**

---
src: ./chapters/elasticsearch/13_security.md
hide: false
---

---
src: ./chapters/elasticsearch/14_apm.md
hide: false
---

---
src: ./chapters/elasticsearch/15_summary.md
hide: false
---

---
layout: end
---

# Thank you for these 3 days!

**Emmanuel DEMEY**

edemey@proton.me
