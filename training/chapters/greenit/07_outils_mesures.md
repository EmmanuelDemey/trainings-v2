---
layout: cover
---

# Outils et mesures

## Évaluer et améliorer son impact

---

# Pourquoi mesurer ?

## L'importance de la quantification

**Raisons de mesurer:**

- 📊 Établir un état des lieux initial
- 🎯 Fixer des objectifs chiffrés
- 📈 Suivre les progrès
- ✅ Valider l'efficacité des actions
- 🔍 Identifier les points d'amélioration
- 💬 Communiquer objectivement

**Principe fondamental:**

> "On ne peut pas améliorer ce qu'on ne mesure pas"

---

# EcoIndex

## L'outil de référence français

**Qu'est-ce que c'est ?**
- Outil gratuit développé par GreenIT.fr
- Note environnementale de A à G
- Basé sur 3 indicateurs techniques

**Les 3 indicateurs:**
1. **Poids de la page** (Mo)
2. **Complexité du DOM** (nombre d'éléments)
3. **Nombre de requêtes HTTP**

**Calcul:** Algorithme qui pondère ces 3 métriques

**URL:** [ecoindex.fr](https://www.ecoindex.fr)

---

# EcoIndex - Interprétation

## Comprendre le score

**Échelle de notation:**

| Note | Score | Impact | Action |
|------|-------|--------|--------|
| **A** | 90-100 | Excellent | Maintenir |
| **B** | 75-89 | Très bon | Optimisations mineures |
| **C** | 50-74 | Bon | Quelques améliorations |
| **D** | 30-49 | Moyen | Actions recommandées |
| **E** | 15-29 | Faible | Actions nécessaires |
| **F** | 5-14 | Mauvais | Refonte conseillée |
| **G** | 0-4 | Très mauvais | Refonte urgente |

---

# EcoIndex - Utilisation

## Comment l'utiliser ?

**Version web (ecoindex.fr):**
- 1️⃣ Saisir l'URL à analyser
- 2️⃣ Obtenir le score (A à G) et les recommandations
- 3️⃣ Consulter les 3 métriques (poids, DOM, requêtes)
- 4️⃣ Exporter le rapport PDF

**Extensions navigateur:**
- 🔌 Chrome, Firefox, Edge
- ⚡ Analyse en temps réel pendant la navigation
- 🏷️ Badge affiché directement sur la page
- 📊 Historique des mesures

**API et CLI:**
- 🤖 Intégration dans CI/CD (GitHub Actions, GitLab CI)
- 📈 Automatisation des tests de régression
- 📉 Suivi dans le temps et alertes
- 🔗 EcoIndex CLI (npm package)

**Exemple d'utilisation CLI:**
```bash
npm install -g ecoindex-cli
ecoindex-cli analyze https://example.com
```

---

# EcoIndex - Badge

## Afficher son engagement

**Projet EcoIndex Badge:**
- Badge à intégrer sur votre site
- Affiche le score en temps réel
- Lien vers le détail du score

**Exemple d'intégration:**

```html
<a href="https://www.ecoindex.fr/resultat/?id=xxx">
  <img src="https://www.ecoindex.fr/badge/?id=xxx"
       alt="Ecoindex Badge">
</a>
```

**Avantage:** Transparence et engagement visible

---

# GreenIT-Analysis

## Extension navigateur de référence

**Qu'est-ce que c'est ?**
- 🔌 Extension navigateur développée par le Collectif Numérique Responsable
- 📋 Audit complet basé sur le **référentiel GR491** (115 bonnes pratiques)
- 🎯 Outil le plus exhaustif pour l'écoconception web
- 🆓 Gratuit et open source

**Disponibilité:**
- Chrome Web Store
- Firefox Add-ons
- Repository GitHub: [CNUMR/GreenIT-Analysis](https://github.com/cnumr/GreenIT-Analysis)

---

# GreenIT-Analysis - Fonctionnalités

## Ce qu'elle analyse

**8 catégories de bonnes pratiques:**

1. 🎨 **UX/Design** (11 règles)
   - Simplicité de l'interface
   - Parcours utilisateur
   - Dark patterns

2. 🖼️ **Contenus** (13 règles)
   - Optimisation images
   - Polices de caractères
   - Vidéos et médias

3. 💻 **Frontend** (40 règles)
   - HTML/CSS/JavaScript
   - Frameworks
   - Animations

4. ⚙️ **Backend** (19 règles)
   - APIs
   - Base de données
   - Cache

---

# GreenIT-Analysis - Fonctionnalités (suite)

## Catégories analysées (suite)

5. 🏗️ **Architecture** (12 règles)
   - Dimensionnement
   - CDN
   - Compression

6. 🌐 **Hébergement** (9 règles)
   - Datacenter
   - Énergie
   - Localisation

7. 📊 **Mesure** (6 règles)
   - Analytics
   - Logs
   - Monitoring

8. 🎓 **Stratégie** (5 règles)
   - Gouvernance
   - Formation
   - Documentation

---

# GreenIT-Analysis - Interface

## Comprendre les résultats

**Score global:**
- Note de 0 à 100
- Répartition par catégorie
- Comparaison avec les moyennes

**Pour chaque bonne pratique:**
- ✅ **Conforme** (bonne pratique respectée)
- ⚠️ **À améliorer** (partiellement respectée)
- ❌ **Non conforme** (règle non respectée)
- ℹ️ **À vérifier manuellement** (nécessite validation humaine)
- ⊘ **Non applicable** (ne concerne pas cette page)

**Informations détaillées:**
- Description de la règle
- Impact environnemental
- Recommandations d'amélioration
- Ressources pour en savoir plus

---

# GreenIT-Analysis - Export et reporting

## Partager les résultats

**Formats d'export:**
- 📄 **PDF** - Rapport complet avec graphiques
- 📊 **CSV** - Données pour analyse Excel
- 🔗 **JSON** - Intégration dans outils tiers
- 📸 **Screenshot** - Capture de l'analyse

**Utilisation des rapports:**
- Présentation aux équipes
- Suivi dans le temps
- Priorisation des actions
- Documentation projet

**Mode avancé:**
- Analyse de plusieurs pages
- Comparaison avant/après
- Suivi de progression

---

# GreenIT-Analysis vs EcoIndex

## Deux outils complémentaires

| Critère | EcoIndex | GreenIT-Analysis |
|---------|----------|------------------|
| **Type** | Note environnementale | Audit de conformité |
| **Métriques** | 3 indicateurs techniques | 115 bonnes pratiques |
| **Temps d'analyse** | < 1 minute | 2-5 minutes |
| **Profondeur** | Score global | Détails par règle |
| **Usage** | Diagnostic rapide | Audit approfondi |
| **Export** | PDF simple | PDF détaillé + CSV/JSON |
| **CI/CD** | Oui (API) | Possible (CLI) |

**Recommandation:** Utiliser les deux !
- EcoIndex pour le monitoring continu
- GreenIT-Analysis pour les audits détaillés

---

# Installation GreenIT-Analysis

## Pas à pas

**1. Téléchargement:**
- Chrome: [Chrome Web Store](https://chrome.google.com/webstore) → "GreenIT-Analysis"
- Firefox: [Firefox Add-ons](https://addons.mozilla.org) → "GreenIT-Analysis"

**2. Installation:**
- Cliquer sur "Ajouter à Chrome/Firefox"
- Accepter les permissions
- L'icône apparaît dans la barre d'outils

**3. Première utilisation:**
- Naviguer vers la page à analyser
- Cliquer sur l'icône GreenIT-Analysis
- Lancer l'analyse (bouton "Analyser")
- Attendre 2-5 minutes selon la complexité

---

# Exercice pratique

## 🔧 Atelier manipulation

**Objectif:** Prendre en main GreenIT-Analysis

**Exercice 1: Installation et première analyse**
1. Installer l'extension GreenIT-Analysis
2. Analyser une page de votre choix
3. Observer le score global et les catégories

**Exercice 2: Analyse détaillée**
1. Analyser votre site/projet actuel
2. Identifier les 3 règles les plus problématiques
3. Lire les recommandations associées
4. Noter les actions prioritaires

**Exercice 3: Comparaison**
1. Analyser un site reconnu éco-conçu (ex: [lowtechlab.org](https://lowtechlab.org))
2. Comparer avec votre analyse précédente
3. Identifier les bonnes pratiques à reproduire

---

# Exercice pratique - Sites à tester

## Suggestions d'URLs pour l'exercice

**Sites éco-conçus (scores élevés):**
- [lowtechlab.org](https://lowtechlab.org) - Site low-tech exemplaire
- [solar.lowtechmagazine.com](https://solar.lowtechmagazine.com) - Magazine solaire
- [greenit.fr](https://www.greenit.fr) - Site du collectif

**Sites moyens (pour comparaison):**
- Votre propre site/projet
- Site d'une entreprise locale
- Site média classique

**Sites lourds (cas d'étude):**
- Sites e-commerce grands groupes
- Sites médias avec vidéos
- Applications web complexes

**💡 Conseil:** Notez vos observations pour en discuter ensemble après l'exercice

---

# Retour d'expérience

## Débrief collectif

**Questions à partager:**

1. 📊 **Scores obtenus:**
   - Quel score avez-vous obtenu ?
   - Étiez-vous surpris ?

2. 🔍 **Principales découvertes:**
   - Quelles règles sont le plus souvent non conformes ?
   - Quelles surprises ?

3. 🎯 **Actions identifiées:**
   - Quelles sont vos 3 actions prioritaires ?
   - Estimez-vous pouvoir les mettre en œuvre ?

4. 🤔 **Difficultés:**
   - Des règles incompréhensibles ?
   - Des recommandations difficiles à appliquer ?

---

# GreenIT-Analysis - Bonnes pratiques d'utilisation

## Maximiser l'efficacité de l'outil

**Avant l'analyse:**
- ✅ Vider le cache navigateur
- ✅ Analyser en navigation privée
- ✅ Désactiver les extensions tierces
- ✅ Préparer plusieurs pages représentatives

**Pendant l'analyse:**
- ⏰ Laisser l'analyse se terminer complètement
- 📝 Prendre des notes en temps réel
- 🔄 Analyser plusieurs pages du parcours utilisateur

**Après l'analyse:**
- 💾 Exporter les résultats (PDF/CSV)
- 📊 Créer un tableau de suivi
- 🎯 Prioriser les actions (impact vs effort)
- 📅 Planifier un audit de suivi (3-6 mois)

---

# Lighthouse

## Outil Google pour la performance

**Ce qu'il mesure:**
- Performance
- Accessibilité
- Bonnes pratiques web
- SEO
- PWA

**Métriques Core Web Vitals:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

**Utilisation:**
- Intégré dans Chrome DevTools
- Version CLI pour CI/CD
- PageSpeed Insights (web)

---

# WebPageTest

## Analyse approfondie de performance

**Fonctionnalités avancées:**
- Test multi-localisations
- Différents navigateurs et appareils
- Simulation de connexion (3G, 4G, 5G)
- Filmstrip (visualisation du chargement)
- Waterfall détaillé

**Métriques:**
- Temps de chargement
- Start Render
- Speed Index
- Bytes téléchargés

**URL:** [webpagetest.org](https://www.webpagetest.org)

---

# Carbon Calculator

## Estimer l'empreinte carbone

**Outils disponibles:**

**Website Carbon Calculator:**
- Estimation CO₂ d'une page web
- Comparaison avec des moyennes
- URL: [websitecarbon.com](https://www.websitecarbon.com)

**CO2.js:**
- Bibliothèque JavaScript
- Calcul d'émissions dans vos applications
- GitHub: [thegreenwebfoundation/co2.js](https://github.com/thegreenwebfoundation/co2.js)

---

# Outils de développement

## Intégration dans le workflow

**Analyse de bundle:**
- **webpack-bundle-analyzer** (Webpack)
- **rollup-plugin-visualizer** (Rollup)
- Identifier les dépendances lourdes

**Optimisation d'images:**
- **ImageOptim** (Mac)
- **Squoosh** (Web, by Google)
- **Sharp** (Node.js)

**CSS:**
- **PurgeCSS** (éliminer CSS inutilisé)
- **cssnano** (minification)

---

# Outils de monitoring

## Suivi continu en production

**Monitoring performance:**
- **Google Analytics** (Core Web Vitals)
- **New Relic, Datadog** (APM)
- **Grafana** (dashboards personnalisés)

**Monitoring infrastructure:**
- Consommation CPU/RAM
- Bande passante réseau
- Requêtes base de données
- Temps de réponse API

**Alertes:**
- Seuils de dégradation
- Anomalies de consommation

---

# Audits et référentiels

## Évaluations structurées

**GR491 (Référentiel GreenIT.fr):**
- 115 bonnes pratiques
- Grille d'audit détaillée
- Système de scoring
- URL: [gr491.isit-europe.org](https://gr491.isit-europe.org)

**RGESN (Référentiel officiel):**
- 78 critères
- 3 niveaux de conformité
- Méthodologie d'audit
- URL: [ecoresponsable.numerique.gouv.fr](https://ecoresponsable.numerique.gouv.fr)

---

# Méthodologie de mesure

## Bonnes pratiques de mesure

**Pour des résultats fiables:**

1. **Mesurer plusieurs fois**
   - Minimum 3 mesures
   - Calculer la médiane

2. **Conditions identiques**
   - Même navigateur/appareil
   - Même connexion réseau
   - Cache vidé

3. **Mesurer les parcours utilisateur complets**
   - Pas seulement la page d'accueil
   - Inclure les interactions

4. **Documenter le contexte**
   - Date, heure
   - Configuration
   - Version du site

---

# Intégration CI/CD

## Automatiser les tests

**Principe:**
- Tests automatiques à chaque commit/déploiement
- Budget de performance défini
- Build échoue si budget dépassé

**Exemple avec Lighthouse CI:**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: treosh/lighthouse-ci-action@v8
        with:
          urls: |
            https://example.com/
          budgetPath: ./budget.json
```

---

# Définir des budgets

## Performance budgets

**Exemples de budgets:**

```json
{
  "budgets": [
    {
      "resourceSizes": [
        { "resourceType": "total", "budget": 500 },
        { "resourceType": "script", "budget": 150 },
        { "resourceType": "image", "budget": 200 }
      ],
      "timings": [
        { "metric": "interactive", "budget": 3000 },
        { "metric": "first-contentful-paint", "budget": 1000 }
      ]
    }
  ]
}
```

**Unités:** KB pour la taille, ms pour le temps

---

# Outils ACV

## Analyse de cycle de vie complète

**Outils professionnels:**

**Fruggr:**
- Plateforme SaaS française
- ACV multi-critères
- Analyse continue
- URL: [fruggr.io](https://www.fruggr.io)

**Greenspector:**
- Mesure sur terminaux réels
- Consommation énergétique
- Impact carbone
- Comparaison d'applications

**Boavizta:**
- Outil open source
- API d'évaluation d'impact
- Base de données ouverte

---

# Outils de sensibilisation

## Former et impliquer

**Calculateurs d'empreinte personnelle:**
- Nos Gestes Climat (ADEME)
- [nosgestesclimat.fr](https://nosgestesclimat.fr)
- Impact CO₂ (ADEME)

**Serious games:**
- Inventons nos Vies Bas Carbone
- La Fresque du Numérique
- Climate Fresk

**Ressources pédagogiques:**
- MOOC Numérique Responsable (INR)
- Cours en ligne GreenIT.fr

---

# Rapporter et communiquer

## Présenter les résultats

**Éléments à inclure dans un rapport:**

1. **Contexte:** Périmètre, date, méthodologie
2. **État initial:** Mesures avant optimisation
3. **Actions réalisées:** Liste et description
4. **Résultats:** Mesures après optimisation
5. **Gains:** Quantification des améliorations
6. **Recommandations:** Prochaines actions

**Formats:**
- Rapports PDF
- Dashboards interactifs
- Présentations PowerPoint/Slidev

---

# Tableau de bord type

## KPIs à suivre

| Indicateur | Valeur initiale | Valeur actuelle | Objectif | Statut |
|------------|----------------|-----------------|----------|--------|
| EcoIndex | C (55) | B (78) | A (>90) | 🟡 |
| Poids moyen | 3.2 MB | 1.8 MB | <1 MB | 🟢 |
| Nb requêtes | 87 | 42 | <30 | 🟡 |
| Temps chargement | 4.2s | 2.1s | <2s | 🟡 |
| Score Lighthouse | 65 | 82 | >90 | 🟡 |

**Légende:** 🟢 Atteint | 🟡 En cours | 🔴 Non atteint

---

# Exemples de gains

## Cas concrets

**Exemple 1: Site e-commerce**
- Avant: EcoIndex E (22), 4.5 MB, 120 requêtes
- Après: EcoIndex B (76), 1.2 MB, 35 requêtes
- **Gains:** -73% poids, -70% requêtes, -65% émissions GES

**Exemple 2: Application métier**
- Avant: Temps de chargement 6s, 250 KB JavaScript
- Après: Temps de chargement 1.8s, 80 KB JavaScript
- **Gains:** -70% temps, -68% JS, +40% taux de conversion

---

# Les pièges à éviter

## Erreurs courantes de mesure

❌ **"J'ai supprimé mes emails, j'ai tout fait"**
- Impact principal = fabrication terminaux, pas stockage

❌ **"Mon site est rapide donc écoconçu"**
- Performance ≠ écoconception (approche multicritère)

❌ **"J'ai réduit le CO₂, c'est bon"**
- Penser multi-critères (eau, ressources, etc.)

❌ **"Je mesure une fois et c'est fini"**
- Amélioration continue nécessaire

❌ **"Je mesure uniquement la homepage"**
- Analyser les parcours utilisateurs complets

---

# Plan d'action type

## Étapes recommandées

**Phase 1: Diagnostic (1 mois)**
1. Mesurer l'existant (EcoIndex, audits)
2. Identifier les hotspots
3. Prioriser les actions

**Phase 2: Quick wins (2 mois)**
1. Images, compression, minification
2. Suppression code mort
3. Mesurer les gains

**Phase 3: Optimisations profondes (6 mois)**
1. Refonte architecture si nécessaire
2. Simplification fonctionnelle
3. Formation équipes

**Phase 4: Amélioration continue**
1. Monitoring permanent
2. Budgets de performance
3. Intégration CI/CD

---

# En résumé

**Les points clés:**

- Mesurer avec EcoIndex et GreenIT-Analysis
- Utiliser plusieurs outils complémentaires
- Intégrer dans le workflow de développement
- Définir des budgets de performance
- Monitorer en continu
- Communiquer les résultats
- Éviter les pièges de mesure

**Outils gratuits disponibles dès aujourd'hui !**

---
layout: cover
---

# Le RGESN en détail

## Application concrète du référentiel
