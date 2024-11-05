---
layout: cover
---

# Conclusion

---

# Conclusion

- L'accessibilité ne doit pas étre une contrainte
- Toujours privilégier les éléments HTML natifs plutôt qu'une surcouche
- Prenez l'habitude d'écrire du code HTML sémantique
- Auditer souvant vos applications
- Apprenez de vos erreurs.

---

# Bonnes pratiques

- Dans de vrais projets, nous recommendons :
  - l'utilisation d'un Design System afin de documenter vos composants
  - d'intégrer l'accessibilité dans vos composants Angular, React, ...
  - de mettre en place des points de contrôles réguliers afin de s'assurer de la qualité du projet

```javascript
class SwitchButton extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "switch");
    this.setAttribute("aria-checked", "false");
    this.setAttribute("tabindex", "0");
  }
}
```

---

# Librairies Utilitaires

- https://allyjs.io/[Ally.js]

---

# Liens complémentaires

- https://www.udacity.com/course/web-accessibility--ud891[Udemy Web Accessibility Course]
- https://www.youtube.com/watch?v=Th-nv-SCj4Q&list=PLNYkxOF6rcIDKuCU73tmdRN_-mI3tKFPD&index=14[Debugging accessibility with Chrome DevTools]
