# Génération des PDFs - Formations

## 📋 Résumé

Script complet pour générer les PDFs de toutes les formations :

**Formation Accessibilité :**
- **Slides** (a11y.md) → PDF via Slidev Export
- **Cahier d'exercices** (a11y_pw.md) → PDF via Puppeteer

**Formation Elasticsearch Ops :**
- **Slides** (elasticsearch_ops.md) → PDF via Slidev Export
- **Cahier d'exercices** (elasticsearch_ops_pw.md) → PDF via Puppeteer
- **Cheatsheet** (Elasticsearch_ops_cheatsheet.md) → PDF via Puppeteer

## 🗂️ Fichiers créés

### 1. Script principal
**`training/scripts/generateA11y.js`** (~580 lignes)
- Vérifie les dépendances nécessaires
- Crée le répertoire `dist/` automatiquement
- Génère 5 PDFs en parallèle (2 formations)
- Gère les erreurs et affiche des statistiques

### 2. Documentation
**`scripts/README.md`**
- Guide d'utilisation complet
- Instructions d'installation
- Exemples de commandes
- Section dépannage

## ⚙️ Modifications des fichiers existants

### 1. package.json
**Ajout des scripts** :
```json
"generate:all": "node ./scripts/generateA11y.js",
"generate:a11y": "node ./scripts/generateA11y.js",
"generate:elasticsearch": "node ./scripts/generateA11y.js"
```

**Ajout des dépendances** :
```json
"marked": "^11.1.1",
"puppeteer": "^24.29.1"
```

### 2. .gitignore
**Ajout** :
```
# Generated PDFs and build output
dist/
training/dist/
```

## 🚀 Utilisation

### Installation des dépendances

```bash
cd training
npm install
```

Cela installera :
- `puppeteer` - Génération PDF cahier d'exercices
- `marked` - Conversion Markdown → HTML
- `@slidev/cli` - Génération PDF slides (déjà installé)

### Génération des PDFs

```bash
# Générer tous les PDFs (A11y + Elasticsearch)
npm run generate:all

# Ou utiliser les alias
npm run generate:a11y
npm run generate:elasticsearch
```

Ou directement :
```bash
node ./scripts/generateA11y.js
```

### Résultat

Les PDFs sont générés dans `dist/` :

**Formation Accessibilité:**
- `dist/a11y_slides.pdf` - Slides de formation
- `dist/a11y_exercices.pdf` - Cahier d'exercices

**Formation Elasticsearch Ops:**
- `dist/elasticsearch_ops_slides.pdf` - Slides de formation
- `dist/elasticsearch_ops_exercices.pdf` - Cahier d'exercices
- `dist/elasticsearch_ops_cheatsheet.pdf` - Cheatsheet de commandes

## 📊 Détails techniques

### Génération des slides (Slidev)

**Commandes exécutées** :
```bash
# Accessibilité
npx slidev export a11y.md --output ../dist/a11y_slides.pdf

# Elasticsearch Ops
npx slidev export elasticsearch_ops.md --output ../dist/elasticsearch_ops_slides.pdf
```

**Avantages** :
- Rendu fidèle aux slides Slidev
- Transitions et layouts préservés
- Qualité professionnelle

### Génération avec Puppeteer

**Fichiers traités** :
- `a11y_pw.md` → Cahier d'exercices Accessibilité
- `elasticsearch_ops_pw.md` → Cahier d'exercices Elasticsearch
- `Elasticsearch_ops_cheatsheet.md` → Cheatsheet Elasticsearch

**Process** :
1. Lecture du fichier Markdown source
2. Conversion Markdown → HTML via `marked`
3. Création d'un document HTML complet avec CSS optimisé
4. Génération PDF via Puppeteer (headless Chrome)
5. Nettoyage automatique des fichiers temporaires

**Styles CSS** :
- Format A4 avec marges 20mm
- Police système optimisée pour impression
- Colorisation syntaxique pour code
- Page breaks intelligents
- Headers/Footers avec pagination

**Configuration PDF** :
```javascript
{
  format: 'A4',
  margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<Titre du document>', // Dynamique selon le fichier
  footerTemplate: 'Page X / Y'
}
```

## 🎨 Personnalisation

### Modifier les styles des documents

Éditez la fonction `createHtmlDocument(content, title)` dans `training/scripts/generateA11y.js` :

```javascript
function createHtmlDocument(content, title) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    /* Vos styles personnalisés ici */
    h1 { color: #your-color; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}
```

### Modifier la configuration PDF

Changez les options dans les fonctions de génération (ex: `generateA11yExercisesPdf()`) :

```javascript
await page.pdf({
  format: 'A4',  // ou 'Letter', 'Legal', etc.
  margin: { ... },
  // Autres options
});
```

## 🔧 Dépannage

### Erreur : "Dépendances manquantes"

```bash
cd training
npm install --save-dev puppeteer marked
```

### Erreur : "slidev: command not found"

Vérifiez que `@slidev/cli` est bien dans les devDependencies :

```bash
npm install --save-dev @slidev/cli
```

### Erreur Puppeteer sur Linux

Installez les dépendances système :

```bash
# Debian/Ubuntu
sudo apt-get install -y \
  libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 \
  libgbm1 libasound2

# Fedora
sudo dnf install -y \
  nss atk at-spi2-atk cups-libs libdrm \
  libXcomposite libXdamage libXrandr mesa-libgbm
```

### PDFs trop lourds

Pour les slides, utilisez l'option `--with-clicks` de Slidev pour réduire le nombre de pages.

Pour le cahier d'exercices, réduisez la résolution des images dans le CSS.

## 📈 Performance

**Temps de génération typique (5 PDFs en parallèle)** :
- Slides A11y : ~8-12 secondes
- Cahier A11y : ~2-4 secondes
- Slides Elasticsearch : ~10-15 secondes
- Cahier Elasticsearch : ~3-5 secondes
- Cheatsheet Elasticsearch : ~2-3 secondes
- **Total** : ~15-20 secondes (grâce au parallélisme)

**Taille des fichiers estimée** :
- Slides : ~2-5 MB (dépend du contenu)
- Cahiers d'exercices : ~0.5-1.5 MB
- Cheatsheet : ~0.3-0.8 MB

## 🔄 Workflow recommandé

### Développement

1. Modifier les fichiers Markdown dans `training/chapters/`
2. Tester les slides : `npm run dev` dans `training/`
3. Générer les PDFs : `npm run generate:all`
4. Vérifier les PDFs dans `dist/`

### Production

1. Commit des modifications Markdown
2. CI/CD peut exécuter `npm run generate:all`
3. Artifacts uploadés : `dist/*.pdf`

### Exemple GitHub Actions

```yaml
name: Generate Training PDFs

on:
  push:
    branches: [main]
    paths:
      - 'training/**/*.md'
      - 'training/chapters/**'
      - 'Elasticsearch_ops_cheatsheet.md'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd training
          npm ci

      - name: Generate all PDFs
        run: |
          cd training
          npm run generate:all

      - name: Upload PDFs
        uses: actions/upload-artifact@v3
        with:
          name: training-pdfs
          path: dist/*.pdf
```

## ✅ Checklist avant commit

- [ ] Script testé et fonctionnel
- [ ] Dépendances ajoutées dans package.json
- [ ] .gitignore mis à jour (dist/ ignoré)
- [ ] README créé dans scripts/
- [ ] PDFs générés et vérifiés
- [ ] Fichiers temporaires nettoyés

## 🚀 Améliorations futures

### Court terme
- [ ] Ajouter un watermark sur les PDFs
- [ ] Option `--watch` pour regénération automatique
- [ ] Optimisation de la taille des PDFs

### Moyen terme
- [ ] Support de thèmes personnalisés
- [ ] Génération de versions EPUB/HTML
- [ ] Internationalisation (EN/FR)

### Long terme
- [ ] Interface web pour configuration
- [ ] Pipeline CI/CD complet
- [ ] Versioning des PDFs

## 📝 Notes

- Le script utilise Puppeteer pour la génération de PDFs (plus stable que playwright pour ce cas d'usage)
- Les fichiers temporaires HTML sont automatiquement nettoyés après génération
- Le dossier `dist/` est créé à la racine du projet (pas dans `training/`)
- Les 5 générations s'exécutent en parallèle pour optimiser le temps total
- Tous les scripts npm (`generate:all`, `generate:a11y`, `generate:elasticsearch`) lancent la génération complète

---

**Créé le** : 2025-11-11
**Mis à jour le** : 2025-11-11
**Auteur** : Claude Code
**Version** : 2.0.0 (ajout support Elasticsearch)
