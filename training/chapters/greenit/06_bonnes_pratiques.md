---
layout: cover
---

# Bonnes pratiques

## Actions concrètes pour un numérique plus sobre

---

# Les bonnes pratiques par catégorie

## 8 grandes familles

1. **Stratégie et gouvernance**
2. **Spécifications**
3. **Architecture**
4. **UX/UI Design**
5. **Contenus**
6. **Frontend (HTML/CSS/JS)**
7. **Backend et base de données**
8. **Hébergement**

---

# Stratégie et gouvernance

## Piloter la démarche

**Bonnes pratiques:**

- ✅ Nommer un référent numérique responsable
- ✅ Former et sensibiliser les équipes
- ✅ Définir des objectifs environnementaux mesurables
- ✅ Intégrer l'écoconception dans les appels d'offres
- ✅ Mesurer et suivre les indicateurs régulièrement
- ✅ Communiquer sur la démarche

**Exemple d'objectif:** Réduire de 30% le poids moyen des pages en 6 mois

---

# Spécifications

## Définir le besoin de manière sobre

**Bonnes pratiques:**

- ✅ Questionner systématiquement chaque fonctionnalité
- ✅ Prioriser selon la valeur utilisateur
- ✅ Définir des critères d'écoconception dès le cahier des charges
- ✅ Préférer les fonctionnalités essentielles (MVP)
- ✅ Éviter le feature creep (ajout continu de fonctionnalités)

**Règle:** Si une fonctionnalité est utilisée par < 5% des utilisateurs, la questionner

---

# Architecture

## Concevoir une infrastructure sobre

**Côté serveur:**
- ✅ Dimensionner au juste nécessaire
- ✅ Utiliser la mise en cache efficacement
- ✅ Mutualiser les ressources
- ✅ Choisir des langages et frameworks performants
- ✅ Optimiser les requêtes base de données

**Côté réseau:**
- ✅ Minimiser les échanges client-serveur
- ✅ Utiliser la compression (gzip, brotli)
- ✅ Implémenter le HTTP/2 ou HTTP/3
- ✅ Utiliser un CDN si pertinent (mais pas systématiquement)

---

# UX/UI Design

## Concevoir une expérience sobre

**Parcours utilisateur:**
- ✅ Simplifier les parcours (moins d'écrans)
- ✅ Réduire le nombre de clics nécessaires
- ✅ Éviter les dark patterns
- ✅ Permettre d'aller à l'essentiel rapidement

**Interface:**
- ✅ Privilégier les interfaces simples
- ✅ Limiter les animations et effets
- ✅ Utiliser des couleurs sobres (le noir consomme moins sur OLED)
- ✅ Préférer le mode sombre comme option

---

# Contenus

## Alléger les ressources

**Images:**
- ✅ Optimiser la taille et la compression (WebP, AVIF)
- ✅ Utiliser le lazy loading (chargement différé)
- ✅ Proposer plusieurs résolutions (responsive images)
- ✅ Éviter les images décoratives inutiles
- ✅ Privilégier SVG pour les icônes et illustrations

**Vidéos:**
- ✅ Héberger uniquement si nécessaire
- ✅ Proposer plusieurs qualités
- ✅ Ne pas lancer automatiquement
- ✅ Utiliser des codecs modernes (AV1, VP9)

---

# Contenus (suite)

## Fonts et médias

**Polices de caractères:**
- ✅ Limiter le nombre de polices (2 max recommandé)
- ✅ Charger uniquement les graisses nécessaires
- ✅ Utiliser les polices système quand c'est possible
- ✅ Subset des polices (caractères utilisés uniquement)

**Documents:**
- ✅ Optimiser les PDFs
- ✅ Proposer des alternatives texte
- ✅ Limiter la taille des téléchargements

---

# Frontend - HTML

## Code HTML sobre

**Structure:**
- ✅ HTML sémantique (balises appropriées)
- ✅ Minimiser la profondeur du DOM
- ✅ Éviter les div et span inutiles
- ✅ Valider le code (W3C Validator)

**Performance:**
- ✅ Ordre de chargement optimal (CSS → JS)
- ✅ Attributs async/defer pour les scripts
- ✅ Précharger les ressources critiques
- ✅ Éviter les iframes autant que possible

---

# Frontend - CSS

## Styles optimisés

**Bonnes pratiques:**
- ✅ Minifier et compresser le CSS
- ✅ Éliminer le CSS non utilisé (PurgeCSS, UnCSS)
- ✅ Utiliser des sélecteurs simples et performants
- ✅ Éviter les frameworks CSS lourds si non nécessaire
- ✅ Préférer CSS natif aux préprocesseurs quand possible

**Animations:**
- ✅ Utiliser transform et opacity (GPU)
- ✅ Éviter les animations sur propriétés coûteuses
- ✅ Limiter le nombre d'animations simultanées

---

# Frontend - JavaScript

## JS sobre et performant

**Gestion du code:**
- ✅ Minimiser et compresser (minification, tree-shaking)
- ✅ Code splitting (charger uniquement le nécessaire)
- ✅ Lazy loading des modules
- ✅ Éviter les polyfills inutiles (utiliser browserslist)
- ✅ Limiter les dépendances npm (audit régulier)

**Exécution optimisée:**
- ✅ Éviter les boucles coûteuses (préférer map/filter/reduce)
- ✅ Debounce/throttle des événements (scroll, resize, input)
- ✅ Utiliser les Web Workers pour les calculs lourds
- ✅ Nettoyer les event listeners (éviter memory leaks)
- ✅ RequestAnimationFrame pour les animations
- ✅ Intersection Observer au lieu de scroll events

**Exemple pratique:**
```javascript
// ❌ Mauvais: Événement scroll non optimisé
window.addEventListener('scroll', () => {
  // Code coûteux à chaque pixel
});

// ✅ Bon: Throttle + Intersection Observer
const observer = new IntersectionObserver(entries => {
  // Code uniquement quand élément visible
});
```

---

# Frontend - Frameworks

## Choisir judicieusement

**Questions à se poser:**
- Ai-je vraiment besoin d'un framework ?
- Un framework léger suffit-il (Preact, Alpine.js, Svelte) ?
- Puis-je utiliser du JavaScript vanilla ?

**Comparaison de taille (minifié+gzippé):**
- Vanilla JS: 0 KB
- Alpine.js: 15 KB
- Preact: 10 KB
- Vue.js: 40 KB
- React: 45 KB
- Angular: 150 KB

**La meilleure bibliothèque est celle qu'on n'utilise pas !**

---

# Backend - Langages et frameworks

## Performance serveur

**Langages performants:**
- ✅ Go, Rust (très performants)
- ✅ Java, C# (performants)
- ✅ Node.js, Python (moyens mais optimisables)

**Frameworks légers:**
- ✅ Préférer les frameworks minimalistes
- ✅ Activer uniquement les modules nécessaires
- ✅ Configurer finement les middlewares

**Ne pas sur-architecturer:** KISS (Keep It Simple, Stupid)

---

# Backend - Base de données

## Optimisation des données

**Requêtes:**
- ✅ Indexer les colonnes fréquemment requêtées
- ✅ Optimiser les jointures
- ✅ Utiliser EXPLAIN pour analyser
- ✅ Paginer les résultats
- ✅ Éviter les SELECT *

**Architecture:**
- ✅ Dimensionner au juste nécessaire
- ✅ Nettoyer régulièrement les données obsolètes
- ✅ Archiver les anciennes données
- ✅ Utiliser la bonne base pour le bon usage (SQL vs NoSQL)

---

# Backend - APIs

## Services et intégrations

**Conception:**
- ✅ Minimiser le nombre d'appels
- ✅ Utiliser GraphQL si pertinent (requêtes précises)
- ✅ Implémenter la pagination
- ✅ Versionner les APIs

**Optimisation:**
- ✅ Mettre en cache les réponses
- ✅ Compresser les payloads (gzip)
- ✅ Limiter les données retournées (seulement le nécessaire)
- ✅ Utiliser les codes HTTP appropriés

---

# Hébergement

## Infrastructure responsable

**Choix de l'hébergeur:**
- ✅ Privilégier les datacenters à mix énergétique décarboné
- ✅ Vérifier les certifications (ISO 14001, ISO 50001)
- ✅ Préférer les datacenters locaux (réduction latence)
- ✅ Choisir des hébergeurs avec PUE < 1.5

**Dimensionnement:**
- ✅ Ajuster les ressources au besoin réel
- ✅ Utiliser l'auto-scaling si pertinent
- ✅ Éteindre les environnements non utilisés
- ✅ Mutualiser les ressources

---

# Hébergement (suite)

## Configuration et monitoring

**Configuration:**
- ✅ Activer la compression au niveau serveur
- ✅ Configurer les en-têtes de cache HTTP
- ✅ Utiliser HTTP/2 ou HTTP/3
- ✅ Activer les logs uniquement si nécessaire

**Monitoring:**
- ✅ Surveiller la consommation réelle
- ✅ Identifier les pics et les optimiser
- ✅ Alerter sur les dépassements anormaux
- ✅ Mesurer le PUE si possible

---

# Emails

## Communication numérique

**Bonnes pratiques:**
- ✅ Réduire la taille des emails (< 100 KB idéalement)
- ✅ Optimiser les images dans les emails
- ✅ Supprimer les destinataires inutiles (CC, CCI)
- ✅ Nettoyer régulièrement sa boîte
- ✅ Se désabonner des newsletters non lues
- ✅ Éviter les pièces jointes volumineuses (utiliser liens)

**Impact:** Un email avec PJ de 1 Mo = 20g CO₂eq

---

# Visioconférence et collaboration

## Communications à distance

**Hiérarchie des impacts (du moins au plus impactant):**
1. Audio uniquement (téléphone, conférence audio)
2. Visio qualité standard, caméra désactivée
3. Visio qualité standard, caméra activée
4. Visio haute définition

**Bonnes pratiques:**
- ✅ Désactiver la vidéo si non nécessaire
- ✅ Réduire la qualité vidéo
- ✅ Privilégier l'audio pour les réunions longues
- ✅ Fermer les applications inutiles en arrière-plan

---

# Stockage cloud

## Données dans le nuage

**Bonnes pratiques:**
- ✅ Nettoyer régulièrement (fichiers dupliqués, obsolètes)
- ✅ Limiter la synchronisation automatique
- ✅ Compresser les fichiers avant upload
- ✅ Utiliser des outils de dédoublonnage
- ✅ Archiver les données anciennes

**Règle:** Si vous n'avez pas consulté un fichier depuis 1 an, questionnez sa conservation

---

# Terminaux utilisateurs

## Allonger la durée de vie

**Achats:**
- ✅ Privilégier le reconditionné
- ✅ Vérifier l'indice de réparabilité
- ✅ Choisir des équipements évolutifs
- ✅ Acheter au juste nécessaire (pas de sur-performance)

**Usage:**
- ✅ Entretenir régulièrement
- ✅ Réparer plutôt que remplacer
- ✅ Mettre à jour le système (sécurité)
- ✅ Nettoyer les applications inutiles
- ✅ Désactiver les fonctionnalités non utilisées

**Fin de vie:**
- ✅ Donner / revendre
- ✅ Recycler correctement

---

# Bonnes pratiques utilisateur

## Au quotidien

**Navigation web:**
- ✅ Fermer les onglets inutilisés
- ✅ Utiliser les favoris plutôt que chercher
- ✅ Bloquer les publicités (uBlock Origin)
- ✅ Désactiver la lecture automatique des vidéos

**Messagerie:**
- ✅ Trier et archiver régulièrement
- ✅ Supprimer les spams et newsletters
- ✅ Se désabonner des listes inutiles

**Stockage:**
- ✅ Éviter les doublons
- ✅ Nettoyer photos et vidéos
- ✅ Vider la corbeille régulièrement

---

# Prioriser les actions

## Par où commencer ? Matrice Impact/Effort

**🟢 Impact élevé + Facilité élevée (QUICK WINS - Semaine 1):**
1. ✅ Optimiser les images (WebP, compression)
2. ✅ Activer la compression gzip/brotli
3. ✅ Minifier CSS/JS
4. ✅ Supprimer le code mort (CSS/JS non utilisés)
5. ✅ Lazy loading des images

**🟡 Impact élevé + Facilité moyenne (Mois 1-2):**
1. 🔧 Simplifier les parcours utilisateurs
2. 🔧 Réduire/supprimer les fonctionnalités < 5% usage
3. 🔧 Optimiser les requêtes base de données
4. 🔧 Implémenter le lazy loading des modules JS
5. 🔧 Audit et réduction des dépendances npm

**🔴 Impact élevé + Facilité faible (Mois 3-6):**
1. 🏗️ Changer de framework (si pertinent)
2. 🏗️ Refonte architecture
3. 🏗️ Migration hébergeur (datacenter vert)
4. 🏗️ Refonte UX/UI complète

**💡 Règle 80/20:** Concentrez-vous d'abord sur les quick wins pour des résultats rapides !

---

# Mesurer pour progresser

## Les métriques à suivre

**Performance:**
- Poids de la page
- Nombre de requêtes
- Temps de chargement
- Core Web Vitals

**Impact environnemental:**
- Score EcoIndex
- Émissions GES estimées
- Consommation serveur

**Accessibilité:**
- Score Lighthouse
- Conformité RGAA

**Règle d'or:** Ce qui ne se mesure pas ne s'améliore pas

---

# En résumé

**Les bonnes pratiques clés:**

- Questionner chaque fonctionnalité
- Optimiser les contenus (images, vidéos, fonts)
- Écrire du code sobre et performant
- Choisir des frameworks avec parcimonie
- Héberger de manière responsable
- Allonger la durée de vie des équipements
- Mesurer pour progresser

**Principe:** Chaque petite action compte, mais prioriser les actions à fort impact

---
layout: cover
---

# Outils et mesures

## Comment évaluer et suivre ses progrès
