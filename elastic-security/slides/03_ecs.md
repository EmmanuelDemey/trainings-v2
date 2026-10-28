---
layout: cover
---

# 03 - Elastic Common Schema

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** why a SIEM needs one schema for every source
- **Recall** the fundamentals of logging: events, fields, data types
- **Read** an event in **ECS**: field sets, `event.*` categorization fields
- **Normalize** a raw log into ECS with an ingest pipeline

---

# Logging fundamentals

* An **event** = something that happened, at a time, somewhere: a logon, a
  process start, a connection
* A **log** = its record, written by the source in **its own format**

```text
Oct  1 08:00:00 web-01 sshd[811]: Failed password for admin from 203.0.113.50 port 52311 ssh2
```

```text
<Event><System><EventID>4625</EventID>…<Data Name="TargetUserName">admin</Data>
<Data Name="IpAddress">203.0.113.50</Data>…</Event>
```

```text
{"ts":1790841600,"src":"203.0.113.50","dst_port":22,"action":"deny"}
```

<v-click>

> Three sources, three names for the same source IP: `from …`, `IpAddress`, `src`.

</v-click>

---

# Structured data

* **Unstructured**: free text — readable by a human, searchable only as text
* **Semi-structured**: key/values, JSON, XML — fields, but **each source picks its names**
* **Structured**: fields with an agreed name and a **type**

| Type | Why it matters |
|------|----------------|
| `ip` | CIDR queries: `source.ip: 10.0.0.0/8` |
| `date` | time ranges, histograms, sequences |
| `keyword` | exact match, aggregations — `user.name`, `event.outcome` |
| `long` | sums, thresholds — `source.bytes` |
| `text` / `wildcard` | free search in messages and command lines |

---

# Why a common schema?

Without one, every query is written once per source:

```text
src_ip:203.0.113.50 OR IpAddress:203.0.113.50 OR client.address:203.0.113.50 OR …
```

With **ECS**, once — whatever the source:

```text
source.ip: 203.0.113.50
```

<v-clicks>

* **One query**, one dashboard, one detection rule for every source
* **Correlation**: join a firewall log and an endpoint event on `source.ip`
* **Prebuilt content works**: the Elastic rules, dashboards and ML jobs expect ECS
* **Open**: ECS is also the base of **OpenTelemetry semantic conventions**

</v-clicks>

---

# ECS: field sets

Fields are grouped by **what they describe**:

| Field set | Examples |
|-----------|----------|
| **Base** | `@timestamp`, `message`, `tags`, `labels` |
| `event` | `event.kind`, `event.category`, `event.type`, `event.outcome`, `event.dataset` |
| `host` | `host.name`, `host.ip`, `host.os.family` |
| `user` | `user.name`, `user.domain`, `user.target.name` |
| `source` / `destination` | `source.ip`, `source.port`, `destination.ip`, `destination.bytes` |
| `process` | `process.name`, `process.command_line`, `process.parent.name`, `process.pid` |
| `file`, `registry`, `dns`, `url`, `network` | `file.hash.sha256`, `dns.question.name`, `url.domain`… |
| `threat` | `threat.tactic.name`, `threat.technique.id` — MITRE ATT&CK |

---

# ECS: the categorization fields

Four fields say **what kind of event** it is — with **allowed values**:

| Field | Question | Values (excerpt) |
|-------|----------|------------------|
| `event.kind` | What is it? | `event`, `alert`, `metric`, `state`, `signal` |
| `event.category` | In which domain? | `authentication`, `process`, `network`, `file`, `iam`, `malware` |
| `event.type` | What happened? | `start`, `end`, `creation`, `deletion`, `connection`, `denied` |
| `event.outcome` | Did it work? | `success`, `failure`, `unknown` |

<v-click>

```text
event.category: authentication and event.outcome: failure
```

> Every failed logon — SSH, Windows, Okta, VPN — in one query.

</v-click>

---

# One event, in ECS

```json
{
  "@timestamp": "2026-10-01T08:00:00Z",
  "message": "Failed password for admin from 203.0.113.50 port 52311 ssh2",
  "event": {
    "category": ["authentication"],
    "type": ["start"],
    "outcome": "failure",
    "dataset": "system.auth"
  },
  "host": { "name": "web-01", "os": { "family": "linux" } },
  "user": { "name": "admin" },
  "source": { "ip": "203.0.113.50", "port": 52311 }
}
```

* The `message` is kept: the original line, for the analyst
* Everything else is **parsed** out of it

---

# How ECS normalizes data

* **Integrations** do it for you: each one ships ingest pipelines that parse its
  logs into ECS — the System integration parses `sshd` lines this way
* For a **custom source**: write the pipeline — `dissect`, `grok`, `rename`,
  `convert`, `set`, `geoip`…

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      { "dissect": { "field": "message", "pattern": "%{_tmp.verb} password for %{user.name} from %{source.ip} port %{source.port} ssh2" } },
      { "convert": { "field": "source.port", "type": "long" } },
      { "set": { "field": "event.category", "value": ["authentication"] } },
      { "set": { "if": "ctx._tmp.verb == 'Failed'", "field": "event.outcome", "value": "failure" } },
      { "set": { "if": "ctx._tmp.verb == 'Accepted'", "field": "event.outcome", "value": "success" } },
      { "remove": { "field": "_tmp" } }
    ]
  },
  "docs": [
    { "_source": { "message": "Failed password for admin from 203.0.113.50 port 52311 ssh2" } }
  ]
}
```

---

# Mapping ECS fields

* The `logs-*-*` template already maps ECS — a custom index must do it itself
* The **`ecs@mappings`** component template maps every ECS field by its name

```json
PUT /_index_template/logs-custom
{
  "index_patterns": ["logs-custom-*"],
  "data_stream": {},
  "composed_of": ["ecs@mappings"],
  "priority": 200
}

POST /logs-custom-default/_doc
{
  "@timestamp": "2026-10-01T08:00:00Z",
  "source": { "ip": "203.0.113.50" },
  "event": { "outcome": "failure" }
}

GET /logs-custom-default/_mapping/field/source.ip
```

* `source.ip` is mapped as an `ip` — a CIDR query works on it

---

# Practical part

## Workshop 2 — Elastic Common Schema
