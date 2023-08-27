---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: 'text-center'
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# persist drawings in exports and build
drawings:
  persist: false
# page transition
transition: slide-left
# use UnoCSS
css: unocss
---

# Vue.JS

---

# Plan

---

# Introduction à la formation Vue.js

Objectifs et approche pédagogiques de cette formation Vue.js
Présentation du framework : philosophie, grands principes et évolution au fil des versions
Quelles différences avec Angular et React ?
ES2015+ et les modules
Programmation réactive
Les bénéfices de l'utilisation de TypeScript avec Vue, concepts fondamentaux
Web components
Outillage : utiliser Vite au lieu de Webpack, Visual Studio Code, Volar...
Installation de Vue : Vue CLI, la librairie create-vue

---

# Prise en main et templates
L'architecture de Vue
Single-File Components
Introduction aux templates
v-bind et v-on
De Option API à Composition API
Fonctions et propriétés

---

# Composants et réactivité
Créer et manipuler un premier composant grâce à notre formation Vue.js
Props et évènements
Cycle de vie des composants Vue
Directives : v-html, v-model, v-if...
Les fonctions reactive(), ref() et computed()
La syntaxe script setup pour définir un composant
watch() et watchEffect()
Timing pour la mise à jour du DOM

---

# Styles et classes
Styles scopés
Préprocesseurs CSS
Liaison de styles et classes (objets, tableaux...)

---

# Aller plus loin avec les composants
Utiliser des directives sur les composants
Cascade d'attributs
Les slots
Provide et Inject
Composants asynchrones

# Composables, directives personnalisées et plugins 
Qu'est-ce qu'un composable ? Intérêt pour le développement avec Vue
Utiliser un composable
Créer des directives personnalisées
Plugins

---

# Routage et navigation avec Vue Router
Introduction à Vue Router
Paramètres URL
Construction de la pagination
Routes imbriquées et routes protégées
Redirections et alias
Gestion des erreurs

---

# Gestion des états avec Pinia
De VueX à Pinia
Configuration
Définir un store
Gérer les états
Gérer les getters
Les actions

---

# Tests
Tests unitaires
Présentation de Vitest
Les fonctions describ(), test(), it()...
Tests asynchrones
Introduction à test-utils
Tests de composants
Tests end-to-end avec Cypress

---

# Mise en production
Le déploiement d'applications avec Vue
Meilleures pratiques