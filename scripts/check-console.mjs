// Replays the Kibana Dev Tools requests of a training's guided workshops, and of
// the examples of its slides, against a real Elasticsearch — run by the `Workshops` job of .github/workflows/training.yml
// for a training whose workshops.ci.mjs sets `elasticsearch`, and runnable as is:
//
//   ES_URL=http://localhost:9200 ES_PASSWORD=… node scripts/check-console.mjs <training dir>
//
// Each code block of a workshop README or of a chapter whose first line is a request
// (`GET /_cat/nodes`, `PUT /products` + its JSON body…) is a step: its requests are
// sent in order, each must succeed, and when a « Résultat attendu » JSON block
// follows it, the last response must hold everything that block shows. Shell and
// yaml blocks, and expected results that are not JSON, are left alone.
//
// A comment before a block, invisible on the site, changes how it is checked:
//
//   <!-- ci: skip -->            not sent (several nodes, a restart, elasticsearch.yml…)
//   <!-- ci: expect-error -->    one of its requests at least must fail
//   <!-- ci: no-compare -->      its « Résultat attendu » is only an illustration
//   <!-- ci: retry -->           re-sent until it passes, for what settles in the
//                                background (ILM, rollover, shard allocation…)
//   <!-- ci: skip-start -->  …  <!-- ci: skip-end -->   every block in between is skipped
//
// An Elastic Stack image they show (`docker.elastic.co/…:9.2.0`) must be the
// version ci/Dockerfile pins, so the version is bumped in one place.
//
// A chapter whose examples need data (an index, documents…) has a fixture: the
// requests of ci/fixtures/<chapter without its number>.md, replayed before it.
//
// The workshops, then the chapters, run one after the other on the same cluster,
// wiped in between: each one must work on its own, from a fresh cluster.

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { request as httpRequest } from 'node:http';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// A method, a path, and maybe a comment: `GET /_nodes/_master   # Current master`.
const REQUEST = /^(GET|POST|PUT|DELETE|HEAD)\s+(\S+)\s*(?:(?:#|\/\/).*)?$/;
const COMMENT = /^\s*(#|\/\/)/;
const OUTPUT_LANGUAGES = new Set(['text', 'txt', 'plaintext']);

/** Turns Kibana's `"""…"""` strings into JSON strings. */
function tripleQuotes(text) {
  return text.replace(/"""([\s\S]*?)"""/g, (_, raw) => JSON.stringify(raw));
}

/** The JSON values of a body, one after the other (a _bulk body holds several). */
function jsonValues(text) {
  const values = [];
  let rest = text.trim();
  while (rest) {
    let depth = 0;
    let inString = false;
    let end = -1;
    for (let i = 0; i < rest.length && end < 0; i++) {
      const char = rest[i];
      if (inString) {
        if (char === '\\') i++;
        else if (char === '"') inString = false;
      } else if (char === '"') inString = true;
      else if (char === '{' || char === '[') depth++;
      else if (char === '}' || char === ']') {
        depth--;
        if (depth === 0) end = i + 1;
      }
    }
    if (end < 0) throw new Error(`unbalanced JSON: ${rest.slice(0, 80)}`);
    values.push(JSON.parse(rest.slice(0, end)));
    rest = rest.slice(end).trim();
  }
  return values;
}

function requestsOf(code) {
  const requests = [];
  let current;
  const close = () => {
    if (!current) return;
    const text = tripleQuotes(current.lines.join('\n'));
    const values = text.trim() ? jsonValues(text) : [];
    const ndjson = /\/_(bulk|msearch)\b/.test(current.path);
    requests.push({
      method: current.method,
      path: current.path,
      body: values.length === 0 ? undefined : ndjson ? values.map((v) => JSON.stringify(v)).join('\n') + '\n' : JSON.stringify(values[0]),
    });
  };
  let inTriple = false;
  for (const line of code.split('\n')) {
    const match = !inTriple && line.match(REQUEST);
    if (match) {
      close();
      current = { method: match[1], path: match[2].startsWith('/') ? match[2] : `/${match[2]}`, lines: [] };
    } else if (current && (inTriple || !COMMENT.test(line))) {
      current.lines.push(line);
    }
    if ((line.match(/"""/g) ?? []).length % 2 === 1) inTriple = !inTriple;
  }
  close();
  return requests;
}

const isRequestBlock = (code) => {
  const first = code.split('\n').find((line) => line.trim() && !COMMENT.test(line));
  return Boolean(first && REQUEST.test(first));
};

/** The steps of a workshop README: its blocks of Dev Tools requests. */
export function consoleSteps(markdown) {
  const lines = markdown.split('\n');
  const steps = [];
  let pending = new Set();
  let skipping = false;
  let sinceStep = null; // the text between the last step and the next block

  for (let i = 0; i < lines.length; i++) {
    const directive = lines[i].match(/<!--\s*ci:\s*([\w-]+)\s*-->/);
    if (directive) {
      if (directive[1] === 'skip-start') skipping = true;
      else if (directive[1] === 'skip-end') skipping = false;
      else pending.add(directive[1]);
      continue;
    }
    const open = lines[i].match(/^```(\w*)\s*$/);
    if (!open) {
      if (sinceStep !== null) sinceStep += `${lines[i]}\n`;
      continue;
    }
    const start = i;
    const body = [];
    for (i++; i < lines.length && !/^```\s*$/.test(lines[i]); i++) body.push(lines[i]);
    const code = body.join('\n');

    // A `text` block shows an output, or a syntax: it is read, not sent. (A `json`
    // block may hold requests, highlighted as JSON.)
    if (!OUTPUT_LANGUAGES.has(open[1]) && isRequestBlock(code)) {
      const directives = new Set(pending);
      if (skipping) directives.add('skip');
      const step = { line: start + 1, requests: [], directives, expected: undefined };
      try {
        step.requests = requestsOf(code);
      } catch (error) {
        step.invalid = error.message;
      }
      steps.push(step);
      sinceStep = '';
    } else if (sinceStep !== null && /Résultat attendu/.test(sinceStep)) {
      try {
        steps.at(-1).expected = JSON.parse(code);
      } catch {
        // An expected result that is not JSON (_cat output, an excerpt…) is not compared.
      }
      sinceStep = null;
    }
    pending = new Set();
  }
  return steps;
}

// What changes from one run to the next, or from one cluster to the other.
const VOLATILE = new Set(['took', '_seq_no', '_primary_term', '_score', 'max_score']);

/** Everything of `expected` that `actual` does not hold, as `path: why`. */
export function mismatches(expected, actual, path = '') {
  const at = (key) => (path ? `${path}.${key}` : String(key));
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return [`${path}: expected an array, got ${JSON.stringify(actual)}`];
    return expected.flatMap((item, index) =>
      actual.some((candidate) => mismatches(item, candidate).length === 0)
        ? []
        : [`${at(index)}: no match for ${JSON.stringify(item)}`],
    );
  }
  if (expected !== null && typeof expected === 'object') {
    if (actual === null || typeof actual !== 'object') return [`${path}: expected an object, got ${JSON.stringify(actual)}`];
    return Object.entries(expected).flatMap(([key, value]) => {
      if (VOLATILE.has(key)) return [];
      if (!(key in actual)) return [`${at(key)}: missing`];
      return mismatches(value, actual[key], at(key));
    });
  }
  return expected === actual ? [] : [`${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`];
}

const reasonOf = (body) => body?.error?.reason ?? body?.error?.type ?? (typeof body === 'string' ? body.slice(0, 200) : JSON.stringify(body)?.slice(0, 200));

async function runStep(step, es) {
  if (step.invalid) return `line ${step.line}: invalid body — ${step.invalid}`;
  let failed = false;
  let last;
  for (const request of step.requests) {
    try {
      last = await es.request(request);
    } catch (error) {
      return `line ${step.line}: ${request.method} ${request.path} → ${error.message}`;
    }
    // `DELETE /products` before creating it: run on a fresh cluster, it has nothing to delete.
    if (request.method === 'DELETE' && last.status === 404) continue;
    if (last.status >= 400) {
      if (step.directives.has('expect-error')) {
        failed = true;
        continue;
      }
      return `line ${step.line}: ${request.method} ${request.path} → ${last.status} ${reasonOf(last.body)}`;
    }
  }
  if (step.directives.has('expect-error')) {
    return failed ? null : `line ${step.line}: expected an error, every request succeeded`;
  }
  if (step.expected !== undefined && !step.directives.has('no-compare')) {
    const differences = mismatches(step.expected, last.body);
    const request = step.requests.at(-1);
    if (differences.length) return `line ${step.line}: ${request.method} ${request.path}: ${differences.join('; ')}`;
  }
  return null;
}

/**
 * Runs the steps against `es` — anything with `request({ method, path, body })`
 * resolving to `{ status, body }` — and resolves with their failures.
 * `beforeStep(step)` is awaited before each step that runs.
 */
export async function runSteps(steps, es, { retries = 30, delay = 2000, beforeStep = async () => {} } = {}) {
  const failures = [];
  for (const step of steps) {
    if (step.directives.has('skip')) continue;
    await beforeStep(step);
    let failure = await runStep(step, es);
    for (let attempt = 1; failure && step.directives.has('retry') && attempt < retries; attempt++) {
      await new Promise((done) => setTimeout(done, delay));
      failure = await runStep(step, es);
    }
    if (failure) failures.push(failure);
  }
  return failures;
}

/** A client for the cluster at `url`, as the `elastic` user when `password` is given. */
export function client(url, password, { timeout = 120_000 } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (password) headers.Authorization = `Basic ${Buffer.from(`elastic:${password}`).toString('base64')}`;
  return {
    // node:http rather than fetch: Dev Tools sends a body with a GET (_search…).
    request({ method, path, body }) {
      return new Promise((done, fail) => {
        const ndjson = /\/_(bulk|msearch)\b/.test(path);
        const req = httpRequest(new URL(path, url), {
          method,
          headers: {
            ...headers,
            ...(ndjson && { 'Content-Type': 'application/x-ndjson' }),
            // Without it, Node sends a GET body unframed.
            ...(body !== undefined && { 'Content-Length': Buffer.byteLength(body) }),
          },
        });
        req.on('error', fail);
        // A request that hangs (a wait_for_status=green on one node…) fails its step, not the run.
        req.setTimeout(timeout, () => req.destroy(new Error(`no response within ${timeout / 1000}s`)));
        req.on('response', (response) => {
          let text = '';
          response.setEncoding('utf8');
          response.on('data', (chunk) => (text += chunk));
          response.on('end', () => {
            let parsed = text;
            try {
              parsed = JSON.parse(text);
            } catch {
              // _cat APIs and the like answer with text.
            }
            done({ status: response.statusCode, body: parsed });
          });
        });
        req.end(body);
      });
    },
  };
}

/** Removes what a workshop left behind: its data, templates, policies, snapshots and settings. */
async function wipe(es) {
  const quiet = (method, path, body) => es.request({ method, path, body: body && JSON.stringify(body) });
  await quiet('DELETE', '/_data_stream/*?expand_wildcards=all');
  // By name: action.destructive_requires_name forbids a wildcard.
  const { body: indices } = await quiet('GET', '/_cat/indices?format=json&h=index&expand_wildcards=open,closed');
  for (const { index } of Array.isArray(indices) ? indices : []) {
    if (!index.startsWith('.')) await quiet('DELETE', `/${index}`);
  }
  const { body: templates } = await quiet('GET', '/_index_template');
  for (const { name, index_template } of templates.index_templates ?? []) {
    if (!index_template._meta?.managed) await quiet('DELETE', `/_index_template/${name}`);
  }
  const { body: components } = await quiet('GET', '/_component_template');
  for (const { name, component_template } of components.component_templates ?? []) {
    if (!component_template._meta?.managed) await quiet('DELETE', `/_component_template/${name}`);
  }
  const { body: policies } = await quiet('GET', '/_ilm/policy');
  for (const [name, { policy }] of Object.entries(policies)) {
    if (!policy?._meta?.managed) await quiet('DELETE', `/_ilm/policy/${name}`);
  }
  const { body: pipelines } = await quiet('GET', '/_ingest/pipeline');
  for (const [name, pipeline] of Object.entries(pipelines)) {
    if (!pipeline._meta?.managed) await quiet('DELETE', `/_ingest/pipeline/${name}`);
  }
  // Snapshots before their repository: a repository registered again at the same
  // location would find them there.
  const { body: repositories } = await quiet('GET', '/_snapshot');
  for (const repository of Object.keys(repositories)) {
    await quiet('DELETE', `/_snapshot/${repository}/*`);
    await quiet('DELETE', `/_snapshot/${repository}`);
  }
  await quiet('PUT', '/_cluster/settings', { persistent: { '*': null }, transient: { '*': null } });
}

/**
 * The fixture of a chapter: the requests that set up what its examples need (an
 * index, documents…), kept out of the deck in `<ci folder>/fixtures/` and named
 * after the chapter without its number, so a renumbering does not orphan it.
 */
export function fixtureOf(file) {
  const match = file.match(/^slides\/\d+[-_](.+\.md)$/);
  return match ? match[1] : null;
}

/**
 * The Elastic Stack images of `markdown` (`docker.elastic.co/…:9.2.0`) whose
 * version is not `version`, the one the CI tests: the slides and the workshops
 * must show the learners the very version their requests were checked against.
 */
export function staleImages(markdown, version) {
  return markdown.split('\n').flatMap((text, index) =>
    [...text.matchAll(/docker\.elastic\.co\/[\w.-]+\/[\w.-]+:(\d+\.\d+\.\d+)/g)]
      .filter((match) => match[1] !== version)
      .map((match) => ({ line: index + 1, image: match[0] })),
  );
}

/** Resolves once the cluster answers, for up to `seconds`: a container takes a while to start. */
async function ready(es, seconds = 180) {
  for (let elapsed = 0; elapsed < seconds; elapsed += 3) {
    try {
      const { status } = await es.request({ method: 'GET', path: '/_cluster/health?wait_for_status=yellow&timeout=3s' });
      if (status === 200) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((done) => setTimeout(done, 3000));
  }
  throw new Error(`Elasticsearch did not answer within ${seconds}s`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = resolve(process.argv[2]);
  const es = client(process.env.ES_URL ?? 'http://localhost:9200', process.env.ES_PASSWORD);
  await ready(es);
  const { body: info } = await es.request({ method: 'GET', path: '/' });
  console.log(`Elasticsearch ${info.version?.number}`);
  // Every workshop README, then every chapter of the deck: each one on its own,
  // the cluster wiped in between. An optional filter keeps the files whose path
  // holds it: `node scripts/check-console.mjs elasticsearch 07_ilm`.
  const numbered = async (folder, keep) =>
    (await readdir(join(dir, folder), { withFileTypes: true }))
      .filter((entry) => /^\d/.test(entry.name) && keep(entry))
      .map((entry) => entry.name)
      .sort();
  const files = [
    ...(await numbered('workshops', (entry) => entry.isDirectory())).map((name) => join('workshops', name, 'README.md')),
    ...(await numbered('slides', (entry) => entry.isFile() && entry.name.endsWith('.md'))).map((name) => join('slides', name)),
  ].filter((file) => !process.argv[3] || file.includes(process.argv[3]));

  const ciDir = join(dir, process.env.ES_CI_DIR ?? 'ci');
  const fixtures = join(ciDir, 'fixtures');
  // The version the material must show: the pin, even when the cluster is another
  // one (.github/workflows/elasticsearch-latest.yml replays it on the latest).
  const dockerfile = join(ciDir, 'Dockerfile');
  const pinned = existsSync(dockerfile) && (await readFile(dockerfile, 'utf8')).match(/^FROM \S+:(\d+\.\d+\.\d+)/m)?.[1];
  const github = Boolean(process.env.GITHUB_ACTIONS);
  let failed = 0;
  for (const name of files) {
    const file = join(dir, name);
    const markdown = await readFile(file, 'utf8');
    const stale = pinned ? staleImages(markdown, pinned) : [];
    for (const { line, image } of stale) {
      console.log(`✗ ${name}: line ${line}: ${image} — ci/Dockerfile pins ${pinned}`);
      if (github) console.log(`::error file=${file.slice(process.cwd().length + 1)},line=${line}::${image} is not the pinned ${pinned}`);
    }
    if (stale.length) failed++;
    const steps = consoleSteps(markdown);
    if (steps.length === 0) continue;
    await wipe(es);
    const fixture = fixtureOf(name) && join(fixtures, fixtureOf(name));
    if (fixture && existsSync(fixture)) {
      const setup = await runSteps(consoleSteps(await readFile(fixture, 'utf8')), es);
      if (setup.length) {
        console.log(`✗ ${name}: its fixture fails\n${setup.map((failure) => `    ${failure}`).join('\n')}`);
        failed++;
        continue;
      }
      await es.request({ method: 'POST', path: '/_refresh' });
    }
    // A learner takes more than the refresh interval between two steps; the CI
    // does not, so what a step indexed is made searchable before the next one.
    const refresh = () => es.request({ method: 'POST', path: '/_refresh' });
    const failures = await runSteps(steps, es, { beforeStep: refresh });
    const run = steps.filter((step) => !step.directives.has('skip')).length;
    console.log(`${failures.length ? '✗' : '✓'} ${name}: ${run - failures.length}/${run} steps (${steps.length - run} skipped)`);
    for (const failure of failures) {
      console.log(`    ${failure}`);
      if (github) {
        const line = failure.match(/^line (\d+)/)?.[1];
        console.log(`::error file=${file.slice(process.cwd().length + 1)},line=${line}::${failure}`);
      }
    }
    if (failures.length) failed++;
  }
  process.exit(failed ? 1 : 0);
}
