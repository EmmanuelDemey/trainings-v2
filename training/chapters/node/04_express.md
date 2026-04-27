---
layout: cover
---

# 4 - Framework Express

---

# Express

- Framework HTTP **minimaliste** pour Node.js
- Le plus utilisé de l'écosystème
- Repose sur le concept de **middlewares** chaînés
- Alternative modernes : **Fastify**, **Koa**, **Hono**, **NestJS**

```bash
npm install express
```

```javascript
const express = require('express');

const app = express();

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(3000, () => console.log('Listening on 3000'));
```

---

# Middlewares

- Une fonction de signature `(req, res, next)`
- S'exécutent dans l'ordre de déclaration
- Peuvent terminer la réponse ou passer la main avec `next()`

```javascript
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.url} - ${Date.now() - req.startTime}ms`);
  });
  next();
});
```

---

# Middlewares - gestion d'erreurs

- Les middlewares d'erreur ont **4 paramètres** : `(err, req, res, next)`
- À déclarer **après** toutes les routes

```javascript
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({ message: err.message });
});
```

- Pour une fonction handler async, propager l'erreur via `next(err)` ou utiliser `express-async-errors`

---

# Routage

- Méthodes HTTP : `app.get`, `app.post`, `app.put`, `app.patch`, `app.delete`, `app.all`
- Paramètres dynamiques

```javascript
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});
```

- Wildcards : `/files/*`
- Validation : utiliser `zod`, `joi` ou `express-validator`

---

# Routage - Router

- `express.Router()` permet de modulariser les routes

```javascript
// users.router.js
const router = express.Router();

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', createUser);

module.exports = router;
```

```javascript
// app.js
app.use('/api/users', require('./users.router'));
```

---

# Body parsing

- Express expose nativement les middlewares de parsing

```javascript
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
```

- Pour les **uploads** multipart : `multer` ou `busboy`

---

# Guards - sécurisation

- Un **guard** est un middleware qui vérifie une condition avant d'autoriser l'accès
- Patterns d'auth :
  - **Session/cookie** : `express-session` + store (Redis, Mongo)
  - **JWT** : `jsonwebtoken`, `passport-jwt`
  - **OAuth2 / OIDC** : `passport`, `openid-client`
  - **API Key** : header custom

---

# Guard - JWT

```javascript
const jwt = require('jsonwebtoken');

const authGuard = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/me', authGuard, (req, res) => res.json(req.user));
```

---

# Guard - rôles / permissions

- Composer plusieurs middlewares pour appliquer une politique

```javascript
const requireRole = (role) => (req, res, next) => {
  if (!req.user?.roles?.includes(role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

app.delete('/users/:id', authGuard, requireRole('admin'), deleteUser);
```

---

# Stratégies Passport

- **passport** propose un système de **stratégies** pluggables

```javascript
const passport = require('passport');
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(async (username, password, done) => {
  const user = await userRepo.findByUsername(username);
  if (!user || !await user.verifyPassword(password)) {
    return done(null, false);
  }
  done(null, user);
}));

app.post('/login',
  passport.authenticate('local', { session: false }),
  (req, res) => res.json({ token: signToken(req.user) }),
);
```

---

# Sécurité - bonnes pratiques

- **`helmet`** : durcit les headers HTTP (CSP, HSTS, X-Frame-Options...)
- **`cors`** : configurer finement les origines autorisées
- **`express-rate-limit`** : protection brute force / DDoS
- **`csurf`** ou tokens CSRF custom pour les formulaires
- Valider **toutes** les entrées (body, query, params)
- Toujours **hasher** les mots de passe (`bcrypt`, `argon2`)
- Désactiver `x-powered-by` (`app.disable('x-powered-by')`)

```javascript
app.use(helmet());
app.use(cors({ origin: 'https://app.sparks.fr' }));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
```

---

# Alternatives modernes

| Framework | Atouts |
|-----------|--------|
| **Fastify** | Très performant, schémas JSON natifs, plugin system |
| **Koa** | Cœur minimaliste, async/await first |
| **Hono** | Multi-runtime (Node, Bun, Deno, Workers) |
| **NestJS** | Architecture opinionnée, DI, décorateurs |

- Express reste une référence pour sa **stabilité** et sa **communauté**
- Pour de nouveaux projets, considérer Fastify ou NestJS si performance/structure sont critiques

---
layout: cover
---

# Travaux Pratiques

## Atelier 4 - Express
- Construire une API REST `/api/users` avec routage modulaire
- Ajouter un guard JWT + un guard rôle admin
- Configurer helmet, cors, rate-limit
