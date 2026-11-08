---
layout: cover
---

# 17 - Security

---

# Learning objectives

By the end of this sequence (**~45 min**, workshop included), you will be able to:

- **Explain** what Elasticsearch secures: authentication, authorization, TLS, audit
- **Create** roles and users, and **check** what a user may do
- **Restrict** the documents and the fields a role sees (DLS / FLS)
- **Issue** scoped API keys for the applications
- **Enable** the audit log, and **filter** its events

---

# What Elasticsearch secures

| Layer | What it does |
|---|---|
| **Authentication** | Who are you? Realms: native, file, LDAP, AD, SAML, OIDC, PKI, API keys |
| **Authorization** | What may you do? Roles: cluster, index, application privileges |
| **Encryption** | TLS between the nodes (transport) and towards the clients (HTTP) |
| **Audit** | Who did what, when: a JSON log of the security events |

<br />

- **Basic** (free) license: authentication, roles, TLS, API keys
- **Platinum / Enterprise** (or the 30-day trial): document/field-level security, audit, SAML/OIDC…

---

# Security is on by default

Since 8.0, the **first start** of a node:

- generates a **CA** and the TLS certificates (HTTP and transport)
- generates the password of the `elastic` superuser
- prints a **Kibana enrollment token**
- writes `xpack.security.enabled: true` in `elasticsearch.yml`

<br />

Reset the password of a built-in user (`elastic`, `kibana_system`…):

```bash
bin/elasticsearch-reset-password -u kibana_system -i
```

> `elasticsearch-setup-passwords` is deprecated since 8.0: use `elasticsearch-reset-password`.

---

# Who am I?

```json
GET /_security/_authenticate
```

**Expected result**:

```json
{
  "username": "elastic",
  "roles": ["superuser"],
  "authentication_realm": { "name": "reserved", "type": "reserved" }
}
```

- The first request to send when "access denied" makes no sense
- `elastic` is a **superuser**: use it to bootstrap, never in an application

---

# TLS: the generated configuration

```yaml
xpack.security.http.ssl:          # HTTPS for the clients (REST API, Kibana)
  enabled: true
  keystore.path: certs/http.p12
xpack.security.transport.ssl:     # mutual TLS between the nodes
  enabled: true
  verification_mode: certificate
  keystore.path: certs/transport.p12
  truststore.path: certs/transport.p12
```

- A new node joins with an **enrollment token**: `bin/elasticsearch-create-enrollment-token -s node`
- Transport TLS is **mandatory** as soon as the cluster has more than one node

---

# TLS: your own certificates

`elasticsearch-certutil` builds a CA and the certificates — or use your company's PKI:

```bash
bin/elasticsearch-certutil ca                               # elastic-stack-ca.p12
bin/elasticsearch-certutil cert --ca elastic-stack-ca.p12   # elastic-certificates.p12
bin/elasticsearch-certutil http                             # certificates for the HTTP layer
```

Passwords go into the **keystore**, never in `elasticsearch.yml`:

```bash
bin/elasticsearch-keystore add xpack.security.transport.ssl.keystore.secure_password
```

---

# Authentication: the realms

A **chain** of realms, tried in `order` until one recognises the user:

```yaml
xpack.security.authc.realms:
  native.native1:
    order: 0
  ldap.ldap1:
    order: 1
    url: "ldaps://ldap.example.com:636"
    bind_dn: "cn=admin,dc=example,dc=com"
  file.file1:
    order: 2
```

- `native`: users stored in Elasticsearch (`_security/user`)
- `file`: users on disk — the emergency access when the cluster is red
- `ldap`, `active_directory`, `saml`, `oidc`, `pki`: the company directory

---

# Privileges

| Cluster privileges | Index privileges |
|---|---|
| `all` — everything | `all` — everything |
| `monitor` — read the metrics | `read` — search, get |
| `manage` — settings, nodes | `write` — index, update, delete |
| `create_snapshot` | `create_doc` — append only |
| `manage_ilm`, `manage_pipeline` | `create_index`, `manage` — settings, mappings |
| `manage_security` | `view_index_metadata`, `monitor` |

<br />

- Grant the **smallest** set: `create_doc` for a log shipper, `read` for a dashboard
- Kibana features go through **application privileges** (`kibana-.kibana`)

---

# Create a role

```json
POST /_security/role/events_admin
{
  "cluster": ["monitor"],
  "indices": [
    { "names": ["events*"], "privileges": ["all"] }
  ],
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": ["feature_discover.read", "feature_dashboard.read"],
      "resources": ["space:default"]
    }
  ]
}
```

> Never grant privileges on the system indices (`.kibana*`): Kibana access goes through the `applications` part, easier to set in *Stack Management > Roles*.

---

# Create a user

```json
POST /_security/user/johndoe
{
  "password": "a-long-passphrase",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "roles": ["events_admin"]
}
```

```json
GET /_security/user/johndoe
```

- A user holds **several** roles: their privileges add up
- Built-in roles: `viewer`, `editor`, `kibana_admin`, `monitoring_user`…

---

# Check what a user may do

Run as the user, `_has_privileges` answers without trying the action:

```json
GET /_security/user/_has_privileges
{
  "cluster": ["monitor", "manage"],
  "index": [
    { "names": ["events-2026"], "privileges": ["read", "delete_index"] }
  ]
}
```

- `has_all_requested: false` and the detail per privilege
- Test a role **before** handing it out — or use `es-security-runas-user` to impersonate

---

# Map directory groups to roles

With LDAP / AD / SAML, roles come from **role mappings**, not from users:

```json
PUT /_security/role_mapping/admins
{
  "roles": ["monitoring_user"],
  "enabled": true,
  "rules": { "field": { "dn": "cn=Admin,ou=example,o=com" } }
}
```

- Rules on `username`, `dn`, `groups`, `realm.name`, combined with `all` / `any`
- A new employee in the right group gets the right access — nothing to do in Elasticsearch

---

# Document-level security

A role can see **only** the documents matching a query:

```json
POST /_security/role/click_role
{
  "indices": [
    {
      "names": ["events-*"],
      "privileges": ["read"],
      "query": { "match": { "category": "click" } }
    }
  ]
}
```

- The filter applies to **every** search, count, aggregation of the user
- Typical use: one index, several teams or tenants — `{"term": {"team": "team-a"}}`

---

# Field-level security

A role can see **only** some fields:

```json
POST /_security/role/person_anonymized
{
  "indices": [
    {
      "names": ["person*"],
      "privileges": ["read"],
      "field_security": {
        "grant": ["*"],
        "except": ["email", "ip", "user_id"]
      }
    }
  ]
}
```

- `grant` lists what is visible, `except` removes from it
- Hidden fields are not searchable either: no leak through a query

---

# API keys

For an application, an **API key** rather than a user and password:

```json
POST /_security/api_key
{
  "name": "orders-app",
  "expiration": "30d",
  "role_descriptors": {
    "orders_writer": {
      "indices": [
        { "names": ["orders-*"], "privileges": ["create_doc", "create_index"] }
      ]
    }
  }
}
```

- The response holds `id`, `api_key` and `encoded`: send `Authorization: ApiKey <encoded>`
- Its privileges are the **intersection** of `role_descriptors` and those of its creator

---

# Manage the API keys

```json
GET /_security/api_key?name=orders-app
```

```json
DELETE /_security/api_key
{ "name": "orders-app" }
```

- One key **per application**: revoke one without breaking the others
- Always an `expiration`: a leaked key without one is valid forever
- Rotate: create the new key, deploy it, then invalidate the old one

---

# Audit log

```yaml
xpack.security.audit.enabled: true
xpack.security.audit.logfile.events.include:
  - access_denied
  - authentication_failed
  - security_config_change
xpack.security.audit.logfile.events.ignore_filters.monitoring.users:
  - metricbeat_internal
```

- Written to `logs/<cluster>_audit.json`, one JSON event per line
- Event types: `access_granted`, `access_denied`, `authentication_success`, `authentication_failed`, `security_config_change`…
- `ignore_filters.<name>`: drops the events matching **all** its criteria (`users`, `realms`, `roles`, `indices`, `actions`)

---

# An audit event

```json
{
  "type": "audit",
  "event.action": "access_denied",
  "user.name": "johndoe",
  "user.roles": ["events_admin"],
  "request.name": "SearchRequest",
  "indices": ["orders-2026"]
}
```

- Ship it to a **separate** cluster: an attacker on the cluster must not erase the tracks
- `access_granted` is very verbose: keep it off unless compliance requires it
- `emit_request_body: true` records the queries — and the data they contain

---

# Kibana spaces

- A **space** groups dashboards, visualizations, data views
- Roles grant access per space and per feature (`feature_discover.read`…)
- One space per team: each one sees its own objects

<br />

> Spaces separate **Kibana objects**, not data: the data access is still decided by the index privileges, DLS and FLS.

---

# Quiz

**An API key is created by a user holding only `read` on `orders-*`. Its `role_descriptors` grant `all` on `orders-*`. What can the key do?**

- A) Everything on `orders-*`
- B) Only read `orders-*`
- C) Nothing: the creation fails

<v-click>

**Answer: B** — an API key gets the intersection of its `role_descriptors` and its creator's privileges: never more than its creator.

</v-click>

---
layout: cover
---

# Workshop 13

## Security: users, roles and Document-Level Security
