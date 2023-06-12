---
layout: cover
---

# React Router

---

# React Router

* Ce module permet de définir les pages de notre application
* Pour chaque `path`, nous allons définir un composant
* React Router sera en charge d'instancier le composant et d'afficher le rendu

---

# React Router

* Pour cela, nous allons
  * instancier le router via la méthode `createBrowserRouter`
  * utiliser le composant `RouterProvider`

---

# React Router


```javascript
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([]);

const App =  () => (
    <RouterProvider router={router} />
);

export default App;
```

---

# React Router

* Nous allons ensuite définir les routes de notre application

```javascript
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([{
    path: "about",
    element: <div>About</div>,
}]);

const App =  () => (
    <RouterProvider router={router} />
);

export default App;
```

---

# React Router - Link

* Nous allons créer des liens via le composant *Link*

```javascript
import { Link } from 'react-router-dom';

const PeopleItem = () => {
    return (
        <Link to={`/contact/1`}>
            Luke Skywalker
        </Link>
    )
}

export default PeopleItem;
```

---

# React Router - hooks

* Des hooks sont à votre disposition pour faciliter la récupération de données liées au router
  * `useParams`
  * `useLocation`
  * `useMatch`
  * `useNavigate`
  * ...

---

# React Router - hooks

```javascript
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const Contact = () => {
  const { id } = useParams();
  const [contact, setContact] = useState({});

  useEffect(() => {
      fetchContact(id).then(c => setContact(c))
  }, [id]);

  return (
    <h2>{ contact.name }</h2>
  );
}

export default Contact;
```

---

# Lazy Loading

* Dès que l'application grossit, utile de faire du *lazy-loading*
* Permet de diminuer la taille du livrable principal
* Les modules lazy-loadés seront téléchargés si et seulement si l'utilisateur va sur la page cible

---

# Lazy Loading

```javascript
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {lazy, Suspense} from 'react';
import Loading from './loading';
const Contact = lazy(() => import('./contact'));

const router = createBrowserRouter([{
    path: "contact/:id",
    element: <div>About</div>,
}, {
    path: "about",
    element: (
      <Suspense fallback={<Loading />}>
          <Contact />
      </Suspense>
    ),
}]);

const App =  () => (
    <RouterProvider router={router} />
);

export default App;
```
