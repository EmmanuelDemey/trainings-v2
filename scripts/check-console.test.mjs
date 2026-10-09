// node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { consoleSteps, fixtureOf, mismatches, runSteps, staleImages } from './check-console.mjs';

const fence = (lang, body) => `\`\`\`${lang}\n${body}\n\`\`\``;

test('a block of Dev Tools requests is a step, with each request and its JSON body', () => {
  const markdown = [
    '# TP',
    fence('bash', 'PUT /products\n{\n  "settings": { "number_of_shards": 1 }\n}\n\nGET /products/_search'),
  ].join('\n\n');

  assert.deepEqual(
    consoleSteps(markdown).map((step) => step.requests),
    [
      [
        { method: 'PUT', path: '/products', body: '{"settings":{"number_of_shards":1}}' },
        { method: 'GET', path: '/products/_search', body: undefined },
      ],
    ],
  );
});

test('a shell or yaml block is not a step', () => {
  const markdown = [
    fence('bash', 'sudo systemctl restart elasticsearch'),
    fence('yaml', 'node.roles: [ data_hot ]'),
    fence('bash', '# Comment\ncurl -s localhost:9200'),
  ].join('\n\n');

  assert.deepEqual(consoleSteps(markdown), []);
});

test('comment lines are ignored, and a path without a leading slash gets one', () => {
  const markdown = fence('bash', '# Le cluster\n// et ses nœuds\nGET _cat/nodes?v');

  assert.deepEqual(consoleSteps(markdown)[0].requests, [{ method: 'GET', path: '/_cat/nodes?v', body: undefined }]);
});

test('a _bulk body is sent as one JSON document per line', () => {
  const markdown = fence('bash', 'POST /_bulk\n{ "index": { "_index": "a" } }\n{\n  "name": "x"\n}');

  assert.equal(consoleSteps(markdown)[0].requests[0].body, '{"index":{"_index":"a"}}\n{"name":"x"}\n');
});

test('a triple-quoted string, as in an ES|QL query, becomes a JSON string', () => {
  const markdown = fence('bash', 'POST /_query\n{\n  "query": """\n    FROM logs\n    | LIMIT 1 // "quoted"\n  """\n}');

  assert.deepEqual(JSON.parse(consoleSteps(markdown)[0].requests[0].body), {
    query: '\n    FROM logs\n    | LIMIT 1 // "quoted"\n  ',
  });
});

test('the JSON block after « Résultat attendu » is the expected response of the step before it', () => {
  const markdown = [
    fence('bash', 'GET /products/_count'),
    '**Résultat attendu**:',
    fence('json', '{ "count": 5 }'),
  ].join('\n\n');

  assert.deepEqual(consoleSteps(markdown)[0].expected, { count: 5 });
});

test('an expected response that is not JSON is not compared', () => {
  const markdown = [fence('bash', 'GET /_cat/nodes?v'), '**Résultat attendu**:', fence('', 'name  node.role\nn1    h')].join(
    '\n\n',
  );

  assert.equal(consoleSteps(markdown)[0].expected, undefined);
});

test('a ci comment before a block sets how it is checked', () => {
  const markdown = [
    '<!-- ci: skip -->',
    fence('bash', 'GET /a'),
    '<!-- ci: expect-error -->\n',
    fence('bash', 'GET /b'),
    fence('bash', 'GET /c'),
  ].join('\n');

  assert.deepEqual(
    consoleSteps(markdown).map((step) => [step.requests[0].path, [...step.directives]]),
    [
      ['/a', ['skip']],
      ['/b', ['expect-error']],
      ['/c', []],
    ],
  );
});

test('every block between skip-start and skip-end is skipped', () => {
  const markdown = [
    '<!-- ci: skip-start -->',
    fence('bash', 'GET /a'),
    fence('bash', 'GET /b'),
    '<!-- ci: skip-end -->',
    fence('bash', 'GET /c'),
  ].join('\n\n');

  assert.deepEqual(
    consoleSteps(markdown).map((step) => step.directives.has('skip')),
    [true, true, false],
  );
});

test('each step knows its line in the README', () => {
  const markdown = ['# TP', '', fence('bash', 'GET /a')].join('\n');

  assert.equal(consoleSteps(markdown)[0].line, 3);
});

test('a response matches when it holds everything expected, in any order inside arrays', () => {
  const expected = { hits: { total: { value: 2 }, hits: [{ _id: '2' }, { _id: '1' }] } };
  const actual = { took: 3, hits: { total: { value: 2, relation: 'eq' }, hits: [{ _id: '1', _score: 1 }, { _id: '2' }] } };

  assert.deepEqual(mismatches(expected, actual), []);
});

test('a mismatch names the path of the value that differs', () => {
  assert.deepEqual(mismatches({ hits: { total: { value: 5 } } }, { hits: { total: { value: 4 } } }), [
    'hits.total.value: expected 5, got 4',
  ]);
  assert.deepEqual(mismatches({ acknowledged: true, index: 'x' }, { acknowledged: true }), ['index: missing']);
});

test('values that change from one run to the next are not compared', () => {
  assert.deepEqual(mismatches({ took: 5, _seq_no: 0, hits: { max_score: 1.2 } }, { took: 1, _seq_no: 4, hits: { max_score: 0.8 } }), []);
});

/** A fake cluster: answers each request with the next of `responses`, and records it. */
function cluster(responses) {
  const sent = [];
  return {
    sent,
    request: async (request) => {
      sent.push(`${request.method} ${request.path}`);
      return responses.shift();
    },
  };
}

test('a step passes when its requests succeed and its last response is the expected one', async () => {
  const steps = consoleSteps([fence('bash', 'PUT /a\n\nGET /a/_count'), 'Résultat attendu', fence('json', '{"count":0}')].join('\n'));
  const es = cluster([
    { status: 200, body: { acknowledged: true } },
    { status: 200, body: { count: 0 } },
  ]);

  assert.deepEqual(await runSteps(steps, es), []);
  assert.deepEqual(es.sent, ['PUT /a', 'GET /a/_count']);
});

test('a request that fails fails its step', async () => {
  const steps = consoleSteps(fence('bash', 'PUT /logs-000001'));
  const es = cluster([{ status: 400, body: { error: { reason: 'creates data streams only' } } }]);

  const [failure] = await runSteps(steps, es);
  assert.match(failure, /line 1: PUT \/logs-000001 → 400 creates data streams only/);
});

test('a response that differs from the expected one fails its step', async () => {
  const steps = consoleSteps([fence('bash', 'GET /a/_count'), 'Résultat attendu', fence('json', '{"count":5}')].join('\n'));

  const [failure] = await runSteps(steps, cluster([{ status: 200, body: { count: 4 } }]));
  assert.match(failure, /GET \/a\/_count: count: expected 5, got 4/);
});

test('a step that expects an error fails when no request fails', async () => {
  const steps = consoleSteps(['<!-- ci: expect-error -->', fence('bash', 'PUT /a/_doc/1\n{"x": "y"}')].join('\n'));

  assert.deepEqual(await runSteps(steps, cluster([{ status: 400, body: {} }])), []);
  assert.match((await runSteps(steps, cluster([{ status: 201, body: {} }])))[0], /expected an error/);
});

test('a skipped step sends nothing', async () => {
  const steps = consoleSteps(['<!-- ci: skip -->', fence('bash', 'POST /_cluster/reroute')].join('\n'));
  const es = cluster([]);

  assert.deepEqual(await runSteps(steps, es), []);
  assert.deepEqual(es.sent, []);
});

test('a DELETE of what does not exist yet is the cleanup of a setup, not a failure', async () => {
  const steps = consoleSteps(fence('bash', 'DELETE /blog_posts\n\nPUT /blog_posts'));
  const es = cluster([
    { status: 404, body: { error: { reason: 'no such index [blog_posts]' } } },
    { status: 200, body: { acknowledged: true } },
  ]);

  assert.deepEqual(await runSteps(steps, es), []);
});

test('something can be done before each step, such as a refresh', async () => {
  const steps = consoleSteps([fence('bash', 'GET /a'), fence('bash', 'GET /b')].join('\n'));
  const es = cluster([{ status: 200, body: {} }, { status: 200, body: {} }]);
  const before = [];

  await runSteps(steps, es, { beforeStep: async (step) => before.push(step.line) });
  assert.deepEqual(before, [1, 4]);
});

test('a comment at the end of a request line is ignored', () => {
  const markdown = fence('bash', 'GET /_nodes/_master        # Current master\nGET /_nodes/_local // This node');

  assert.deepEqual(
    consoleSteps(markdown)[0].requests.map((request) => request.path),
    ['/_nodes/_master', '/_nodes/_local'],
  );
});

test('a body that is not valid JSON fails its step, with its line', async () => {
  const steps = consoleSteps(['# Slide', fence('bash', 'PUT /a\n{ "settings": ... }')].join('\n'));

  const [failure] = await runSteps(steps, cluster([]));
  assert.match(failure, /^line 2: invalid body/);
});

test('the fixture of a chapter is named after it, without its number', () => {
  assert.equal(fixtureOf('slides/10_search.md'), 'search.md');
  assert.equal(fixtureOf('slides/4-indexation.md'), 'indexation.md');
  assert.equal(fixtureOf('workshops/01_indexing_search/README.md'), null);
});

test('an Elastic Stack image of another version than the tested one is stale', () => {
  const markdown = [
    'docker run docker.elastic.co/elasticsearch/elasticsearch:9.2.0',
    'docker run docker.elastic.co/kibana/kibana:9.5.5',
    'image: docker.elastic.co/beats/elastic-agent:8.12.0',
    'docker.elastic.co/elasticsearch/elasticsearch:9.5.5',
  ].join('\n');

  assert.deepEqual(staleImages(markdown, '9.5.5'), [
    { line: 1, image: 'docker.elastic.co/elasticsearch/elasticsearch:9.2.0' },
    { line: 3, image: 'docker.elastic.co/beats/elastic-agent:8.12.0' },
  ]);
});

test('a block declared as text is an output to read, not requests to send', () => {
  const markdown = [fence('text', 'GET /_nodes/<node_id>/stats'), fence('json', 'PUT /a\n{}'), fence('', 'GET /b')].join('\n');

  assert.deepEqual(
    consoleSteps(markdown).map((step) => step.requests[0].path),
    ['/a', '/b'],
  );
});
