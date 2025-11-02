# Practical Work - Elasticsearch Ops

In this document, we will present the practical part of the Elasticsearch Ops training.

## Lab 1: Cluster Setup and Scaling

To finalize this practical exercise, here are some links that could be useful:

- [Running Elasticsearch Locally](https://www.elastic.co/guide/en/elasticsearch/reference/current/run-elasticsearch-locally.html)
- [Cluster Formation](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery.html)

In this practical part, we will start a multi-node cluster.

### Starting a Second Node

- Retrieve a new `enrollment-token` from the existing node to use it when launching the new node.

```bash
bin/elasticsearch-create-enrollment-token -s node
bin/elasticsearch --enrollment-token <enrollment-token>
```

### Cluster Verification

- Using monitoring APIs, ensure that both nodes are available and communicating properly.

```bash
GET /_cat/nodes?v
GET /_cat/indices?v
```

- Your cluster should now have a `green` status. Why?
- Execute the `GET _cat/shards` request and verify that all shards are correctly assigned.
- Apply a configuration so that shards (primary and replicas) are not placed on the same machine
  (which is the case for now in this training, as we are in a local environment).

### Shard Allocation Testing

- To test the APIs allowing to have an impact on the shard allocation, execute a request to prevent the allocation of our shards
  on one of your two nodes (using the `_name` property for example). The status of your cluster should change.

```bash
PUT _cluster/settings
{
  "persistent" : {
    "cluster.routing.allocation.exclude._name" : "node-1"
  }
}
```

### Cluster Status Verification

Check the cluster status with the following request:

```
GET /_cluster/health
```

Can you explain the result? What changes when you exclude a node from shard allocation?

## Lab 2: Monitoring and Performance Analysis

To finalize this practical exercise, here are some links that could be useful:

- [Cluster APIs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster.html)
- [Monitoring Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/monitor-elasticsearch-cluster.html)

### Cluster Monitoring APIs

Execute the following commands and analyze their outputs:

```bash
GET /_cluster/health
GET /_cluster/stats?human&pretty
GET /_nodes/stats
GET /_cat/indices?v&s=store.size:desc
GET /_cat/shards?v
```

Questions to answer:
- What is the total storage used by your cluster?
- How many documents are indexed?
- Which index uses the most storage?
- Are all shards properly allocated?

### Slow Query Logging

Configure slow query logging for one of your indices:

```bash
PUT /person-v3/_settings
{
  "index.search.slowlog.threshold.query.warn": "500ms",
  "index.search.slowlog.threshold.query.info": "250ms",
  "index.search.slowlog.threshold.fetch.warn": "200ms",
  "index.search.slowlog.threshold.fetch.info": "100ms",
  "index.indexing.slowlog.threshold.index.warn": "1s",
  "index.indexing.slowlog.threshold.index.info": "500ms",
  "index.search.slowlog.level": "info"
}
```

Execute some search queries and check the Elasticsearch logs for slow query entries.

### Thread Pool Monitoring

Monitor the thread pools of your cluster:

```bash
GET /_cat/thread_pool?v&h=id,name,queue,rejected,completed
```

Questions:
- Which thread pools are most active?
- Are there any rejected requests?
- What does this tell you about cluster performance?

### Field Data Cache Monitoring

Monitor field data cache usage:

```bash
GET /_cat/fielddata?v=true
GET /_nodes/stats/indices/fielddata
```

## Lab 3: Index Lifecycle Management (ILM)

To finalize this practical exercise, here are some links that could be useful:

- [ILM Shrink API](https://www.elastic.co/guide/en/elasticsearch/reference/current/ilm-shrink.html)
- [Index Lifecycle Management (ILM)](https://www.elastic.co/guide/en/elasticsearch/reference/current/ilm-index-lifecycle.html)

### Understanding Shrink API

First, create a test index with multiple shards:

```bash
PUT /test-shrink
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 1
  }
}
```

Index some test documents into this index.

Use the `Shrink API` to migrate the index to a new index with only 1 shard and no replica shards:

```bash
# Make the index read-only
PUT /test-shrink/_settings
{
  "settings": {
    "index.blocks.write": true
  }
}

# Shrink the index
POST /test-shrink/_shrink/test-shrink-shrinked
{
  "settings": {
    "index.number_of_replicas": 0,
    "index.number_of_shards": 1,
    "index.codec": "best_compression"
  }
}
```

Verify the new index was created correctly:

```bash
GET /_cat/indices/test-shrink*?v
```

### Creating an ILM Policy

Via the API or via Kibana's graphical interface, create an ILM to perform operations on aging data:

```bash
PUT _ilm/policy/ops_training_policy
{
  "policy": {
    "_meta": {
      "description": "Policy for ops training"
    },
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "50gb"
          }
        }
      },
      "warm": {
        "min_age": "1d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "allocate": {
            "number_of_replicas": 1
          }
        }
      },
      "delete": {
        "min_age": "7d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

### Applying ILM to a Template

Apply this ILM to a new template that you will associate with indexes named `ops-training-*`:

```bash
PUT _index_template/ops_training_template
{
  "index_patterns": ["ops-training-*"],
  "data_stream": { },
  "template": {
    "settings": {
      "number_of_shards": 5,
      "number_of_replicas": 1,
      "index.lifecycle.name": "ops_training_policy"
    }
  }
}
```

Create a data stream and index some documents:

```bash
POST /ops-training-logs/_doc
{
  "@timestamp": "2024-01-01T12:00:00",
  "message": "Test log entry"
}
```

Verify the ILM policy is applied:

```bash
GET /ops-training-logs/_ilm/explain
```

## Lab 4: Alerting

To finalize this practical exercise, here are some links that could be useful:

- [Watcher/Alerting](https://www.elastic.co/guide/en/elasticsearch/reference/current/xpack-alerting.html)
- [Kibana Alerting](https://www.elastic.co/guide/en/kibana/current/alerting-getting-started.html)

In this practical part, we will set up an alerting solution that meets the following criteria:

### Creating an Alert Rule

Via Kibana's interface, create an alert that:

- Runs every 10 minutes
- Checks if there are documents in an index with specific criteria (e.g., error level logs)
- Sends a notification or indexes an alert document when conditions are met

Steps:
1. Navigate to Stack Management > Rules and Connectors
2. Create a new rule with type "Elasticsearch query"
3. Configure the query to detect your condition
4. Set up an action (Index threshold, Slack notification, etc.)

### Testing the Alert

- Index documents that should trigger the alert
- Wait for the alert to execute (or use the "Run now" feature)
- Verify that the alert was triggered and the action was executed

### Advanced: Watcher API

Create a watch using the Watcher API:

```bash
PUT _watcher/watch/cluster_health_watch
{
  "trigger": {
    "schedule": {
      "interval": "10m"
    }
  },
  "input": {
    "http": {
      "request": {
        "host": "localhost",
        "port": 9200,
        "path": "/_cluster/health"
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.status": {
        "eq": "red"
      }
    }
  },
  "actions": {
    "log_error": {
      "logging": {
        "text": "Cluster status is RED!"
      }
    }
  }
}
```

## Lab 5: Security

To finalize this practical exercise, here are some links that could be useful:

- [Securing Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/secure-cluster.html)
- [User Authentication](https://www.elastic.co/guide/en/elasticsearch/reference/current/setting-up-authentication.html)

In this lab, we will implement security on our cluster.

### Creating Roles and Users

Via the API, create a new role that only grants access to specific indices:

```bash
POST /_security/role/ops_readonly
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["person-*", "ops-training-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ]
}
```

Create a new user with the role created previously:

```bash
POST /_security/user/ops_user
{
  "password": "ops_password_123",
  "full_name": "Operations User",
  "email": "ops@example.com",
  "roles": ["ops_readonly"]
}
```

### Testing User Permissions

Ensure that the role and the user created previously are functional:
- They should be able to read from `person-*` indices
- They should not be able to write to those indices
- They should not have access to other indices

Test with:

```bash
# This should work
curl -u ops_user:ops_password_123 -X GET "localhost:9200/person-v3/_search?size=1"

# This should fail
curl -u ops_user:ops_password_123 -X POST "localhost:9200/person-v3/_doc" -H 'Content-Type: application/json' -d'
{
  "name": "Test User"
}
'
```

### Document and Field Level Security

Add constraints to a role on properties and returned documents:

```bash
POST /_security/role/ops_restricted
{
  "indices": [
    {
      "names": ["person-*"],
      "privileges": ["read"],
      "field_security": {
        "grant": ["name", "company", "gender"]
      },
      "query": {
        "match": {
          "isActive": true
        }
      }
    }
  ]
}
```

This role:
- Only grants access to specific fields (name, company, gender)
- Only allows reading documents where `isActive` is true

### Bonus Tasks

- Create a user from the Kibana graphical interface
- Create `spaces` in Kibana and users with access to specific spaces
- Enable audit logging and review security events

## Lab 6: Snapshot and Restore

To finalize this practical exercise, here are some links that could be useful:

- [Snapshot And Restore APIs](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore-apis.html)
- [Snapshot Lifecycle Management](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-lifecycle-management-api.html)

In this lab, we will set up a backup system for our indices.

### Configure Repository

Add the following configuration to the `elasticsearch.yml` configuration file:

```yaml
path:
  repo:
    - ./backups
```

Then restart your node.

### Create a Repository

Create a repository named `my_fs_backup` of type `fs`:

```bash
PUT /_snapshot/my_fs_backup
{
  "type": "fs",
  "settings": {
    "location": "./backups",
    "compress": true
  }
}
```

Verify the repository was created:

```bash
GET /_snapshot/my_fs_backup
```

### Take a Snapshot

Take a snapshot of one or more indices:

```bash
PUT /_snapshot/my_fs_backup/snapshot_1?wait_for_completion=true
{
  "indices": "person-v3,person-v4",
  "ignore_unavailable": true,
  "include_global_state": false,
  "metadata": {
    "taken_by": "ops_training",
    "taken_because": "Training exercise"
  }
}
```

List all snapshots:

```bash
GET /_snapshot/my_fs_backup/_all
```

### Restore from Snapshot

Perform a restore to new indices with a different name:

```bash
POST /_snapshot/my_fs_backup/snapshot_1/_restore
{
  "indices": "person-v3,person-v4",
  "ignore_unavailable": true,
  "include_global_state": false,
  "rename_pattern": "(.+)",
  "rename_replacement": "restored_$1",
  "include_aliases": false
}
```

Verify the restoration:

```bash
GET /_cat/indices/restored_*?v
```

### Snapshot Lifecycle Management (SLM)

Create and execute a Snapshot Lifecycle Management policy:

```bash
PUT _slm/policy/ops_training_snapshots
{
  "schedule": "0 30 1 * * ?",
  "name": "<ops-training-{now/d}>",
  "repository": "my_fs_backup",
  "config": {
    "indices": ["person-*", "ops-training-*"],
    "include_global_state": false
  },
  "retention": {
    "expire_after": "30d",
    "min_count": 5,
    "max_count": 50
  }
}
```

Execute the SLM policy immediately (without waiting for the schedule):

```bash
POST _slm/policy/ops_training_snapshots/_execute
```

Verify the snapshot was created:

```bash
GET /_snapshot/my_fs_backup/_all
```

### Bonus Tasks

- Repeat the same process but from the Kibana interface
- Use the cluster stats API to view statistics about the cluster:

```bash
GET /_cluster/stats?human&pretty
```

- Set up a repository on a cloud provider (S3, Azure Blob Storage, or Google Cloud Storage) if available

## Lab 7: Cluster Troubleshooting

This lab focuses on diagnosing and resolving common cluster issues.

### Unassigned Shards Investigation

If you have unassigned shards, use the allocation explain API:

```bash
GET /_cluster/allocation/explain
{
  "index": "person-v3",
  "shard": 0,
  "primary": true
}
```

Analyze the response to understand why shards are unassigned.

### Disk-Based Shard Allocation

Configure watermark settings:

```bash
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.disk.watermark.low": "85%",
    "cluster.routing.allocation.disk.watermark.high": "90%",
    "cluster.routing.allocation.disk.watermark.flood_stage": "95%",
    "cluster.info.update.interval": "30s"
  }
}
```

### Shard Allocation Awareness

Configure shard allocation awareness using custom attributes:

```bash
# In elasticsearch.yml on different nodes:
# node.attr.rack_id: rack_one
# node.attr.rack_id: rack_two

PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "rack_id"
  }
}
```

### Performance Troubleshooting

1. Check for rejected requests in thread pools
2. Monitor heap usage and garbage collection
3. Identify slow queries using slowlog
4. Analyze field data cache usage
5. Review segment counts and merging activity

Use these APIs:

```bash
GET /_nodes/stats/jvm,thread_pool
GET /_cat/thread_pool?v&h=name,active,queue,rejected,completed
GET /_nodes/stats/indices/segments
```

## Lab 8: Advanced Monitoring with Metricbeat

To finalize this practical exercise, here are some links that could be useful:

- [Monitor Elasticsearch with Metricbeat](https://www.elastic.co/guide/en/elasticsearch/reference/current/monitoring-with-metricbeat.html)

### Set Up Metricbeat

Install Metricbeat and configure it to monitor your Elasticsearch cluster.

Enable monitoring on the cluster:

```bash
PUT _cluster/settings
{
  "persistent": {
    "xpack.monitoring.collection.enabled": true
  }
}
```

Enable the Elasticsearch module in Metricbeat:

```bash
metricbeat modules enable elasticsearch-xpack
```

Configure the module (`modules.d/elasticsearch-xpack.yml`):

```yaml
- module: elasticsearch
  xpack.enabled: true
  period: 10s
  hosts: ["http://localhost:9200"]
  username: "remote_monitoring_user"
  password: "your_password"
```

Configure the output in `metricbeat.yml`:

```yaml
output.elasticsearch:
  hosts: ["http://monitoring-cluster:9200"]
```

Start Metricbeat:

```bash
./metricbeat setup -e
./metricbeat -e
```

### Verify Monitoring Data

Access Kibana and navigate to Stack Monitoring to view:
- Cluster health and performance metrics
- Node statistics
- Index statistics
- Performance graphs

## Lab 9: Production Best Practices

This lab covers various production best practices.

### Heap Size Configuration

Verify heap size settings:
- Heap should be set to 50% of available RAM
- Maximum heap should not exceed 32GB (compressed oops limit)
- Min and max heap should be equal

Check current heap settings:

```bash
GET /_nodes/stats/jvm
```

### Index Template Best Practices

Create a production-ready index template:

```bash
PUT _index_template/production_template
{
  "index_patterns": ["prod-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 2,
      "refresh_interval": "30s",
      "index.codec": "best_compression",
      "index.lifecycle.name": "production_policy"
    },
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        }
      }
    }
  },
  "priority": 200
}
```

### Cluster Settings Review

Review and optimize cluster settings:

```bash
GET /_cluster/settings?include_defaults=true&filter_path=**.search,**.indexing
```

Common settings to consider:
- `indices.recovery.max_bytes_per_sec`: Control recovery speed
- `cluster.routing.allocation.node_concurrent_recoveries`: Limit concurrent recoveries
- `indices.queries.cache.size`: Query cache size

### Node Roles Separation

For production clusters, consider separating node roles:
- Dedicated master nodes (minimum 3)
- Dedicated data nodes (hot, warm, cold tiers)
- Dedicated coordinating nodes (for large clusters)
- Dedicated ingest nodes (if heavy processing)

Example node configuration:

```yaml
# Master node
node.roles: [ master ]

# Hot data node
node.roles: [ data_hot, data_content ]

# Warm data node
node.roles: [ data_warm ]

# Coordinating node
node.roles: [ ]
```
