---
layout: cover
---

# React Query

--- 

# React Query

* React Query est une librairie permettant de simplifier la gestion des appels APIs
  * Gestion de l'état du traitement asynchrone
  * Gestion de la mise en cache
  * Gestion de la révocation du cache

```shell
npm i react-query
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

 // Create a client
 const queryClient = new QueryClient()

 function App() {
   return (
     // Provide the client to your App
     <QueryClientProvider client={queryClient}>
       <Todos />
     </QueryClientProvider>
   )
 }
```

---

# useQuery

* Nous pouvons à présent utiliser `useQuery` pour mettre en cache le résultat d'un traitement asynchrone

```javascript
function Todos() {
   const { data, isLoading } = useQuery('todos', () => fetch(...).then(response => response.json()))

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
       <ul> ... </ul>
       <button
         onClick={() => {
           mutation.mutate({
             id: Date.now(),
             title: 'Do Laundry',
           })
         }}
       >
         Add Todo
       </button>
     </div>
   )
 }
```
