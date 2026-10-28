---
layout: cover
---

# 06 - Dashboards

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Interpret** data with the relevant dashboards — prebuilt and your own
- **Pivot** between the apps of Kibana without losing the context
- **Apply** the best practices of dashboard design
- **Create** dashboards for security use cases

---

# Dashboards in a SOC

* A **dashboard** = panels — Lens, saved searches, maps, Markdown, controls —
  sharing one **time range**, one **query**, its **filters**
* **Prebuilt**: every integration installs its own — *[System] Security*,
  *[Elastic Defend] Overview*, *[Suricata] Alerts*…
* **Security app dashboards**: *Detection & Response*, *Entity analytics*, *Data quality*
* Your own: the questions of **your** SOC — a shift view, a management view, a
  campaign view

---

# Interpreting a dashboard

<v-clicks>

* Read it **from the top**: the overview first (metrics), the details below (tables)
* **Change the time range**, not the dashboard: a spike yesterday, a trend this month
* **Click a value** — an IP, a user, a host — it becomes a **filter on every panel**
* **Compare**: the same dashboard with `host.os.family: windows`, then `linux`
* **Inspect** a panel: what was asked to Elasticsearch, and what came back

</v-clicks>

---

# Pivoting between apps

| From | To | How |
|------|----|-----|
| Dashboard panel | Discover | panel menu → *Explore in Discover*: same query, filters, time |
| Discover field | Lens | *Visualize* on a field |
| Any value | Security app | *Investigate in timeline*, or open the host / user / IP page |
| Alert | Dashboard | a **drilldown** with the alert's `host.name` as a filter |
| Dashboard | Dashboard | **drilldowns**: click a host on the overview, open its detail dashboard |

* **Pinned filters** follow you from one app to the next
* **Drilldowns** to a URL: a ticket, a threat intel portal, `virustotal.com/…/{{event.value}}`

---

# Best practices

<v-clicks>

* **One audience, one dashboard**: the analyst on shift ≠ the CISO
* **Five to ten panels** — beyond that, split it and link with drilldowns
* **Top-down**: metrics → trends → tables of events
* **Controls** (options list, range slider) instead of asking users to type KQL
* **No hard-coded time** in panels: the time picker decides
* **Markdown panel**: what this dashboard is for, who owns it, the runbook link
* **Spaces** and **tags** to organize; **saved objects** export to version them

</v-clicks>

---

# Sharing dashboards

* **Saved objects** export as NDJSON — commit them, import them in another
  space or another cluster
* **Share**: a link with the time range, an embed, a PDF or PNG report
  (*Reporting*), on a **schedule**
* **Permissions** with spaces and roles: read-only for management, all for the SOC

---

# Practical part

## Workshop 4, part 2 — A SOC dashboard
