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
- General presentation and concepts (1h)
- Installation and configuration (1h)
- Indexing and document management (1h30)

**Afternoon (2pm-5pm)**:
- Mapping and Schemas - Critical for your use case (2h)
- Basic search (1h)

---
layout: section
---

# Part 1: General Presentation and Concepts
*Duration: 1h*

---
src: ./chapters/elasticsearch/01_general_concepts.md
hide: false
---


---
layout: section
---

# Part 2: Installation and Configuration
*Duration: 1h*

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
layout: section
---

# Part 3: Indexing and Document Management
*Duration: 1h30*

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

# Refresh Interval: Impact on JVM

The `refresh_interval` controls document visibility

```json
PUT /logs-app
{
  "settings": {
    "refresh_interval": "30s"  // Instead of "1s" default
  }
}
```

<v-clicks>

**Impact for you**:
- Frequent refresh = Overloaded JVM
- 15M logs/day = lots of refreshes
- **Recommendation**: 30s or more for logs

> Refresh creates segments → too many segments = JVM under pressure

</v-clicks>

---

# Cluster Status: Understanding the Colors

<v-clicks>

| Status | Meaning | Action |
|--------|---------|--------|
| **Green** | All shards are assigned | All good |
| **Yellow** | All primaries OK, but not all replicas | Check allocation |
| **Red** | At least one primary not assigned | URGENT! |

</v-clicks>

<br>

<v-click>

```bash
GET /_cluster/health

{
  "status": "yellow",
  "number_of_nodes": 3,
  "unassigned_shards": 5  // ⚠️ To investigate
}
```

</v-click>

---
layout: center
---

# Lunch Break
## 12:30pm - 2:00pm

Back at 2pm for the most critical part: **Mapping and Schemas**

---
layout: section
---

# Part 4: Mapping and Schemas
*Duration: 2h*

---
src: ./chapters/elasticsearch/04_mapping.md
hide: false
---

---

# text vs keyword: The Costly Mistake

For application logs:

<v-clicks>

**text**:
- Analyzed (tokenization)
- Full-text search
- High memory consumption
- ⚠️ Do not use for filtering/aggregation

**keyword**:
- Not analyzed
- Exact match
- Low memory usage
- ✅ Perfect for filtering/aggregation

</v-clicks>

---

# Example: Optimized Log Mapping

```json {all|3-5|6-9|10-11|12-15|all}
PUT /logs-app
{
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "level": { "type": "keyword" },          // ✅ For filter (level:ERROR)
      "message": {
        "type": "text",                        // ✅ For full-text search
        "fields": {
          "keyword": { "type": "keyword" }     // ✅ Optional multi-field
        }
      },
      "user_id": { "type": "keyword" },        // ✅ No analysis needed
      "response_time": { "type": "long" },
      "ip": { "type": "ip" }                   // ✅ Specialized type
    }
  }
}
```

---

# Common Mistake: text for Everything

❌ **Non-optimized mapping**:

```json
{
  "properties": {
    "level": { "type": "text" },      // ❌ Wasteful!
    "user_id": { "type": "text" },    // ❌ Wasteful!
    "ip": { "type": "text" }          // ❌ Wasteful!
  }
}
```

<v-clicks>

**Consequences**:
- Overloaded fielddata cache → **JVM spinning out of control**
- Larger index → **increased costs**
- Slower searches

> This is probably a cause of your JVM issues!

</v-clicks>

---

# Object vs Nested: The Array Trap

Problem with **object arrays**:

```json
{
  "users": [
    { "name": "Alice", "role": "admin" },
    { "name": "Bob", "role": "user" }
  ]
}
```

<v-clicks>

Elasticsearch flattens internally:
```json
{
  "users.name": ["Alice", "Bob"],
  "users.role": ["admin", "user"]
}
```

**Problem**: Query `name:Alice AND role:user` matches the document!

</v-clicks>

---

# Solution: Nested Type

```json {all|4|5-8|all}
PUT /logs-app
{
  "mappings": {
    "properties": {
      "users": {
        "type": "nested",              // ✅ Preserves the relationship
        "properties": {
          "name": { "type": "keyword" },
          "role": { "type": "keyword" }
        }
      }
    }
  }
}
```

<v-clicks>

**Warning**: `nested` consumes more resources
- Use only when necessary
- For your APM logs, often useful for spans

</v-clicks>

---

# Dynamic Templates: Automate Mapping

For your logs with many fields:

```json {all|4-10|11-17|all}
PUT /logs-app
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings_as_keywords": {
          "match_mapping_type": "string",
          "mapping": { "type": "keyword" }    // Default to keyword
        }
      },
      {
        "message_as_text": {
          "match": "message",
          "mapping": { "type": "text" }       // Exception for message
        }
      }
    ]
  }
}
```

---

# Index Templates: Centralize Config

For your daily logs:

```json {all|3|4-6|7-16|all}
PUT /_index_template/logs-app-template
{
  "index_patterns": ["logs-app-*"],
  "data_stream": { },                        // ✅ Enables data streams
  "priority": 500,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "refresh_interval": "30s"              // ✅ Optimized for bulk
    },
    "mappings": {
      "properties": {
        // ... your optimized mapping
      }
    }
  }
}
```

<v-click>

> With data streams + template, each day = new index automatically

</v-click>

---

# Component Templates: Reusability

Modular and reusable:

```json
PUT /_component_template/logs-settings
{
  "template": {
    "settings": {
      "number_of_shards": 1,
      "refresh_interval": "30s"
    }
  }
}

PUT /_component_template/logs-mappings
{
  "template": {
    "mappings": {
      "properties": {
        "timestamp": { "type": "date" },
        "level": { "type": "keyword" }
      }
    }
  }
}
```

---

# Combining Component Templates

```json {all|3|4-7|all}
PUT /_index_template/logs-app-template
{
  "index_patterns": ["logs-app-*"],
  "composed_of": [
    "logs-settings",
    "logs-mappings"
  ],
  "priority": 500
}
```

<v-clicks>

**Benefits**:
- Reusability across different log types
- Simplified maintenance
- Guaranteed consistency

</v-clicks>


---
layout: section
---

# Part 5: Basic Search
*Duration: 1h*

---
src: ./chapters/elasticsearch/05_search.md
hide: false
---

# Search API: Basics

```bash
GET /logs-app-*/_search
{
  "query": {
    "match": {
      "message": "error"
    }
  },
  "size": 20,
  "from": 0,
  "sort": [
    { "timestamp": "desc" }
  ]
}
```

<v-clicks>

- `size`: number of results (max 10000)
- `from`: offset for pagination
- `sort`: custom sorting

</v-clicks>

---

# Query DSL: Match vs Term

<v-clicks>

**match**: analyzed search (for text)
```json
{
  "query": {
    "match": { "message": "connection error" }
  }
}
```

**term**: exact search (for keyword)
```json
{
  "query": {
    "term": { "level": "ERROR" }
  }
}
```

</v-clicks>

---

# Query DSL: Bool Query

Combine multiple conditions:

```json {all|4-6|7-9|10-12|all}
GET /logs-app-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "level": "ERROR" } }
      ],
      "filter": [
        { "range": { "timestamp": { "gte": "now-1h" } } }
      ],
      "must_not": [
        { "term": { "user_id": "bot" } }
      ]
    }
  }
}
```

<v-clicks>

- `must`: must match (calculates score)
- `filter`: must match (no score, faster)
- `must_not`: must not match
- `should`: may match (score bonus)

</v-clicks>

---

# Pagination: Deep Pagination Problem

<v-clicks>

❌ **Avoid deep pagination**:
```json
{
  "from": 10000,
  "size": 100
}
```

**Problem**: Elasticsearch must sort 10100 docs on each shard!

✅ **Solutions**:
- **Search After**: efficient pagination
- **Scroll API**: for data export
- **Point in Time**: for browsing snapshot

</v-clicks>

---

# Search After: Efficient Pagination

```json
// First request
GET /logs-app-*/_search
{
  "size": 100,
  "sort": [
    { "timestamp": "desc" },
    { "_id": "asc" }
  ]
}

// Next request with search_after
GET /logs-app-*/_search
{
  "size": 100,
  "search_after": ["2025-01-15T10:30:00", "doc_123"],
  "sort": [
    { "timestamp": "desc" },
    { "_id": "asc" }
  ]
}
```

---
layout: center
---

# Day 1 Summary

---

# What We Covered Today

<v-clicks>

2. **Core concepts**: Cluster, Index, Shard, Document
3. **Installation**: Node types, configuration
4. **Indexing**: CRUD, Bulk API, refresh_interval
5. **Mapping** ⭐: text vs keyword, nested, templates
6. **Search**: Query DSL, pagination

</v-clicks>

---

# Key Points for Parkki

<v-clicks>

| Topic | Impact for you | Action |
|-------|----------------|--------|
| **Mapping** | Critical (JVM + costs) | Audit tomorrow |
| **Refresh interval** | JVM | Increase to 30s |
| **Bulk API** | Performance | Check sizing |
| **text vs keyword** | Memory | Use keyword |
| **Templates** | Consistency | Centralize config |

</v-clicks>

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
- Aggregations (1h)
- Sizing and Capacity Planning (1h30)
- Data Retention and ILM (1h)

**Afternoon (2pm-5pm)**:
- Operating and Troubleshooting (2h)
- Audit of your cluster (1h)

---
layout: section
---

# Part 6: Aggregations
*Duration: 1h*

---
src: ./chapters/elasticsearch/05_agregation.md
hide: false
---

---
layout: section
---

# Part 7: Sizing and Capacity Planning
*Duration: 1h30*

## ESSENTIAL FOR YOUR 15M LOGS/DAY

---

# Why is Sizing Critical?

<v-clicks>

With **15M logs/day**:

| Problem | Consequence |
|---------|-------------|
| Too many shards | Overloaded JVM |
| Shards too large | Slow searches |
| Bad memory:data ratio | Exploded costs |
| Poorly configured replicas | Wasted resources |

</v-clicks>

<br>

<v-click>

> Good sizing can **reduce your costs by 50%**!

</v-click>

---

# Calculating Number of Shards

Basic rules:

<v-clicks>

| Rule | Value |
|------|-------|
| Size per shard | 20-40 GB (max 50 GB) |
| Shards per GB of heap | ~20 shards max |
| Shards per node | Avoid > 1000 |

</v-clicks>

<br>

<v-click>

```
Calculation for Parkki:
- 15M logs/day x 1 KB = 15 GB/day
- 15 GB / 30 GB (target) = 0.5 → 1 shard per daily index
```

</v-click>

---

# Your Data Volume

```
Daily volume = Number of logs x Average size

For Parkki:
- 15M logs/day
- Average size: 1 KB/log
- Daily volume = 15 GB/day

With 10 days retention:
- Total volume = 150 GB
- With replicas (x2) = 300 GB
```

<v-click>

**Recommendation**: 1 primary shard per daily index

</v-click>

---

# Memory:Data Ratios

<v-clicks>

| Tier | Ratio | Usage |
|------|-------|-------|
| **Hot** | 1:30 | Recent data, active indexing |
| **Warm** | 1:160 | Less frequently accessed data |
| **Cold** | 1:500 | Rarely accessed archives |
| **Frozen** | 1:2000+ | Very rarely accessed archives |

</v-clicks>

<br>

<v-click>

```
RAM calculation for Parkki (Hot tier):
- Hot data (2 days) = 30 GB x 2 (replicas) = 60 GB
- RAM needed = 60 GB / 30 = 2 GB minimum
```

</v-click>

---

# Complete Sizing for Parkki

```
Recommended architecture:

Hot tier (days 0-2):
- 45 GB of data (x2 = 90 GB)
- RAM: 90 GB / 30 = 3 GB

Warm tier (days 3-10):
- 120 GB of data (x2 = 240 GB)
- RAM: 240 GB / 160 = 1.5 GB

Total RAM data nodes: 5-8 GB recommended
```

<v-click>

> With ILM Hot/Warm: **-65% RAM** vs all in Hot!

</v-click>

---

# Thread Pools

Thread pools manage operations:

<v-clicks>

| Thread Pool | Usage | Symptom when saturated |
|-------------|-------|------------------------|
| `write` | Indexing | Slow/rejected indexing |
| `search` | Searches | Slow queries/timeout |
| `get` | Doc retrieval | Slow GETs |
| `bulk` | Bulk API | Rejected bulks |

</v-clicks>

---

# Thread Pools Monitoring

```bash
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected

# Example result:
node_name  name   active queue rejected
node-1     write  5      0     0         # OK
node-1     search 2      0     0         # OK
node-1     bulk   0      50    123       # Problem!
```

<v-clicks>

**If rejected > 0**:
- Cluster cannot keep up with load
- Reduce indexing rate
- Increase resources

</v-clicks>

---

# Disk Watermarks

<v-clicks>

| Watermark | Threshold | Action |
|-----------|-----------|--------|
| **Low** | 85% | New shards not allocated |
| **High** | 90% | Shards moved to other nodes |
| **Flood stage** | 95% | Index becomes READ-ONLY! |

</v-clicks>

<br>

<v-click>

```bash
# Check disk usage
GET /_cat/allocation?v&h=node,shards,disk.used,disk.avail,disk.percent
```

</v-click>

<br>

<v-click>

> **Warning**: At 95%, indexing stops!

</v-click>

---

# Disk Space for Parkki

```
Calculation:
- Daily volume: 15 GB
- Retention: 10 days
- Total volume: 150 GB
- With replicas (x2): 300 GB
- With watermark margin (x1.25): 375 GB

Minimum recommended disk space: 400 GB
```

---
layout: section
---

# Part 8: Data Retention and ILM
*Duration: 1h30*

## CRITICAL FOR REDUCING YOUR COSTS

---

# Retention Strategies

<v-clicks>

| Strategy | Resources | Access | Use Case |
|----------|-----------|--------|----------|
| Open index | CPU + RAM + Disk | Real-time | Active data |
| Closed index | Disk only | Reopening needed | Short-term archives |
| Shrinked index | Fewer shards | Real-time (read) | Reduce overhead |
| Snapshot | External storage | Restoration | Backup/archives |
| Deletion | None | None | Expired data |

</v-clicks>

---

# Open/Close API

```bash
# Close an index (frees RAM/CPU)
POST /logs-2025.01.01/_close

# Verify
GET /_cat/indices/logs-*?v&h=index,status

# Reopen
POST /logs-2025.01.01/_open
```

<v-clicks>

**Benefits**:
- Immediately frees memory
- Data still on disk
- Fast reopening

</v-clicks>

---

# Shrink API

Reduce the number of shards:

```bash
# Prepare the index (read-only)
PUT /logs-old/_settings
{
  "settings": {
    "index.blocks.write": true
  }
}

# Shrink from 4 shards to 1
POST /logs-old/_shrink/logs-shrunk
{
  "settings": {
    "index.number_of_shards": 1
  }
}
```

<v-click>

> Shrink = fewer shards = less heap

</v-click>

---

# Data Streams

Perfect for your logs:

```
Data Stream: logs-parkki
├── .ds-logs-parkki-2025.01.13-000001 (read)
├── .ds-logs-parkki-2025.01.14-000002 (read)
└── .ds-logs-parkki-2025.01.15-000003 (write)
```

<v-clicks>

**Benefits**:
- Automatic rollover
- Unique name (no more manual management)
- Easy deletion of old indices
- Transparent search

</v-clicks>

---

# Index Lifecycle Management (ILM)

Lifecycle phases:

```
Hot → Warm → Cold → Frozen → Delete
 │      │      │       │        │
 │      │      │       │        └─ Permanent deletion
 │      │      │       └─ Snapshot + minimal resources
 │      │      └─ Read-only, fewer replicas
 │      └─ Read-only, shrink, force merge
 └─ Active indexing, frequent searches
```

---

# ILM Policy for Parkki

```json
PUT /_ilm/policy/logs-parkki-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "20gb"
          }
        }
      },
      "warm": {
        "min_age": "2d",
        "actions": {
          "readonly": {},
          "forcemerge": { "max_num_segments": 1 }
        }
      },
      "delete": {
        "min_age": "10d",
        "actions": { "delete": {} }
      }
    }
  }
}
```

---

# ILM Timeline for Parkki

<v-clicks>

| Day | Phase | Actions |
|-----|-------|---------|
| 0-1 | Hot | Active indexing |
| 1 | Hot | Rollover (new backing index) |
| 2 | Warm | readonly, forcemerge |
| 10 | Delete | Automatic deletion |

</v-clicks>

<br>

<v-click>

**Estimated savings**:

```
Without ILM: 150 GB hot → RAM 5 GB
With ILM: 30 GB hot + 120 GB warm → RAM 1.75 GB

Reduction: -65% RAM!
```

</v-click>

---

# Associate ILM with a Template

```json
PUT /_index_template/logs-parkki-template
{
  "index_patterns": ["logs-parkki-*"],
  "data_stream": {},
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "refresh_interval": "30s",
      "index.lifecycle.name": "logs-parkki-policy"
    }
  }
}
```

<v-click>

> Each new index automatically inherits the ILM policy

</v-click>

---

# ILM Monitoring

```bash
# Global ILM status
GET /_ilm/status

# Indices managed by ILM
GET /*/_ilm/explain?only_managed=true

# Indices with errors
GET /*/_ilm/explain?only_errors=true

# Retry after error
POST /logs-parkki/_ilm/retry
```

---
layout: center
---

# Lunch Break
## 12:30pm - 2:00pm

Back at 2pm for: **Operating and Troubleshooting**

---
layout: section
---

# Part 9: Operating and Troubleshooting
*Duration: 2h*

## FOR YOUR JVM ISSUES

---

# Internals: Indexing Process

```
Document → Ingest Pipeline → Index Buffer → Segment → Merge
                                  │
                                  ├─ refresh (1s by default)
                                  │     └─ Creates a new segment
                                  │
                                  └─ flush
                                        └─ Writes to disk
```

<v-clicks>

**Impact for you**:
- Frequent refresh = many segments
- Many segments = frequent merges
- Merges = CPU + I/O

</v-clicks>

---

# Segments and Merge

```bash
# View segments of an index
GET /_cat/segments/logs-parkki-*?v

# Force a merge (careful in prod!)
POST /logs-parkki-2025.01.14/_forcemerge?max_num_segments=1
```

<v-clicks>

**Best practices**:
- `refresh_interval: 30s` for logs
- Force merge only on read-only index
- ILM manages force merge automatically

</v-clicks>

---

# Slow Queries

Slowlog configuration:

```json
PUT /logs-parkki-*/_settings
{
  "index.search.slowlog.threshold.query.warn": "10s",
  "index.search.slowlog.threshold.query.info": "5s",
  "index.search.slowlog.threshold.fetch.warn": "1s"
}
```

<v-clicks>

**Where to find the logs**:
- Elastic Cloud: Stack Monitoring > Logs
- Self-hosted: `/var/log/elasticsearch/`

</v-clicks>

---

# Debugging Unassigned Shards

```bash
# View unassigned shards
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason

# Understand why
GET /_cluster/allocation/explain
{
  "index": "logs-parkki-2025.01.15",
  "shard": 0,
  "primary": true
}
```

<v-clicks>

**Common causes**:
- Disk watermark reached
- Node down
- Allocation filtering

</v-clicks>

---

# Essential CAT APIs

```bash
# Cluster health
GET /_cat/health?v

# Nodes and their metrics
GET /_cat/nodes?v&h=name,heap.percent,ram.percent,cpu,disk.used_percent

# Indices and their size
GET /_cat/indices?v&h=index,pri,rep,docs.count,store.size&s=store.size:desc

# Shards and their allocation
GET /_cat/shards?v&h=index,shard,prirep,state,node

# Disk usage per node
GET /_cat/allocation?v
```

---

# JVM Memory Management

<v-clicks>

**Heap configuration**:
- 50% of available RAM
- Maximum 31 GB (compressed oops)
- Minimum = Maximum (avoid resize)

**JVM problem symptoms**:
- Heap > 85% constantly
- Frequent and long GC
- Variable request latency
- Node "disappearing" from cluster

</v-clicks>

---

# JVM Monitoring

```bash
# Heap usage
GET /_cat/nodes?v&h=name,heap.percent,heap.current,heap.max

# Detailed JVM stats
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent

# Garbage Collection
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.gc
```

<v-clicks>

**Critical thresholds**:
- < 75%: OK
- 75-85%: Warning
- > 85%: Imminent problem

</v-clicks>

---

# Field Data Cache

**The classic trap**: aggregations on `text` fields

```bash
# View fielddata usage
GET /_cat/fielddata?v

# Detailed stats
GET /_nodes/stats/indices/fielddata?fields=*
```

<v-clicks>

**Problem**:
- `text` field in aggregation = fielddata in memory
- Fielddata can explode the heap

**Solution**:
- Use `keyword` for aggregations
- Or `text` with `keyword` sub-field

</v-clicks>

---

# Solutions to JVM Problems

<v-clicks>

| Problem | Solution |
|---------|----------|
| Heap > 85% | Reduce shards, increase refresh_interval |
| High fielddata | Use keyword instead of text |
| Too many shards | ILM + shrink |
| Frequent GC | Increase heap (max 31GB) |
| Many segments | Force merge on read-only index |

</v-clicks>

<br>

<v-click>

> Most of your JVM problems probably come from **mapping**!

</v-click>

---
layout: section
---

# Part 10: Audit of Your Cluster
*Duration: 1h*

## HANDS-ON SESSION ON YOUR CLUSTERS

---

# Audit Checklist

<v-clicks>

**1. Configuration**:
- [ ] Check elasticsearch.yml
- [ ] Node roles
- [ ] JVM settings

**2. Mappings**:
- [ ] Identify unnecessary `text` fields
- [ ] Check dynamic templates
- [ ] Analyze fielddata

**3. Sizing**:
- [ ] Number of shards vs volume
- [ ] Memory:data ratio
- [ ] Disk usage

</v-clicks>

---

# Audit Commands

```bash
# 1. Global health
GET /_cluster/health

# 2. Nodes and resources
GET /_cat/nodes?v&h=name,heap.percent,ram.percent,disk.used_percent,node.role

# 3. Problematic indices
GET /_cat/indices?v&s=store.size:desc&h=index,pri,rep,docs.count,store.size

# 4. Unassigned shards
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason&s=state

# 5. Thread pool rejections
GET /_cat/thread_pool?v&h=node_name,name,rejected&s=rejected:desc
```

---

# Mapping Audit

```bash
# View mapping of an index
GET /logs-parkki-*/_mapping

# Search for text fields
GET /logs-parkki-*/_mapping?filter_path=**.type

# Fielddata cache
GET /_cat/fielddata?v&format=json
```

<v-click>

**Questions to ask yourself**:
- Is this `text` field really necessary?
- Are we doing aggregations on this field?
- Can we switch it to `keyword`?

</v-click>

---

# Immediate Recommendations

<v-clicks>

**Quick wins**:
1. Increase `refresh_interval` to 30s
2. Switch filter fields to `keyword`
3. Set up ILM Hot/Warm/Delete
4. Configure slowlogs

**Medium term**:
1. Review mappings
2. Implement data streams
3. Optimize templates

**Long term**:
1. Hot/Warm architecture on dedicated nodes
2. Proactive monitoring with alerting
3. Automated maintenance procedures

</v-clicks>

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
- Deep monitoring (2h)
- Alerting (1h30)

**Afternoon (2pm-5pm)**:
- Security (1h30)
- APM and Application Logs (1h)
- Summary and Q&A (30min)

---
layout: section
---

# Part 11: Deep Monitoring
*Duration: 2h*

## TO ANTICIPATE PROBLEMS

---

# Cluster Health APIs

```bash
GET /_cluster/health

{
  "cluster_name": "parkki-prod",
  "status": "yellow",
  "number_of_nodes": 3,
  "number_of_data_nodes": 3,
  "active_primary_shards": 150,
  "active_shards": 280,
  "unassigned_shards": 20,        // To investigate!
  "delayed_unassigned_shards": 0,
  "number_of_pending_tasks": 0,
  "task_max_waiting_in_queue_millis": 0
}
```

<v-clicks>

| Status | Meaning |
|--------|---------|
| **green** | All good |
| **yellow** | Missing replicas |
| **red** | URGENT - Missing primaries |

</v-clicks>

---

# CAT APIs in Detail

```bash
# Nodes with key metrics
GET /_cat/nodes?v&h=name,ip,heap.percent,ram.percent,cpu,load_1m,node.role

# Indices sorted by size
GET /_cat/indices?v&h=index,health,pri,rep,docs.count,store.size&s=store.size:desc

# Shards with state
GET /_cat/shards?v&h=index,shard,prirep,state,docs,store,node

# Disk allocation
GET /_cat/allocation?v&h=node,shards,disk.indices,disk.used,disk.avail,disk.percent

# Thread pools
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected
```

---

# Cluster Allocation Explain

Why is a shard not assigned?

```bash
GET /_cluster/allocation/explain
{
  "index": "logs-parkki-2025.01.15",
  "shard": 0,
  "primary": false
}
```

<v-clicks>

**Common responses**:
- `"DISK_THRESHOLD"`: Watermark reached
- `"NODE_LEFT"`: Node departed
- `"ALLOCATION_FAILED"`: Allocation error
- `"NO_VALID_SHARD_COPY"`: No valid copy

</v-clicks>

---

# Field Data Cache Monitoring

```bash
# Fielddata usage by field
GET /_cat/fielddata?v&fields=*

# Stats per node
GET /_nodes/stats/indices/fielddata

# Eviction stats
GET /_nodes/stats/indices/fielddata?filter_path=nodes.*.indices.fielddata
```

<v-clicks>

**Alert if**:
- Fielddata > 20% of heap
- Frequent evictions
- `text` fields in fielddata

</v-clicks>

---

# Stack Monitoring with Metricbeat

Architecture:

```
Production Cluster             Monitoring Cluster
┌─────────────────────┐        ┌─────────────────────┐
│  Elasticsearch      │        │  Elasticsearch      │
│  + Metricbeat       │───────▶│  + Kibana           │
│                     │        │                     │
└─────────────────────┘        └─────────────────────┘
```

<v-click>

> **Best practice**: Separate monitoring cluster

</v-click>

---

# Configuration Metricbeat

```yaml
# metricbeat.yml
metricbeat.modules:
- module: elasticsearch
  xpack.enabled: true
  period: 10s
  hosts: ["https://localhost:9200"]
  username: "monitoring_user"
  password: "xxx"
  ssl:
    certificate_authorities: ["/etc/pki/ca.crt"]

output.elasticsearch:
  hosts: ["https://monitoring-cluster:9200"]
  username: "remote_monitoring_user"
  password: "xxx"
```

---

# Filebeat for Elasticsearch Logs

```yaml
# filebeat.yml
filebeat.modules:
- module: elasticsearch
  server:
    enabled: true
    var.paths:
      - /var/log/elasticsearch/*_server.json
  slowlog:
    enabled: true
    var.paths:
      - /var/log/elasticsearch/*_index_search_slowlog.json
      - /var/log/elasticsearch/*_index_indexing_slowlog.json
  gc:
    enabled: true
    var.paths:
      - /var/log/elasticsearch/gc.log*
```

---

# Kibana Stack Monitoring

Key metrics to monitor:

<v-clicks>

| Metric | Alert threshold |
|--------|-----------------|
| JVM Heap Usage | > 85% |
| GC Duration | > 1s |
| Thread Pool Rejections | > 0 |
| Disk Usage | > 85% |
| Query Latency (p99) | > 1s |
| Indexing Rate | Sudden drop |
| Shard Count | > 1000/node |

</v-clicks>

---

# Dashboard Monitoring

```
┌─────────────────────────────────────────────────────┐
│                  Cluster Health                      │
│  ● GREEN   Nodes: 3   Indices: 45   Shards: 180     │
├─────────────────────────────────────────────────────┤
│  JVM Heap          │  CPU Usage        │  Disk      │
│  ████████░░ 78%    │  ███░░░░░░ 35%    │  ██████░ 60%│
├─────────────────────────────────────────────────────┤
│  Indexing Rate: 15,234 docs/s                       │
│  Search Rate: 245 queries/s                         │
│  Latency (p99): 450ms                               │
├─────────────────────────────────────────────────────┤
│  Thread Pool Rejections: 0                          │
│  Pending Tasks: 0                                   │
└─────────────────────────────────────────────────────┘
```

---
layout: section
---

# Part 12: Alerting
*Duration: 1h30*

---

# Watcher API (Elasticsearch)

Watch structure:

```json
PUT _watcher/watch/jvm_heap_alert
{
  "trigger": { ... },      // When to trigger
  "input": { ... },        // Data to collect
  "condition": { ... },    // Trigger condition
  "actions": { ... }       // Actions to execute
}
```

---

# Example: JVM Heap Alert

```json
PUT _watcher/watch/jvm_heap_alert
{
  "trigger": {
    "schedule": { "interval": "1m" }
  },
  "input": {
    "http": {
      "request": {
        "host": "localhost",
        "port": 9200,
        "path": "/_nodes/stats/jvm",
        "auth": { "basic": { "username": "elastic", "password": "xxx" } }
      }
    }
  },
  "condition": {
    "script": {
      "source": "return ctx.payload.nodes.values().stream().anyMatch(n -> n.jvm.mem.heap_used_percent > 85)"
    }
  },
  "actions": {
    "notify_slack": {
      "slack": {
        "message": {
          "to": ["#alerts"],
          "text": "JVM Heap > 85%!"
        }
      }
    }
  }
}
```

---

# Trigger Types

```json
// Regular interval
{ "schedule": { "interval": "5m" } }

// Cron expression
{ "schedule": { "cron": "0 0 * * * ?" } }

// Specific times
{ "schedule": {
    "daily": { "at": ["09:00", "17:00"] }
  }
}
```

---

# Input Types

```json
// Elasticsearch search
{
  "input": {
    "search": {
      "request": {
        "indices": ["logs-*"],
        "body": {
          "query": { "term": { "level": "ERROR" } },
          "aggs": { "error_count": { "value_count": { "field": "_id" } } }
        }
      }
    }
  }
}

// External HTTP
{
  "input": {
    "http": {
      "request": { "url": "https://api.example.com/status" }
    }
  }
}
```

---

# Action Types

```json
"actions": {
  // Email
  "send_email": {
    "email": {
      "to": ["ops@parkki.com"],
      "subject": "Elasticsearch Alert",
      "body": "Critical JVM Heap!"
    }
  },

  // Webhook
  "notify_pagerduty": {
    "webhook": {
      "url": "https://events.pagerduty.com/...",
      "body": "{ \"event\": \"trigger\", ... }"
    }
  },

  // Slack
  "notify_slack": {
    "slack": {
      "message": { "to": ["#alerts"], "text": "Alert!" }
    }
  }
}
```

---

# Kibana Alerting

Simpler than Watcher:

<v-clicks>

1. **Stack Management** > **Rules and Connectors**
2. **Create rule**
3. Choose the type (Elasticsearch query, threshold, etc.)
4. Configure the condition
5. Add actions (Slack, Email, Webhook)

**Advantages**:
- Graphical interface
- Centralized management
- Execution history

</v-clicks>

---

# Recommended Alerts for Parkki

<v-clicks>

| Alert | Condition | Action |
|-------|-----------|--------|
| JVM Heap | > 85% for 5min | Slack + PagerDuty |
| Disk Watermark | > 80% | Slack |
| Cluster Status | != green | Slack + Email |
| Thread Rejections | > 0 | Slack |
| Application Errors | > 100/min | Slack |
| p99 Latency | > 2s | Slack |

</v-clicks>

---

# Example: Application Errors Alert

```json
PUT _watcher/watch/app_errors_alert
{
  "trigger": { "schedule": { "interval": "1m" } },
  "input": {
    "search": {
      "request": {
        "indices": ["logs-parkki-*"],
        "body": {
          "query": {
            "bool": {
              "filter": [
                { "term": { "level": "ERROR" } },
                { "range": { "@timestamp": { "gte": "now-1m" } } }
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": { "ctx.payload.hits.total.value": { "gt": 100 } }
  },
  "actions": {
    "notify_slack": {
      "slack": {
        "message": {
          "to": ["#parkki-alerts"],
          "text": "More than 100 errors in the last minute!"
        }
      }
    }
  }
}
```

---
layout: center
---

# Lunch Break
## 12:30pm - 2:00pm

Back at 2pm for: **Security and APM**

---
layout: section
---

# Part 13: Security
*Duration: 1h30*

---

# Enabling Security

```yaml
# elasticsearch.yml
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true
```

<v-clicks>

**Initial setup**:
```bash
# Generate passwords
bin/elasticsearch-setup-passwords auto

# Or interactive
bin/elasticsearch-setup-passwords interactive
```

</v-clicks>

---

# Authentication: Realms

Authentication chain:

```yaml
xpack.security.authc.realms:
  native:
    native1:
      order: 0
  ldap:
    ldap1:
      order: 1
      url: "ldap://ldap.parkki.com:389"
      bind_dn: "cn=admin,dc=parkki,dc=com"
  file:
    file1:
      order: 2
```

<v-click>

> Realms are evaluated in order

</v-click>

---

# Creating Users

```bash
# Via API
POST /_security/user/dev_user
{
  "password": "secure_password",
  "roles": ["kibana_user", "logs_reader"],
  "full_name": "Developer User",
  "email": "dev@parkki.com"
}

# Verification
GET /_security/user/dev_user
```

---

# Cluster Privileges

<v-clicks>

| Privilege | Description |
|-----------|-------------|
| `all` | Full cluster access |
| `monitor` | Read metrics |
| `manage` | Cluster management |
| `create_snapshot` | Snapshot creation |
| `manage_ilm` | ILM management |
| `manage_pipeline` | Ingest pipeline management |

</v-clicks>

---

# Index Privileges

<v-clicks>

| Privilege | Description |
|-----------|-------------|
| `all` | Full access |
| `read` | Read (search, get) |
| `write` | Write (index, update, delete) |
| `create` | Document creation |
| `delete` | Deletion |
| `manage` | Index management (settings, mappings) |
| `monitor` | Index metrics |

</v-clicks>

---

# Creating Roles

```json
POST /_security/role/logs_reader
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-parkki-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": ["read"],
      "resources": ["*"]
    }
  ]
}
```

---

# Document-Level Security

Filter documents by role:

```json
POST /_security/role/team_a_logs
{
  "indices": [
    {
      "names": ["logs-parkki-*"],
      "privileges": ["read"],
      "query": {
        "term": { "team": "team-a" }
      }
    }
  ]
}
```

<v-click>

> The user only sees documents with `team: team-a`

</v-click>

---

# Field-Level Security

Hide fields:

```json
POST /_security/role/logs_anonymized
{
  "indices": [
    {
      "names": ["logs-parkki-*"],
      "privileges": ["read"],
      "field_security": {
        "grant": ["@timestamp", "level", "message", "service"],
        "except": ["user_id", "ip", "email"]
      }
    }
  ]
}
```

<v-click>

> Sensitive fields are hidden

</v-click>

---

# API Keys

```bash
# Create an API key
POST /_security/api_key
{
  "name": "parkki-app-key",
  "expiration": "30d",
  "role_descriptors": {
    "logs_writer": {
      "indices": [
        {
          "names": ["logs-parkki-*"],
          "privileges": ["create_doc", "create_index"]
        }
      ]
    }
  }
}

# Response
{
  "id": "VuaCfGcBCdbkQm...",
  "api_key": "ui2lp2axTNmsyakw9tvNnw"
}
```

---

# Audit Logging

```yaml
# elasticsearch.yml
xpack.security.audit.enabled: true
xpack.security.audit.logfile.events.include:
  - access_denied
  - authentication_failed
  - connection_denied
  - run_as_denied
  - anonymous_access_denied
```

<v-click>

```json
// Audit log example
{
  "type": "audit",
  "event.action": "access_denied",
  "user.name": "unknown",
  "request.name": "SearchRequest",
  "indices": ["logs-parkki-prod"]
}
```

</v-click>

---
layout: section
---

# Part 14: APM and Application Logs
*Duration: 1h*

## FOR YOUR APM USE CASE

---

# Architecture APM

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Application    │     │   APM Server    │     │ Elasticsearch   │
│  + APM Agent    │────▶│                 │────▶│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  Kibana APM UI  │
                                                └─────────────────┘
```

<v-clicks>

**Components**:
- **APM Agent**: Instruments your application
- **APM Server**: Collects and transforms data
- **Elasticsearch**: Storage
- **Kibana APM UI**: Visualization

</v-clicks>

---

# Available APM Agents

<v-clicks>

| Language | Agent |
|---------|-------|
| Java | elastic-apm-agent |
| Node.js | elastic-apm-node |
| Python | elastic-apm |
| .NET | Elastic.Apm |
| Go | apm-agent-go |
| Ruby | elastic-apm |
| PHP | elastic-apm-php-agent |

</v-clicks>

---

# Configuration APM Agent (Node.js)

```javascript
// First line of your app!
const apm = require('elastic-apm-node').start({
  serviceName: 'parkki-api',
  serverUrl: 'http://apm-server:8200',
  environment: 'production',

  // Sampling
  transactionSampleRate: 0.1,  // 10% des transactions

  // Capture
  captureBody: 'all',
  captureHeaders: true
});
```

---

# Configuration APM Agent (Java)

```bash
# Start with agent
java -javaagent:/path/to/elastic-apm-agent.jar \
     -Delastic.apm.service_name=parkki-api \
     -Delastic.apm.server_urls=http://apm-server:8200 \
     -Delastic.apm.environment=production \
     -Delastic.apm.transaction_sample_rate=0.1 \
     -jar parkki-api.jar
```

<v-click>

Or via `elasticapm.properties`:
```properties
service_name=parkki-api
server_urls=http://apm-server:8200
environment=production
transaction_sample_rate=0.1
```

</v-click>

---

# Automatic vs Manual Instrumentation

**Automatic** (by default):

<v-clicks>

- HTTP requests/responses
- Database queries (SQL, MongoDB, Redis)
- External HTTP calls
- Message queues (RabbitMQ, Kafka)

</v-clicks>

<v-click>

**Manual** (for custom):
```javascript
const span = apm.startSpan('custom-operation');
try {
  // Your code
  await processOrder(order);
} finally {
  span.end();
}
```

</v-click>

---

# Sampling Strategies

```javascript
// Sample rate (% of transactions)
transactionSampleRate: 0.1  // 10%

// Or dynamic
transactionSampleRate: (transactionName) => {
  if (transactionName.includes('/health')) return 0;
  if (transactionName.includes('/api/critical')) return 1;
  return 0.1;
}
```

<v-clicks>

**For Parkki**:
- Health checks: 0%
- Critical APIs: 100%
- Rest: 10%

</v-clicks>

---

# Logs/APM Correlation

Injecting Trace ID into logs:

```javascript
// Logger with trace ID
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format((info) => {
      const traceId = apm.currentTransaction?.traceId;
      if (traceId) {
        info.trace_id = traceId;
        info.transaction_id = apm.currentTransaction.id;
      }
      return info;
    })(),
    winston.format.json()
  )
});
```

---

# Logs <-> Traces Navigation

In Kibana:

```
┌─────────────────────────────────────────────────────┐
│  APM Transaction: GET /api/orders                   │
│  Duration: 450ms                                    │
├─────────────────────────────────────────────────────┤
│  ├─ MySQL query (120ms)                             │
│  ├─ Redis cache (5ms)                               │
│  └─ External API call (200ms)                       │
├─────────────────────────────────────────────────────┤
│  Related Logs (3)                          [View]   │
│  - INFO: Order fetched                              │
│  - WARN: Slow query detected                        │
│  - ERROR: Payment timeout                           │
└─────────────────────────────────────────────────────┘
```

---

# APM Best Practices for Parkki

<v-clicks>

1. **Sampling**: 10% in prod, 100% in dev
2. **Name transactions**: `GET /api/orders/:id`
3. **Custom spans**: For business operations
4. **Trace ID in logs**: Correlation
5. **Alerts**: p99 latency, error rate
6. **Retention**: 7 days for APM data

</v-clicks>

---

# APM Sizing for Parkki

```
Estimation:
- 15M logs/day
- 10% APM sampling = 1.5M transactions/day
- Average transaction size = 5 KB
- APM volume = 7.5 GB/day

7-day retention:
- Total volume = 52.5 GB
- With compression = ~30 GB
```

<v-click>

> Specific ILM for APM with 7-day retention

</v-click>

---
layout: section
---

# Part 15: Summary and Q&A
*Duration: 30min*

---

# 3-Day Recap

<v-clicks>

**Day 1 - Fundamentals**:
- Concepts, Installation, Indexing
- Mapping (critical!): text vs keyword
- Templates and Search

**Day 2 - Performance**:
- Sizing and memory:data ratios
- ILM Hot/Warm/Delete
- JVM Troubleshooting

**Day 3 - Production**:
- Monitoring and Alerting
- Security
- APM

</v-clicks>

---

# Action Plan for Parkki

## Quick Wins (this week)

<v-clicks>

1. **Increase refresh_interval** to 30s
2. **Configure slowlogs**
3. **Set up alerts** JVM/Disk
4. **Audit mappings** (unnecessary text fields)

</v-clicks>

---

# Action Plan for Parkki

## Medium term (1-2 weeks)

<v-clicks>

1. **Implement ILM** Hot/Warm/Delete
2. **Migrate to Data Streams**
3. **Review mappings** with dynamic templates
4. **Configure monitoring** Metricbeat

</v-clicks>

---

# Action Plan for Parkki

## Long term (1 month+)

<v-clicks>

1. **Hot/Warm architecture** on dedicated nodes
2. **Complete logs/APM correlation**
3. **Custom monitoring dashboards**
4. **Documented maintenance procedures**
5. **Ongoing team training**

</v-clicks>

---

# Expected Impact

<v-clicks>

| Metric | Before | After |
|--------|--------|-------|
| RAM used | 5+ GB | 2 GB |
| JVM issues | Frequent | Rare |
| Monthly costs | X | X * 0.5 |
| Debug time | Hours | Minutes |
| Proactive alerts | 0 | 5+ |

</v-clicks>

---

# Resources

<v-clicks>

**Official documentation**:
- https://www.elastic.co/guide/

**Blogs**:
- https://www.elastic.co/blog/

**Forums**:
- https://discuss.elastic.co/

**Monitoring**:
- Kibana Stack Monitoring
- Elastic Cloud Console

</v-clicks>

---

# Questions & Answers

<v-clicks>

**Common topics**:
- How to migrate to Data Streams?
- What backup strategy?
- How to handle Elastic Cloud updates?
- How to optimize Kibana dashboards?

</v-clicks>

---
layout: end
---

# Thank you for these 3 days!

## Elasticsearch Parkki Training

**Next steps**:
1. Apply the action plan
2. Post-training follow-up if needed
3. Contact for questions

**Emmanuel DEMEY**
demey.emmanuel@gmail.com
