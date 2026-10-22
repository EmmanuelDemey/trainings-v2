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
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.index.Term;

String str = "foo bar";
String id = "123456";
BooleanQuery bq = new BooleanQuery();
Query query = qp.parse(str);
bq.add(query, BooleanClause.Occur.MUST);
bq.add(new TermQuery(new Term("id", id), BooleanClause.Occur.MUST_NOT);
```

---
src: ../../elasticsearch-common/slides/stack/elastic-stack.md
---

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