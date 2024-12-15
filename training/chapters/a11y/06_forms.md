---
layout: cover
---

# Formulaire

---

# Formulaire

* Élements permettant à l'utilisateur de saisir de la donnée.
* Plusieurs élements disponibles : form, input, checkbox, radio, textarea, ...

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

# Formulaire - Label

* Ne jamais utiliser la propriété `hidden` car le label ne sera pas détécté par les synthétiseurs vocaux.
* Le problème se reproduit si nous utilisons les propriétés CSS `display:none` ou `visibility:hidden`.

```html
<label for="m" hidden>Label m</label>
<input id="m">
```

---

# Formulaire - Label

* Si vous souhaitez définir des labels cachés, plutôt utiliser la déclaration CSS suivante.

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

---

# Formulaire - Label

* Vous pouvez également utiliser `aria-label` ou `aria-labelledby`.
* Ces deux attributs vont surcharger le label défini via la balise `label`.

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

# Formulaire - Label

* Comment faire le bon choix ?
    * Avez-vous besoin de ARIA ? -> `label`
    * Souhaitez-vous un label caché mais internationalisable ? -> label caché
    * Le label est défini ailleurs dans la page ? -> `aria-labelledby`
    * Sinon `aria-label`

---

# Formulaire - Autocomplete

* Nous pouvons activer un mécanisme d'autocompletion
* Se base sur les données que votre utilisateur à insérer sur d'autres sites
* Nous utiliserons l'attribute `autocomplete`.

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

# Formulaire - Autocomplete

* Nous pouvons également demander au navigateur de générer un mot de passe à notre place.

```html
<input type="password" autocomplete="new-password" id="new-password"
```

---

# Fieldset

* La balise `fieldset` permet de regrouper des ensembles de champs de formulaire
* Nous devons définir un libellé via l'element `legend`.
* Nous pouvons les utiliser pour :
    * des radios
    * des checkbox
    * des inputs manipulant la meme donnees.

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

* Composant permet de créer nativement un système minimaliste d'autocompletion.

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

* Si nous souhaitons mettre des informatiosn complémentaires, nous allons utiliser l'attribut `aria-describedby`.

```html
<label for="email">Your email</label>
<input type="email" id="email"
        aria-describedby="emailHint">
<p class="hint" id="emailHint">
    Vous devez insérer un email valide
</p>
```

---

# Formulaires - Champs obligatoire

* Pour définir qu'un champ est obligatoire, nous avons deux posibilités :
    * `required`
    * `aria-required`
* La différence se situe dans l'affichage d'un message d'erreur lors de l'utilisation de l'attribut `required`.

---

# Formulaires - Gestion des erreurs

* Pour l'affichage des erreurs de validation, il est préférable de les mettre au plus prêt de l'input.
* Vous pouvez utiliser les attributs **aria-describedby** et **aria-invalid** dynamiquement.
* Un attribut **aria-errormessage** existe, mais encore mal supporté.
* Une fois la validation faite, vous pouvez mettre le **focus** sur le premier champ en erreur.


```html
<label for="email">Your email</label>
<input type="email" id="email" aria-invalid="true" aria-describedby="emailHint">
<p class="hint" id="emailHint">Invalid email address.</p>
```

---
layout: cover
---

# PW