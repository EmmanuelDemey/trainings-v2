---
layout: cover
---

# Formulaire

---

# Formulaire

* Éléments permettant à l'utilisateur de saisir des données
* Plusieurs éléments disponibles : `form`, `input`, `checkbox`, `radio`, `textarea`, `select`, etc.
* Les formulaires sont essentiels pour l'interaction mais aussi une source majeure de problèmes d'accessibilité

---

# Formulaires - Types d'input

* Le standard HTML5 propose différents types d'input
    * text
    * email
    * number
    * range
    * date
* ...

---

# Formulaire - Label

* Nous devons associer un input de formulaire à un label

```html
<label for="firstName">FirstName</label>
<input id="firstName" />
```

---

# Formulaire - Label

```html
<label>
    FirstName
    <input />
</label>
```

---

# Formulaire - Label caché

* ⚠️ Ne jamais utiliser l'attribut `hidden` car le label ne sera pas détecté par les lecteurs d'écran
* Le problème se reproduit si nous utilisons les propriétés CSS `display: none` ou `visibility: hidden`
* Ces méthodes cachent aussi le contenu aux technologies d'assistance

```html
<label for="m" hidden>Label m</label>
<input id="m">
```

---

# Formulaire - Label caché visuellement

* Si vous souhaitez définir des labels cachés visuellement mais accessibles aux lecteurs d'écran, utilisez la classe `.sr-only` (vue dans le chapitre Rappels)

---

# Formulaire - ARIA Labels

* Vous pouvez également utiliser `aria-label` ou `aria-labelledby`
* ⚠️ **Important** : Ces deux attributs vont **surcharger** le label défini via la balise `<label>`
* Utilisez-les seulement quand c'est vraiment nécessaire

```html
<input aria-label="firstName">
```

---

# Formulaire - Label

```html
<p id="firstNameLabel">FirstName</p>
<input aria-labelledby="firstNameLabel">
```

---

# Formulaire - Label : Quel choix ?

* **Arbre de décision** pour choisir la bonne approche :
    1. ✅ **Préféré** : Utilisez `<label>` (toujours en premier choix)
    2. Si label visible mais ailleurs dans la page → `aria-labelledby`
    3. Si label caché mais internationalisable → `<label>` + classe `.sr-only`
    4. Si label programmatique uniquement → `aria-label` (non internationalisable)

* **Ordre de priorité** : `<label>` > `aria-labelledby` > `aria-label` > `placeholder`

---

# Formulaire - Autocomplete

* Nous pouvons activer un mécanisme d'autocomplétion
* Se base sur les données que votre utilisateur a insérées précédemment (navigateur)
* Utilisation de l'attribut `autocomplete`
* **WCAG 1.3.5** (niveau AA) : aide les utilisateurs à remplir les formulaires plus facilement
* Particulièrement utile pour les personnes avec déficiences cognitives

---

# Formulaire - Autocomplete

```html
<label for="frmNameA">Name</label>
<input type="text" name="name" id="frmNameA"
  placeholder="Full name" required autocomplete="name">

<label for="frmEmailA">Email</label>
<input type="email" name="email" id="frmEmailA"
  placeholder="name@example.com" required autocomplete="email">

<label for="frmPhoneNumA">Phone</label>
<input type="tel" name="phone" id="frmPhoneNumA"
  placeholder="+1-555-555-1212" required autocomplete="tel">
```

---

# Formulaire - Autocomplete pour mots de passe

* Nous pouvons également demander au navigateur de générer un mot de passe sécurisé
* Améliore la sécurité et l'expérience utilisateur

```html
<input type="password" autocomplete="new-password" id="new-password" />
```

* Valeurs courantes :
    * `current-password` : pour la connexion
    * `new-password` : pour la création/modification

---

# Fieldset

* La balise `<fieldset>` permet de regrouper des ensembles de champs de formulaire liés
* **Obligatoire** : définir un libellé via l'élément `<legend>`
* **WCAG 1.3.1** (niveau A) : Information et relations
* Cas d'usage :
    * groupes de boutons radio (obligatoire)
    * groupes de checkboxes
    * ensemble de champs liés (adresse, coordonnées bancaires)

---

# Fieldset

```html
<fieldset>
    <legend>Select your pizza toppings:</legend>
    <input id="ham" type="checkbox" name="toppings" value="ham">
    <label for="ham">Ham</label><br>
    <input id="pepperoni" type="checkbox" name="toppings" value="pepperoni">
    <label for="pepperoni">Pepperoni</label><br>
</fieldset>
```

---

# Fieldset

```html
<fieldset>
    <legend>Choose a shipping method:</legend>
    <input id="overnight" type="radio" name="shipping" value="overnight">
    <label for="overnight">Overnight</label><br>
    <input id="twoday" type="radio" name="shipping" value="twoday">
    <label for="twoday">Two day</label><br>
</fieldset>
```

---

# Datalist

* Élément HTML natif permettant de créer un système d'autocomplétion
* Alternative accessible aux plugins JavaScript complexes
* Bien supporté par les navigateurs modernes

```html
<label for="ice-cream-choice">Choose a flavor:</label>
<input list="ice-cream-flavors" id="ice-cream-choice" name="ice-cream-choice" />

<datalist id="ice-cream-flavors">
    <option value="Chocolate">
    <option value="Coconut">
    <option value="Mint">
    <option value="Strawberry">
    <option value="Vanilla">
</datalist>

```

---

# Informations Complémentaires

* Si nous souhaitons ajouter des informations complémentaires (aide, format attendu), utilisez l'attribut `aria-describedby`
* Différent de `aria-labelledby` : décrit au lieu de nommer
* Le contenu référencé sera lu après le label par les lecteurs d'écran

```html
<label for="email">Your email</label>
<input type="email" id="email"
        aria-describedby="emailHint">
<p class="hint" id="emailHint">
    Vous devez insérer un email valide
</p>
```

---

# Formulaires - Champs obligatoires

* Pour définir qu'un champ est obligatoire, nous avons deux possibilités :
    * `required` : validation HTML5 native (recommandé)
    * `aria-required="true"` : indication sémantique uniquement
* **Différence** : `required` déclenche la validation native du navigateur avec messages d'erreur
* **Bonne pratique** : utiliser `required` + indicateur visuel (astérisque, texte "obligatoire")

---

# Formulaires - Gestion des erreurs

* **WCAG 3.3.1** (niveau A) : Identification des erreurs
* **WCAG 3.3.3** (niveau AA) : Suggestion d'erreurs
* **Bonnes pratiques** :
    * Afficher les erreurs au plus près du champ concerné
    * Utiliser `aria-describedby` pour lier l'erreur au champ
    * Utiliser `aria-invalid="true"` quand il y a une erreur
    * Mettre le focus sur le premier champ en erreur après validation
    * Fournir un résumé des erreurs en haut du formulaire
* `aria-errormessage` existe mais support limité (préférer `aria-describedby`)


```html
<label for="email">Your email</label>
<input type="email" id="email" aria-invalid="true" aria-describedby="emailHint">
<p class="hint" id="emailHint">Invalid email address.</p>
```

---

# Formulaires - Types d'input modernes

* **Utilisez les types d'input appropriés** pour améliorer l'expérience mobile :
    * `type="email"` : affiche @ sur le clavier mobile
    * `type="tel"` : affiche le pavé numérique
    * `type="url"` : affiche .com et / sur le clavier
    * `type="number"` : pour les valeurs numériques
    * `type="date"`, `type="time"` : sélecteurs natifs
* Validation native + UX améliorée

---

# Formulaires - Récapitulatif

* ✅ **Tous les champs** doivent avoir un `<label>` associé
* ✅ Utiliser `<fieldset>` et `<legend>` pour grouper les champs liés
* ✅ Ajouter `autocomplete` pour faciliter la saisie
* ✅ Indiquer clairement les champs **obligatoires**
* ✅ Afficher les **erreurs** clairement avec `aria-invalid` et `aria-describedby`
* ✅ Utiliser les **types d'input** appropriés
* ✅ Tester la navigation **au clavier** (Tab, Entrée)

---
layout: cover
---

# Mise en Pratique

---
layout: cover
---

# PW