---
layout: cover
---

# Sécurité

---

# Sécurité

* Elasticsearch met à disposition plusieurs moyens de sécuriser notre cluster
    * Authentification et Autorisation
    * Intégrité de la données (SSL/TLS)
    * Audit

---

# Sécurité

* Il faudra tout d'abord activer cette option dans le fichier elasticsearch.yml

```
xpack.security.enabled: true
```

---

# Sécurité

* Nous pouvons tout d'abord définir les mots de passes des utilisateurs techniques (`kibana_system`, `beats_system`, ...)

```
bin/elasticsearch-setup-passwords interactive
```

---

# Autorisation

* Nous pouvons définir des privilèges pour
    * la gestion du cluster : `all`, `create_snapshot`, `monitor`, `manage`, ...
    * Pour l'accès à un index : `all`, `create`, `create_doc`, `create_index`, `delete`, `manage`, ...

---

# Autorisation

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

# Authentification

* La gestion de l'authentification peut être réalisée via différents `realm`
    * native
    * ldap / active_directory
    * file
    * ...

---

# Création d'un utilisateur

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

# Définition d'une chaine de Realms

* Nous pouvons définir une chaine de Realms

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

* Grâce à la Role Mapping API, il est possible d'associer un role à un groupe d'utilisateurs (`dn`, `dc`, `cn`...)

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

# field level security

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

# Génération d'une API Key

* Il est également possible de définir une API Key
* On lui définira des roles et privilèges comme pour un utilisateur
* Une date d'expiration pourra lui être associée

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

* Nous pouvons configurer Elasticsearch pour enregister des événements liés à la sécurité
* Les logs seront disponibles dans un fichier `<clustername>_audit.json`

```
xpack.security.audit.enabled: true
```

---

# Configuration des audits

```
xpack.security.audit.logfile.events.include:
xpack.security.audit.logfile.events.exclude:
xpack.security.audit.logfile.events.emit_request_body:
xpack.security.audit.logfile.emit_node_name:
xpack.security.audit.logfile.events.ignore_filters.<policy_name>.users:
```

---

# Policy Name

* ou `policy_name` représente l'événement qui sera enregistré
    * `access_denied`
    * `access_granted`
    * `authentication_failed`
    * `delete_user`
    * `put_role`
    * ...

---
layout: cover
---

# Démo dans Kibana

---
layout: cover
---

# Les Spaces dans Kibana

---
layout: cover
---
# Partie Pratique