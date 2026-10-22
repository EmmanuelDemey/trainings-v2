# Presentation

* Kibana is a web application for interacting with Elasticsearch.

Kibana allows (among other things):

* visualizing data present in Elasticsearch in dashboards
* executing and saving complex queries
* browsing cluster configurations
* administering and monitoring our cluster

---

# Architecture

* Kibana must necessarily communicate with an Elasticsearch cluster
* This configuration is done in the **kibana.yml** configuration file
* Starting from version 8, an enrollment token will be required during the first connection to authorize your Kibana to communicate with your cluster.
