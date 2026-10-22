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
