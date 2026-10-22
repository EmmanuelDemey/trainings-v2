---
layout: cover
---

# 04 - Discover

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** how Discover displays data: data views, time range, documents, fields
- **Customize** the Discover interface: columns, field statistics, saved searches
- **Construct** queries with **KQL** and **Lucene** to find relevant events
- **Switch** to **ES|QL** when the question needs a computation

---
src: ../../elasticsearch-common/slides/kibana/presentation.md
---

---

# Discover: how data is displayed

* A **data view** says which indices to read — `logs-*`, `logs-lab-default` —
  and which field is the time
* The **time picker** filters on that field: *Last 15 minutes* by default — the
  first reason why "there is nothing"
* The **histogram** shows the count of events over time
* The **document table**: one row per event, the newest first
* The **field list**: every field of the data view, with its top values

---

# Customizing Discover

<v-clicks>

* **Columns**: add `host.name`, `user.name`, `source.ip`, `event.outcome` — the
  table reads like a log
* **Field statistics**: click a field for its top 5 values on the sample
  — *Visualize* opens it in Lens
* **Document view**: expand a row, see every field — **filter for / out** a value
  in one click
* **Surrounding documents**: the events just before and after the selected one
* **Saved search**: query + filters + columns, reusable in a dashboard
* **Spaces** and **data views** per team: SOC, threat intel, management

</v-clicks>

---

# KQL — Kibana Query Language

* The **default** language of the search bar — fields, values, boolean operators

| Query | Finds |
|-------|-------|
| `event.outcome: failure` | the field equals the value |
| `user.name: admin and source.ip: 203.0.113.50` | both |
| `event.category: (authentication or iam)` | one of the values |
| `not host.os.family: windows` | negation |
| `source.ip: 10.0.0.0/8` | an `ip` field in a CIDR range |
| `destination.port >= 1024` | a range |
| `process.name: power*` | a wildcard |
| `process.parent.name: *` | the field exists |
| `process: { name: bash and pid > 4100 }` | nested fields |

* Values are **case-sensitive** on `keyword` fields
* Autocompletion of fields **and values**

---

# Lucene syntax

* The language of `query_string` — switch to it in the search bar menu
* Same fields, other operators — and **regular expressions**, **fuzzy**, **boost**

| KQL | Lucene |
|-----|--------|
| `user.name: admin and event.outcome: failure` | `user.name:admin AND event.outcome:failure` |
| `not host.name: web-01` | `NOT host.name:web-01` or `-host.name:web-01` |
| `destination.port >= 1024` | `destination.port:[1024 TO *]` |
| `process.parent.name: *` | `_exists_:process.parent.name` |
| — | `process.name:/power.*\.exe/` |
| — | `user.name:admni~1` |

<v-click>

> KQL for everyday searches — Lucene when you need a regex or a fuzzy match.

</v-click>

---

# The same queries, in Dev Tools

* KQL is a Kibana language: Elasticsearch runs **Lucene** through `query_string`

```json
POST /logs-lab-default/_count
{
  "query": {
    "query_string": {
      "query": "event.category:authentication AND event.outcome:failure"
    }
  }
}
```

Résultat attendu :

```json
{ "count": 5 }
```

---

# Filters and pins

* A **filter** (the pills under the search bar) is a query part you can toggle,
  invert, pin, disable
* **Pinned** filters stay when you go from Discover to a dashboard, or to the
  Security app
* **Edit as Query DSL** for what neither KQL nor the filter editor say
* A **query** is what you are typing now; **filters** are what you keep

---

# ES|QL in Discover

* Switch the language to **ES|QL**: the table becomes the result of the query —
  computed columns, aggregations, no data view needed
* KQL and Lucene **filter** events; ES|QL also **computes** on them

---
src: ../../elasticsearch-common/slides/esql/anatomy.md
---

---

# ES|QL for security questions

* Which processes talk to which IPs, and how often?

```json
POST /_query?format=txt
{
  "query": """
    FROM logs-lab-default
    | WHERE event.category == "network"
    | STATS connections = COUNT(*) BY process.name, destination.ip
    | SORT connections DESC
  """
}
```

* KQL and Lucene work **inside** ES|QL too: `WHERE KQL("user.name: admin")`,
  `WHERE QSTR("process.name:power*")`

---

# Practical part

* **Workshop 3** — Investigate the lab dataset in Discover with KQL, Lucene and
  ES|QL: the brute force, the PowerShell, the beacon
