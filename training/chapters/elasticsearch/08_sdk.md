---
layout: cover
---

# Développons avec Elasticsearch

---

# Utilisation d'un SDK

* Elasticsearch est utilisable via de simples requêtes HTTPs
* De nombreux SDK existent pour intégrer dans du Java, JavaScript, .NET, PHP ...
    * https://github.com/elastic/elasticsearch-php
    * https://github.com/elastic/elasticsearch-js
    * https://github.com/elastic/elasticsearch-java

```
npm install @elastic/elasticsearch
```

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

# SDK Node.js

```javascript
const { body } = await client./* action */({
    index: 'INDEX NAME',
    body: {

    }
})
```

---

# SDK Node.js

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

# SDK Node.js

```javascript
const { body } = await client.search({
    index: 'products',
    body: {

    }
})
```

---

# SDK Node.js

```javascript
client.cat.indices({
  help: true,
  s: 'index'
})
```

---
layout: cover
---
# Présentation de la documentation

---
layout: cover
---
# Partie Pratique