## Lab 7.1: Création d'Utilisateurs et de Rôles

**Objectif**: Maîtriser la création et la gestion d'utilisateurs et de rôles avec différents niveaux de privilèges, en implémentant le principe du moindre privilège (least privilege).

**Contexte**: Le contrôle d'accès basé sur les rôles (RBAC) est fondamental pour sécuriser Elasticsearch. Dans ce lab, vous allez créer plusieurs rôles avec des privilèges variés, créer des utilisateurs, et tester les restrictions d'accès.

### Prérequis : Sécurité Activée

Vérifiez que la sécurité est activée sur votre cluster :

```bash
GET /_xpack
```

**Résultat attendu** :
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

Si la sécurité n'est pas activée (Elasticsearch 7.x), ajoutez dans `elasticsearch.yml` :

```yaml
xpack.security.enabled: true
```

Puis redémarrez Elasticsearch.

### Étape 1: Vérifier l'Utilisateur Actuel

Commencez par vérifier avec quel utilisateur vous êtes connecté :

```bash
GET /_security/_authenticate
```

**Résultat attendu** :
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
  }
}
```

Vous devriez être connecté avec l'utilisateur `elastic` (superuser).

### Étape 2: Créer un Rôle "Lecture Seule" (Read-Only)

Créons un rôle qui permet uniquement la lecture des indices de logs :

```bash
POST /_security/role/logs_readonly
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*", "filebeat-*", "logstash-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "applications": [],
  "run_as": [],
  "metadata": {
    "version": 1,
    "description": "Read-only access to logs indices"
  }
}
```

**Résultat attendu** :
```json
{
  "role": {
    "created": true
  }
}
```

**Explication des privilèges** :
- `cluster: ["monitor"]` : Peut voir les stats du cluster (_cluster/health, _cat/*, etc.)
- `indices.privileges: ["read"]` : Peut rechercher et lire les documents
- `view_index_metadata` : Peut voir les mappings et settings

**Vérifier le rôle créé** :

```bash
GET /_security/role/logs_readonly
```

### Étape 3: Créer un Rôle "Analyste de Données"

Créons un rôle pour un analyste qui peut lire et créer des visualisations :

```bash
POST /_security/role/data_analyst
{
  "cluster": ["monitor", "manage_index_templates"],
  "indices": [
    {
      "names": ["products", "orders", "customers"],
      "privileges": ["read", "view_index_metadata"]
    },
    {
      "names": [".kibana*", ".kibana-*"],
      "privileges": ["read", "write", "manage"]
    }
  ],
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": ["feature_discover.all", "feature_visualize.all", "feature_dashboard.read"],
      "resources": ["*"]
    }
  ],
  "metadata": {
    "description": "Data analyst with read access to business data and Kibana visualization capabilities"
  }
}
```

**Nouveaux privilèges** :
- `manage_index_templates` : Peut créer des index patterns dans Kibana
- Accès aux indices `.kibana*` pour sauvegarder les visualisations
- Privilèges Kibana : `discover.all`, `visualize.all`, `dashboard.read`

### Étape 4: Créer un Rôle "Développeur"

Créons un rôle pour un développeur avec accès complet à ses indices de test :

```bash
POST /_security/role/developer
{
  "cluster": ["monitor", "manage_index_templates", "manage_ilm", "manage_pipeline"],
  "indices": [
    {
      "names": ["dev-*", "test-*"],
      "privileges": ["all"]
    },
    {
      "names": ["products", "orders"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": ["all"],
      "resources": ["space:dev"]
    }
  ],
  "metadata": {
    "description": "Developer with full access to dev/test indices"
  }
}
```

**Privilèges étendus** :
- `all` sur indices `dev-*` et `test-*` : Peut tout faire
- `manage_ilm` : Peut gérer les Index Lifecycle Management policies
- `manage_pipeline` : Peut gérer les ingest pipelines
- Accès complet Kibana dans le space "dev"

### Étape 5: Créer des Utilisateurs avec Ces Rôles

**Utilisateur 1 : Lecteur de logs** :

```bash
POST /_security/user/alice_reader
{
  "password": "ReadOnlyPass123!",
  "roles": ["logs_readonly"],
  "full_name": "Alice Reader",
  "email": "alice@example.com",
  "metadata": {
    "department": "Operations",
    "hire_date": "2024-01-15"
  }
}
```

**Utilisateur 2 : Analyste** :

```bash
POST /_security/user/bob_analyst
{
  "password": "AnalystPass456!",
  "roles": ["data_analyst", "kibana_user"],
  "full_name": "Bob Analyst",
  "email": "bob@example.com",
  "metadata": {
    "department": "Data Science",
    "hire_date": "2023-05-10"
  }
}
```

**Utilisateur 3 : Développeur** :

```bash
POST /_security/user/charlie_dev
{
  "password": "DevPass789!",
  "roles": ["developer"],
  "full_name": "Charlie Developer",
  "email": "charlie@example.com",
  "metadata": {
    "department": "Engineering",
    "hire_date": "2023-03-20"
  }
}
```

**Vérifier les utilisateurs créés** :

```bash
GET /_security/user
```

Vous devriez voir les trois utilisateurs listés avec leurs rôles.

### Étape 6: Créer des Indices de Test

Créons des indices pour tester les permissions :

```bash
# Index de logs
PUT /logs-2024-01
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /logs-2024-01/_bulk
{"index":{"_id":"1"}}
{"timestamp":"2024-01-15T10:00:00Z","level":"INFO","message":"Application started","service":"api"}
{"index":{"_id":"2"}}
{"timestamp":"2024-01-15T10:05:00Z","level":"WARN","message":"High memory usage","service":"api"}
{"index":{"_id":"3"}}
{"timestamp":"2024-01-15T10:10:00Z","level":"ERROR","message":"Database connection failed","service":"database"}

# Index products
PUT /products
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /products/_bulk
{"index":{"_id":"1"}}
{"name":"Laptop","price":999,"category":"electronics","stock":50}
{"index":{"_id":"2"}}
{"name":"Mouse","price":25,"category":"electronics","stock":200}
{"index":{"_id":"3"}}
{"name":"Desk","price":299,"category":"furniture","stock":20}

# Index de développement
PUT /dev-feature-x
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

POST /dev-feature-x/_doc/1
{
  "feature": "feature-x",
  "status": "in-development",
  "tests_passing": false
}
```

### Étape 7: Tester les Permissions de alice_reader (Read-Only)

**Test 1 : Lecture autorisée sur logs** :

```bash
# Se connecter comme alice_reader
curl -u alice_reader:ReadOnlyPass123! "https://localhost:9200/logs-2024-01/_search?pretty"
```

**Résultat attendu** : Succès (200 OK) avec les 3 documents

**Test 2 : Lecture NON autorisée sur products** :

```bash
curl -u alice_reader:ReadOnlyPass123! "https://localhost:9200/products/_search?pretty"
```

**Résultat attendu** : Erreur 403 Forbidden
```json
{
  "error": {
    "type": "security_exception",
    "reason": "action [indices:data/read/search] is unauthorized for user [alice_reader]"
  },
  "status": 403
}
```

**Test 3 : Écriture NON autorisée sur logs** :

```bash
curl -u alice_reader:ReadOnlyPass123! -X POST "https://localhost:9200/logs-2024-01/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"timestamp":"2024-01-15T11:00:00Z","level":"INFO","message":"Test"}'
```

**Résultat attendu** : Erreur 403 Forbidden (pas de privilège `write`)

**Test 4 : Cluster health autorisé** :

```bash
curl -u alice_reader:ReadOnlyPass123! "https://localhost:9200/_cluster/health?pretty"
```

**Résultat attendu** : Succès (privilège `monitor` permet cela)

### Étape 8: Tester les Permissions de bob_analyst (Analyste)

**Test 1 : Lecture autorisée sur products et orders** :

```bash
curl -u bob_analyst:AnalystPass456! "https://localhost:9200/products/_search?pretty"
```

**Résultat attendu** : Succès (200 OK)

**Test 2 : Écriture NON autorisée sur products** :

```bash
curl -u bob_analyst:AnalystPass456! -X POST "https://localhost:9200/products/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"name":"New Product","price":100}'
```

**Résultat attendu** : Erreur 403 Forbidden (rôle `data_analyst` n'a que `read`)

**Test 3 : Lecture NON autorisée sur dev-* (indices de dev)** :

```bash
curl -u bob_analyst:AnalystPass456! "https://localhost:9200/dev-feature-x/_search?pretty"
```

**Résultat attendu** : Erreur 403 Forbidden

### Étape 9: Tester les Permissions de charlie_dev (Développeur)

**Test 1 : Accès complet aux indices dev-*** :

```bash
# Lecture
curl -u charlie_dev:DevPass789! "https://localhost:9200/dev-feature-x/_search?pretty"

# Écriture
curl -u charlie_dev:DevPass789! -X POST "https://localhost:9200/dev-feature-x/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"feature":"feature-y","status":"planned"}'

# Suppression
curl -u charlie_dev:DevPass789! -X DELETE "https://localhost:9200/dev-feature-x"
```

**Résultat attendu** : Tous succès (privilège `all` sur `dev-*`)

**Test 2 : Création d'index de test** :

```bash
curl -u charlie_dev:DevPass789! -X PUT "https://localhost:9200/test-new-feature"
```

**Résultat attendu** : Succès (peut créer des indices `test-*`)

**Test 3 : Lecture autorisée mais écriture NON autorisée sur products** :

```bash
# Lecture : OK
curl -u charlie_dev:DevPass789! "https://localhost:9200/products/_search?pretty"

# Écriture : FORBIDDEN
curl -u charlie_dev:DevPass789! -X POST "https://localhost:9200/products/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Hacked"}'
```

**Résultat attendu** : 
- Lecture : Succès
- Écriture : Erreur 403 (pas de privilège `write` sur `products`)

### Étape 10: Modifier un Utilisateur

Imaginons que Bob devient "Senior Analyst" et a besoin d'accès en écriture :

**Créer un nouveau rôle** :

```bash
POST /_security/role/senior_analyst
{
  "cluster": ["monitor", "manage_index_templates", "manage_ilm"],
  "indices": [
    {
      "names": ["products", "orders", "customers"],
      "privileges": ["read", "write", "view_index_metadata"]
    },
    {
      "names": [".kibana*"],
      "privileges": ["all"]
    }
  ]
}
```

**Mettre à jour Bob avec le nouveau rôle** :

```bash
PUT /_security/user/bob_analyst
{
  "roles": ["senior_analyst", "kibana_admin"],
  "full_name": "Bob Senior Analyst",
  "email": "bob@example.com"
}
```

**Tester le nouvel accès** :

```bash
# Maintenant Bob peut écrire
curl -u bob_analyst:AnalystPass456! -X POST "https://localhost:9200/products/_doc" \
  -H 'Content-Type: application/json' \
  -d '{"name":"New Product","price":150,"category":"electronics"}'
```

**Résultat attendu** : Succès (201 Created)

### Étape 11: Désactiver Temporairement un Utilisateur

Désactivons Alice temporairement (ex: congé, investigation sécurité) :

```bash
PUT /_security/user/alice_reader/_disable
```

**Résultat attendu** :
```json
{
  "acknowledged": true
}
```

**Tester que Alice ne peut plus se connecter** :

```bash
curl -u alice_reader:ReadOnlyPass123! "https://localhost:9200/_cluster/health"
```

**Résultat attendu** : Erreur 401 Unauthorized

**Réactiver Alice** :

```bash
PUT /_security/user/alice_reader/_enable
```

### Étape 12: Changer le Mot de Passe

Changeons le mot de passe de Charlie :

```bash
POST /_security/user/charlie_dev/_password
{
  "password": "NewDevPassword2024!"
}
```

**Résultat attendu** :
```json
{
  "acknowledged": true
}
```

**Vérifier que l'ancien mot de passe ne fonctionne plus** :

```bash
# Ancien password : FAIL
curl -u charlie_dev:DevPass789! "https://localhost:9200/"

# Nouveau password : SUCCESS
curl -u charlie_dev:NewDevPassword2024! "https://localhost:9200/"
```

### Validation Finale

Vérifiez que vous avez réussi le lab :

```bash
# 1. Lister tous les rôles personnalisés
GET /_security/role/logs_readonly,data_analyst,developer,senior_analyst

# 2. Lister tous les utilisateurs
GET /_security/user

# 3. Vérifier les privilèges de chaque utilisateur via _authenticate
# (se connecter avec chaque utilisateur et exécuter GET /_security/_authenticate)

# 4. Tester les accès (matrice de tests)
```

**Matrice de tests attendus** :

| Utilisateur | Index logs-* | Index products | Index dev-* | Écriture logs-* | Écriture products |
|-------------|--------------|----------------|-------------|-----------------|-------------------|
| alice_reader | ✅ Read | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| bob_analyst (après update) | ❌ Denied | ✅ Read/Write | ❌ Denied | ❌ Denied | ✅ Write |
| charlie_dev | ❌ Denied | ✅ Read | ✅ All | ❌ Denied | ❌ Denied |

### Points Clés à Retenir

✅ **Privilèges cluster** vs **privilèges index** : Bien comprendre la différence  
✅ **Principe du moindre privilège** : Donner uniquement les accès nécessaires  
✅ `read` permet `_search`, `_get` mais pas `_index`, `_update`, `_delete`  
✅ `write` permet `_index`, `_update`, `_delete` mais pas création d'index  
✅ `all` donne tous les privilèges sur les indices ciblés  
✅ Les patterns (`logs-*`, `dev-*`) permettent de couvrir plusieurs indices  
✅ Les utilisateurs peuvent avoir **plusieurs rôles** (cumul des privilèges)  
✅ `_disable` / `_enable` permettent de désactiver temporairement sans supprimer  
✅ Tester systématiquement les accès après création de rôles  
✅ Utiliser `_security/_authenticate` pour vérifier l'utilisateur actuel

---

