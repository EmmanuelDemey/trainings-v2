---
layout: cover
---

# 16 - Developing with Elasticsearch

---

# Learning objectives

By the end of this sequence (**~60 min**, workshop included), you will be able to:

- **Connect** an application to Elasticsearch with an official client, securely
- **Index**, **search** and **aggregate** from code
- **Bulk-index** large volumes with the client's helpers
- **Test** that code against a real Elasticsearch started by Testcontainers

---

# The official clients

- Elasticsearch is a REST API: any HTTP client can talk to it
- An official client adds types, retries, node discovery, helpers:
  - [Java](https://github.com/elastic/elasticsearch-java), [JavaScript](https://github.com/elastic/elasticsearch-js),
    [Python](https://github.com/elastic/elasticsearch-py), [.NET](https://github.com/elastic/elasticsearch-net),
    [PHP](https://github.com/elastic/elasticsearch-php), [Go](https://github.com/elastic/go-elasticsearch), [Ruby](https://github.com/elastic/elasticsearch-ruby)
- Same APIs, same names everywhere: `indices.create`, `search`, `bulk`…
- Use the **major version** of the cluster: client 9 for Elasticsearch 9

```shell
npm install @elastic/elasticsearch
```

---

# Connect

```typescript
import { readFileSync } from 'node:fs';
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'https://localhost:9200',
  auth: { apiKey: process.env.ES_API_KEY },
  tls: { ca: readFileSync('http_ca.crt') },
});
```

- In production, an **API key**, scoped to what the application needs, revocable
- `auth: { username, password }` is fine for a workshop
- `tls.ca`: the CA of the cluster (`config/certs/http_ca.crt`), when it is self-signed

> Never `rejectUnauthorized: false` outside your laptop: it turns TLS off.

---

# The shape of a call

```typescript
const response = await client.search({
  index: 'movies',
  query: { match: { title: 'matrix' } },
  size: 5,
});

console.log(response.hits.hits.map((hit) => hit._source));
```

- The method and the path become a function: `GET /movies/_search` → `client.search({ index: 'movies' })`
- Since client 8, the body keys sit at the **top level** of the argument (no `body:`)
- The response **is** the body: `response.hits`, `response.aggregations`

---

# Create an index, index a document

```typescript
await client.indices.create({
  index: 'movies',
  mappings: {
    properties: {
      title: { type: 'text' },
      genre: { type: 'keyword' },
      year: { type: 'integer' },
    },
  },
});

await client.index({
  index: 'movies',
  id: 'matrix',
  document: { title: 'The Matrix', genre: 'sci-fi', year: 1999 },
});
```

- The same JSON as in Dev Tools, as a JavaScript object

---

# Aggregate

```typescript
const response = await client.search({
  index: 'movies',
  size: 0,
  aggs: { genres: { terms: { field: 'genre' } } },
});

const byGenre = Object.fromEntries(
  response.aggregations.genres.buckets.map((b) => [b.key, b.doc_count]),
);
```

- `size: 0`: no hits fetched, only the aggregation
- With TypeScript, type the response: `client.search<Movie, { genres: … }>(…)`

---

# Bulk-index: the helper

```typescript
const result = await client.helpers.bulk({
  datasource: movies,                       // an array, a stream, an async generator
  onDocument: () => ({ index: { _index: 'movies' } }),
  onDrop: (failure) => console.error(failure.error),
  refreshOnCompletion: 'movies',
});

console.log(result.successful, result.failed);
```

- Cuts the source into `_bulk` requests of a bounded size, sends several at once
- Retries the documents rejected with a `429`, reports the others through `onDrop`
- A plain `client.bulk` sends one request: its partial failures must be read in `items`

---

# Errors

```typescript
import { errors } from '@elastic/elasticsearch';

try {
  await client.get({ index: 'movies', id: 'unknown' });
} catch (error) {
  if (error instanceof errors.ResponseError && error.statusCode === 404) {
    return null;
  }
  throw error;
}
```

- `ResponseError`: Elasticsearch answered with an error — `statusCode`, `body.error.type`
- `ConnectionError`, `TimeoutError`: no answer — the client already retried on another node
- `_bulk` returns `200` even when documents fail: check `errors` and `items`

---

# Operate from code

```typescript
const health = await client.cluster.health();
console.log(health.status, health.number_of_nodes);

const indices = await client.cat.indices({ format: 'json', h: 'index,docs.count' });
console.log(indices);
```

- Every API of Dev Tools is there: `cluster`, `cat`, `nodes`, `snapshot`, `ilm`, `security`…
- Handy for scripts: create the indices and templates at deploy time, check the health in a probe

---

# Testcontainers

- Starts a **real** Elasticsearch in Docker, for the duration of the tests
- Same version as production, a fresh cluster per run, no shared state, no mock
- Exists for Java, .NET, Python, Go, Node.js…

```shell
npm install --save-dev @testcontainers/elasticsearch vitest
```

> A mocked client tells you your code calls `search`: not that the mapping and the query actually match.

---

# An integration test

```typescript
import { Client } from '@elastic/elasticsearch';
import { ElasticsearchContainer } from '@testcontainers/elasticsearch';

it('creates an index', async () => {
  const container = await new ElasticsearchContainer('docker.elastic.co/elasticsearch/elasticsearch:9.5.6').start();
  const client = new Client({
    node: container.getHttpUrl(),
    auth: { username: container.getUsername(), password: container.getPassword() },
  });

  await client.indices.create({ index: 'people' });

  expect(await client.indices.exists({ index: 'people' })).toBe(true);
  await client.close();
  await container.stop();
});
```

- Start the container once per file (`beforeAll`), not per test: about twenty seconds

---

# Where to find the documentation

- **API reference**: [elastic.co/docs/api/doc/elasticsearch](https://www.elastic.co/docs/api/doc/elasticsearch) — every endpoint, its parameters, its body
- **Client guides**: [elastic.co/docs/reference/elasticsearch/clients](https://www.elastic.co/docs/reference/elasticsearch/clients) — connection, helpers, per language
- **Dev Tools** in Kibana: write the request there first, then translate it into code
- **Copy as curl** in Dev Tools: share a request with a colleague

---

# Quiz

**Why test the search code against Testcontainers rather than with a mocked client?**

- A) It is faster
- B) A real Elasticsearch checks that the mapping, the query and the response actually fit together
- C) The client cannot be mocked
- D) Testcontainers is required by the client

<v-click>

**Answer: B** — a mock only checks the calls; a `text` field where a `keyword` was expected breaks a `terms` aggregation only on a real cluster.

</v-click>

---
layout: cover
---

# Workshop 12

## Develop with an SDK, test with Testcontainers
