---
layout: cover
---

# State Container Recoil

---

* développé par Meta
* permet d'extraire les états locaux des composants (y compris ceux exploités par les context)
* implémentation légère et efficiente

---

# Recoil root

Wrapper l'application avec le provider recoil :

```typescript
import React from 'react';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';

function App() {
  return (
    <RecoilRoot>
      <CharacterCounter />
    </RecoilRoot>
  );
}
```

---

# Définir un morceau d'état (atom)

Créer un / des morceau(x) d'état :

```typescript
const textState = atom({
  key: 'textState', // unique ID (with respect to other atoms/selectors)
  default: '', // valeur par défaut (alias valeur initials)
});
```

---

# Accès aux états depuis les composants

Créer un / des morceau(x) d'état :

```typescript
function MyComponent() {
  const [text, setText] = useRecoilState(textState);

  const onChange = (event) => {
    setText(event.target.value);
  };

  return (
    <div>
      <input type="text" value={text} onChange={onChange} />
      <br />
      Echo: {text}
    </div>
  );
}
```

---

# Sélecteurs

Il est possible de définir des états dérivés à mettre à disposition des composants :

```typescript
const charCountState = selector({
  key: 'charCountState', // unique ID (with respect to other atoms/selectors)
  get: ({get}) => {
    const text = get(textState);

    return text.length;
  },
});
```

```typescript
function CharacterCount() {
  const count = useRecoilValue(charCountState);
  return <>Character Count: {count}</>;
}
```

---
layout: cover
---

# Travaux Pratiques

## WP 19
