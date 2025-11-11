## 🌟 Bonus Challenge 7.A: Field-Level Security (FLS) pour Masquer des Champs Sensibles

**Niveau**: Avancé  
**Objectif**: Implémenter la sécurité au niveau des champs (Field-Level Security) pour cacher des données sensibles selon les rôles, en combinant avec DLS pour une protection multicouche.

**Contexte**: Certaines données dans vos indices sont sensibles (SSN, salaires, emails personnels, données médicales). La Field-Level Security permet de les masquer complètement pour certains rôles, même si l'utilisateur peut voir le document.

### Scénario

Vous gérez un cluster avec des données d'employés contenant :
- **Données publiques** : Nom, département, date d'embauche
- **Données sensibles** : SSN, salaire, adresse personnelle, numéro de téléphone
- **Données confidentielles** : Évaluations de performance, notes disciplinaires

Vous allez créer plusieurs niveaux d'accès :
1. **Public** : Peut voir uniquement les champs publics
2. **HR Team** : Peut voir public + certaines données sensibles (pas SSN)
3. **HR Manager** : Peut voir tout (public + sensible + confidentiel)

### Étape 1: Créer un Index d'Employés Enrichi

```bash
PUT /employees_full
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
      "position": { "type": "keyword" },
      "hire_date": { "type": "date" },
      "email_corporate": { "type": "keyword" },
      "email_personal": { "type": "keyword" },
      "phone_work": { "type": "keyword" },
      "phone_personal": { "type": "keyword" },
      "address": {
        "properties": {
          "street": { "type": "text" },
          "city": { "type": "keyword" },
          "country": { "type": "keyword" },
          "postal_code": { "type": "keyword" }
        }
      },
      "ssn": { "type": "keyword" },
      "salary": { "type": "float" },
      "performance_review": {
        "properties": {
          "rating": { "type": "keyword" },
          "comments": { "type": "text" },
          "reviewer": { "type": "keyword" }
        }
      },
      "disciplinary_notes": { "type": "text" }
    }
  }
}
```

### Étape 2: Indexer des Données de Test

```bash
POST /employees_full/_bulk
{"index":{"_id":"1"}}
{"employee_id":"EMP-001","name":"Alice Johnson","department":"sales","position":"Sales Manager","hire_date":"2020-01-15","email_corporate":"alice.johnson@company.com","email_personal":"alice.j@gmail.com","phone_work":"+33-1-23-45-67-89","phone_personal":"+33-6-12-34-56-78","address":{"street":"10 Rue de Rivoli","city":"Paris","country":"France","postal_code":"75001"},"ssn":"123-45-6789","salary":75000,"performance_review":{"rating":"excellent","comments":"Top performer","reviewer":"Director Sales"},"disciplinary_notes":null}
{"index":{"_id":"2"}}
{"employee_id":"EMP-002","name":"Bob Smith","department":"hr","position":"HR Specialist","hire_date":"2021-03-20","email_corporate":"bob.smith@company.com","email_personal":"bob.smith@yahoo.com","phone_work":"+33-1-98-76-54-32","phone_personal":"+33-6-98-76-54-32","address":{"street":"25 Avenue des Champs","city":"Lyon","country":"France","postal_code":"69001"},"ssn":"987-65-4321","salary":60000,"performance_review":{"rating":"good","comments":"Solid contributor","reviewer":"HR Director"},"disciplinary_notes":"Late arrival incident - 2023-05-10"}
{"index":{"_id":"3"}}
{"employee_id":"EMP-003","name":"Charlie Brown","department":"engineering","position":"Senior Engineer","hire_date":"2019-05-10","email_corporate":"charlie.brown@company.com","email_personal":"cbrown@outlook.com","phone_work":"+33-1-11-22-33-44","phone_personal":"+33-6-11-22-33-44","address":{"street":"5 Boulevard Saint-Germain","city":"Paris","country":"France","postal_code":"75005"},"ssn":"555-12-3456","salary":95000,"performance_review":{"rating":"excellent","comments":"Technical leader","reviewer":"CTO"},"disciplinary_notes":null}
```

### Étape 3: Créer un Rôle "Public" avec FLS Restrictif

Ce rôle ne peut voir que les champs publics :

```bash
POST /_security/role/employee_public_view
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["read"],
      "field_security": {
        "grant": [
          "employee_id",
          "name",
          "department",
          "position",
          "hire_date",
          "email_corporate",
          "phone_work"
        ]
      }
    }
  ],
  "metadata": {
    "description": "Public view - only non-sensitive employee data"
  }
}
```

**Champs accordés** : ID, nom, département, poste, date d'embauche, email pro, téléphone pro  
**Champs cachés** : SSN, salaire, adresse, emails/téléphones persos, évaluations, notes disciplinaires

### Étape 4: Créer un Rôle "HR Team" avec FLS Modéré

Ce rôle peut voir plus de champs mais pas les plus sensibles (SSN, notes disciplinaires) :

```bash
POST /_security/role/hr_team_view
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["read", "write"],
      "field_security": {
        "grant": [
          "employee_id",
          "name",
          "department",
          "position",
          "hire_date",
          "email_*",
          "phone_*",
          "address.*",
          "salary",
          "performance_review.*"
        ],
        "except": [
          "ssn",
          "disciplinary_notes"
        ]
      }
    }
  ],
  "metadata": {
    "description": "HR team - can see most fields except SSN and disciplinary notes"
  }
}
```

**Utilisation de wildcards** :
- `email_*` : Accorde `email_corporate` ET `email_personal`
- `phone_*` : Accorde `phone_work` ET `phone_personal`
- `address.*` : Accorde tous les sous-champs de `address`
- `performance_review.*` : Tous les sous-champs des évaluations

**Champs explicitement exclus** :
- `ssn` : Numéro de sécurité sociale
- `disciplinary_notes` : Notes disciplinaires

### Étape 5: Créer un Rôle "HR Manager" avec Accès Complet

Ce rôle peut voir TOUS les champs sans restriction :

```bash
POST /_security/role/hr_manager_full
{
  "cluster": ["monitor", "manage"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["all"],
      "field_security": {
        "grant": ["*"]
      }
    }
  ],
  "metadata": {
    "description": "HR Manager - full access to all employee data"
  }
}
```

**Grant `["*"]`** : Accorde tous les champs sans exception

### Étape 6: Créer des Utilisateurs avec Ces Rôles

```bash
# Utilisateur public
POST /_security/user/intern_view
{
  "password": "InternPass123!",
  "roles": ["employee_public_view"],
  "full_name": "Intern Viewer"
}

# Utilisateur HR team
POST /_security/user/jane_hr
{
  "password": "HRPass456!",
  "roles": ["hr_team_view"],
  "full_name": "Jane HR Specialist"
}

# Utilisateur HR manager
POST /_security/user/susan_hrmanager
{
  "password": "ManagerPass789!",
  "roles": ["hr_manager_full"],
  "full_name": "Susan HR Manager"
}
```

### Étape 7: Tester FLS - Vue Publique (Intern)

```bash
curl -u intern_view:InternPass123! "https://localhost:9200/employees_full/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "hits": [
      {
        "_source": {
          "employee_id": "EMP-001",
          "name": "Alice Johnson",
          "department": "sales",
          "position": "Sales Manager",
          "hire_date": "2020-01-15",
          "email_corporate": "alice.johnson@company.com",
          "phone_work": "+33-1-23-45-67-89"
        }
      },
      ...
    ]
  }
}
```

**Analyse** :
- ✅ Voit : `employee_id`, `name`, `department`, `position`, `hire_date`, `email_corporate`, `phone_work`
- ❌ Ne voit **PAS** : `email_personal`, `phone_personal`, `address`, `ssn`, `salary`, `performance_review`, `disciplinary_notes`

### Étape 8: Tester FLS - Vue HR Team

```bash
curl -u jane_hr:HRPass456! "https://localhost:9200/employees_full/_doc/1?pretty"
```

**Résultat attendu** :
```json
{
  "_source": {
    "employee_id": "EMP-001",
    "name": "Alice Johnson",
    "department": "sales",
    "position": "Sales Manager",
    "hire_date": "2020-01-15",
    "email_corporate": "alice.johnson@company.com",
    "email_personal": "alice.j@gmail.com",
    "phone_work": "+33-1-23-45-67-89",
    "phone_personal": "+33-6-12-34-56-78",
    "address": {
      "street": "10 Rue de Rivoli",
      "city": "Paris",
      "country": "France",
      "postal_code": "75001"
    },
    "salary": 75000,
    "performance_review": {
      "rating": "excellent",
      "comments": "Top performer",
      "reviewer": "Director Sales"
    }
  }
}
```

**Analyse** :
- ✅ Voit : Tous les champs publics + emails/téléphones persos + adresse + salaire + évaluations
- ❌ Ne voit **PAS** : `ssn`, `disciplinary_notes` (exclus explicitement)

### Étape 9: Tester FLS - Vue HR Manager (Full Access)

```bash
curl -u susan_hrmanager:ManagerPass789! "https://localhost:9200/employees_full/_doc/2?pretty"
```

**Résultat attendu** :
```json
{
  "_source": {
    "employee_id": "EMP-002",
    "name": "Bob Smith",
    "department": "hr",
    "position": "HR Specialist",
    "hire_date": "2021-03-20",
    "email_corporate": "bob.smith@company.com",
    "email_personal": "bob.smith@yahoo.com",
    "phone_work": "+33-1-98-76-54-32",
    "phone_personal": "+33-6-98-76-54-32",
    "address": {
      "street": "25 Avenue des Champs",
      "city": "Lyon",
      "country": "France",
      "postal_code": "69001"
    },
    "ssn": "987-65-4321",
    "salary": 60000,
    "performance_review": {
      "rating": "good",
      "comments": "Solid contributor",
      "reviewer": "HR Director"
    },
    "disciplinary_notes": "Late arrival incident - 2023-05-10"
  }
}
```

**Analyse** :
- ✅ Voit **TOUT** : Tous les champs y compris `ssn` et `disciplinary_notes`

### Étape 10: Combiner DLS + FLS

Créons un rôle qui combine filtrage de documents ET de champs :

```bash
POST /_security/role/sales_dept_restricted
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["read"],
      "query": {
        "term": {
          "department": "sales"
        }
      },
      "field_security": {
        "grant": [
          "employee_id",
          "name",
          "department",
          "position",
          "email_corporate",
          "phone_work"
        ]
      }
    }
  ],
  "metadata": {
    "description": "Sales department view - only sales employees, limited fields"
  }
}
```

**Double protection** :
- **DLS** : Filtre les documents (`department = "sales"` uniquement)
- **FLS** : Filtre les champs (champs publics uniquement)

### Étape 11: Tester DLS + FLS Combinés

```bash
# Créer l'utilisateur
POST /_security/user/sales_viewer
{
  "password": "SalesView123!",
  "roles": ["sales_dept_restricted"]
}

# Tester la recherche
curl -u sales_viewer:SalesView123! "https://localhost:9200/employees_full/_search?pretty"
```

**Résultat attendu** :
```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [
      {
        "_source": {
          "employee_id": "EMP-001",
          "name": "Alice Johnson",
          "department": "sales",
          "position": "Sales Manager",
          "email_corporate": "alice.johnson@company.com",
          "phone_work": "+33-1-23-45-67-89"
        }
      }
    ]
  }
}
```

**Analyse** :
- ✅ Voit uniquement EMP-001 (seul employé "sales")
- ❌ Ne voit **PAS** EMP-002 (hr) ni EMP-003 (engineering) → DLS
- ✅ Champs limités aux publics → FLS

### Étape 12: Tester FLS avec Agrégations

Les agrégations respectent également FLS :

```bash
# Avec intern_view (pas accès à salary)
curl -u intern_view:InternPass123! -X GET "https://localhost:9200/employees_full/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
  "size": 0,
  "aggs": {
    "avg_salary": {
      "avg": {
        "field": "salary"
      }
    }
  }
}'
```

**Résultat attendu** : Erreur ou résultat vide (le champ `salary` est invisible)

```bash
# Avec jane_hr (accès à salary)
curl -u jane_hr:HRPass456! -X GET "https://localhost:9200/employees_full/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
  "size": 0,
  "aggs": {
    "avg_salary": {
      "avg": {
        "field": "salary"
      }
    }
  }
}'
```

**Résultat attendu** :
```json
{
  "aggregations": {
    "avg_salary": {
      "value": 76666.67
    }
  }
}
```

### Validation Finale

```bash
# 1. Vérifier les rôles FLS
GET /_security/role/employee_public_view,hr_team_view,hr_manager_full,sales_dept_restricted

# 2. Comparer les champs visibles pour chaque utilisateur
# intern_view : 7 champs
# jane_hr : ~13 champs (sauf ssn, disciplinary_notes)
# susan_hrmanager : TOUS les champs

# 3. Vérifier la combinaison DLS + FLS
curl -u sales_viewer:SalesView123! "https://localhost:9200/employees_full/_count"
# Attendu: {"count": 1} (seulement Alice de sales)
```

### Points Clés à Retenir

✅ **FLS cache complètement les champs** (comme s'ils n'existaient pas dans le document)  
✅ `grant` liste les champs **autorisés**, `except` liste les champs **exclus**  
✅ **Wildcards** (`email_*`, `address.*`) permettent des patterns flexibles  
✅ **Nested fields** utilisent la notation point (`performance_review.rating`)  
✅ **DLS + FLS combinés** offrent une protection multicouche  
✅ Les **agrégations** sur champs cachés échouent ou retournent vide  
✅ Même avec `GET /_doc/{id}`, les champs cachés sont **absents du _source**  
✅ FLS est **appliqué au niveau du shard** pour performance optimale  
✅ Utiliser `grant: ["*"]` pour accès complet à tous les champs  
✅ Tester systématiquement avec différents rôles pour valider les restrictions

**Félicitations !** Vous maîtrisez maintenant la sécurité avancée d'Elasticsearch avec RBAC, DLS, et FLS ! 🎉


---

