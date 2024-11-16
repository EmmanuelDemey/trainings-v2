---
layout: cover
---

# TanStack Query

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

```javascript
import {
   QueryClient,
   QueryClientProvider,
 } from 'react-query'
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
     // Provide the client to your App
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
   const { data } = useQuery('todos', () => fetch(...).then(response => response.json()))

   return (
     <div>
       <ul>
         {query.data.map(todo => (
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
  * isLoading
  * isError
  * isSuccess
  * isIdle
  * error
  * data
  * status

---

# Queries

* Voici un exemple complet de **useQuery**

```typescript
function Todos() {
  const { isLoading, isError, data, error } = useQuery('todos', fetchTodoList)

  if (isLoading) {
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

* Si vous souhaitez exécuter des requetes de création/mise à jour/suppression, nous allons utiliser le hook `useMutation`.
* Nous allons pouvoir révoquer une partie du cache en cas de succès d'une mutation.

```javascript
function Todos() {
   const queryClient = useQueryClient()
   const query = useQuery('todos', getTodos)
   const mutation = useMutation(postTodo, {
     onSuccess: () => {
       // Invalidate and refetch
       queryClient.invalidateQueries('todos')
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

## WP 17
