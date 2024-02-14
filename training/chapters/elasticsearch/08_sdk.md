---
layout: cover
---

# Developing with Elasticsearch

---

# Using a SDK

* Elasticsearch is usable via simple HTTP requests
* Many SDKs exist for integration with Java, JavaScript, .NET, PHP, etc.
    * [elasticsearch-php](https://github.com/elastic/elasticsearch-php)
    * [elasticsearch-js](https://github.com/elastic/elasticsearch-js)
    * [elasticsearch-java](https://github.com/elastic/elasticsearch-java)

```
npm install @elastic/elasticsearch
```

---

# Using a SDK


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

const { body } = await client./* action */({
    index: 'INDEX NAME',
    body: {

    }
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
    body: document
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
    body: {
      query: {
        match: { title: 'sample' }
      }
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
    const { body } = await client.cluster.stats();

    console.log('Cluster Name:', body.cluster_name);
    console.log('Cluster Status:', body.status);
    console.log('Nodes Count:', body.nodes.count);
    console.log('Indices Count:', body.indices.count);
  } catch (error) {
    console.error('Error retrieving cluster information:', error);
  }
}

getClusterInfo();
```

---
layout: cover
---

# Documentation Overview

---
layout: cover
---

# Practical Part