---
layout: cover
---

# 02 - Stack overview, Fleet and Elastic Agent

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Identify** the components of the Elastic Stack, and how data flows through them
- **List** the data sources a security team relies on
- **Explain** the Fleet architecture, and how it manages Elastic Agents
- **Configure** an agent policy, **add** integrations, and **deploy** an Elastic Agent

---
src: ../../elasticsearch-common/slides/stack/elastic-stack.md
---

---

# How data flows through the stack

```text
 Sources              Collect             Store & search        Use
┌──────────┐      ┌──────────────┐      ┌───────────────┐   ┌──────────────┐
│ Hosts    │─────▶│ Elastic Agent│─────▶│ Ingest        │   │ Kibana       │
│ Cloud    │      │ (Fleet)      │      │ pipelines     │   │ Discover     │
│ Network  │─────▶│ Beats        │─────▶│      ▼        │──▶│ Dashboards   │
│ SaaS/API │      │ Logstash     │      │ Elasticsearch │   │ Security app │
└──────────┘      └──────────────┘      │ data streams  │   └──────────────┘
                                        └───────────────┘
```

* **Collect**: Elastic Agent, managed by Fleet — Beats and Logstash for the remaining cases
* **Transform**: ingest pipelines, shipped by each integration
* **Store**: **data streams**, one per kind of data
* **Use**: Kibana, and its Security solution

---

# Data streams: the naming scheme

```text
logs-system.auth-default
│    │           └── namespace: environment, team, customer…
│    └── dataset: what the data is (one per integration input)
└── type: logs, metrics, traces, synthetics
```

* Every integration writes to its own data stream: one mapping, one lifecycle
* The built-in `logs-*-*` index template maps the **ECS** fields — `source.ip` is an `ip`,
  `event.category` a `keyword`
* A query targets a family with a pattern: `logs-*`, `logs-system.*`, `logs-*-production`

```json
GET /_data_stream/logs-*?filter_path=data_streams.name,data_streams.template
```

---

# Security data sources

| Source | Examples | What it tells |
|--------|----------|---------------|
| **Endpoint** | Elastic Defend, Sysmon, Windows event logs, auditd | processes, files, registry, logons |
| **Network** | Suricata, Zeek, firewalls, Network Packet Capture | connections, DNS, TLS, IDS alerts |
| **Identity** | Active Directory, Entra ID, Okta | authentications, group changes |
| **Cloud** | AWS CloudTrail, Azure activity logs, GCP audit | API calls, configuration changes |
| **Applications** | web servers, proxies, email gateways | requests, URLs, attachments |
| **Threat intel** | AbuseCH, MISP, OTX | indicators: IPs, domains, hashes |

<v-click>

> Each one is an **integration** in Fleet: install it, and its data arrives already in ECS.

</v-click>

---
src: ../../elasticsearch-common/slides/fleet/agent-and-fleet.md
---

---
src: ../../elasticsearch-common/slides/fleet/policies-integrations.md
---

---

# Security integrations

| Integration | Collects |
|-------------|----------|
| **Elastic Defend** | endpoint events and protection: malware, ransomware, memory threats |
| **System** | Linux auth logs, Windows Security, System and Application event logs |
| **Windows** | Sysmon, PowerShell, Forwarded events |
| **Network Packet Capture** | flows, DNS, HTTP, TLS — from the agent's host |
| **Suricata**, **Zeek** | IDS alerts and network logs, from their own sensors |
| **Prebuilt Security Detection Rules** | the Elastic rules, updated out of band |
| **Threat Intelligence** | indicator feeds, for the indicator match rules |

---
src: ../../elasticsearch-common/slides/fleet/deploy-manage.md
---

---

# Practical part

* **Workshop 1** — Start the stack, set up Fleet Server, create an agent policy
  with the System integration, and enroll an Elastic Agent
