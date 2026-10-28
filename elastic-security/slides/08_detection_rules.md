---
layout: cover
---

# 08 - Detection rules

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Identify** how the detection engine searches the activity and generates alerts
- **Choose** the right rule type for a detection
- **Construct** custom rules with **KQL**, **Lucene**, **EQL** and **ES|QL**
- **Manage** prebuilt rules, exceptions and the MITRE ATT&CK coverage

---

# The detection engine

```text
 every interval (5m)                    look-back
┌───────────────────────┐        ┌──────────────────────┐
│ Rule: query + schedule │──────▶│ search the indices    │
└───────────────────────┘        │ from now-6m to now    │
                                 └──────────┬───────────┘
                                            │ matches
                                            ▼
                                 ┌──────────────────────┐
                                 │ alert documents in    │
                                 │ .alerts-security.*    │──▶ actions: email,
                                 └──────────────────────┘    Slack, webhook, case
```

* A rule runs on a **schedule** (*Runs every*) and looks at a **window**
  (*Additional look-back time* covers late events)
* Each match is written as an **alert** — a document, with the source event
  copied in, and `kibana.alert.*` fields: rule, severity, risk score, status
* **Suppression**: one alert per `host.name` per hour instead of a thousand

---

# Rule types

| Type | Detects | Language |
|------|---------|----------|
| **Custom query** | an event that matches | KQL or Lucene |
| **Threshold** | N events grouped by fields | KQL or Lucene |
| **Event correlation** | a **sequence** of events, in order | EQL |
| **ES\|QL** | the rows of a query — aggregations included | ES\|QL |
| **Indicator match** | an event field equal to a threat indicator | KQL + indicator index |
| **New terms** | a value never seen before — first logon from an IP | KQL |
| **Machine learning** | an anomaly of an ML job | — |

---

# Custom query — KQL

*"PowerShell started with an encoded command"*

```text
event.category: process and event.type: start
  and process.name: "powershell.exe"
  and process.command_line: (*-enc* or *-EncodedCommand*)
```

* The **KQL** of Discover, as is
* Or **Lucene**: `process.name:powershell.exe AND process.command_line:*\-enc*`

---

# Threshold

*"5 failed logons or more from the same IP"*

* Query: `event.category: authentication and event.outcome: failure`
* Group by: `source.ip` — threshold: `>= 5`
* Optional: **cardinality** — `user.name` with at least 3 distinct values
  (password spraying)

```json
POST /logs-lab-default/_search
{
  "size": 0,
  "query": { "bool": { "filter": [
    { "term": { "event.category": "authentication" } },
    { "term": { "event.outcome": "failure" } }
  ] } },
  "aggs": { "by_ip": { "terms": { "field": "source.ip", "min_doc_count": 5 } } }
}
```

---

# EQL — Event Query Language

* A language for **events**, in **time order** — built for endpoint data

```text
process where process.name == "powershell.exe"
  and process.command_line : "* -enc *"
```

* **Sequences**: several events, in order, sharing a key, within a time span

```text
sequence by host.name, source.ip with maxspan=5m
  [authentication where event.outcome == "failure"] with runs=3
  [authentication where event.outcome == "success"]
```

* `:` is a case-insensitive wildcard match; `==` is exact
* Also: `until`, `!` (missing event), `descendant of`, `child of`

---

# EQL in Dev Tools

```json
POST /logs-lab-default/_eql/search
{
  "query": """
    sequence by host.name with maxspan=5m
      [process where process.parent.name == "winword.exe"]
      [process where process.parent.name == "powershell.exe"]
  """
}
```

* Test the query **before** the rule: same engine, same result
* *Word → PowerShell → a binary*: the phishing chain of `ws-02`

---

# ES|QL rules

* The rows of the query are the alerts — **aggregations included**

```text
FROM logs-*
| WHERE network.direction == "egress"
| STATS sent = SUM(source.bytes) BY host.name, destination.ip
| WHERE sent > 10000000
```

* **Aggregating** query: one alert per row, the `BY` fields in the alert
* **Non-aggregating** query: one alert per event — add `METADATA _id, _index`
  to deduplicate

---

# Rule settings

| Setting | Why |
|---------|-----|
| **Severity** and **risk score** | the order of the alerts queue; overrides by field |
| **MITRE ATT&CK** | tactic, technique, sub-technique — the coverage matrix |
| **Investigation guide** | Markdown: what to check, with Timeline buttons |
| **Required fields**, **related integrations** | is the data there for this rule? |
| **Timeline template** | the investigation opened from the alert |
| **Schedule** | interval, look-back |
| **Suppression** | group alerts by fields, for a time |
| **Actions** | notify, open a case — per alert or summarized |

---

# Prebuilt rules

* **1,000+ Elastic rules**, written by Elastic Security Labs, mapped to ATT&CK
* Installed from **Rules → Add Elastic rules**, updated out of band
* Each rule: its query, its investigation guide, its required integrations
* **Customize** a prebuilt rule (schedule, query, actions) — updates still merge
* Open source: `github.com/elastic/detection-rules`

---

# Exceptions

* An **exception** stops a rule from alerting on known activity:
  `process.parent.name is "sccm.exe"`
* **Rule exceptions** for one rule; **shared exception lists** for many
* **Endpoint exceptions** for Elastic Defend
* **Value lists**: a list of IPs, hashes, users, uploaded once, used everywhere
* Review them: every exception is a blind spot

---

# Detection as code

* Rules export and import as **NDJSON**; the **Detections API** creates them

```text
POST kbn:/api/detection_engine/rules
{
  "type": "eql",
  "name": "SSH brute force followed by a success",
  "language": "eql",
  "index": ["logs-*"],
  "query": "sequence by host.name, source.ip with maxspan=5m [authentication where event.outcome == \"failure\"] with runs=3 [authentication where event.outcome == \"success\"]",
  "severity": "high",
  "risk_score": 73,
  "interval": "5m",
  "from": "now-6m",
  "threat": [{ "framework": "MITRE ATT&CK",
    "tactic": { "id": "TA0006", "name": "Credential Access", "reference": "https://attack.mitre.org/tactics/TA0006/" },
    "technique": [{ "id": "T1110", "name": "Brute Force", "reference": "https://attack.mitre.org/techniques/T1110/" }] }]
}
```

* Version them in Git, test them, deploy them with the CI — the `detection-rules` CLI does it

---

# Practical part

## Workshop 5, part 2 — Detection rules
