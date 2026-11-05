# Workshop 8 — OpenSearch Dashboards

> Explore the logs of a website in Discover, build four visualizations and a map, then assemble them into an interactive dashboard to share.

**Duration**: 45 min · **Chapter**: 10 — OpenSearch Dashboards

## Context

The operations team of a website wants a dashboard: traffic over time, errors, the visitors' operating systems, and where they come from. OpenSearch Dashboards ships a **sample web logs** data set: you start from it, and build **your own** dashboard — without looking at the one it ships.

## Setup

1. Open **http://localhost:5601**.
2. Home page → **Add sample data** (or menu ☰ → **Home** → **Sample data**).
3. On **Sample web logs**, click **Add data**.

The `opensearch_dashboards_sample_data_logs` index holds about **14,000** HTTP requests, spread over a few weeks **around today**. Useful fields:

<!-- ci: sample-data logs -->
| Field | Type | Content |
|---|---|---|
| `timestamp` | `date` | Date of the request |
| `response` / `response.keyword` | `text` / `keyword` | HTTP status: `200`, `404`, `503` |
| `bytes` | `long` | Size of the response |
| `machine.os.keyword` | `keyword` | Visitor's operating system |
| `extension.keyword` | `keyword` | Extension of the requested file |
| `geo.src` | `keyword` | Country of origin (ISO code) |
| `geo.coordinates` | `geo_point` | Visitor's location |
| `clientip` | `ip` | Visitor's IP address |

Reference: [OpenSearch Dashboards](https://docs.opensearch.org/latest/dashboards/).

## Exercises

### Step 1: The index pattern

Adding the sample data created an index pattern. Create **another one**, your own: pattern `opensearch_dashboards_sample_data_logs*`, time field `timestamp`.

<details>
<summary>Hint</summary>

Menu ☰ → **Dashboards Management** → **Index patterns** → **Create index pattern**.

</details>

**Expected result**: the index pattern lists about thirty fields; `geo.coordinates` is of type `geo_point`, `bytes` of type `number`, aggregatable.

**Question**: `response` shows up twice, `response` and `response.keyword`. Which one is **aggregatable**? Why?

### Step 2: Discover

In **Discover**, with your index pattern:

1. Set the time range to the **last 7 days**.
2. Show the `clientip`, `request`, `response`, `bytes` columns.
3. With **DQL**, find the server errors: the **503** responses.
4. Add a **filter** that excludes the `win xp` operating system.
5. Save the search as `503 errors`.

<details>
<summary>Hint</summary>

DQL: `response:503`. For the filter: **+ Add filter**, `machine.os.keyword` **is not** `win xp` — or hover a value in a document, and click the crossed-out magnifier.

</details>

**Expected result**: a few dozen documents, all `503`, no `win xp`.

**Try it**: in the DQL bar, `bytes > 10000 and extension:css`. Then **Inspect** → **Request**: what does the request sent to OpenSearch look like?

### Step 3: A metric

Menu ☰ → **Visualize** → **Create visualization** → **Metric**. Show the **total number of requests** and the **average size** (`bytes`). Save it as `Traffic — key figures`.

<details>
<summary>Hint</summary>

**Metrics** → **Add** → *Average* on `bytes`. The first metric, *Count*, is already there.

</details>

### Step 4: Traffic over time, per HTTP status

A **Vertical bar**: on the X axis, a **Date Histogram** on `timestamp`; the bars **stacked** by HTTP status (`response.keyword`). Save it as `Traffic per HTTP status`.

<details>
<summary>Hint</summary>

**Buckets** → **Add** → **X-axis** → *Date Histogram*. Then **Add** → **Split series** → *Terms* on `response.keyword`. Right-hand panel → **Metrics & axes** → **Mode**: *stacked*.

</details>

**Question**: which aggregations of chapter 7 does this visualization send? Check with **Inspect** → **Requests**.

### Step 5: The visitors' operating systems

A **Pie** (as a ring, *donut*): the share of each operating system (`machine.os.keyword`), then, inside each operating system, the share of each extension (`extension.keyword`, top 3). Save it as `Systems and files`.

<details>
<summary>Hint</summary>

Two **Split slices**: a *Terms* on `machine.os.keyword`, then a *Terms* on `extension.keyword`. The order of the buckets matters.

</details>

### Step 6: The map

Menu ☰ → **Maps** → **Create map**. Add a **Documents** layer on your index pattern, geo field `geo.coordinates`. Color the points by `response.keyword`. Save the map as `Visitors`.

<details>
<summary>Hint</summary>

**Add layer** → **Documents**. **Style** tab → color by field. If **Maps** does not show up, use **Visualize** → **Coordinate Map**, with a *Geohash* aggregation on `geo.coordinates`.

</details>

**Question**: without the `geo_point` type in the mapping, would this map be possible?

### Step 7: The dashboard

Menu ☰ → **Dashboards** → **Create** → **Dashboard**. Add your four visualizations and the `503 errors` search. Lay them out, then save as `Website operations`.

Then, **on the dashboard**:

1. Click the `osx` slice of the pie: what happens to **every** panel?
2. Drag over a range of the histogram with the mouse: what happens to the time range?
3. Remove the filters.

### Step 8: Share

1. **Share** → **Copy link**: open the link in a private window.
2. Menu ☰ → **Dashboards Management** → **Saved objects**: export the dashboard **with its related objects**. Open the `.ndjson` file you get: what does it hold?

## Success criteria

- An index pattern with a time field
- A DQL search and a filter, saved
- Four visualizations: metric, stacked histogram, donut, map
- An interactive dashboard, exported as `.ndjson`

## Going further

- Create your own index pattern on `restaurants` (workshop 3) — with no time field — and a map of its restaurants.
- A **TSVB** visualization: the traffic, overlaid with its moving average over 1 h.
- Menu ☰ → **Query Workbench**: the same question as step 4, in **PPL**:
  `source = opensearch_dashboards_sample_data_logs | stats count() by span(timestamp, 1d), response`.

## Troubleshooting

**Problem**: Discover shows “No results match your search criteria”
→ The **time range** does not cover the data: widen it (*Last 30 days*).

**Problem**: `response` is not offered in *Terms*
→ It is a `text` field: pick `response.keyword`.

**Problem**: a new field of the mapping does not show up
→ **Index patterns** → your pattern → **Refresh field list** button.
