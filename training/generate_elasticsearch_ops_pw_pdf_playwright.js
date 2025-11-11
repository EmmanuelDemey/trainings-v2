#!/usr/bin/env node

/**
 * Script de génération du PDF pour Elasticsearch Ops - Cahier d'exercices pratiques
 * Utilise Playwright Chromium pour générer le PDF
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-chromium');

const SCRIPT_DIR = __dirname;
const INPUT_FILE = path.join(SCRIPT_DIR, 'elasticsearch_ops_pw_complete.md');
const OUTPUT_FILE = path.join(SCRIPT_DIR, 'elasticsearch_ops_pw.pdf');
const TEMP_FILE = path.join(SCRIPT_DIR, 'elasticsearch_ops_pw_merged.md');
const TEMP_HTML = path.join(SCRIPT_DIR, 'elasticsearch_ops_pw_temp.html');

console.log('🚀 Génération du PDF Elasticsearch Ops avec Playwright...\n');

/**
 * Fonction pour créer le fichier maître avec les inclusions s'il n'existe pas
 */
function createMasterFileIfNeeded() {
  if (fs.existsSync(INPUT_FILE)) {
    console.log('✓ Fichier maître trouvé: elasticsearch_ops_pw_complete.md\n');
    return;
  }

  console.log('📝 Création du fichier maître elasticsearch_ops_pw_complete.md...');

  const masterContent = `# Cahier d'Exercices Pratiques - Elasticsearch Ops

Formation sur 2 jours - Exercices pratiques et ateliers

---

\\newpage

# Jour 1 - Exercices Pratiques

## Table des Matières - Jour 1

**Labs Fondamentaux**:
- [Lab 1.1: Création et Interrogation d'Index](#lab-11-création-et-interrogation-dindex)
- [Lab 1.2: Définition de Mappings Explicites](#lab-12-définition-de-mappings-explicites)
- [Lab 1.3: Agrégations de Données](#lab-13-agrégations-de-données)
- [Lab 2.1: Installation et Configuration](#lab-21-installation-et-démarrage-dun-nœud)
- [Lab 2.2: Formation de Cluster](#lab-22-formation-dun-cluster-multi-nœuds)
- [Lab 3.1: Dimensionnement et Configuration Système](#lab-31-dimensionnement-et-configuration-système)
- [Lab 4.1: Monitoring avec les APIs Natives](#lab-41-monitoring-avec-les-apis-natives)

**Questions Bonus** (avancées):
- [🌟 Bonus 1.A: Optimisation du Scoring de Recherche](#-bonus-1a-optimisation-du-scoring-de-recherche)
- [🌟 Bonus 1.B: Mappings Nested et Parent-Child](#-bonus-1b-mappings-nested-et-parent-child)

---

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_1.1.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_1.2.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_1.3.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/bonus_1.A.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/bonus_1.B.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_2.1.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_2.2.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_2.3.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/bonus_2.A.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_4.1.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_4.2.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/lab_4.3.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour1/bonus_4.A.md"-->

\\newpage

# Jour 2 - Systèmes d'Alertes

<!--#include "chapters/elasticsearch_ops_pw/jour2/lab_5.1.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour2/lab_5.2.md"-->

\\newpage

# Jour 2 - Opérations de Maintenance

<!--#include "chapters/elasticsearch_ops_pw/jour2/lab_6.1.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour2/bonus_6.A.md"-->

\\newpage

# Jour 2 - Implémentation de la Sécurité

<!--#include "chapters/elasticsearch_ops_pw/jour2/lab_7.1.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour2/lab_7.2.md"-->

\\newpage

<!--#include "chapters/elasticsearch_ops_pw/jour2/bonus_7.A.md"-->

`;

  fs.writeFileSync(INPUT_FILE, masterContent, 'utf-8');
  console.log('✅ Fichier maître créé avec succès\n');
}

/**
 * Fonction pour traiter les inclusions
 */
function processIncludes(inputFile, outputFile) {
  console.log('📝 Traitement des inclusions...');

  const content = fs.readFileSync(inputFile, 'utf-8');
  const lines = content.split('\n');
  const result = [];

  const includeRegex = /<!--#include\s+"([^"]+)"-->/;

  for (const line of lines) {
    const match = line.match(includeRegex);

    if (match) {
      const includePath = match[1];
      const fullPath = path.join(SCRIPT_DIR, includePath);

      if (fs.existsSync(fullPath)) {
        console.log(`   ✓ Inclusion de: ${includePath}`);
        const includeContent = fs.readFileSync(fullPath, 'utf-8');
        result.push(includeContent);
        result.push(''); // Ligne vide
      } else {
        console.log(`   ⚠️  Fichier non trouvé: ${fullPath}`);
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }

  fs.writeFileSync(outputFile, result.join('\n'), 'utf-8');
  console.log('✅ Inclusions traitées avec succès\n');
}

/**
 * Fonction pour convertir le Markdown en HTML
 */
function markdownToHtml(markdown) {
  // Conversion simple du markdown en HTML
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (
      para.startsWith('<h') ||
      para.startsWith('<ul') ||
      para.startsWith('<pre') ||
      para.startsWith('<blockquote') ||
      para.trim() === ''
    ) {
      return para;
    }
    return `<p>${para}</p>`;
  }).join('\n\n');

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Fonction pour créer le HTML complet avec styles
 */
function createHtmlDocument(markdownContent) {
  const htmlContent = markdownToHtml(markdownContent);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cahier d'Exercices Pratiques - Elasticsearch Ops</title>
  <style>
    @page {
      size: A4;
      margin: 25mm;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }

    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
      margin-top: 30px;
      page-break-before: always;
      font-size: 24pt;
    }

    h1:first-of-type {
      page-break-before: auto;
    }

    h2 {
      color: #34495e;
      border-bottom: 2px solid #95a5a6;
      padding-bottom: 8px;
      margin-top: 25px;
      font-size: 18pt;
    }

    h3 {
      color: #555;
      margin-top: 20px;
      font-size: 14pt;
    }

    h4 {
      color: #666;
      margin-top: 15px;
      font-size: 12pt;
    }

    code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 0.9em;
      color: #c7254e;
    }

    pre {
      background-color: #f8f8f8;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      overflow-x: auto;
      page-break-inside: avoid;
      margin: 15px 0;
    }

    pre code {
      background-color: transparent;
      padding: 0;
      color: #333;
    }

    blockquote {
      border-left: 4px solid #3498db;
      padding-left: 20px;
      margin-left: 0;
      color: #666;
      font-style: italic;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }

    th {
      background-color: #3498db;
      color: white;
      font-weight: bold;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    ul, ol {
      margin: 15px 0;
      padding-left: 30px;
    }

    li {
      margin: 8px 0;
    }

    a {
      color: #3498db;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    p {
      margin: 12px 0;
    }

    @media print {
      h1, h2, h3 {
        page-break-after: avoid;
      }
      pre, blockquote, table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
}

/**
 * Fonction principale
 */
async function main() {
  try {
    // Étape 0: Créer le fichier maître s'il n'existe pas
    createMasterFileIfNeeded();

    // Étape 1: Traiter les inclusions
    processIncludes(INPUT_FILE, TEMP_FILE);

    // Étape 2: Lire le markdown et créer le HTML
    console.log('📝 Conversion du Markdown en HTML...');
    const markdownContent = fs.readFileSync(TEMP_FILE, 'utf-8');
    const htmlContent = createHtmlDocument(markdownContent);
    fs.writeFileSync(TEMP_HTML, htmlContent, 'utf-8');
    console.log('✅ HTML créé avec succès\n');

    // Étape 3: Générer le PDF avec Playwright
    console.log('📄 Génération du PDF avec Playwright Chromium...');

    const browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Charger le fichier HTML
    await page.goto(`file://${TEMP_HTML}`, {
      waitUntil: 'networkidle',
    });

    // Générer le PDF
    await page.pdf({
      path: OUTPUT_FILE,
      format: 'A4',
      margin: {
        top: '25mm',
        right: '25mm',
        bottom: '25mm',
        left: '25mm',
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #666; margin-top: 10px;">
          Formation Elasticsearch Ops - Cahier d'Exercices Pratiques
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #666; margin-bottom: 10px;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
    });

    await browser.close();

    console.log(`✅ PDF généré avec succès: ${OUTPUT_FILE}\n`);

    // Étape 4: Nettoyer les fichiers temporaires
    if (fs.existsSync(TEMP_FILE)) {
      fs.unlinkSync(TEMP_FILE);
    }
    if (fs.existsSync(TEMP_HTML)) {
      fs.unlinkSync(TEMP_HTML);
    }
    console.log('🧹 Fichiers temporaires nettoyés');

    // Afficher les informations sur le fichier
    const stats = fs.statSync(OUTPUT_FILE);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log('\n📊 Informations sur le fichier:');
    console.log(`   Taille: ${fileSizeInMB} MB`);
    console.log(`   Chemin: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('❌ Erreur lors de la génération du PDF:', error);
    process.exit(1);
  }
}

// Exécuter le script
main();
