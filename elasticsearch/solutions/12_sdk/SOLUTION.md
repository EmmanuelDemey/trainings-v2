# Workshop 12 — Develop with an SDK: solution

For the trainer. Not published: the learners write this code themselves. No
`package.json` here on purpose — the workshop is checked by hand, not by the CI.

## catalog.js

```javascript
import { Client } from '@elastic/elasticsearch';

export function connect() {
  return new Client({
    node: process.env.ES_URL ?? 'http://localhost:9200',
    auth: { username: 'elastic', password: process.env.ES_PASSWORD ?? 'changeme' },
  });
}

export async function createIndex(client) {
  await client.indices.create({
    index: 'movies',
    settings: { number_of_shards: 1, number_of_replicas: 0 },
    mappings: {
      properties: {
        title: { type: 'text' },
        genre: { type: 'keyword' },
        year: { type: 'integer' },
      },
    },
  });
}

export async function load(client, movies) {
  const result = await client.helpers.bulk({
    datasource: movies,
    onDocument: () => ({ index: { _index: 'movies' } }),
    refreshOnCompletion: 'movies',
  });
  return result.successful;
}

export async function searchByTitle(client, text) {
  const response = await client.search({
    index: 'movies',
    query: { match: { title: text } },
  });
  return response.hits.hits.map((hit) => hit._source.title);
}

export async function countByGenre(client) {
  const response = await client.search({
    index: 'movies',
    size: 0,
    aggs: { genres: { terms: { field: 'genre' } } },
  });
  return Object.fromEntries(response.aggregations.genres.buckets.map((b) => [b.key, b.doc_count]));
}
```

## Answers — part A

- **Step 1**: in production, an **API key** (`auth: { apiKey: '…' }`), scoped to
  what the application needs and revocable without touching a user. For HTTPS
  with a self-signed certificate: `tls: { ca: readFileSync('http_ca.crt') }`.
- **Step 2**: the same body, as a JavaScript object rather than JSON in a
  request; the method and the path become `client.indices.create` and
  `index: 'movies'`. Since client 8, the body keys sit at the top level of the
  argument (no `body:`).
- **Step 3**: the helper cuts any array or stream into `_bulk` requests of a
  bounded size, sends several at once, retries the documents rejected with a
  `429`, and reports the failures through `onDrop`. `refreshOnCompletion`
  refreshes once at the end, not after every batch. A plain `client.bulk` sends
  one request, built by hand, and its partial failures must be read in `items`.

## catalog.test.js

```javascript
import { ElasticsearchContainer } from '@testcontainers/elasticsearch';
import { Client } from '@elastic/elasticsearch';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { countByGenre, createIndex, load, searchByTitle } from './catalog.js';

const MOVIES = [
  { title: 'The Matrix', genre: 'sci-fi', year: 1999 },
  { title: 'The Matrix Reloaded', genre: 'sci-fi', year: 2003 },
  { title: 'Amélie', genre: 'comedy', year: 2001 },
];

let container;
let client;

beforeAll(async () => {
  container = await new ElasticsearchContainer('docker.elastic.co/elasticsearch/elasticsearch:9.5.5').start();
  client = new Client({
    node: container.getHttpUrl(),
    auth: { username: container.getUsername(), password: container.getPassword() },
  });
  await createIndex(client);
  await load(client, MOVIES);
}, 180_000);

afterAll(async () => {
  await client?.close();
  await container?.stop();
});

test('finds the movies whose title matches', async () => {
  expect(await searchByTitle(client, 'matrix')).toHaveLength(2);
});

test('counts the movies of each genre', async () => {
  expect(await countByGenre(client)).toEqual({ 'sci-fi': 2, comedy: 1 });
});
```

## Answers — part B, step 3

With `genre` as `text`, `counts the movies of each genre` fails: the `terms`
aggregation on a `text` field is refused — `illegal_argument_exception`,
« Fielddata is disabled on [genre] in [movies] ». A test that mocks the client
returns whatever the mock was told to: it passes, and the bug reaches
production. Only a real Elasticsearch knows its own mapping rules.

## Going further

```javascript
export async function updateYear(client, id, year) {
  await client.update({ index: 'movies', id, doc: { year }, refresh: true });
}
```
