---
layout: cover
---

# Frameworks et Bibliothèques

---

# Accessibilité dans les Frameworks

* Les frameworks JavaScript modernes peuvent aider... ou nuire à l'accessibilité
* **Attention** : Un framework n'est pas accessible par défaut
* Vous devez **toujours** appliquer les bonnes pratiques

---

# Pièges courants avec les frameworks

* ❌ **SPA (Single Page Application)** : perte de la navigation native
    * Le changement de "page" n'est pas annoncé
    * L'historique peut être cassé
    * Le focus n'est pas géré

* ❌ **Composants custom** : réinventent la roue
    * Boutons en `<div>`
    * Links en `<span>`
    * Formulaires custom non accessibles

* ❌ **Client-side rendering** : contenu non disponible immédiatement
    * Problème pour les lecteurs d'écran
    * SEO impacté

---

# Bonnes pratiques - SPA

**1. Annoncer les changements de page**

```javascript
// React example
useEffect(() => {
  // Mettre à jour le titre
  document.title = `${pageTitle} - Mon App`;

  // Annoncer le changement via aria-live
  const announcement = document.getElementById('route-announcer');
  announcement.textContent = `Navigation vers ${pageTitle}`;
}, [location]);
```

```html
<!-- Ajoutez cet élément dans votre HTML -->
<div
  id="route-announcer"
  aria-live="assertive"
  aria-atomic="true"
  className="sr-only"
></div>
```

---

# Bonnes pratiques - SPA

**2. Gérer le focus lors du changement de route**

```javascript
// React Router v6
import { useLocation, useNavigate } from 'react-router-dom';

function App() {
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    // Mettre le focus sur le contenu principal
    mainRef.current?.focus();

    // Scroll en haut
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <main ref={mainRef} tabIndex={-1}>...</main>;
}
```

---

# React et l'accessibilité

## Ressources officielles React

* [React Accessibility Guide](https://react.dev/learn/accessibility)
* **JSX** : supporte tous les attributs ARIA

```jsx
<div
  role="button"
  tabIndex={0}
  aria-pressed={isPressed}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  {label}
</div>
```

* **Fragment** : évite les `<div>` inutiles

```jsx
<>
  <label htmlFor="name">Nom</label>
  <input id="name" type="text" />
</>
```

---

# React - Hooks utiles

```javascript
// Hook pour gérer le focus
function useFocusTrap(ref) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleTab(e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }

    element.addEventListener('keydown', handleTab);
    return () => element.removeEventListener('keydown', handleTab);
  }, [ref]);
}
```

---

# React - Bibliothèques accessibles

## **React Aria (Adobe)**

* Hooks pour créer des composants accessibles
* Pas de style : vous gardez le contrôle total
* Basé sur WAI-ARIA Practices

```jsx
import { useButton } from '@react-aria/button';

function MyButton(props) {
  let ref = useRef();
  let { buttonProps } = useButton(props, ref);

  return <button {...buttonProps} ref={ref}>{props.children}</button>;
}
```

* **Site** : https://react-spectrum.adobe.com/react-aria/

---

# React - Bibliothèques accessibles

## **Radix UI**

* Composants headless accessibles
* Styling avec votre méthode préférée
* Excellente qualité d'accessibilité

```jsx
import * as Dialog from '@radix-ui/react-dialog';

function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Ouvrir</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Titre</Dialog.Title>
          <Dialog.Description>Description</Dialog.Description>
          <Dialog.Close>Fermer</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

* **Site** : https://www.radix-ui.com/

---

# React - Bibliothèques accessibles

## **shadcn/ui**

* Collection de composants réutilisables
* Basé sur Radix UI
* Vous copiez le code dans votre projet

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

* **Site** : https://ui.shadcn.com/

## **Headless UI**

* Par les créateurs de Tailwind CSS
* Composants unstyled et accessibles

* **Site** : https://headlessui.com/

---

# React - Testing Library

* **@testing-library/react** : teste l'accessibilité

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('le bouton est accessible', async () => {
  render(<MyButton>Click me</MyButton>);

  // Utilise les queries accessibles
  const button = screen.getByRole('button', { name: /click me/i });

  // Teste l'interaction
  await userEvent.click(button);

  expect(button).toHaveAttribute('aria-pressed', 'true');
});
```

* Encourage les bonnes pratiques d'accessibilité
* **Site** : https://testing-library.com/

---

# Vue.js et l'accessibilité

## Ressources officielles Vue

* [Vue Accessibility Guide](https://vuejs.org/guide/best-practices/accessibility.html)
* **Template** : supporte les attributs ARIA

```vue
<template>
  <button
    :aria-pressed="isPressed"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    {{ label }}
  </button>
</template>
```

---

# Vue - Bibliothèques accessibles

## **Headless UI for Vue**

```vue
<template>
  <Dialog v-model:open="isOpen">
    <DialogPanel>
      <DialogTitle>Titre</DialogTitle>
      <DialogDescription>Description</DialogDescription>
      <button @click="isOpen = false">Fermer</button>
    </DialogPanel>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/vue';

const isOpen = ref(false);
</script>
```

* **Site** : https://headlessui.com/vue/

---

# Vue - Bibliothèques accessibles

## **PrimeVue**

* Bibliothèque de composants complète
* Bonne accessibilité out-of-the-box
* Thèmes personnalisables

```vue
<template>
  <Dialog v-model:visible="visible" header="Titre" :modal="true">
    <p>Contenu du dialogue</p>
    <template #footer>
      <Button label="Non" @click="visible = false" />
      <Button label="Oui" @click="visible = false" autofocus />
    </template>
  </Dialog>
</template>
```

* **Site** : https://primevue.org/
* **Accessibilité** : https://primevue.org/accessibility/

---

# Angular et l'accessibilité

## Angular CDK (Component Dev Kit)

* Outils pour créer des composants accessibles
* Gestion du focus, keyboard, overlay, etc.

```typescript
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  template: `
    <div cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
      <button cdkFocusInitial>Premier élément</button>
      <button>Deuxième élément</button>
      <button>Dernier élément</button>
    </div>
  `
})
export class MyComponent {}
```

* **Site** : https://material.angular.io/cdk/a11y/overview

---

# Angular - Bibliothèques accessibles

## **Angular Material**

* Bibliothèque officielle de composants
* Accessibilité intégrée
* Basée sur Material Design

```typescript
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  template: `
    <button mat-button (click)="openDialog()">Ouvrir</button>
  `
})
export class MyComponent {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(MyDialogComponent);
  }
}
```

* **Site** : https://material.angular.io/
* **Accessibilité** : Conforme WCAG 2.1 AA

---

# Angular - Directives utiles

```typescript
// Focus initial
<input cdkFocusInitial />

// Moniteur de focus
import { FocusMonitor } from '@angular/cdk/a11y';

constructor(private focusMonitor: FocusMonitor, private el: ElementRef) {
  this.focusMonitor.monitor(this.el, true).subscribe(origin => {
    console.log('Focus origin:', origin); // 'mouse' | 'keyboard' | 'touch' | 'program'
  });
}

// Live announcer
import { LiveAnnouncer } from '@angular/cdk/a11y';

constructor(private liveAnnouncer: LiveAnnouncer) {}

announce(message: string) {
  this.liveAnnouncer.announce(message, 'polite');
}
```

---

# Svelte et l'accessibilité

* **a11y warnings** : Svelte avertit des problèmes d'accessibilité

```svelte
<!-- Svelte vous alertera si l'alt est manquant -->
<img src="photo.jpg" />

<!-- ✅ Correct -->
<img src="photo.jpg" alt="Description" />

<!-- ❌ Svelte vous alertera -->
<div on:click={handleClick}>Cliquable</div>

<!-- ✅ Correct -->
<button on:click={handleClick}>Cliquable</button>
```

---

# Web Components accessibles

* **Lit** : framework moderne pour Web Components

```javascript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-button')
class MyButton extends LitElement {
  @property({ type: Boolean }) pressed = false;

  render() {
    return html`
      <button
        role="button"
        aria-pressed="${this.pressed}"
        @click="${this._handleClick}"
      >
        <slot></slot>
      </button>
    `;
  }

  _handleClick() {
    this.pressed = !this.pressed;
  }
}
```

* **Site** : https://lit.dev/

---

# Outils de test d'accessibilité

## **Jest + jest-axe**

```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

# Outils de test d'accessibilité

## **Cypress + cypress-axe**

```javascript
describe('Accessibilité', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('n\'a pas de violations d\'accessibilité', () => {
    cy.checkA11y();
  });

  it('vérifie un élément spécifique', () => {
    cy.checkA11y('.my-component');
  });
});
```

---

# Outils de test d'accessibilité

## **Storybook + Accessibility Addon**

```javascript
// .storybook/main.js
module.exports = {
  addons: ['@storybook/addon-a11y'],
};
```

* Teste l'accessibilité directement dans Storybook
* Rapport visuel des violations
* Tests automatiques avec axe-core

* **Site** : https://storybook.js.org/addons/@storybook/addon-a11y

---

# Design Systems accessibles

## Exemples de design systems accessibles

* **GOV.UK Design System** : https://design-system.service.gov.uk/
* **U.S. Web Design System** : https://designsystem.digital.gov/
* **Material Design** : https://m3.material.io/foundations/accessible-design
* **Carbon Design System (IBM)** : https://carbondesignsystem.com/guidelines/accessibility/overview
* **Atlassian Design System** : https://atlassian.design/foundations/accessibility

---

# Checklist - Framework

Avant de choisir un framework ou une bibliothèque :

* ✅ Vérifier la documentation sur l'accessibilité
* ✅ Tester les composants avec un lecteur d'écran
* ✅ Vérifier le support du clavier
* ✅ Consulter les issues GitHub sur l'accessibilité
* ✅ Vérifier si des audits a11y ont été réalisés
* ✅ Regarder les exemples de code pour les attributs ARIA

**Règle d'or** : Un framework qui ne mentionne pas l'accessibilité ne la prend probablement pas au sérieux.

---

# Ressources - Frameworks

* **React Aria** : https://react-spectrum.adobe.com/react-aria/
* **Radix UI** : https://www.radix-ui.com/
* **Headless UI** : https://headlessui.com/
* **Angular CDK** : https://material.angular.io/cdk/
* **Inclusive Components** : https://inclusive-components.design/
* **A11y Style Guide** : https://a11y-style-guide.com/

---
layout: cover
---

# Questions ?
