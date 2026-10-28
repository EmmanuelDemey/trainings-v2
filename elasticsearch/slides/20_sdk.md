---
layout: cover
---

# Developing with Elasticsearch

---

# Using an SDK

* Elasticsearch is usable via simple HTTP requests
* Many SDKs exist for integration with Java, JavaScript, .NET, PHP, etc.
    * [elasticsearch-php](https://github.com/elastic/elasticsearch-php)
    * [elasticsearch-js](https://github.com/elastic/elasticsearch-js)
    * [elasticsearch-java](https://github.com/elastic/elasticsearch-java)

```
npm install @elastic/elasticsearch
```

---

# Using an SDK


```typescript
import { Client } from '@elastic/elasticsearch';

const client = new Client({
    node: 'https://localhost:9200',

    auth: {
        username: 'elastic',
        password: 'XXX'
    }
})
```

---

# Node.js SDK

```typescript
import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: 'http://localhost:9200' });

// Since v8: the request's body is spread into the argument, and the response is the body itself
const response = await client./* action */({
    index: 'INDEX NAME',
    /* the fields of the request body: query, aggs, document… */
})
```

---

# Indexing with Node.js SDK

```typescript
import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: 'http://localhost:9200' });

async function indexDocument() {
  const document = {
    title: 'Sample Document',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  };

  const response = await client.index({
    index: 'documents',
    document
  });

  console.log(response);
}

indexDocument().catch(console.error);
```

---

# Searching with Node.js SDK

```typescript
async function searchDocuments() {
  const response = await client.search({
    index: 'documents',
    query: {
      match: { title: 'sample' }
    }
  });

  console.log(response.hits.hits);
}

searchDocuments().catch(console.error);

```

---

# Operating with Node.js SDK

```typescript
import { Client } from '@elastic/elasticsearch';


const client = new Client({ node: 'http://localhost:9200' });

async function getClusterInfo() {
  try {
    const stats = await client.cluster.stats();

    console.log('Cluster Name:', stats.cluster_name);
    console.log('Cluster Status:', stats.status);
    console.log('Nodes Count:', stats.nodes.count.total);
    console.log('Indices Count:', stats.indices.count);
  } catch (error) {
    console.error('Error retrieving cluster information:', error);
  }
}

getClusterInfo();
```

---

## Integration with Testcontainers

* **Testcontainers** is an open-source solution that allows you to programmatically launch a Docker image.
* This solution is often used to implement integration tests that depend on a service we do not control (such as a database, etc.).
* **Testcontainers** can be used in multiple languages and on different platforms (like Node.js).

```shell
npm install @testcontainers/elasticsearch --save-dev
```

```typescript
import { Client } from '@elastic/elasticsearch';
import { ElasticsearchContainer } from '@testcontainers/elasticsearch';

it("should create an index", async () => {
  const container = await new ElasticsearchContainer('docker.elastic.co/elasticsearch/elasticsearch:9.5.5').start();
  const client = new Client({
    node: container.getHttpUrl(),
    auth: { username: container.getUsername(), password: container.getPassword() },
  });

  await client.indices.create({ index: "people" });

  expect(await client.indices.exists({ index: "people" })).toBe(true);
  await container.stop();
});
```

---
layout: cover
---

# Documentation Overview


---
layout: cover
---

# Hands-on

## Workshop 14 - Develop with an SDK, test with Testcontainers
