# ESLint

* Outil permettant de s'assurer de la qualité de code du projet
* Possibilité d'ajouter des plugins en fonction de l'application développée
* Depuis la version **9**, la configuration doit être définie dans un fichier **eslint.config.ts**
* L'option **--fix** permet de fixer automatiquement les erreurs

---

# ESLint

```typescript
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import vitest from 'eslint-plugin-vitest';

export default [
  { ignores: ['dist/'] },
  { files: ['src/**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  eslintPluginPrettierRecommended,
  vitest.configs.recommended,
  {
    settings: { react: { version: '18.3' } }
  }
];
```

---

# ESLint - plugins

* eslint-config-prettier
* eslint-plugin-cypress
* eslint-plugin-jest-dom
* eslint-plugin-react
* eslint-plugin-react-hooks
* eslint-plugin-testing-library

---

# ESLint

* Création de script dans le `package.json`

```json
{
  "scripts": {
    "lint": "eslint src"
  }
}
```
