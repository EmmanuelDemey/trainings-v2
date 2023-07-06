---
layout: cover
---

# Tests unitaires

---

# Tests unitaires

* Pour l'écriture des tests unitaires, nous conseillons deux librairies :
* **Jest**:
  * Pour la structuration de la suite de tests
  * Pour les mocks
  * Pour les assertions
* **@testing-library** pour la génération d'un composant React

---

# Jest

* Jest propose des méthodes permettant de structurer une suite de tests

```typescript
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

# Jest

* Nous avons la possibilité des définir des fonctions de "configuration"

```typescript
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

# Jest - mocks

* Utilisation des mocks pour modifier l'implementation d'une méthode
* Utilisation des `spies` pour s'assurer qu'une méthode a bien été appelée

---

# Jest - mocks

```typescript
import get from './list';
import api from 'js/remote-api/api';

const dispatch = jest.fn();
jest.mock('js/remote-api/api');

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

* Permet de prendre un instantané d'un composant
* Cet instantané sera sauvegardé et versionné dans votre projet
* Lors des prochains tests, il sera comparé avec le nouvel état du composant

---

# Snapshot testing

```jsx
import React from 'react';
import Link from '../Link.react';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer
    .create(<Link page="http://www.facebook.com">Facebook</Link>)
    .toJSON();
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

# Jest - Options

* `jest`
* `jest --watchAll`
* `jest --coverage=true`
* CLI intéractive

---

# @testing-library

* Librairie utilitaire permettant de
  * générer l'HTML d'un composant React
  * de manipuler cet HTML pour faire des assertions

```typescript
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

describe('<Comment />', () => {
  it('should be disabled by default', () => {
    render(<Comment />);
    expect(screen.getByRole('button')).not.toHaveAttribute('disabled')
    //expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

# Émettre des événements

* Il est conseillé d'utiliser `@testing-library/user-event` pour les interactions utilisateurs

```typescript
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('<Comment />', () => {
    it('type', async () => {
      render(<Comment />)
      await userEvent.type(textbox, 'Hello,{enter}World!')
      expect(button).not.toBeDisabled();
    })
});
```

---

# Structuration

* Afin de faciliter la maintenance de vos tests, vous pourriez suivre la structure suivante :

```typescript
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('<Comment />', () => {
    function renderToScreen(){
        render(<Comment />)
        return {
            textbox: screen.getByRole('textbox'),
            button: container.getByRole('button')
        }
    }
    it('type', async () => {
      const {textbox, button} = renderToScreen();
      await userEvent.type(textbox, 'Hello,{enter}World!')
      expect(button).not.toBeDisabled();
    })
});
```

---

# Matchers

* `toBeDisabled`
* `toBeEmpty`
* `toHaveClass`
* `toHaveFocus`
* `toHaveTextContent`
* `toHaveValue`
* ...

---

# Script NPM

```json
{
  "scripts": {
    "test": "react-scripts test",
    "test:ci": "npm run test -- --watchAll=false"
  }

}
```

---
layout: cover
---

# Travaux Pratiques
