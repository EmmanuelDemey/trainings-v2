# Prettier

- Librairie développée par Facebook permettant de formater du code
- Gére plusieurs langages : JavaScript, TypeScript, HTML, CSS, JSON, ...
- Bien intégrée dans les IDE (Webstorm, VSCode, ...)
- Une configuration Prettier pour toute l'équipe
- De nombreux plugins existent permettant d'étendre Prettier
  - _prettier-plugin-organize-imports_

---

# Prettier

```json
{
  "prettier": {
    "bracketSpacing": true,
    "semi": true,
    "singleQuote": true,
    "trailingComma": "es5",
    "useTabs": true
  }
}
```

---

# Prettier

- Création de script dans le `package.json`

```json
{
  "scripts": {
    "prettier": "prettier --write \"src/**/*.{ts,tsx,js,jsx}\""
  }
}
```
