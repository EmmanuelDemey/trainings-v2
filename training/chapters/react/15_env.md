---
layout: cover
---

# Variables d'environnement

---

* Variabilisation du code
* Interopérabilité de l'application

--- 

# Variables d'environnement & vite

Vous pouvez définir les fichiers listés ci-dessous à la racine de votre projet vite :

```shell
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

Les variables d'environnement doivent être définies sous forme de clés / valeur, les clés débutant par `VITE_`

---

# Variables d'environnement & vite

Une fois définie, vos variables d'environnement sont mobilisables dans votre code via l'objet suivant :

```typescript
const k: string = import.meta.env.VITE_SOME_KEY
```

---

# Variables d'environnement & vite & docker

Les variables d'environnement définies dans vos fichiers `.env` sont injectées dans votre livrable une fois l'application buildée.

Afin de pouvoir les surcharger facilement, une fois l'application buildée, via Docker, installez et configurez le plugin [`vite-envs`](https://github.com/garronej/vite-envs).

---
layout: cover
---

# Travaux Pratiques
