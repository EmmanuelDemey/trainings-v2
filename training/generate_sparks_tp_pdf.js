#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-chromium');

const SCRIPT_DIR = __dirname;

const FILES = [
  {
    input: path.join(SCRIPT_DIR, 'elasticsearch_sparks_tp_day1.md'),
    output: path.join(SCRIPT_DIR, 'elasticsearch_sparks_tp_day1.pdf'),
    title: 'Elasticsearch Sparks Training - Practical Exercises Day 1',
  },
  {
    input: path.join(SCRIPT_DIR, 'elasticsearch_sparks_tp_day2.md'),
    output: path.join(SCRIPT_DIR, 'elasticsearch_sparks_tp_day2.pdf'),
    title: 'Elasticsearch Sparks Training - Practical Exercises Day 2',
  },
];

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToHtml(markdown) {
  let html = markdown;

  // Code blocks (before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Details/summary
  html = html.replace(/<details>/g, '<details>');
  html = html.replace(/<\/details>/g, '</details>');
  html = html.replace(/<summary>(.*?)<\/summary>/g, '<summary>$1</summary>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');

  // Ordered lists
  html = html.replace(/((?:^\d+\. .*$\n?)+)/gim, (match) => {
    const items = match.trim().split('\n').map(line =>
      `<li>${line.replace(/^\d+\. /, '')}</li>`
    ).join('\n');
    return `<ol>${items}</ol>\n`;
  });

  // Unordered lists
  html = html.replace(/((?:^[-*] .*$\n?)+)/gim, (match) => {
    const items = match.trim().split('\n').map(line =>
      `<li>${line.replace(/^[-*] /, '')}</li>`
    ).join('\n');
    return `<ul>${items}</ul>\n`;
  });

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Tables
  html = html.replace(/((?:^\|.*\|$\n?)+)/gim, (match) => {
    const rows = match.trim().split('\n').filter(r => !r.match(/^\|[-| :]+\|$/));
    if (rows.length === 0) return match;
    const header = rows[0].split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const body = rows.slice(1).map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('\n');
    return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>\n`;
  });

  // Paragraphs
  html = html.split('\n\n').map(para => {
    const trimmed = para.trim();
    if (!trimmed) return '';
    if (trimmed.match(/^<(h[1-4]|ul|ol|pre|blockquote|table|details|hr)/)) return para;
    return `<p>${trimmed}</p>`;
  }).join('\n\n');

  return html;
}

function createHtmlDocument(markdownContent, title) {
  const htmlContent = markdownToHtml(markdownContent);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 20mm 25mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.6;
      color: #333;
      max-width: 170mm;
      margin: 0 auto;
    }
    h1 {
      color: #1a5276;
      border-bottom: 3px solid #2e86c1;
      padding-bottom: 8px;
      margin-top: 30px;
      page-break-before: always;
      font-size: 20pt;
    }
    h1:first-of-type { page-break-before: auto; }
    h2 {
      color: #1f618d;
      border-bottom: 1px solid #aed6f1;
      padding-bottom: 6px;
      margin-top: 20px;
      font-size: 15pt;
    }
    h3 { color: #2874a6; margin-top: 15px; font-size: 12pt; }
    h4 { color: #555; margin-top: 12px; font-size: 11pt; }
    code {
      background-color: #f0f0f0;
      padding: 1px 5px;
      border-radius: 3px;
      font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
      font-size: 0.88em;
      color: #c0392b;
    }
    pre {
      background-color: #1e1e1e;
      border-radius: 5px;
      padding: 12px 15px;
      overflow-x: auto;
      page-break-inside: avoid;
      margin: 12px 0;
    }
    pre code {
      background-color: transparent;
      padding: 0;
      color: #d4d4d4;
      font-size: 0.85em;
    }
    details {
      background: #eaf4fb;
      border: 1px solid #aed6f1;
      border-radius: 5px;
      padding: 10px 15px;
      margin: 10px 0;
      page-break-inside: avoid;
    }
    summary {
      font-weight: bold;
      cursor: pointer;
      color: #1a5276;
    }
    blockquote {
      border-left: 4px solid #2e86c1;
      padding-left: 15px;
      margin-left: 0;
      color: #555;
      font-style: italic;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
      page-break-inside: avoid;
      font-size: 9.5pt;
    }
    th, td { border: 1px solid #ccc; padding: 7px 10px; text-align: left; }
    th { background-color: #2e86c1; color: white; }
    tr:nth-child(even) { background-color: #f5f9fd; }
    ul, ol { margin: 10px 0; padding-left: 25px; }
    li { margin: 5px 0; }
    hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
    p { margin: 10px 0; }
    a { color: #2e86c1; }
    @media print {
      h2, h3, h4 { page-break-after: avoid; }
      pre, table, details { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
}

async function generatePdf({ input, output, title }) {
  console.log(`\nGenerating: ${path.basename(output)}`);

  const tempHtml = input.replace('.md', '_temp.html');
  const markdown = fs.readFileSync(input, 'utf-8');
  const html = createHtmlDocument(markdown, title);
  fs.writeFileSync(tempHtml, html, 'utf-8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${tempHtml}`, { waitUntil: 'networkidle' });

  await page.pdf({
    path: output,
    format: 'A4',
    margin: { top: '20mm', right: '25mm', bottom: '20mm', left: '25mm' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px;text-align:center;width:100%;color:#999;margin-top:8px;">${title}</div>`,
    footerTemplate: `<div style="font-size:8px;text-align:center;width:100%;color:#999;margin-bottom:8px;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
  });

  await browser.close();
  fs.unlinkSync(tempHtml);

  const size = (fs.statSync(output).size / (1024 * 1024)).toFixed(2);
  console.log(`  Done: ${output} (${size} MB)`);
}

async function main() {
  console.log('Generating Elasticsearch Sparks TP PDFs...');
  for (const file of FILES) {
    await generatePdf(file);
  }
  console.log('\nAll PDFs generated successfully.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
