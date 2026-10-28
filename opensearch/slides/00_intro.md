---
layout: cover
---

# Programme

---

<table>
<tbody>
 <tr style="border: 0; font-size: 0.95em">
    <td>
        <ul>
            <li>0 - Introduction à la formation
                <ul>
                    <li>Objectifs et déroulé</li>
                    <li>Le lab : OpenSearch et Dashboards</li>
                </ul>
            </li>
            <li>1 - OpenSearch
                <ul>
                    <li>Un fork d'Elasticsearch 7.10</li>
                    <li>Licences : Apache 2.0, SSPL, ELv2, AGPL</li>
                    <li>Cas d'usage, rôle d'OpenSearch Dashboards</li>
                </ul>
            </li>
            <li>2 - Architecture et concepts
                <ul>
                    <li>Recherche distribuée, index inversé</li>
                    <li>Nœuds, index, shards, réplicas</li>
                    <li>Scalabilité et résilience</li>
                </ul>
            </li>
            <li>3 - Installation et API REST
                <ul>
                    <li>Docker, configuration, démarrage</li>
                    <li>Santé du cluster, API <code>_cat</code></li>
                    <li>JSON, REST et Dev Tools</li>
                </ul>
            </li>
            <li>4 - Indexation et mapping
                <ul>
                    <li>Créer et gérer un index</li>
                    <li>Types de données, mapping explicite</li>
                    <li>CRUD, <code>_bulk</code>, alias</li>
                </ul>
            </li>
            <li>5 - Recherche et pertinence
                <ul>
                    <li>Query DSL : <code>match</code>, <code>term</code>, <code>bool</code></li>
                    <li>Scoring BM25, <code>boost</code>, <code>function_score</code></li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>6 - Analyse de texte
                <ul>
                    <li>Analyseurs : char filters, tokenizer, token filters</li>
                    <li>Analyseurs personnalisés</li>
                </ul>
            </li>
            <li>7 - Agrégations
                <ul>
                    <li>Metrics, buckets, pipeline</li>
                    <li>Sous-agrégations</li>
                </ul>
            </li>
            <li>8 - Fonctions de recherche avancées
                <ul>
                    <li>Filtres, tri, pagination</li>
                    <li>Surlignage, suggestions</li>
                    <li>Requêtes géographiques, percolation</li>
                </ul>
            </li>
            <li>9 - Ingest pipelines
                <ul>
                    <li>Processeurs, <code>_simulate</code></li>
                    <li>Enrichir avant l'indexation</li>
                </ul>
            </li>
            <li>10 - OpenSearch Dashboards
                <ul>
                    <li>Index patterns, Discover</li>
                    <li>Visualisations, cartes</li>
                    <li>Tableaux de bord interactifs</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Objectifs de la formation

À la fin de la journée, vous saurez :

- **Expliquer** l'origine d'OpenSearch et son architecture distribuée
- **Installer** et configurer un cluster, et **vérifier** sa santé
- **Indexer** et **rechercher** des documents avec l'API REST
- **Concevoir** un mapping avec les bons types de données
- **Exploiter** l'analyse de texte, les agrégations et le scoring
- **Transformer** les données avant indexation avec un ingest pipeline
- **Construire** des visualisations et des tableaux de bord dans OpenSearch Dashboards

<br />

> La formation est basée sur **OpenSearch 3.9** et **OpenSearch Dashboards 3.9**.

---

# Public et prérequis

**Public** : administrateurs systèmes et réseaux, analystes de données,
développeurs, ingénieurs Big Data et DevOps.

**Prérequis** :

- Connaître les formats de données structurées, en particulier **JSON**
- Notions d'architecture système ou d'administration de bases de données
- Une première expérience d'un moteur de recherche ou d'une base NoSQL aide, sans
  être indispensable

**Matériel** : un poste avec **Docker** (4 Go de RAM libres) et un navigateur.

---

# Une journée dense

Le programme est prévu pour **deux jours** : nous le parcourons en **un**.

| | Chapitres | Pratique |
|---|---|---|
| **Matin** | 0 → 5 — OpenSearch, architecture, installation, mapping, recherche | TP 1 · TP 2 · TP 3 |
| **Après-midi** | 6 → 10 — analyse, agrégations, recherche avancée, ingest, Dashboards | TP 4 · TP 5 · TP 6 · TP 7 · TP 8 |

<br />

- **Huit TP courts** (20 à 30 min), chacun autonome : il crée ses propres données
- Chaque TP a une section **« Pour aller plus loin »** : à faire après la session
- Un **quiz** clôt les chapitres clés, une **rétrospective** clôt la journée

---

# Méthodes pédagogiques

- Alternance d'**apports théoriques** et de **mises en pratique**
- Démonstrations en direct dans **Dev Tools**
- Retours d'expérience du formateur
- Supports numériques fournis : slides, énoncés des TP

<br />

# Évaluation

- Un **questionnaire d'auto-positionnement** avant la session
- Des **quiz** corrigés ensemble
- Une évaluation continue par les **TP**
- Un **questionnaire final**, miroir de l'auto-positionnement

---

# Le lab

Un nœud OpenSearch et OpenSearch Dashboards, en local, avec Docker :

```bash
cd workshops/01_installation
docker compose up -d --wait
```

- OpenSearch : **http://localhost:9200**
- OpenSearch Dashboards : **http://localhost:5601** → menu ☰ → **Dev Tools**

<br />

> Le lab désactive le **plugin de sécurité** : HTTP simple, pas d'utilisateur.
> Pratique pour apprendre, **jamais** en production.

Sous Linux, OpenSearch exige `vm.max_map_count` ≥ 262144 :

```bash
sudo sysctl -w vm.max_map_count=262144
```
