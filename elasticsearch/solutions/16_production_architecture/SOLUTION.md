# Workshop 16 — Advanced architecture and production: solution

For the trainer. Not published: the learners find these requests themselves.
The CI replays them right after the setup of the workshop README, and checks
each « Expected result ».

## Part A: Shard allocation awareness

### Step 1

```json
GET /_cat/nodeattrs?v&h=node,attr,value
```

<!-- ci: skip-start -->

The steps 2 to 6 need nodes carrying the `zone` attribute: the CI has none.

### Step 2

```json
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone"
  }
}
```

Elasticsearch avoids putting a replica in the `zone` of its primary.

### Step 3

```json
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone",
    "cluster.routing.allocation.awareness.force.zone.values": "az1,az2,az3"
  }
}
```

- awareness: with a zone down, the replicas of its shards are allocated again in
  the remaining zones — which may overload them;
- forced awareness: Elasticsearch knows which zones should exist, and leaves those
  replicas unassigned until their zone comes back.

### Step 4

```json
PUT /zone-aware-index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}

GET /_cat/shards/zone-aware-index?v&h=index,shard,prirep,state,node
```

Each replica is on a node of another `zone` than its primary.

### Step 5

```json
POST /_cluster/reroute
{
  "commands": [
    {
      "move": {
        "index": "zone-aware-index",
        "shard": 0,
        "from_node": "node-az1",
        "to_node": "node-az2"
      }
    }
  ]
}

GET /_cat/recovery/zone-aware-index?v&h=index,shard,stage,source_node,target_node
```

The move is refused if `node-az2` already holds a copy of shard 0.

### Step 6

```json
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": "node-az1"
  }
}

PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": null
  }
}
```

<!-- ci: skip-end -->

## Part B: Snapshot Lifecycle Management

### Step 1

```json
PUT /_slm/policy/daily-critical-backup
{
  "schedule": "0 0 2 * * ?",
  "name": "<critical-{now/d}>",
  "repository": "my_backup",
  "config": {
    "indices": ["orders-*", "payments-*"],
    "ignore_unavailable": false,
    "include_global_state": false,
    "metadata": {
      "criticality": "high",
      "team": "finance"
    }
  },
  "retention": {
    "expire_after": "90d",
    "min_count": 30,
    "max_count": 120
  }
}
```

**Expected result**:

```json
{ "acknowledged": true }
```

- `"0 0 2 * * ?"`: seconds, minutes, hours, day of month, month, day of week;
- `<critical-{now/d}>` gives `critical-2024.01.15`;
- `metadata` is copied into each snapshot — but `policy` is reserved: SLM writes
  the name of the policy there itself, and refuses the policy otherwise:

<!-- ci: expect-error -->
```json
PUT /_slm/policy/bad-metadata
{
  "schedule": "0 0 2 * * ?",
  "name": "<bad-{now/d}>",
  "repository": "my_backup",
  "config": { "metadata": { "policy": "mine" } }
}
```

- `expire_after`, `min_count`, `max_count`: `min_count` wins over `expire_after`.

### Step 2

```json
PUT /_slm/policy/weekly-analytics-backup
{
  "schedule": "0 0 3 ? * SUN",
  "name": "<analytics-{now/w}>",
  "repository": "my_backup",
  "config": {
    "indices": ["analytics-*"],
    "ignore_unavailable": true,
    "include_global_state": false,
    "metadata": {
      "criticality": "medium",
      "team": "data-science"
    }
  },
  "retention": {
    "expire_after": "180d",
    "min_count": 10,
    "max_count": 52
  }
}
```

### Step 3

```json
PUT /_slm/policy/daily-logs-backup
{
  "schedule": "0 0 1 * * ?",
  "name": "<logs-{now/d}>",
  "repository": "my_backup",
  "config": {
    "indices": ["logs-*"],
    "ignore_unavailable": true,
    "include_global_state": false,
    "partial": true,
    "metadata": {
      "criticality": "low",
      "team": "ops"
    }
  },
  "retention": {
    "expire_after": "14d",
    "min_count": 7,
    "max_count": 30
  }
}
```

### Step 4

```json
GET /_slm/policy

POST /_slm/policy/daily-critical-backup/_execute
POST /_slm/policy/weekly-analytics-backup/_execute
POST /_slm/policy/daily-logs-backup/_execute

GET /_snapshot/my_backup/_all
```

### Step 5

```json
GET /_slm/policy/daily-critical-backup
```

`last_success` (once the snapshot is done), `last_failure`, `next_execution`.

<!-- ci: retry -->
```json
GET /_slm/stats
```

**Expected result**:

```json
{
  "policy_stats": [
    { "policy": "daily-critical-backup" }
  ]
}
```

### Step 6

```json
POST /_slm/_execute_retention

POST /_slm/stop
GET /_slm/status
POST /_slm/start

DELETE /_slm/policy/weekly-analytics-backup
```

Its snapshots stay in the repository, and are no longer cleaned up by any
retention: delete them by hand when needed.

## Part C: Field-Level Security

### Step 1

```json
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
  ]
}
```

**Expected result**:

```json
{ "role": { "created": true } }
```

### Step 2

```json
POST /_security/role/hr_team_view
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["employees_full"],
      "privileges": ["read", "write"],
      "field_security": {
        "grant": ["*"],
        "except": [
          "ssn",
          "disciplinary_notes"
        ]
      }
    }
  ]
}
```

`except` must be a subset of `grant`: with a `grant` that does not cover `ssn`,
excluding it is refused (« Exceptions for field permissions must be a subset of
the granted fields »). `email_*` covers both emails, `address.*` every sub-field.

### Step 3

```json
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
  ]
}
```

### Step 4

```json
POST /_security/user/intern_view
{
  "password": "InternPass123!",
  "roles": ["employee_public_view"],
  "full_name": "Intern Viewer"
}

POST /_security/user/jane_hr
{
  "password": "HRPass456!",
  "roles": ["hr_team_view"],
  "full_name": "Jane HR Specialist"
}

POST /_security/user/susan_hrmanager
{
  "password": "ManagerPass789!",
  "roles": ["hr_manager_full"],
  "full_name": "Susan HR Manager"
}
```

**Expected result**:

```json
{ "created": true }
```

```bash
curl -u jane_hr:HRPass456! "https://localhost:9200/employees_full/_doc/1?pretty"
curl -u susan_hrmanager:ManagerPass789! "https://localhost:9200/employees_full/_doc/2?pretty"

curl -u intern_view:InternPass123! -X GET "https://localhost:9200/employees_full/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{"size":0,"aggs":{"avg_salary":{"avg":{"field":"salary"}}}}'
```

- `intern_view` sees the 7 granted fields, `jane_hr` everything but `ssn` and
  `disciplinary_notes`, `susan_hrmanager` everything;
- the average salary is `null` for `intern_view` — for them `salary` does not
  exist — and `76666.66…` for `jane_hr`;
- no: FLS filters `_source` of a get as well as of a search.

### Step 5

```json
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
  ]
}

POST /_security/user/sales_viewer
{
  "password": "SalesView123!",
  "roles": ["sales_dept_restricted"]
}
```

```bash
curl -u sales_viewer:SalesView123! "https://localhost:9200/employees_full/_search?pretty"
```

## Part D: A complete production architecture

### Sizing

- 500 GB/day × 90 days = 45 TB in all (before replicas)
- hot (7 days): 3.5 TB — warm (30 days): 15 TB — cold (53 days): 26.5 TB

| Tier | Nodes | RAM | CPU | Disk | Total disk |
|------|-------|-----|-----|------|------------|
| Master | 3 | 8 GB | 4 cores | 100 GB | 300 GB |
| Hot | 6 | 32 GB | 16 cores | 1 TB SSD | 6 TB |
| Warm | 4 | 16 GB | 8 cores | 5 TB HDD | 20 TB |
| Cold | 3 | 8 GB | 4 cores | 12 TB HDD | 36 TB |

16 nodes in all. Over two zones:

```text
ZONE A                           ZONE B
  Master-A1                        Master-B1
  Master-A2                        Master-B2

HOT TIER (SSD, 7 days)
  Hot-A1  Hot-A2    Hot-B1  Hot-B2  Hot-B3  Hot-A3

WARM TIER (HDD, 30 days)
  Warm-A1  Warm-A2    Warm-B1  Warm-B2

COLD TIER (searchable snapshots, 53 days)
  Cold-A1    Cold-B1  Cold-B2
```

With two zones, losing the zone that holds two masters loses the quorum: a third
zone, even a small one holding a voting-only master, is safer.

### The ILM policy

```json
PUT _ilm/policy/logs-lifecycle
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_primary_shard_size": "30GB",
            "max_age": "1d"
          },
          "set_priority": { "priority": 100 }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "set_priority": { "priority": 50 },
          "migrate": { "enabled": true },
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 },
          "readonly": {}
        }
      },
      "cold": {
        "min_age": "37d",
        "actions": {
          "set_priority": { "priority": 0 },
          "migrate": { "enabled": true },
          "searchable_snapshot": {
            "snapshot_repository": "s3_backup",
            "force_merge_index": true
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {
            "delete_searchable_snapshot": true
          }
        }
      }
    }
  }
}
```

**Expected result**:

```json
{ "acknowledged": true }
```

### The index template

```json
PUT _index_template/logs-myapp-template
{
  "index_patterns": ["logs-myapp-*"],
  "data_stream": {},
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-lifecycle"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "message": { "type": "text" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "host": { "type": "keyword" }
      }
    }
  },
  "priority": 500
}
```

Elasticsearch ships a `logs` template on `logs-*-*` (priority 100), used by
Elastic Agent, which turns LogsDB on. A `logs-*` template of priority 500 would
hide it for **every** log source. Follow `logs-<dataset>-<namespace>` instead:
`logs-myapp-production`, `logs-myapp-staging`… And no rollover alias: it is a
data stream.

### The SLM policy

```json
PUT _slm/policy/daily-snapshots
{
  "schedule": "0 30 2 * * ?",
  "name": "<logs-{now/d}>",
  "repository": "s3_backup",
  "config": {
    "indices": ["logs-*"],
    "ignore_unavailable": true,
    "include_global_state": false
  },
  "retention": {
    "expire_after": "7d",
    "min_count": 7,
    "max_count": 30
  }
}
```

The data itself is kept 90 days by ILM — and the cold tier already lives in the
repository as searchable snapshots. The snapshots protect against a disaster or a
mistake: a week of them is enough to restore.
