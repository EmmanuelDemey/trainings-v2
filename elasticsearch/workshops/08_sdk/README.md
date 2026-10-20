# TP 8 — Développer avec un SDK et tester avec Testcontainers

> Parler à Elasticsearch depuis du code avec le client officiel: créer un index, indexer en masse, chercher et agréger — puis tester ce code contre un vrai Elasticsearch lancé par Testcontainers.

**Topic**: Développer avec Elasticsearch - SDK, Testcontainers

## Contexte

Une plateforme de streaming veut exposer son catalogue de films dans son application. Vous écrivez le module d'accès à Elasticsearch, et les tests d'intégration qui le valident sans dépendre d'un cluster partagé.

Le TP est écrit en **JavaScript (Node.js)**, comme le chapitre. Les clients officiels Java, .NET, Python, PHP, Go et Ruby exposent les mêmes API sous les mêmes noms (`indices.create`, `search`, helpers de bulk…), et Testcontainers existe pour Java, .NET, Python et Go: vous pouvez faire le TP dans votre langage, la démarche est identique.

## Setup

Ce TP est autonome. Il faut:

- **Node.js 22** ou plus récent;
- un cluster accessible et le mot de passe de l'utilisateur `elastic` (partie A);
- **Docker**, pour Testcontainers (partie B).

```bash
mkdir movies-catalog && cd movies-catalog
npm init -y
npm pkg set type=module
npm install @elastic/elasticsearch
npm install --save-dev @testcontainers/elasticsearch vitest
```

## Partie A: Le client officiel

### Étape 1: Se connecter

Créez `catalog.js`:

```javascript
import { Client } from '@elastic/elasticsearch';

export function connect() {
  return new Client({
    node: process.env.ES_URL ?? 'http://localhost:9200',
    auth: { username: 'elastic', password: process.env.ES_PASSWORD ?? 'changeme' },
  });
}
```

Le client accepte aussi une **API key** (`auth: { apiKey: '…' }`) — préférable en production à un utilisateur et son mot de passe. Pour un cluster en HTTPS avec un certificat auto-signé, passez son CA dans `tls: { ca }`.

### Étape 2: Créer l'index

Ajoutez à `catalog.js`:

```javascript
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
```

**Question**: Comparez ce code avec la requête `PUT /movies` que vous écririez dans Dev Tools. Qu'est-ce qui change ?

### Étape 3: Indexer en masse

Le helper `bulk` découpe un tableau (ou un flux) en requêtes `_bulk`, et rejoue celles qui échouent pour cause de surcharge:

```javascript
export async function load(client, movies) {
  const result = await client.helpers.bulk({
    datasource: movies,
    onDocument: () => ({ index: { _index: 'movies' } }),
    refreshOnCompletion: 'movies',
  });
  return result.successful;
}
```

### Étape 4: Chercher et agréger

```javascript
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

### Étape 5: Essayer contre votre cluster

Créez `main.js`:

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
ES_PASSWORD=<votre mot de passe> node main.js
```

**Résultat attendu**:
```
9.5.5
2
[ 'The Matrix' ] { comedy: 1, 'sci-fi': 1 }
```

Vérifiez depuis Kibana Dev Tools que l'index existe bien:

<!-- ci: skip -->
```json
GET /movies/_count
```

## Partie B: Tester avec Testcontainers

Testcontainers démarre un conteneur Docker le temps des tests: chaque exécution part d'un Elasticsearch neuf, de la même version que la production, sans cluster partagé ni mock.

### Étape 1: Écrire le test

Créez `catalog.test.js`:

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

### Étape 2: Lancer les tests

```bash
npx vitest run
```

**Résultat attendu**:
```
 Test Files  1 passed (1)
      Tests  2 passed (2)
```

Le premier lancement télécharge l'image (~1 Go); les suivants démarrent en une vingtaine de secondes.

### Étape 3: Faire échouer un test

Changez le mapping de `genre` en `text` dans `createIndex`, relancez les tests.

**Questions**:
- Quel test échoue, et avec quelle erreur ?
- Qu'aurait donné un test qui mocke le client Elasticsearch ?

Remettez `keyword`.

## Pour aller plus loin

- Ajoutez une fonction `updateYear(client, id, year)` avec `client.update`, et son test.
- Faites tourner le même test en Java avec `org.testcontainers:elasticsearch` et `co.elastic.clients:elasticsearch-java`.

## Critères de Succès

- `node main.js` affiche la version du cluster, `2`, puis le résultat de la recherche et de l'agrégation
- `npx vitest run` passe, contre un Elasticsearch démarré par Testcontainers
- Vous savez expliquer pourquoi le test de la partie B échoue quand `genre` devient `text`

## Dépannage

**Problème**: `ConnectionError: connect ECONNREFUSED`
→ Vérifiez `ES_URL`: le cluster écoute-t-il en `http` ou en `https` ?

**Problème**: `self-signed certificate in certificate chain`
→ Le cluster est en HTTPS avec son propre CA: passez-le au client, `tls: { ca: readFileSync('http_ca.crt') }` (le fichier est dans `config/certs/` du nœud).

**Problème**: Testcontainers échoue avec `Could not find a working container runtime strategy`
→ Docker n'est pas démarré, ou votre utilisateur n'a pas accès à son socket.

**Problème**: `beforeAll` dépasse son délai
→ Le premier téléchargement de l'image est long: relancez, ou faites `docker pull docker.elastic.co/elasticsearch/elasticsearch:9.5.5` avant.
