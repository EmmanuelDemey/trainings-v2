---
layout: cover
---

# 3 - Tests unitaires

---

# Tests unitaires

- Pour l'écriture des tests unitaires, nous conseillons deux librairies :
- **Vitest**:
  - Pour la structuration de la suite de tests
  - Pour les mocks
  - Pour les assertions
- **@testing-library** pour la génération d'un composant React

---

# Vitest

- Vitest propose des méthodes permettant de structurer une suite de tests

```typescript
import { describe, it } from 'vitest';

describe('<MyComponent />', () => {
    describe('state 1', () => {
        it('should be hidden', () => {
            ...
        });
        it('should be focusable', () => {
            ...
        });
    })
    it('should display this HTML', () => {
        ...
    });
})
```

---

# Vitest

- Nous avons la possibilité des définir des fonctions de "configuration"

```typescript
import { describe, beforeEach, afterEach } from 'vitest';

describe('<MyComponent />', () => {
    describe('state 1', () => {
        beforeEach(() => {
            ...
        })

        afterEach(() => {
            ...
        })
    })
})
```

---

# Vitest - Assertions

- Nous allons ensuite utiliser des **assertions** afin de vérifier le résultat de notre code.

```typescript
import { getUser } from './user';
import { describe, it, expect } from 'vitest';

describe('getUser', () => {
   it('should return the current user', () => {
      expect(1 + 2).toBe(3)
   })
})
```

---

# Vitest - mocks

- Utilisation des mocks pour modifier l'implementation d'une méthode (dans le but de créer de vrais tests unitaires)
- Utilisation des **spies** pour s'assurer qu'une méthode a bien été appelée

```typescript
import get from './list';
import api from 'js/remote-api/api';
import { describe, it, vi, expect } from 'vitest';

const dispatch = jest.fn();
vi.mock('js/remote-api/api');

describe('Api', () => {
	it('should call this action with the right payload', async () => {
		api.getData = function() {
			return [...];
		};
		await get(dispatch);

    expect(dispatch).toHaveBeenLastCalledWith({
			type: 'LOAD_SUCCESS',
			payload: { results: [ ... ] },
		});
	});
});
```

---

# Snapshot testing

- Permet de prendre un instantané d'un composant
- Cet instantané sera sauvegardé et versionné dans votre projet
- Lors des prochains tests, il sera comparé avec le nouvel état du composant

```jsx
import React from "react";
import Link from "../Link.react";
import renderer from "react-test-renderer";
import { expect, it } from 'vitest';

it("renders correctly", () => {
  const tree = renderer.create(<Link page="http://www.facebook.com">Facebook</Link>).toJSON();
  expect(tree).toMatchSnapshot();
});
```

---

# Snapshot testing

```
exports[`renders correctly 1`] = `
<a
  className="normal"
  href="http://www.facebook.com"
  onMouseEnter={[Function]}
  onMouseLeave={[Function]}
>
  Facebook
</a>
`;
```

---

# Vitest - Options

- `vitest`
- `vitest watch`
- `vitest run --coverage=true`
- CLI intéractive

---

# @testing-library

- Librairie utilitaire permettant de
  - générer l'HTML d'un composant React
  - de manipuler cet HTML pour faire des assertions

```typescript
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { expect, describe, it } from 'vitest';

describe("<Comment />", () => {
  it("should be disabled by default", () => {
    render(<Comment />);
    expect(screen.getByRole("button")).not.toHaveAttribute("disabled");
    //expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

# Émettre des événements

- Il est conseillé d'utiliser `@testing-library/user-event` pour les interactions utilisateurs

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, describe, it } from 'vitest';

describe("<Comment />", () => {
  it("type", async () => {
    render(<Comment />);
    
    const textbox = screen.getByRole("textbox");
    await userEvent.type(textbox, "Hello,{enter}World!");

    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });
});
```

---

# Comment structurer vos tests ?

- Afin de faciliter la maintenance de vos tests, vous pourriez suivre la structure suivante :

```typescript
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, describe, it } from 'vitest';

describe("<Comment />", () => {
  function renderToScreen() {
    render(<Comment />);
    return {
      textbox: screen.getByRole("textbox"),
      button: container.getByRole("button"),
    };
  }
  it("type", async () => {
    const { textbox, button } = renderToScreen();
    await userEvent.type(textbox, "Hello,{enter}World!");
    expect(button).not.toBeDisabled();
  });
});
```

---

# Matchers

- `toBeDisabled`
- `toBeEmpty`
- `toHaveClass`
- `toHaveFocus`
- `toHaveTextContent`
- `toHaveValue`
- ...

---
layout: cover
---

# Travaux Pratiques

## PW 3
