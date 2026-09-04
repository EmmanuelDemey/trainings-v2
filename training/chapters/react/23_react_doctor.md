---
layout: cover
---

# 23 - React Doctor

---

# Présentation générale

- Outil d'**audit** d'une base de code React, en ligne de commande
- Analyse **déterministe** (pas de LLM) : les mêmes sources donnent toujours le même rapport
- Couvre la correction, les performances, la sécurité, l'accessibilité et la maintenabilité
- Produit un **score de santé sur 100** et la liste des diagnostics associés
- Fonctionne sur les principaux environnements React : Vite, Next.js, Astro, TanStack, React Native, Expo
- Publié par Million Software sous licence MIT modifiée : gratuit pour la très grande majorité des usages

[Documentation](https://www.react.doctor/)

---

# Premier scan

- Aucune installation nécessaire, l'outil s'exécute à la racine du projet

```shell
npx react-doctor@latest
```

- React Doctor détecte le framework, la version de React et le jeu de règles à appliquer
- L'option **--verbose** affiche les fichiers et les numéros de ligne concernés

```shell
npx react-doctor@latest --verbose
```

- Le scan par défaut ajoute deux analyses de maintenabilité :
  - les composants et hooks trop **complexes**
  - les structures **JSX dupliquées**, candidates à l'extraction dans un composant partagé

---

# Les catégories de diagnostics

- Plus de 800 règles, regroupées par catégorie :

<div style="display: flex; gap: 3rem;">
<div>

- **State & Effects**
- **Correctness**
- **Bugs**
- **Performance**
- **Security**
- **Accessibility**

</div>
<div>

- **Architecture**
- **Maintainability**
- **Bundle Size**
- **React Compiler**
- **Next.js**, **React Native**, **Preact**
- **TanStack Query / Start**

</div>
</div>

- Chaque règle est identifiée par `react-doctor/<nom-de-la-règle>`

```shell
npx react-doctor@latest rules list
npx react-doctor@latest rules explain react-doctor/no-fetch-in-effect
```

---

# Exemple - `no-derived-state-effect`

- Un état recopié depuis les props via un effet provoque un premier rendu obsolète

```tsx
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

- La valeur doit être calculée pendant le rendu

```tsx
const fullName = `${firstName} ${lastName}`;
```

[You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

---

# Quelques règles utiles

- **State & Effects**
  - `no-fetch-in-effect` : préférer TanStack Query, SWR ou un Server Component
  - `effect-needs-cleanup` : rendre la fonction de nettoyage d'un abonnement ou d'un timer
  - `no-direct-state-mutation` : muter l'état en place ne déclenche aucun rendu
- **Performance**
  - `no-array-index-key` : utiliser une clé stable, issue de la donnée
  - `jsx-no-constructed-context-values` : mémoïser la valeur passée à un `Provider`
- **Sécurité**
  - `artifact-env-leak` : un secret exposé derrière un préfixe `VITE_` est lisible par tous
  - `dangerous-html-sink` : `dangerouslySetInnerHTML` alimenté par une donnée utilisateur
- **Accessibilité**
  - `label-has-associated-control`, `alt-text`, `no-static-element-interactions`

---

# Cibler le scan

- Sur une base de code existante, le rapport complet est souvent décourageant
- L'option **--scope changed** ne remonte que les problèmes **introduits** par la branche

```shell
npx react-doctor@latest --verbose --scope changed --base main
```

- Les autres portées : `full` (défaut), `files`, `lines`
- L'option **--category** restreint le rapport à une ou plusieurs catégories

```shell
npx react-doctor@latest --category Security --category Performance
```

- Pour un hook de pré-commit, **--staged** limite l'analyse aux fichiers indexés

---

# Sorties et intégration

- **--json** produit un rapport structuré, **--score** uniquement la note

```shell
npx react-doctor@latest --json | jq '.summary'
npx react-doctor@latest --score
```

- **--blocking** pilote le code de retour : `error`, `warning` ou `none`

```shell
npx react-doctor@latest --blocking error
```

- **-y** évite toute question interactive, indispensable en CI
- La commande `why` explique un diagnostic précis

```shell
npx react-doctor@latest why src/App.tsx:42
```

---

# Configuration

- Un fichier `doctor.config.ts` (ou `.json`, ou la clé `reactDoctor` du `package.json`)

```typescript
import { defineConfig } from 'react-doctor/api';

export default defineConfig({
  rules: {
    'react-doctor/no-array-index-as-key': 'error'
  },
  categories: {
    Maintainability: 'warn'
  },
  ignore: {
    rules: ['react-doctor/no-danger'],
    files: ['src/generated/**']
  }
});
```

- Les options de la ligne de commande sont prioritaires sur le fichier de configuration

---

# Intégration à ESLint

- Pour les équipes qui préfèrent ne garder qu'une seule commande de lint

```shell
npm install -D eslint-plugin-react-doctor
```

```typescript
import reactDoctor from 'eslint-plugin-react-doctor';

export default [
  reactDoctor.configs.recommended
];
```

- Des presets par environnement : `next`, `react-native`, `tanstack-query`, `preact`
- Un plugin équivalent existe pour **oxlint** : `oxlint-plugin-react-doctor`
- Attention : les règles qui analysent le projet dans son ensemble (fuite de secrets, configuration) ne fonctionnent que via la CLI

---

# Intégration continue

- Installation d'un workflow GitHub Actions

```shell
npx react-doctor@latest ci install
```

- Le fichier `.github/workflows/react-doctor.yml` est généré
- Par défaut, la CI **commente** les nouveaux problèmes de la Pull Request sans bloquer la fusion
- `react-doctor ci config` permet ensuite de durcir la règle
- Sur GitLab, CircleCI ou Jenkins, la CLI s'utilise directement avec `--scope changed --blocking error`

---

# Agents de code

- React Doctor peut installer ses règles dans la configuration des assistants (Claude Code, Cursor, Codex, OpenCode)

```shell
npx react-doctor@latest install
```

- L'objectif est double :
  - l'agent connaît les règles **avant** d'écrire le code
  - l'agent sait relancer un scan et corriger ce qu'il a produit

---
layout: cover
---

# Travaux Pratiques

## PW 23
