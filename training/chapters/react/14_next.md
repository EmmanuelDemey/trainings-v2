---
layout: cover
---

# 14 - Next.js

---

# Next.js

- **Next.js** est le framework React le plus populaire pour la production
- Développé par **Vercel**, recommandé par l'équipe React
- Principales fonctionnalités :
  - Rendu côté serveur (SSR) et génération statique (SSG)
  - Routing basé sur le système de fichiers (App Router)
  - Server Components et Server Actions
  - Optimisation automatique des images, fonts et scripts

```shell
npx create-next-app@latest my-app
```

---

# App Router

- Depuis Next.js 13+, l'**App Router** utilise le dossier `app/` avec des conventions de nommage
- Chaque dossier représente une route, et les fichiers spéciaux définissent le comportement

```
app/
├── layout.tsx        // Layout partagé
├── page.tsx          // Page d'accueil (/)
├── loading.tsx       // UI de chargement
├── error.tsx         // Gestion d'erreur
├── about/
│   └── page.tsx      // /about
└── blog/
    ├── page.tsx      // /blog
    └── [slug]/
        └── page.tsx  // /blog/:slug (route dynamique)
```

---

# Server Components

- Par défaut dans l'App Router, les composants sont des **Server Components**
- Ils s'exécutent uniquement sur le serveur (pas de JavaScript envoyé au client)
- Pour un composant client, ajouter la directive `"use client"` en haut du fichier

```typescript
// Server Component (par défaut) - peut faire des appels DB directement
async function UserList() {
  const users = await db.users.findMany();
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

```typescript
// Client Component - nécessaire pour useState, onClick, etc.
"use client";
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

# Server Actions

- Les **Server Actions** permettent d'exécuter du code serveur depuis un formulaire ou un événement client
- Directive `"use server"` pour marquer une fonction comme action serveur

```typescript
// app/actions.ts
"use server";

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  await db.users.create({ data: { name } });
  revalidatePath("/users");
}
```

```typescript
// app/page.tsx
import { createUser } from "./actions";

export default function Page() {
  return (
    <form action={createUser}>
      <input name="name" />
      <button type="submit">Créer</button>
    </form>
  );
}
```
