---
layout: cover
---

# 1 - OpenSearch

---

# Objectifs pédagogiques

À la fin de cette séquence (**~20 min**), vous saurez :

- **Situer** OpenSearch : un fork d'Elasticsearch 7.10, devenu un projet à part
- **Distinguer** les licences : Apache 2.0, SSPL, Elastic License, AGPL
- **Citer** les cas d'usage d'un moteur de recherche distribué
- **Décrire** le rôle d'OpenSearch Dashboards

---

# D'Elasticsearch à OpenSearch

- **2010** — Elasticsearch, moteur de recherche distribué bâti sur **Apache Lucene**, sous licence **Apache 2.0**
- **Janvier 2021** — Elastic passe Elasticsearch et Kibana (à partir de 7.11) sous **SSPL** et **Elastic License** : plus une licence open source au sens de l'OSI
- **Avril 2021** — AWS publie **OpenSearch 1.0**, fork de la dernière version Apache 2.0 : **Elasticsearch 7.10.2** et **Kibana 7.10.2**
- **Septembre 2024** — OpenSearch rejoint la **Linux Foundation** (OpenSearch Software Foundation) : gouvernance ouverte, plus seulement AWS
- **2025** — **OpenSearch 3.0** : Lucene 10, Java 21, nouvelles fonctionnalités vectorielles

<br />

> Depuis 2021, les deux projets **divergent** : les API de base restent proches, les
> fonctionnalités récentes (ES|QL côté Elastic, PPL ou plugins côté OpenSearch) ne
> sont pas portables.

---

# Les licences

| Projet | Licence | Ce que ça change |
|---|---|---|
| **OpenSearch** | Apache 2.0 | Usage, modification, revente en SaaS : libres |
| **Elasticsearch ≤ 7.10** | Apache 2.0 | Idem — c'est la base du fork |
| **Elasticsearch 7.11 → 8.15** | SSPL ou Elastic License 2.0 | Interdit de vendre Elasticsearch « as a service » |
| **Elasticsearch ≥ 8.16** | + **AGPL v3** | De nouveau open source (OSI), avec l'obligation de publier ses modifications d'un service |

<br />

- Pour un **utilisateur final**, les deux sont gratuits
- La différence porte sur la **redistribution** et l'**offre de service managé**
- OpenSearch : **toutes** les fonctionnalités (sécurité, alerting, ML…) sont
  gratuites, sous forme de **plugins**

---

# Ce qu'on fait avec OpenSearch

- **Recherche plein texte** — catalogue e-commerce, documentation, moteur interne :
  pertinence, fautes de frappe, suggestions
- **Observabilité** — logs, métriques, traces : indexer beaucoup, chercher vite,
  agréger sur le temps
- **Sécurité (SIEM)** — corréler des événements, détecter des anomalies
- **Analytique** — agrégations sur des millions de documents, en temps quasi réel
- **Recherche vectorielle** — plugin **k-NN** : recherche sémantique, RAG

<br />

> Un point commun : on **écrit une fois**, on **lit beaucoup**, et on veut une
> réponse en **millisecondes**.

---

# L'écosystème

| Composant | Rôle |
|---|---|
| **OpenSearch** | Le moteur : stocke, indexe, cherche, agrège. API REST sur le port **9200** |
| **OpenSearch Dashboards** | L'interface web (fork de Kibana) : Discover, visualisations, tableaux de bord, **Dev Tools**. Port **5601** |
| **Data Prepper** | Ingestion côté serveur : logs, traces, transformations |
| **Plugins** | Sécurité, Alerting, Index State Management, k-NN, SQL/PPL, Anomaly Detection… |
| **Clients** | Java, Python, JavaScript, Go, .NET, Rust… |

<br />

- Logstash, Fluent Bit, Beats 7.x savent aussi écrire dans OpenSearch
- Les **services managés** : Amazon OpenSearch Service, Aiven, Instaclustr…

---

# Quiz

**OpenSearch est un fork de quelle version d'Elasticsearch ?**

<v-clicks>

- A) 6.8
- B) 7.10 ✅
- C) 8.0
- D) 8.16

**Réponse : B** — 7.10.2 est la dernière version d'Elasticsearch publiée sous Apache 2.0.

</v-clicks>
