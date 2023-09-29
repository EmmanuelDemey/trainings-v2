---
layout: cover
---

# Développons avec Elasticsearch

---

# Utilisation d'un SDK

* Elasticsearch est utilisable via de simples requêtes HTTPs
* De nombreux SDK existent pour intégrer dans du Java, JavaScript, .NET, PHP ...

# SDK Node.js

```
npm install @elastic/elasticsearch
```

---

# SDK Node.js

```
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

```
const { body } = await client./* action */({
    index: 'INDEX NAME',
    body: {

    }
})
```

---

# SDK Node.js

```
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

```
const { body } = await client.search({
    index: 'products',
    body: {

    }
})
```

---

# SDK Node.js

```
client.cat.indices({
  help: true,
  s: 'index'
})
```

---

# Présentation de la documentation

---