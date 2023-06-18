# Husky

* Module permettant d'exécuter des scripts via un hook GIT.

```shell
npm install husky --save-dev

npm set-script prepare "husky install"

npx husky add .husky/pre-commit "npm run prettier && npm run lint && npm run test:ci && npm run cypress:ci"
```
