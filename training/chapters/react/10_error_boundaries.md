---
layout: cover
---

# 10 - Périmètres d'erreur

---

# ErrorBoundary

Les `ErrorBoundary` permettent de limiter les impacts d'une erreur sur votre UI :

- Évite de "casser" toute son application
- Définit un périmètre "à surveiller"
- Rend un composant de secours en cas d'erreur dans le scope concerné

## Champ d'application :

- Capture les erreurs provenant des composants
- Ne capture pas les erreurs provenant :
    - Des gestionnaires d'événements
    - Du code asynchrone

---

# Définition

```typescript {*}{maxHeight:'400px'}
import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Met à jour l'état pour afficher une UI de secours.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Vous pouvez enregistrer l'erreur dans un service de journalisation externe.
    console.error("Error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      // Affiche une UI de secours
      return <h1>Something went wrong.</h1>;
    }

    // Rend les enfants si tout va bien
    return this.props.children;
  }
}

export default ErrorBoundary;


const Component = () => (
    <ErrorBoundary>
        {...}
    </ErrorBoundary>
)
```

---

# Erreurs dans les gestionnaires d'évènement

```typescript
function Button() {
  const handleClick = () => {
    try {
      throw new Error("Button click error");
    } catch (error) {
      console.error("Error in click handler:", error);
    }
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

---

# Et sans étendre React.Component ?

- [react-error-boundary](https://github.com/bvaughn/react-error-boundary) définit un composant "moderne" réutilisable.
- Nous vous conseillons d'utiliser cette librairie :
    - Cela évite de définir soit même son ErrorBoundary "à l'ancienne"
    - La librairie est pleine d'options avancées

```bash
npm i react-error-boundary
```

```typescript
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <ExampleApplication />
</ErrorBoundary>
```

---
layout: cover
---

# Travaux Pratiques

## WP 10