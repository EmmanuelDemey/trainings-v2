---
layout: cover
---

# 07 - The Security app

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Navigate** the Security app and its main pages
- **Summarize** the information of the **Hosts**, **Network** and **Users** pages
- **Identify** the use cases of the **AI Assistant**
- **Recognize** the capabilities of **Attack Discovery** and AI-powered workflows
- **Monitor** security events with the dashboards of the Security app

---

# The Security app

| Area | Pages |
|------|-------|
| **Dashboards** | Overview, Detection & Response, Entity analytics, Data quality |
| **Rules** | Detection rules (SIEM), Benchmarks, Shared exception lists, MITRE ATT&CK coverage |
| **Alerts** | the alerts table, grouping, the alert flyout |
| **Attack Discovery** | attacks reconstructed from alerts, by an LLM |
| **Cases** | incidents and their evidence |
| **Timelines** | investigations, saved and templated |
| **Explore** | **Hosts**, **Network**, **Users** |
| **Intelligence** | threat indicators |

* It reads the **Security data view** — `logs-*`, `endgame-*`, `auditbeat-*`… —
  set in *Advanced settings* (`securitySolution:defaultIndex`)

---

# Explore: Hosts

* Every `host.name` seen in the time range: OS, last seen, risk score
* **Events**, **authentications**, **uncommon processes**, **anomalies** (ML),
  **sessions** (Linux session view)
* A **host page**: everything about one host — its users, its alerts, its
  processes, its risk

<v-click>

> *Uncommon processes* on `ws-02`: `updater.exe`, started from `%TEMP%` by `powershell.exe`.

</v-click>

---

# Explore: Network

* **Map**: source and destination of the flows, by `source.geo` / `destination.geo`
* **Flows**: top source and destination IPs, by bytes and flows
* **DNS**: top domains, unique sub-domains — tunneling shows here
* **HTTP**, **TLS**: requests, certificates, JA3
* An **IP page**: every host that talked to it, the domains it had, the
  certificates it showed

---

# Explore: Users

* Every `user.name`: last seen, domain, risk score
* **Authentications**: successes and failures by user and source
* **Anomalies**: unusual logon times, countries, privileges (ML)
* A **user page**: hosts used, alerts, risk contributions

<v-click>

> *Authentications* on `admin`: five failures from `203.0.113.50`, then a success.

</v-click>

---

# Entity analytics

* **Entity risk score**: every host and user gets a score from the **alerts**
  about it — weighted by severity, decayed over time
* **Asset criticality**: you say `db-01` is *extreme impact* — its alerts weigh more
* **Entity store**: one document per host and per user, kept up to date
* Prioritize: **"which host first?"** — the riskiest, not the noisiest

---

# AI Assistant

* A chat inside Elastic Security, on top of **your** connector: OpenAI, Azure,
  Bedrock, Gemini, or a local model
* **Use cases**
  * **explain** an alert, a command line, a rule
  * **write** a query: *"ES|QL: failed logons per user per hour"*
  * **convert** a query from another SIEM (SPL, KQL from Sentinel) to ES|QL
  * **summarize** a case or a timeline into a report
  * **answer** from your knowledge base: runbooks, past incidents
* **Anonymization**: choose which fields are sent to the LLM, and which are
  replaced by a placeholder

---

# Attack Discovery

* An LLM reads the **open alerts** and groups them into **attacks** — the story,
  not the list
* Each discovery: a **title**, a **summary**, the **hosts and users** involved,
  the **MITRE ATT&CK** tactics, the alerts that support it
* From a discovery: open the alerts, **add to a case**, **ask the AI Assistant**
* **Scheduled** discoveries, with notifications: an attack is found without
  anyone asking

<v-click>

> 200 alerts in the queue → 3 attacks to look at.

</v-click>

---

# AI-powered workflows

| Workflow | What the AI does |
|----------|------------------|
| **Automatic import** | builds an integration from a sample of your logs: pipeline + ECS mapping |
| **Automatic migration** | translates Splunk rules into Elastic rules |
| **Attack Discovery** | groups alerts into attacks |
| **AI Assistant** | explains, queries, summarizes |
| **Knowledge base** | your documents and indices, as context for the Assistant |

* Always **human in the loop**: the AI proposes, the analyst decides

---

# Dashboards of the Security app

* **Overview**: alerts trend, recent cases, events by category, threat intel
* **Detection & Response**: alerts by severity and status, open cases, top
  hosts and users by alerts
* **Entity analytics**: the riskiest hosts and users
* **Data quality**: is every index in ECS? fields with the wrong type, unknown fields
* Plus every **Kibana dashboard tagged** `Security Solution`

---

# Practical part

* **Workshop 5, part 1** — Explore the lab dataset in the Security app: hosts,
  users, network, the data quality dashboard
