# Workshop 14 — Develop with an SDK, test with Testcontainers

> Talk to Elasticsearch from code with the official client: create an index, bulk-index, search and aggregate — then test that code against a real Elasticsearch started by Testcontainers.

**Topic**: Developing with Elasticsearch — SDK, Testcontainers

## Context

A streaming platform wants its movie catalog in its application. You write the module that talks to Elasticsearch, and the integration tests that prove it works, without depending on a shared cluster.

The workshop is written in **JavaScript (Node.js)**, as the chapter is. The official clients for Java, .NET, Python, PHP, Go and Ruby expose the same APIs under the same names (`indices.create`, `search`, bulk helpers…), and Testcontainers exists for Java, .NET, Python and Go: you can do the workshop in your language, the approach is the same.

Each step states **what** the code must do, and the tests say when it does. Find how in the documentation of the client. Hints are folded — open them only once you are stuck.

Reference: [the JavaScript client](https://www.elastic.co/docs/reference/elasticsearch/clients/javascript).

## Setup

This workshop stands on its own. You need:

- **Node.js 22** or later;
- a reachable cluster and the password of the `elastic` user (part A);
- **Docker**, for Testcontainers (part B).

```bash
mkdir movies-catalog && cd movies-catalog
npm init -y
npm pkg set type=module
npm install @elastic/elasticsearch
npm install --save-dev @testcontainers/elasticsearch vitest
```

Everything you write goes in `catalog.js`, which exports five functions:

```javascript
export function connect() {}                         // → a Client
export async function createIndex(client) {}         // creates `movies`
export async function load(client, movies) {}        // → the number of movies indexed
export async function searchByTitle(client, text) {} // → the titles that match
export async function countByGenre(client) {}        // → { genre: count, … }
```

## Part A: The official client

### Step 1: Connect

`connect()` returns a client for the cluster at `ES_URL` (default `http://localhost:9200`), as the user `elastic` with the password of `ES_PASSWORD`.

<details>
<summary>Hint</summary>

The client is the `Client` class of `@elastic/elasticsearch`. Look at [connecting](https://www.elastic.co/docs/reference/elasticsearch/clients/javascript/connecting): `node` and `auth`.

</details>

**Question**: what would you use in production instead of a user and a password? And for a cluster in HTTPS with a self-signed certificate?

### Step 2: Create the index

`createIndex(client)` creates the index `movies`: 1 shard, 0 replicas, with `title` (`text`), `genre` (`keyword`) and `year` (`integer`).

<details>
<summary>Hint</summary>

The client mirrors the REST API: `PUT /movies` is `client.indices.create(…)`. The body of the request becomes the properties of its argument.

</details>

**Question**: compare your code with the `PUT /movies` you would write in Dev Tools. What changes?

### Step 3: Bulk-index

`load(client, movies)` indexes an array of movies into `movies` with **one** call that cuts the work into `_bulk` requests, makes them searchable at the end, and returns the number of movies indexed.

<details>
<summary>Hint</summary>

Look at the [client helpers](https://www.elastic.co/docs/reference/elasticsearch/clients/javascript/client-helpers): one of them takes a `datasource`, and asks for each document what to do with it. Look at what it resolves with.

</details>

**Question**: what does that helper do that a plain `client.bulk` does not?

### Step 4: Search and aggregate

- `searchByTitle(client, text)` returns the **titles** of the movies whose `title` matches `text` (full text).
- `countByGenre(client)` returns the number of movies per `genre`, as an object — `{ 'sci-fi': 2, comedy: 1 }` — with no hits fetched.

<details>
<summary>Hint</summary>

`client.search` takes the same `query` and `aggs` as the search API of Dev Tools. The response holds `hits.hits` and `aggregations`. Workshops 4 and 6 hold the queries you need.

</details>

### Step 5: Try it against your cluster

Create `main.js`:

```javascript
import { connect, countByGenre, createIndex, load, searchByTitle } from './catalog.js';

const client = connect();
console.log((await client.info()).version.number);

await client.indices.delete({ index: 'movies', ignore_unavailable: true });
await createIndex(client);
console.log(await load(client, [
  { title: 'The Matrix', genre: 'sci-fi', year: 1999 },
  { title: 'Amélie', genre: 'comedy', year: 2001 },
]));
console.log(await searchByTitle(client, 'matrix'), await countByGenre(client));
```

```bash
ES_PASSWORD=<your password> node main.js
```

**Expected result**:

```text
9.5.5
2
[ 'The Matrix' ] { comedy: 1, 'sci-fi': 1 }
```

Check from Kibana Dev Tools that the index is there:

<!-- ci: skip -->
```json
GET /movies/_count
```

## Part B: Test with Testcontainers

Testcontainers starts a Docker container for the duration of the tests: each run starts from a fresh Elasticsearch, of the same version as production, with no shared cluster and no mock.

Reference: [Testcontainers for Node.js — Elasticsearch](https://node.testcontainers.org/modules/elasticsearch/).

### Step 1: Write the tests

Create `catalog.test.js`, with Vitest. Before all the tests, it:

- starts an `ElasticsearchContainer` from `docker.elastic.co/elasticsearch/elasticsearch:9.5.5` — give it up to 3 minutes;
- builds a `Client` for it — **not** with `connect()`: the container gives its own URL, user and password;
- creates the index, and loads `The Matrix` (sci-fi, 1999), `The Matrix Reloaded` (sci-fi, 2003) and `Amélie` (comedy, 2001).

After all the tests, it closes the client and stops the container. Two tests:

- `finds the movies whose title matches`: searching `matrix` returns 2 titles;
- `counts the movies of each genre`: `{ 'sci-fi': 2, comedy: 1 }`.

<details>
<summary>Hint</summary>

The container has methods for its HTTP URL, its user and its password. `beforeAll` and `afterAll` take a timeout as their second argument.

</details>

### Step 2: Run the tests

```bash
npx vitest run
```

**Expected result**:

```text
 Test Files  1 passed (1)
      Tests  2 passed (2)
```

The first run downloads the image (~1 GB); the next ones start in about twenty seconds.

### Step 3: Break a test

Change the mapping of `genre` to `text` in `createIndex`, and run the tests again.

**Questions**:
- Which test fails, and with which error?
- What would a test that mocks the Elasticsearch client have told you?

Put `keyword` back.

## Going further

- Add a function `updateYear(client, id, year)`, and its test.
- Run the same test in Java with `org.testcontainers:elasticsearch` and `co.elastic.clients:elasticsearch-java`.

## Success criteria

- `node main.js` prints the version of the cluster, `2`, then the result of the search and of the aggregation
- `npx vitest run` passes, against an Elasticsearch started by Testcontainers
- You can explain why the test fails when `genre` becomes `text`

## Troubleshooting

**Problem**: `ConnectionError: connect ECONNREFUSED`
→ Check `ES_URL`: does the cluster listen on `http` or `https`?

**Problem**: `self-signed certificate in certificate chain`
→ The cluster is in HTTPS with its own CA: give it to the client, `tls: { ca: readFileSync('http_ca.crt') }` (the file is in `config/certs/` of the node).

**Problem**: Testcontainers fails with `Could not find a working container runtime strategy`
→ Docker is not running, or your user cannot reach its socket.

**Problem**: `beforeAll` times out
→ The first download of the image is long: run again, or `docker pull docker.elastic.co/elasticsearch/elasticsearch:9.5.5` first.
