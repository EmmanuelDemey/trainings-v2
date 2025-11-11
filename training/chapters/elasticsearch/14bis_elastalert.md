---
layout: cover
---

# ElastAlert 2

Alerting Open-Source pour Elasticsearch

---

# Qu'est-ce qu'ElastAlert 2 ?

* Framework open-source pour créer des alertes sur Elasticsearch/OpenSearch
* Continuation du projet original `Yelp/elastalert` (maintenu activement)
* Alternative gratuite à Watcher/Kibana Alerting
* Écrit en Python, léger et flexible

**Cas d'usage principaux :**
* Détection d'anomalies et de spikes
* Monitoring de sécurité (SOC/SIEM)
* Alerting sur logs applicatifs
* Surveillance d'infrastructure

---

# ElastAlert 2 vs Kibana Alerting

| Critère | ElastAlert 2 | Kibana Alerting |
|---------|--------------|-----------------|
| **Licence** | Open-source (Apache 2.0) | Gratuit (Basic) / Payant (Gold+) |
| **Déploiement** | Externe (Python) | Intégré à Kibana |
| **Configuration** | Fichiers YAML | UI Web / API |
| **Types de règles** | 10+ types prédéfinis | Moins nombreux en Basic |
| **Complexité** | Plus technique | Plus accessible |
| **Flexibilité** | Très extensible | Limitée en Basic |

**Recommandation Ops :** ElastAlert2 pour environnements sans licence Gold/Platinum

---

# Architecture ElastAlert 2

```
┌─────────────────────────────────────────┐
│         ElastAlert 2 Service            │
│  ┌───────────────────────────────────┐  │
│  │   Rule Engine                     │  │
│  │  - Charge les règles (.yaml)      │  │
│  │  - Exécute les requêtes ES        │  │
│  │  - Évalue les conditions          │  │
│  └───────────────────────────────────┘  │
│                  ↓                      │
│  ┌───────────────────────────────────┐  │
│  │   Alerter Manager                 │  │
│  │  - Email, Slack, PagerDuty        │  │
│  │  - Webhooks personnalisés         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           ↕                    ↕
    Elasticsearch          Alerting
    (Data Source)         (Destinations)
```

---

# Installation - Méthode 1 : pip

```bash
# Installation via pip
pip install elastalert2

# Création du fichier de configuration
cp config.yaml.example config.yaml

# Configuration minimale
cat > config.yaml <<EOF
rules_folder: rules
run_every:
  minutes: 1
buffer_time:
  minutes: 15
es_host: localhost
es_port: 9200
writeback_index: elastalert_status
EOF

# Création de l'index ElastAlert
elastalert-create-index --config config.yaml
```

---

# Installation - Méthode 2 : Docker

```bash
# Créer la structure de dossiers
mkdir -p elastalert/{config,rules}

# Créer le docker-compose.yml
cat > docker-compose.yml <<EOF
version: '3'
services:
  elastalert:
    image: jertel/elastalert2:latest
    container_name: elastalert2
    volumes:
      - ./elastalert/config:/opt/elastalert/config
      - ./elastalert/rules:/opt/elastalert/rules
    restart: unless-stopped
EOF

# Démarrage
docker-compose up -d
```

---

# Configuration Globale (config.yaml)

```yaml
# Configuration Elasticsearch
es_host: elasticsearch
es_port: 9200
es_username: elastic
es_password: changeme

# Sécurité SSL/TLS
use_ssl: true
verify_certs: true
ca_certs: /path/to/ca.crt

# Gestion des règles
rules_folder: rules
run_every:
  minutes: 1

# Buffer de recherche
buffer_time:
  minutes: 15

# Index de métadonnées
writeback_index: elastalert_status
alert_time_limit:
  days: 2
```

---

# Types de Règles - Vue d'ensemble

ElastAlert 2 propose **10 types de règles** prédéfinis :

1. **frequency** - N événements dans un intervalle de temps
2. **spike** - Augmentation/diminution soudaine du volume
3. **flatline** - Absence d'événements pendant une période
4. **change** - Changement de valeur d'un champ
5. **blacklist/whitelist** - Liste noire/blanche de valeurs
6. **new_term** - Nouvelle valeur jamais vue
7. **cardinality** - Cardinalité d'un champ
8. **metric_aggregation** - Seuils sur métriques agrégées
9. **percentage_match** - Pourcentage de correspondance
10. **any** - Au moins un résultat

---

# Règle Type 1 : Frequency

**Objectif :** Alerter quand N événements matchent dans un intervalle de temps

```yaml
name: "Trop d'erreurs 500"
type: frequency
index: logs-*

# Nombre d'occurrences
num_events: 5
timeframe:
  minutes: 5

# Requête Elasticsearch
filter:
- query:
    query_string:
      query: "http.response.status_code:500"

# Alerting
alert:
  - email
email:
  - "ops-team@example.com"
```

---

# Règle Type 2 : Spike

**Objectif :** Détecter une augmentation/diminution anormale du volume

```yaml
name: "Spike de connexions échouées"
type: spike
index: auth-logs-*

# Seuil d'augmentation (300%)
spike_height: 3
spike_type: "up"

# Fenêtres de comparaison
timeframe:
  minutes: 15
threshold_ref: 10
threshold_cur: 30

filter:
- query:
    match:
      event.outcome: "failure"

alert:
  - slack
slack_webhook_url: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

---

# Règle Type 3 : Flatline

**Objectif :** Alerter en cas d'absence d'événements (service down)

```yaml
name: "Aucun heartbeat reçu"
type: flatline
index: heartbeat-*

# Seuil d'événements minimum attendu
threshold: 1
timeframe:
  minutes: 5

# Groupement par service
query_key: "service.name"

filter:
- query:
    match:
      event.type: "heartbeat"

alert:
  - pagerduty
pagerduty_service_key: "YOUR_SERVICE_KEY"
pagerduty_client_name: "ElastAlert"
```

---

# Règle Type 4 : Blacklist

**Objectif :** Détecter des valeurs interdites

```yaml
name: "Accès depuis IP blacklistée"
type: blacklist
index: nginx-access-*

# Champ à surveiller
compare_key: "source.ip"

# Liste noire
blacklist:
  - "192.168.1.100"
  - "10.0.0.50"

filter:
- query:
    match:
      http.response.status_code: 200

alert:
  - email
  - slack
email: ["security@example.com"]
```

---

# Règle Type 5 : New Term

**Objectif :** Détecter de nouvelles valeurs jamais vues auparavant

```yaml
name: "Nouveau user-agent jamais vu"
type: new_term
index: web-access-*

# Champ à surveiller
fields:
  - "user_agent.original"

# Fenêtre d'apprentissage
terms_window_size:
  days: 30

filter:
- query:
    exists:
      field: "user_agent.original"

alert:
  - jira
jira_server: "https://jira.example.com"
jira_project: "SEC"
jira_issuetype: "Task"
```

---

# Règle Type 6 : Metric Aggregation

**Objectif :** Alerter sur des seuils de métriques agrégées

```yaml
name: "Temps de réponse moyen élevé"
type: metric_aggregation
index: apm-*

# Métrique
metric_agg_key: "transaction.duration.us"
metric_agg_type: "avg"

# Seuil
max_threshold: 500000  # 500ms en microseconds

# Fenêtre
buffer_time:
  minutes: 10

filter:
- query:
    match:
      processor.event: "transaction"

alert:
  - slack
```

---

# Alerters Disponibles

ElastAlert 2 supporte **30+ destinations d'alerting** :

**Communication :**
- Email (SMTP)
- Slack
- Microsoft Teams
- Telegram
- Discord
- Mattermost

**Ticketing & Incident Management :**
- PagerDuty
- Jira
- ServiceNow
- Opsgenie

**Stockage & Logging :**
- Elasticsearch (index)
- HTTP POST (webhook)
- Command (script custom)

**Cloud & Monitoring :**
- AWS SNS/SES
- Datadog
- TheHive

---

# Configuration Alerter : Email

```yaml
name: "Alerte Email"
type: frequency
# ... règle ...

# Configuration SMTP
alert:
  - email

# Destinataires
email:
  - "ops@example.com"
  - "admin@example.com"

# Serveur SMTP
smtp_host: "smtp.gmail.com"
smtp_port: 587
smtp_ssl: false
smtp_auth_file: "/path/to/smtp_auth.yaml"

# Formatage
email_subject: "ALERT: {0}"
email_body: |
  Règle déclenchée: {0}
  Timestamp: {1}
  Nombre d'événements: {2}
```

---

# Configuration Alerter : Slack

```yaml
name: "Alerte Slack"
type: spike
# ... règle ...

alert:
  - slack

# Webhook URL
slack_webhook_url: "https://hooks.slack.com/services/T00/B00/XXX"

# Personnalisation
slack_username_override: "ElastAlert Bot"
slack_emoji_override: ":bell:"
slack_channel_override: "#ops-alerts"

# Message enrichi
slack_msg_color: "danger"
slack_title: "Spike détecté !"
slack_title_link: "https://kibana.example.com/app/discover"
```

---

# Configuration Alerter : PagerDuty

```yaml
name: "Incident PagerDuty"
type: flatline
# ... règle ...

alert:
  - pagerduty

# Service Key (Events API v2)
pagerduty_service_key: "YOUR_INTEGRATION_KEY"

# Métadonnées
pagerduty_client_name: "ElastAlert2"
pagerduty_event_type: "trigger"  # trigger, resolve, acknowledge

# Payload personnalisé
pagerduty_v2_payload_custom_details:
  service: "{match[service.name]}"
  host: "{match[host.name]}"
  message: "{match[message]}"
```

---

# Configuration Alerter : Webhook Custom

```yaml
name: "Webhook personnalisé"
type: any
# ... règle ...

alert:
  - post

# URL du webhook
http_post_url: "https://api.myapp.com/alerts"

# Headers HTTP
http_post_headers:
  Content-Type: "application/json"
  Authorization: "Bearer YOUR_TOKEN"

# Payload JSON
http_post_payload:
  alert_name: "{rule[name]}"
  timestamp: "{match[timestamp]}"
  severity: "high"
  data: "{match}"

# Options
http_post_all_values: true
http_post_timeout: 10
```

---

# Enrichissement des Alertes

ElastAlert 2 permet d'**enrichir les alertes** avec des données supplémentaires :

```yaml
name: "Alerte enrichie"
type: frequency
# ... règle ...

# 1. Enrichissement via lookup Elasticsearch
enhancement:
  - "elastalert_modules.enhancement.DropMatchException"

# 2. Ajout de champs statiques
static_fields:
  environment: "production"
  team: "platform"

# 3. Variables dans le message
alert_text: |
  Alerte: {rule[name]}
  Environnement: {match[env]}
  Service: {match[service.name]}
  Host: {match[host.name]}
  Message: {match[message]}
  Nombre total: {num_hits}
```

---

# Agrégation d'Alertes (Alert Aggregation)

Éviter le spam d'alertes avec l'**agrégation** :

```yaml
name: "Alertes agrégées"
type: frequency
# ... règle ...

# Agrégation par service
aggregation:
  schedule: "*/5 * * * *"  # Toutes les 5 minutes

# Ou agrégation par clé
query_key: "service.name"
aggregation_key: "host.name"

# Ou simple agrégation temporelle
realert:
  minutes: 10  # Ne pas réalerter avant 10 min

# Summary uniquement
summary_table_fields:
  - "service.name"
  - "host.name"
  - "message"
```

---

# Gestion des Erreurs et Debugging

**Tester une règle avant déploiement :**

```bash
# Test d'une règle spécifique
elastalert-test-rule \
  --config config.yaml \
  rules/mon_alerte.yaml

# Test avec affichage des résultats
elastalert-test-rule \
  --config config.yaml \
  --alert \
  --days 1 \
  rules/mon_alerte.yaml
```

**Logs et troubleshooting :**

```yaml
# Dans config.yaml
logging:
  version: 1
  incremental: false
  formatters:
    verbose:
      format: '%(asctime)s %(levelname)s %(name)s %(message)s'
  handlers:
    console:
      class: logging.StreamHandler
      formatter: verbose
  loggers:
    elastalert:
      level: DEBUG
```

---

# Monitoring ElastAlert 2

**Index de statut :** `elastalert_status`

```json
GET elastalert_status*/_search
{
  "sort": [{"@timestamp": "desc"}],
  "size": 10
}
```

**Métriques importantes :**
- `elastalert_status` - État des règles
- `elastalert_error` - Erreurs d'exécution
- `silence` - Règles silencées
- `elastalert` - Alertes déclenchées

**Dashboard Kibana recommandé :**
- Nombre d'alertes par règle (Timeline)
- Taux d'erreur des règles (Pie chart)
- Temps d'exécution des règles (Line chart)

---

# Best Practices - Configuration

**Performance :**
- Limiter `buffer_time` au strict nécessaire (éviter > 1h)
- Utiliser `use_count_query: true` pour les grandes volumétries
- Optimiser les filtres Elasticsearch
- Activer `use_strftime_index: true` pour les index temporels

**Fiabilité :**
- Toujours tester les règles avec `elastalert-test-rule`
- Configurer `alert_time_limit` pour éviter les alertes dupliquées
- Utiliser `realert` pour limiter le spam
- Monitor l'index `elastalert_status`

**Sécurité :**
- Stocker les credentials dans des fichiers séparés
- Utiliser SSL/TLS pour Elasticsearch
- Restreindre les permissions du user ElastAlert (read-only sur les index)
- Ne jamais commiter les fichiers de config avec secrets

---

# Best Practices - Règles

**Conception :**
1. **Nommage explicite** : `prod-api-errors-500-spike`
2. **Documentation** : Ajouter des commentaires dans les YAML
3. **Ownership** : Spécifier l'équipe responsable
4. **Priorité** : Utiliser des tags (`priority: P1`)

**Éviter les faux positifs :**
```yaml
# Filtres stricts
filter:
  - query:
      bool:
        must:
          - match: {env: "production"}
        must_not:
          - match: {service.name: "test-*"}

# Seuils appropriés
num_events: 10  # Pas trop bas
timeframe:
  minutes: 5    # Fenêtre adaptée
```

---

# Best Practices - Déploiement

**Déploiement Production :**

```yaml
# docker-compose.yml
version: '3.8'
services:
  elastalert:
    image: jertel/elastalert2:2.15.0  # Version fixe
    container_name: elastalert2
    restart: always
    volumes:
      - ./config:/opt/elastalert/config:ro
      - ./rules:/opt/elastalert/rules:ro
      - ./smtp_auth.yaml:/opt/elastalert/smtp_auth.yaml:ro
    environment:
      - TZ=Europe/Paris
    healthcheck:
      test: ["CMD", "python", "-m", "elastalert.elastalert", "--config", "/opt/elastalert/config/config.yaml", "--es-debug-trace"]
      interval: 60s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

# Cas d'Usage 1 : Sécurité

**Détection de brute-force SSH :**

```yaml
name: "SSH Brute Force Attack"
type: frequency
index: auth-logs-*

num_events: 5
timeframe:
  minutes: 5

query_key: "source.ip"

filter:
  - query:
      bool:
        must:
          - match: {event.action: "ssh_login"}
          - match: {event.outcome: "failure"}

alert:
  - email
  - slack
email: ["security@example.com"]
slack_webhook_url: "https://hooks.slack.com/..."
alert_subject: "SECURITY: SSH Brute Force from {0}"
```

---

# Cas d'Usage 2 : Performance

**Dégradation du temps de réponse API :**

```yaml
name: "API Response Time Degradation"
type: metric_aggregation
index: apm-transactions-*

metric_agg_key: "transaction.duration.us"
metric_agg_type: "percentiles"
metric_agg_script:
  script: "doc['transaction.duration.us'].value"

percentile_range: 95
max_threshold: 1000000  # 1 seconde (en microseconds)

buffer_time:
  minutes: 5

query_key: "transaction.name"

filter:
  - term:
      processor.event: "transaction"

alert:
  - pagerduty
```

---

# Cas d'Usage 3 : Business Metrics

**Alerte sur chute de commandes :**

```yaml
name: "Drop in Orders"
type: flatline
index: orders-*

threshold: 10
timeframe:
  minutes: 15

use_count_query: true

filter:
  - query:
      bool:
        must:
          - match: {order.status: "completed"}
          - range:
              order.amount:
                gte: 0

alert:
  - email
  - slack
email_reply_to: "business-alerts@example.com"
alert_text: |
  ⚠️ Chute significative des commandes détectée !

  Période: {0}
  Seuil attendu: {1} commandes / 15 min
  Vérifier le système de paiement.
```

---

# Cas d'Usage 4 : Infrastructure

**Surveillance du disk usage :**

```yaml
name: "High Disk Usage"
type: metric_aggregation
index: metricbeat-*

metric_agg_key: "system.filesystem.used.pct"
metric_agg_type: "max"

max_threshold: 0.85  # 85%

buffer_time:
  minutes: 5

query_key: "host.name"

filter:
  - term:
      metricset.name: "filesystem"
  - term:
      system.filesystem.mount_point: "/"

alert:
  - opsgenie
opsgenie_key: "YOUR_API_KEY"
opsgenie_priority: "P2"
```

---

# Migration Watcher → ElastAlert 2

**Comparaison des concepts :**

| Watcher | ElastAlert 2 |
|---------|--------------|
| Watch | Rule (fichier YAML) |
| Trigger (schedule) | `run_every` |
| Input (search) | `filter` + `index` |
| Condition (compare) | `type` + seuils |
| Actions | `alert` + alerters |
| .watcher-history | elastalert_status |

**Exemple de migration :**

```yaml
# Watcher → ElastAlert 2
# trigger.schedule.interval: "5m" → run_every: {minutes: 5}
# input.search → filter: [...]
# condition.compare → type: frequency + num_events
# actions.email → alert: [email]
```

---

# Intégration CI/CD

**Validation automatique des règles :**

```yaml
# .gitlab-ci.yml
test-elastalert-rules:
  stage: test
  image: jertel/elastalert2:latest
  script:
    - |
      for rule in rules/*.yaml; do
        echo "Testing $rule..."
        elastalert-test-rule \
          --config config.yaml \
          --days 1 \
          "$rule" || exit 1
      done
  only:
    changes:
      - rules/*.yaml
```

**Déploiement automatisé :**

```bash
# deploy.sh
#!/bin/bash
set -e

# Validation
elastalert-test-rule --config config.yaml rules/*.yaml

# Déploiement
rsync -avz rules/ elastalert-server:/opt/elastalert/rules/
ssh elastalert-server "docker restart elastalert2"
```

---

# ElastAlert 2 avec Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: elastalert2
spec:
  replicas: 1
  selector:
    matchLabels:
      app: elastalert2
  template:
    metadata:
      labels:
        app: elastalert2
    spec:
      containers:
      - name: elastalert2
        image: jertel/elastalert2:2.15.0
        volumeMounts:
        - name: config
          mountPath: /opt/elastalert/config
          readOnly: true
        - name: rules
          mountPath: /opt/elastalert/rules
          readOnly: true
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: config
        configMap:
          name: elastalert-config
      - name: rules
        configMap:
          name: elastalert-rules
```

---

# Ressources et Documentation

**Documentation officielle :**
- 📖 [ElastAlert 2 Docs](https://elastalert2.readthedocs.io/)
- 💻 [GitHub Repository](https://github.com/jertel/elastalert2)
- 🐳 [Docker Hub](https://hub.docker.com/r/jertel/elastalert2)

**Tutoriels 2024-2025 :**
- [Mastering Real-Time Alerting with ElastAlert2](https://www.tothenew.com/blog/setting-up-elastalert2-for-real-time-alerting-on-elasticsearch-indices/) (Avril 2025)
- [Rules and alerts with ElastAlert 2](https://www.bujarra.com/reglas-y-alertas-con-elastalert-2/?lang=en)

**Communauté :**
- GitHub Issues & Discussions
- Elastic Community Forums

---
layout: cover
---

# Travaux Pratiques

ElastAlert 2 - Configuration et Règles d'Alerting
