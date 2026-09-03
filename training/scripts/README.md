# Scripts de Génération

Ce dossier contient les scripts pour générer les PDFs des formations.

## generateA11y.js

Script de génération des PDFs pour toutes les formations (Accessibilité, Elasticsearch Ops,
React et Vue.js Avancé).

### Prérequis

Les dépendances nécessaires sont déjà définies dans `training/package.json` :
- `puppeteer` - Pour générer le PDF du cahier d'exercices
- `marked` - Pour convertir le Markdown en HTML
- `@slidev/cli` - Pour générer le PDF des slides

### Installation

Depuis le dossier `training/` :

```bash
pnpm install
```

### Utilisation

Depuis le dossier `training/` :

```bash
# Tous les PDFs (A11y + Elasticsearch + React + Vue.js Avancé) — plusieurs minutes
pnpm run generate:all

# Une seule formation (slides + cahier d'exercices)
pnpm run generate:a11y
pnpm run generate:elasticsearch
pnpm run generate:react
pnpm run generate:vuejs-advanced

# Le cahier d'exercices Vue.js Avancé seul (~1 s, pas d'export Slidev)
pnpm run generate:vuejs-advanced:tp
```

### Filtres

Les alias ci-dessus reposent sur deux options, combinables :

| Option | Effet |
|---|---|
| `--only=<formation>` | Restreint aux formations données (séparées par des virgules). Valeurs : `a11y`, `elasticsearch`, `react`, `vuejs-advanced` |
| `--slides` | Seulement les slides (Slidev) |
| `--exercices` | Seulement les cahiers d'exercices (Puppeteer) |

Sans option, tout est généré.

```bash
node ./scripts/generateA11y.js --only=vuejs-advanced --exercices
node ./scripts/generateA11y.js --only=react,vuejs-advanced --slides
```

L'export Slidev est de loin l'étape la plus lente (~45 s par formation, séquentiel à
cause d'un conflit de port). Si seul le cahier d'exercices vous intéresse, `--exercices`
l'évite complètement.

Ou directement :

```bash
node ../scripts/generateA11y.js
```

### Sortie

Les PDFs sont générés dans le dossier `dist/` :

**Formation Accessibilité:**
- `dist/a11y_slides.pdf` - Les slides de la formation (Slidev)
- `dist/a11y_exercices.pdf` - Le cahier d'exercices pratiques (Puppeteer)

**Formation Elasticsearch Ops:**
- `dist/elasticsearch_ops_slides.pdf` - Les slides de la formation (Slidev)
- `dist/elasticsearch_ops_exercices.pdf` - Le cahier d'exercices pratiques (Puppeteer)
- `dist/elasticsearch_ops_cheatsheet.pdf` - Le cheatsheet de commandes (Puppeteer)

**Formation Vue.js Avancé:**
- `dist/vuejs_advanced_slides.pdf` - Les slides de la formation (Slidev)
- `dist/vuejs_advanced_exercices.pdf` - Le cahier d'exercices pratiques (Puppeteer)

Le dossier `dist/` est ignoré par Git (voir `.gitignore`).

### Cas particulier : Vue.js Avancé

Contrairement aux autres formations, il n'existe **pas** de `vuejs_advanced_pw.md`.
Les ateliers vivent dans `chapters/vuejs_advanced/tp/<atelier>/README.md`, qui sont
lus directement dans l'IDE pendant la formation. Le script les assemble à la volée
(`buildVueAdvancedExercisesMarkdown()`) : sommaire `tp/README.md`, puis chaque
atelier dans l'ordre alphabétique des dossiers. Il n'y a donc **qu'une seule source
de vérité** à maintenir, et un nouvel atelier est pris en compte automatiquement dès
que son dossier `NN_nom/README.md` existe.

Chaque README commence par un titre de niveau 1, et le CSS d'impression pose un saut
de page avant chaque `h1` : un atelier commence toujours en haut d'une page.

### Fonctionnement

1. **Vérification des dépendances** : Le script vérifie que toutes les dépendances nécessaires sont installées
2. **Création du dossier dist** : Créé automatiquement s'il n'existe pas
3. **Génération en parallèle** (toutes les formations en même temps) :
   - **Slides A11y** : Utilise Slidev Export pour convertir `a11y.md` en PDF
   - **Exercices A11y** : Utilise Puppeteer pour convertir `a11y_pw.md` en PDF via HTML intermédiaire
   - **Slides Elasticsearch** : Utilise Slidev Export pour convertir `elasticsearch_ops.md` en PDF
   - **Exercices Elasticsearch** : Utilise Puppeteer pour convertir `elasticsearch_ops_pw.md` en PDF via HTML intermédiaire
   - **Cheatsheet Elasticsearch** : Utilise Puppeteer pour convertir `Elasticsearch_ops_cheatsheet.md` en PDF via HTML intermédiaire
4. **Nettoyage** : Les fichiers temporaires sont supprimés automatiquement

### Personnalisation

Pour modifier le style du PDF des exercices, éditez la fonction `createHtmlDocument()` dans le script.

Les styles CSS sont optimisés pour :
- Format A4
- Impression (page breaks, margins)
- Lisibilité (typographie, couleurs)
- Accessibilité (contraste, hiérarchie)

### Dépannage

**Erreur "Dépendances manquantes"** :
```bash
cd training
pnpm install
```

**Erreur Slidev** :
Vérifiez que les fichiers `a11y.md` et `elasticsearch_ops.md` sont valides et que tous les chapitres inclus existent.

**Erreur Puppeteer** :
Sur certains systèmes, Puppeteer peut nécessiter des dépendances système supplémentaires. Consultez la [documentation Puppeteer](https://pptr.dev/troubleshooting).

**Erreur "Could not find Chrome"** :
Puppeteer ne télécharge pas toujours son navigateur à l'installation :
```bash
pnpm dlx puppeteer browsers install chrome
```

**Erreur "Executable doesn't exist at .../ms-playwright/..." (export Slidev)** :
Slidev exporte via Playwright, qui a besoin de son propre Chromium. Deux options :

1. Installer le Chrome de Puppeteer (commande ci-dessus). Le script le détecte et le
   passe à Slidev via `--executable-path` — c'est le chemin recommandé, un seul
   navigateur à télécharger pour les deux moteurs.
2. Installer le Chromium de Playwright : `pnpm exec playwright install chromium`.

**Erreur "Playwright does not support chromium on <distro>"** :
Les navigateurs pré-compilés de Playwright ne couvrent pas toutes les distributions.
Sur Ubuntu 26.04, `playwright-chromium` 1.56 échoue là où 1.62 fonctionne. Utilisez
l'option 1 ci-dessus (aucun changement de dépendance), ou remontez
`playwright-chromium` dans `package.json` — Slidev le déclare en peer dependency
optionnelle `^1.10.0`, donc c'est bien la version du projet qui décide.

### Exemple de sortie

```
🚀 Génération des PDFs pour les formations

🔍 Vérification des dépendances...

✅ puppeteer trouvé
✅ marked trouvé

📁 Création du répertoire dist/
📦 Génération des PDFs...

📊 [A11Y] Génération du PDF des slides avec Slidev...
✅ [A11Y] Slides PDF généré: /path/to/dist/a11y_slides.pdf
   Taille: 3.45 MB

📝 [A11Y] Génération du PDF du cahier d'exercices avec Puppeteer...
✅ [A11Y] Cahier d'exercices PDF généré: /path/to/dist/a11y_exercices.pdf
   Taille: 0.52 MB

📊 [ES] Génération du PDF des slides avec Slidev...
✅ [ES] Slides PDF généré: /path/to/dist/elasticsearch_ops_slides.pdf
   Taille: 4.12 MB

📝 [ES] Génération du PDF du cahier d'exercices avec Puppeteer...
✅ [ES] Cahier d'exercices PDF généré: /path/to/dist/elasticsearch_ops_exercices.pdf
   Taille: 1.23 MB

📋 [ES] Génération du PDF du cheatsheet avec Puppeteer...
✅ [ES] Cheatsheet PDF généré: /path/to/dist/elasticsearch_ops_cheatsheet.pdf
   Taille: 0.78 MB

🎉 Génération terminée avec succès !
⏱️  Temps total: 18.67s

📂 Fichiers générés:

📘 Formation Accessibilité:
   - /path/to/dist/a11y_slides.pdf
   - /path/to/dist/a11y_exercices.pdf

📙 Formation Elasticsearch Ops:
   - /path/to/dist/elasticsearch_ops_slides.pdf
   - /path/to/dist/elasticsearch_ops_exercices.pdf
   - /path/to/dist/elasticsearch_ops_cheatsheet.pdf
```

## Architecture du script

Le script `generateA11y.js` est conçu pour être extensible et génère actuellement :
- Formation Accessibilité (2 PDFs)
- Formation Elasticsearch Ops (3 PDFs)
- Formation React (2 PDFs)
- Formation Vue.js Avancé (2 PDFs)

Pour ajouter d'autres formations, créez de nouvelles fonctions `generate<Formation>SlidesPdf()` et `generate<Formation>ExercisesPdf()` et ajoutez-les au `Promise.all()` dans la fonction `main()`.

Structure actuelle :
```
scripts/
├── README.md
└── generateA11y.js (gère toutes les formations)
```
