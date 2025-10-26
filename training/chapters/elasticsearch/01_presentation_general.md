---
layout: cover
---
# General Overview

---

# Search Engines

* In our increasingly connected world, there has emerged a need to centralize various pieces of information.
* We need to:
    * structure,
    * query
    * manipulate
* ... information from different sources and in different structures.

---

# Search Engines

* The main goal is to have a solution that allows:
    * for quick and relevant searching, and
    * categorization of search results.

---
 
# Existing Solutions

* Several search engine solutions exist, including:
    * Java library: Lucene
    * Cluster: Solr, Elasticsearch, OpenSearch
    * SaaS Solution: Algolia, Amazon, Azure, GCP, Elastic Cloud...

--- 

# Lucene

* An open-source Java library for indexing documents.
* Can be integrated into your applications.
* Here is an example of Lucene code:

```java
String str = "foo bar";
String id = "123456";
BooleanQuery bq = new BooleanQuery();
Query query = qp.parse(str);
bq.add(query, BooleanClause.Occur.MUST);
bq.add(new TermQuery(new Term("id", id), BooleanClause.Occur.MUST_NOT);
```

---

# Elastic Stack

* An Elasticsearch cluster can be used as:
    * a search engine (Uber, Tinder, ...)
    * a solution for system observation (Blizzard, ...)
    * a SIEM (Indiana University, ...)
    * ...

--- 

# Elastic Stack

* The Elastic Stack is currently in version 9.2.0.
* The suite is composed of several products:
    * Elasticsearch
    * Kibana
    * Beats
    * APM
* ...

--- 

# ELK ? Suite Elastic ?

![](/images/elk-stack-3-elks-stacked.svg)

---

# Suite Elastic

![](/images/elasticstack.png)

---

# The Community

* Helk
* Eland
* Rally
* Searchguard
* Elastalert
* TestContainers

---

# Terminology

* cluster
* node
* index
* shard
* document

---

# Installation

![](/images/install-1.png)

---

# Installation

![](/images/install-2.png)

---

# Installation

* You can also use Elasticsearch via:

    * Docker
    * Elastic Cloud Enterprise
    * Elastic Cloud
    * Helm Chart for Kubernetes
    * GCP, AWS, Clevercloud Marketplace, etc.

```shell
docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:9.2.0
```

---

# Launching

* To start Elasticsearch, you need to execute one of the following commands:

```shell
./bin/elasticsearch
.\bin\elasticsearch.bat
```

* You should see the following result:

```shell
[Emmanuels-MBP] publish_address {127.0.0.1:9200}, bound_addresses {[::1]:9200}, {127.0.0.1:9200}
[Emmanuels-MBP] started
```

---

# Clustering

![](/images/cluster.png)

---

# Configuration

![](/images/folder1.png)

---

# Configuration

![](/images/folder2.png)

---

# Configuration

* To verify that your Elasticsearch cluster is functional

```shell
GET http://localhost:9200/
```

---

# Configuration

* should return this response

```json
{
  "name": "Emmanuel",
  "cluster_name": "elasticsearch",
  "cluster_uuid": "p4rcLtCjQW6s3FRyT3lo1A",
  "version": {
    "number": "8.12.0",
    "build_flavor": "default",
    "build_type": "tar",
    "build_hash": "801fed82df74dbe537f89b71b098ccaff88d2c56",
    "build_date": "2022-07-23T19:30:09.227964828Z",
    "build_snapshot": false,
    "lucene_version": "9.2.0",
    "minimum_wire_compatibility_version": "7.17.0",
    "minimum_index_compatibility_version": "7.0.0"
  },
  "tagline": "You Know, for Search"
}
```

---

# Configuration

* Cluster configuration is done in the `elasticsearch.yml` configuration file

```yaml
cluster.name: my-application
node.name: node-1
http.port: 9200
discovery.seed_hosts: ["host1", "host2", "host3", "host4"]
cluster.initial_master_nodes: ["host1", "host2"]

xpack.ml.enabled: false
xpack.security.enabled: true
```

---

# Nodes

* A node can be of different types:
    * **master**: Manages cluster state and coordinates cluster-wide operations
    * **data**: Stores data and executes data-related operations (search, aggregations)
    * **ingest**: Preprocesses documents before indexing
    * **machine learning**: Executes machine learning jobs
    * **transform**: Runs continuous transforms
    * **coordinating**: Routes requests and merges results (default role)

---

# Nodes

* Configuration is also done in the `elasticsearch.yml` file

```yaml
node.master: true
node.data: false
node.ingest: false
node.ml: false
```

---

# API

* Any endpoint containing a `_` corresponds to an Elasticsearch API
    * _search
    * _explain
    * _analyze
    * _cat
    * _reindex
    * ...

---

# Interacting with Elasticsearch

* You can interact with Elasticsearch using:
    * curl
    * an SDK (Java, JavaScript, Python, ...)
    * Postman
    * Kibana

---
layout: cover
---
# Elasticsearch and Kibana Demo