---
layout: cover
---

# 05 - Visualizations

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Interpret** the data behind a visualization: the aggregation it runs
- **Apply** the best practices of aggregation-based visualizations
- **Create** aggregation-based and **Lens** visualizations for security use cases
- **Use** the advanced features of Lens: formulas, reference lines, layers, annotations

---

# A visualization is an aggregation

* Every chart sends a **search with aggregations** to Elasticsearch — no
  documents come back, only buckets and metrics
* **Buckets** split the events: `terms` (top values), `date_histogram` (over
  time), `range`, `filters`, `ip_range`
* **Metrics** compute on each bucket: `count`, `unique count`, `sum`, `max`, percentiles

```json
POST /logs-lab-default/_search
{
  "size": 0,
  "query": { "term": { "event.category": "authentication" } },
  "aggs": {
    "by_source": {
      "terms": { "field": "source.ip" },
      "aggs": { "users": { "cardinality": { "field": "user.name" } } }
    }
  }
}
```

---

# Reading security charts

| Question | Chart | Buckets / metric |
|----------|-------|------------------|
| Is something spiking? | bar / line over time | `date_histogram` · count |
| Who are the top talkers? | bar, table | `terms` on `source.ip` · sum of bytes |
| What is rare? | table sorted ascending | `terms` on `process.name` · count, **rare** first |
| How is it split? | donut, treemap | `terms` on `event.outcome` |
| Where from? | map | `geo_point` · count |
| One number to watch | metric | unique count of `user.name` with failures |

<v-click>

> **Rare beats frequent** in security: the process seen once is more interesting
> than the one seen a million times.

</v-click>

---

# Best practices — aggregation-based

<v-clicks>

* **Ask one question per chart** — its title is the question: *"Failed logons per source IP"*
* **Top N with "Other"**: a `terms` bucket shows the top values; count the rest
* **Mind the sample**: `terms` is approximate across shards — `shard_size`
* **Unique count** is approximate too (HyperLogLog) — exact under 3,000 values
* **The time picker drives everything**: no hard-coded dates in a chart
* **Keyword fields only** for buckets: `user.name`, not `message`
* Aggregation-based editors (TSVB, legacy charts) are **in maintenance**:
  prefer **Lens** for anything new

</v-clicks>

---

# Lens

* Drag and drop a field: Lens **suggests** the chart — bar, line, metric, table, donut, heatmap
* Change the **chart type** at any time, the data stays
* **Break down by** a field, **filter** a layer, **quick functions**: count,
  unique count, sum, percentile, last value
* Built on the data view — or on an **ES|QL** query

---

# Lens — advanced features

| Feature | Security use |
|---------|--------------|
| **Formula** | failure rate: `count(kql='event.outcome: failure') / count()` |
| **Reference line** | the threshold above which the SOC reacts |
| **Layers** | failures and successes on the same time axis |
| **Annotations** | mark the time of an incident, a deployment, a rule change |
| **Time shift** | today vs. last week: `count(shift='1w')` |
| **Color by value** | red when unique users per IP > 3 |
| **Inspect** | the request and the response sent to Elasticsearch |

---

# Lens on ES|QL

* Discover in ES|QL mode: **the chart is already there** — save it to a dashboard
* Any `STATS … BY` becomes a chart

```json
POST /_query?format=txt
{
  "query": """
    FROM logs-lab-default
    | WHERE network.direction == "egress"
    | STATS sent = SUM(source.bytes) BY host.name, destination.ip
    | SORT sent DESC
  """
}
```

* `BUCKET(@timestamp, 1 minute)` in the `BY` for a histogram

---

# Practical part

* **Workshop 4, part 1** — Build Lens visualizations on the lab dataset: failed
  logons over time, top talkers, rare processes, a failure-rate formula
