---
layout: cover
---

# Kibana

---

# Présentation

* Kibana est une application web permettant de communiquer avec Elasticsearch

Kibana permet (entre autres) de:

* visualiser les données présentes dans Elasticsearch dans des dashboards
* exécuter et sauvegarder des requêtes complexes
* parcourir les configurations de notre cluster
* administrer et surveiller notre cluster

---

# Architecture

* Kibana doit nécessairement communiquer avec un cluster Elasticsearch
* Cette configuration se fait dans le fichier de configuration **kibana.yml**
* Depuis la version 8, un enrollment token vous sera demandé lors de la première connexion pour autoriser votre Kibana à communiquer avec votre cluster.

---

# Accueil

image::../images/kibana/01-home.png[]

---

# Dashboard

image::../images/kibana/02-dashboard.png[]

---

# Discover

image::../images/kibana/03-discover.png[]

---

# Visualisation Lens

image::../images/kibana/04-lens.png[]

---

# Visualisation historique

image::../images/kibana/05-aggregation-based.png[]

---

# Stream de logs

image::../images/kibana/06-log-stream.png[]

---

# Rôles et utilisateurs

image::../images/kibana/07-roles.png[]

---

# Dataviews

image::../images/kibana/08-dataviews.png[]

---

# Saved objects

image::../images/kibana/09-saved-objects.png[]

---

# Spaces

image::../images/kibana/10-spaces.png[]

---

# Lifecycle policies

image::../images/kibana/11-lifecycle-policies.png[]

---

# Monitoring

image::../images/kibana/12-monitoring.png[]

---
