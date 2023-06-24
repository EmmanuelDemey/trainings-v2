---
layout: cover
---

# Getting Started

---

# Présentation Générale

* React est une librairie développée par Facebook
* Elle permet de générer l'HTML de notre application
* Et de le dynamiser
* Utilisé dans de nombreux projets (Facebook lui même)

--- 

# Présentation Générale

* Il est nécessaire d'importer d'autres librairies pour développer une application complète
    * react-router / TanStack Router
    * Redux Toolkit / MobX / Recoil / Zustand
    * Formik / React Hook Form
    * React Query / SWR
    * axios
    * ...

---

# create-react-app

* Pour créer un nouveau projet React, nous allons utiliser le module `create-react-app`
* Ce module permet de créer un squelette de projet et de configurer l'ensemble des outils nécessaires
* Des solutions concurrentes existent comme **Nx** et **Vite**

```shell
npx create-react-app demo --template typescript
```

---

# create-react-app

* Le projet créé proposera plusieurs scripts

```json
{
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
}
```

---

# Outillage

* Voici la liste des outils configurés par `create-react-app`
    * Les librairie `react` et `react-dom`
    * Webpack
    * Jest
    * ESLint
    * Progressive Web App
    * Core Web Vitals
    * Typescript
