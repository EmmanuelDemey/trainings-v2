---
layout: cover
---

# Implémentation de la Sécurité

Authentification, autorisation, et protection des données

---

# Objectifs d'Apprentissage

À la fin de ce module, vous serez capable de :

- **Comprendre et configurer** les différents realms d'authentification (native, LDAP, SAML)
- **Mettre en place** l'authentification basique et gérer les utilisateurs
- **Implémenter** le contrôle d'accès basé sur les rôles (RBAC)
- **Configurer** la sécurité au niveau des documents et des champs
- **Utiliser** les interfaces administratives Kibana pour la gestion de la sécurité

---

# Pourquoi la Sécurité est Critique

La sécurité Elasticsearch protège vos données contre les accès non autorisés et les fuites.

**Risques sans sécurité adéquate** :
1. 🔓 **Accès non autorisé** : N'importe qui peut lire, modifier, ou supprimer vos données
2. 💸 **Violation de données** : Exposition de données sensibles (PII, secrets, données financières)
3. ⚖️ **Non-conformité réglementaire** : Violation de RGPD, HIPAA, PCI-DSS
4. 🎯 **Attaques ciblées** : Injection de données malveillantes, DoS, exfiltration
5. 🔍 **Audit impossible** : Pas de traçabilité des accès et modifications

**Principe de sécurité Elasticsearch** :
- 🔐 **Authentification** : Qui êtes-vous ? (Identité)
- 🔑 **Autorisation** : Que pouvez-vous faire ? (Permissions)
- 🛡️ **Chiffrement** : Protection des données en transit et au repos
- 📝 **Audit** : Traçabilité des accès et actions

**Documentation** : [Secure the Elastic Stack](https://www.elastic.co/guide/en/elasticsearch/reference/current/secure-cluster.html)

---
layout: section
---

# Partie 1: Introduction aux Realms d'Authentification

Comprendre les différents systèmes d'authentification

---

# Qu'est-ce qu'un Realm ?

Un **realm** est un système d'authentification qui valide les identités des utilisateurs.

**Concept clé** : Elasticsearch supporte plusieurs realms simultanément, formant une **chaîne d'authentification** (authentication chain).

**Workflow d'authentification** :
1. L'utilisateur envoie des credentials (username/password, token, certificat)
2. Elasticsearch parcourt les realms configurés dans l'ordre
3. Le premier realm qui valide les credentials authentifie l'utilisateur
4. Les rôles de l'utilisateur sont récupérés (du realm ou de mappings)
5. L'autorisation est vérifiée selon les rôles

**Configuration** : Les realms sont définis dans `elasticsearch.yml` ou via l'API Settings.

---

# Types de Realms Disponibles

Elasticsearch offre plusieurs types de realms pour s'intégrer dans votre infrastructure existante :

| Realm Type | Description | Use Case |
|------------|-------------|----------|
| **native** | Base de données interne Elasticsearch | Environnements autonomes, petites équipes |
| **file** | Fichiers locaux (users, users_roles) | Configurations statiques, simple setup |
| **ldap** | Active Directory / LDAP externe | Entreprises avec annuaire LDAP centralisé |
| **active_directory** | Microsoft Active Directory | Environnements Windows corporatifs |
| **saml** | SAML 2.0 SSO (Single Sign-On) | Intégration avec IdP (Okta, Azure AD) |
| **oidc** | OpenID Connect | SSO moderne (Google, GitHub) |
| **kerberos** | Kerberos authentication | Environnements hautement sécurisés |
| **pki** | Certificats X.509 | Authentification mutuelle TLS |
| **jwt** | JSON Web Tokens | Architectures microservices, API |

**Documentation** : [Realms](https://www.elastic.co/guide/en/elasticsearch/reference/current/realms.html)

---

# Realm Native : Base de Données Interne

Le **native realm** stocke les utilisateurs dans un index Elasticsearch interne (`.security`).

**Avantages** :
- ✅ Simple à configurer (activé par défaut)
- ✅ Pas de dépendance externe
- ✅ Gestion via API ou Kibana UI
- ✅ Supporte la réinitialisation de mot de passe

**Inconvénients** :
- ❌ Pas de synchronisation avec annuaire d'entreprise
- ❌ Gestion manuelle des utilisateurs

**Configuration** (déjà activé par défaut) :

```yaml
# elasticsearch.yml
xpack.security.authc.realms.native.native1:
  order: 0
```

**Ordre** : Détermine la priorité dans la chaîne d'authentification (plus petit = plus prioritaire).

---

# Realm File : Fichiers Locaux

Le **file realm** lit les utilisateurs depuis des fichiers locaux sur chaque nœud.

**Fichiers utilisés** :
- `users` : Liste des utilisateurs et mots de passe hachés (bcrypt)
- `users_roles` : Mapping utilisateurs → rôles

**Avantages** :
- ✅ Simple pour configurations statiques
- ✅ Pas de dépendance réseau
- ✅ Utile pour compte d'urgence

**Inconvénients** :
- ❌ Modifications nécessitent redémarrage ou reload
- ❌ Fichiers doivent être synchronisés manuellement sur tous les nœuds

**Configuration** :

```yaml
# elasticsearch.yml
xpack.security.authc.realms.file.file1:
  order: 1
```

**Gestion des utilisateurs** :

```bash
# Créer un utilisateur
bin/elasticsearch-users useradd john_doe -p MySecurePassword -r superuser

# Lister les utilisateurs
bin/elasticsearch-users list

# Supprimer un utilisateur
bin/elasticsearch-users userdel john_doe
```

---

# Realm LDAP : Intégration avec Annuaire d'Entreprise

Le **LDAP realm** authentifie les utilisateurs contre un serveur LDAP externe.

**Architecture** :
```
User → Elasticsearch → LDAP Server → Validate credentials
                     ← Return user DN and groups
```

**Configuration** :

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

**Paramètres clés** :
- `bind_dn` : Compte de service pour se connecter au LDAP
- `user_search.filter` : Filtre pour trouver l'utilisateur (`{0}` = username saisi)
- `group_search` : Récupérer les groupes LDAP de l'utilisateur

---

# Realm Active Directory : Spécialisation Microsoft

Le **Active Directory realm** est optimisé pour Microsoft AD.

**Différences avec LDAP** :
- Utilise le protocole LDAP mais avec optimisations AD
- Support natif des groupes imbriqués (nested groups)
- Détection automatique des contrôleurs de domaine

**Configuration** :

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

**Astuce** : Utilisez `domain_name` pour laisser Elasticsearch découvrir automatiquement les contrôleurs de domaine via DNS.

---

# Realm SAML : Single Sign-On Entreprise

Le **SAML realm** permet l'authentification SSO via un Identity Provider (IdP) externe.

**Flux SAML** :
1. Utilisateur accède à Kibana
2. Kibana redirige vers l'IdP (Okta, Azure AD, etc.)
3. Utilisateur s'authentifie sur l'IdP
4. IdP renvoie une assertion SAML signée
5. Elasticsearch valide l'assertion et authentifie l'utilisateur

**Configuration** :

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

**Documentation** : [SAML authentication](https://www.elastic.co/guide/en/elasticsearch/reference/current/saml-realm.html)

---

# Chaîne d'Authentification : Combiner Plusieurs Realms

Vous pouvez configurer **plusieurs realms** qui seront testés dans l'ordre.

**Exemple de configuration multi-realms** :

```yaml
# elasticsearch.yml
xpack.security.authc.realms:
  
  # Realm 1 : Native (ordre 0 = priorité max)
  native.native1:
    order: 0
  
  # Realm 2 : LDAP (ordre 1)
  ldap.ldap1:
    order: 1
    url: "ldaps://ldap.example.com:636"
    # ... autres configs
  
  # Realm 3 : SAML (ordre 2)
  saml.saml1:
    order: 2
    # ... configs SAML
```

**Workflow** :
1. Credentials reçus → Tester `native1`
2. Si échec → Tester `ldap1`
3. Si échec → Tester `saml1`
4. Si tous échouent → Authentification refusée (401 Unauthorized)

**Best Practice** : Toujours garder un realm `native` ou `file` avec ordre prioritaire pour compte d'urgence admin.

---
layout: section
---

# Partie 2: Configuration de l'Authentification Basique

Activer la sécurité et créer des utilisateurs

---

# Activer la Sécurité Elasticsearch

**Depuis Elasticsearch 8.0**, la sécurité est **activée par défaut**.

**Vérifier l'état de la sécurité** :

```bash
GET /_xpack
```

**Résultat** :
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

**Pour Elasticsearch 7.x (si sécurité désactivée)**, activer manuellement :

```yaml
# elasticsearch.yml
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true
```

Puis redémarrer Elasticsearch.

---

# Initialiser les Mots de Passe des Utilisateurs Intégrés

Elasticsearch crée automatiquement des **utilisateurs intégrés** (built-in users) :

| Utilisateur | Rôle | Usage |
|-------------|------|-------|
| `elastic` | `superuser` | Administrateur principal (tout accès) |
| `kibana_system` | `kibana_system` | Connexion Kibana → Elasticsearch |
| `logstash_system` | `logstash_system` | Connexion Logstash → Elasticsearch |
| `beats_system` | `beats_system` | Connexion Beats → Elasticsearch |
| `apm_system` | `apm_system` | Connexion APM Server → Elasticsearch |
| `remote_monitoring_user` | `remote_monitoring_agent` | Monitoring cross-cluster |

**Définir les mots de passe** :

```bash
# Méthode automatique : générer des mots de passe aléatoires
bin/elasticsearch-setup-passwords auto

# Méthode interactive : définir manuellement
bin/elasticsearch-setup-passwords interactive
```

**Exemple de sortie (auto)** :
```
Changed password for user apm_system
PASSWORD apm_system = xP8mK3nQ7vR2wL5s

Changed password for user kibana_system
PASSWORD kibana_system = bN6jH9mP4tY8qW3x

Changed password for user elastic
PASSWORD elastic = aZ9kL2mN5vB7cX4r
```

⚠️ **Conservez ces mots de passe de manière sécurisée !**

---

# Créer des Utilisateurs via l'API

**Créer un utilisateur avec rôle** :

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

**Résultat** :
```json
{
  "created": true
}
```

**Lister tous les utilisateurs** :

```bash
GET /_security/user
```

**Obtenir un utilisateur spécifique** :

```bash
GET /_security/user/john_doe
```

---

# Modifier et Supprimer des Utilisateurs

**Changer le mot de passe d'un utilisateur** :

```bash
POST /_security/user/john_doe/_password
{
  "password": "NewSecurePassword456!"
}
```

**Modifier les rôles d'un utilisateur** :

```bash
PUT /_security/user/john_doe
{
  "roles": ["kibana_admin", "monitoring_user", "reporting_user"],
  "full_name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Désactiver un utilisateur** (sans le supprimer) :

```bash
PUT /_security/user/john_doe/_disable
```

**Réactiver un utilisateur** :

```bash
PUT /_security/user/john_doe/_enable
```

**Supprimer un utilisateur** :

```bash
DELETE /_security/user/john_doe
```

---

# Tester l'Authentification

**Méthode 1 : Curl avec credentials** :

```bash
curl -u elastic:password "https://localhost:9200/_cluster/health?pretty"
```

**Méthode 2 : API Authenticate** :

```bash
GET /_security/_authenticate
```

**Résultat** :
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

**Méthode 3 : Tester avec mauvais credentials** :

```bash
curl -u elastic:wrong_password "https://localhost:9200/"
```

**Résultat attendu** : `401 Unauthorized`

---
layout: section
---

# Partie 3: Configuration RBAC (Role-Based Access Control)

Contrôle d'accès basé sur les rôles

---

# Comprendre le Modèle RBAC Elasticsearch

**RBAC** = Définir **qui** peut faire **quoi** et **où**.

**Composants du RBAC** :
- **User** (Utilisateur) : Identité authentifiée
- **Role** (Rôle) : Ensemble de permissions
- **Privileges** (Privilèges) : Actions autorisées
- **Resources** (Ressources) : Cluster, indices, applications

**Workflow** :
1. Utilisateur s'authentifie → Identité validée
2. Identité → Rôles assignés
3. Rôles → Privilèges accordés
4. Requête → Vérification des privilèges
5. Accès autorisé ou refusé

**Formule** :
```
User + Roles → Privileges → Actions on Resources
```

---

# Types de Privilèges

Elasticsearch définit des privilèges à **deux niveaux** :

**1. Cluster Privileges** (actions au niveau du cluster) :

| Privilège | Description |
|-----------|-------------|
| `all` | Tous les privilèges cluster |
| `monitor` | Lecture des métriques et stats (health, stats, etc.) |
| `manage` | Gestion du cluster (settings, reroute, etc.) |
| `manage_index_templates` | Créer/modifier des index templates |
| `manage_ilm` | Gérer les policies ILM |
| `manage_security` | Gérer utilisateurs, rôles, API keys |
| `create_snapshot` | Créer des snapshots |
| `monitor_snapshot` | Voir les snapshots |

**2. Index Privileges** (actions sur les indices) :

| Privilège | Description |
|-----------|-------------|
| `all` | Tous les privilèges sur les indices |
| `read` | Rechercher, get documents |
| `write` | Indexer, update, delete documents |
| `create` | Créer des indices |
| `delete` | Supprimer des indices |
| `create_index` | Créer uniquement (pas supprimer) |
| `view_index_metadata` | Voir mappings et settings |
| `manage` | Toutes les opérations de gestion (settings, mappings, etc.) |

---

# Créer un Rôle Personnalisé

**Exemple 1 : Rôle "Lecture Seule" sur indices de logs** :

```bash
POST /_security/role/logs_reader
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*", "filebeat-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ]
}
```

**Explication** :
- `cluster: ["monitor"]` : Peut voir les stats du cluster
- `indices.names` : Pattern d'indices ciblés
- `indices.privileges` : Actions autorisées (lecture uniquement)

**Exemple 2 : Rôle "Développeur" avec accès complet à ses indices** :

```bash
POST /_security/role/developer
{
  "cluster": ["monitor", "manage_index_templates"],
  "indices": [
    {
      "names": ["dev-*", "test-*"],
      "privileges": ["all"]
    }
  ],
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": ["feature_discover.all", "feature_visualize.all"],
      "resources": ["space:dev"]
    }
  ]
}
```

---

# Privilèges Granulaires : Actions Spécifiques

Vous pouvez spécifier des **actions individuelles** pour un contrôle fin :

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

**Fonctionnalités avancées** :
- `field_security.grant` : Champs accessibles
- `field_security.except` : Champs exclus (cachés)
- `query` : Filtre de documents (Document Level Security)

---

# Assigner des Rôles aux Utilisateurs

**Méthode 1 : Lors de la création de l'utilisateur** :

```bash
POST /_security/user/alice
{
  "password": "SecurePass123!",
  "roles": ["logs_reader", "kibana_user"]
}
```

**Méthode 2 : Modifier un utilisateur existant** :

```bash
PUT /_security/user/alice
{
  "roles": ["logs_reader", "kibana_user", "developer"]
}
```

**Vérifier les rôles d'un utilisateur** :

```bash
GET /_security/user/alice
```

**Résultat** :
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

# Role Mapping : LDAP/SAML → Elasticsearch Roles

Pour les realms externes (LDAP, SAML), utilisez **role mapping** pour convertir groupes externes en rôles Elasticsearch.

**Fichier role_mapping.yml** :

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

**Via API** :

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

**Rules avancées** (avec conditions) :

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

# Rôles Prédéfinis Elasticsearch

Elasticsearch fournit des **rôles prédéfinis** pour les cas d'usage courants :

| Rôle | Description |
|------|-------------|
| `superuser` | Tous les privilèges (équivalent root) |
| `kibana_admin` | Gestion complète de Kibana |
| `kibana_user` | Utilisation de Kibana (découverte, visualisations) |
| `monitoring_user` | Accès lecture aux métriques de monitoring |
| `ingest_admin` | Gestion des pipelines d'ingestion |
| `logstash_admin` | Gestion des pipelines Logstash |
| `beats_admin` | Configuration des Beats |
| `watcher_admin` | Gestion des alertes Watcher |
| `snapshot_user` | Créer et restaurer des snapshots |

**Voir tous les rôles prédéfinis** :

```bash
GET /_security/role
```

---
layout: section
---

# Partie 4: Niveaux de Filtrage et Interfaces Administratives

Document-Level Security, Field-Level Security, et gestion Kibana

---

# Document-Level Security (DLS)

**DLS** filtre les documents visibles selon les rôles, en utilisant une **query Elasticsearch**.

**Use Case** : Limiter l'accès aux documents selon département, région, ou niveau de confidentialité.

**Exemple : Accès uniquement aux commandes du département** :

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

**Résultat** :
- Utilisateurs avec ce rôle voient **uniquement** les documents où `department = "sales"`
- Autres documents sont invisibles (comme s'ils n'existaient pas)

**Requête complexe avec bool** :

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

**FLS** cache certains champs selon les rôles, pour protéger les données sensibles.

**Use Case** : Masquer SSN, salaires, emails personnels, données médicales.

**Exemple : Cacher les informations sensibles** :

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

**Résultat** :
- Utilisateurs voient : `name`, `department`, `hire_date`
- Utilisateurs **ne voient pas** : `ssn`, `salary`, `personal_email`

**Grant avec wildcards** :

```bash
"field_security": {
  "grant": ["public_*", "metadata.*", "name", "email"],
  "except": ["*.internal", "*.private"]
}
```

---

# Combiner DLS et FLS

Vous pouvez combiner **DLS** (filtrage de documents) et **FLS** (filtrage de champs) :

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

**Résultat** :
- Documents filtrés : uniquement `region = "EMEA"`
- Champs visibles : `name`, `department`, `position`, `email`
- Champs cachés : `ssn`, `salary`, `performance_review`

---

# API Keys : Authentification Programmatique

Les **API keys** permettent l'authentification sans username/password (idéal pour applications).

**Créer une API key** :

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

**Résultat** :
```json
{
  "id": "abc123xyz",
  "name": "my-app-key",
  "api_key": "bN6jH9mP4tY8qW3xaZ9kL2mN5vB7cX4r",
  "encoded": "YWJjMTIzeHl6OmJONmpIOW1QNHRZOHFXM3hhWjlrTDJtTjV2QjdjWDRy"
}
```

**Utiliser l'API key** :

```bash
curl -H "Authorization: ApiKey YWJjMTIzeHl6OmJONmpIOW1QNHRZOHFXM3hhWjlrTDJtTjV2QjdjWDRy" \
  "https://localhost:9200/app-logs-*/_search"
```

---

# Gestion des API Keys

**Lister toutes les API keys** :

```bash
GET /_security/api_key
```

**Obtenir une API key spécifique** :

```bash
GET /_security/api_key?id=abc123xyz
```

**Invalider une API key** :

```bash
DELETE /_security/api_key
{
  "ids": ["abc123xyz"]
}
```

**Invalider toutes les API keys d'un utilisateur** :

```bash
DELETE /_security/api_key
{
  "username": "john_doe"
}
```

**Invalider les API keys expirées** :

```bash
DELETE /_security/api_key
{
  "owner": true
}
```

---

# Kibana Spaces : Isolation Multi-Tenant

**Kibana Spaces** créent des environnements isolés au sein de Kibana.

**Use Case** : Séparer les équipes (Sales, Marketing, Engineering) avec leurs propres dashboards et index patterns.

**Créer un Space via Kibana UI** :
1. Stack Management → Kibana → **Spaces**
2. Cliquer sur **Create a space**
3. Configurer :
   - **Name** : `sales-space`
   - **Identifier** : `sales` (utilisé dans l'URL)
   - **Color** : Choisir une couleur
   - **Description** : "Sales team dashboards and visualizations"

**Résultat** : URL du space : `https://kibana.example.com/s/sales/app/dashboards`

**Configurer les Feature Privileges par Space** :

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

# Interfaces Administratives Kibana pour la Sécurité

**Stack Management → Security** centralise la gestion de la sécurité.

**Sections disponibles** :

| Section | Fonctionnalités |
|---------|-----------------|
| **Users** | Créer, modifier, désactiver utilisateurs |
| **Roles** | Définir rôles avec privilèges cluster et index |
| **Role Mappings** | Mapper groupes LDAP/SAML vers rôles Elasticsearch |
| **API Keys** | Créer et gérer API keys |
| **Spaces** | Créer des espaces isolés pour équipes |

**Workflow typique** :
1. Créer des **Roles** avec privilèges appropriés
2. Créer des **Users** et assigner les rôles
3. (Optionnel) Configurer **Role Mappings** pour LDAP/SAML
4. Créer des **Spaces** pour isolation multi-équipe
5. Générer des **API Keys** pour applications

---

# Audit Logging : Traçabilité des Accès

**Audit logging** enregistre toutes les actions de sécurité (authentifications, accès, modifications).

**Activer l'audit** :

```yaml
# elasticsearch.yml
xpack.security.audit.enabled: true
xpack.security.audit.logfile.events.include: 
  - access_denied
  - access_granted
  - authentication_success
  - authentication_failed
  - connection_denied
  - connection_granted
xpack.security.audit.logfile.events.exclude: []
```

**Événements audités** :
- `authentication_success` / `authentication_failed` : Tentatives de connexion
- `access_granted` / `access_denied` : Accès aux ressources
- `run_as_granted` / `run_as_denied` : Utilisation du privilege "run as"
- `tampered_request` : Requête modifiée/altérée

**Logs d'audit** : Écrits dans `<cluster-name>_audit.json`

**Exemple de log** :
```json
{
  "type": "audit",
  "timestamp": "2024-01-15T10:15:30,123Z",
  "event.action": "access_denied",
  "user.name": "alice",
  "origin.address": "192.168.1.50",
  "request.id": "abc-123",
  "url.path": "/_cat/indices?v",
  "request.method": "GET"
}
```

---

# Résumé : Implémentation de la Sécurité

| Composant | Outil | Fonction |
|-----------|-------|----------|
| **Authentification** | Realms (native, LDAP, SAML) | Valider l'identité |
| **Autorisation** | RBAC (Roles, Privileges) | Contrôler les accès |
| **Filtrage Documents** | Document-Level Security (DLS) | Limiter visibilité des documents |
| **Filtrage Champs** | Field-Level Security (FLS) | Masquer champs sensibles |
| **API Keys** | API Keys | Authentification programmatique |
| **Isolation** | Kibana Spaces | Séparer environnements par équipe |
| **Traçabilité** | Audit Logging | Enregistrer toutes les actions |

**Best Practices** :
1. ✅ Activer la sécurité dès la mise en production
2. ✅ Utiliser des mots de passe forts (min 12 caractères)
3. ✅ Appliquer le **principe du moindre privilège** (least privilege)
4. ✅ Utiliser DLS/FLS pour données sensibles
5. ✅ Activer l'audit logging pour conformité
6. ✅ Régulièrement auditer et réviser les rôles et accès
7. ✅ Utiliser API keys avec expiration pour applications

---

# Points Clés à Retenir

**Realms** :
- Les **realms** définissent comment les utilisateurs s'authentifient
- Chaîne d'authentification : plusieurs realms testés dans l'ordre
- Native realm = base de données interne, LDAP/SAML = intégration entreprise

**RBAC** :
- **Rôles** = ensemble de privilèges (cluster + indices)
- **Privilèges** = actions autorisées (read, write, manage, etc.)
- Combiner plusieurs rôles pour un utilisateur

**Filtrage Avancé** :
- **DLS** = filtrer les documents visibles avec une query
- **FLS** = cacher des champs sensibles (grant/except)
- Les deux peuvent être combinés

**Outils** :
- **API Keys** = authentification sans password (apps, scripts)
- **Kibana Spaces** = isolation multi-tenant
- **Audit Logging** = traçabilité pour conformité et sécurité

---

# Exercices Pratiques

Rendez-vous dans le workbook pratique pour réaliser les labs suivants :

**Lab 7.1** : Créer des Utilisateurs et des Rôles  
Configurer RBAC avec différents niveaux d'accès

**Lab 7.2** : Implémenter Document-Level Security  
Filtrer les documents selon le rôle de l'utilisateur

**🌟 Bonus Challenge 7.A** : Field-Level Security  
Masquer des champs sensibles pour certains rôles

---

# Ressources et Documentation

**Documentation officielle Elasticsearch** :
- [Secure the Elastic Stack](https://www.elastic.co/guide/en/elasticsearch/reference/current/secure-cluster.html)
- [Realms](https://www.elastic.co/guide/en/elasticsearch/reference/current/realms.html)
- [User authorization](https://www.elastic.co/guide/en/elasticsearch/reference/current/authorization.html)
- [Document and field level security](https://www.elastic.co/guide/en/elasticsearch/reference/current/field-and-document-access-control.html)

**Guides de sécurité** :
- [Security settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-settings.html)
- [API Keys](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api-create-api-key.html)
- [Audit logging](https://www.elastic.co/guide/en/elasticsearch/reference/current/enable-audit-logging.html)

**Kibana Security** :
- [Kibana Spaces](https://www.elastic.co/guide/en/kibana/current/xpack-spaces.html)
- [Kibana privileges](https://www.elastic.co/guide/en/kibana/current/kibana-privileges.html)
