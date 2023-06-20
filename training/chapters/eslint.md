# ESLint

* Outil permettant de s'assurer de la qualité de code du projet
* Possibilité d'ajouter des plugins en fonction de l'application développée
* Configuration dans `package.json`, `eslint.js` ou `.eslintrc`
* L'option `--fix` permet de fixer automatiquement les erreurs

---

# ESLint

```json
{
        "extends": [
                "react-app"
		],
        "plugins": ["react-hooks", "testing-library", "jest-dom"],
        "rules": {
                "no-duplicate-imports": "error"
        },
        "globals": {
                "cy": true
        }
}
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
