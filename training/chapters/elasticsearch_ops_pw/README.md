# Structure des Exercices Pratiques - Elasticsearch Ops

Ce dossier contient les exercices pratiques de la formation Elasticsearch Ops découpés en fichiers modulaires.

## Structure des Fichiers

```
elasticsearch_ops_pw/
├── 00_header.md                    # En-tête et introduction générale
├── jour1/                          # Exercices du Jour 1
│   ├── 00_intro.md                # Introduction Jour 1
│   ├── lab_1.1.md                 # Lab 1.1: Création et Interrogation d'Index
│   ├── lab_1.2.md                 # Lab 1.2: Définition de Mappings Explicites
│   ├── lab_1.3.md                 # Lab 1.3: Agrégations de Données
│   ├── bonus_1.A.md               # Bonus: Optimisation du Scoring
│   ├── bonus_1.B.md               # Bonus: Mappings Nested et Parent-Child
│   ├── lab_2.1.md                 # Lab 2.1: Installation et Configuration
│   ├── lab_2.2.md                 # Lab 2.2: Formation de Cluster
│   ├── lab_2.3.md                 # Lab 2.3: Inspection du Cluster avec _cat APIs
│   ├── bonus_2.A.md               # Bonus: Shard Allocation Awareness
│   ├── lab_3.1.md                 # Lab 3.1: Dimensionnement de Cluster
│   ├── lab_3.2.md                 # Lab 3.2: Configuration du Heap JVM
│   ├── lab_3.3.md                 # Lab 3.3: Analyse des Thread Pools
│   ├── bonus_3.A.md               # Bonus: Architecture Hot-Warm-Cold avec ILM
│   ├── bonus_3.B.md               # Bonus: Troubleshooting Slow Indexing
│   ├── lab_4.1.md                 # Lab 4.1: Utilisation de l'API Cluster Health
│   ├── lab_4.2.md                 # Lab 4.2: Monitoring des Statistiques de Nœuds
│   ├── lab_4.3.md                 # Lab 4.3: Configuration des Slow Query Logs
│   └── bonus_4.A.md               # Bonus: Dashboards Kibana pour Monitoring
└── jour2/                          # Exercices du Jour 2
    ├── 00_intro_alertes.md        # Introduction section Alertes
    ├── lab_5.1.md                 # Lab 5.1: Création d'une Alerte Simple
    ├── lab_5.2.md                 # Lab 5.2: Configuration d'Actions Avancées
    ├── bonus_5.A.md               # Bonus: Alerte Watcher Avancée
    ├── 00_intro_maintenance.md    # Introduction section Maintenance
    ├── lab_6.1.md                 # Lab 6.1: Création et Restauration de Snapshots
    ├── lab_6.2.md                 # Lab 6.2: Procédure de Rolling Restart
    ├── bonus_6.A.md               # Bonus: Snapshot Lifecycle Management (SLM)
    ├── 00_intro_securite.md       # Introduction section Sécurité
    ├── lab_7.1.md                 # Lab 7.1: Création d'Utilisateurs et de Rôles
    ├── lab_7.2.md                 # Lab 7.2: Document-Level Security (DLS)
    ├── bonus_7.A.md               # Bonus: Field-Level Security (FLS)
    ├── 00_intro_production.md     # Introduction section Production
    ├── lab_8.1.md                 # Lab 8.1: Configuration de Dedicated Master Nodes
    ├── lab_8.2.md                 # Lab 8.2: Shard Allocation Awareness
    ├── bonus_8.A.md               # Bonus: Architecture Complète de Production
    └── bonus_8.B.md               # Bonus: Runbook de Réponse aux Incidents

Total: 37 fichiers
```

## Organisation par Jour

### Jour 1 - Fondamentaux et Configuration
- **Concepts Généraux** (Labs 1.x): Indexation, Mappings, Agrégations
- **Installation et Configuration** (Labs 2.x): Formation de Cluster, Rôles de Nœuds
- **Dimensionnement** (Labs 3.x): Shards, Heap JVM, Thread Pools
- **Monitoring** (Labs 4.x): APIs Natives, Statistiques, Slow Logs

### Jour 2 - Opérations et Production
- **Alertes** (Labs 5.x): Kibana Rules, Webhooks, Watchers
- **Maintenance** (Labs 6.x): Snapshots, Rolling Restart, ILM
- **Sécurité** (Labs 7.x): Utilisateurs, Rôles, DLS, FLS
- **Production** (Labs 8.x): Master Nodes, Allocation Awareness, Architecture

## Utilisation

### Éditer un Lab Spécifique

Pour modifier un lab particulier, éditez directement le fichier correspondant :

```bash
# Éditer le Lab 1.1
vi jour1/lab_1.1.md

# Éditer le Bonus 5.A
vi jour2/bonus_5.A.md
```

### Générer le PDF Complet

Deux méthodes sont disponibles :

#### Méthode 1 : Fusion + Génération PDF manuelle

```bash
# 1. Fusionner tous les fichiers en un seul markdown
cd ../../
./merge_elasticsearch_ops_pw.sh

# 2. Générer le PDF avec pandoc (nécessite xelatex installé)
pandoc elasticsearch_ops_pw_merged.md \
    -o elasticsearch_ops_pw.pdf \
    --pdf-engine=xelatex \
    --toc \
    --toc-depth=2 \
    --number-sections \
    -V geometry:margin=2.5cm \
    -V fontsize=11pt \
    -V lang=fr
```

#### Méthode 2 : Script automatique (si xelatex est disponible)

```bash
cd ../../
./generate_elasticsearch_ops_pw_pdf.sh
```

## Fichiers Générés

- `elasticsearch_ops_pw_complete.md` : Fichier maître avec directives d'inclusion
- `elasticsearch_ops_pw_merged.md` : Fichier fusionné (tous les labs en un seul fichier)
- `elasticsearch_ops_pw.pdf` : PDF final généré

## Avantages de cette Structure

1. **Modularité** : Chaque lab est dans son propre fichier
2. **Maintenance** : Facile de modifier un lab spécifique
3. **Versionnement** : Git peut tracker les changements de chaque lab individuellement
4. **Réutilisation** : Possibilité de créer des formations personnalisées en incluant seulement certains labs
5. **Collaboration** : Plusieurs personnes peuvent travailler sur différents labs en parallèle

## Création d'une Formation Personnalisée

Pour créer une version personnalisée avec seulement certains labs :

1. Créez un nouveau fichier markdown (ex: `elasticsearch_ops_custom.md`)
2. Ajoutez les inclusions des labs souhaités :

```markdown
# Formation Elasticsearch - Version Courte

<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_1.1.md"-->
<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_1.2.md"-->
<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_4.1.md"-->
```

3. Utilisez le script de fusion pour générer le fichier complet

## Dépendances

- **pandoc** : Pour la génération de PDF
- **xelatex** : Moteur LaTeX pour pandoc (inclus dans texlive ou mactex)

### Installation sur macOS

```bash
# Installer pandoc
brew install pandoc

# Installer BasicTeX (version légère de LaTeX)
brew install --cask basictex
# OU installer MacTeX (version complète, ~4GB)
brew install --cask mactex
```

### Installation sur Ubuntu/Debian

```bash
sudo apt-get install pandoc texlive-xetex texlive-lang-french
```
