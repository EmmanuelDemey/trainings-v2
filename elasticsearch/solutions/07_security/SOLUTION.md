# Workshop 7 — Security: solution

For the trainer. Not published: the learners find these themselves.
The CI replays the requests right after the setup of the workshop README.

## Step 1

```json
GET /_security/_authenticate
```

## Step 2

```json
POST /_security/role/logs_readonly
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*", "filebeat-*", "logstash-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "metadata": {
    "description": "Read-only access to logs indices"
  }
}

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
  "metadata": {
    "description": "Developer with full access to dev/test indices"
  }
}
```

## Step 3

```json
POST /_security/user/alice_reader
{
  "password": "ReadOnlyPass123!",
  "roles": ["logs_readonly"],
  "full_name": "Alice Reader",
  "email": "alice@example.com"
}

POST /_security/user/charlie_dev
{
  "password": "DevPass789!",
  "roles": ["developer"],
  "full_name": "Charlie Developer",
  "email": "charlie@example.com"
}
```

## Step 4

`charlie_dev` can create `dev-sandbox` (`all` includes `create_index`), not
`prod-sandbox`: 403.

## Step 5

```json
POST /_security/role/sales_team
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders"],
      "privileges": ["read", "view_index_metadata"],
      "query": {
        "term": { "department": "sales" }
      }
    }
  ],
  "metadata": {
    "description": "Sales team - can only see sales department orders"
  }
}

POST /_security/user/sarah_sales
{
  "password": "SalesPass123!",
  "roles": ["sales_team"],
  "full_name": "Sarah Sales",
  "email": "sarah@example.com"
}
```

A 404: for `sarah_sales`, document `3` does not exist. A 403 would tell her
that it exists — DLS leaks nothing about what it hides.

## Step 6

```json
POST /_security/role/emea_manager
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["orders"],
      "privileges": ["read", "view_index_metadata"],
      "query": {
        "term": { "region": "EMEA" }
      }
    }
  ],
  "metadata": {
    "description": "EMEA regional manager - can only see EMEA region data"
  }
}
```

With both roles, the DLS queries combine with an **OR**: sales **or** EMEA,
4 orders (1, 2, 4, and the EMEA marketing order 3). Roles only ever add access.

## Validation

```json
GET /_security/role/logs_readonly,developer,sales_team,emea_manager

GET /_security/user
```
