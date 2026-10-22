---
layout: cover
---

# Elastic Security for SIEM

---

# Learning objectives

At the end of these three days, you will be able to:

- **Describe** the Elastic Stack, Fleet and Elastic Agent, and how security data flows through them
- **Normalize** logs with the **Elastic Common Schema** (ECS)
- **Search** security data in **Discover** with KQL, Lucene and ES|QL
- **Build** visualizations and dashboards for security use cases
- **Use** the **Security app**: hosts, network, users, AI Assistant, Attack Discovery
- **Write** detection rules with KQL, EQL, Lucene and ES|QL, and **triage** their alerts
- **Investigate** with Timeline and **track** incidents with Cases
- **Hunt** an adversary across a dataset, from the first beacon to the exfiltration

---

# Who is this training for?

* Analysts who use **Elastic Security as their SIEM**
* Cybersecurity analysts monitoring and investigating logs in a **SOC**

### Prerequisites — a basic understanding of

| Area | What we assume |
|------|----------------|
| Networking | TCP/IP, common ports and protocols, routers, switches, firewalls |
| Network monitoring | IDS (Suricata), Zeek, packet capture |
| Operating systems | Windows and Linux, file systems and permissions, the command line |
| Attacks | Reconnaissance, command and control (C2), data exfiltration |

---

# Agenda — 3 days

| Day | Chapters | Workshops |
|-----|----------|-----------|
| **1** | Stack overview, Fleet and Elastic Agent · Elastic Common Schema · Discover | 1 · 2 · 3 |
| **2** | Visualizations · Dashboards · The Security app · Detection rules | 4 · 5 |
| **3** | Alerts, Timeline and Cases · Threat hunting capstone | 6 · 7 |

---

# What is a SIEM?

**Security Information and Event Management**

<v-clicks>

* **Collect** the events of every source: hosts, network, cloud, identity, SaaS
* **Normalize** them into one schema, so that one query covers every source
* **Store** them long enough to investigate — months, sometimes years
* **Detect**: rules run continuously and raise alerts
* **Investigate**: pivot from an alert to everything around it
* **Respond**: track the incident, isolate a host, share the findings

</v-clicks>

---

# Elastic Security

* A **solution** of the Elastic Stack, inside Kibana — no extra product to install
* **SIEM**: detection engine, 1,000+ prebuilt rules mapped to **MITRE ATT&CK**,
  Timeline, Cases, entity analytics
* **Endpoint security** (Elastic Defend): prevention, EDR, response actions
* **Cloud security**: posture (CSPM, KSPM) and workload protection
* **AI**: AI Assistant and Attack Discovery, on top of the alerts
* Built on **Elasticsearch**: every event searchable, at scale, for as long as
  the retention allows

---

# The lab

* An **Elastic Stack 9.5** — Elasticsearch, Kibana, Fleet Server — on your machine
  (Docker), or an Elastic Cloud trial
* One **Elastic Agent**, enrolled in Fleet, that collects your own machine's logs
* A **lab dataset**, `logs-lab-default`: 25 ECS events telling one intrusion
  * a **brute force** on an SSH server, then a download and a script run
  * a **phishing** document that starts PowerShell, then a **beacon** to a C2 server
  * **discovery** commands, a **lateral movement**, a credential dump
  * an **exfiltration** of 48 MB

<v-click>

> We will find each of these steps — with Discover, a dashboard, a detection
> rule, and at last a hunt.

</v-click>
