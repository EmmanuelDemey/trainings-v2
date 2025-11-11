# Scripts de Génération

Ce dossier contient les scripts pour générer les PDFs des formations.

## generateA11y.js

Script de génération des PDFs pour toutes les formations (Accessibilité et Elasticsearch Ops).

### Prérequis

Les dépendances nécessaires sont déjà définies dans `training/package.json` :
- `puppeteer` - Pour générer le PDF du cahier d'exercices
- `marked` - Pour convertir le Markdown en HTML
- `@slidev/cli` - Pour générer le PDF des slides

### Installation

Depuis le dossier `training/` :

```bash
npm install
```

### Utilisation

Depuis le dossier `training/` :

```bash
# Générer tous les PDFs (A11y + Elasticsearch)
npm run generate:all

# Ou utiliser les alias (génère aussi tous les PDFs)
npm run generate:a11y
npm run generate:elasticsearch
```

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

Le dossier `dist/` est ignoré par Git (voir `.gitignore`).

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
npm install
```

**Erreur Slidev** :
Vérifiez que les fichiers `a11y.md` et `elasticsearch_ops.md` sont valides et que tous les chapitres inclus existent.

**Erreur Puppeteer** :
Sur certains systèmes, Puppeteer peut nécessiter des dépendances système supplémentaires. Consultez la [documentation Puppeteer](https://pptr.dev/troubleshooting).

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

Pour ajouter d'autres formations, créez de nouvelles fonctions `generate<Formation>SlidesPdf()` et `generate<Formation>ExercisesPdf()` et ajoutez-les au `Promise.all()` dans la fonction `main()`.

Structure actuelle :
```
scripts/
├── README.md
└── generateA11y.js (gère toutes les formations)
```
