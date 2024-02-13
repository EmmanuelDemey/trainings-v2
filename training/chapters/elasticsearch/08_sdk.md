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


```javascript
const { Client } = require('@elastic/elasticsearch')
const fs = require('fs');

const client = new Client({
    node: 'https://localhost:9200',

    auth: {
        username: 'elastic',
        password: 'XXX'
    },
    tls: {
      ca: fs.readFileSync('./config/certs/http_ca.crt'),
      rejectUnauthorized: false
    }
})
```

---

# Node.js SDK

```javascript
const { body } = await client./* action */({
    index: 'INDEX NAME',
    body: {

    }
})
```

---

# Node.js SDK

```javascript
await client.index({
    index: 'game-of-thrones',
    body: {
        character: 'Tyrion Lannister',
        quote: 'A mind needs books like a sword needs a whetstone.'
    }
});
```

---

# Node.js SDK

```javascript
const { body } = await client.search({
    index: 'products',
    body: {

    }
})
```

---

# Node.js SDK

```javascript
client.cat.indices({
  help: true,
  s: 'index'
})
```

---
layout: cover
---

# Documentation Overview

---
layout: cover
---

# Practical Part