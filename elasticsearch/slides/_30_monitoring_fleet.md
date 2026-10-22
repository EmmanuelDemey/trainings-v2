---
layout: section
---

# Part 11: Monitoring with Beats and Fleet

---
src: ../../elasticsearch-common/slides/fleet/agent-and-fleet.md
---

---
src: ../../elasticsearch-common/slides/fleet/policies-integrations.md
---

---
src: ../../elasticsearch-common/slides/fleet/deploy-manage.md
---

---

# Metricbeat: Use Case Without Fleet

If you can't use Fleet, Metricbeat is still available:

```yaml
# metricbeat.yml
metricbeat.modules:
- module: system
  metricsets: ["cpu", "memory", "network", "filesystem"]
  period: 10s

- module: elasticsearch
  metricsets: ["node", "node_stats"]
  period: 10s
  hosts: ["localhost:9200"]

output.elasticsearch:
  hosts: ["https://es.cloud:9243"]
  username: "metricbeat"
  password: "xxx"
```

```bash
sudo metricbeat setup
sudo systemctl start metricbeat
```

---

# Filebeat: Use Case Without Fleet

```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/nginx/access.log
  fields:
    log_type: nginx_access

- type: log
  enabled: true
  paths:
    - /var/log/nginx/error.log
  fields:
    log_type: nginx_error

output.elasticsearch:
  hosts: ["https://es.cloud:9243"]
  username: "filebeat"
  password: "xxx"

setup.kibana:
  host: "https://kibana.cloud:5601"
```

```bash
sudo filebeat setup
sudo systemctl start filebeat
```

---

# Fleet vs Traditional Beats

<v-clicks>

| Aspect | Traditional Beats | Fleet + Elastic Agent |
|--------|------------------|----------------------|
| **Installation** | Manual YAML config | Kibana UI + 1 command |
| **Updates** | Manual on each server | Automatic from Kibana |
| **Configuration** | Edit YAML + restart | Modify policy in UI |
| **Multi-services** | 1 Beat per service | 1 agent for everything |
| **Monitoring** | Separate Metricbeat | Integrated |
| **Use case** | Simple setups, legacy | Large-scale management |

</v-clicks>

---

# Popular Integrations

<v-clicks>

**Infrastructure**:
- System, Docker, Kubernetes, Prometheus

**Web servers**:
- Nginx, Apache, IIS

**Databases**:
- MySQL, PostgreSQL, MongoDB, Redis

**Cloud**:
- AWS (CloudWatch, S3, VPC Flow Logs...)
- Azure (Monitor, Activity Logs...)
- GCP (Operations, Load Balancer...)

**Security**:
- Endpoint Security, Windows, CrowdStrike

</v-clicks>
