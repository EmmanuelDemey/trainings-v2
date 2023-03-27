---
layout: cover
---
# Présentation générale

---

# Les moteurs de recherches

* Dans notre monde de plus en plus connecté, un besoin de centraliser différentes informations est né
* Afin de
    * structurer
    * requêter
    * manipuler
* ... Des informations venant d'origines différentes et de structures différentes.

---

# Les moteurs de recherches

* Le but principal est d'avoir une solution permettant :
    * de rechercher rapidement et de manière pertinente
    * de catégoriser les résultats d'une recherche

---
 
# Les solutions existantes

* Plusieurs solutions de moteurs de recherche existent
    * Librairie Java : Lucene
    * Cluster : Solr, Elasticsearch, OpenSearch
    * Solution SaaS : Algolia, Amazon, Azure, GCP, Elastic Cloud...

--- 

# Lucene

* Librairie Java open-source permettant d'indexer des documents
* Pouvant être intégrée à vos applications
* Voici un exemple de code Lucene

```java
String str = "foo bar";
String id = "123456";
BooleanQuery bq = new BooleanQuery();
Query query = qp.parse(str);
bq.add(query, BooleanClause.Occur.MUST);
bq.add(new TermQuery(new Term("id", id), BooleanClause.Occur.MUST_NOT);
```

---

# La suite Elastic

* Un cluster Elasticsearch peut être utilisé comme :
    * un moteur de recherche (Uber, Tinder, ...)
    * une solution pour observer un système (Blizzard, ...)
    * un SIEM (Indiana University, ...)
    * ...

--- 

# La suite Elastic

* La suite Elastic est actuellement en version 8.1.0
* La suite est composée de plusieurs produits :
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

# La communauté

* Helk
* Eland
* Rally
* Searchguard
* Elastalert
* TestContainers

---

# Terminologie

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

* Vous pouvez également utiliser Elasticsearch via :

    * Docker
    * Elastic Cloud Enterprise
    * Elastic Cloud
    * Chart helm pour Kubernetes
    * Marketplace de GCP, AWS, Clevercloud, ...

```shell
docker run -p 9200:9200 -p 9300:9300 docker.elastic.co/elasticsearch/elasticsearch:7.10.1
```

---

# Lancement

* Pour lancer Elasticsearch, il faudra exécuter l'une des commandes suivantes

```shell
./bin/elasticsearch
.\bin\elasticsearch.bat
```


* Vous devriez avoir le résultat suivant

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

* Pour vérifier que votre cluster Elasticsearch est fonctionnel

```shell
GET http://localhost:9200/
```

---

# Configuration

* devrait retourner cette réponse

```json
{
  "name": "Emmanuel",
  "cluster_name": "elasticsearch",
  "cluster_uuid": "p4rcLtCjQW6s3FRyT3lo1A",
  "version": {
    "number": "8.3.3",
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

* La configuration du cluster se fait dans le fichier de configuration `elasticsearch.yml`

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

# Noeuds

* Un noeud peut être de différents types
    * master
    * data
    * ingest
    * machine learning
    * transformer
    * cross cluster
    * ...

---

# Noeuds

* La configuration se fait également dans le fichier `elasticsearch.yml`

```yaml
node.master: true
node.data: false
node.ingest: false
node.ml: false
```

---

# API

* Tout endpoint contenant un `_` correspond à une API d'Elasticsearch
    * _search
    * _explain
    * _analyze
    * _cat
    * _reindex
    * ...

---

# Manipuler Elasticsearch

* Vous pouvez intéragir avec Elasticsearch avec :
    * curl
    * un SDK (java, JavaScript, python, ...)
    * Postman
    * Kibana

---

# Démo Elasticsearch et Kibana
