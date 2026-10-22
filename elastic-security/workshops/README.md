# Elastic Security for SIEM — Travaux pratiques

Les exercices pratiques de la formation **Elastic Security for SIEM**. Chaque TP
est **guidé** : les requêtes à envoyer, les manipulations dans Kibana et les
réponses attendues sont dans son énoncé, avec des critères de succès et une
section de dépannage.

## Ce qu'il faut

- **Docker** (Compose v2) et **8 Go de RAM** libres, pour la stack du TP 1 —
  Elasticsearch, Kibana et un Fleet Server 9.5.5 ; ou un essai **Elastic Cloud** ;
- un navigateur récent (Chrome ou Firefox), **sans bloqueur de publicité** ;
- **Kibana Dev Tools** (Console) : les blocs `GET /…`, `POST /…`, `PUT /…` des
  énoncés s'y collent tels quels.

Chaque TP est **autonome** : à partir du TP 2, son setup charge le **jeu de
données du lab** — 25 événements ECS, dans `logs-lab-default`, qui racontent une
intrusion : brute force SSH, phishing, beacon C2, reconnaissance, mouvement
latéral, dump d'identifiants et exfiltration. Ses dates sont recalculées au
chargement : réglez Kibana sur **Last 4 hours**.

Toutes les requêtes Dev Tools sont rejouées par la CI sur Elasticsearch 9.5.5 :
elles passent, et les réponses ont la forme annoncée.

## Les TP

| Jour | TP | Dossier | Sujet |
|------|----|---------|-------|
| 1 | 1 | `01_lab_fleet/` | La stack du lab, Fleet Server, agent policy, enrôler un Elastic Agent |
| 1 | 2 | `02_ecs/` | Lire l'ECS, ses types, normaliser un log brut avec un pipeline |
| 1 | 3 | `03_discover/` | Discover : data view, KQL, Lucene, ES\|QL |
| 2 | 4 | `04_visualizations_dashboards/` | Lens, formules, dashboard SOC, contrôles, drilldown |
| 2 | 5 | `05_security_app_rules/` | Hosts, Users, Network ; règles KQL, seuil, EQL, ES\|QL |
| 3 | 6 | `06_alerts_timeline_cases/` | Triage des alertes, Timeline, Cases |
| 3 | 7 | `07_hunt_capstone/` | Capstone : quatre missions de chasse, seul puis en équipe |
