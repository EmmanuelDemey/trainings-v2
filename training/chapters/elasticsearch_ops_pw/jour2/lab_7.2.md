## Lab 7.2: Implémentation de Document-Level Security (DLS)

**Objectif**: Mettre en œuvre la sécurité au niveau des documents pour filtrer les données visibles selon le rôle de l'utilisateur, en utilisant des requêtes Elasticsearch.

**Contexte**: La Document-Level Security (DLS) permet de limiter les documents visibles à un utilisateur selon une query Elasticsearch. C'est essentiel pour implémenter du multi-tenancy, séparer les données par département, région, ou niveau de confidentialité.

### Scénario

Vous gérez un cluster Elasticsearch pour une entreprise multi-régionale avec plusieurs départements :
- **Département Sales** : Accès uniquement aux commandes de vente
- **Département HR** : Accès uniquement aux employés
- **Managers régionaux** : Accès uniquement aux données de leur région

Vous allez implémenter des filtres DLS pour chaque cas d'usage.

### Étape 1: Créer les Indices de Test avec Données Multi-Tenant

**Index 1 : Commandes avec département** :

```bash
PUT /orders
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "order_id": { "type": "keyword" },
      "customer": { "type": "keyword" },
      "amount": { "type": "float" },
      "department": { "type": "keyword" },
      "region": { "type": "keyword" },
      "status": { "type": "keyword" },
      "created_at": { "type": "date" }
    }
  }
}

POST /orders/_bulk
{"index":{"_id":"1"}}
{"order_id":"ORD-001","customer":"Alice Corp","amount":5000,"department":"sales","region":"EMEA","status":"completed","created_at":"2024-01-15T10:00:00Z"}
{"index":{"_id":"2"}}
{"order_id":"ORD-002","customer":"Bob LLC","amount":3000,"department":"sales","region":"AMER","status":"pending","created_at":"2024-01-16T10:00:00Z"}
{"index":{"_id":"3"}}
{"order_id":"ORD-003","customer":"Charlie Inc","amount":7500,"department":"marketing","region":"EMEA","status":"completed","created_at":"2024-01-17T10:00:00Z"}
{"index":{"_id":"4"}}
{"order_id":"ORD-004","customer":"David Co","amount":2000,"department":"sales","region":"APAC","status":"completed","created_at":"2024-01-18T10:00:00Z"}
{"index":{"_id":"5"}}
{"order_id":"ORD-005","customer":"Eve Enterprises","amount":9000,"department":"marketing","region":"AMER","status":"pending","created_at":"2024-01-19T10:00:00Z"}

# Index 2 : Employés avec région et niveau de confidentialité
PUT /employees
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "employee_id": { "type": "keyword" },
      "name": { "type": "keyword" },
      "department": { "type": "keyword" },
      "region": { "type": "keyword" },
      "salary": { "type": "float" },
      "confidentiality": { "type": "keyword" },
      "hire_date": { "type": "date" }
    }
  }
}

POST /employees/_bulk
{"index":{"_id":"1"}}
{"employee_id":"EMP-001","name":"Alice Johnson","department":"sales","region":"EMEA","salary":60000,"confidentiality":"public","hire_date":"2020-01-15"}
{"index":{"_id":"2"}}
{"employee_id":"EMP-002","name":"Bob Smith","department":"hr","region":"EMEA","salary":55000,"confidentiality":"restricted","hire_date":"2021-03-20"}
{"index":{"_id":"3"}}
{"employee_id":"EMP-003","name":"Charlie Brown","department":"engineering","region":"AMER","salary":85000,"confidentiality":"public","hire_date":"2019-05-10"}
{"index":{"_id":"4"}}
{"employee_id":"EMP-004","name":"David Lee","department":"sales","region":"APAC","salary":65000,"confidentiality":"public","hire_date":"2022-07-01"}
{"index":{"_id":"5"}}
{"employee_id":"EMP-005","name":"Eve Martinez","department":"hr","region":"AMER","salary":75000,"confidentiality":"confidential","hire_date":"2018-11-15"}
```

### Étape 2: Créer un Rôle avec DLS pour le Département Sales

Ce rôle permet de voir **uniquement** les commandes du département "sales" :

```bash
POST /_security/role/sales_team
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders"],
      "privileges": ["read", "view_index_metadata"],
      "query": {
        "term": {
          "department": "sales"
        }
      }
    }
  ],
  "metadata": {
    "description": "Sales team - can only see sales department orders"
  }
}
```

**Explication** :
- `query.term.department: "sales"` : Filtre qui n'affiche que les documents où `department = "sales"`
- Les documents avec `department = "marketing"` sont **invisibles** pour ce rôle

### Étape 3: Créer un Rôle avec DLS pour Manager Régional EMEA

Ce rôle permet de voir **uniquement** les données de la région EMEA :

```bash
POST /_security/role/emea_manager
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders", "employees"],
      "privileges": ["read", "view_index_metadata"],
      "query": {
        "term": {
          "region": "EMEA"
        }
      }
    }
  ],
  "metadata": {
    "description": "EMEA regional manager - can only see EMEA region data"
  }
}
```

### Étape 4: Créer un Rôle avec DLS Complexe (Plusieurs Conditions)

Ce rôle permet de voir les commandes "sales" **ET** statut "completed" :

```bash
POST /_security/role/sales_completed
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders"],
      "privileges": ["read"],
      "query": {
        "bool": {
          "must": [
            { "term": { "department": "sales" } },
            { "term": { "status": "completed" } }
          ]
        }
      }
    }
  ],
  "metadata": {
    "description": "Sales team - only completed sales orders"
  }
}
```

**Query DLS** : Combine plusieurs conditions avec `bool.must`

### Étape 5: Créer un Rôle pour HR avec Filtrage par Confidentialité

Le département HR peut voir tous les employés **sauf** les "confidential" :

```bash
POST /_security/role/hr_team
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees"],
      "privileges": ["read", "write", "view_index_metadata"],
      "query": {
        "bool": {
          "must_not": [
            { "term": { "confidentiality": "confidential" } }
          ]
        }
      }
    }
  ],
  "metadata": {
    "description": "HR team - cannot see confidential employee records"
  }
}
```

**Query DLS** : Utilise `bool.must_not` pour exclure des documents

### Étape 6: Créer des Utilisateurs avec Rôles DLS

```bash
# Utilisateur sales team
POST /_security/user/sarah_sales
{
  "password": "SalesPass123!",
  "roles": ["sales_team"],
  "full_name": "Sarah Sales",
  "email": "sarah@example.com"
}

# Utilisateur EMEA manager
POST /_security/user/michael_emea
{
  "password": "EMEAPass456!",
  "roles": ["emea_manager"],
  "full_name": "Michael EMEA Manager",
  "email": "michael@example.com"
}

# Utilisateur sales completed
POST /_security/user/tom_audit
{
  "password": "AuditPass789!",
  "roles": ["sales_completed"],
  "full_name": "Tom Auditor",
  "email": "tom@example.com"
}

# Utilisateur HR
POST /_security/user/helen_hr
{
  "password": "HRPass321!",
  "roles": ["hr_team"],
  "full_name": "Helen HR",
  "email": "helen@example.com"
}
```

### Étape 7: Tester le Filtrage DLS pour Sales Team

**Connexion en tant que sarah_sales** :

```bash
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 3 },
    "hits": [
      {
        "_source": {
          "order_id": "ORD-001",
          "department": "sales",
          "region": "EMEA",
          ...
        }
      },
      {
        "_source": {
          "order_id": "ORD-002",
          "department": "sales",
          "region": "AMER",
          ...
        }
      },
      {
        "_source": {
          "order_id": "ORD-004",
          "department": "sales",
          "region": "APAC",
          ...
        }
      }
    ]
  }
}
```

**Analyse** :
- ✅ Voit ORD-001, ORD-002, ORD-004 (department = "sales")
- ❌ Ne voit **PAS** ORD-003, ORD-005 (department = "marketing")

**Compter les documents visibles** :

```bash
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_count?pretty"
```

**Résultat attendu** : `{ "count": 3 }`

### Étape 8: Tester le Filtrage DLS pour EMEA Manager

**Connexion en tant que michael_emea** :

```bash
curl -u michael_emea:EMEAPass456! "https://localhost:9200/orders/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [
      {
        "_source": {
          "order_id": "ORD-001",
          "region": "EMEA",
          "department": "sales",
          ...
        }
      },
      {
        "_source": {
          "order_id": "ORD-003",
          "region": "EMEA",
          "department": "marketing",
          ...
        }
      }
    ]
  }
}
```

**Analyse** :
- ✅ Voit ORD-001, ORD-003 (region = "EMEA")
- ❌ Ne voit **PAS** ORD-002, ORD-004, ORD-005 (autres régions)

**Tester sur l'index employees** :

```bash
curl -u michael_emea:EMEAPass456! "https://localhost:9200/employees/_search?pretty"
```

**Résultat attendu** : Employés EMP-001 et EMP-002 uniquement (region = "EMEA")

### Étape 9: Tester le Filtrage DLS avec Conditions Multiples

**Connexion en tant que tom_audit** (sales + completed) :

```bash
curl -u tom_audit:AuditPass789! "https://localhost:9200/orders/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 2 },
    "hits": [
      {
        "_source": {
          "order_id": "ORD-001",
          "department": "sales",
          "status": "completed",
          ...
        }
      },
      {
        "_source": {
          "order_id": "ORD-004",
          "department": "sales",
          "status": "completed",
          ...
        }
      }
    ]
  }
}
```

**Analyse** :
- ✅ Voit ORD-001, ORD-004 (sales + completed)
- ❌ Ne voit **PAS** ORD-002 (sales mais pending)
- ❌ Ne voit **PAS** ORD-003, ORD-005 (marketing)

### Étape 10: Tester le Filtrage DLS avec Exclusion (HR Team)

**Connexion en tant que helen_hr** :

```bash
curl -u helen_hr:HRPass321! "https://localhost:9200/employees/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 4 },
    "hits": [
      { "_source": { "employee_id": "EMP-001", "confidentiality": "public" } },
      { "_source": { "employee_id": "EMP-002", "confidentiality": "restricted" } },
      { "_source": { "employee_id": "EMP-003", "confidentiality": "public" } },
      { "_source": { "employee_id": "EMP-004", "confidentiality": "public" } }
    ]
  }
}
```

**Analyse** :
- ✅ Voit EMP-001, 002, 003, 004 (public ou restricted)
- ❌ Ne voit **PAS** EMP-005 (confidentiality = "confidential")

### Étape 11: Vérifier l'Invisibilité Complète (Get par ID)

Même si on connaît l'ID d'un document filtré par DLS, il est inaccessible :

```bash
# Sarah (sales team) essaie d'accéder à ORD-003 (marketing)
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_doc/3?pretty"
```

**Résultat attendu** : Erreur 404 Not Found
```json
{
  "_index": "orders",
  "_id": "3",
  "found": false
}
```

Le document existe mais est **invisible** pour sarah_sales (comme s'il n'existait pas).

### Étape 12: Tester les Agrégations avec DLS

Les agrégations respectent également le filtrage DLS :

```bash
# Agréger par région (vue sarah_sales)
curl -u sarah_sales:SalesPass123! -X GET "https://localhost:9200/orders/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
  "size": 0,
  "aggs": {
    "by_region": {
      "terms": {
        "field": "region"
      }
    }
  }
}'
```

**Résultat attendu** :
```json
{
  "aggregations": {
    "by_region": {
      "buckets": [
        { "key": "EMEA", "doc_count": 1 },
        { "key": "AMER", "doc_count": 1 },
        { "key": "APAC", "doc_count": 1 }
      ]
    }
  }
}
```

**Analyse** : Uniquement les régions des commandes "sales" (3 documents au total).

### Validation Finale

Vérifiez que vous avez réussi le lab :

```bash
# 1. Vérifier les rôles DLS créés
GET /_security/role/sales_team,emea_manager,sales_completed,hr_team

# 2. Pour chaque utilisateur, vérifier le count
curl -u sarah_sales:SalesPass123! "https://localhost:9200/orders/_count"
# Attendu: {"count": 3}

curl -u michael_emea:EMEAPass456! "https://localhost:9200/orders/_count"
# Attendu: {"count": 2}

curl -u tom_audit:AuditPass789! "https://localhost:9200/orders/_count"
# Attendu: {"count": 2}

curl -u helen_hr:HRPass321! "https://localhost:9200/employees/_count"
# Attendu: {"count": 4}

# 3. Comparer avec superuser (voit tout)
curl -u elastic:your_password "https://localhost:9200/orders/_count"
# Attendu: {"count": 5}
```

### Points Clés à Retenir

✅ **DLS filtre les documents** visibles selon une query Elasticsearch  
✅ La query DLS est **transparente** pour l'utilisateur (documents invisibles comme s'ils n'existaient pas)  
✅ Même avec `GET /_doc/{id}`, un document filtré retourne **404 Not Found**  
✅ Les **agrégations** et **statistiques** respectent le filtrage DLS  
✅ `term` query pour filtrage exact, `bool` pour conditions complexes  
✅ `must`, `must_not`, `should` permettent des filtres sophistiqués  
✅ DLS fonctionne avec **tous les patterns d'indices** (`orders-*`, etc.)  
✅ Combiner DLS avec Field-Level Security pour protection maximale  
✅ Tester systématiquement avec `_count` et `_search` après création de rôles DLS  
✅ DLS est idéal pour **multi-tenancy**, **séparation départementale**, **filtrage régional**

---

