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

# Git

---

# Introduction à Git :

---

# Configuration initiale

* Pour intialiser un projet nous allons exécuter la commande suivante

```shell
git init
```

* Le resultat sera la création d'un répertoire *.git*

---

# .gitconfig

* Fichier de configuration permettant de configurer GIT. 
  * Peut etre défini localement à un projet ou globalement à votre système. 

```
[init]
  defaultBranch = main

[help]
  autocorrect = 8

[core]
  editor = \"C:\\Users\\Rob\\AppData\\Local\\Programs\\Microsoft VS Code\\bin\\code\" --wait

[alias]
  hist = log --oneline --graph --decorate --all
```

--- 

# Concepts fondamentaux de Git

---

# Commandes de base

---

# git init 

---

# git add

---

# git commit

---

# git status

---

# git log

---

# git diff


---

# .gitignore

* Fichier permettant de définir les fichiers qui ne doivent pas être versionné par GIT
  * `.dll`, `*.class`, `dist`, `build`, `*.o`...
* Ce fichier de configuration doit par contre lui être versionné. 

```
doc.txt
*.class
dist
```

---

# Gestion des branches

---

# Travail collaboratif avec Git

---

# Fonctionnalités avancées

---

# Git stash

---

# Git rebase

---

# Git cherry-pick

---

# Git reset

---

# Bonnes pratiques et workflows

---

# Utilisation de plateformes de collaboration 

---

# Github Actions

* Github Actions est la solution permettant d'optimiser le cycle de vie d'un projet
  * Intégration Continue
  * Déploiment Continu
* Possibilité de définir ds actions qui seront exécutées automatiquement en fonction d'un evenement Github. 
* La configuration se réalise via un fichier YAML dans le repertoire `.github/workflows`
* Pour tester en local vos workflow, vous pouvez utiliser l'outil en ligne de commande **act**

```yaml
name: Quality
on:
  workflow_dispatch:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  test-build:
    name: Test & build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [ 16 ]
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node }}
      - run: yarn
      # Build modules
      - run: yarn build
      - run: yarn test:coverage
```

---

# Pour aller plus loin 

[Git, sous le capot (David Blanchet)](https://www.youtube.com/watch?v=Ns1_jDbB0Xg)

---