---
layout: section
---

# Part 11: Monitoring with Beats and Fleet

---

# Elastic Beats: Overview

The **Beats** family = lightweight data collection agents

<v-clicks>

| Beat | Usage | Data collected |
|------|-------|----------------|
| **Filebeat** | Logs | Log files, journals |
| **Metricbeat** | Metrics | CPU, memory, disk, services |
| **Packetbeat** | Network | Network traffic, protocols |
| **Auditbeat** | Audit/Security | System files, processes |
| **Heartbeat** | Uptime | Service availability |
| **Elastic Agent** | **All-in-one** | Replaces all Beats |

</v-clicks>

---

# Traditional Architecture (Beats)

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│   Server    │       │   Server    │       │   Server     │
│             │       │             │       │              │
│  Filebeat   │──────▶│             │       │              │
│  Metricbeat │       │ Logstash    │──────▶│ Elasticsearch│
│             │       │  (optional) │       │              │
└─────────────┘       └─────────────┘       └──────────────┘
                                                    │
                                                    ▼
                                           ┌──────────────┐
                                           │    Kibana    │
                                           └──────────────┘
```

<v-clicks>

**Limitations**:
- Manual configuration on each server
- No centralized management
- Manual updates

</v-clicks>

---

# Modern Architecture (Fleet)

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│   Server    │       │   Server    │       │   Server     │
│             │       │             │       │              │
│  Elastic    │       │  Elastic    │       │  Elastic     │
│  Agent      │──┐    │  Agent      │──┐    │  Agent       │──┐
│             │  │    │             │  │    │              │  │
└─────────────┘  │    └─────────────┘  │    └──────────────┘  │
                 │                      │                      │
                 └──────────────────────┴──────────────────────┘
                                 │
                                 ▼
                        ┌──────────────┐
                        │ Fleet Server │
                        └──────────────┘
                                 │
                                 ▼
                        ┌──────────────┐
                        │ Elasticsearch│────▶ Kibana
                        └──────────────┘
```

<v-click>

✅ **Centralized management from Kibana!**

</v-click>

---

# Elastic Agent: The Unified Replacement

**One single agent** to replace everything:

<v-clicks>

| Old approach | New approach |
|--------------|--------------|
| Filebeat + config | Elastic Agent |
| Metricbeat + config | Elastic Agent |
| Packetbeat + config | Elastic Agent |
| Auditbeat + config | Elastic Agent |
| APM Server | Elastic Agent |
| **= 5+ processes** | **= 1 single agent** |

**Benefits**:
- Configuration via Kibana UI (Fleet)
- Automatic updates
- Reusable policies

</v-clicks>

---

# Fleet: Centralized Management

**Fleet** = management system for Elastic Agents from Kibana

<v-clicks>

**Features**:
- 📋 **Policies**: Reusable configurations
- 🔌 **Integrations**: 100+ pre-configured integrations
- 🚀 **Deployment**: Single installation script
- 🔄 **Updates**: Automatic from Kibana
- 👀 **Monitoring**: Real-time status of all agents

</v-clicks>

---

# Fleet Concepts: Agent Policy

A **Policy** = configuration assigned to one or more agents

```yaml
# Example "Web Servers" policy
Integrations:
  - System (CPU, RAM, disk metrics)
  - Nginx (logs + metrics)
  - APM (application tracing)

Output:
  - Elasticsearch: https://es.cloud:9243

Settings:
  - Monitoring enabled: true
  - Update frequency: 1h
```

<v-click>

> An agent can have **only one policy** at a time

</v-click>

---

# Fleet Concepts: Integrations

**Integration** = pre-configured package for a service/technology

<v-clicks>

**Categories**:
- **Observability**: System, Docker, Kubernetes, AWS, Azure...
- **Security**: Windows, Linux, Cloud, Endpoint Protection
- **Custom logs**: Custom logs via Filebeat

**Contains**:
- Input configuration (where to read data)
- Parsing/transformation (pipelines)
- Pre-built Kibana dashboards
- Pre-defined alerts

</v-clicks>

---

# Example: System Integration

The **System** integration collects:

<v-clicks>

**Metrics**:
- CPU usage (per core)
- Memory (RAM, swap)
- Disk I/O and space
- Network (bytes in/out)
- Active processes
- Uptime

**Logs**:
- Syslog
- Auth logs
- System logs

</v-clicks>

---

# Example: Nginx Integration

The **Nginx** integration collects:

<v-clicks>

**Logs** (access + error):
- Automatically parsed (IP, status, URL, user-agent...)
- Geolocalization (via GeoIP)

**Metrics** (via stub_status):
- Active connections
- Requests/sec
- Reading/writing/waiting

**Included dashboards**:
- Overview
- Access/Error logs
- Performance metrics

</v-clicks>

---

# Detailed Fleet Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Kibana UI                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Policies   │  │ Integrations │  │  Agents   │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  Fleet Server    │ ← Elastic Agent in server mode
                 │  (port 8220)     │
                 └──────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │  Agent 1   │  │  Agent 2   │  │  Agent N   │
   │  (Policy A)│  │  (Policy B)│  │  (Policy A)│
   └────────────┘  └────────────┘  └────────────┘
          │               │               │
          └───────────────┴───────────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  Elasticsearch   │
                 └──────────────────┘
```

---

# Fleet Installation: Step 1 - Fleet Server

In Kibana → Fleet → Settings:

<v-clicks>

1. **Fleet Server host**: `https://fleet-server:8220`
2. **Elasticsearch host**: `https://elasticsearch:9200`
3. **Deploy Fleet Server**:

```bash
curl -L -O https://artifacts.elastic.co/downloads/beats/elastic-agent/elastic-agent-9.0.0-linux-x86_64.tar.gz
tar xzvf elastic-agent-9.0.0-linux-x86_64.tar.gz
cd elastic-agent-9.0.0-linux-x86_64

sudo ./elastic-agent install \
  --fleet-server-es=https://elasticsearch:9200 \
  --fleet-server-service-token=<TOKEN> \
  --fleet-server-policy=<POLICY_ID>
```

</v-clicks>

---

# Fleet Installation: Step 2 - Agents

Once Fleet Server is active, install agents:

```bash
# Command generated from Kibana Fleet UI
curl -L -O https://artifacts.elastic.co/downloads/beats/elastic-agent/elastic-agent-9.0.0-linux-x86_64.tar.gz
tar xzvf elastic-agent-9.0.0-linux-x86_64.tar.gz
cd elastic-agent-9.0.0-linux-x86_64

sudo ./elastic-agent install \
  --url=https://fleet-server:8220 \
  --enrollment-token=<ENROLLMENT_TOKEN>
```

<v-clicks>

**The agent**:
1. Connects to Fleet Server
2. Downloads its policy
3. Automatically configures integrations
4. Starts data collection

</v-clicks>

---

# Complete Example: Monitoring Web Servers

**Scenario**: 10 Nginx servers to monitor

<v-clicks>

**Step 1**: Create a "Web Servers" policy
- System integration (server metrics)
- Nginx integration (logs + metrics)

**Step 2**: Install Elastic Agent on the 10 servers
```bash
# Script generated by Kibana, same command everywhere!
sudo ./elastic-agent install --url=... --enrollment-token=...
```

**Step 3**: Automatic!
- Agents download the policy
- Collect Nginx logs + system metrics
- Send everything to Elasticsearch

</v-clicks>

---

# Managing Policies in Kibana

Kibana → Fleet → Agent policies

<v-clicks>

**Create a policy**:
1. Name: "Production Web Servers"
2. Add integrations:
   - System (metrics)
   - Nginx (logs + metrics)
   - APM (tracing)
3. Configure each integration
4. Save

**Result**: All agents with this policy are updated **automatically**!

</v-clicks>

---

# Configuration Example: System Integration

```yaml
# In Fleet UI, System integration configuration
System Metrics:
  - CPU: enabled, period: 10s
  - Memory: enabled, period: 10s
  - Network: enabled, period: 10s
  - Filesystem: enabled, period: 30s
  - Process: enabled, period: 10s

System Logs:
  - Syslog: enabled
    paths: ["/var/log/syslog", "/var/log/messages"]
  - Auth: enabled
    paths: ["/var/log/auth.log", "/var/log/secure"]
```

<v-click>

> Everything configurable via UI, **no manual YAML**!

</v-click>

---

# Agent Monitoring

Kibana → Fleet → Agents

<v-clicks>

**Visible information**:
- ✅ **Status**: Healthy, Offline, Updating...
- 📊 **Last checkin**: Last communication
- 🔢 **Events rate**: Logs/metrics per second
- 📦 **Policy**: Which policy is applied
- 🔄 **Version**: Agent version
- ⚠️ **Errors**: Collection errors

</v-clicks>

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
