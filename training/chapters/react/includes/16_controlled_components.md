---
layout: cover
---

# Composants contrôlés

## vs

# Composants non-contrôlés

---

# Composants contrôlés

### Qu'est-ce donc ?

Un composant dont la valeur est entièrement contrôlée par un état React :

- La valeur actuelle de l'entrée est déterminée par l'état du composant
- Les modifications de l'entrée déclenchent une mise à jour de l'état via un gestionnaire d'événement
- La source de vérité est l'état React

### Avantages

- Maîtrise totale sur les valeurs de vos champs
- Permet de valider la valeur ou appliquer des règles avant de la stocker

### Inconvénients

- Chaque champ nécessite un état et un gestionnaire d'événement
- Si vous gérez un grand nombre de champs, cela peut entraîner des re-rendus fréquents

---

# Composants contrôlés

```typescript
import React, { useState } from "react";

function ControlledInput() {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value); // Met à jour l'état
  };

  return (
    <div>
      <input type="text" value={inputValue} onChange={handleChange} />
      <p>Valeur actuelle : {inputValue}</p>
    </div>
  );
}

export default ControlledInput;
```

---

# Composants non contrôlés

### Qu'est-ce donc ?

Un composant dont la valeur d'un champ de formulaire est directement manipulée par le DOM :

- La valeur est lue directement depuis l'élément DOM avec une référence (ref)
- Les modifications de l'entrée ne déclenchent pas de mise à jour d'état React
- La source de vérité est le DOM

### Avantages

- Pas besoin de gérer un état local ou des gestionnaires d'événements pour chaque champ
- Moins de code
- Performances accrues : évite les re-rendus fréquents liés aux changements d'état

### Inconvénients

- Moins de contrôle : il est difficile de valider ou de synchroniser la valeur avec d'autres parties de l'application en temps réel.
- Plus complexe : cela nécessite l'utilisation de refs pour accéder à la valeur et interagir avec le DOM

---

# Composants non contrôlés

```typescript
import React, { useRef } from "react";

function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (inputRef.current) {
      alert(`Valeur soumise : ${inputRef.current.value}`);
    }
  };

  return (
    <div>
      <input type="text" ref={inputRef} />
      <button onClick={handleSubmit}>Soumettre</button>
    </div>
  );
}

export default UncontrolledInput;
```

---

# Composants contrôlés et non contrôlés

```typescript {*}{maxHeight:'400px'}
import React, { useState, useRef } from "react";

function HybridForm() {
  const [controlledValue, setControlledValue] = useState("");
  const uncontrolledRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    alert(`Contrôlé : ${controlledValue}, Non contrôlé : ${uncontrolledRef.current?.value}`);
  };

  return (
    <div>
      {/* Contrôlé */}
      <input
        type="text"
        value={controlledValue}
        onChange={(e) => setControlledValue(e.target.value)}
      />

      {/* Non contrôlé */}
      <input type="text" ref={uncontrolledRef} />

      <button onClick={handleSubmit}>Soumettre</button>
    </div>
  );
}

export default HybridForm;
```

---

# Alors, composants contrôlés ou non ?

### Composants contrôlés

Parfaits pour des formulaires riches avec validation et logique en temps réel

### Composants non contrôlés

Adaptés pour des cas simples où React ne doit pas gérer chaque détail