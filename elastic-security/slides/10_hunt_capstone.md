---
layout: cover
---

# 10 - Threat hunting capstone

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Choose** the right hunt tool for each question
- **Know** when to dig deeper — and when to stop
- **Apply** the kill chain to structure a hunt
- **Hand over** a hunt to response operations
- **Run** individual and team hunts across a full dataset

---

# Hunting vs. detecting

| | Detection | Hunting |
|--|-----------|---------|
| Starts from | a rule | a **hypothesis** |
| Runs | continuously | on demand, time-boxed |
| Finds | the known | the **unknown** — what no rule caught |
| Produces | alerts | findings, **new rules**, better data |

<v-click>

> A hunt that finds nothing still produces something: a hypothesis checked, a
> gap in the data, a rule to write.

</v-click>

---

# The hunting loop

```text
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │  Hypothesis  │────▶│  Investigate │────▶│   Findings   │
   │  ATT&CK, CTI │     │  queries,    │     │  incident?   │
   └──────▲───────┘     │  pivots      │     │  new rule?   │
          │             └──────────────┘     └──────┬───────┘
          └─────────────────────────────────────────┘
                     enrich, automate
```

* **Hypothesis**: *"a host beacons to a C2 server"* — from ATT&CK, threat intel, an incident
* **Investigate**: query, aggregate, pivot
* **Findings**: an incident → a case; a pattern → a detection rule

---

# Choosing the right tool

| Question | Tool |
|----------|------|
| What happened at that time, on that host? | **Discover**, **Timeline** |
| What is rare? Who is the outlier? | **ES\|QL** `STATS … BY`, sorted ascending |
| Did A happen, then B? | **EQL** sequences — Timeline *Correlation* tab |
| What does this process tree look like? | **Analyzer**, **Session view** |
| Is this value known elsewhere? | **Prevalence**, **threat intel**, indicator match |
| How does it evolve? | **Lens**, dashboards |
| Is it unusual for this entity? | **ML** anomalies, **entity risk** |

---

# Knowing when to dig deeper

<v-clicks>

* **Dig** when the value is **rare** (one host, one day), **regular** (a beacon
  every 60 s), or **chained** (Word → PowerShell → a binary in `%TEMP%`)
* **Dig** when it touches a **critical asset** or a **privileged user**
* **Stop** when it is explained — a known tool, a change ticket, an admin — and
  **write it down** (an exception, a note)
* **Time-box**: a hunt is not an endless investigation — two hours, then decide
* **Escalate** as soon as it is an incident: the hunt becomes a case

</v-clicks>

---

# The kill chain

| Phase | ATT&CK tactics | What to look for |
|-------|----------------|------------------|
| **Reconnaissance** | Reconnaissance | scans, enumeration from outside |
| **Delivery / Exploitation** | Initial Access, Execution | brute force, phishing doc, exploit |
| **Installation** | Persistence | cron, scheduled task, service, Run key |
| **Command & Control** | Command and Control | beacons, rare domains, long connections |
| **Actions on objectives** | Discovery, Lateral Movement, Credential Access, Exfiltration | `whoami`, `net group`, SMB, LSASS dump, big uploads |

<v-click>

> Find **one** step, then walk the chain **both ways**: what came before, what came after.

</v-click>

---

# Hunt 1 — Find the beacons

* Hypothesis: a host talks to a C2 server **at a regular interval**
* A beacon = **many** connections, **same** destination, **same** size, **regular** gaps

```json
POST /_query?format=txt
{
  "query": """
    FROM logs-lab-default
    | WHERE event.category == "network" AND network.direction == "egress"
    | STATS connections = COUNT(*), sizes = COUNT_DISTINCT(destination.bytes),
            first_seen = MIN(@timestamp), last_seen = MAX(@timestamp)
            BY host.name, process.name, destination.ip
    | WHERE connections >= 5
    | SORT connections DESC
  """
}
```

* Then: **who** started that process? Pivot to its parent

---

# Hunt 2 — Enemy objectives

* Hypothesis: once in, the adversary **discovers** the domain and **dumps credentials**

```json
POST /logs-lab-default/_eql/search
{
  "query": """
    process where process.name in ("whoami.exe", "net.exe", "nltest.exe", "rundll32.exe")
      and process.command_line : ("*whoami*", "*Domain Admins*", "*domain_trusts*", "*comsvcs*MiniDump*")
  """
}
```

* `rundll32 comsvcs.dll MiniDump` = **LSASS dump** (T1003.001) — credentials stolen
* Which host? Which user? How did they get there — **lateral movement**?

---

# Hunt 3 — Apply the kill chain

* Start from **one** finding — the beacon of `ws-02` — and walk back and forth

```json
POST /_query?format=txt
{
  "query": """
    FROM logs-lab-default
    | WHERE host.name == "ws-02"
    | KEEP @timestamp, event.category, process.parent.name, process.name, destination.ip, source.bytes
    | SORT @timestamp ASC
  """
}
```

* Delivery (`winword.exe`) → execution (`powershell.exe -enc`) → C2 (`updater.exe`)
  → discovery → lateral movement (SMB to `10.0.0.20`) → exfiltration (48 MB)

---

# Hunt 4 — Full-spectrum adversary detection

* Two intrusions? Or **one** campaign?
* What links `web-01` (SSH brute force) and `ws-02` (phishing)?

```json
POST /_query?format=txt
{
  "query": """
    FROM logs-lab-default
    | WHERE destination.ip == "198.51.100.7" OR process.command_line LIKE "*198.51.100.7*"
    | STATS events = COUNT(*), first_seen = MIN(@timestamp) BY host.name
  """
}
```

* The same **infrastructure**: `198.51.100.7` serves the payload of `web-01` and
  the C2 of `ws-02`

---

# Response operations

<v-clicks>

* **Contain**: isolate the host (Elastic Defend), disable the account, block the IP
* **Collect**: response actions — process list, file retrieval, memory dump
* **Eradicate**: kill the process, delete the binary, remove the persistence
* **Recover**: reset credentials — every account seen on the dumped host
* **Learn**: every finding becomes a **rule**, an **exception**, a **dashboard**
  panel — so the next hunt starts higher

</v-clicks>

---

# Individual and team hunts

* **Individual**: one hypothesis, one analyst, two hours, a written outcome
* **Team**: split the kill chain — one analyst per phase — and meet on **one
  shared timeline** and **one case**
* **Hunt log**: hypothesis, data used, queries, findings, what changed
* **Measure**: hypotheses tested, rules created, mean time to detect

---

# Practical part

* **Workshop 7** — The capstone: four hunt missions on the lab dataset, alone,
  then as a team — and the rules they leave behind
