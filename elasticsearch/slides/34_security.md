---
layout: cover
---

# Security Implementation

Authentication, authorization, and data protection

---

# Learning Objectives

By the end of this module, you will be able to:

- **Understand and configure** different authentication realms (native, LDAP, SAML)
- **Set up** basic authentication and manage users
- **Implement** Role-Based Access Control (RBAC)
- **Configure** document and field-level security
- **Use** Kibana administrative interfaces for security management

---

# Why Security is Critical

Elasticsearch security protects your data against unauthorized access and leaks.

**Risks without adequate security**:
1. **Unauthorized access**: Anyone can read, modify, or delete your data
2. **Data breach**: Exposure of sensitive data (PII, secrets, financial data)
3. **Regulatory non-compliance**: Violation of GDPR, HIPAA, PCI-DSS
4. **Targeted attacks**: Malicious data injection, DoS, exfiltration
5. **Impossible audit**: No traceability of access and modifications

**Elasticsearch security principles**:
- **Authentication**: Who are you? (Identity)
- **Authorization**: What can you do? (Permissions)
- **Encryption**: Protection of data in transit and at rest
- **Audit**: Traceability of access and actions

**Documentation**: [Secure the Elastic Stack](https://www.elastic.co/guide/en/elasticsearch/reference/current/secure-cluster.html)

---
layout: section
---

# Part 1: Introduction to Authentication Realms

Understanding different authentication systems

---

# What is a Realm?

A **realm** is an authentication system that validates user identities.

**Key concept**: Elasticsearch supports multiple realms simultaneously, forming an **authentication chain**.

**Authentication workflow**:
1. User sends credentials (username/password, token, certificate)
2. Elasticsearch traverses configured realms in order
3. The first realm that validates credentials authenticates the user
4. User roles are retrieved (from realm or mappings)
5. Authorization is verified according to roles

**Configuration**: Realms are defined in `elasticsearch.yml` or via the Settings API.

---

# Available Realm Types

Elasticsearch offers several realm types to integrate with your existing infrastructure:

**Main realms**:

| Realm Type | Description | Use Case |
|------------|-------------|----------|
| **native** | ES internal database | Small teams |
| **file** | Local files | Static configs |
| **ldap** | External LDAP | LDAP directory |
| **active_directory** | Microsoft AD | Windows environments |
| **saml** | SAML 2.0 SSO | IdP (Okta, Azure AD) |

---

# Available Realm Types (continued)

**Advanced realms**:

| Realm Type | Description | Use Case |
|------------|-------------|----------|
| **oidc** | OpenID Connect | Modern SSO (Google) |
| **kerberos** | Kerberos | High security |
| **pki** | X.509 Certificates | Mutual TLS |
| **jwt** | JSON Web Tokens | Microservices, API |

**Documentation**: [Realms](https://www.elastic.co/guide/en/elasticsearch/reference/current/realms.html)

---

# Native Realm: Internal Database

The **native realm** stores users in an internal Elasticsearch index (`.security`).

**Advantages**:
- Simple to configure (enabled by default)
- No external dependency
- Management via API or Kibana UI
- Supports password reset

**Disadvantages**:
- No synchronization with enterprise directory
- Manual user management

**Configuration** (already enabled by default):

```yaml
# elasticsearch.yml
xpack.security.authc.realms.native.native1:
  order: 0
```

**Order**: Determines priority in the authentication chain (lower = higher priority).

---

# File Realm: Local Files

The **file realm** reads users from local files on each node.

**Files used**:
- `users`: List of users and hashed passwords (bcrypt)
- `users_roles`: User to role mapping

**Advantages**:
- Simple for static configurations
- No network dependency
- Useful for emergency account

**Disadvantages**:
- Modifications require restart or reload
- Files must be manually synchronized across all nodes

**Configuration**:

```yaml
# elasticsearch.yml
xpack.security.authc.realms.file.file1:
  order: 1
```

**User management**:

```bash
# Create a user
bin/elasticsearch-users useradd john_doe -p MySecurePassword -r superuser

# List users
bin/elasticsearch-users list

# Delete a user
bin/elasticsearch-users userdel john_doe
```

---

# LDAP Realm: Enterprise Directory Integration

The **LDAP realm** authenticates users against an external LDAP server.

**Architecture**:
```
User -> Elasticsearch -> LDAP Server -> Validate credentials
                      <- Return user DN and groups
```

**Configuration**:

```yaml
# elasticsearch.yml
xpack.security.authc.realms.ldap.ldap1:
  order: 2
  url: "ldaps://ldap.example.com:636"
  bind_dn: "cn=admin,dc=example,dc=com"
  user_search:
    base_dn: "ou=users,dc=example,dc=com"
    filter: "(uid={0})"
  group_search:
    base_dn: "ou=groups,dc=example,dc=com"
  files:
    role_mapping: "/etc/elasticsearch/role_mapping.yml"
  unmapped_groups_as_roles: false
```

**Key parameters**:
- `bind_dn`: Service account to connect to LDAP
- `user_search.filter`: Filter to find user (`{0}` = entered username)
- `group_search`: Retrieve user's LDAP groups

---

# Active Directory Realm: Microsoft Specialization

The **Active Directory realm** is optimized for Microsoft AD.

**Differences from LDAP**:
- Uses LDAP protocol but with AD optimizations
- Native support for nested groups
- Automatic detection of domain controllers

**Configuration**:

```yaml
# elasticsearch.yml
xpack.security.authc.realms.active_directory.ad1:
  order: 2
  domain_name: "example.com"
  url: "ldaps://ad.example.com:636"
  user_search:
    base_dn: "CN=Users,DC=example,DC=com"
  group_search:
    base_dn: "CN=Groups,DC=example,DC=com"
  files:
    role_mapping: "/etc/elasticsearch/role_mapping.yml"
```

**Tip**: Use `domain_name` to let Elasticsearch automatically discover domain controllers via DNS.

---

# SAML Realm: Enterprise Single Sign-On

The **SAML realm** enables SSO authentication via an external Identity Provider (IdP).

**SAML Flow**:
1. User accesses Kibana
2. Kibana redirects to IdP (Okta, Azure AD, etc.)
3. User authenticates on IdP
4. IdP returns a signed SAML assertion
5. Elasticsearch validates assertion and authenticates user

**Configuration**:

```yaml
# elasticsearch.yml
xpack.security.authc.realms.saml.saml1:
  order: 3
  idp.metadata.path: "/etc/elasticsearch/saml/idp-metadata.xml"
  idp.entity_id: "https://idp.example.com"
  sp.entity_id: "https://kibana.example.com"
  sp.acs: "https://kibana.example.com/api/security/saml/callback"
  sp.logout: "https://kibana.example.com/logout"
  attributes.principal: "nameid:persistent"
  attributes.groups: "groups"
```

**Documentation**: [SAML authentication](https://www.elastic.co/guide/en/elasticsearch/reference/current/saml-realm.html)

---

# Authentication Chain: Combining Multiple Realms

You can configure **multiple realms** that will be tested in order.

**Example multi-realm configuration**:

```yaml
# elasticsearch.yml
xpack.security.authc.realms:

  # Realm 1: Native (order 0 = max priority)
  native.native1:
    order: 0

  # Realm 2: LDAP (order 1)
  ldap.ldap1:
    order: 1
    url: "ldaps://ldap.example.com:636"
    # ... other configs

  # Realm 3: SAML (order 2)
  saml.saml1:
    order: 2
    # ... SAML configs
```

**Workflow**:
1. Credentials received -> Test `native1`
2. If failure -> Test `ldap1`
3. If failure -> Test `saml1`
4. If all fail -> Authentication refused (401 Unauthorized)

**Best Practice**: Always keep a `native` or `file` realm with priority order for emergency admin account.

---
layout: section
---

# Part 2: Basic Authentication Configuration

Enabling security and creating users

---

# Enabling Elasticsearch Security

**Since Elasticsearch 8.0**, security is **enabled by default**.

**Verify security status**:

```bash
GET /_xpack
```

**Result**:
```json
{
  "features": {
    "security": {
      "available": true,
      "enabled": true
    }
  }
}
```

**For Elasticsearch 7.x (if security disabled)**, enable manually:

```yaml
# elasticsearch.yml
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true
```

Then restart Elasticsearch.

---

# Initializing Built-in User Passwords

Elasticsearch automatically creates **built-in users**:

| User | Role | Usage |
|------|------|-------|
| `elastic` | `superuser` | Main administrator (full access) |
| `kibana_system` | `kibana_system` | Kibana -> Elasticsearch connection |
| `logstash_system` | `logstash_system` | Logstash -> Elasticsearch connection |
| `beats_system` | `beats_system` | Beats -> Elasticsearch connection |
| `apm_system` | `apm_system` | APM Server -> Elasticsearch connection |
| `remote_monitoring_user` | `remote_monitoring_agent` | Cross-cluster monitoring |

**Set passwords**:

```bash
# Automatic method: generate random passwords
bin/elasticsearch-setup-passwords auto

# Interactive method: set manually
bin/elasticsearch-setup-passwords interactive
```

**Example output (auto)**:
```
Changed password for user apm_system
PASSWORD apm_system = xP8mK3nQ7vR2wL5s

Changed password for user kibana_system
PASSWORD kibana_system = bN6jH9mP4tY8qW3x

Changed password for user elastic
PASSWORD elastic = aZ9kL2mN5vB7cX4r
```

**Store these passwords securely!**

---

# Creating Users via API

**Create a user with role**:

```bash
POST /_security/user/john_doe
{
  "password": "StrongPassword123!",
  "roles": ["kibana_admin", "monitoring_user"],
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "metadata": {
    "department": "IT",
    "location": "Paris"
  }
}
```

**Result**:
```json
{
  "created": true
}
```

**List all users**:

```bash
GET /_security/user
```

**Get a specific user**:

```bash
GET /_security/user/john_doe
```

---

# Modifying and Deleting Users

**Change a user's password**:

```bash
POST /_security/user/john_doe/_password
{
  "password": "NewSecurePassword456!"
}
```

**Modify a user's roles**:

```bash
PUT /_security/user/john_doe
{
  "roles": ["kibana_admin", "monitoring_user", "reporting_user"],
  "full_name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Disable a user** (without deleting):

```bash
PUT /_security/user/john_doe/_disable
```

**Re-enable a user**:

```bash
PUT /_security/user/john_doe/_enable
```

**Delete a user**:

```bash
DELETE /_security/user/john_doe
```

---

# Testing Authentication

**Method 1: Curl with credentials**:

```bash
curl -u elastic:password "https://localhost:9200/_cluster/health?pretty"
```

**Method 2: Authenticate API**:

```bash
GET /_security/_authenticate
```

**Result**:
```json
{
  "username": "elastic",
  "roles": ["superuser"],
  "full_name": null,
  "email": null,
  "metadata": {
    "_reserved": true
  },
  "enabled": true,
  "authentication_realm": {
    "name": "reserved",
    "type": "reserved"
  },
  "lookup_realm": {
    "name": "reserved",
    "type": "reserved"
  },
  "authentication_type": "realm"
}
```

**Method 3: Test with wrong credentials**:

```bash
curl -u elastic:wrong_password "https://localhost:9200/"
```

**Expected result**: `401 Unauthorized`

---
layout: section
---

# Part 3: RBAC Configuration (Role-Based Access Control)

Role-based access control

---

# Understanding the Elasticsearch RBAC Model

**RBAC** = Define **who** can do **what** and **where**.

**RBAC Components**:
- **User**: Authenticated identity
- **Role**: Set of permissions
- **Privileges**: Authorized actions
- **Resources**: Cluster, indices, applications

**Workflow**:
1. User authenticates -> Identity validated
2. Identity -> Assigned roles
3. Roles -> Granted privileges
4. Request -> Privilege verification
5. Access authorized or denied

**Formula**:
```
User + Roles -> Privileges -> Actions on Resources
```

---

# Privilege Types

Elasticsearch defines privileges at **two levels**:

**1. Cluster Privileges** (cluster-level actions):

| Privilege | Description |
|-----------|-------------|
| `all` | All cluster privileges |
| `monitor` | Read metrics and stats (health, stats, etc.) |
| `manage` | Cluster management (settings, reroute, etc.) |
| `manage_index_templates` | Create/modify index templates |
| `manage_ilm` | Manage ILM policies |
| `manage_security` | Manage users, roles, API keys |
| `create_snapshot` | Create snapshots |
| `monitor_snapshot` | View snapshots |

**2. Index Privileges** (index-level actions):

| Privilege | Description |
|-----------|-------------|
| `all` | All privileges on indices |
| `read` | Search, get documents |
| `write` | Index, update, delete documents |
| `create` | Create indices |
| `delete` | Delete indices |
| `create_index` | Create only (not delete) |
| `view_index_metadata` | View mappings and settings |
| `manage` | All management operations (settings, mappings, etc.) |

---

# Creating a Custom Role

**Example 1: "Read Only" role on log indices**:

```bash
POST /_security/role/logs_reader
{
  "cluster": ["monitor"],
  "indices": [{
    "names": ["logs-*", "filebeat-*"],
    "privileges": ["read", "view_index_metadata"]
  }]
}
```

**Explanation**:
- `cluster: ["monitor"]`: Cluster stats
- `indices.names`: Index pattern
- `indices.privileges`: Read only

---

# Creating a Custom Role (advanced example)

**Example 2: "Developer" role**:

```bash
POST /_security/role/developer
{
  "cluster": ["monitor", "manage_index_templates"],
  "indices": [{
    "names": ["dev-*", "test-*"],
    "privileges": ["all"]
  }],
  "applications": [{
    "application": "kibana-.kibana",
    "privileges": ["feature_discover.all"],
    "resources": ["space:dev"]
  }]
}
```

---

# Granular Privileges: Specific Actions

You can specify **individual actions** for fine-grained control:

```bash
POST /_security/role/index_manager
{
  "cluster": [],
  "indices": [
    {
      "names": ["products"],
      "privileges": ["read", "write"],
      "field_security": {
        "grant": ["name", "price", "category"],
        "except": ["internal_cost"]
      },
      "query": {
        "term": {
          "category": "electronics"
        }
      }
    }
  ]
}
```

**Advanced features**:
- `field_security.grant`: Accessible fields
- `field_security.except`: Excluded (hidden) fields
- `query`: Document filter (Document Level Security)

---

# Assigning Roles to Users

**Method 1: During user creation**:

```bash
POST /_security/user/alice
{
  "password": "SecurePass123!",
  "roles": ["logs_reader", "kibana_user"]
}
```

**Method 2: Modify an existing user**:

```bash
PUT /_security/user/alice
{
  "roles": ["logs_reader", "kibana_user", "developer"]
}
```

**Verify a user's roles**:

```bash
GET /_security/user/alice
```

**Result**:
```json
{
  "alice": {
    "username": "alice",
    "roles": ["logs_reader", "kibana_user", "developer"],
    "full_name": null,
    "email": null,
    "enabled": true
  }
}
```

---

# Role Mapping: LDAP/SAML -> Elasticsearch Roles

For external realms (LDAP, SAML), use **role mapping** to convert external groups to Elasticsearch roles.

**role_mapping.yml file**:

```yaml
# config/role-mapping.yml
kibana_admin:
  - "cn=kibana-admins,ou=groups,dc=example,dc=com"
  - "cn=IT-Team,ou=groups,dc=example,dc=com"

developer:
  - "cn=developers,ou=groups,dc=example,dc=com"

readonly:
  - "cn=readonly-users,ou=groups,dc=example,dc=com"
```

**Via API**:

```bash
POST /_security/role_mapping/ldap_admins
{
  "roles": ["kibana_admin", "superuser"],
  "enabled": true,
  "rules": {
    "field": {
      "groups": "cn=admins,ou=groups,dc=example,dc=com"
    }
  }
}
```

**Advanced rules** (with conditions):

```bash
POST /_security/role_mapping/conditional_access
{
  "roles": ["developer"],
  "enabled": true,
  "rules": {
    "all": [
      {
        "field": {
          "groups": "cn=developers,ou=groups,dc=example,dc=com"
        }
      },
      {
        "field": {
          "metadata.department": "engineering"
        }
      }
    ]
  }
}
```

---

# Predefined Elasticsearch Roles

Elasticsearch provides **predefined roles** for common use cases:

| Role | Description |
|------|-------------|
| `superuser` | All privileges (equivalent to root) |
| `kibana_admin` | Full Kibana management |
| `kibana_user` | Kibana usage (discover, visualizations) |
| `monitoring_user` | Read access to monitoring metrics |
| `ingest_admin` | Ingest pipeline management |
| `logstash_admin` | Logstash pipeline management |
| `beats_admin` | Beats configuration |
| `watcher_admin` | Watcher alert management |
| `snapshot_user` | Create and restore snapshots |

**View all predefined roles**:

```bash
GET /_security/role
```

---
layout: section
---

# Part 4: Filtering Levels and Administrative Interfaces

Document-Level Security, Field-Level Security, and Kibana management

---

# Document-Level Security (DLS)

**DLS** filters visible documents based on roles, using an **Elasticsearch query**.

**Use Case**: Limit access to documents by department, region, or confidentiality level.

**Example: Access only to department orders**:

```bash
POST /_security/role/sales_team
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders"],
      "privileges": ["read"],
      "query": {
        "term": {
          "department": "sales"
        }
      }
    }
  ]
}
```

**Result**:
- Users with this role see **only** documents where `department = "sales"`
- Other documents are invisible (as if they don't exist)

**Complex query with bool**:

```bash
"query": {
  "bool": {
    "must": [
      { "term": { "status": "active" } }
    ],
    "should": [
      { "term": { "department": "sales" } },
      { "term": { "department": "marketing" } }
    ],
    "minimum_should_match": 1
  }
}
```

---

# Field-Level Security (FLS)

**FLS** hides certain fields based on roles, to protect sensitive data.

**Use Case**: Mask SSN, salaries, personal emails, medical data.

**Example: Hide sensitive information**:

```bash
POST /_security/role/hr_analyst
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees"],
      "privileges": ["read"],
      "field_security": {
        "grant": ["name", "department", "hire_date"],
        "except": ["ssn", "salary", "personal_email"]
      }
    }
  ]
}
```

**Result**:
- Users see: `name`, `department`, `hire_date`
- Users **don't see**: `ssn`, `salary`, `personal_email`

**Grant with wildcards**:

```bash
"field_security": {
  "grant": ["public_*", "metadata.*", "name", "email"],
  "except": ["*.internal", "*.private"]
}
```

---

# Combining DLS and FLS

You can combine **DLS** (document filtering) and **FLS** (field filtering):

```bash
POST /_security/role/regional_manager
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees"],
      "privileges": ["read"],
      "query": {
        "term": {
          "region": "EMEA"
        }
      },
      "field_security": {
        "grant": ["name", "department", "position", "email"],
        "except": ["ssn", "salary", "performance_review"]
      }
    }
  ]
}
```

**Result**:
- Filtered documents: only `region = "EMEA"`
- Visible fields: `name`, `department`, `position`, `email`
- Hidden fields: `ssn`, `salary`, `performance_review`

---

# API Keys: Programmatic Authentication

**API keys** enable authentication without username/password (ideal for applications).

**Create an API key**:

```bash
POST /_security/api_key
{
  "name": "my-app-key",
  "role_descriptors": {
    "app_role": {
      "cluster": ["monitor"],
      "indices": [
        {
          "names": ["app-logs-*"],
          "privileges": ["read", "write"]
        }
      ]
    }
  },
  "expiration": "30d",
  "metadata": {
    "application": "my-app",
    "environment": "production"
  }
}
```

**Result**:
```json
{
  "id": "abc123xyz",
  "name": "my-app-key",
  "api_key": "bN6jH9mP4tY8qW3xaZ9kL2mN5vB7cX4r",
  "encoded": "YWJjMTIzeHl6OmJONmpIOW1QNHRZOHFXM3hhWjlrTDJtTjV2QjdjWDRy"
}
```

**Use the API key**:

```bash
curl -H "Authorization: ApiKey YWJjMTIzeHl6OmJONmpIOW1QNHRZOHFXM3hhWjlrTDJtTjV2QjdjWDRy" \
  "https://localhost:9200/app-logs-*/_search"
```

---

# Managing API Keys

**List all API keys**:

```bash
GET /_security/api_key
```

**Get a specific API key**:

```bash
GET /_security/api_key?id=abc123xyz
```

**Invalidate an API key**:

```bash
DELETE /_security/api_key
{
  "ids": ["abc123xyz"]
}
```

**Invalidate all API keys for a user**:

```bash
DELETE /_security/api_key
{
  "username": "john_doe"
}
```

**Invalidate expired API keys**:

```bash
DELETE /_security/api_key
{
  "owner": true
}
```

---

# Kibana Spaces: Multi-Tenant Isolation

**Kibana Spaces** create isolated environments within Kibana.

**Use Case**: Separate teams (Sales, Marketing, Engineering) with their own dashboards and index patterns.

**Create a Space via Kibana UI**:
1. Stack Management -> Kibana -> **Spaces**
2. Click **Create a space**
3. Configure:
   - **Name**: `sales-space`
   - **Identifier**: `sales` (used in URL)
   - **Color**: Choose a color
   - **Description**: "Sales team dashboards and visualizations"

**Result**: Space URL: `https://kibana.example.com/s/sales/app/dashboards`

**Configure Feature Privileges per Space**:

```bash
POST /_security/role/sales_kibana_user
{
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": ["feature_discover.all", "feature_dashboard.read"],
      "resources": ["space:sales"]
    }
  ]
}
```

---

# Kibana Administrative Interfaces for Security

**Stack Management -> Security** centralizes security management.

**Available sections**:

| Section | Features |
|---------|----------|
| **Users** | Create, modify, disable users |
| **Roles** | Define roles with cluster and index privileges |
| **Role Mappings** | Map LDAP/SAML groups to Elasticsearch roles |
| **API Keys** | Create and manage API keys |
| **Spaces** | Create isolated spaces for teams |

**Typical workflow**:
1. Create **Roles** with appropriate privileges
2. Create **Users** and assign roles
3. (Optional) Configure **Role Mappings** for LDAP/SAML
4. Create **Spaces** for multi-team isolation
5. Generate **API Keys** for applications

---

# Audit Logging: Access Traceability

**Audit logging** records all security actions.

**Enable audit**:

```yaml
# elasticsearch.yml
xpack.security.audit.enabled: true
xpack.security.audit.logfile.events.include:
  - access_denied
  - access_granted
  - authentication_success
  - authentication_failed
```

---

# Audit Logging: Events and Logs

**Audited events**:
- `authentication_success/failed`: Login attempts
- `access_granted/denied`: Resource access
- `run_as_granted/denied`: "Run as" privilege
- `tampered_request`: Modified request

**Audit logs**: `<cluster-name>_audit.json`

**Example**:
```json
{
  "type": "audit",
  "timestamp": "2024-01-15T10:15:30Z",
  "event.action": "access_denied",
  "user.name": "alice",
  "origin.address": "192.168.1.50",
  "url.path": "/_cat/indices"
}
```

---

# Summary: Security Implementation

| Component | Tool | Function |
|-----------|------|----------|
| **Authentication** | Realms (native, LDAP, SAML) | Validate identity |
| **Authorization** | RBAC (Roles, Privileges) | Control access |
| **Document Filtering** | Document-Level Security (DLS) | Limit document visibility |
| **Field Filtering** | Field-Level Security (FLS) | Mask sensitive fields |
| **API Keys** | API Keys | Programmatic authentication |
| **Isolation** | Kibana Spaces | Separate environments by team |
| **Traceability** | Audit Logging | Record all actions |

**Best Practices**:
1. Enable security from production deployment
2. Use strong passwords (min 12 characters)
3. Apply the **principle of least privilege**
4. Use DLS/FLS for sensitive data
5. Enable audit logging for compliance
6. Regularly audit and review roles and access
7. Use API keys with expiration for applications

---

# Key Takeaways

**Realms**:
- **Realms** define how users authenticate
- Authentication chain: multiple realms tested in order
- Native realm = internal database, LDAP/SAML = enterprise integration

**RBAC**:
- **Roles** = set of privileges (cluster + indices)
- **Privileges** = authorized actions (read, write, manage, etc.)
- Combine multiple roles for a user

**Advanced Filtering**:
- **DLS** = filter visible documents with a query
- **FLS** = hide sensitive fields (grant/except)
- Both can be combined

**Tools**:
- **API Keys** = passwordless authentication (apps, scripts)
- **Kibana Spaces** = multi-tenant isolation
- **Audit Logging** = traceability for compliance and security

---

# Practical Exercises

Go to the practical workbook to complete the following labs:

**Lab 7.1**: Create Users and Roles
Configure RBAC with different access levels

**Lab 7.2**: Implement Document-Level Security
Filter documents based on user role

**Bonus Challenge 7.A**: Field-Level Security
Mask sensitive fields for certain roles

---

# Resources and Documentation

**Official Elasticsearch Documentation**:
- [Secure the Elastic Stack](https://www.elastic.co/guide/en/elasticsearch/reference/current/secure-cluster.html)
- [Realms](https://www.elastic.co/guide/en/elasticsearch/reference/current/realms.html)
- [User authorization](https://www.elastic.co/guide/en/elasticsearch/reference/current/authorization.html)
- [Document and field level security](https://www.elastic.co/guide/en/elasticsearch/reference/current/field-and-document-access-control.html)

**Security Guides**:
- [Security settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-settings.html)
- [API Keys](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api-create-api-key.html)
- [Audit logging](https://www.elastic.co/guide/en/elasticsearch/reference/current/enable-audit-logging.html)

**Kibana Security**:
- [Kibana Spaces](https://www.elastic.co/guide/en/kibana/current/xpack-spaces.html)
- [Kibana privileges](https://www.elastic.co/guide/en/kibana/current/kibana-privileges.html)
