---
layout: cover
---

# RGESN

## Référentiel Général d'Écoconception de Services Numériques

---

# Qu'est-ce que le RGESN ?

## Présentation officielle

**Définition:**
> Le RGESN est le référentiel officiel français pour l'écoconception de services numériques, publié par la DINUM (Direction Interministérielle du Numérique) et le Ministère de la Transition Écologique.

**Date de publication:** Version 1.0 en 2022

**Objectif:**
- Fournir un cadre commun aux organisations
- Guider la conception responsable
- Permettre l'évaluation de conformité

**URL:** [ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception](https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/)

---

# Historique et contexte

## Genèse du référentiel

**Origines:**
- Basé sur les travaux de GreenIT.fr (115 bonnes pratiques)
- Demande de la loi REEN (2021)
- Collaboration experts et administrations

**Évolution:**
- 2021: Loi REEN demande un référentiel
- 2022: Publication RGESN v1.0
- Mises à jour régulières prévues

**Statut:**
- Recommandé pour tous
- Obligatoire pour les administrations (à terme)

---

# Structure du RGESN

## Organisation du référentiel

**78 critères** répartis en **8 thématiques:**

1. **Stratégie** (9 critères)
2. **Spécifications** (8 critères)
3. **Architecture** (13 critères)
4. **UX/UI** (11 critères)
5. **Contenus** (10 critères)
6. **Frontend** (11 critères)
7. **Backend** (10 critères)
8. **Hébergement** (6 critères)

---

# Les niveaux de conformité

## 3 niveaux progressifs

**Niveau Bronze (Essentiel):**
- Critères fondamentaux
- Impacts environnementaux majeurs
- Mise en œuvre accessible

**Niveau Argent (Recommandé):**
- Bronze + critères intermédiaires
- Optimisations approfondies
- Expertise technique nécessaire

**Niveau Or (Avancé):**
- Argent + critères avancés
- Excellence environnementale
- Forte maturité requise

---

# Thématique 1: Stratégie

## Piloter la démarche (9 critères)

**Exemples de critères:**

✅ **1.1** - Le service numérique a-t-il défini des objectifs d'écoconception ?

✅ **1.2** - Une démarche d'amélioration continue est-elle en place ?

✅ **1.3** - Les utilisateurs sont-ils sensibilisés aux impacts environnementaux ?

✅ **1.4** - Les équipes sont-elles formées à l'écoconception ?

✅ **1.5** - Le service dispose-t-il d'un référent écoconception ?

---

# Thématique 2: Spécifications

## Définir le besoin (8 critères)

**Exemples de critères:**

✅ **2.1** - Les besoins métiers et utilisateurs sont-ils clairement définis ?

✅ **2.2** - Les fonctionnalités sont-elles priorisées selon leur valeur ?

✅ **2.3** - Les parcours utilisateurs sont-ils optimisés ?

✅ **2.4** - Le service définit-il des budgets environnementaux ?

✅ **2.5** - Les critères d'écoconception sont-ils dans le cahier des charges ?

---

# Thématique 3: Architecture

## Concevoir l'infrastructure (13 critères)

**Exemples de critères:**

✅ **3.1** - L'architecture est-elle dimensionnée au juste nécessaire ?

✅ **3.2** - Le service utilise-t-il la mise en cache efficacement ?

✅ **3.3** - Les ressources statiques sont-elles mutualisées ?

✅ **3.4** - Le service minimise-t-il les échanges réseau ?

✅ **3.5** - La compression est-elle activée ?

✅ **3.6** - HTTP/2 ou supérieur est-il utilisé ?

---

# Thématique 4: UX/UI

## Concevoir l'expérience (11 critères)

**Exemples de critères:**

✅ **4.1** - L'interface privilégie-t-elle la simplicité ?

✅ **4.2** - Les parcours sont-ils les plus courts possibles ?

✅ **4.3** - Le service évite-t-il les dark patterns ?

✅ **4.4** - Le nombre d'écrans est-il limité ?

✅ **4.5** - Les animations sont-elles limitées au nécessaire ?

✅ **4.6** - Un mode sombre est-il proposé ?

---

# Thématique 5: Contenus

## Optimiser les médias (10 critères)

**Exemples de critères:**

✅ **5.1** - Les images sont-elles optimisées et compressées ?

✅ **5.2** - Les formats d'images modernes sont-ils utilisés (WebP, AVIF) ?

✅ **5.3** - Le lazy loading est-il implémenté ?

✅ **5.4** - Les vidéos sont-elles proposées en plusieurs qualités ?

✅ **5.5** - Les polices de caractères sont-elles limitées et optimisées ?

✅ **5.6** - Les ressources décoratives sont-elles évitées ?

---

# Thématique 6: Frontend

## Optimiser le client (11 critères)

**Exemples de critères:**

✅ **6.1** - Le HTML est-il sémantique et valide ?
- Utilisation appropriée des balises (header, nav, article, etc.)
- Validation W3C sans erreur

✅ **6.2** - Le CSS est-il minifié et le code mort supprimé ?
- PurgeCSS ou équivalent utilisé
- Fichiers .min.css en production

✅ **6.3** - Le JavaScript est-il minifié et optimisé ?
- Minification + tree-shaking
- Modules ES6 pour optimisation

✅ **6.4** - Les frameworks sont-ils choisis judicieusement ?
- Justification du choix (vs vanilla)
- Audit de la taille du bundle

✅ **6.5** - Le code splitting est-il implémenté ?
- Routes/pages chargées à la demande
- Lazy loading des composants lourds

✅ **6.6** - Les Web Workers sont-ils utilisés pour les calculs lourds ?
- Traitement asynchrone des données
- Pas de blocage du thread principal

---

# Thématique 7: Backend

## Optimiser le serveur (10 critères)

**Exemples de critères:**

✅ **7.1** - Les requêtes base de données sont-elles optimisées ?

✅ **7.2** - Les indexes sont-ils définis sur les colonnes fréquemment requêtées ?

✅ **7.3** - Les données obsolètes sont-elles nettoyées régulièrement ?

✅ **7.4** - Les APIs minimisent-elles les données transférées ?

✅ **7.5** - La pagination est-elle implémentée ?

✅ **7.6** - Les logs sont-ils dimensionnés au nécessaire ?

---

# Thématique 8: Hébergement

## Infrastructure responsable (6 critères)

**Exemples de critères:**

✅ **8.1** - L'hébergeur utilise-t-il des énergies renouvelables ?

✅ **8.2** - Le PUE du datacenter est-il inférieur à 1.5 ?

✅ **8.3** - Les ressources sont-elles dimensionnées au juste nécessaire ?

✅ **8.4** - Les environnements non utilisés sont-ils éteints ?

✅ **8.5** - Le datacenter est-il certifié (ISO 14001, ISO 50001) ?

✅ **8.6** - La localisation du datacenter est-elle optimisée ?

---

# Méthode d'évaluation

## Comment auditer selon le RGESN ?

**Étapes:**

1. **Préparation**
   - Définir le périmètre
   - Constituer l'équipe d'audit
   - Collecter la documentation

2. **Audit**
   - Vérifier chaque critère applicable
   - Collecter les preuves
   - Attribuer un statut (conforme / non conforme)

3. **Rapport**
   - Taux de conformité par thématique
   - Points forts / points faibles
   - Plan d'actions recommandé

---

# Grille d'audit

## Évaluer un critère

**Pour chaque critère:**

| Statut | Signification |
|--------|---------------|
| **C** | Conforme - Le critère est respecté |
| **NC** | Non conforme - Le critère n'est pas respecté |
| **NA** | Non applicable - Le critère ne concerne pas ce service |

**Calcul du taux de conformité:**

```
Taux = (Nombre de C) / (Nombre de C + NC) × 100
```

**Exemple:** 45 C, 15 NC, 18 NA → Taux = 45/(45+15) = 75%

---

# Obtenir un niveau

## Critères de conformité par niveau

**Pour obtenir le niveau Bronze:**
- Tous les critères Bronze doivent être conformes
- Taux de conformité global > 50%

**Pour obtenir le niveau Argent:**
- Niveau Bronze validé
- Tous les critères Argent doivent être conformes
- Taux de conformité global > 70%

**Pour obtenir le niveau Or:**
- Niveau Argent validé
- Tous les critères Or doivent être conformes
- Taux de conformité global > 85%

---

# Déclaration de conformité

## Communiquer officiellement

**Une fois l'audit réalisé:**

1. **Déclaration publique**
   - Niveau atteint (Bronze / Argent / Or)
   - Taux de conformité
   - Date de l'audit
   - Périmètre audité

2. **Logo RGESN**
   - Affichage autorisé sur le service
   - Transparence envers les utilisateurs

3. **Renouvellement**
   - Audit à renouveler régulièrement
   - Recommandé tous les 2 ans

---

# Exemple d'application

## Cas pratique: Site vitrine

**Contexte:**
- Site institutionnel, 20 pages
- Équipe de 3 personnes
- Objectif: Niveau Bronze

**Actions réalisées:**
1. Formation équipe (2 jours)
2. Audit initial: 42% de conformité
3. Plan d'actions sur 3 mois
4. Optimisations (images, code, hébergement)
5. Audit final: 78% conformité → **Niveau Bronze atteint**

**Gains:** -65% poids, -50% requêtes, Score EcoIndex B

---

# Articulation avec GR491

## Deux référentiels complémentaires

**GR491 (GreenIT.fr):**
- 115 bonnes pratiques détaillées
- Guide technique opérationnel
- Plus exhaustif

**RGESN (DINUM):**
- 78 critères auditables
- Référentiel officiel
- Niveaux de conformité

**Relation:**
- RGESN s'appuie sur GR491
- GR491 apporte le détail technique
- Utiliser les deux ensemble

---

# Outils pour le RGESN

## Faciliter l'audit

**Documentation officielle:**
- Grille d'audit Excel
- Guide méthodologique
- Exemples et cas d'usage

**Outils complémentaires:**
- GreenIT-Analysis (bonnes pratiques)
- EcoIndex (mesure d'impact)
- Lighthouse (performance)

**Accompagnement:**
- Consultants spécialisés
- Formation RGESN
- Communautés d'entraide

---

# RGESN et marchés publics

## Intégration dans les appels d'offres

**Pour les administrations:**
- Obligation d'intégrer des critères d'écoconception
- Référence au RGESN recommandée
- Niveau de conformité exigible

**Exemple de clause:**
> "Le prestataire devra concevoir le service numérique en conformité avec le RGESN niveau Bronze minimum, et s'engager à atteindre le niveau Argent dans les 12 mois suivant la mise en production."

---

# RGESN et accessibilité (RGAA)

## Synergies entre les référentiels

**Points communs:**
- Simplification de l'interface
- Sémantique HTML
- Performance et compatibilité
- Clarté des contenus

**Approche:**
- Traiter RGESN et RGAA ensemble
- Équipes communes
- Audits simultanés

**Bénéfice:** Un service accessible est souvent plus sobre

---

# Évolution du RGESN

## Vers le futur

**Prévisions:**
- Mises à jour régulières
- Nouveaux critères (IA, blockchain, IoT)
- Harmonisation européenne
- Certification officielle ?

**Tendances:**
- Obligation progressive pour l'État
- Extension au privé (incitation)
- Labels et certifications
- Intégration ISO/normes internationales

---

# Cas d'usage sectoriels

## Adaptations par domaine

**Administration:**
- Obligation RGESN + RGAA
- Services citoyens
- Exemplarité

**E-commerce:**
- Parcours d'achat optimisés
- Catalogues légers
- Paiement sobre

**Médias:**
- Streaming optimisé
- Images adaptatives
- CDN responsable

**Applications métier:**
- Performance critique
- Volumes de données
- Fréquence d'usage élevée

---

# Plan d'action RGESN

## Feuille de route type

**Mois 1-2: Préparation**
- Formation équipe
- Audit initial
- Identification des écarts

**Mois 3-6: Actions prioritaires**
- Quick wins (Bronze)
- Mesure des gains
- Documentation

**Mois 7-12: Approfondissement**
- Niveau Argent
- Optimisations avancées
- Amélioration continue

**Année 2: Excellence**
- Niveau Or
- Innovation
- Partage d'expérience

---

# Ressources officielles

## Où trouver l'information ?

**Sites officiels:**
- [ecoresponsable.numerique.gouv.fr](https://ecoresponsable.numerique.gouv.fr)
- [ecoindex.fr](https://www.ecoindex.fr)
- [greenit.fr](https://www.greenit.fr)

**Documentation:**
- PDF du RGESN complet
- Grilles d'audit
- Guides méthodologiques

**Communautés:**
- Planet Tech'Care
- Collectif Conception Numérique Responsable
- Groupes LinkedIn, Discord

---

# En résumé

**Points clés du RGESN:**

- Référentiel officiel français (78 critères, 8 thématiques)
- 3 niveaux de conformité (Bronze, Argent, Or)
- Basé sur les travaux GreenIT.fr
- Obligatoire pour les administrations (à terme)
- Complémentaire avec RGAA (accessibilité)
- Grille d'audit et méthodologie fournis
- Déclaration de conformité possible

**Le RGESN est l'outil de référence pour l'écoconception en France**

---
layout: cover
---

# Conclusion et perspectives

## Passer à l'action
