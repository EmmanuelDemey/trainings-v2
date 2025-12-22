#!/usr/bin/env node

/**
 * Script de génération des PDFs pour les formations
 *
 * Formations Accessibilité:
 * - Génère le PDF des slides (a11y.md) avec Slidev
 * - Génère le PDF du cahier d'exercices (a11y_pw.md) avec Puppeteer
 *
 * Formations Elasticsearch Ops:
 * - Génère le PDF des slides (elasticsearch_ops.md) avec Slidev
 * - Génère le PDF du cahier d'exercices (elasticsearch_ops_pw.md) avec Puppeteer
 * - Génère le PDF du cheatsheet (Elasticsearch_ops_cheatsheet.md) avec Puppeteer
 *
 * Formations React:
 * - Génère le PDF des slides (react.md) avec Slidev
 * - Génère le PDF du cahier d'exercices (react_pw.md) avec Puppeteer
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const ROOT_DIR = path.join(__dirname, '../..');
const TRAINING_DIR = path.join(ROOT_DIR, 'training');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Accessibilité
const A11Y_SLIDES_INPUT = path.join(TRAINING_DIR, 'a11y.md');
const A11Y_PW_INPUT = path.join(TRAINING_DIR, 'a11y_pw.md');
const A11Y_SLIDES_OUTPUT = path.join(DIST_DIR, 'a11y_slides.pdf');
const A11Y_PW_OUTPUT = path.join(DIST_DIR, 'a11y_exercices.pdf');

// Elasticsearch Ops
const ES_SLIDES_INPUT = path.join(TRAINING_DIR, 'elasticsearch_ops.md');
const ES_PW_INPUT = path.join(TRAINING_DIR, 'elasticsearch_ops_pw.md');
const ES_CHEATSHEET_INPUT = path.join(ROOT_DIR, 'Elasticsearch_ops_cheatsheet.md');
const ES_SLIDES_OUTPUT = path.join(DIST_DIR, 'elasticsearch_ops_slides.pdf');
const ES_PW_OUTPUT = path.join(DIST_DIR, 'elasticsearch_ops_exercices.pdf');
const ES_CHEATSHEET_OUTPUT = path.join(DIST_DIR, 'elasticsearch_ops_cheatsheet.pdf');

// React
const REACT_SLIDES_INPUT = path.join(TRAINING_DIR, 'react.md');
const REACT_PW_INPUT = path.join(TRAINING_DIR, 'react_pw.md');
const REACT_SLIDES_OUTPUT = path.join(DIST_DIR, 'react_slides.pdf');
const REACT_PW_OUTPUT = path.join(DIST_DIR, 'react_exercices.pdf');

console.log('🚀 Génération des PDFs pour les formations\n');

/**
 * Créer le répertoire dist s'il n'existe pas
 */
function ensureDistDirectory() {
  if (!fs.existsSync(DIST_DIR)) {
    console.log('📁 Création du répertoire dist/');
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }
}

/**
 * Générer le PDF des slides A11y avec Slidev
 */
async function generateA11ySlidesPdf() {
  console.log('📊 [A11Y] Génération du PDF des slides avec Slidev...');

  try {
    const { stdout, stderr } = await execAsync(
      `cd "${TRAINING_DIR}" && npx slidev export a11y.md --output ../dist/a11y_slides.pdf --timeout 180000`,
      {
        maxBuffer: 1024 * 1024 * 10,
        timeout: 600000 // 10 minutes pour le process Node
      }
    );

    if (stderr && !stderr.includes('Fetching') && !stderr.includes('warning')) {
      console.warn('⚠️  Avertissements:', stderr);
    }

    if (fs.existsSync(A11Y_SLIDES_OUTPUT)) {
      const stats = fs.statSync(A11Y_SLIDES_OUTPUT);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ [A11Y] Slides PDF généré: ${A11Y_SLIDES_OUTPUT}`);
      console.log(`   Taille: ${fileSizeInMB} MB\n`);
    } else {
      throw new Error('Le fichier PDF des slides A11y n\'a pas été créé');
    }
  } catch (error) {
    console.error('❌ [A11Y] Erreur lors de la génération des slides:', error.message);
    throw error;
  }
}

/**
 * Générer le PDF des slides Elasticsearch avec Slidev
 */
async function generateElasticsearchSlidesPdf() {
  console.log('📊 [ES] Génération du PDF des slides avec Slidev...');

  try {
    const { stdout, stderr } = await execAsync(
      `cd "${TRAINING_DIR}" && npx slidev export elasticsearch_ops.md --output ../dist/elasticsearch_ops_slides.pdf --timeout 180000`,
      {
        maxBuffer: 1024 * 1024 * 10,
        timeout: 600000 // 10 minutes pour le process Node
      }
    );

    if (stderr && !stderr.includes('Fetching') && !stderr.includes('warning')) {
      console.warn('⚠️  Avertissements:', stderr);
    }

    if (fs.existsSync(ES_SLIDES_OUTPUT)) {
      const stats = fs.statSync(ES_SLIDES_OUTPUT);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ [ES] Slides PDF généré: ${ES_SLIDES_OUTPUT}`);
      console.log(`   Taille: ${fileSizeInMB} MB\n`);
    } else {
      throw new Error('Le fichier PDF des slides Elasticsearch n\'a pas été créé');
    }
  } catch (error) {
    console.error('❌ [ES] Erreur lors de la génération des slides:', error.message);
    throw error;
  }
}

/**
 * Générer le PDF des slides React avec Slidev
 */
async function generateReactSlidesPdf() {
  console.log('📊 [REACT] Génération du PDF des slides avec Slidev...');

  try {
    const { stdout, stderr } = await execAsync(
      `cd "${TRAINING_DIR}" && npx slidev export react.md --output ../dist/react_slides.pdf --timeout 180000`,
      {
        maxBuffer: 1024 * 1024 * 10,
        timeout: 600000 // 10 minutes pour le process Node
      }
    );

    if (stderr && !stderr.includes('Fetching') && !stderr.includes('warning')) {
      console.warn('⚠️  Avertissements:', stderr);
    }

    if (fs.existsSync(REACT_SLIDES_OUTPUT)) {
      const stats = fs.statSync(REACT_SLIDES_OUTPUT);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ [REACT] Slides PDF généré: ${REACT_SLIDES_OUTPUT}`);
      console.log(`   Taille: ${fileSizeInMB} MB\n`);
    } else {
      throw new Error('Le fichier PDF des slides React n\'a pas été créé');
    }
  } catch (error) {
    console.error('❌ [REACT] Erreur lors de la génération des slides:', error.message);
    throw error;
  }
}

/**
 * Générer le PDF du cahier d'exercices A11y avec Puppeteer
 */
async function generateA11yExercisesPdf() {
  console.log('📝 [A11Y] Génération du PDF du cahier d\'exercices avec Puppeteer...');

  const puppeteer = require('puppeteer');
  const { marked } = require('marked');

  try {
    const markdownContent = fs.readFileSync(A11Y_PW_INPUT, 'utf-8');
    const htmlContent = marked.parse(markdownContent);
    const fullHtml = createHtmlDocument(htmlContent, 'Formation Accessibilité - Cahier d\'Exercices Pratiques');

    const tempHtml = path.join(DIST_DIR, 'a11y_pw_temp.html');
    fs.writeFileSync(tempHtml, fullHtml, 'utf-8');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempHtml}`, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: A11Y_PW_OUTPUT,
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #666; margin-top: 10px;">
          Formation Accessibilité - Cahier d'Exercices Pratiques
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #666; margin-bottom: 10px;">
          Page <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    });

    await browser.close();
    fs.unlinkSync(tempHtml);

    if (fs.existsSync(A11Y_PW_OUTPUT)) {
      const stats = fs.statSync(A11Y_PW_OUTPUT);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ [A11Y] Cahier d'exercices PDF généré: ${A11Y_PW_OUTPUT}`);
      console.log(`   Taille: ${fileSizeInMB} MB\n`);
    } else {
      throw new Error('Le fichier PDF du cahier d\'exercices A11y n\'a pas été créé');
    }
  } catch (error) {
    console.error('❌ [A11Y] Erreur lors de la génération du cahier d\'exercices:', error.message);
    throw error;
  }
}

/**
 * Générer le PDF du cahier d'exercices Elasticsearch avec Puppeteer
 */
async function generateElasticsearchExercisesPdf() {
  console.log('📝 [ES] Génération du PDF du cahier d\'exercices avec Puppeteer...');

  const puppeteer = require('puppeteer');
  const { marked } = require('marked');

  try {
    const markdownContent = fs.readFileSync(ES_PW_INPUT, 'utf-8');
    const htmlContent = marked.parse(markdownContent);
    const fullHtml = createHtmlDocument(htmlContent, 'Formation Elasticsearch Ops - Cahier d\'Exercices Pratiques');

    const tempHtml = path.join(DIST_DIR, 'elasticsearch_ops_pw_temp.html');
    fs.writeFileSync(tempHtml, fullHtml, 'utf-8');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempHtml}`, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: ES_PW_OUTPUT,
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #666; margin-top: 10px;">
          Formation Elasticsearch Ops - Cahier d'Exercices Pratiques
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #666; margin-bottom: 10px;">
          Page <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    });

    await browser.close();
    fs.unlinkSync(tempHtml);

    if (fs.existsSync(ES_PW_OUTPUT)) {
      const stats = fs.statSync(ES_PW_OUTPUT);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ [ES] Cahier d'exercices PDF généré: ${ES_PW_OUTPUT}`);
      console.log(`   Taille: ${fileSizeInMB} MB\n`);
    } else {
      throw new Error('Le fichier PDF du cahier d\'exercices Elasticsearch n\'a pas été créé');
    }
  } catch (error) {
    console.error('❌ [ES] Erreur lors de la génération du cahier d\'exercices:', error.message);
    throw error;
  }
}

/**
 * Générer le PDF du cheatsheet Elasticsearch avec Puppeteer
 */
async function generateElasticsearchCheatsheetPdf() {
  console.log('📋 [ES] Génération du PDF du cheatsheet avec Puppeteer...');

  const puppeteer = require('puppeteer');
  const { marked } = require('marked');

  try {
    const markdownContent = fs.readFileSync(ES_CHEATSHEET_INPUT, 'utf-8');
    const htmlContent = marked.parse(markdownContent);
    const fullHtml = createHtmlDocument(htmlContent, 'Elasticsearch Ops - Cheatsheet');

    const tempHtml = path.join(DIST_DIR, 'elasticsearch_ops_cheatsheet_temp.html');
    fs.writeFileSync(tempHtml, fullHtml, 'utf-8');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempHtml}`, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: ES_CHEATSHEET_OUTPUT,
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #666; margin-top: 10px;">
          Elasticsearch Ops - Cheatsheet
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #666; margin-bottom: 10px;">
          Page <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    });

    await browser.close();
    fs.unlinkSync(tempHtml);

    if (fs.existsSync(ES_CHEATSHEET_OUTPUT)) {
      const stats = fs.statSync(ES_CHEATSHEET_OUTPUT);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ [ES] Cheatsheet PDF généré: ${ES_CHEATSHEET_OUTPUT}`);
      console.log(`   Taille: ${fileSizeInMB} MB\n`);
    } else {
      throw new Error('Le fichier PDF du cheatsheet Elasticsearch n\'a pas été créé');
    }
  } catch (error) {
    console.error('❌ [ES] Erreur lors de la génération du cheatsheet:', error.message);
    throw error;
  }
}

/**
 * Générer le PDF du cahier d'exercices React avec Puppeteer
 */
async function generateReactExercisesPdf() {
  console.log('📝 [REACT] Génération du PDF du cahier d\'exercices avec Puppeteer...');

  const puppeteer = require('puppeteer');
  const { marked } = require('marked');

  try {
    const markdownContent = fs.readFileSync(REACT_PW_INPUT, 'utf-8');
    const htmlContent = marked.parse(markdownContent);
    const fullHtml = createHtmlDocument(htmlContent, 'Formation React - Cahier d\'Exercices Pratiques');

    const tempHtml = path.join(DIST_DIR, 'react_pw_temp.html');
    fs.writeFileSync(tempHtml, fullHtml, 'utf-8');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempHtml}`, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: REACT_PW_OUTPUT,
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #666; margin-top: 10px;">
          Formation React - Cahier d'Exercices Pratiques
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #666; margin-bottom: 10px;">
          Page <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    });

    await browser.close();
    fs.unlinkSync(tempHtml);

    if (fs.existsSync(REACT_PW_OUTPUT)) {
      const stats = fs.statSync(REACT_PW_OUTPUT);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ [REACT] Cahier d'exercices PDF généré: ${REACT_PW_OUTPUT}`);
      console.log(`   Taille: ${fileSizeInMB} MB\n`);
    } else {
      throw new Error('Le fichier PDF du cahier d\'exercices React n\'a pas été créé');
    }
  } catch (error) {
    console.error('❌ [REACT] Erreur lors de la génération du cahier d\'exercices:', error.message);
    throw error;
  }
}

/**
 * Créer le document HTML complet avec styles
 */
function createHtmlDocument(content, title = 'Document de Formation') {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
      border-left: 4px solid #3498db;
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
      font-size: 10pt;
    }

    blockquote {
      border-left: 4px solid #3498db;
      padding-left: 20px;
      margin-left: 0;
      color: #666;
      font-style: italic;
      background-color: #f0f8ff;
      padding: 10px 20px;
      border-radius: 4px;
      page-break-inside: avoid;
    }

    .note {
      background-color: #e8f4f8;
      border-left: 4px solid #3498db;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      page-break-inside: avoid;
    }

    .note::before {
      content: "📘 Note";
      font-weight: bold;
      display: block;
      margin-bottom: 10px;
      color: #3498db;
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

    strong {
      color: #2c3e50;
      font-weight: 600;
    }

    em {
      font-style: italic;
      color: #555;
    }

    hr {
      border: none;
      border-top: 2px solid #ddd;
      margin: 30px 0;
    }

    @media print {
      h1, h2, h3 {
        page-break-after: avoid;
      }
      pre, blockquote, table, .note {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

/**
 * Vérifier les dépendances
 */
async function checkDependencies() {
  console.log('🔍 Vérification des dépendances...\n');

  const dependencies = [
    { name: 'puppeteer', package: 'puppeteer' },
    { name: 'marked', package: 'marked' },
  ];

  const missing = [];

  for (const dep of dependencies) {
    try {
      require.resolve(dep.package);
      console.log(`✅ ${dep.name} trouvé`);
    } catch (e) {
      console.log(`❌ ${dep.name} manquant`);
      missing.push(dep.package);
    }
  }

  if (missing.length > 0) {
    console.log('\n⚠️  Dépendances manquantes détectées:');
    console.log(`   npm install --save-dev ${missing.join(' ')}\n`);
    throw new Error('Veuillez installer les dépendances manquantes');
  }

  console.log('');
}

/**
 * Fonction principale
 */
async function main() {
  try {
    const startTime = Date.now();

    // Vérifier les dépendances
    await checkDependencies();

    // Créer le répertoire dist
    ensureDistDirectory();

    // Générer les PDFs
    console.log('📦 Génération des PDFs...\n');

    // Générer les slides Slidev en séquentiel (conflit de port si parallèle)
    console.log('🎬 Génération des slides Slidev (séquentiel)...\n');
    await generateA11ySlidesPdf();
    await generateElasticsearchSlidesPdf();
    await generateReactSlidesPdf();

    // Générer les PDFs Puppeteer en parallèle (pas de conflit)
    console.log('📄 Génération des documents Puppeteer (parallèle)...\n');
    await Promise.all([
      generateA11yExercisesPdf(),
      generateElasticsearchExercisesPdf(),
      generateElasticsearchCheatsheetPdf(),
      generateReactExercisesPdf()
    ]);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('🎉 Génération terminée avec succès !');
    console.log(`⏱️  Temps total: ${duration}s\n`);

    console.log('📂 Fichiers générés:');
    console.log('\n📘 Formation Accessibilité:');
    console.log(`   - ${A11Y_SLIDES_OUTPUT}`);
    console.log(`   - ${A11Y_PW_OUTPUT}`);
    console.log('\n📙 Formation Elasticsearch Ops:');
    console.log(`   - ${ES_SLIDES_OUTPUT}`);
    console.log(`   - ${ES_PW_OUTPUT}`);
    console.log(`   - ${ES_CHEATSHEET_OUTPUT}`);
    console.log('\n⚛️  Formation React:');
    console.log(`   - ${REACT_SLIDES_OUTPUT}`);
    console.log(`   - ${REACT_PW_OUTPUT}\n`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la génération:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Exécuter le script
main();
