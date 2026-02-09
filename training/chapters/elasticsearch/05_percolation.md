---
layout: cover
---

# Percolation

---

# What is Percolation?

* Traditional search: You have documents, you search with queries.
* **Percolation** inverts this: You have **stored queries**, and you check which queries match a **given document**.
* Use cases:
    * **Alerting**: Notify when a new document matches a saved query
    * **Document classification**: Automatically categorize incoming documents
    * **Monitoring**: Detect patterns in real-time data streams

---

# How it Works

* **Step 1**: Register queries in a percolate index
* **Step 2**: Send a document to the percolate API
* **Step 3**: Get back the list of matching queries

```
+--------------------------------------------------+
|  Stored Queries           Incoming Document       |
|  +-----------+           +-----------+            |
|  | Query A   | <-------> | Document  |            |
|  | Query B   |  Match?   |           |            |
|  | Query C   |           +-----------+            |
|  +-----------+                                    |
|                                                   |
|  Result: [Query A, Query C] match the document    |
+--------------------------------------------------+
```

---

# Setting Up a Percolator Index

* A percolator index requires a field of type `percolator` to store queries.
* Other fields define the mapping for documents to be percolated.

```json
PUT /alerts
{
  "mappings": {
    "properties": {
      "query": {
        "type": "percolator"
      },
      "level": {
        "type": "keyword"
      },
      "message": {
        "type": "text"
      }
    }
  }
}
```

---

# Registering Queries

* Index documents where the `query` field contains an Elasticsearch query.

```json
POST /alerts/_doc/error-alert
{
  "query": {
    "match": {
      "level": "ERROR"
    }
  }
}
```

```json
POST /alerts/_doc/critical-memory
{
  "query": {
    "bool": {
      "must": [
        { "match": { "message": "out of memory" } },
        { "term": { "level": "CRITICAL" } }
      ]
    }
  }
}
```

---

# Percolating a Document

* Use the `percolate` query to find which stored queries match a given document.

```json
POST /alerts/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "level": "ERROR",
        "message": "Connection timeout in payment service"
      }
    }
  }
}
```

---

# Percolation Response

* The response contains the stored queries that match the document.

```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [
      {
        "_id": "error-alert",
        "_source": {
          "query": {
            "match": { "level": "ERROR" }
          }
        }
      }
    ]
  }
}
```

---

# Percolating Multiple Documents

* You can percolate multiple documents in a single request.

```json
POST /alerts/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "documents": [
        { "level": "ERROR", "message": "Timeout" },
        { "level": "CRITICAL", "message": "out of memory" },
        { "level": "INFO", "message": "Startup complete" }
      ]
    }
  }
}
```

---

# Use Case: Real-Time Alerting

* Combine percolation with ingest pipelines or application logic.

```
+-----------------------------------------------+
|  1. User creates alert rules (stored queries)  |
|  2. New log arrives                            |
|  3. Percolate the log against stored queries   |
|  4. Matching queries → trigger notifications   |
+-----------------------------------------------+
```

* This pattern is used by Elasticsearch Watcher and Kibana Alerting under the hood.

---

# Best Practices

* **Index management**: Stored queries add overhead. Keep the percolator index manageable.
* **Mapping consistency**: The percolator index mapping must match the documents being percolated.
* **Performance**: Percolation is more expensive than regular search. Use filters to narrow candidates.
* **Testing**: Use the `_search` API with `percolate` to test queries before deploying to production.
* Prefer **Watcher** or **Kibana Alerting** for production alerting over raw percolation.

---
layout: cover
---
# Practical Section
