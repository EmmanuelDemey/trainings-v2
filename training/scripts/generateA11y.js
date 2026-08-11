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
 *
 * Formations Vue.js Avancé:
 * - Génère le PDF des slides (vuejs_advanced.md) avec Slidev
 * - Génère le PDF du cahier d'exercices avec Puppeteer, assemblé à partir des
 *   README des ateliers (chapters/vuejs_advanced/tp/) plutôt que d'un fichier
 *   `_pw.md` dédié : les README sont lus dans l'IDE pendant la formation, les
 *   dupliquer ferait diverger les deux versions.
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

// Vue.js Avancé
const VUE_ADV_SLIDES_INPUT = path.join(TRAINING_DIR, 'vuejs_advanced.md');
const VUE_ADV_TP_DIR = path.join(TRAINING_DIR, 'chapters', 'vuejs_advanced', 'tp');
const VUE_ADV_SLIDES_OUTPUT = path.join(DIST_DIR, 'vuejs_advanced_slides.pdf');
const VUE_ADV_PW_OUTPUT = path.join(DIST_DIR, 'vuejs_advanced_exercices.pdf');

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
 * Option `--executable-path` à passer à `slidev export`.
 *
 * Slidev exporte via Playwright, dont les navigateurs pré-compilés ne couvrent pas
 * toutes les distributions : sur Ubuntu 26.04, `npx playwright install` répond
 * « Playwright does not support chromium on ubuntu26.04-x64 » tant que la version
 * de playwright-chromium n'est pas assez récente (>= 1.62).
 *
 * Puppeteer, déjà requis par ce script pour les cahiers d'exercices, télécharge son
 * propre Chrome (`npx puppeteer browsers install chrome`). On le réutilise quand il
 * est là : un seul navigateur à télécharger, et plus de problème de plateforme.
 * S'il est absent, on retombe sur le comportement par défaut de Slidev.
 */
function chromeExecutableFlag() {
  try {
    const executablePath = require('puppeteer').executablePath();
    if (executablePath && fs.existsSync(executablePath)) {
      return ` --executable-path "${executablePath}"`;
    }
  } catch (error) {
    // Puppeteer introuvable : on laisse Slidev utiliser son Chromium Playwright
  }
  return '';
}

/**
 * Générer le PDF des slides A11y avec Slidev
 */
async function generateA11ySlidesPdf() {
  console.log('📊 [A11Y] Génération du PDF des slides avec Slidev...');

  try {
    const { stdout, stderr } = await execAsync(
      `cd "${TRAINING_DIR}" && npx slidev export a11y.md --output ../dist/a11y_slides.pdf --timeout 180000${chromeExecutableFlag()}`,
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
      `cd "${TRAINING_DIR}" && npx slidev export elasticsearch_ops.md --output ../dist/elasticsearch_ops_slides.pdf --timeout 180000${chromeExecutableFlag()}`,
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
      `cd "${TRAINING_DIR}" && npx slidev export react.md --output ../dist/react_slides.pdf --timeout 180000${chromeExecutableFlag()}`,
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
 * Générer le PDF des slides Vue.js Avancé avec Slidev
 */
async function generateVueAdvancedSlidesPdf() {
  console.log('📊 [VUE-ADV] Génération du PDF des slides avec Slidev...');

  try {
    const { stdout, stderr } = await execAsync(
      `cd "${TRAINING_DIR}" && npx slidev export vuejs_advanced.md --output ../dist/vuejs_advanced_slides.pdf --timeout 180000${chromeExecutableFlag()}`,
      {
        maxBuffer: 1024 * 1024 * 10,
        timeout: 600000 // 10 minutes pour le process Node
      }
    );

    if (stderr && !stderr.includes('Fetching') && !stderr.includes('warning')) {
      console.warn('⚠️  Avertissements:', stderr);
    }

    if (fs.existsSync(VUE_ADV_SLIDES_OUTPUT)) {
      const stats = fs.statSync(VUE_ADV_SLIDES_OUTPUT);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ [VUE-ADV] Slides PDF généré: ${VUE_ADV_SLIDES_OUTPUT}`);
      console.log(`   Taille: ${fileSizeInMB} MB\n`);
    } else {
      throw new Error('Le fichier PDF des slides Vue.js Avancé n\'a pas été créé');
    }
  } catch (error) {
    console.error('❌ [VUE-ADV] Erreur lors de la génération des slides:', error.message);
    throw error;
  }
}

/**
 * Assembler le cahier d'exercices Vue.js Avancé à partir des README des ateliers.
 *
 * Le sommaire (tp/README.md) puis chaque atelier dans l'ordre. Chaque README
 * commence par un `# TP n — ...`, et le CSS d'impression met un saut de page
 * avant chaque `h1` : un atelier par page, sans séparateur à ajouter ici.
 */
function buildVueAdvancedExercisesMarkdown() {
  const intro = fs.readFileSync(path.join(VUE_ADV_TP_DIR, 'README.md'), 'utf-8');

  const workshopDirs = fs
    .readdirSync(VUE_ADV_TP_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+_/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (workshopDirs.length === 0) {
    throw new Error(`Aucun atelier trouvé dans ${VUE_ADV_TP_DIR}`);
  }

  const workshops = workshopDirs.map((name) => {
    const readme = path.join(VUE_ADV_TP_DIR, name, 'README.md');
    if (!fs.existsSync(readme)) {
      throw new Error(`README.md manquant pour l'atelier ${name}`);
    }
    return fs.readFileSync(readme, 'utf-8');
  });

  console.log(`   ${workshopDirs.length} ateliers assemblés: ${workshopDirs.join(', ')}`);

  return [intro, ...workshops].join('\n\n');
}

/**
 * Générer le PDF du cahier d'exercices Vue.js Avancé avec Puppeteer
 */
async function generateVueAdvancedExercisesPdf() {
  console.log('📝 [VUE-ADV] Génération du PDF du cahier d\'exercices avec Puppeteer...');

  const puppeteer = require('puppeteer');
  const { marked } = require('marked');

  try {
    const markdownContent = buildVueAdvancedExercisesMarkdown();
    const htmlContent = marked.parse(markdownContent);
    const fullHtml = createHtmlDocument(htmlContent, 'Formation Vue.js Avancé - Cahier d\'Exercices Pratiques');

    const tempHtml = path.join(DIST_DIR, 'vuejs_advanced_pw_temp.html');
    fs.writeFileSync(tempHtml, fullHtml, 'utf-8');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempHtml}`, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: VUE_ADV_PW_OUTPUT,
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #666; margin-top: 10px;">
          Formation Vue.js Avancé - Cahier d'Exercices Pratiques
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

    if (fs.existsSync(VUE_ADV_PW_OUTPUT)) {
      const stats = fs.statSync(VUE_ADV_PW_OUTPUT);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ [VUE-ADV] Cahier d'exercices PDF généré: ${VUE_ADV_PW_OUTPUT}`);
      console.log(`   Taille: ${fileSizeInMB} MB\n`);
    } else {
      throw new Error('Le fichier PDF du cahier d\'exercices Vue.js Avancé n\'a pas été créé');
    }
  } catch (error) {
    console.error('❌ [VUE-ADV] Erreur lors de la génération du cahier d\'exercices:', error.message);
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
 * Catalogue des documents générables.
 *
 * `formation` sert au filtre `--only=`, `type` au filtre `--slides` / `--exercices`.
 * Les `slides` passent par Slidev (séquentiel : conflit de port), les `exercices`
 * par Puppeteer (parallélisables).
 */
const DOCUMENTS = [
  { formation: 'a11y', type: 'slides', output: A11Y_SLIDES_OUTPUT, run: generateA11ySlidesPdf },
  { formation: 'a11y', type: 'exercices', output: A11Y_PW_OUTPUT, run: generateA11yExercisesPdf },
  { formation: 'elasticsearch', type: 'slides', output: ES_SLIDES_OUTPUT, run: generateElasticsearchSlidesPdf },
  { formation: 'elasticsearch', type: 'exercices', output: ES_PW_OUTPUT, run: generateElasticsearchExercisesPdf },
  { formation: 'elasticsearch', type: 'exercices', output: ES_CHEATSHEET_OUTPUT, run: generateElasticsearchCheatsheetPdf },
  { formation: 'react', type: 'slides', output: REACT_SLIDES_OUTPUT, run: generateReactSlidesPdf },
  { formation: 'react', type: 'exercices', output: REACT_PW_OUTPUT, run: generateReactExercisesPdf },
  { formation: 'vuejs-advanced', type: 'slides', output: VUE_ADV_SLIDES_OUTPUT, run: generateVueAdvancedSlidesPdf },
  { formation: 'vuejs-advanced', type: 'exercices', output: VUE_ADV_PW_OUTPUT, run: generateVueAdvancedExercisesPdf }
];

/**
 * Sélectionner les documents à générer à partir des arguments CLI.
 *
 *   --only=<formation>[,<formation>]  restreint aux formations données
 *   --slides                          seulement les slides
 *   --exercices                       seulement les cahiers d'exercices
 *
 * Sans argument, tout est généré.
 */
function selectDocuments(argv) {
  const formations = argv
    .filter((arg) => arg.startsWith('--only='))
    .flatMap((arg) => arg.slice('--only='.length).split(','))
    .map((name) => name.trim())
    .filter(Boolean);

  const known = [...new Set(DOCUMENTS.map((doc) => doc.formation))];
  const unknown = formations.filter((name) => !known.includes(name));
  if (unknown.length > 0) {
    throw new Error(
      `Formation inconnue: ${unknown.join(', ')}. Valeurs possibles: ${known.join(', ')}`
    );
  }

  const wantsSlides = argv.includes('--slides');
  const wantsExercises = argv.includes('--exercices');
  // Aucun drapeau, ou les deux : on ne filtre pas sur le type
  const types = wantsSlides === wantsExercises
    ? ['slides', 'exercices']
    : (wantsSlides ? ['slides'] : ['exercices']);

  const selected = DOCUMENTS.filter((doc) =>
    (formations.length === 0 || formations.includes(doc.formation)) && types.includes(doc.type)
  );

  if (selected.length === 0) {
    throw new Error('Aucun document ne correspond aux filtres demandés');
  }

  return selected;
}

/**
 * Fonction principale
 */
async function main() {
  try {
    const startTime = Date.now();

    const selected = selectDocuments(process.argv.slice(2));

    // Vérifier les dépendances
    await checkDependencies();

    // Créer le répertoire dist
    ensureDistDirectory();

    // Générer les PDFs
    console.log(`📦 Génération de ${selected.length} document(s)...\n`);

    // Générer les slides Slidev en séquentiel (conflit de port si parallèle)
    const slides = selected.filter((doc) => doc.type === 'slides');
    if (slides.length > 0) {
      console.log('🎬 Génération des slides Slidev (séquentiel)...\n');
      for (const doc of slides) {
        await doc.run();
      }
    }

    // Générer les PDFs Puppeteer en parallèle (pas de conflit)
    const exercises = selected.filter((doc) => doc.type === 'exercices');
    if (exercises.length > 0) {
      console.log('📄 Génération des documents Puppeteer (parallèle)...\n');
      await Promise.all(exercises.map((doc) => doc.run()));
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('🎉 Génération terminée avec succès !');
    console.log(`⏱️  Temps total: ${duration}s\n`);

    console.log('📂 Fichiers générés:');
    for (const doc of selected) {
      console.log(`   - ${doc.output}`);
    }
    console.log('');

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
