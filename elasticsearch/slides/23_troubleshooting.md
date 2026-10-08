---
layout: section
---

# Part 9: Operating and Troubleshooting

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
