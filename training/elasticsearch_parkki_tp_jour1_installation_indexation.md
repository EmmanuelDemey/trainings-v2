# Elasticsearch Parkki Training - Practical Exercises

## Overview

Each exercise is **autonomous** - you can complete them in any order without dependencies on other exercises.

All exercises use the Kibana Dev Tools console. Access it at: `http://localhost:5601/app/dev_tools#/console`

---

# Part 2: Installation and Configuration

## Exercise 2.1: Starting Elasticsearch and Kibana - Local Installation

**Objective**: Install and start Elasticsearch and Kibana locally, then verify they're running correctly.

### Step 1: Install and Start Elasticsearch

```bash
# Download and extract Elasticsearch
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-9.0.0-linux-x86_64.tar.gz
tar -xzf elasticsearch-9.0.0-linux-x86_64.tar.gz
cd elasticsearch-9.0.0

# Configure Elasticsearch for single-node (edit config/elasticsearch.yml)
echo "discovery.type: single-node" >> config/elasticsearch.yml
echo "xpack.security.enabled: false" >> config/elasticsearch.yml

# Start Elasticsearch (in the background or in a separate terminal)
./bin/elasticsearch
```

**Note**: Keep this terminal open or run in background. Elasticsearch will start on port 9200.

### Step 2: Install and Start Kibana

Open a **new terminal** window:

```bash
# Download and extract Kibana
wget https://artifacts.elastic.co/downloads/kibana/kibana-9.0.0-linux-x86_64.tar.gz
tar -xzf kibana-9.0.0-linux-x86_64.tar.gz
cd kibana-9.0.0

# Configure Kibana to connect to Elasticsearch (edit config/kibana.yml)
echo "elasticsearch.hosts: ['http://localhost:9200']" >> config/kibana.yml

# Start Kibana
./bin/kibana
```

**Note**: Kibana will start on port 5601. Wait 1-2 minutes for full startup.

### Step 3: Verify Installation

**Check Elasticsearch is running:**
```bash
# In a new terminal, check Elasticsearch
curl http://localhost:9200

# You should see JSON output with cluster info and version 9.0.0
```

**Check Kibana is running:**
```bash
# Check Kibana status
curl http://localhost:5601/api/status

# Or simply open in browser
# http://localhost:5601
```

Wait 30-60 seconds for full startup, then open Kibana Dev Tools: `http://localhost:5601/app/dev_tools#/console`

**In Kibana Dev Tools, run:**
```bash
# Check Elasticsearch is responding
GET /

# Check cluster health
GET /_cluster/health

# List all nodes
GET /_cat/nodes?v
```

**Expected Results**:
- Elasticsearch responds on port 9200
- Kibana interface is accessible on port 5601
- Cluster status should be `green` or `yellow`
- At least one node should be listed
- Version should be 9.x

### Step 4: Explore Cluster Information

```bash
# Get detailed cluster info
GET /_cluster/health?level=indices

# Check cluster UUID and name
GET /_cluster/state?filter_path=cluster_name,cluster_uuid

# View cluster settings
GET /_cluster/settings?include_defaults=true&flat_settings=true&filter_path=defaults.cluster.name
```

**Challenge**: What is your cluster's UUID? What is the default cluster name?

---

## Exercise 2.2: Node Configuration Analysis

**Objective**: Understand your node configuration and identify potential issues.

**Instructions**:

1. Get detailed node information:
```bash
GET /_nodes?filter_path=nodes.*.name,nodes.*.roles,nodes.*.jvm.mem,nodes.*.os.name
```

2. Check current settings:
```bash
GET /_cluster/settings?include_defaults=true&filter_path=defaults.cluster.routing
```

3. Analyze JVM configuration:
```bash
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.heap_used_percent,nodes.*.jvm.mem.heap_max_in_bytes
```

4. Check thread pools:
```bash
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected,completed
```

---

# Part 3: Indexing

## Exercise 3.1: Create and Index Documents with Validation

**Objective**: Practice document indexing with error handling and validation.

**Instructions**:

1. Create an index with specific settings:
```bash
PUT /products
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "5s"
  }
}
```

2. Index documents with explicit IDs:
```bash
POST /products/_doc/1
{
  "name": "Parking Sensor",
  "category": "electronics",
  "price": 29.99,
  "in_stock": true,
  "tags": ["sensor", "iot", "parking"],
  "created_at": "2025-01-15T10:00:00Z"
}

POST /products/_doc/2
{
  "name": "Parking Barrier",
  "category": "hardware",
  "price": 199.99,
  "in_stock": true,
  "tags": ["barrier", "access-control"],
  "created_at": "2025-01-15T11:00:00Z"
}

POST /products/_doc/3
{
  "name": "Access Card Reader",
  "category": "electronics",
  "price": 89.99,
  "in_stock": false,
  "tags": ["rfid", "access-control"],
  "created_at": "2025-01-14T09:00:00Z"
}
```

3. Verify document count and check auto-generated mapping:
```bash
GET /products/_count

GET /products/_mapping
```

4. Retrieve a specific document:
```bash
GET /products/_doc/1
```

5. Check if a document exists (without fetching it):
```bash
HEAD /products/_doc/1
```

**Challenge**:
- What type did Elasticsearch assign to the `price` field?
- What type was assigned to `tags`?
- Try indexing a document with `price: "not a number"` - what happens?

---

## Exercise 3.2: Bulk Indexing with Error Analysis

**Objective**: Practice efficient bulk indexing and understand error handling.

**Instructions**:

1. Use the Bulk API to index multiple documents:
```bash
POST /_bulk
{"index":{"_index":"logs-parkki","_id":"1"}}
{"@timestamp":"2025-01-15T10:00:00Z","level":"INFO","service":"parking-api","message":"User logged in","user_id":"user123","response_time_ms":45}
{"index":{"_index":"logs-parkki","_id":"2"}}
{"@timestamp":"2025-01-15T10:00:05Z","level":"INFO","service":"parking-api","message":"Parking spot reserved","user_id":"user123","spot_id":"A15","response_time_ms":120}
{"index":{"_index":"logs-parkki","_id":"3"}}
{"@timestamp":"2025-01-15T10:00:10Z","level":"ERROR","service":"payment-service","message":"Payment failed","user_id":"user456","error_code":"CARD_DECLINED","response_time_ms":2500}
{"index":{"_index":"logs-parkki","_id":"4"}}
{"@timestamp":"2025-01-15T10:00:15Z","level":"WARN","service":"parking-api","message":"Spot almost full","parking_id":"parking-central","occupancy_percent":95}
{"index":{"_index":"logs-parkki","_id":"5"}}
{"@timestamp":"2025-01-15T10:00:20Z","level":"INFO","service":"notification-service","message":"Email sent","user_id":"user123","response_time_ms":350}
{"index":{"_index":"logs-parkki","_id":"6"}}
{"@timestamp":"2025-01-15T10:00:25Z","level":"DEBUG","service":"parking-api","message":"Cache hit for parking status","cache_key":"parking-central-status"}
{"index":{"_index":"logs-parkki","_id":"7"}}
{"@timestamp":"2025-01-15T10:00:30Z","level":"ERROR","service":"parking-api","message":"Database connection timeout","error_code":"DB_TIMEOUT","response_time_ms":30000}
```

2. Analyze the bulk response - check for errors:
```bash
GET /logs-parkki/_count

GET /logs-parkki/_search
{
  "size": 0
}
```

3. Test bulk with intentional errors:
```bash
POST /_bulk
{"index":{"_index":"logs-parkki","_id":"100"}}
{"@timestamp":"invalid-date","level":"INFO","message":"This should fail"}
{"index":{"_index":"logs-parkki","_id":"101"}}
{"@timestamp":"2025-01-15T10:00:00Z","level":"INFO","message":"This should succeed"}
```

**Challenge**:
- How many documents were indexed successfully?
- Did the invalid date cause the entire bulk to fail, or just that document?

---

## Exercise 3.3: Document Operations (CRUD) with Concurrency

**Objective**: Practice update, delete, and optimistic concurrency control.

**Instructions**:

1. Create a reservation document:
```bash
PUT /reservations/_doc/res001
{
  "user_id": "user123",
  "parking_id": "parking-central",
  "spot_id": "A15",
  "start_time": "2025-01-15T14:00:00Z",
  "end_time": "2025-01-15T18:00:00Z",
  "status": "pending",
  "price": 12.50,
  "version": 1
}
```

2. Get the document with sequence numbers (for optimistic locking):
```bash
GET /reservations/_doc/res001
```

3. Update using optimistic concurrency control:
```bash
# First, note the _seq_no and _primary_term from the GET response
# Then update with those values:
POST /reservations/_update/res001?if_seq_no=0&if_primary_term=1
{
  "doc": {
    "status": "confirmed",
    "confirmed_at": "2025-01-15T10:30:00Z"
  }
}
```


4. Update with script (atomic increment):
```bash
POST /reservations/_update/res001
{
  "script": {
    "source": "ctx._source.version += 1; ctx._source.price *= params.multiplier",
    "params": {
      "multiplier": 1.1
    }
  }
}
```

5. Upsert (update or insert):
```bash
POST /reservations/_update/res002
{
  "doc": {
    "user_id": "user456",
    "status": "pending"
  },
  "doc_as_upsert": true
}
```

6. Delete with refresh:
```bash
DELETE /reservations/_doc/res002?refresh=true

# Verify deletion
GET /reservations/_doc/res002
```

**Challenge**:
- What HTTP status code do you get for a version conflict?
- What is the new price after the script update (with 1.1 multiplier)?
- Create a script that only updates if status is "pendingx"

---

# Part 4: Mapping

## Exercise 4.1: Explicit Mapping with Analyzers

**Objective**: Create an optimized mapping for parking logs with custom analysis.

**Instructions**:

1. First, test the analyzer behavior:
```bash
POST /_analyze
{
  "analyzer": "standard",
  "text": "The user user-123 parked at PARKING-CENTRAL spot A15"
}

POST /_analyze
{
  "analyzer": "simple",
  "text": "The user user-123 parked at PARKING-CENTRAL spot A15"
}
```

2. Create an index with explicit mapping and custom settings:
```bash
PUT /parking-events
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "analyzer": {
        "parking_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding"]
        }
      }
    }
  },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "@timestamp": { "type": "date" },
      "event_type": { "type": "keyword" },
      "parking_id": { "type": "keyword" },
      "spot_id": { "type": "keyword" },
      "user_id": { "type": "keyword" },
      "vehicle_plate": {
        "type": "keyword",
        "normalizer": "lowercase"
      },
      "duration_minutes": { "type": "integer" },
      "amount": {
        "type": "scaled_float",
        "scaling_factor": 100
      },
      "description": {
        "type": "text",
        "analyzer": "parking_analyzer",
        "fields": {
          "keyword": { "type": "keyword", "ignore_above": 256 }
        }
      },
      "location": { "type": "geo_point" },
      "metadata": {
        "type": "object",
        "enabled": false
      }
    }
  }
}
```

3. Verify the mapping:
```bash
GET /parking-events/_mapping
```

4. Index valid documents:
```bash
POST /parking-events/_doc
{
  "@timestamp": "2025-01-15T14:30:00Z",
  "event_type": "ENTRY",
  "parking_id": "parking-central",
  "spot_id": "B22",
  "user_id": "user789",
  "vehicle_plate": "AB-123-CD",
  "duration_minutes": 120,
  "amount": 8.50,
  "description": "Standard parking entry via mobile app with préférence",
  "location": { "lat": 48.8566, "lon": 2.3522 },
  "metadata": { "app_version": "2.1.0", "device": "iPhone" }
}
```

5. Test strict mapping - try to add an unknown field:
```bash
POST /parking-events/_doc
{
  "@timestamp": "2025-01-15T15:00:00Z",
  "event_type": "EXIT",
  "unknown_field": "this should fail"
}
```

**Challenge**:
- What happens when you try to index a document with an unknown field?
- Search for "preference" (without accent) - does it find the document with "préférence"?
- What is the advantage of `scaled_float` over `float` for monetary amounts?

---

## Exercise 4.2: Multi-fields and Aggregation Optimization

**Objective**: Use multi-fields for flexible searching and efficient aggregations.

**Instructions**:

1. Create an index with optimized multi-fields:
```bash
PUT /parking-lots
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "normalizer": "lowercase"
          },
          "autocomplete": {
            "type": "search_as_you_type"
          }
        }
      },
      "address": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "city": { "type": "keyword" },
      "country": { "type": "keyword" },
      "capacity": { "type": "integer" },
      "available_spots": { "type": "integer" },
      "hourly_rate": { "type": "float" },
      "features": { "type": "keyword" },
      "location": { "type": "geo_point" },
      "rating": { "type": "half_float" }
    }
  }
}
```

2. Index sample data:
```bash
POST /_bulk
{"index":{"_index":"parking-lots"}}
{"name":"Parking Central Paris","address":"15 Rue de Rivoli","city":"Paris","country":"France","capacity":500,"available_spots":123,"hourly_rate":4.50,"features":["ev_charging","handicap","covered"],"location":{"lat":48.8606,"lon":2.3376},"rating":4.2}
{"index":{"_index":"parking-lots"}}
{"name":"Parking Gare du Nord","address":"18 Rue de Dunkerque","city":"Paris","country":"France","capacity":300,"available_spots":45,"hourly_rate":5.00,"features":["covered","24h"],"location":{"lat":48.8809,"lon":2.3553},"rating":3.8}
{"index":{"_index":"parking-lots"}}
{"name":"Parking Place Bellecour","address":"Place Bellecour","city":"Lyon","country":"France","capacity":400,"available_spots":200,"hourly_rate":3.50,"features":["ev_charging","covered"],"location":{"lat":45.7578,"lon":4.8320},"rating":4.5}
{"index":{"_index":"parking-lots"}}
{"name":"Parking Centre Commercial","address":"Avenue des Champs","city":"Nice","country":"France","capacity":800,"available_spots":500,"hourly_rate":3.00,"features":["covered","free_first_hour"],"location":{"lat":43.7102,"lon":7.2620},"rating":4.0}
{"index":{"_index":"parking-lots"}}
{"name":"PARKING GARE LYON","address":"Place Louis Armand","city":"Paris","country":"France","capacity":600,"available_spots":89,"hourly_rate":6.00,"features":["ev_charging","24h","valet"],"location":{"lat":48.8448,"lon":2.3735},"rating":4.1}
```

3. Test autocomplete (search-as-you-type):
```bash
GET /parking-lots/_search
{
  "query": {
    "multi_match": {
      "query": "park cen",
      "type": "bool_prefix",
      "fields": ["name.autocomplete", "name.autocomplete._2gram", "name.autocomplete._3gram"]
    }
  }
}
```


4. Compare text vs keyword search:
```bash
# Full-text search (matches partial words)
GET /parking-lots/_search
{
  "query": {
    "match": {
      "name": "parking gare"
    }
  }
}

# Exact match on normalized keyword
GET /parking-lots/_search
{
  "query": {
    "term": {
      "name.keyword": "parking gare lyon"
    }
  }
}
```

**Challenge**:
- Why does "parking gare lyon" (lowercase) match "PARKING GARE LYON"?
- How many parking lots have EV charging?

---

## Exercise 4.3: Nested Objects vs Flattened

**Objective**: Understand when to use nested types and their performance implications.

**Instructions**:

1. First, create an index WITHOUT nested (to see the problem):
```bash
PUT /parking-flat
{
  "mappings": {
    "properties": {
      "name": { "type": "keyword" },
      "spots": {
        "properties": {
          "spot_id": { "type": "keyword" },
          "floor": { "type": "integer" },
          "type": { "type": "keyword" },
          "available": { "type": "boolean" }
        }
      }
    }
  }
}

POST /parking-flat/_doc
{
  "name": "Parking Central",
  "spots": [
    { "spot_id": "A01", "floor": 1, "type": "standard", "available": true },
    { "spot_id": "A02", "floor": 1, "type": "handicap", "available": false },
    { "spot_id": "B01", "floor": 2, "type": "standard", "available": false }
  ]
}
```

2. Search for "available standard spot on floor 1" (THIS IS THE PROBLEM):
```bash
GET /parking-flat/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "spots.floor": 1 } },
        { "term": { "spots.type": "standard" } },
        { "term": { "spots.available": false } }
      ]
    }
  }
}
```

3. Now create with NESTED type:
```bash
PUT /parking-nested
{
  "mappings": {
    "properties": {
      "name": { "type": "keyword" },
      "spots": {
        "type": "nested",
        "properties": {
          "spot_id": { "type": "keyword" },
          "floor": { "type": "integer" },
          "type": { "type": "keyword" },
          "available": { "type": "boolean" },
          "price_per_hour": { "type": "float" }
        }
      }
    }
  }
}

POST /parking-nested/_doc/1
{
  "name": "Parking Central",
  "spots": [
    { "spot_id": "A01", "floor": 1, "type": "standard", "available": true, "price_per_hour": 3.0 },
    { "spot_id": "A02", "floor": 1, "type": "handicap", "available": false, "price_per_hour": 2.0 },
    { "spot_id": "B01", "floor": 2, "type": "standard", "available": false, "price_per_hour": 2.5 }
  ]
}

POST /parking-nested/_doc/2
{
  "name": "Parking Nord",
  "spots": [
    { "spot_id": "N01", "floor": 1, "type": "ev_charging", "available": true, "price_per_hour": 4.0 },
    { "spot_id": "N02", "floor": 1, "type": "standard", "available": true, "price_per_hour": 3.0 }
  ]
}
```

4. Correct nested query:
```bash
GET /parking-nested/_search
{
  "query": {
    "nested": {
      "path": "spots",
      "query": {
        "bool": {
          "must": [
            { "term": { "spots.floor": 1 } },
            { "term": { "spots.type": "standard" } },
            { "term": { "spots.available": true } }
          ]
        }
      },
      "inner_hits": {}
    }
  }
}
```


**Challenge**:
- Why did the flat structure query return a result even though there's no available standard spot on floor 1?
- What does `inner_hits` show in the nested query response?

---

## Exercise 4.4: Index Templates with Priority

**Objective**: Create reusable index templates with component composition.

**Instructions**:

1. Create component templates:
```bash
# Base settings component
PUT /_component_template/base-settings
{
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "refresh_interval": "30s"
    }
  }
}

# Logs mappings component
PUT /_component_template/logs-mappings
{
  "template": {
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "message": {
          "type": "text",
          "fields": {
            "keyword": { "type": "keyword", "ignore_above": 512 }
          }
        },
        "service": { "type": "keyword" },
        "host": { "type": "keyword" },
        "trace_id": { "type": "keyword" }
      }
    }
  }
}

# Parkki-specific mappings component
PUT /_component_template/parkki-mappings
{
  "template": {
    "mappings": {
      "properties": {
        "parking_id": { "type": "keyword" },
        "user_id": { "type": "keyword" },
        "spot_id": { "type": "keyword" },
        "transaction_id": { "type": "keyword" }
      }
    }
  }
}
```

2. Create index templates with different priorities:
```bash
# General logs template (low priority)
PUT /_index_template/logs-template
{
  "index_patterns": ["parkki-logs-*"],
  "priority": 100,
  "composed_of": ["base-settings", "logs-mappings"],
  "template": {
    "aliases": {
      "logs": {}
    }
  }
}

# Parkki-specific logs template (higher priority)
PUT /_index_template/logs-parkki-template
{
  "index_patterns": ["logs-parkki-*"],
  "priority": 200,
  "composed_of": ["base-settings", "logs-mappings", "parkki-mappings"],
  "template": {
    "settings": {
      "index.lifecycle.name": "logs-lifecycle"
    },
    "aliases": {
      "logs": {},
      "parkki-logs": {}
    }
  }
}
```

3. Create indices and verify templates are applied:
```bash
# Create a general log index
PUT /logs-nginx-2025.01.15

# Create a Parkki log index
PUT /logs-parkki-api-2025.01.15

# Verify mappings
GET /logs-nginx-2025.01.15/_mapping
GET /logs-parkki-api-2025.01.15/_mapping
```

4. Check which template was applied:
```bash
GET /_index_template/logs-*

# Simulate which template would match
POST /_index_template/_simulate_index/logs-parkki-test
```

5. Index documents and verify aliases:
```bash
POST /logs-parkki-api-2025.01.15/_doc
{
  "@timestamp": "2025-01-15T10:00:00Z",
  "level": "INFO",
  "message": "User reservation completed",
  "service": "parking-api",
  "parking_id": "central",
  "user_id": "user123"
}

# Search via alias
GET /parkki-logs/_search
```

**Challenge**:
- Which template is applied to `logs-parkki-api-2025.01.15`? How do you know?
- Does `logs-nginx-2025.01.15` have the `parking_id` field in its mapping?
- What happens if you create `logs-other-2025.01.15`?

---

# Part 5: Search

## Exercise 5.1: Full-Text Search with Relevance Tuning

**Objective**: Practice full-text search queries and understand scoring.

**Setup**: Create and populate a test index:
```bash
PUT /articles
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "content": { "type": "text" },
      "summary": { "type": "text" },
      "author": { "type": "keyword" },
      "category": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "published_at": { "type": "date" },
      "views": { "type": "integer" }
    }
  }
}

POST /_bulk
{"index":{"_index":"articles","_id":"1"}}
{"title":"Smart Parking Solutions for Modern Cities","content":"Urban parking management is evolving with IoT sensors and mobile applications. Smart parking reduces congestion and emissions by helping drivers find available spots quickly. The technology uses real-time data to optimize parking space utilization.","summary":"How IoT is transforming urban parking","author":"John Smith","category":"technology","tags":["iot","smart-city","parking"],"published_at":"2025-01-10","views":1520}
{"index":{"_index":"articles","_id":"2"}}
{"title":"The Future of Electric Vehicle Charging","content":"Electric vehicles need dedicated parking spots with charging stations. Smart cities are adapting their parking infrastructure to accommodate the growing EV market. Parking operators are investing in fast-charging technology.","summary":"EV charging infrastructure in parking facilities","author":"Jane Doe","category":"sustainability","tags":["ev","charging","parking"],"published_at":"2025-01-12","views":2340}
{"index":{"_index":"articles","_id":"3"}}
{"title":"Parking Revenue Optimization Strategies","content":"Dynamic pricing and real-time availability can increase parking revenue by 30%. Mobile payment integration is key for modern parking operations. Data analytics helps identify peak hours and optimize pricing.","summary":"Maximize parking business revenue","author":"John Smith","category":"business","tags":["revenue","pricing","analytics"],"published_at":"2025-01-14","views":890}
{"index":{"_index":"articles","_id":"4"}}
{"title":"Autonomous Vehicles and Parking Design","content":"Self-driving cars will revolutionize parking lot design. Autonomous vehicles can park themselves more efficiently, requiring less space. Future parking structures may look very different from today.","summary":"How AVs will change parking architecture","author":"Alex Johnson","category":"technology","tags":["autonomous","future","design"],"published_at":"2025-01-15","views":3100}
```

**Instructions**:

1. Simple match query with score explanation:
```bash
GET /articles/_search
{
  "explain": true,
  "query": {
    "match": {
      "content": "parking mobile"
    }
  }
}
```

2. Match with operator control:
```bash
# Must match ALL terms
GET /articles/_search
{
  "query": {
    "match": {
      "content": {
        "query": "parking mobile",
        "operator": "and"
      }
    }
  }
}

# Must match at least 2 terms
GET /articles/_search
{
  "query": {
    "match": {
      "content": {
        "query": "parking mobile charging",
        "minimum_should_match": 2
      }
    }
  }
}
```

3. Multi-match with field boosting:
```bash
GET /articles/_search
{
  "query": {
    "multi_match": {
      "query": "smart parking",
      "fields": ["title^3", "summary^2", "content"],
      "type": "best_fields",
      "tie_breaker": 0.3
    }
  }
}
```

4. Phrase matching with slop:
```bash
# Exact phrase
GET /articles/_search
{
  "query": {
    "match_phrase": {
      "content": "parking management"
    }
  }
}

# Allow words between
GET /articles/_search
{
  "query": {
    "match_phrase": {
      "content": {
        "query": "parking technology",
        "slop": 5
      }
    }
  }
}
```

5. Function score to boost by popularity:
```bash
GET /articles/_search
{
  "query": {
    "function_score": {
      "query": {
        "match": { "content": "parking" }
      },
      "functions": [
        {
          "field_value_factor": {
            "field": "views",
            "factor": 0.0001,
            "modifier": "log1p"
          }
        }
      ],
      "boost_mode": "multiply"
    }
  }
}
```

**Challenge**:
- Which article has the highest score for "parking mobile"? Why?
- How does the `tie_breaker` affect multi_match results?
- Boost articles from "John Smith" by 2x using a function score

---

## Exercise 5.2: Term-Level and Range Queries

**Objective**: Practice exact matching, ranges, and existence queries.

**Setup**: Use the `articles` index from Exercise 5.1.

**Instructions**:

1. Term query with case sensitivity awareness:
```bash
# This works (keyword field)
GET /articles/_search
{
  "query": {
    "term": {
      "author": "John Smith"
    }
  }
}

# This might not work as expected on text field
GET /articles/_search
{
  "query": {
    "term": {
      "title": "Smart"
    }
  }
}

# Use keyword sub-field for exact match
GET /articles/_search
{
  "query": {
    "term": {
      "title.keyword": "Smart Parking Solutions for Modern Cities"
    }
  }
}
```

2. Terms query with minimum match:
```bash
GET /articles/_search
{
  "query": {
    "terms": {
      "tags": ["parking", "iot", "ev"]
    }
  }
}

# With terms_set for minimum matching
GET /articles/_search
{
  "query": {
    "terms_set": {
      "tags": {
        "terms": ["parking", "iot", "ev"],
        "minimum_should_match_script": {
          "source": "2"
        }
      }
    }
  }
}
```

3. Range queries with different bounds:
```bash
# Date range
GET /articles/_search
{
  "query": {
    "range": {
      "published_at": {
        "gte": "2025-01-11",
        "lt": "2025-01-15",
        "format": "yyyy-MM-dd"
      }
    }
  }
}

# Numeric range with boost
GET /articles/_search
{
  "query": {
    "range": {
      "views": {
        "gte": 1000,
        "boost": 2.0
      }
    }
  }
}
```

4. Exists and missing:
```bash
# Documents with tags
GET /articles/_search
{
  "query": {
    "exists": {
      "field": "tags"
    }
  }
}

# Documents without a specific field (must_not exists)
GET /articles/_search
{
  "query": {
    "bool": {
      "must_not": {
        "exists": {
          "field": "deleted_at"
        }
      }
    }
  }
}
```

5. Prefix and wildcard:
```bash
# Prefix query
GET /articles/_search
{
  "query": {
    "prefix": {
      "category": "tech"
    }
  }
}

# Wildcard (use sparingly!)
GET /articles/_search
{
  "query": {
    "wildcard": {
      "author": "*Smith"
    }
  }
}
```

**Challenge**:
- Why does `term` on the `title` field not find "Smart" but works on `author`?
- Find all articles with more than 1500 views published after January 12th
- Which articles have at least 2 of these tags: parking, iot, ev?

---

## Exercise 5.3: Boolean Queries with Scoring Control

**Objective**: Master complex boolean queries and understand scoring contexts.

**Setup**: Use the `articles` index.

**Instructions**:

1. Bool query with all clauses:
```bash
GET /articles/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "content": "parking" } }
      ],
      "should": [
        { "term": { "category": "technology" } },
        { "term": { "category": "sustainability" } },
        { "range": { "views": { "gte": 2000 } } }
      ],
      "must_not": [
        { "term": { "author": "Alex Johnson" } }
      ],
      "filter": [
        { "range": { "published_at": { "gte": "2025-01-01" } } },
        { "exists": { "field": "tags" } }
      ],
      "minimum_should_match": 1
    }
  }
}
```

2. Understand filter vs query context:
```bash
# This query scores based on views
GET /articles/_search
{
  "query": {
    "bool": {
      "must": [
        { "range": { "views": { "gte": 1000 } } }
      ]
    }
  }
}

# This filter does NOT affect score
GET /articles/_search
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "views": { "gte": 1000 } } }
      ]
    }
  }
}
```

3. Nested bool queries:
```bash
GET /articles/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "content": "parking" } }
      ],
      "should": [
        {
          "bool": {
            "must": [
              { "term": { "category": "technology" } },
              { "range": { "views": { "gte": 1500 } } }
            ]
          }
        },
        {
          "bool": {
            "must": [
              { "term": { "category": "sustainability" } },
              { "term": { "author": "Jane Doe" } }
            ]
          }
        }
      ],
      "minimum_should_match": 1
    }
  }
}
```

4. Boosting query (positive and negative):
```bash
GET /articles/_search
{
  "query": {
    "boosting": {
      "positive": {
        "match": { "content": "parking" }
      },
      "negative": {
        "term": { "category": "business" }
      },
      "negative_boost": 0.5
    }
  }
}
```


**Challenge**:
- What's the score difference between filter and query context for the same range query?
- Build a query: articles about parking, preferably technology OR sustainability category, excluding business, from 2025
- How would you give technology articles double the score of sustainability articles?

---

## Exercise 5.4: Geo Queries and Distance Calculations

**Objective**: Practice geographical searches with complex constraints.

**Setup**: Create a geo-enabled index:
```bash
PUT /parking-locations
{
  "mappings": {
    "properties": {
      "name": { "type": "keyword" },
      "location": { "type": "geo_point" },
      "coverage_area": { "type": "geo_shape" },
      "capacity": { "type": "integer" },
      "available": { "type": "integer" },
      "hourly_rate": { "type": "float" },
      "features": { "type": "keyword" }
    }
  }
}

POST /_bulk
{"index":{"_index":"parking-locations"}}
{"name":"Parking Opera","location":{"lat":48.8719,"lon":2.3316},"capacity":200,"available":45,"hourly_rate":5.50,"features":["covered","ev_charging"]}
{"index":{"_index":"parking-locations"}}
{"name":"Parking Louvre","location":{"lat":48.8606,"lon":2.3376},"capacity":500,"available":120,"hourly_rate":6.00,"features":["covered","24h","valet"]}
{"index":{"_index":"parking-locations"}}
{"name":"Parking Bastille","location":{"lat":48.8534,"lon":2.3691},"capacity":300,"available":80,"hourly_rate":4.00,"features":["outdoor","motorcycle"]}
{"index":{"_index":"parking-locations"}}
{"name":"Parking Montmartre","location":{"lat":48.8867,"lon":2.3431},"capacity":150,"available":10,"hourly_rate":4.50,"features":["covered"]}
{"index":{"_index":"parking-locations"}}
{"name":"Parking Nation","location":{"lat":48.8483,"lon":2.3959},"capacity":400,"available":200,"hourly_rate":3.50,"features":["outdoor","large_vehicles"]}
```

**Instructions**:

1. Find parking within distance:
```bash
GET /parking-locations/_search
{
  "query": {
    "geo_distance": {
      "distance": "2km",
      "location": {
        "lat": 48.8566,
        "lon": 2.3522
      }
    }
  }
}
```

2. Sort by distance with calculated distance in results:
```bash
GET /parking-locations/_search
{
  "query": {
    "bool": {
      "must": { "match_all": {} },
      "filter": {
        "geo_distance": {
          "distance": "5km",
          "location": { "lat": 48.8566, "lon": 2.3522 }
        }
      }
    }
  },
  "sort": [
    {
      "_geo_distance": {
        "location": { "lat": 48.8566, "lon": 2.3522 },
        "order": "asc",
        "unit": "m"
      }
    }
  ],
  "script_fields": {
    "distance_km": {
      "script": {
        "source": "doc['location'].arcDistance(params.lat, params.lon) / 1000",
        "params": { "lat": 48.8566, "lon": 2.3522 }
      }
    }
  }
}
```

3. Geo bounding box:
```bash
GET /parking-locations/_search
{
  "query": {
    "geo_bounding_box": {
      "location": {
        "top_left": { "lat": 48.88, "lon": 2.32 },
        "bottom_right": { "lat": 48.85, "lon": 2.38 }
      }
    }
  }
}
```

4. Combine geo with other filters:
```bash
GET /parking-locations/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "geo_distance": {
            "distance": "3km",
            "location": { "lat": 48.8566, "lon": 2.3522 }
          }
        }
      ],
      "filter": [
        { "range": { "available": { "gte": 20 } } },
        { "range": { "hourly_rate": { "lte": 5.0 } } },
        { "term": { "features": "covered" } }
      ]
    }
  },
  "sort": [
    { "hourly_rate": "asc" },
    {
      "_geo_distance": {
        "location": { "lat": 48.8566, "lon": 2.3522 },
        "order": "asc"
      }
    }
  ]
}
```

5. Geo aggregation:
```bash
GET /parking-locations/_search
{
  "size": 0,
  "aggs": {
    "distance_rings": {
      "geo_distance": {
        "field": "location",
        "origin": { "lat": 48.8566, "lon": 2.3522 },
        "unit": "km",
        "ranges": [
          { "key": "nearby", "to": 1 },
          { "key": "walking", "from": 1, "to": 2 },
          { "key": "driving", "from": 2, "to": 5 }
        ]
      },
      "aggs": {
        "total_capacity": { "sum": { "field": "capacity" } },
        "total_available": { "sum": { "field": "available" } }
      }
    }
  }
}
```

**Challenge**:
- Find the closest covered parking with EV charging to the Louvre (48.8606, 2.3376)
- What's the total available capacity within 2km of city center?
- Find parking that's cheap (<4€), has spots available (>50), and is within 3km

---

## Exercise 5.5: Sorting, Pagination, and Source Filtering

**Objective**: Master result ordering and efficient pagination.

**Setup**: Use the `articles` and `parking-locations` indices.

**Instructions**:

1. Multi-field sorting:
```bash
GET /articles/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "category": { "order": "asc" } },
    { "views": { "order": "desc" } },
    { "published_at": { "order": "desc" } }
  ]
}
```

2. Sorting with missing values:
```bash
GET /articles/_search
{
  "query": { "match_all": {} },
  "sort": [
    {
      "views": {
        "order": "desc",
        "missing": "_last"
      }
    }
  ]
}
```

3. Source filtering:
```bash
# Include only specific fields
GET /articles/_search
{
  "query": { "match_all": {} },
  "_source": ["title", "author", "published_at"]
}

# Exclude fields
GET /articles/_search
{
  "query": { "match_all": {} },
  "_source": {
    "excludes": ["content"]
  }
}

# Pattern matching
GET /articles/_search
{
  "query": { "match_all": {} },
  "_source": {
    "includes": ["title", "published_*"],
    "excludes": ["content"]
  }
}
```

4. Pagination with from/size:
```bash
# Page 1
GET /articles/_search
{
  "from": 0,
  "size": 2,
  "query": { "match_all": {} },
  "sort": [{ "published_at": "desc" }]
}

# Page 2
GET /articles/_search
{
  "from": 2,
  "size": 2,
  "query": { "match_all": {} },
  "sort": [{ "published_at": "desc" }]
}
```

5. Search After (for deep pagination):

```bash
PUT _cluster/settings
{
  "transient": {
    "indices.id_field_data.enabled": true
  }
}
```bash

```bash
# First page
GET /articles/_search
{
  "size": 2,
  "query": { "match_all": {} },
  "sort": [
    { "published_at": "desc" },
    { "_id": "asc" }
  ]
}

# Use the sort values from the last hit for next page
GET /articles/_search
{
  "size": 2,
  "query": { "match_all": {} },
  "sort": [
    { "published_at": "desc" },
    { "_id": "asc" }
  ],
  "search_after": ["2025-01-14", "3"]
}
```

6. Track total hits:
```bash
GET /articles/_search
{
  "track_total_hits": true,
  "query": { "match_all": {} }
}

# Or set a threshold
GET /articles/_search
{
  "track_total_hits": 100,
  "query": { "match_all": {} }
}
```

**Challenge**:
- Get page 2 of articles (2 per page), sorted by views descending, showing only title and views
- Why is `search_after` better than `from/size` for deep pagination?
- Implement cursor-based pagination for the parking-locations index

---

# Part 6: Aggregations

## Exercise 6.1: Metric Aggregations with Pipeline

**Objective**: Calculate statistics and derived metrics.

**Setup**: Create a comprehensive transactions index:
```bash
PUT /transactions
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "parking_id": { "type": "keyword" },
      "spot_type": { "type": "keyword" },
      "amount": { "type": "float" },
      "duration_minutes": { "type": "integer" },
      "payment_method": { "type": "keyword" },
      "user_type": { "type": "keyword" },
      "day_of_week": { "type": "keyword" }
    }
  }
}

POST /_bulk
{"index":{"_index":"transactions"}}
{"@timestamp":"2025-01-15T08:00:00Z","parking_id":"central","spot_type":"standard","amount":12.50,"duration_minutes":120,"payment_method":"card","user_type":"regular","day_of_week":"wednesday"}
{"index":{"_index":"transactions"}}
{"@timestamp":"2025-01-15T09:00:00Z","parking_id":"central","spot_type":"ev_charging","amount":18.00,"duration_minutes":90,"payment_method":"mobile","user_type":"premium","day_of_week":"wednesday"}
{"index":{"_index":"transactions"}}
{"@timestamp":"2025-01-15T10:00:00Z","parking_id":"north","spot_type":"standard","amount":8.00,"duration_minutes":60,"payment_method":"card","user_type":"regular","day_of_week":"wednesday"}
{"index":{"_index":"transactions"}}
{"@timestamp":"2025-01-15T11:00:00Z","parking_id":"central","spot_type":"handicap","amount":6.50,"duration_minutes":45,"payment_method":"cash","user_type":"regular","day_of_week":"wednesday"}
{"index":{"_index":"transactions"}}
{"@timestamp":"2025-01-15T14:00:00Z","parking_id":"north","spot_type":"standard","amount":20.00,"duration_minutes":240,"payment_method":"mobile","user_type":"premium","day_of_week":"wednesday"}
{"index":{"_index":"transactions"}}
{"@timestamp":"2025-01-15T15:00:00Z","parking_id":"south","spot_type":"ev_charging","amount":25.00,"duration_minutes":180,"payment_method":"card","user_type":"premium","day_of_week":"wednesday"}
{"index":{"_index":"transactions"}}
{"@timestamp":"2025-01-15T16:00:00Z","parking_id":"central","spot_type":"standard","amount":10.00,"duration_minutes":90,"payment_method":"mobile","user_type":"regular","day_of_week":"wednesday"}
{"index":{"_index":"transactions"}}
{"@timestamp":"2025-01-14T10:00:00Z","parking_id":"central","spot_type":"standard","amount":15.00,"duration_minutes":150,"payment_method":"card","user_type":"regular","day_of_week":"tuesday"}
{"index":{"_index":"transactions"}}
{"@timestamp":"2025-01-14T12:00:00Z","parking_id":"north","spot_type":"standard","amount":12.00,"duration_minutes":120,"payment_method":"cash","user_type":"regular","day_of_week":"tuesday"}
{"index":{"_index":"transactions"}}
{"@timestamp":"2025-01-14T15:00:00Z","parking_id":"south","spot_type":"standard","amount":8.50,"duration_minutes":60,"payment_method":"mobile","user_type":"premium","day_of_week":"tuesday"}
```

**Instructions**:

1. Extended stats with percentiles:
```bash
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "amount_stats": { "extended_stats": { "field": "amount" } },
    "amount_percentiles": {
      "percentiles": {
        "field": "amount",
        "percents": [25, 50, 75, 90, 99]
      }
    },
    "duration_percentile_ranks": {
      "percentile_ranks": {
        "field": "duration_minutes",
        "values": [60, 120, 180]
      }
    }
  }
}
```

2. Weighted average:
```bash
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "weighted_avg_rate": {
      "weighted_avg": {
        "value": {
          "script": "doc['amount'].value / doc['duration_minutes'].value * 60"
        },
        "weight": { "field": "duration_minutes" }
      }
    }
  }
}
```

3. Pipeline aggregations:
```bash
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "daily_revenue": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "day"
      },
      "aggs": {
        "revenue": { "sum": { "field": "amount" } },
        "avg_transaction": { "avg": { "field": "amount" } }
      }
    },
    "total_revenue": {
      "sum_bucket": {
        "buckets_path": "daily_revenue>revenue"
      }
    },
    "avg_daily_revenue": {
      "avg_bucket": {
        "buckets_path": "daily_revenue>revenue"
      }
    },
    "max_day_revenue": {
      "max_bucket": {
        "buckets_path": "daily_revenue>revenue"
      }
    }
  }
}
```

4. Derivative (rate of change):
```bash
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "hourly": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "hour",
        "min_doc_count": 0
      },
      "aggs": {
        "revenue": { "sum": { "field": "amount" } },
        "revenue_change": {
          "derivative": {
            "buckets_path": "revenue"
          }
        }
      }
    }
  }
}
```

**Challenge**:
- What is the 90th percentile for transaction amounts?
- What percentage of transactions are under 2 hours?
- Calculate the revenue per minute rate for each parking

---

## Exercise 6.2: Bucket Aggregations with Filters

**Objective**: Group data into meaningful buckets.

**Setup**: Use the `transactions` index.

**Instructions**:

1. Terms with order and size:
```bash
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "top_parkings_by_revenue": {
      "terms": {
        "field": "parking_id",
        "size": 10,
        "order": { "total_revenue": "desc" }
      },
      "aggs": {
        "total_revenue": { "sum": { "field": "amount" } },
        "transaction_count": { "value_count": { "field": "amount" } }
      }
    }
  }
}
```

2. Histogram and date histogram:
```bash
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "amount_distribution": {
      "histogram": {
        "field": "amount",
        "interval": 5,
        "min_doc_count": 0,
        "extended_bounds": { "min": 0, "max": 30 }
      }
    },
    "hourly_distribution": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "hour",
        "format": "HH:mm",
        "time_zone": "Europe/Paris"
      },
      "aggs": {
        "revenue": { "sum": { "field": "amount" } }
      }
    }
  }
}
```

3. Filters aggregation:
```bash
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "transaction_categories": {
      "filters": {
        "filters": {
          "small": { "range": { "amount": { "lt": 10 } } },
          "medium": { "range": { "amount": { "gte": 10, "lt": 20 } } },
          "large": { "range": { "amount": { "gte": 20 } } }
        }
      },
      "aggs": {
        "avg_duration": { "avg": { "field": "duration_minutes" } },
        "revenue": { "sum": { "field": "amount" } }
      }
    }
  }
}
```

4. Composite aggregation (for pagination):
```bash
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "parking_payment_combos": {
      "composite": {
        "size": 5,
        "sources": [
          { "parking": { "terms": { "field": "parking_id" } } },
          { "payment": { "terms": { "field": "payment_method" } } }
        ]
      },
      "aggs": {
        "revenue": { "sum": { "field": "amount" } }
      }
    }
  }
}

# Next page using after_key from response
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "parking_payment_combos": {
      "composite": {
        "size": 5,
        "sources": [
          { "parking": { "terms": { "field": "parking_id" } } },
          { "payment": { "terms": { "field": "payment_method" } } }
        ],
        "after": { "parking": "central", "payment": "mobile" }
      },
      "aggs": {
        "revenue": { "sum": { "field": "amount" } }
      }
    }
  }
}
```

5. Significant terms (find unusual patterns):
```bash
GET /transactions/_search
{
  "size": 0,
  "query": {
    "term": { "user_type": "premium" }
  },
  "aggs": {
    "significant_spot_types": {
      "significant_terms": {
        "field": "spot_type"
      }
    },
    "significant_payment": {
      "significant_terms": {
        "field": "payment_method"
      }
    }
  }
}
```

**Challenge**:
- Which payment method is most significant for premium users?
- Create an hourly revenue chart for January 15th
- Find the top 3 parking-payment combinations by revenue

---

## Exercise 6.3: Nested Aggregations and Post-Filters

**Objective**: Build complex multi-level aggregations.

**Setup**: Use the `transactions` index.

**Instructions**:

1. Multi-level aggregation:
```bash
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "by_parking": {
      "terms": { "field": "parking_id" },
      "aggs": {
        "by_spot_type": {
          "terms": { "field": "spot_type" },
          "aggs": {
            "revenue": { "sum": { "field": "amount" } },
            "avg_duration": { "avg": { "field": "duration_minutes" } },
            "by_payment": {
              "terms": { "field": "payment_method" },
              "aggs": {
                "count": { "value_count": { "field": "amount" } }
              }
            },
            "revenue_share": {
              "normalize": {
                "buckets_path": "revenue",
                "method": "percent_of_sum"
              }
            }
          }
        },
        "total_revenue": { "sum": { "field": "amount" } }
      }
    }
  }
}
```

2. Post-filter (filter results, not aggregations):
```bash
GET /transactions/_search
{
  "query": {
    "match_all": {}
  },
  "post_filter": {
    "term": { "payment_method": "card" }
  },
  "aggs": {
    "all_payment_methods": {
      "terms": { "field": "payment_method" }
    }
  }
}
```

3. Bucket selector (filter buckets):
```bash
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "by_parking": {
      "terms": { "field": "parking_id" },
      "aggs": {
        "revenue": { "sum": { "field": "amount" } },
        "transaction_count": { "value_count": { "field": "amount" } },
        "high_revenue_filter": {
          "bucket_selector": {
            "buckets_path": {
              "rev": "revenue"
            },
            "script": "params.rev > 30"
          }
        }
      }
    }
  }
}
```

4. Bucket sort:
```bash
GET /transactions/_search
{
  "size": 0,
  "aggs": {
    "by_payment": {
      "terms": {
        "field": "payment_method",
        "size": 10
      },
      "aggs": {
        "revenue": { "sum": { "field": "amount" } },
        "avg_amount": { "avg": { "field": "amount" } },
        "sort_by_revenue": {
          "bucket_sort": {
            "sort": [{ "revenue": { "order": "desc" } }],
            "size": 3
          }
        }
      }
    }
  }
}
```

**Challenge**:
- Calculate each parking's percentage of total revenue
- Find parking lots with more than 3 transactions AND revenue > 30€
- Show all payment method counts, but only return documents with "card" payment

---

# Part 7: Ingest Pipelines

## Exercise 7.1: Multi-Processor Pipeline

**Objective**: Create a comprehensive data transformation pipeline.

**Instructions**:

1. Create a complex pipeline:
```bash
PUT /_ingest/pipeline/parking-logs-pipeline
{
  "description": "Comprehensive parking log processing",
  "processors": [
    {
      "set": {
        "field": "ingested_at",
        "value": "{{_ingest.timestamp}}"
      }
    },
    {
      "lowercase": {
        "field": "level",
        "ignore_missing": true
      }
    },
    {
      "trim": {
        "field": "message",
        "ignore_missing": true
      }
    },
    {
      "gsub": {
        "field": "user_id",
        "pattern": "^user[-_]?",
        "replacement": "",
        "ignore_missing": true
      }
    },
    {
      "split": {
        "field": "tags",
        "separator": ",",
        "ignore_missing": true
      }
    },
    {
      "set": {
        "field": "severity_score",
        "value": 1,
        "if": "ctx.level == 'debug'"
      }
    },
    {
      "set": {
        "field": "severity_score",
        "value": 2,
        "if": "ctx.level == 'info'"
      }
    },
    {
      "set": {
        "field": "severity_score",
        "value": 3,
        "if": "ctx.level == 'warn' || ctx.level == 'warning'"
      }
    },
    {
      "set": {
        "field": "severity_score",
        "value": 4,
        "if": "ctx.level == 'error'"
      }
    },
    {
      "remove": {
        "field": ["temp", "debug_info"],
        "ignore_missing": true
      }
    }
  ],
  "on_failure": [
    {
      "set": {
        "field": "_index",
        "value": "failed-logs"
      }
    },
    {
      "set": {
        "field": "error.message",
        "value": "{{ _ingest.on_failure_message }}"
      }
    },
    {
      "set": {
        "field": "error.processor",
        "value": "{{ _ingest.on_failure_processor_type }}"
      }
    }
  ]
}
```

2. Test with various documents:
```bash
POST /_ingest/pipeline/parking-logs-pipeline/_simulate
{
  "docs": [
    {
      "_source": {
        "level": "ERROR",
        "message": "  Connection timeout  ",
        "user_id": "user-123",
        "tags": "parking,api,timeout",
        "temp": "temporary_data"
      }
    },
    {
      "_source": {
        "level": "INFO",
        "message": "Normal operation",
        "user_id": "user_456"
      }
    },
    {
      "_source": {
        "level": "DEBUG",
        "message": "Debug info"
      }
    }
  ]
}
```

3. Index documents using the pipeline:
```bash
POST /processed-logs/_doc?pipeline=parking-logs-pipeline
{
  "level": "WARN",
  "message": "  High latency detected  ",
  "user_id": "user-789",
  "tags": "performance,warning",
  "temp": "should_be_removed"
}

GET /processed-logs/_search
```

**Challenge**:
- Add a processor that extracts the first word from the message as a new field `action`
- Add a processor that sets `is_critical` to true if severity_score >= 4
- What happens if `level` is an unexpected value?

---

## Exercise 7.2: Grok and Dissect Processors

**Objective**: Parse complex unstructured logs.

**Instructions**:

1. Create a Grok pipeline for application logs:
```bash
PUT /_ingest/pipeline/app-logs-parser
{
  "description": "Parse structured application logs",
  "processors": [
    {
      "grok": {
        "field": "message",
        "patterns": [
          "\\[%{TIMESTAMP_ISO8601:log_timestamp}\\] \\[%{LOGLEVEL:level}\\] \\[%{DATA:service}\\] \\[%{DATA:trace_id}\\] %{GREEDYDATA:log_message}"
        ],
        "pattern_definitions": {
          "LOGLEVEL": "DEBUG|INFO|WARN|ERROR|FATAL"
        }
      }
    },
    {
      "date": {
        "field": "log_timestamp",
        "formats": ["ISO8601"],
        "target_field": "@timestamp"
      }
    },
    {
      "remove": {
        "field": ["log_timestamp", "message"]
      }
    }
  ]
}
```

2. Test the Grok pipeline:
```bash
POST /_ingest/pipeline/app-logs-parser/_simulate
{
  "docs": [
    {
      "_source": {
        "message": "[2025-01-15T10:30:45.123Z] [ERROR] [parking-api] [abc123-def456] User authentication failed for user_id=789"
      }
    },
    {
      "_source": {
        "message": "[2025-01-15T10:30:46.456Z] [INFO] [payment-service] [xyz789-uvw012] Payment processed successfully amount=25.50"
      }
    }
  ]
}
```

3. Create a Dissect pipeline (faster, simpler):
```bash
PUT /_ingest/pipeline/access-logs-parser
{
  "description": "Parse access logs with dissect",
  "processors": [
    {
      "dissect": {
        "field": "message",
        "pattern": "%{client_ip} - %{user} [%{timestamp}] \"%{method} %{path} %{protocol}\" %{status} %{bytes}"
      }
    },
    {
      "convert": {
        "field": "status",
        "type": "integer"
      }
    },
    {
      "convert": {
        "field": "bytes",
        "type": "integer"
      }
    },
    {
      "geoip": {
        "field": "client_ip",
        "target_field": "geo",
        "ignore_missing": true
      }
    },
    {
      "user_agent": {
        "field": "user_agent",
        "target_field": "ua",
        "ignore_missing": true
      }
    }
  ]
}
```

4. Test Dissect:
```bash
POST /_ingest/pipeline/access-logs-parser/_simulate
{
  "docs": [
    {
      "_source": {
        "message": "192.168.1.100 - john [15/Jan/2025:10:30:00 +0000] \"GET /api/parking/status HTTP/1.1\" 200 1234",
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
      }
    }
  ]
}
```

5. Test Grok patterns online:
```bash
GET /_ingest/processor/grok
```

**Challenge**:
- Create a pattern that extracts key=value pairs from the log_message
- Add a processor that categorizes status codes (2xx=success, 4xx=client_error, 5xx=server_error)
- Handle logs that don't match the expected format gracefully

---

## Exercise 7.3: Enrichment and Lookup

**Objective**: Enrich documents with external data.

**Instructions**:

1. Create a lookup index:
```bash
PUT /parking-info
{
  "mappings": {
    "properties": {
      "parking_id": { "type": "keyword" },
      "name": { "type": "text" },
      "address": { "type": "text" },
      "city": { "type": "keyword" },
      "capacity": { "type": "integer" },
      "manager_email": { "type": "keyword" }
    }
  }
}

POST /_bulk
{"index":{"_index":"parking-info","_id":"central"}}
{"parking_id":"central","name":"Parking Central Paris","address":"15 Rue de Rivoli","city":"Paris","capacity":500,"manager_email":"central@parkki.com"}
{"index":{"_index":"parking-info","_id":"north"}}
{"parking_id":"north","name":"Parking Gare du Nord","address":"18 Rue de Dunkerque","city":"Paris","capacity":300,"manager_email":"north@parkki.com"}
{"index":{"_index":"parking-info","_id":"south"}}
{"parking_id":"south","name":"Parking Montparnasse","address":"Place Raoul Dautry","city":"Paris","capacity":400,"manager_email":"south@parkki.com"}
```

2. Create an enrich policy:
```bash
PUT /_enrich/policy/parking-lookup
{
  "match": {
    "indices": "parking-info",
    "match_field": "parking_id",
    "enrich_fields": ["name", "city", "capacity", "manager_email"]
  }
}

# Execute the policy to create the enrich index
POST /_enrich/policy/parking-lookup/_execute
```

3. Create a pipeline using the enrich policy:
```bash
PUT /_ingest/pipeline/enrich-parking-events
{
  "description": "Enrich parking events with parking info",
  "processors": [
    {
      "enrich": {
        "policy_name": "parking-lookup",
        "field": "parking_id",
        "target_field": "parking_info",
        "max_matches": 1
      }
    },
    {
      "set": {
        "field": "enriched",
        "value": true,
        "if": "ctx.parking_info != null"
      }
    },
    {
      "script": {
        "source": """
          if (ctx.parking_info != null) {
            ctx.parking_name = ctx.parking_info.name;
            ctx.parking_city = ctx.parking_info.city;
          }
        """,
        "if": "ctx.parking_info != null"
      }
    }
  ]
}
```

4. Test the enrichment:
```bash
POST /_ingest/pipeline/enrich-parking-events/_simulate
{
  "docs": [
    {
      "_source": {
        "event_type": "ENTRY",
        "parking_id": "central",
        "user_id": "user123",
        "timestamp": "2025-01-15T10:00:00Z"
      }
    },
    {
      "_source": {
        "event_type": "EXIT",
        "parking_id": "unknown",
        "user_id": "user456"
      }
    }
  ]
}
```

5. Check enrich policy status:
```bash
GET /_enrich/policy/parking-lookup
GET /_enrich/_stats
```

**Challenge**:
- Add a processor that sends an alert if capacity > 400
- Handle the case when parking_id is not found in the lookup
- Create a pipeline that combines Grok parsing AND enrichment

---

# Part 8: Data Retention and ILM

## Exercise 8.1: Complete ILM Policy

**Objective**: Create a production-ready ILM policy.

**Instructions**:

1. Create a comprehensive ILM policy:
```bash
PUT /_ilm/policy/parkki-logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "25gb",
            "max_docs": 10000000
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "2d",
        "actions": {
          "readonly": {},
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "set_priority": {
            "priority": 50
          },
          "allocate": {
            "require": {
              "data": "warm"
            }
          }
        }
      },
      "cold": {
        "min_age": "7d",
        "actions": {
          "set_priority": {
            "priority": 0
          },
          "allocate": {
            "require": {
              "data": "cold"
            },
            "number_of_replicas": 0
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

2. Check ILM status:
```bash
GET /_ilm/policy/parkki-logs-policy
GET /_ilm/status
```

3. Create template with ILM:
```bash
PUT /_index_template/logs-with-ilm
{
  "index_patterns": ["logs-ilm-*"],
  "data_stream": {},
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "index.lifecycle.name": "parkki-logs-policy"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "message": { "type": "text" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" }
      }
    }
  }
}
```

4. Create and populate the data stream:
```bash
POST /logs-ilm-parkki/_doc
{
  "@timestamp": "2025-01-15T10:00:00Z",
  "message": "Application started",
  "level": "INFO",
  "service": "parking-api"
}

POST /logs-ilm-parkki/_doc
{
  "@timestamp": "2025-01-15T10:01:00Z",
  "message": "User login successful",
  "level": "INFO",
  "service": "auth-service"
}
```

5. Monitor ILM progress:
```bash
GET /logs-ilm-parkki/_ilm/explain
GET /_cat/indices/.*logs-ilm*?v&h=index,health,status,pri,rep,docs.count,store.size
```

**Challenge**:
- Add a frozen phase before delete
- Modify the policy to keep 90 days in cold instead of deleting at 30 days
- How would you force an index to move to the next phase?

---

## Exercise 8.2: Data Streams with Rollover

**Objective**: Manage time-series data efficiently.

**Instructions**:

1. Create a data stream template:
```bash
PUT /_index_template/metrics-template
{
  "index_patterns": ["metrics-*"],
  "data_stream": {},
  "priority": 500,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "index.lifecycle.name": "parkki-logs-policy"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "parking_id": { "type": "keyword" },
        "metric_name": { "type": "keyword" },
        "value": { "type": "double" },
        "unit": { "type": "keyword" }
      }
    }
  }
}
```

2. Index metrics into the data stream:
```bash
POST /metrics-parkki/_doc
{
  "@timestamp": "2025-01-15T10:00:00Z",
  "parking_id": "central",
  "metric_name": "occupancy_percent",
  "value": 78.5,
  "unit": "percent"
}

POST /metrics-parkki/_doc
{
  "@timestamp": "2025-01-15T10:00:00Z",
  "parking_id": "central",
  "metric_name": "revenue_hourly",
  "value": 245.50,
  "unit": "euros"
}

POST /metrics-parkki/_doc
{
  "@timestamp": "2025-01-15T10:01:00Z",
  "parking_id": "north",
  "metric_name": "occupancy_percent",
  "value": 45.2,
  "unit": "percent"
}
```

3. View data stream info:
```bash
GET /_data_stream/metrics-parkki

GET /_cat/indices/.ds-metrics-parkki-*?v
```

4. Manual rollover:
```bash
POST /metrics-parkki/_rollover
{
  "conditions": {
    "max_docs": 1
  }
}
```

5. Search across all backing indices:
```bash
GET /metrics-parkki/_search
{
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-1h"
      }
    }
  },
  "aggs": {
    "by_parking": {
      "terms": { "field": "parking_id" },
      "aggs": {
        "avg_occupancy": {
          "avg": {
            "field": "value"
          }
        }
      }
    }
  }
}
```

**Challenge**:
- What's the naming convention for backing indices?
- How do you delete old data from a data stream?
- Create a query that searches only the current write index

---

## Exercise 8.3: Index Optimization Operations

**Objective**: Practice shrink, force merge, and clone operations.

**Instructions**:

1. Create and populate a test index:
```bash
PUT /test-optimization
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 0
  }
}

POST /_bulk
{"index":{"_index":"test-optimization"}}
{"message":"test 1","value":1}
{"index":{"_index":"test-optimization"}}
{"message":"test 2","value":2}
{"index":{"_index":"test-optimization"}}
{"message":"test 3","value":3}
{"index":{"_index":"test-optimization"}}
{"message":"test 4","value":4}
{"index":{"_index":"test-optimization"}}
{"message":"test 5","value":5}

# Force refresh
POST /test-optimization/_refresh
```

2. Check segment info:
```bash
GET /_cat/segments/test-optimization?v&h=index,shard,segment,docs.count,size

GET /test-optimization/_stats/segments
```

3. Force merge:
```bash
POST /test-optimization/_forcemerge?max_num_segments=1

# Check segments again
GET /_cat/segments/test-optimization?v
```

4. Clone an index:
```bash
# Make source read-only
PUT /test-optimization/_settings
{
  "settings": {
    "index.blocks.write": true
  }
}

# Clone
POST /test-optimization/_clone/test-optimization-clone

# Verify
GET /_cat/indices/test-optimization*?v
```

5. Reindex with transformation:
```bash
POST /_reindex
{
  "source": {
    "index": "test-optimization"
  },
  "dest": {
    "index": "test-optimization-v2"
  },
  "script": {
    "source": "ctx._source.value_doubled = ctx._source.value * 2"
  }
}

GET /test-optimization-v2/_search
```

6. Clean up write block:
```bash
PUT /test-optimization/_settings
{
  "settings": {
    "index.blocks.write": false
  }
}
```

**Challenge**:
- What's the difference between clone and reindex?
- When would you use force merge? When should you avoid it?
- Create a reindex that only copies documents where value > 2

---

# Part 9: Operating and Troubleshooting

## Exercise 9.1: Comprehensive Cluster Diagnostics

**Objective**: Master cluster health monitoring.

**Instructions**:

1. Full cluster health check:
```bash
# Basic health
GET /_cluster/health

# Detailed health with shard info
GET /_cluster/health?level=shards

# Wait for status
GET /_cluster/health?wait_for_status=green&timeout=30s
```

2. Node diagnostics:
```bash
# All nodes with key metrics
GET /_cat/nodes?v&h=name,ip,heap.percent,ram.percent,cpu,load_1m,load_5m,disk.used_percent,node.role,master

# Node stats
GET /_nodes/stats?filter_path=nodes.*.name,nodes.*.indices.indexing,nodes.*.indices.search,nodes.*.jvm.mem

# Hot threads
GET /_nodes/hot_threads
```

3. Index diagnostics:
```bash
# All indices sorted by size
GET /_cat/indices?v&s=store.size:desc&h=index,health,status,pri,rep,docs.count,docs.deleted,store.size,pri.store.size

# Index stats
GET /_stats?filter_path=_all.primaries
```

4. Shard analysis:
```bash
# All shards with details
GET /_cat/shards?v&h=index,shard,prirep,state,docs,store,ip,node,unassigned.reason&s=state

# Unassigned shards only
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason&s=state:desc

# Allocation explanation
GET /_cluster/allocation/explain
```

5. Task and pending operations:
```bash
# Current tasks
GET /_tasks

# Pending cluster tasks
GET /_cluster/pending_tasks

# Cancellable tasks
GET /_tasks?actions=*search*
```

**Challenge**:
- Identify any nodes with high CPU or memory usage
- Check if there are any unassigned shards and explain why
- Monitor the indexing rate across all indices

---

## Exercise 9.2: JVM and Memory Deep Dive

**Objective**: Diagnose and understand JVM behavior.

**Instructions**:

1. Heap analysis:
```bash
# Current heap usage
GET /_cat/nodes?v&h=name,heap.percent,heap.current,heap.max,ram.percent,ram.current,ram.max

# Detailed JVM stats
GET /_nodes/stats/jvm?filter_path=nodes.*.name,nodes.*.jvm.mem,nodes.*.jvm.gc.collectors
```

2. GC analysis:
```bash
# GC statistics
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.gc

# Calculate GC time percentage (look at collection_time_in_millis)
GET /_nodes/stats?filter_path=nodes.*.jvm.gc.collectors,nodes.*.jvm.uptime_in_millis
```

3. Circuit breakers:
```bash
# Circuit breaker status
GET /_nodes/stats/breaker

# Current limits
GET /_cluster/settings?include_defaults=true&filter_path=defaults.indices.breaker
```

4. Cache analysis:
```bash
# Fielddata cache
GET /_cat/fielddata?v&h=node,field,size

# All caches
GET /_nodes/stats/indices?filter_path=nodes.*.indices.fielddata,nodes.*.indices.query_cache,nodes.*.indices.request_cache

# Clear caches (use carefully!)
# POST /_cache/clear
```

5. Memory pools:
```bash
# Detailed memory breakdown
GET /_nodes/stats/jvm?filter_path=nodes.*.jvm.mem.pools
```

**Challenge**:
- What percentage of heap is used for fielddata?
- Which circuit breaker is closest to its limit?
- Calculate the cache hit ratio for the query cache

---

## Exercise 9.3: Query Performance Analysis

**Objective**: Identify and fix slow queries.

**Instructions**:

1. Configure slow logs:
```bash
PUT /articles/_settings
{
  "index.search.slowlog.threshold.query.warn": "5s",
  "index.search.slowlog.threshold.query.info": "2s",
  "index.search.slowlog.threshold.query.debug": "500ms",
  "index.search.slowlog.threshold.query.trace": "200ms",
  "index.search.slowlog.threshold.fetch.warn": "1s",
  "index.search.slowlog.threshold.fetch.info": "500ms",
  "index.indexing.slowlog.threshold.index.warn": "10s",
  "index.indexing.slowlog.threshold.index.info": "5s"
}
```

2. Profile a complex query:
```bash
GET /articles/_search
{
  "profile": true,
  "query": {
    "bool": {
      "must": [
        { "match": { "content": "parking management technology" } }
      ],
      "should": [
        { "term": { "category": "technology" } },
        { "range": { "views": { "gte": 1000 } } }
      ],
      "filter": [
        { "range": { "published_at": { "gte": "2025-01-01" } } }
      ]
    }
  },
  "aggs": {
    "by_category": {
      "terms": { "field": "category" }
    }
  }
}
```

3. Analyze the profile output:
```bash
# The profile response shows:
# - Time spent in each query component
# - Breakdown of rewrite, score, build_scorer, etc.
# - Which parts are slowest
```

4. Explain query scoring:
```bash
GET /articles/_explain/1
{
  "query": {
    "match": {
      "content": "parking management"
    }
  }
}
```

5. Search templates for optimization:
```bash
# Create a search template
PUT /_scripts/parking-search
{
  "script": {
    "lang": "mustache",
    "source": {
      "query": {
        "bool": {
          "must": [
            { "match": { "content": "{{query_text}}" } }
          ],
          "filter": [
            { "range": { "published_at": { "gte": "{{from_date}}" } } }
          ]
        }
      }
    }
  }
}

# Use the template
GET /articles/_search/template
{
  "id": "parking-search",
  "params": {
    "query_text": "parking",
    "from_date": "2025-01-01"
  }
}
```

**Challenge**:
- Which part of the profiled query takes the longest?
- How would you optimize a query that's slow due to wildcards?
- Create a search template for the most common search pattern

---

# Part 10: Cluster Audit

## Exercise 10.1: Production Readiness Audit

**Objective**: Perform a comprehensive cluster audit.

**Instructions**:

Create a complete audit by running these queries and documenting findings:

1. **Cluster Configuration Audit**:
```bash
# Cluster settings
GET /_cluster/settings?include_defaults=true&flat_settings=true

# Check critical settings
GET /_cluster/settings?include_defaults=true&filter_path=defaults.cluster.routing.allocation,defaults.indices.recovery

# Node roles
GET /_nodes?filter_path=nodes.*.roles,nodes.*.name
```

2. **Capacity Audit**:
```bash
# Disk usage
GET /_cat/allocation?v

# Shard count per node
GET /_cat/nodes?v&h=name,node.role,shards,disk.used_percent

# Index sizes
GET /_cat/indices?v&s=store.size:desc&format=json
```

3. **Performance Audit**:
```bash
# Thread pool rejections
GET /_cat/thread_pool?v&h=node_name,name,active,queue,rejected,completed&s=rejected:desc

# Search and indexing stats
GET /_stats/search,indexing?filter_path=_all.primaries

# Segment memory
GET /_cat/segments?v&h=index,shard,segment,size.memory&s=size.memory:desc
```

4. **Mapping Audit**:
```bash
# All mappings (check for text fields that should be keyword)
GET /_all/_mapping

# Field data usage (expensive text aggregations)
GET /_cat/fielddata?v&format=json&s=size:desc
```

5. **Create Audit Report**:
```bash
# Summary query
GET /_cluster/stats?filter_path=status,indices.count,indices.shards,indices.docs,nodes.count,nodes.os.mem
```

**Challenge**:
- Document any findings that indicate potential issues
- Calculate the documents per shard ratio (should be 200k-500k ideally)
- Identify any indices that might need more/fewer shards

---

## Exercise 10.2: Security and Best Practices Audit

**Objective**: Verify security configuration and best practices.

**Instructions**:

1. **Security Status**:
```bash
# Check if security is enabled
GET /_xpack/security

# List users (if security is enabled)
GET /_security/user

# List roles
GET /_security/role
```

2. **Template Audit**:
```bash
# List all templates
GET /_index_template

# Check for conflicting patterns
GET /_index_template/*?filter_path=index_templates.*.index_patterns
```

3. **ILM Audit**:
```bash
# All ILM policies
GET /_ilm/policy

# Indices with ILM issues
GET /*/_ilm/explain?only_errors=true

# ILM status
GET /_ilm/status
```

4. **Snapshot Audit**:
```bash
# List repositories
GET /_snapshot

# Check snapshot status (if configured)
# GET /_snapshot/my_repository/_status
```

5. **Best Practices Checklist**:
```bash
# Check refresh interval (should be 30s for logs)
GET /_all/_settings?filter_path=*.settings.index.refresh_interval

# Check replica count
GET /_cat/indices?v&h=index,rep

# Check for very large documents
GET /_stats/store?filter_path=indices.*.primaries.store
```

**Challenge**:
- Are all indices using appropriate refresh intervals?
- Do all log indices have ILM policies attached?
- Are there any templates without explicit mappings?

---

# Part 11: Monitoring with Elastic Stack

## Exercise 11.1: Metricbeat Setup and Configuration

**Objective**: Install and configure Metricbeat to monitor Elasticsearch and system metrics.

**Instructions**:

1. Download and extract Metricbeat:
```bash
# Download Metricbeat
wget https://artifacts.elastic.co/downloads/beats/metricbeat/metricbeat-9.0.0-linux-x86_64.tar.gz
tar -xzf metricbeat-9.0.0-linux-x86_64.tar.gz
cd metricbeat-9.0.0-linux-x86_64
```

2. Configure authentication for Beats (if cluster is secured):

```bash
# Go back to Elasticsearch directory
cd /path/to/elasticsearch-9.0.0

# Reset password for beats_system user
./bin/elasticsearch-reset-password -u beats_system

# The command will display the new password, write it down
# Example output: New value: AbC123dEf456GhI789
```

3. Configure Metricbeat to collect system and Elasticsearch metrics:
```bash
# Backup original config
# System module - collect CPU, memory, disk, network metrics
metricbeat.modules:
- module: system
  period: 10s
  metricsets:
    - cpu
    - load
    - memory
    - network
    - process
    - process_summary
    - socket_summary
    - filesystem
    - fsstat
  processes: ['.*']
  process.include_top_n:
    by_cpu: 5
    by_memory: 5
  cpu.metrics: ["percentages", "normalized_percentages"]
  core.metrics: ["percentages"]

- module: system
  period: 1m
  metricsets:
    - diskio
    - uptime

  
  metricsets:
    - node
    - node_stats
    - cluster_stats
    - index
    - index_recovery
    - index_summary
    - shard
    - ml_job
  
  xpack.enabled: true

```

4. Enable specific modules and verify configuration:
```bash
# List available modules
./metricbeat modules list

# The system and elasticsearch modules should already be enabled in the config
# Test the configuration
./metricbeat test config

# Test output connection
./metricbeat test output
```

5. Setup Metricbeat assets (dashboards, index templates):
```bash
# This will create index templates and load Kibana dashboards
./metricbeat setup -e

# If you see errors, add verbose logging
./metricbeat setup -e -d "*"
```

6. Fix file permissions (if needed):

**Common Error**: `Error initializing beat: error loading config file: config file ("metricbeat.yml") must be owned by the user identifier (uid=0) or root`

This error occurs because Metricbeat checks config file ownership for security reasons.

```bash
# Solution 1: Change ownership to current user (recommended for development)
sudo chown $(whoami):$(id -gn) metricbeat.yml

# Solution 2: Change ownership to root (if running as root)
sudo chown root:root metricbeat.yml
sudo chown root:root metrics.d/system.yml

# Ensure config file has proper permissions (not world-writable)
chmod 600 metricbeat.yml

# Or use less restrictive permissions
chmod 644 metricbeat.yml

# Verify permissions
ls -la metricbeat.yml
# Should show: -rw------- or -rw-r--r-- with your user as owner
```

**Understanding the security check**:
- Metricbeat verifies config file ownership to prevent unauthorized modifications
- The file must be owned by the user running Metricbeat or by root
- The file should not be world-writable (no write permissions for "others")

7. Start Metricbeat:
```bash
# Start in foreground (for testing) - run as current user
./metricbeat -e

# If you still get permission errors, you have options:

# Option A: Disable permission check (NOT recommended for production)
./metricbeat -e --strict.perms=false

# Option B: Run as root (if config is owned by root)
sudo ./metricbeat -e

# Option C: Run as background process
./metricbeat -e &

# Option D: Install as systemd service
sudo ./metricbeat setup --index-management
sudo systemctl enable metricbeat
sudo systemctl start metricbeat
sudo systemctl status metricbeat
```

**Troubleshooting**:
```bash
# Check current user
whoami

# Check file ownership
ls -l metricbeat.yml

# Check if running as root
id

# If file is owned by root but you're not root, either:
# 1. Change ownership: sudo chown $(whoami) metricbeat.yml
# 2. Run as root: sudo ./metricbeat -e
# 3. Disable check: ./metricbeat -e --strict.perms=false
```

8. Verify Metricbeat is sending data:
```bash
GET /metricbeat-*/_search
{
  "size": 5,
  "sort": [{ "@timestamp": "desc" }]
}

GET /_cat/indices/metricbeat-*?v
```

**Verify in Kibana**:
- Open Kibana in your browser: `http://localhost:5601`
- Go to **Analytics > Discover** or **Observability > Metrics**
- In the **Metrics** section, you should see system and Elasticsearch metrics collected by Metricbeat
- You can also create a Data View for the index pattern `metricbeat-*` in **Stack Management > Data Views** to explore data in Discover

3. Check Elasticsearch module metrics:
```bash
GET /metricbeat-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "metricset.name": "node_stats" } }
      ]
    }
  },
  "size": 1,
  "_source": ["elasticsearch.node.stats.*", "@timestamp"]
}
```

4. Query system metrics:
```bash
GET /metricbeat-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "metricset.name": "cpu" } }
      ]
    }
  },
  "size": 5,
  "sort": [{ "@timestamp": "desc" }],
  "_source": ["system.cpu.*", "@timestamp", "host.name"]
}
```

5. Create a monitoring dashboard query:
```bash
GET /metricbeat-*/_search
{
  "size": 0,
  "query": {
    "range": {
      "@timestamp": { "gte": "now-1h" }
    }
  },
  "aggs": {
    "over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "fixed_interval": "5m"
      },
      "aggs": {
        "avg_cpu": {
          "avg": { "field": "system.cpu.total.pct" }
        },
        "avg_memory": {
          "avg": { "field": "system.memory.used.pct" }
        }
      }
    }
  }
}
```

**Challenge**:
- Find the peak CPU usage in the last hour
- Calculate the average heap usage percentage for Elasticsearch nodes
- Create an aggregation showing disk I/O over time

---

## Exercise 11.2: Filebeat Setup and Log Collection

**Objective**: Install and configure Filebeat to collect Elasticsearch logs and application logs.

**Instructions**:

1. Download and extract Filebeat:
```bash
# Download Filebeat
wget https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-9.0.0-linux-x86_64.tar.gz
tar -xzf filebeat-9.0.0-linux-x86_64.tar.gz
cd filebeat-9.0.0-linux-x86_64
```

2. Configure authentication for Filebeat (if cluster is secured):

**Option A - Use built-in `beats_system` user** (Recommended for getting started):
```bash
# If you haven't already done it for Metricbeat
cd /path/to/elasticsearch-9.0.0
./bin/elasticsearch-reset-password -u beats_system

# Note the generated password
```

**Option B - Create a dedicated user with specific permissions**:
```bash
# In Kibana Dev Tools
# Create custom role for Filebeat
POST /_security/role/filebeat_writer
{
  "cluster": ["monitor", "read_ilm", "read_pipeline", "manage_index_templates", "manage_ingest_pipelines"],
  "indices": [
    {
      "names": ["filebeat-*"],
      "privileges": ["create_doc", "create_index", "view_index_metadata", "auto_configure"]
    }
  ]
}

# Create the user
POST /_security/user/filebeat_internal
{
  "password": "YourSecurePassword456!",
  "roles": ["filebeat_writer", "kibana_admin", "remote_monitoring_collector"],
  "full_name": "Filebeat Internal User"
}
```

**Option C - Use API key** (More secure for production):
```bash
# In Kibana Dev Tools
POST /_security/api_key
{
  "name": "filebeat-api-key",
  "role_descriptors": {
    "filebeat_writer": {
      "cluster": ["monitor", "read_ilm", "read_pipeline"],
      "indices": [
        {
          "names": ["filebeat-*"],
          "privileges": ["auto_configure", "create_doc"]
        }
      ]
    }
  }
}

# Note the id and api_key returned
```

**Note**: If your cluster is not secured, skip this step.


3. Create sample application logs to monitor:
```bash
# Create a directory for application logs
mkdir -p /var/log/parkki-app

# Create a sample parking API log file (JSON format - one JSON object per line)
cat > /var/log/parkki-app/parking-api.log << 'EOF'
{"timestamp":"2025-01-15T10:00:00.123Z","level":"INFO","component":"API","message":"User authentication successful","user_id":"user123","ip":"192.168.1.100"}
{"timestamp":"2025-01-15T10:00:05.456Z","level":"INFO","component":"API","message":"Parking spot reserved","user_id":"user123","spot_id":"A15","parking_id":"central"}
{"timestamp":"2025-01-15T10:00:10.789Z","level":"ERROR","component":"Payment","message":"Payment processing failed","user_id":"user456","error_code":"CARD_DECLINED","amount":12.50}
{"timestamp":"2025-01-15T10:00:15.012Z","level":"WARN","component":"Capacity","message":"Parking lot nearly full","parking_id":"central","occupancy":95}
{"timestamp":"2025-01-15T10:00:20.345Z","level":"INFO","component":"Notification","message":"Email sent successfully","user_id":"user123","type":"reservation_confirmation"}
{"timestamp":"2025-01-15T10:00:25.678Z","level":"DEBUG","component":"Cache","message":"Cache hit","key":"parking_central_status","ttl":300}
{"timestamp":"2025-01-15T10:00:30.901Z","level":"ERROR","component":"Database","message":"Connection timeout","service":"parking-api","error":"connection_timeout","retry_attempt":3}
EOF

# Add executable permissions
chmod 644 /var/log/parkki-app/parking-api.log
```

4. Configure Filebeat to collect Elasticsearch logs and application logs:
```bash
# Backup original config
cp filebeat.yml filebeat.yml.backup

# Edit filebeat.yml
cat > filebeat.yml << 'EOF'
# ============================== Filebeat inputs ===============================

filebeat.inputs:
# Application logs - Parking API
- type: log
  enabled: true
  paths:
    - /var/log/parkki-app/*.log
  fields:
    service: parking-api
    environment: production
    app: parkki
  fields_under_root: true
  
  # Multi-line pattern for stack traces
  multiline.pattern: '^\d{4}-\d{2}-\d{2}'
  multiline.negate: true
  multiline.match: after
  
  # Add tags for filtering
  tags: ["application", "parkki", "api"]

# ============================== Filebeat modules ==============================

filebeat.config.modules:
  path: ${path.config}/modules.d/*.yml
  reload.enabled: true
  reload.period: 10s

# Elasticsearch module will be enabled separately

# ================================= Processors =================================

processors:
  # Add host metadata
  - add_host_metadata:
      when.not.contains.tags: forwarded
  - add_cloud_metadata: ~
  - add_docker_metadata: ~
  
  # Add custom fields
  - add_fields:
      target: ''
      fields:
        log_source: filebeat
  
  # Parse Parkki JSON application logs
  # Expected format: {"timestamp":"...","level":"INFO","component":"api","message":"...","user_id":"..."}
  - decode_json_fields:
      when.contains:
        tags: "parkki"
      fields: ["message"]
      target: ""
      overwrite_keys: true
      add_error_key: true

  # Convert timestamp string to @timestamp
  - timestamp:
      field: "timestamp"
      layouts:
        - '2006-01-02T15:04:05.999Z'
        - '2006-01-02T15:04:05Z'
        - '2006-01-02T15:04:05'
      test:
        - '2025-01-15T10:00:00.123Z'
      ignore_failure: true

  # Rename level to log.level for ECS compliance
  - rename:
      fields:
        - from: "level"
          to: "log.level"
      ignore_missing: true
      fail_on_error: false

  # Drop temporary fields to save space
  - drop_fields:
      fields: ["timestamp"]
      ignore_missing: true

# ================================== Outputs ===================================

output.elasticsearch:
  hosts: ["https://localhost:9200"]
  
  # If cluster is secured - Option A (beats_system)
  username: "beats_system"
  password: "the_password_generated_by_reset_password"
  ssl.verification_mode: none
  
  # OR Option B (custom user)
  # username: "filebeat_internal"
  # password: "YourSecurePassword456!"
  # ssl.verification_mode: none
  
  # OR Option C (API Key)
  # api_key: "your_id:your_api_key"
  # ssl.verification_mode: none
  
  # Index naming by input type
  indices:
    - index: "filebeat-parkki-%{[agent.version]}-%{+yyyy.MM.dd}"
      when.contains:
        tags: "parkki"
    - index: "filebeat-elasticsearch-%{[agent.version]}-%{+yyyy.MM.dd}"
      when.contains:
        fileset.module: "elasticsearch"
    - index: "filebeat-%{[agent.version]}-%{+yyyy.MM.dd}"

# ================================== Kibana ====================================

setup.kibana:
  host: "http://localhost:5601"
  # If Kibana is secured - use the same credentials as above
  username: "beats_system"
  password: "the_password_generated_by_reset_password"
```

5. Enable Elasticsearch module to collect Elasticsearch logs:
```bash
# Enable the Elasticsearch module
./filebeat modules enable elasticsearch

# Configure the Elasticsearch module
cat > modules.d/elasticsearch.yml << 'EOF'
# Module: elasticsearch
# Docs: https://www.elastic.co/guide/en/beats/filebeat/9.0/filebeat-module-elasticsearch.html

- module: elasticsearch
  # Server logs
  server:
    enabled: true
    var.paths:
      # Adjust this path to match your Elasticsearch logs location
      - /path/to/elasticsearch-9.0.0/logs/*.log
      - /path/to/elasticsearch-9.0.0/logs/*_server.json
    
  gc:
    enabled: true
    var.paths:
      - /path/to/elasticsearch-9.0.0/logs/gc.log.[0-9]*
      - /path/to/elasticsearch-9.0.0/logs/gc.log
  
  audit:
    enabled: false
    var.paths:
      - /path/to/elasticsearch-9.0.0/logs/*_audit.json
  
  slowlog:
    enabled: true
    var.paths:
      - /path/to/elasticsearch-9.0.0/logs/*_index_search_slowlog.log
      - /path/to/elasticsearch-9.0.0/logs/*_index_indexing_slowlog.log
  
  deprecation:
    enabled: true
    var.paths:
      - /path/to/elasticsearch-9.0.0/logs/*_deprecation.log
      - /path/to/elasticsearch-9.0.0/logs/*_deprecation.json

# Replace /path/to/elasticsearch-9.0.0 with your actual Elasticsearch path
```

**Important**: Modify the paths in `modules.d/elasticsearch.yml` to point to your actual Elasticsearch logs. 

Example for a local installation:
```bash
# Find your Elasticsearch installation
ES_HOME="/Users/emmanueldemey/elasticsearch-9.0.0"

# Update the module configuration
sed -i "s|/path/to/elasticsearch-9.0.0|${ES_HOME}|g" modules.d/elasticsearch.yml
```

6. Test configuration and setup:
```bash
# List enabled modules
./filebeat modules list

# Test the configuration
./filebeat test config

# Test output connection
./filebeat test output

# Setup index templates and Kibana dashboards
./filebeat setup -e
```

7. Start Filebeat:
```bash
# Start in foreground (for testing)
./filebeat -e

```

8. Verify Filebeat is sending data:
```bash
# Check if indices are created
GET /_cat/indices/filebeat-*?v&s=index:desc

# Search for recent logs
GET /filebeat-parkki-*/_search
{
  "size": 10,
  "sort": [{ "@timestamp": "desc" }],
  "_source": ["message", "service", "log.level", "@timestamp"]
}
```

5. Query specific log levels:
```bash
# Find all ERROR logs
GET /filebeat-parkki-*/_search
{
  "query": {
    "match": {
      "message": "ERROR"
    }
  },
  "size": 5,
  "sort": [{ "@timestamp": "desc" }]
}

# Count logs by level using aggregation
GET /filebeat-parkki-*/_search
{
  "size": 0,
  "query": {
    "range": {
      "@timestamp": { "gte": "now-1h" }
    }
  },
  "aggs": {
    "log_levels": {
      "terms": {
        "field": "message",
        "include": "(ERROR|WARN|INFO|DEBUG).*"
      }
    }
  }
}
```

6. Verify that parsing in Filebeat works:
```bash
# Verify that fields were extracted
GET /filebeat-parkki-*/_search
{
  "size": 5,
  "sort": [{ "@timestamp": "desc" }],
  "_source": ["message", "log.level", "component", "log.message", "parsed.*", "@timestamp"]
}

# Search by extracted log level
GET /filebeat-parkki-*/_search
{
  "query": {
    "term": {
      "log.level": "ERROR"
    }
  },
  "size": 5
}

# Search by extracted user_id
GET /filebeat-parkki-*/_search
{
  "query": {
    "term": {
      "parsed.user_id": "user456"
    }
  }
}

# Search by error_code
GET /filebeat-parkki-*/_search
{
  "query": {
    "term": {
      "parsed.error_code": "CARD_DECLINED"
    }
  }
}

# Aggregate by component
GET /filebeat-parkki-*/_search
{
  "size": 0,
  "aggs": {
    "by_component": {
      "terms": {
        "field": "component.keyword"
      },
      "aggs": {
        "by_level": {
          "terms": {
            "field": "log.level.keyword"
          }
        }
      }
    }
  }
}
```

**Note on parsing**: 
Parsing with **Dissect** and **KV** in Filebeat (as configured above) has several advantages over using an ingest pipeline in Elasticsearch:

✅ **Performance**: Parsing is done before sending to Elasticsearch, reducing cluster load
✅ **Simplicity**: No need to create and maintain separate ingest pipelines
✅ **Network efficiency**: Only parsed data is sent (no re-parsing needed)
✅ **Debugging**: Easier to test locally with `filebeat test`

**Expected JSON log format from your application**:
```json
{
  "timestamp": "2025-01-15T10:00:00.123Z",
  "level": "INFO",
  "component": "parking-api",
  "message": "User logged in successfully",
  "user_id": "user123",
  "parking_id": "P001",
  "response_time_ms": 45
}
```

All fields are automatically extracted and indexed in Elasticsearch.

9. Query Elasticsearch logs collected by Filebeat:
```bash
# Search Elasticsearch server logs
GET /filebeat-elasticsearch-*/_search
{
  "size": 10,
  "sort": [{ "@timestamp": "desc" }],
  "query": {
    "term": {
      "fileset.name": "server"
    }
  },
  "_source": ["message", "log.level", "@timestamp", "fileset.name"]
}

# Find ERROR logs in Elasticsearch
GET /filebeat-elasticsearch-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "fileset.module": "elasticsearch" } },
        { "match": { "log.level": "ERROR" } }
      ]
    }
  },
  "size": 5,
  "sort": [{ "@timestamp": "desc" }]
}

# Check slowlog entries
GET /filebeat-elasticsearch-*/_search
{
  "query": {
    "term": {
      "fileset.name": "slowlog"
    }
  },
  "size": 10,
  "sort": [{ "@timestamp": "desc" }]
}
```

10. Monitor log ingestion rate:
```bash
# Logs per minute
GET /filebeat-*/_search
{
  "size": 0,
  "query": {
    "range": {
      "@timestamp": { "gte": "now-1h" }
    }
  },
  "aggs": {
    "logs_over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "fixed_interval": "1m"
      },
      "aggs": {
        "by_source": {
          "terms": {
            "field": "service.keyword"
          }
        }
      }
    }
  }
}
```

**Verify in Kibana**:
- Open Kibana: `http://localhost:5601`
- Go to **Analytics > Discover**
- Create a Data View for `filebeat-*`
- In **Observability > Logs**, you will see Elasticsearch and application logs
- Go to **Analytics > Dashboard** and search for "Filebeat Elasticsearch" to see pre-configured dashboards
- The dashboards include:
  - Elasticsearch Overview
  - Elasticsearch Errors
  - Elasticsearch Slowlogs
  - GC logs analysis

**Challenge**:
- Add more logs to `/var/log/parkki-app/parking-api.log` and verify they appear in Elasticsearch with parsed fields
- Verify that fields `log.level`, `component`, `parsed.user_id`, `parsed.error_code` are properly extracted
- Create a dashboard in Kibana showing:
  - Number of errors per minute and per component
  - Distribution of error_codes
  - Top 10 user_id with the most errors
- Enable audit log in Elasticsearch and configure Filebeat to collect it

---

# Part 12: Alerting with Watcher

## Exercise 12.1: Basic Watcher Alert

**Objective**: Create alerts for cluster and application issues.

**Instructions**:

1. Create a simple error rate alert:
```bash
PUT /_watcher/watch/high_error_rate
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["logs-parkki-*"],
        "body": {
          "size": 0,
          "query": {
            "bool": {
              "must": [
                { "term": { "level": "ERROR" } },
                { "range": { "@timestamp": { "gte": "now-5m" } } }
              ]
            }
          },
          "aggs": {
            "error_count": {
              "value_count": { "field": "level.keyword" }
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.aggregations.error_count.value": {
        "gte": 10
      }
    }
  },
  "actions": {
    "log_alert": {
      "logging": {
        "text": "High error rate detected: {{ctx.payload.aggregations.error_count.value}} errors in last 5 minutes"
      }
    }
  }
}
```

2. Create a cluster health alert:
```bash
PUT /_watcher/watch/cluster_health_alert
{
  "trigger": {
    "schedule": {
      "interval": "1m"
    }
  },
  "input": {
    "http": {
      "request": {
        "host": "localhost",
        "port": 9200,
        "path": "/_cluster/health",
        "scheme": "http"
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.status": {
        "not_eq": "green"
      }
    }
  },
  "actions": {
    "log_alert": {
      "logging": {
        "text": "Cluster health is {{ctx.payload.status}}! Unassigned shards: {{ctx.payload.unassigned_shards}}"
      }
    }
  }
}
```

3. Check watcher status:
```bash
GET /_watcher/stats

GET /_watcher/watch/high_error_rate

GET /_watcher/watch/cluster_health_alert
```

4. Execute a watch manually:
```bash
POST /_watcher/watch/high_error_rate/_execute
{
  "ignore_condition": true
}
```

5. View watch history:
```bash
GET /.watcher-history-*/_search
{
  "query": {
    "term": { "watch_id": "high_error_rate" }
  },
  "sort": [{ "trigger_event.triggered_time": "desc" }],
  "size": 5
}
```

**Challenge**:
- Modify the error rate alert to also check for specific error codes
- Create an alert that triggers when disk usage exceeds 80%
- Add a throttle to prevent alert fatigue (max 1 alert per hour)

---

## Exercise 12.2: Advanced Alerting with Conditions

**Objective**: Create complex multi-condition alerts.

**Instructions**:

1. Create an alert with multiple conditions:
```bash
PUT /_watcher/watch/parking_capacity_alert
{
  "trigger": {
    "schedule": {
      "interval": "2m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["parkki-metrics"],
        "body": {
          "size": 0,
          "query": {
            "bool": {
              "must": [
                { "term": { "metric_type": "occupancy" } },
                { "range": { "@timestamp": { "gte": "now-10m" } } }
              ]
            }
          },
          "aggs": {
            "by_parking": {
              "terms": { "field": "parking_id" },
              "aggs": {
                "avg_occupancy": { "avg": { "field": "value" } },
                "max_occupancy": { "max": { "field": "value" } }
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "script": {
      "source": """
        def buckets = ctx.payload.aggregations.by_parking.buckets;
        for (bucket in buckets) {
          if (bucket.max_occupancy.value >= 95) {
            return true;
          }
        }
        return false;
      """
    }
  },
  "transform": {
    "script": {
      "source": """
        def alerts = [];
        def buckets = ctx.payload.aggregations.by_parking.buckets;
        for (bucket in buckets) {
          if (bucket.max_occupancy.value >= 95) {
            alerts.add([
              'parking': bucket.key,
              'occupancy': bucket.max_occupancy.value
            ]);
          }
        }
        return ['alerts': alerts, 'count': alerts.size()];
      """
    }
  },
  "actions": {
    "log_alert": {
      "logging": {
        "text": "Parking capacity critical! {{ctx.payload.count}} parking(s) at >95%: {{ctx.payload.alerts}}"
      }
    }
  }
}
```

2. Create a response time degradation alert:
```bash
PUT /_watcher/watch/response_time_degradation
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "chain": {
      "inputs": [
        {
          "current": {
            "search": {
              "request": {
                "indices": ["parkki-metrics"],
                "body": {
                  "size": 0,
                  "query": {
                    "bool": {
                      "must": [
                        { "term": { "metric_type": "response_time" } },
                        { "range": { "@timestamp": { "gte": "now-5m" } } }
                      ]
                    }
                  },
                  "aggs": {
                    "p95": { "percentiles": { "field": "value", "percents": [95] } }
                  }
                }
              }
            }
          }
        },
        {
          "baseline": {
            "search": {
              "request": {
                "indices": ["parkki-metrics"],
                "body": {
                  "size": 0,
                  "query": {
                    "bool": {
                      "must": [
                        { "term": { "metric_type": "response_time" } },
                        { "range": { "@timestamp": { "gte": "now-1h", "lte": "now-5m" } } }
                      ]
                    }
                  },
                  "aggs": {
                    "p95": { "percentiles": { "field": "value", "percents": [95] } }
                  }
                }
              }
            }
          }
        }
      ]
    }
  },
  "condition": {
    "script": {
      "source": """
        def current_p95 = ctx.payload.current.aggregations.p95.values['95.0'];
        def baseline_p95 = ctx.payload.baseline.aggregations.p95.values['95.0'];
        return current_p95 > baseline_p95 * 2;
      """
    }
  },
  "actions": {
    "log_alert": {
      "logging": {
        "text": "Response time degradation detected! Current P95 is more than 2x baseline."
      }
    }
  }
}
```

3. Activate/deactivate watches:
```bash
# Deactivate a watch
PUT /_watcher/watch/high_error_rate/_deactivate

# Activate a watch
PUT /_watcher/watch/high_error_rate/_activate

# Check status
GET /_watcher/watch/high_error_rate
```

4. Delete a watch:
```bash
DELETE /_watcher/watch/response_time_degradation
```

**Challenge**:
- Create an alert that detects sudden spikes (3x normal) in any metric
- Build a watch that correlates high error rates with high response times
- Add email action to send alerts (configure with your SMTP settings)

---

## Exercise 12.3: Alerting Best Practices

**Objective**: Implement production-ready alerting patterns.

**Instructions**:

1. Create an alert with throttling:
```bash
PUT /_watcher/watch/throttled_error_alert
{
  "trigger": {
    "schedule": {
      "interval": "1m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["logs-parkki-*"],
        "body": {
          "size": 0,
          "query": {
            "bool": {
              "must": [
                { "term": { "level": "ERROR" } },
                { "range": { "@timestamp": { "gte": "now-1m" } } }
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total.value": { "gte": 5 }
    }
  },
  "throttle_period": "30m",
  "actions": {
    "log_alert": {
      "logging": {
        "text": "Error threshold exceeded: {{ctx.payload.hits.total.value}} errors"
      }
    }
  }
}
```

2. Create a watch with acknowledgement:
```bash
PUT /_watcher/watch/critical_system_alert
{
  "trigger": {
    "schedule": {
      "interval": "1m"
    }
  },
  "input": {
    "http": {
      "request": {
        "host": "localhost",
        "port": 9200,
        "path": "/_cat/nodes?format=json&h=name,heap.percent"
      }
    }
  },
  "condition": {
    "script": {
      "source": """
        for (node in ctx.payload) {
          if (node['heap.percent'] != null && Integer.parseInt(node['heap.percent']) > 90) {
            return true;
          }
        }
        return false;
      """
    }
  },
  "actions": {
    "log_critical": {
      "logging": {
        "text": "CRITICAL: Node heap usage above 90%!"
      }
    }
  }
}
```

3. Acknowledge an alert:
```bash
PUT /_watcher/watch/critical_system_alert/_ack
```

4. View acknowledgement status:
```bash
GET /_watcher/watch/critical_system_alert?filter_path=status.actions
```

**Challenge**:
- Implement an escalation pattern (warn -> critical -> page)
- Create a maintenance window by deactivating watches on schedule
- Build a watch that auto-resolves when the condition clears

---
RPn1ndPv-yexJ=7sKn3T

eyJ2ZXIiOiI4LjE0LjAiLCJhZHIiOlsiMTI3LjAuMC4xOjkyMDAiXSwiZmdyIjoiNmU5MGNkZDhlOGI1Njc1OTNjNzdiZWE2NDk4NDEzOWM3YWVlNmI1ODJiZmQwZTdlODJkNjEzMWI3YWVmY2FlZSIsImtleSI6InZzdmJ1NXNCS0FVS1NtOURNc0tvOmlpZ3pteXlkYVRCSzJMdG9oUkNOdHcifQ==


# Part 13: Security

## Exercise 13.1: User and Role Management

**Objective**: Configure users, roles, and permissions.

**Note**: Security must be enabled for these exercises. If using the training Docker setup without security, these are simulation exercises.

**Instructions**:

1. Create a role for parking operators:
```bash
PUT /_security/role/parking_operator
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["parking-*", "logs-parkki-*"],
      "privileges": ["read", "view_index_metadata"],
      "field_security": {
        "grant": ["*"],
        "except": ["user_id", "payment_details"]
      }
    },
    {
      "names": ["reservations"],
      "privileges": ["read", "write", "delete"],
      "query": {
        "term": { "parking_id": "{{_user.metadata.parking_id}}" }
      }
    }
  ]
}
```

2. Create a role for data analysts:
```bash
PUT /_security/role/data_analyst
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["transactions", "parkki-metrics"],
      "privileges": ["read"],
      "field_security": {
        "grant": ["@timestamp", "parking_id", "amount", "duration_minutes", "spot_type"]
      }
    }
  ],
  "applications": [
    {
      "application": "kibana-.kibana",
      "privileges": ["feature_dashboard.read", "feature_discover.read"],
      "resources": ["*"]
    }
  ]
}
```

3. Create users:
```bash
PUT /_security/user/operator_paris
{
  "password": "operator123!",
  "roles": ["parking_operator"],
  "full_name": "Paris Parking Operator",
  "email": "operator@parkki-paris.com",
  "metadata": {
    "parking_id": "central"
  }
}

PUT /_security/user/analyst_john
{
  "password": "analyst123!",
  "roles": ["data_analyst"],
  "full_name": "John Analyst",
  "email": "john@parkki.com"
}
```

4. Test user permissions:
```bash
# Run as a specific user
POST /_security/user/_has_privileges
{
  "cluster": ["manage", "monitor"],
  "index": [
    {
      "names": ["transactions"],
      "privileges": ["read", "write"]
    }
  ]
}
```

**Challenge**:
- Create a role that can only read documents from the last 7 days

---

## Exercise 13.2: API Keys and Service Accounts

**Objective**: Manage programmatic access to Elasticsearch.

**Instructions**:

1. Create an API key:
```bash
POST /_security/api_key
{
  "name": "parking-api-key",
  "expiration": "30d",
  "role_descriptors": {
    "parking_read": {
      "cluster": ["monitor"],
      "indices": [
        {
          "names": ["parking-*"],
          "privileges": ["read"]
        }
      ]
    }
  },
  "metadata": {
    "application": "parking-api",
    "environment": "production"
  }
}
```

2. Create a more restricted API key:
```bash
POST /_security/api_key
{
  "name": "metrics-writer",
  "role_descriptors": {
    "metrics_write": {
      "indices": [
        {
          "names": ["parkki-metrics"],
          "privileges": ["create_index", "write"]
        }
      ]
    }
  }
}
```

3. List API keys:
```bash
GET /_security/api_key?owner=true

GET /_security/api_key?name=parking-*
```

4. Get API key info:
```bash
GET /_security/api_key?id=<api_key_id>
```

5. Invalidate an API key:
```bash
DELETE /_security/api_key
{
  "name": "metrics-writer"
}
```


**Challenge**:
- Create an API key that expires in 1 hour for temporary access
- Create different API keys for read and write operations

---

## Exercise 13.3: Audit Logging

**Objective**: Configure and analyze security audit logs.

**Instructions**:

1. Check audit settings:
```bash
GET /_cluster/settings?include_defaults=true&filter_path=*.xpack.security.audit
```

2. Query audit logs (if enabled):
```bash
GET /.security-audit-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "sort": [{ "@timestamp": "desc" }],
  "size": 20
}
```

3. Find failed authentication attempts:
```bash
GET /.security-audit-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "event.action": "authentication_failed" } }
      ]
    }
  },
  "aggs": {
    "by_user": {
      "terms": { "field": "user.name" }
    },
    "by_ip": {
      "terms": { "field": "source.ip" }
    }
  }
}
```

4. Detect suspicious activity patterns:
```bash
GET /.security-audit-*/_search
{
  "size": 0,
  "query": {
    "range": { "@timestamp": { "gte": "now-24h" } }
  },
  "aggs": {
    "by_action": {
      "terms": { "field": "event.action" },
      "aggs": {
        "by_user": {
          "terms": { "field": "user.name", "size": 5 }
        }
      }
    }
  }
}
```

5. Create a security dashboard query:
```bash
GET /.security-audit-*/_search
{
  "size": 0,
  "query": {
    "range": { "@timestamp": { "gte": "now-7d" } }
  },
  "aggs": {
    "auth_over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "day"
      },
      "aggs": {
        "success": {
          "filter": { "term": { "event.action": "authentication_success" } }
        },
        "failed": {
          "filter": { "term": { "event.action": "authentication_failed" } }
        }
      }
    }
  }
}
```

**Challenge**:
- Find all privilege escalation attempts
- Detect brute force attacks (multiple failed logins from same IP)
- Create a query that identifies off-hours access

---

# Part 14: APM (Application Performance Monitoring)

## Exercise 14.0: APM Server Installation and Configuration

**Objective**: Download, install, and configure APM Server to work with a secured Elasticsearch cluster.

**Instructions**:

### Step 1: Download and Extract APM Server

```bash
# Download APM Server
wget https://artifacts.elastic.co/downloads/apm-server/apm-server-9.0.0-linux-x86_64.tar.gz
tar -xzf apm-server-9.0.0-linux-x86_64.tar.gz
cd apm-server-9.0.0-linux-x86_64
```

### Step 2: Configure Authentication (if cluster is secured)

```bash
# Go to Elasticsearch directory
cd /path/to/elasticsearch-9.0.0

# Reset password for apm_system user (if it exists)
./bin/elasticsearch-reset-password -u apm_system

# Note the generated password
```

### Step 3: Choose APM Agent Authentication Method (Optional)

APM Server supports multiple authentication methods for agents. **Authentication is optional** - you can choose one method or disable it entirely:

**Option A - No Authentication** (Simplest - Good for development/testing):
```yaml
# No authentication required - agents can send data freely
# WARNING: Only use this in trusted, isolated environments
apm-server:
  auth:
    anonymous:
      enabled: true
      allow_agent: ["rum-js", "js-base", "nodejs", "python", "java", "go", ".NET"]
      allow_service: []  # Empty array = allow all services
      rate_limit:
        ip_limit: 1000
        event_limit: 300
```

**Option B - Secret Token** (Simple shared authentication):
```bash
# Generate a random secret token (Linux/Mac)
openssl rand -base64 32

# OR use this command
head -c 32 /dev/urandom | base64

# Save this token, you'll need it in the APM Server config and in your applications
# Example output: qX7vK9mN2pL4sT8uR6wY0zA3bC5dE1fG
```

**Option C - API Key** (Recommended for production - individual keys per agent):
```bash
# In Kibana Dev Tools - Create an API key for agent authentication
POST /_security/api_key
{
  "name": "apm-agent-key-service-a",
  "role_descriptors": {},
  "metadata": {
    "application": "apm-agent",
    "service": "service-a"
  }
}

# Use the returned api_key in your agents
```

**Comparison**:

| Method | Security | Use Case | Agent Config Required | Production Ready |
|--------|----------|----------|----------------------|------------------|
| **Anonymous** | ❌ None | Dev/Testing only | No | ❌ |
| **Secret Token** | ✅ Basic | Shared across all agents | `secretToken: "xxx"` | ⚠️ OK |
| **API Key** | ✅✅ Best | Individual keys per service | `apiKey: "xxx"` | ✅ |

**Important**: This authentication is for **Agents → APM Server**, not for **APM Server → Elasticsearch** (which was configured in Step 2).

**Recommendation**: 
- **Development**: Use anonymous auth for simplicity
- **Staging/Production**: Use API Keys for better security and traceability

### Step 4: Configure APM Server

```bash
# Backup original config
cp apm-server.yml apm-server.yml.backup

# Edit apm-server.yml
# ================================ APM Server ==================================

apm-server:
  # Defines the host and port the server is listening on
  host: "localhost:8200"
  
  # Maximum permitted size in bytes of a request's header accepted by the server
  max_header_size: 1048576
  
  # Maximum amount of time to wait for the next incoming request before timeout
  read_timeout: 3600s
  
  # Maximum duration before releasing resources when shutting down
  shutdown_timeout: 30s
  
  # Agent Authentication - Choose ONE of the following options:
  
  # Option 1: No authentication (Development only)
  auth:
    anonymous:
      enabled: true
      allow_agent: ["rum-js", "js-base", "nodejs", "python", "java", "go", ".NET"]
      allow_service: []
      rate_limit:
        ip_limit: 1000
        event_limit: 300
  
  # Option 2: Secret Token (Shared authentication) - Uncomment to use
  # auth:
  #   secret_token: "qX7vK9mN2pL4sT8uR6wY0zA3bC5dE1fG"
  
  # Option 3: API Key (Best for production) - Uncomment to use
  # auth:
  #   api_key:
  #     enabled: true
  #     limit: 100

# ================================= Outputs ====================================

output.elasticsearch:
  hosts: ["https://localhost:9200"]
  
  # If cluster is secured - Option A (custom user)
  username: "apm_system"
  password: "YourSecureAPMPassword123!"
  ssl.verification_mode: none
  
  # OR Option B (API Key) - uncomment and comment username/password
  # api_key: "VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6dWkybHAyYXhUTm1zeWFrdzl0dk5udw=="
  # ssl.verification_mode: none
  
  # Data stream naming
  # APM Server 8.0+ uses data streams
  indices:
    - index: "traces-apm-%{[observer.version]}"
      when.contains:
        processor.event: "transaction"
    - index: "traces-apm-%{[observer.version]}"
      when.contains:
        processor.event: "span"
    - index: "logs-apm.error-%{[observer.version]}"
      when.contains:
        processor.event: "error"
    - index: "metrics-apm.internal-%{[observer.version]}"
      when.contains:
        processor.event: "metric"

# ================================== Kibana ====================================

setup.kibana:
  host: "http://localhost:5601"
  # If Kibana is secured
  username: "apm_system"
  password: "YourSecureAPMPassword123!"

# ================================ Index Lifecycle =============================

# Enable ILM for automatic index lifecycle management
setup.ilm.enabled: auto
setup.ilm.check_exists: true

# ================================== Logging ===================================

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/apm-server
  name: apm-server
  keepfiles: 7
  permissions: 0644

# ================================= Monitoring =================================

# Enable self-monitoring (send APM Server metrics to Elasticsearch)
monitoring.enabled: true
monitoring.elasticsearch:
  hosts: ["https://localhost:9200"]
  username: "apm_system"
  password: "YourSecureAPMPassword123!"
  ssl.verification_mode: none

```

### Step 5: Setup APM Server Assets

```bash
# This will create index templates and load Kibana dashboards
./apm-server setup -e
```

### Step 6: Test Configuration

```bash
# Test the configuration file
./apm-server test config

# Test connection to Elasticsearch
./apm-server test output
```

### Step 7: Start APM Server

```bash
# Start in foreground (for testing)
./apm-server -e
```

### Step 8: Verify APM Server is Running

```bash
# Check APM Server health
curl http://localhost:8200/

# Expected response:
# {
#   "build_date": "2024-XX-XXT00:00:00Z",
#   "build_sha": "xxxxx",
#   "publish_ready": true,
#   "version": "9.0.0"
# }

# Test with secret token
curl -H "Authorization: Bearer qX7vK9mN2pL4sT8uR6wY0zA3bC5dE1fG" \
  http://localhost:8200/

# Check APM indices in Elasticsearch
GET /_cat/indices/traces-apm*,logs-apm*,metrics-apm*?v
```

### Step 9: Verify in Kibana

- Open Kibana: `http://localhost:5601`
- Go to **Observability > APM**
- You should see the APM interface ready (no services yet, we'll add them in Exercise 14.1)
- Check that APM integration is properly configured

**Important Notes**:

1. **Authentication**: Choose the authentication method that fits your environment:
   ```javascript
   // In your Node.js app
   const apm = require('elastic-apm-node').start({
     serverUrl: 'http://localhost:8200',
     serviceName: 'my-service',
     
     // Only add secretToken OR apiKey if APM Server requires auth:
     // secretToken: 'qX7vK9mN2pL4sT8uR6wY0zA3bC5dE1fG',  // For secret token auth
     // apiKey: 'your-api-key',  // For API key auth
     // (no auth params needed for anonymous mode)
   });
   ```

2. **Firewall**: Ensure port 8200 is accessible from your applications

---

## Exercise 14.1: Hands-on APM with Node.js Applications

**Objective**: Set up APM monitoring with two simple Node.js applications demonstrating distributed tracing.

**Architecture**: We'll create two services:
- **Service A (API Gateway)**: HTTP server that receives requests and calls Service B
- **Service B (Backend)**: HTTP server that processes requests

### Prerequisites

Ensure APM Server is running and accessible (completed in Exercise 14.0).
```bash
# Check APM Server is running
curl http://localhost:8200/

# Expected response: {"build_date":"...","build_sha":"...","publish_ready":true,"version":"9.0.0"}
```

### Step 1: Create Service B (Backend Service)

Create a directory for Service B:
```bash
mkdir -p apm-demo/service-b
cd apm-demo/service-b
```

Create `package.json`:
```json
{
  "name": "service-b",
  "version": "1.0.0",
  "description": "Backend service for APM demo",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "elastic-apm-node": "^4.7.3"
  }
}
```

Create `index.js`:
```javascript
// IMPORTANT: APM must be initialized FIRST, before any other require
const apm = require('elastic-apm-node').start({
  serviceName: 'parking-backend',
  serverUrl: 'http://localhost:8200',
  
  // Authentication options (choose one based on APM Server config):
  
  // Option 1: No auth (if APM Server has anonymous auth enabled)
  // No secretToken or apiKey needed
  
  // Option 2: Secret Token (if APM Server uses secret_token)
  // secretToken: 'qX7vK9mN2pL4sT8uR6wY0zA3bC5dE1fG',
  
  // Option 3: API Key (if APM Server uses API key auth)
  // apiKey: 'your-api-key-here',
  
  environment: 'development',

  // Capture all transactions for demo
  transactionSampleRate: 1.0,

  // Capture request/response bodies and headers
  captureBody: 'all',
  captureHeaders: true,

  // Log APM activity
  logLevel: 'info'
});

const http = require('http');
const url = require('url');

const PORT = 3001;

// Simulate database query
function simulateDbQuery(parkingId) {
  // APM automatically creates a span for this operation
  const span = apm.startSpan('SELECT FROM parkings', 'db', 'postgresql', 'query');

  // Simulate varying query times
  const duration = Math.random() * 100 + 50; // 50-150ms

  return new Promise((resolve) => {
    setTimeout(() => {
      if (span) {
        // Add context to the span
        span.addLabels({
          'db.statement': `SELECT * FROM parkings WHERE id = '${parkingId}'`,
          'db.rows_affected': 1
        });
        span.end();
      }

      resolve({
        id: parkingId,
        name: `Parking ${parkingId}`,
        available_spots: Math.floor(Math.random() * 100),
        total_spots: 200
      });
    }, duration);
  });
}

// Simulate external API call
function simulateExternalApiCall() {
  const span = apm.startSpan('GET weather-api', 'external', 'http', 'request');

  // Simulate API call (sometimes slow)
  const duration = Math.random() < 0.2 ? Math.random() * 500 + 200 : Math.random() * 50 + 20;

  return new Promise((resolve) => {
    setTimeout(() => {
      if (span) {
        span.addLabels({
          'http.url': 'https://api.weather.com/parking-weather',
          'http.method': 'GET',
          'http.status_code': 200
        });
        span.end();
      }

      resolve({
        weather: 'sunny',
        temperature: 22
      });
    }, duration);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Get current transaction (automatically created by APM)
  const transaction = apm.currentTransaction;
  if (transaction) {
    // Add custom labels for business context
    transaction.addLabels({
      'service.role': 'backend',
      'user.id': parsedUrl.query.user_id || 'anonymous'
    });
  }

  console.log(`[Service B] ${req.method} ${path}`);

  try {
    if (path === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'service-b' }));
      return;
    }

    if (path === '/api/parking') {
      const parkingId = parsedUrl.query.id || 'central';

      // Simulate processing with multiple operations
      // APM will automatically create spans for each async operation
      const [parkingData, weatherData] = await Promise.all([
        simulateDbQuery(parkingId),
        simulateExternalApiCall()
      ]);

      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 10));

      const response = {
        ...parkingData,
        weather: weatherData,
        timestamp: new Date().toISOString()
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      return;
    }

    if (path === '/api/slow') {
      // Simulate a slow endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Slow response' }));
      return;
    }

    if (path === '/api/error') {
      // Simulate an error
      throw new Error('Simulated backend error');
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('[Service B] Error:', error);

    // APM automatically captures the error with full context
    apm.captureError(error);

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Service B listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
```

### Step 2: Create Service A (API Gateway)

Create a directory for Service A:
```bash
cd ..
mkdir -p service-a
cd service-a
```

Create `package.json`:
```json
{
  "name": "service-a",
  "version": "1.0.0",
  "description": "API Gateway for APM demo",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "elastic-apm-node": "^4.7.3"
  }
}
```

Create `index.js`:
```javascript
// IMPORTANT: APM must be initialized FIRST
const apm = require('elastic-apm-node').start({
  serviceName: 'parking-api-gateway',
  serverUrl: 'http://localhost:8200',
  
  // Authentication options (choose one based on APM Server config):
  
  // Option 1: No auth (if APM Server has anonymous auth enabled)
  // No secretToken or apiKey needed
  
  // Option 2: Secret Token (if APM Server uses secret_token)
  // secretToken: 'qX7vK9mN2pL4sT8uR6wY0zA3bC5dE1fG',
  
  // Option 3: API Key (if APM Server uses API key auth)
  // apiKey: 'your-api-key-here',
  
  environment: 'development',

  // Capture all transactions for demo
  transactionSampleRate: 1.0,

  // Capture request/response bodies and headers
  captureBody: 'all',
  captureHeaders: true,

  // Use path as transaction name for better grouping
  usePathAsTransactionName: true,

  logLevel: 'info'
});

const http = require('http');
const url = require('url');

const PORT = 3000;
const SERVICE_B_URL = 'http://localhost:3001';

// Call Service B
// APM will automatically instrument this HTTP call and propagate trace context!
function callServiceB(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Service-A/1.0'
        // No need to manually add traceparent header - APM does it automatically!
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Service B returned ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      // APM automatically captures errors with trace context
      apm.captureError(error);
      reject(error);
    });

    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Get current transaction (automatically created by APM for incoming HTTP requests)
  const transaction = apm.currentTransaction;
  if (transaction) {
    // Add custom business labels
    transaction.addLabels({
      'service.role': 'gateway',
      'user.id': parsedUrl.query.user_id || 'anonymous',
      'parking.id': parsedUrl.query.id || 'unknown'
    });
  }

  console.log(`[Service A] ${req.method} ${path}`);

  try {
    if (path === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'service-a' }));
      return;
    }

    if (path === '/api/parking/status') {
      const parkingId = parsedUrl.query.id || 'central';

      // Call Service B - APM automatically creates a span and propagates trace context!
      const backendData = await callServiceB(`/api/parking?id=${parkingId}`);

      // Add some gateway-level processing
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 5));

      const response = {
        ...backendData,
        gateway: {
          processed_at: new Date().toISOString(),
          service: 'api-gateway'
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      return;
    }

    if (path === '/api/slow') {
      // This will trigger slow responses through the chain
      const backendData = await callServiceB('/api/slow');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Slow request completed',
        backend: backendData
      }));
      return;
    }

    if (path === '/api/error') {
      // This will trigger an error in Service B
      try {
        await callServiceB('/api/error');
      } catch (error) {
        throw new Error(`Backend error: ${error.message}`);
      }
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('[Service A] Error:', error);

    // APM automatically captures the error with full trace context
    apm.captureError(error);

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Service A (Gateway) listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Try: curl "http://localhost:${PORT}/api/parking/status?id=central"`);
});
```

### Step 2: Install Dependencies and Run

Open two terminal windows.

**Terminal 1 - Service B:**
```bash
cd apm-demo/service-b
npm install
npm start
```

**Terminal 2 - Service A:**
```bash
cd apm-demo/service-a
npm install
npm start
```

### Step 3: Generate Traffic

Open a third terminal and generate various types of requests:

```bash
# Normal requests
curl "http://localhost:3000/api/parking/status?id=central"
curl "http://localhost:3000/api/parking/status?id=north&user_id=user123"
curl "http://localhost:3000/api/parking/status?id=south&user_id=user456"

# Slow request
curl "http://localhost:3000/api/slow"

# Error request (will generate 500 error)
curl "http://localhost:3000/api/error"

# Generate continuous load (run in background)
for i in {1..50}; do
  curl -s "http://localhost:3000/api/parking/status?id=parking-$((RANDOM % 5))&user_id=user$((RANDOM % 10))" > /dev/null
  sleep 0.5
done
```

### Step 5: Analyze APM Data in Kibana

1. **Open Kibana APM**: Navigate to `http://localhost:5601/app/apm`

2. **View Services**:
   - You should see two services: `parking-api-gateway` and `parking-backend`
   - Check the service overview metrics (throughput, latency, error rate)

3. **View Transactions**:
```bash
GET /traces-apm*/_search
{
  "size": 10,
  "query": {
    "bool": {
      "must": [
        { "term": { "processor.event": "transaction" } },
        { "range": { "@timestamp": { "gte": "now-15m" } } }
      ]
    }
  },
  "sort": [{ "@timestamp": "desc" }],
  "_source": [
    "transaction.name",
    "transaction.duration.us",
    "service.name",
    "trace.id",
    "labels.user\\.id",
    "@timestamp"
  ]
}
```

4. **Trace Complete Request Path (The Magic!)** ⭐:
```bash
# Step 1: Find a trace ID from Service A
GET /traces-apm*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "service.name": "parking-api-gateway" } },
        { "term": { "processor.event": "transaction" } }
      ]
    }
  },
  "size": 1,
  "_source": ["trace.id", "transaction.name", "@timestamp"]
}

# Step 2: Get ALL events for that trace (both services automatically linked!)
GET /traces-apm*/_search
{
  "query": {
    "term": { "trace.id": "YOUR_TRACE_ID_HERE" }
  },
  "sort": [{ "timestamp.us": "asc" }],
  "size": 100,
  "_source": [
    "processor.event",
    "transaction.name",
    "transaction.id",
    "span.name",
    "service.name",
    "transaction.duration.us",
    "span.duration.us",
    "parent.id"
  ]
}
# This proves automatic distributed tracing - same trace.id across both services!
```

5. **Analyze Slow Transactions**:
```bash
GET /traces-apm*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "processor.event": "transaction" } },
        { "range": { "transaction.duration.us": { "gte": 500000 } } }
      ]
    }
  },
  "sort": [{ "transaction.duration.us": "desc" }],
  "size": 5,
  "_source": [
    "transaction.name",
    "span.name",
    "service.name",
    "transaction.duration.us",
    "span.duration.us",
    "parent.id",
    "labels.user\\.id"
  ]
}
```

6. **View Spans for Database Queries**:
```bash
GET /traces-apm*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "processor.event": "span" } },
        { "term": { "span.type": "db" } },
        { "range": { "@timestamp": { "gte": "now-15m" } } }
      ]
    }
  },
  "size": 10,
  "_source": [
    "span.name",
    "span.duration.us",
    "service.name",
    "trace.id",
    "labels"
  ]
}
```

7. **Calculate Service Statistics**:
```bash
GET /traces-apm*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "must": [
        { "term": { "processor.event": "transaction" } },
        { "range": { "@timestamp": { "gte": "now-15m" } } }
      ]
    }
  },
  "aggs": {
    "by_service": {
      "terms": { "field": "service.name" },
      "aggs": {
        "avg_duration_ms": {
          "avg": {
            "script": { "source": "doc['transaction.duration.us'].value / 1000" }
          }
        },
        "percentiles": {
          "percentiles": {
            "field": "transaction.duration.us",
            "percents": [50, 95, 99]
          }
        },
        "by_transaction": {
          "terms": { "field": "transaction.name" },
          "aggs": {
            "count": { "value_count": { "field": "transaction.id" } },
            "avg_duration_ms": {
              "avg": {
                "script": { "source": "doc['transaction.duration.us'].value / 1000" }
              }
            }
          }
        }
      }
    }
  }
}
```

8. **Trace Full Request Path**:
```bash
# Find a trace ID from Service A transaction
GET /traces-apm*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "service.name": "parking-api-gateway" } },
        { "term": { "processor.event": "transaction" } }
      ]
    }
  },
  "size": 1,
  "_source": ["trace.id"]
}

# Then get ALL events (transaction + spans) for that trace
GET /traces-apm*/_search
{
  "query": {
    "term": { "trace.id": "YOUR_TRACE_ID" }
  },
  "sort": [{ "timestamp.us": "asc" }],
  "size": 100,
  "_source": [
    "processor.event",
    "transaction.name",
    "span.name",
    "service.name",
    "transaction.duration.us",
    "span.duration.us",
    "parent.id",
    "labels.user\\.id"
  ]
}
```

### Bonus Activities

#### 1. Add Custom Metrics

Enhance Service A to track custom metrics:

```javascript
// Add after APM initialization in Service A
setInterval(() => {
  const memUsage = process.memoryUsage();

  apm.setCustomContext({
    memory: {
      rss_mb: Math.round(memUsage.rss / 1024 / 1024),
      heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024)
    }
  });
}, 10000);
```

#### 2. Add More Custom Spans

Track specific operations:

```javascript
// In Service A, time the response processing:
const processingSpan = apm.startSpan('process-gateway-response', 'app');
// ... do processing ...
if (processingSpan) processingSpan.end();
```

### Cleanup

Stop both services with `Ctrl+C` and optionally remove the demo directory:
```bash
cd ../..
rm -rf apm-demo
```

---

# Cleanup

## Remove All Test Indices and Resources

```bash
# Delete test indices
DELETE /products
DELETE /logs-parkki
DELETE /reservations
DELETE /parking-events
DELETE /parking-lots
DELETE /parking-with-spots
DELETE /parking-flat
DELETE /parking-nested
DELETE /logs-parkki-*
DELETE /logs-nginx-*
DELETE /articles
DELETE /parking-locations
DELETE /transactions
DELETE /logs-test
DELETE /test-shrink
DELETE /test-optimization*
DELETE /logs-ilm-*
DELETE /logs-ds-*
DELETE /metrics-*
DELETE /processed-logs
DELETE /parking-info
DELETE /failed-logs
DELETE /parkki-metrics
DELETE /apm-custom-metrics

# Delete templates
DELETE /_index_template/logs-template
DELETE /_index_template/logs-parkki-template
DELETE /_index_template/logs-with-ilm
DELETE /_index_template/logs-ds-template
DELETE /_index_template/metrics-template

DELETE /_component_template/base-settings
DELETE /_component_template/logs-mappings
DELETE /_component_template/parkki-mappings
DELETE /_component_template/logs-common

# Delete pipelines
DELETE /_ingest/pipeline/parking-logs-pipeline
DELETE /_ingest/pipeline/app-logs-parser
DELETE /_ingest/pipeline/access-logs-parser
DELETE /_ingest/pipeline/enrich-parking-events
DELETE /_ingest/pipeline/logs-pipeline
DELETE /_ingest/pipeline/apache-logs
DELETE /_ingest/pipeline/parking-enrichment

# Delete enrich policies
DELETE /_enrich/policy/parking-lookup

# Delete ILM policies
DELETE /_ilm/policy/parkki-logs-policy
DELETE /_ilm/policy/logs-lifecycle

# Delete search templates
DELETE /_scripts/parking-search

# Delete watchers
DELETE /_watcher/watch/high_error_rate
DELETE /_watcher/watch/cluster_health_alert
DELETE /_watcher/watch/parking_capacity_alert
DELETE /_watcher/watch/response_time_degradation
DELETE /_watcher/watch/throttled_error_alert
DELETE /_watcher/watch/critical_system_alert

# Delete security resources (if security is enabled)
DELETE /_security/role/parking_operator
DELETE /_security/role/data_analyst
DELETE /_security/user/operator_paris
DELETE /_security/user/analyst_john
```

---

# Summary

| Part | Topic | Key Skills | Challenge Level |
|------|-------|------------|-----------------|
| 2 | Installation | Docker setup, cluster health, node analysis | Basic |
| 3 | Indexing | CRUD, Bulk API, optimistic locking | Intermediate |
| 4 | Mapping | Analyzers, multi-fields, nested, templates | Intermediate |
| 5 | Search | Full-text, bool, geo, scoring | Advanced |
| 6 | Aggregations | Metrics, buckets, pipelines, nested | Advanced |
| 7 | Ingest | Multi-processor, grok, enrichment | Intermediate |
| 8 | ILM | Policies, data streams, optimization | Intermediate |
| 9 | Troubleshooting | Diagnostics, JVM, profiling | Advanced |
| 10 | Audit | Full cluster analysis | Advanced |
| 11 | Monitoring | Metricbeat, self-monitoring, custom metrics | Advanced |
| 12 | Alerting | Watcher, conditions, throttling | Advanced |
| 13 | Security | Roles, users, API keys, audit logs | Advanced |
| 14 | APM | Transactions, traces, latency analysis | Advanced |

**Next Steps**:
- Apply these techniques to your production cluster
- Set up monitoring dashboards in Kibana
- Configure alerting for critical metrics
- Review and optimize your mappings regularly
- Implement proper security with role-based access control
- Configure APM agents for your application services
