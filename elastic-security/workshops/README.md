# Elastic Security for SIEM — Workshops

The hands-on exercises of the **Elastic Security for SIEM** training. Each
workshop states the goal of every step, a folded hint, and the expected result
to check your own answer, with success criteria and a troubleshooting section.
The answers are in the solutions, for the trainer.

## What you need

- **Docker** (Compose v2) and **8 GB of free RAM**, for the lab stack —
  Elasticsearch, Kibana and a Fleet Server 9.5.6, in the `lab/` folder of each
  workshop (`docker compose up -d --wait`); or an **Elastic Cloud** trial;
- a recent browser (Chrome or Firefox), **without an ad blocker**;
- **Kibana Dev Tools** (Console): the `GET /…`, `POST /…`, `PUT /…` blocks of
  the instructions paste into it as is.

Each workshop **stands on its own**: from workshop 2 on, its setup loads the
**lab dataset** — 25 ECS events, in `logs-lab-default`, that tell the story of
an intrusion: SSH brute force, phishing, C2 beacon, reconnaissance, lateral
movement, credential dumping and exfiltration. Their dates are recomputed at
load time: set Kibana to **Last 4 hours**.

Every Dev Tools request, of the workshops and of their solutions, is replayed
by the CI on Elasticsearch 9.5.6: they pass, and the responses have the shape
shown.

## The workshops

| Day | Workshop | Folder | Topic |
|-----|----------|--------|-------|
| 1 | 1 | `01_lab_fleet/` | The lab stack, Fleet Server, agent policy, enrolling an Elastic Agent |
| 1 | 2 | `02_ecs/` | Reading ECS, its types, normalizing a raw log with a pipeline |
| 1 | 3 | `03_discover/` | Discover: data view, KQL, Lucene, ES\|QL |
| 2 | 4 | `04_visualizations_dashboards/` | Lens, formulas, SOC dashboard, controls, drilldown |
| 2 | 5 | `05_security_app_rules/` | Hosts, Users, Network; KQL, threshold, EQL, ES\|QL rules |
| 3 | 6 | `06_alerts_timeline_cases/` | Alert triage, Timeline, Cases; *optional*: push the case to TheHive |
| 3 | 7 | `07_hunt_capstone/` | Capstone: four hunting missions, alone then in teams |
