---
layout: section
---

# Part 13: Security

---

# Enabling Security

```yaml
# elasticsearch.yml
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true
```

<v-clicks>

**Initial setup**:
```bash
# Generate passwords
bin/elasticsearch-setup-passwords auto

# Or interactive
bin/elasticsearch-setup-passwords interactive
```

</v-clicks>

---

# Authentication: Realms

Authentication chain:

```yaml
xpack.security.authc.realms:
  native:
    native1:
      order: 0
  ldap:
    ldap1:
      order: 1
      url: "ldap://ldap.parkki.com:389"
      bind_dn: "cn=admin,dc=parkki,dc=com"
  file:
    file1:
      order: 2
```

<v-click>

> Realms are evaluated in order

</v-click>

---

# Creating Users

```bash
# Via API
POST /_security/user/dev_user
{
  "password": "secure_password",
  "roles": ["kibana_user", "logs_reader"],
  "full_name": "Developer User",
  "email": "dev@parkki.com"
}

# Verification
GET /_security/user/dev_user
```

---

# Cluster Privileges

<v-clicks>

| Privilege | Description |
|-----------|-------------|
| `all` | Full cluster access |
| `monitor` | Read metrics |
| `manage` | Cluster management |
| `create_snapshot` | Snapshot creation |
| `manage_ilm` | ILM management |
| `manage_pipeline` | Ingest pipeline management |

</v-clicks>

---

# Index Privileges

<v-clicks>

| Privilege | Description |
|-----------|-------------|
| `all` | Full access |
| `read` | Read (search, get) |
| `write` | Write (index, update, delete) |
| `create` | Document creation |
| `delete` | Deletion |
| `manage` | Index management (settings, mappings) |
| `monitor` | Index metrics |

</v-clicks>

---

# Creating Roles

```json
POST /_security/role/logs_reader
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-parkki-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": ["read"],
      "resources": ["*"]
    }
  ]
}
```

---

# Document-Level Security

Filter documents by role:

```json
POST /_security/role/team_a_logs
{
  "indices": [
    {
      "names": ["logs-parkki-*"],
      "privileges": ["read"],
      "query": {
        "term": { "team": "team-a" }
      }
    }
  ]
}
```

<v-click>

> The user only sees documents with `team: team-a`

</v-click>

---

# Field-Level Security

Hide fields:

```json
POST /_security/role/logs_anonymized
{
  "indices": [
    {
      "names": ["logs-parkki-*"],
      "privileges": ["read"],
      "field_security": {
        "grant": ["@timestamp", "level", "message", "service"],
        "except": ["user_id", "ip", "email"]
      }
    }
  ]
}
```

<v-click>

> Sensitive fields are hidden

</v-click>

---

# API Keys

```bash
# Create an API key
POST /_security/api_key
{
  "name": "parkki-app-key",
  "expiration": "30d",
  "role_descriptors": {
    "logs_writer": {
      "indices": [
        {
          "names": ["logs-parkki-*"],
          "privileges": ["create_doc", "create_index"]
        }
      ]
    }
  }
}

# Response
{
  "id": "VuaCfGcBCdbkQm...",
  "api_key": "ui2lp2axTNmsyakw9tvNnw"
}
```

---

# Audit Logging

```yaml
# elasticsearch.yml
xpack.security.audit.enabled: true
xpack.security.audit.logfile.events.include:
  - access_denied
  - authentication_failed
  - connection_denied
  - run_as_denied
  - anonymous_access_denied
```

<v-click>

```json
// Audit log example
{
  "type": "audit",
  "event.action": "access_denied",
  "user.name": "unknown",
  "request.name": "SearchRequest",
  "indices": ["logs-parkki-prod"]
}
```

</v-click>
