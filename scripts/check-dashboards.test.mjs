// node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fieldMismatches, sampleDataTables } from './check-dashboards.mjs';

const table = [
  '| Champ | Type | Contenu |',
  '|---|---|---|',
  '| `timestamp` | `date` | Date de la requête |',
  '| `response` / `response.keyword` | `text` / `keyword` | Code HTTP |',
  '| `geo.coordinates` | `geo_point` | Position |',
].join('\n');

test('a table after a sample-data marker lists the fields the workshop relies on, with their types', () => {
  const markdown = ['# TP 8', '', '<!-- ci: sample-data logs -->', table, '', 'Référence'].join('\n');

  assert.deepEqual(sampleDataTables(markdown), [
    {
      dataset: 'logs',
      line: 3,
      fields: [
        { name: 'timestamp', type: 'date' },
        { name: 'response', type: 'text' },
        { name: 'response.keyword', type: 'keyword' },
        { name: 'geo.coordinates', type: 'geo_point' },
      ],
    },
  ]);
});

test('a table without the marker is not checked', () => {
  assert.deepEqual(sampleDataTables(['# TP', table].join('\n')), []);
});

const mapping = {
  properties: {
    timestamp: { type: 'date' },
    response: { type: 'text', fields: { keyword: { type: 'keyword' } } },
    geo: { properties: { coordinates: { type: 'geo_point' }, src: { type: 'keyword' } } },
  },
};

test('fields the mapping holds with the same type are fine', () => {
  const fields = [
    { name: 'timestamp', type: 'date' },
    { name: 'response.keyword', type: 'keyword' },
    { name: 'geo.coordinates', type: 'geo_point' },
  ];

  assert.deepEqual(fieldMismatches(fields, mapping), []);
});

test('a missing field, or one of another type, is reported', () => {
  const fields = [
    { name: 'clientip', type: 'ip' },
    { name: 'geo.src', type: 'text' },
  ];

  assert.deepEqual(fieldMismatches(fields, mapping), ['clientip: missing', 'geo.src: expected text, got keyword']);
});
