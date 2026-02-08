---
layout: cover
---

# 17 - TanStack Query

---

# TanStack Query

* React Query est une librairie permettant de simplifier la gestion des appels APIs
  * Gestion de l'état du traitement asynchrone
  * Gestion de la mise en cache
  * Gestion de la révocation du cache

```shell
npm i @tanstack/react-query @tanstack/react-query-devtools
```

---

# QueryClientProvider

* La première étape est d'englober votre application (ou une partie) par le composant QueryClientProvider.

```javascript {*}{maxHeight:'400px'}
import {
   QueryClient,
   QueryClientProvider,
 } from '@tanstack/react-query'
import { getTodos, postTodo } from '../my-api'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity
		}
	}
})
 function App() {
   return (
     <QueryClientProvider client={queryClient}>
       <Todos />
       <ReactQueryDevtools initialIsOpen={false} />
     </QueryClientProvider>
   )
 }
```

---

# useQuery

* Nous pouvons à présent utiliser `useQuery` pour mettre en cache le résultat d'un traitement asynchrone

```javascript
function Todos() {
   const { data } = useQuery({
     queryKey: ['todos'],
     queryFn: () => fetch('/api/todos').then(response => response.json())
   })

   return (
     <div>
       <ul>
         {data?.map(todo => (
           <li key={todo.id}>{todo.title}</li>
         ))}
       </ul>
     </div>
   )
 }
```

---

# Queries

* Voici une liste des propriétés retournées par l'utilisation du hook `useQuery`
  * isPending (la requête n'a pas encore de données)
  * isError
  * isSuccess
  * isFetching (une requête est en cours, y compris en arrière-plan)
  * error
  * data
  * status

---

# Queries

* Voici un exemple complet de **useQuery**

```typescript
function Todos() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList
  })

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

---

# useMutation

* Si vous souhaitez exécuter des requêtes de création/mise à jour/suppression, nous allons utiliser le hook `useMutation`.
* Nous allons pouvoir révoquer une partie du cache en cas de succès d'une mutation.

```javascript {*}{maxHeight:'300px'}
function Todos() {
   const queryClient = useQueryClient()
   const query = useQuery({ queryKey: ['todos'], queryFn: getTodos })
   const mutation = useMutation({
     mutationFn: postTodo,
     onSuccess: () => {
       // Invalidate and refetch
       queryClient.invalidateQueries({ queryKey: ['todos'] })
     },
   })

   return (
     <div>
       <button
         onClick={() => {
           mutation.mutate({ ... })
         }}
       >
         Add Todo
       </button>
     </div>
   )
 }
```

---

# StoragePersister

* Possibilité de définir des stratégies de persistance synchrone et/ou asynchrone.

```typescript
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient({ ... })

const localStoragePersister = createSyncStoragePersister({ storage: window.localStorage })

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
})
```

---
layout: cover
---

# Travaux Pratiques

## PW 17
