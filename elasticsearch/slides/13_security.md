---
layout: cover
---

# Security

---

# Security

* Elasticsearch provides several means to secure our cluster
    * Authentication and Authorization
    * Data integrity (SSL/TLS)
    * Audit
* Authentication, role-based access and TLS are in the free Basic license; document/field-level security and audit logging need a Platinum or Enterprise license (or the 30-day trial).

---

# Security

* Since 8.0, security is **on by default**: on first start, Elasticsearch generates the TLS certificates, the `elastic` password and a Kibana enrollment token.
* `xpack.security.enabled: true` is written in `elasticsearch.yml` by this auto-configuration: there is nothing to enable.

---

# Security

* Reset the password of a built-in user (`elastic`, `kibana_system`, ...) with `elasticsearch-reset-password`
* `elasticsearch-setup-passwords` is deprecated since 8.0

```
bin/elasticsearch-reset-password -u kibana_system -i
```

---

# TLS

* Since 8.0, the first start generates a CA and the certificates, and writes in `elasticsearch.yml`:

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

* Other nodes join with an enrollment token: `bin/elasticsearch-create-enrollment-token -s node`

---

# TLS: Your Own Certificates

* `elasticsearch-certutil` generates a CA and the node certificates (or use your company's PKI)

```
bin/elasticsearch-certutil ca                         # elastic-stack-ca.p12
bin/elasticsearch-certutil cert --ca elastic-stack-ca.p12   # elastic-certificates.p12
bin/elasticsearch-certutil http                       # certificates for the HTTP layer
```

* Keystore passwords go into the secure settings, never in `elasticsearch.yml`:

```
bin/elasticsearch-keystore add xpack.security.transport.ssl.keystore.secure_password
```

---

# Authorization

* We can define privileges for
    * Cluster management: `all`, `create_snapshot`, `monitor`, `manage`, ...
    * Access to an index: `all`, `create`, `create_doc`, `create_index`, `delete`, `manage`, ...

---

# Authorization

```json
POST /_security/role/events_admin
{
  "cluster": [ "monitor" ],
  "indices" : [
    {
      "names" : [ "events*" ],
      "privileges" : [ "all" ]
    }
  ],
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": [ "feature_discover.read", "feature_dashboard.read" ],
      "resources": [ "space:default" ]
    }
  ]
}
```

* Never grant privileges on the system indices (`.kibana*`): access to Kibana goes through **Kibana privileges** (`applications`), easier to set in *Stack Management > Roles*.

---

# Authentication

* Authentication management can be done via different `realm`s
    * native
    * ldap / active_directory
    * file
    * ...

---

# Creating a User

```json
POST /_security/user/johndoe
{
  "password" : "userpassword",
  "full_name" : "John Doe",
  "email" : "john.doe@anony.mous",
  "roles" : [ "events_admin" ]
}
```

---

# Defining a Chain of Realms

* We can define a chain of Realms

```
xpack.security.authc.realms:
  file.file1:
      order: 0

  ldap.ldap2:
      order: 2
      url: 'url_to_ldap2'
      ...

  active_directory.ad1:
      order: 3
      url: 'url_to_ad'
```

---

# Role Mapping API

* Through the Role Mapping API, it's possible to associate a role with a group of users (`dn`, `dc`, `cn`...)

```json
PUT /_security/role_mapping/admin_user
{
  "roles" : [ "monitoring_user" ],
  "enabled": true,
  "rules" : { "field" : { "dn" : "cn=Admin,ou=example,o=com" } }
}
```

---

# Document-level security

```json
POST _security/role/click_role
{
  "indices": [
    {
      "names": [ "events-*" ],
      "privileges": [ "read" ],
      "query": {
        "match": {
          "category": "click"
        }
      }
    }
  ]
}
```

---

# Field level security

```json
POST /_security/role/ro-person-company
{
  "indices": [
    {
      "names": [ "person*" ],
      "privileges": [ "read" ],
      "field_security" : {
        "grant" : [ "id", "isActive", "company" ]
      }
    }
  ]
}
```

---

# Generating an API Key

* It's also possible to define an API Key
* We will define roles and privileges for it like for a user: give it only what it needs
* An expiration date can be associated with it

```json
POST /_security/api_key
{
  "name": "my-api-key",
  "expiration": "1d",
  "role_descriptors": {
    "role-a": {
      "cluster": [],
      "indices": [
        {
          "names": ["index-a*"],
          "privileges": ["read"]
        }
      ]
    }
  }
}
```

---

# Audit

* We can configure Elasticsearch to record security-related events
* The logs will be available in a `<clustername>_audit.json` file

```
xpack.security.audit.enabled: true
```

---

# Audit Configuration

```
xpack.security.audit.logfile.events.include:
xpack.security.audit.logfile.events.exclude:
xpack.security.audit.logfile.events.emit_request_body:
xpack.security.audit.logfile.emit_node_name:
xpack.security.audit.logfile.events.ignore_filters.<policy_name>.users:
```

---

# Event Types and Ignore Filters

* `events.include` / `events.exclude` take the **event types** to record:
    * `access_denied`, `access_granted`
    * `authentication_failed`, `authentication_success`
    * `security_config_change` (users, roles, API keys...)
    * ...
* `ignore_filters.<policy_name>`: `policy_name` is a free name; each policy drops the events matching all its criteria (`users`, `realms`, `roles`, `indices`, `actions`)

```
xpack.security.audit.logfile.events.include: [ "access_denied", "authentication_failed", "security_config_change" ]
xpack.security.audit.logfile.events.ignore_filters.monitoring.users: [ "metricbeat_internal" ]
```

---
layout: cover
---

# Demo in Kibana

---
layout: cover
---

# Spaces in Kibana


---
layout: cover
---

# Hands-on

## Workshop 7 - Security: users, roles and Document-Level Security
