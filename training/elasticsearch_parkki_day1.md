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
