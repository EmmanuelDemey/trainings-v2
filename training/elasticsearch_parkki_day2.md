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
layout: end
---

# Thank You!

## Questions?

**See you tomorrow at 9am for Day 3**

Contact: demey.emmanuel@gmail.com

## Day 3: Monitoring, Security and APM

Customized 3-day training

By Emmanuel DEMEY
