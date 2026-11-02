// Checks the workshops done in the OpenSearch Dashboards UI, which
// scripts/check-console.mjs cannot replay: the sample data they start from must
// still load, and still hold the fields — with the types — their README lists. Run
// by the `Workshops` job of .github/workflows/training.yml for a training whose
// workshops.ci.mjs sets `dashboards`, and runnable as is:
//
//   ES_URL=http://localhost:9200 DASHBOARDS_URL=http://localhost:5601 \
//     node scripts/check-dashboards.mjs <training dir>
//
// A comment before a Markdown table of a workshop README, invisible on the site,
// names the sample data set the table describes:
//
//   <!-- ci: sample-data logs -->
//   | Champ | Type | Contenu |
//   |---|---|---|
//   | `response` / `response.keyword` | `text` / `keyword` | Code HTTP |
//
// The data set (`logs`, `ecommerce`, `flights`) is loaded through the Dashboards
// API, then each field of the first column must be in the mapping of its index
// with the type of the second column — `a` / `b` pairs a name with a type.

import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { client } from './check-console.mjs';

const MARKER = /<!--\s*ci:\s*sample-data\s+(\w+)\s*-->/;
const codes = (cell) => [...cell.matchAll(/`([^`]+)`/g)].map((match) => match[1]);

/** The sample-data tables of a README: the data set, and the fields with their types. */
export function sampleDataTables(markdown) {
  const lines = markdown.split('\n');
  const tables = [];
  lines.forEach((text, index) => {
    const marker = text.match(MARKER);
    if (!marker) return;
    const fields = [];
    // The header and its separator, then a row per field until the table ends.
    for (let i = index + 3; i < lines.length && lines[i].trim().startsWith('|'); i++) {
      const [names, types] = lines[i].split('|').slice(1, 3).map(codes);
      names.forEach((name, n) => fields.push({ name, type: types[n] ?? types[0] }));
    }
    tables.push({ dataset: marker[1], line: index + 1, fields });
  });
  return tables;
}

/** The type of the field at a dotted `path` of a mapping — objects and multi-fields alike — or undefined. */
function typeAt(mapping, path) {
  let node = mapping;
  for (const part of path.split('.')) {
    node = node?.properties?.[part] ?? node?.fields?.[part];
    if (!node) return undefined;
  }
  return node.type ?? (node.properties ? 'object' : undefined);
}

/** Every field of `fields` the mapping lacks, or holds with another type, as `name: why`. */
export function fieldMismatches(fields, mapping) {
  return fields.flatMap(({ name, type }) => {
    const actual = typeAt(mapping, name);
    if (actual === undefined) return [`${name}: missing`];
    return actual === type ? [] : [`${name}: expected ${type}, got ${actual}`];
  });
}

/** Resolves once Dashboards is up, for up to `seconds`: it waits for OpenSearch first. */
async function ready(dashboards, seconds = 300) {
  for (let elapsed = 0; elapsed < seconds; elapsed += 5) {
    try {
      const { status, body } = await dashboards.request({ method: 'GET', path: '/api/status' });
      if (status === 200 && body?.status?.overall?.state === 'green') return;
    } catch {
      // Not listening yet.
    }
    await new Promise((done) => setTimeout(done, 5000));
  }
  throw new Error(`OpenSearch Dashboards did not answer within ${seconds}s`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = resolve(process.argv[2]);
  const es = client(process.env.ES_URL ?? 'http://localhost:9200');
  // The Dashboards API refuses a write without this header.
  const dashboards = client(process.env.DASHBOARDS_URL ?? 'http://localhost:5601', undefined, { headers: { 'osd-xsrf': 'true' } });
  await ready(dashboards);
  const github = Boolean(process.env.GITHUB_ACTIONS);

  const workshops = (await readdir(join(dir, 'workshops'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^\d/.test(entry.name))
    .map((entry) => join('workshops', entry.name, 'README.md'))
    .sort();
  let failed = 0;
  for (const name of workshops) {
    const file = join(dir, name);
    const tables = sampleDataTables(await readFile(file, 'utf8').catch(() => ''));
    for (const { dataset, line, fields } of tables) {
      const { status, body } = await dashboards.request({ method: 'POST', path: `/api/sample_data/${dataset}` });
      const failures =
        status >= 400
          ? [`the sample data set \`${dataset}\` does not load: ${status} ${JSON.stringify(body).slice(0, 200)}`]
          : await (async () => {
              const index = `opensearch_dashboards_sample_data_${dataset}`;
              const { body: mappings } = await es.request({ method: 'GET', path: `/${index}/_mapping` });
              return fieldMismatches(fields, mappings?.[index]?.mappings ?? {}).map((failure) => `${index}: ${failure}`);
            })();
      console.log(`${failures.length ? '✗' : '✓'} ${name}: sample data \`${dataset}\`, ${fields.length - failures.length}/${fields.length} fields`);
      for (const failure of failures) {
        console.log(`    line ${line}: ${failure}`);
        if (github) console.log(`::error file=${file.slice(process.cwd().length + 1)},line=${line}::${failure}`);
      }
      if (failures.length) failed++;
    }
  }
  process.exit(failed ? 1 : 0);
}
