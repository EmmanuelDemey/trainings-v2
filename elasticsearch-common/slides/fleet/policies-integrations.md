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
