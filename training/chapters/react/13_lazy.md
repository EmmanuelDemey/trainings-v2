---
layout: cover
---

# 13 - Lazy loading - Suspense

---

# Présentation générale

### Le lazy loading permet :

- De charger un composant ou une partie de votre application de manière asynchrone, uniquement lorsque cela est nécessaire
- D'améliorer les performances de l'application en réduisant le temps de chargement initial
- De ne pas charger des ressources inutiles (#greenIT)

En pratique, React permet cela via la fonction `lazy` et le composant `Suspense`

---

# Import paresseux

```javascript
import React, { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <div>
      <h1>My App</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}

export default App;
```

Remarques :
- Importer via `lazy` construit, à la compilation, un fichier js dédié
- `fallback` est le contenu à afficher le temps que les ressources statiques nécessaires soient chargées

---
layout: cover
---

# Travaux Pratiques

## PW 13