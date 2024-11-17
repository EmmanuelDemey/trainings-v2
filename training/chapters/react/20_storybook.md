---
layout: cover
---

# 20 - Storybook

---
src: ../storybook.md
hide: true
---

# Présentation générale

- Développement et visualisation des composants UI en **isolation**
- Façon de documenter ses composants
- Test visuel et tests d'accessibilité

---

# Ajouter Storybook à un projet React

### Installation

```bash
npx sb init
```

Le dossier `storybook` contient :

- `main.js` : Fichier principal de configuration de Storybook
- `preview.js` : Fichier pour personnaliser le rendu des composants
- `manager.js` : Configuration de l'interface de gestion de Storybook

Le dossier `stories` contient des exemples de stories pour commencer.

### Script de lancement

```bash
npm run storybook
```

---

# Configurer Storybook pour Vite

```bash
npm install @storybook/builder-vite @storybook/manager-vite --save-dev
```

Utiliser vite comme builder :

```javascript
// storybook/main.js
module.exports = {
  core: {
    builder: '@storybook/builder-vite',
  },
  stories: [
    // Indiquez le chemin des fichiers stories dans votre projet
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
  ],
  framework: '@storybook/react',
};
```

---

# Configurer TypeScript pour Storybook

```bash
npm i ts-loader --save-dev
```

Mettre à jour le fichier `tsconfig.json` :

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    ".storybook/**/*.ts",
    ".storybook/**/*.tsx"
  ]
}
```

---

# Créer une story

```typescript
// src/components/common/Title.stories.tsx
import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Title } from './Title';

export default {
  title: 'Components/Title',
  component: Title,
} as ComponentMeta<typeof Title>;

const Template: ComponentStory<typeof Title> = (args) => <Title {...args} />;

export const Default = Template.bind({});
Default.args = {
  text: 'Click Me',
};

export const Primary = Template.bind({});
Primary.args = {
  text: 'Primary Button',
  variant: 'primary',
};
```


---
layout: cover
---

# Travaux Pratiques

## WP 20