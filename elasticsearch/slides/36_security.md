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

---

# Security

* First, we need to enable this option in the elasticsearch.yml file

```
xpack.security.enabled: true
```

---

# Security

* We can first define the passwords for technical users (`kibana_system`, `beats_system`, ...)

```
bin/elasticsearch-setup-passwords interactive
```

---

# Authorization

* We can define privileges for
    * Cluster management: `all`, `create_snapshot`, `monitor`, `manage`, ...
    * Access to an index: `all`, `create`, `create_doc`, `create_index`, `delete`, `manage`, ...

---

# Authorization

```
POST /_security/role/events_admin
{
  "run_as": [ "admin" ],
  "cluster": [ "monitor"],
  "indices" : [
    {
      "names" : [ "events*" ],
      "privileges" : [ "all" ]
    },
    {
      "names" : [ ".kibana*" ],
      "privileges" : [ "manage", "read", "index" ]
    }
  ]
}
```

---

# Authentication

* Authentication management can be done via different `realm`s
    * native
    * ldap / active_directory
    * file
    * ...

---

# Creating a User

```
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

```
PUT /_security/role_mapping/admin_user
{
  "roles" : [ "monitoring" ],
  "rules" : { "field" : { "dn" : "cn=Admin,ou=example,o=com" } }
}
```

---

# Document-level security

```
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

```
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
* We will define roles and privileges for it like for a user
* An expiration date can be associated with it

```
POST /_security/api_key
{
  "name": "my-api-key",
  "expiration": "1d",
  "role_descriptors": {
    "role-a": {
      "cluster": ["all"],
      "index": [
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

# Policy Name

* Where `policy_name` represents the event that will be recorded
    * `access_denied`
    * `access_granted`
    * `authentication_failed`
    * `delete_user`
    * `put_role`
    * ...

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
# Practical Part