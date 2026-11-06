---
layout: cover
---

# 10 - OpenSearch Dashboards

---

# Learning objectives

By the end of this sequence (**~50 min**, workshop included), you will be able to:

- **Find your way** around OpenSearch Dashboards
- **Declare** an index pattern and its time field
- **Explore** the data in Discover: filters, DQL, time range
- **Build** visualizations: metrics, bars, lines, pies, maps
- **Assemble** and **share** an interactive dashboard

---

# The interface

| Menu | For |
|---|---|
| **Discover** | Exploring the raw documents, filtering, searching |
| **Visualize** | Creating a visualization: metric, chart, map, table |
| **Dashboards** | Assembling visualizations, filtering them all in one click |
| **Maps** | Multi-layer maps built from geographic data |
| **Dev Tools** | The REST API console |
| **Dashboards Management** | Index patterns, saved objects, advanced settings |

And, depending on the plugins: Alerting, Anomaly Detection, Index Management, Query Workbench (SQL / PPL), Observability…

---

# The index pattern

Dashboards does not read an index: it reads an **index pattern**.

- A **pattern**: `restaurants`, `logs-*`, `opensearch_dashboards_sample_data_logs`
- A **time field** (optional): enables the **time picker** and the histograms
- The list of fields, their types, whether they are **aggregatable** and **searchable**

**Dashboards Management** → **Index patterns** → **Create index pattern**

<br />

> A new field in the mapping? **Refresh** the field list of the index pattern.

---

# Discover

- **Time picker** — top right: *Last 15 minutes*, absolute, relative
- **Search bar** — **DQL** (the default) or Lucene
- **Filters** — `+ Add filter`, or a click on the magnifier next to a value
- **Histogram** — the number of documents over time
- **Columns** — pick the fields shown; **Save**: a reusable search

<br />

> No documents? Nine times out of ten, the **time range** does not cover the data.

---

# DQL — Dashboards Query Language

| Query | Finds |
|---|---|
| `response:404` | A field equal to a value |
| `response:(404 or 503)` | One value among several |
| `bytes > 10000` | A range |
| `machine.os:win*` | A prefix |
| `not response:200` | The negation |
| `extension:css and geo.src:FR` | A combination |
| `tags:*` | The field exists |
| `message:"page not found"` | A phrase |

- DQL is translated into Query DSL: **Inspect** → **Request** shows it
- The **filters** (pills) and the query **add up**

---

# Visualizations

| Type | For |
|---|---|
| **Metric**, **Gauge** | A key figure: number of requests, average time |
| **Vertical / Horizontal bar** | Comparing categories, or periods of time |
| **Line**, **Area** | A trend over time |
| **Pie** | A breakdown — few categories |
| **Data table** | The detailed figures |
| **Heat map** | Two crossed dimensions |
| **Coordinate / Region map**, **Maps** | Geographic data |
| **TSVB**, **Vega** | Advanced time series, custom charts |
| **VisBuilder** | Drag and drop, the easiest way to start |

---

# A visualization = aggregations

A **vertical bar** chart “requests per day, per HTTP status”:

| In the editor | In Query DSL |
|---|---|
| **Metrics** → Y-axis: *Count* | `value_count` (the `doc_count`) |
| **Buckets** → X-axis: *Date Histogram* on `timestamp` | `date_histogram` |
| **Buckets** → Split series: *Terms* on `response.keyword` | `terms`, as a sub-aggregation |

<br />

- Exactly the aggregations of **chapter 7**
- **Inspect** → **Requests**: the request sent, the response, the data

---

# Maps

- A **`geo_point`** (or `geo_shape`) field in the mapping — a `float` lat / lon is not enough
- **Maps**: a base map, layers of **documents**, **grids** (`geotile_grid`), **regions**
- **Coordinate map**: a geographic aggregation on a base map
- **Region map**: color countries or regions by a metric (ISO code)

<br />

> The mapping decides everything: a location field indexed as `text` will **never** be a map.
> Chapter 4 coming back to haunt us.

---

# The dashboard

- **Dashboards** → **Create** → **Add**: visualizations and saved searches
- Drag, resize; **Save**, with or without the time range (*Store time with dashboard*)
- **Interactive**: a click on a bar or a slice creates a **filter** applied to the **whole** dashboard
- The search bar and the time range filter every panel too

<br />

**Share**:

- **Share** → link (short or full), **iframe** to embed
- **Reporting**: PDF / PNG, on demand or scheduled
- **Saved objects** → **Export**: an `.ndjson` file, to import into another cluster

---
layout: cover
---

# Workshop 8

## OpenSearch Dashboards
