# Elasticsearch Parkki Training - Practical Exercises

## Overview

Each exercise is **autonomous** - you can complete them in any order without dependencies on other exercises.

All exercises use the Kibana Dev Tools console. Access it at: `http://localhost:5601/app/dev_tools#/console`

---

# Part 2: Installation and Configuration

## Exercise 2.1: Starting Elasticsearch and First Health Check

**Objective**: Install, start Elasticsearch and verify it's running correctly.

### Step 1: Start Elasticsearch

**Option A: Using Docker (recommended for training)**
```bash
# Create a network
docker network create elastic

# Start Elasticsearch
docker run -d --name elasticsearch \
  --net elastic \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "xpack.security.enrollment.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:9.0.0

# Start Kibana
docker run -d --name kibana \
  --net elastic \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  docker.elastic.co/kibana/kibana:9.0.0
```

**Option B: Using Docker Compose**

Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:9.0.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    ports:
      - 9200:9200
    volumes:
      - esdata:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:9.0.0
    container_name: kibana
    ports:
      - 5601:5601
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  esdata:
```

Then run:
```bash
docker-compose up -d
```

**Option C: Local Installation**
```bash
# Download and extract Elasticsearch
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-9.0.0-linux-x86_64.tar.gz
tar -xzf elasticsearch-9.0.0-linux-x86_64.tar.gz
cd elasticsearch-9.0.0

# Start Elasticsearch
./bin/elasticsearch
```

### Step 2: Verify Installation

Wait 30-60 seconds for startup, then open Kibana Dev Tools: `http://localhost:5601/app/dev_tools#/console`

```bash
# Check Elasticsearch is responding
GET /

# Check cluster health
GET /_cluster/health

# List all nodes
GET /_cat/nodes?v
```

**Expected Results**:
- Cluster status should be `green` or `yellow`
- At least one node should be listed
- Version should be 9.x

### Step 3: Explore Cluster Information

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
  "size": 0,
  "aggs": {
    "by_level": {
      "terms": { "field": "level.keyword" }
    },
    "by_service": {
      "terms": { "field": "service.keyword" }
    }
  }
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
- What is the average `response_time_ms` for ERROR level logs?

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
    "confirmed_at": "2025-01-15T10:30:00Z",
    "version": 2
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
- Create a script that only updates if status is "pending"

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
        { "term": { "spots.available": true } }
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
  "index_patterns": ["logs-*"],
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
            }
          }
        },
        "total_revenue": { "sum": { "field": "amount" } },
        "revenue_share": {
          "bucket_script": {
            "buckets_path": {
              "spot_revenue": "by_spot_type>revenue"
            },
            "script": "params.spot_revenue"
          }
        }
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
          "wait_for_snapshot": {
            "policy": "daily-snapshots"
          },
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

**Objective**: Install and configure Metricbeat to monitor Elasticsearch.

**Instructions**:

1. Start Metricbeat with Docker:
```bash
docker run -d \
  --name metricbeat \
  --net elastic \
  --user=root \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  -e "KIBANA_HOST=http://kibana:5601" \
  docker.elastic.co/beats/metricbeat:9.0.0 \
  metricbeat -e -E setup.kibana.host=kibana:5601
```

2. Verify Metricbeat is sending data:
```bash
GET /metricbeat-*/_search
{
  "size": 5,
  "sort": [{ "@timestamp": "desc" }]
}

GET /_cat/indices/metricbeat-*?v
```

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

## Exercise 11.2: Stack Monitoring with Self-Monitoring

**Objective**: Enable and use Elasticsearch self-monitoring.

**Instructions**:

1. Check monitoring settings:
```bash
GET /_cluster/settings?include_defaults=true&filter_path=*.xpack.monitoring

GET /_xpack/usage?filter_path=monitoring
```

2. View monitoring indices:
```bash
GET /_cat/indices/.monitoring-*?v&s=index

GET /.monitoring-es-*/_search
{
  "size": 1,
  "sort": [{ "timestamp": "desc" }]
}
```

3. Query node statistics from monitoring:
```bash
GET /.monitoring-es-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "type": "node_stats" } },
        { "range": { "timestamp": { "gte": "now-15m" } } }
      ]
    }
  },
  "size": 1,
  "_source": ["node_stats.jvm.*", "node_stats.os.*", "timestamp"]
}
```

4. Query index statistics:
```bash
GET /.monitoring-es-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "type": "index_stats" } }
      ]
    }
  },
  "size": 5,
  "sort": [{ "timestamp": "desc" }],
  "_source": ["index_stats.index", "index_stats.primaries.*"]
}
```

5. Create a health overview:
```bash
GET /.monitoring-es-*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "must": [
        { "term": { "type": "cluster_stats" } },
        { "range": { "timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "health_over_time": {
      "date_histogram": {
        "field": "timestamp",
        "fixed_interval": "5m"
      },
      "aggs": {
        "status": {
          "terms": { "field": "cluster_stats.status" }
        }
      }
    }
  }
}
```

**Challenge**:
- How often has the cluster status changed in the last 24 hours?
- Find the index with the highest document count from monitoring data
- Calculate the total indexing rate across all nodes

---

## Exercise 11.3: Custom Monitoring Queries

**Objective**: Build custom monitoring and alerting queries.

**Instructions**:

1. Create a monitoring index for custom metrics:
```bash
PUT /parkki-metrics
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "metric_type": { "type": "keyword" },
      "parking_id": { "type": "keyword" },
      "value": { "type": "double" },
      "unit": { "type": "keyword" },
      "tags": { "type": "keyword" }
    }
  }
}
```

2. Index sample monitoring data:
```bash
POST /_bulk
{"index":{"_index":"parkki-metrics"}}
{"@timestamp":"2025-01-15T10:00:00Z","metric_type":"occupancy","parking_id":"central","value":78.5,"unit":"percent","tags":["production","paris"]}
{"index":{"_index":"parkki-metrics"}}
{"@timestamp":"2025-01-15T10:05:00Z","metric_type":"occupancy","parking_id":"central","value":82.3,"unit":"percent","tags":["production","paris"]}
{"index":{"_index":"parkki-metrics"}}
{"@timestamp":"2025-01-15T10:10:00Z","metric_type":"occupancy","parking_id":"central","value":95.1,"unit":"percent","tags":["production","paris"]}
{"index":{"_index":"parkki-metrics"}}
{"@timestamp":"2025-01-15T10:00:00Z","metric_type":"response_time","parking_id":"central","value":45,"unit":"ms","tags":["api","production"]}
{"index":{"_index":"parkki-metrics"}}
{"@timestamp":"2025-01-15T10:05:00Z","metric_type":"response_time","parking_id":"central","value":120,"unit":"ms","tags":["api","production"]}
{"index":{"_index":"parkki-metrics"}}
{"@timestamp":"2025-01-15T10:10:00Z","metric_type":"response_time","parking_id":"central","value":2500,"unit":"ms","tags":["api","production"]}
{"index":{"_index":"parkki-metrics"}}
{"@timestamp":"2025-01-15T10:00:00Z","metric_type":"error_rate","parking_id":"central","value":0.5,"unit":"percent","tags":["api","production"]}
{"index":{"_index":"parkki-metrics"}}
{"@timestamp":"2025-01-15T10:05:00Z","metric_type":"error_rate","parking_id":"central","value":1.2,"unit":"percent","tags":["api","production"]}
{"index":{"_index":"parkki-metrics"}}
{"@timestamp":"2025-01-15T10:10:00Z","metric_type":"error_rate","parking_id":"central","value":15.8,"unit":"percent","tags":["api","production"]}
```

3. Detect anomalies (high values):
```bash
GET /parkki-metrics/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "metric_type": "response_time" } },
        { "range": { "value": { "gte": 1000 } } }
      ]
    }
  }
}
```

4. Calculate percentiles for SLA monitoring:
```bash
GET /parkki-metrics/_search
{
  "size": 0,
  "query": {
    "term": { "metric_type": "response_time" }
  },
  "aggs": {
    "response_percentiles": {
      "percentiles": {
        "field": "value",
        "percents": [50, 90, 95, 99]
      }
    },
    "over_threshold": {
      "filter": {
        "range": { "value": { "gte": 500 } }
      }
    }
  }
}
```

5. Create a health score aggregation:
```bash
GET /parkki-metrics/_search
{
  "size": 0,
  "aggs": {
    "by_parking": {
      "terms": { "field": "parking_id" },
      "aggs": {
        "by_metric": {
          "terms": { "field": "metric_type" },
          "aggs": {
            "latest": {
              "top_hits": {
                "size": 1,
                "sort": [{ "@timestamp": "desc" }],
                "_source": ["value", "@timestamp"]
              }
            },
            "avg_value": { "avg": { "field": "value" } },
            "max_value": { "max": { "field": "value" } }
          }
        }
      }
    }
  }
}
```

**Challenge**:
- Create a query that detects when error_rate exceeds 5%
- Build an aggregation that shows the trend (increasing/decreasing) for each metric
- Calculate the percentage of time response_time was above SLA (500ms)

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

# Part 13: Security

## Exercise 13.1: User and Role Management

**Objective**: Configure users, roles, and permissions.

**Note**: Security must be enabled for these exercises. If using the training Docker setup without security, these are simulation exercises.

**Instructions**:

1. Check security status:
```bash
GET /_security/_authenticate

GET /_xpack/security
```

2. Create a role for parking operators:
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

3. Create a role for data analysts:
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

4. Create users:
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

5. Test user permissions:
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
- Implement a role that allows write access only during business hours (using a script)
- Create an API key with limited permissions for a microservice

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

6. Create a service account token:
```bash
POST /_security/service/elastic/fleet-server/credential/token/my-token
```

**Challenge**:
- Create an API key that expires in 1 hour for temporary access
- Implement API key rotation (create new, migrate, invalidate old)
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

## Exercise 14.1: APM Data Exploration

**Objective**: Query and analyze APM data.

**Note**: APM must be configured with the APM Server and agents. These exercises work with APM indices if available.

**Instructions**:

1. Check APM indices:
```bash
GET /_cat/indices/apm-*?v&s=index

GET /_cat/indices/traces-*?v&s=index
```

2. Query transaction data:
```bash
GET /traces-apm*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "processor.event": "transaction" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "size": 5,
  "_source": ["transaction.name", "transaction.duration.us", "service.name", "@timestamp"]
}
```

3. Calculate service latency:
```bash
GET /traces-apm*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "must": [
        { "term": { "processor.event": "transaction" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "by_service": {
      "terms": { "field": "service.name" },
      "aggs": {
        "avg_duration": {
          "avg": { "field": "transaction.duration.us" }
        },
        "percentiles": {
          "percentiles": {
            "field": "transaction.duration.us",
            "percents": [50, 95, 99]
          }
        }
      }
    }
  }
}
```

4. Find slow transactions:
```bash
GET /traces-apm*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "processor.event": "transaction" } },
        { "range": { "transaction.duration.us": { "gte": 5000000 } } }
      ]
    }
  },
  "sort": [{ "transaction.duration.us": "desc" }],
  "size": 10,
  "_source": ["transaction.name", "transaction.duration.us", "service.name", "trace.id"]
}
```

5. Analyze error rates:
```bash
GET /traces-apm*/_search
{
  "size": 0,
  "query": {
    "range": { "@timestamp": { "gte": "now-1h" } }
  },
  "aggs": {
    "by_service": {
      "terms": { "field": "service.name" },
      "aggs": {
        "total": {
          "filter": { "term": { "processor.event": "transaction" } }
        },
        "errors": {
          "filter": {
            "bool": {
              "must": [
                { "term": { "processor.event": "transaction" } },
                { "exists": { "field": "transaction.result" } },
                { "term": { "transaction.result": "HTTP 5xx" } }
              ]
            }
          }
        }
      }
    }
  }
}
```

**Challenge**:
- Calculate the error rate percentage for each service
- Find transactions that have associated spans taking more than 1 second
- Build a service dependency map by analyzing span data

---

## Exercise 14.2: Distributed Tracing Analysis

**Objective**: Analyze traces across services.

**Instructions**:

1. Get a complete trace:
```bash
GET /traces-apm*/_search
{
  "query": {
    "term": { "trace.id": "<trace_id>" }
  },
  "sort": [{ "timestamp.us": "asc" }],
  "size": 100,
  "_source": ["transaction.name", "span.name", "parent.id", "timestamp.us", "transaction.duration.us", "span.duration.us", "service.name"]
}
```

2. Find traces with errors:
```bash
GET /traces-apm*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "processor.event": "error" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "error_traces": {
      "terms": { "field": "trace.id", "size": 10 }
    }
  }
}
```

3. Analyze span breakdown:
```bash
GET /traces-apm*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "must": [
        { "term": { "processor.event": "span" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "by_type": {
      "terms": { "field": "span.type" },
      "aggs": {
        "by_subtype": {
          "terms": { "field": "span.subtype" },
          "aggs": {
            "avg_duration": { "avg": { "field": "span.duration.us" } },
            "count": { "value_count": { "field": "span.id" } }
          }
        }
      }
    }
  }
}
```

4. Find database query bottlenecks:
```bash
GET /traces-apm*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "span.type": "db" } },
        { "range": { "span.duration.us": { "gte": 100000 } } }
      ]
    }
  },
  "sort": [{ "span.duration.us": "desc" }],
  "size": 10,
  "_source": ["span.name", "span.duration.us", "span.db.statement", "service.name"]
}
```

5. Calculate service throughput:
```bash
GET /traces-apm*/_search
{
  "size": 0,
  "query": {
    "bool": {
      "must": [
        { "term": { "processor.event": "transaction" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "throughput": {
      "date_histogram": {
        "field": "@timestamp",
        "fixed_interval": "1m"
      },
      "aggs": {
        "by_service": {
          "terms": { "field": "service.name" }
        }
      }
    }
  }
}
```

**Challenge**:
- Build a query to find the slowest database queries per service
- Identify external HTTP calls that are causing latency
- Create a service level objective (SLO) query for 99th percentile latency

---

## Exercise 14.3: Custom APM Metrics and Analysis

**Objective**: Create custom APM dashboards and analyses.

**Instructions**:

1. Create a simulated APM metrics index:
```bash
PUT /apm-custom-metrics
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "service.name": { "type": "keyword" },
      "transaction.name": { "type": "keyword" },
      "transaction.duration.us": { "type": "long" },
      "transaction.result": { "type": "keyword" },
      "labels": { "type": "object" },
      "user.id": { "type": "keyword" }
    }
  }
}
```

2. Index sample APM data:
```bash
POST /_bulk
{"index":{"_index":"apm-custom-metrics"}}
{"@timestamp":"2025-01-15T10:00:00Z","service.name":"parking-api","transaction.name":"GET /api/parking/status","transaction.duration.us":45000,"transaction.result":"HTTP 2xx","labels":{"environment":"production"},"user.id":"user123"}
{"index":{"_index":"apm-custom-metrics"}}
{"@timestamp":"2025-01-15T10:00:01Z","service.name":"parking-api","transaction.name":"POST /api/reservations","transaction.duration.us":120000,"transaction.result":"HTTP 2xx","labels":{"environment":"production"},"user.id":"user456"}
{"index":{"_index":"apm-custom-metrics"}}
{"@timestamp":"2025-01-15T10:00:02Z","service.name":"payment-service","transaction.name":"POST /api/payment/process","transaction.duration.us":2500000,"transaction.result":"HTTP 5xx","labels":{"environment":"production"},"user.id":"user456"}
{"index":{"_index":"apm-custom-metrics"}}
{"@timestamp":"2025-01-15T10:00:03Z","service.name":"parking-api","transaction.name":"GET /api/parking/status","transaction.duration.us":35000,"transaction.result":"HTTP 2xx","labels":{"environment":"production"},"user.id":"user789"}
{"index":{"_index":"apm-custom-metrics"}}
{"@timestamp":"2025-01-15T10:00:04Z","service.name":"notification-service","transaction.name":"POST /api/notify","transaction.duration.us":350000,"transaction.result":"HTTP 2xx","labels":{"environment":"production"},"user.id":"user123"}
{"index":{"_index":"apm-custom-metrics"}}
{"@timestamp":"2025-01-15T10:00:05Z","service.name":"parking-api","transaction.name":"GET /api/parking/status","transaction.duration.us":5500000,"transaction.result":"HTTP 5xx","labels":{"environment":"production"},"user.id":"user999"}
```

3. Service health dashboard:
```bash
GET /apm-custom-metrics/_search
{
  "size": 0,
  "aggs": {
    "by_service": {
      "terms": { "field": "service.name" },
      "aggs": {
        "avg_latency_ms": {
          "avg": {
            "script": { "source": "doc['transaction.duration.us'].value / 1000" }
          }
        },
        "p99_latency": {
          "percentiles": {
            "field": "transaction.duration.us",
            "percents": [99]
          }
        },
        "error_rate": {
          "filters": {
            "filters": {
              "success": { "prefix": { "transaction.result": "HTTP 2" } },
              "error": { "prefix": { "transaction.result": "HTTP 5" } }
            }
          }
        },
        "throughput": {
          "value_count": { "field": "transaction.name" }
        }
      }
    }
  }
}
```

4. User experience analysis:
```bash
GET /apm-custom-metrics/_search
{
  "size": 0,
  "aggs": {
    "user_experience": {
      "range": {
        "field": "transaction.duration.us",
        "ranges": [
          { "key": "fast", "to": 100000 },
          { "key": "normal", "from": 100000, "to": 500000 },
          { "key": "slow", "from": 500000, "to": 2000000 },
          { "key": "frustrated", "from": 2000000 }
        ]
      }
    },
    "apdex": {
      "scripted_metric": {
        "init_script": "state.satisfied = 0; state.tolerating = 0; state.frustrated = 0;",
        "map_script": """
          def duration = doc['transaction.duration.us'].value;
          if (duration < 100000) { state.satisfied++ }
          else if (duration < 400000) { state.tolerating++ }
          else { state.frustrated++ }
        """,
        "combine_script": "return state",
        "reduce_script": """
          def satisfied = 0; def tolerating = 0; def frustrated = 0;
          for (s in states) {
            satisfied += s.satisfied;
            tolerating += s.tolerating;
            frustrated += s.frustrated;
          }
          def total = satisfied + tolerating + frustrated;
          return (satisfied + (tolerating / 2.0)) / total;
        """
      }
    }
  }
}
```

5. Transaction breakdown:
```bash
GET /apm-custom-metrics/_search
{
  "size": 0,
  "aggs": {
    "by_transaction": {
      "terms": { "field": "transaction.name" },
      "aggs": {
        "stats": {
          "extended_stats": { "field": "transaction.duration.us" }
        },
        "by_result": {
          "terms": { "field": "transaction.result" }
        }
      }
    }
  }
}
```

**Challenge**:
- Calculate the Apdex score for each service
- Find users experiencing the worst performance
- Create a query to detect transaction duration anomalies (>3 standard deviations)

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
