---
layout: cover
---

# Getting Started

---

# Présentation Générale

* React.js est une librairie développée par Meta
* Elle permet de générer l'HTML de notre application
* Et de le dynamiser
* Utilisé dans de nombreux projets (Meta lui même)

--- 

# Présentation Générale

* Il est nécessaire d'importer d'autres librairies pour développer une application complète
    * react-router / TanStack Router
    * Redux Toolkit / MobX / Recoil / Zustand / Jotai / XState / Akita
    * Formik / React Hook Form
    * React Query / SWR / RTK Query
    * axios
    * react-i18next / Format.JS
    * ...

---

# vite

* Pour créer un nouveau projet React, nous allons utiliser le module `vite`
* Ce module permet de créer un squelette de projet et de configurer l'ensemble des outils nécessaires
* Des solutions concurrentes existent comme **Nx** et **create-react-app**

```shell
npm create vite@latest my-react-app -- --template react-ts
```

---

# Vite

* Le projet créé proposera plusieurs scripts

```json
{
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
}
```

* Voici la liste des outils configurés par `Vite`
    * Les librairies `react` et `react-dom`
    * Vite
    * Vitest et Testing Library
    * ESLint
    * Typescript


---
layout: cover
---

# Travaux Pratiques
