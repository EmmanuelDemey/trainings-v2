---
layout: cover
---

# 23 - Actus React

---

# React 19 (stable)

[Blog officiel](https://react.dev/blog/2024/12/05/react-19) - Sortie stable en décembre 2024

## Principales nouveautés

- Nouveau hook `use()` pour lire des ressources (Promises, Context) dans le rendu
- Actions : fonctions async dans les transitions
- `useActionState` pour gérer l'état des formulaires
- `useOptimistic` pour les mises à jour optimistes
- `ref` en tant que prop (plus besoin de `forwardRef`)
- `<Context>` utilisable directement comme provider (au lieu de `<Context.Provider>`)
- Métadonnées document (`<title>`, `<meta>`, `<link>`) rendues depuis les composants

---

# React 19 - use()

- Le hook `use()` permet de lire une ressource (Promise ou Context) pendant le rendu
- Contrairement aux autres hooks, `use()` peut être appelé dans des conditions et des boucles

```typescript
import { use, Suspense } from 'react';

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map(comment => <p key={comment.id}>{comment.text}</p>);
}

function Page({ commentsPromise }) {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}
```

---

# React 19 - Actions et useActionState

- Les **Actions** permettent d'utiliser des fonctions async dans les transitions
- `useActionState` gère l'état, les erreurs et les soumissions pending

```typescript
import { useActionState } from 'react';

function ChangeName() {
  const [error, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const error = await updateName(formData.get("name"));
      if (error) return error;
      redirect("/profile");
      return null;
    },
    null
  );

  return (
    <form action={submitAction}>
      <input type="text" name="name" />
      <button type="submit" disabled={isPending}>Modifier</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

---

# React 19 - useOptimistic

- Permet d'afficher immédiatement un état optimiste pendant qu'une action async est en cours

```typescript
import { useOptimistic } from 'react';

function Thread({ messages, sendMessage }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { text: newMessage, sending: true }]
  );

  const formAction = async (formData) => {
    addOptimisticMessage(formData.get("message"));
    await sendMessage(formData);
  };

  return (
    <>
      {optimisticMessages.map((msg) => <div key={msg.text}>{msg.text}</div>)}
      <form action={formAction}>
        <input type="text" name="message" />
        <button type="submit">Envoyer</button>
      </form>
    </>
  );
}
```

---

# React 19 - ref comme prop

- Plus besoin d'utiliser `forwardRef` : les composants fonctionnels acceptent `ref` directement comme prop

```typescript
// Avant (React 18)
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// Maintenant (React 19)
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

---

# React Compiler

- Le **React Compiler** est un outil de build qui optimise automatiquement votre code React
- Il mémorise automatiquement les composants et les valeurs, réduisant les re-rendus inutiles
- Cela diminue le besoin d'utiliser manuellement `useMemo`, `useCallback` et `React.memo`
- Ces hooks ne sont **pas dépréciés** et restent valides, mais le compilateur peut les rendre moins nécessaires
- Actuellement en phase de déploiement progressif (opt-in)

```shell
npm install -D babel-plugin-react-compiler
```

---
layout: cover
---

# Travaux Pratiques

## PW 23
