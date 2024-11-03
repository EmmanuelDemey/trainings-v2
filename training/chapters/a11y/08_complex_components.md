---
layout: cover
---

# Les composants complexes

---

# Les composants complexes

* Nous allons à présent travailler sur des composants/patterns complexes
    * Tooltip
    * Tabs
    * Modales
    * Tree
    * Alertes
    * Video / Audio

---

# Tooltip

* Les tooltips sont souvent gérés via le `hover` d'un événement
* Pas utilisable pour les utilisateurs de clavier.

```html
<label>
  Email
  <input aria-describedby="tooltip"/>
</label>
<button> ? </button>
<span id="tooltip" hidden>explanation</span>
```

---

# Tooltip

```html
const tooltip = document.querySelector('#tooltip');
const button = document.querySelector('button')

button.addEventListener('mouseover', () => {
  tooltip.removeAttribute('hidden')
})

button.addEventListener('click', () => {
  tooltip.toggleAttribute('hidden')
})

button.addEventListener('mouseout', () => {
  tooltip.setAttribute('hidden', '')
})
```

---

# Les Tabs

* Pour implémenter un système de `tab` accessible, nous allons utiliser les roles `tablist`, `tab` et `tab-panel`.
* Nous allons indiquer que chaque onglet controle un panel
* Nous définirons l'état d'un tab : sélectionné ou pas .

---

# Les Tabs

```html
<div>
  <div role="tablist" aria-label="Fruits">
    <button role="tab" aria-selected="true" aria-controls="apples-tab" id="apples">Apples</button>
    <button role="tab" aria-selected="false" aria-controls="oranges-tab" id="oranges" tabindex="-1">
        Oranges
    </button>
  </div>

  <div role="tabpanel" id="apples-tab" aria-labelledby="apples">
    <p>Apples tab content</p>
  </div>

  <div role="tabpanel" id="oranges-tab" aria-labelledby="oranges">
    <p>Oranges tab content</p>
  </div>
</div>
```

---

# Les modales

```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-heading">
  <h1 id="modal-heading">Confirmation</h1>

  <p>Are you sure you want to discard all of your notes?</p>

  <div>
    <button type="button">No</button>
    <button type="button">Yes</button>
  </div>
</div>
```

---

# Les modales

```html
<div role="dialog" aria-modal="true" aria-label="Confirmation">

  <p>Are you sure you want to discard all of your notes?</p>

  <div>
    <button type="button">No</button>
    <button type="button">Yes</button>
  </div>
</div>
```

---

# Les Modales

* `role="dialog"`
* `aria-modal`
* `aria-label`
* `aria-labelledby`

---

# Les Modales

* Une fois la modale mise en place nous devons s'assurer du bon fonction de certains comportements.

* À l'ouverture de la modale :
    * Le `focus` doit étre mis sur le premier champs focusable de la modale
    * Seuls les éléments de la modale doit être `focusable`
    * Il est possible de fermer la fenêtre avec la touche `Echap`

* À la fermeture de la modale :
    * Le `focus` doit revenir au niveau de l'élément à l'origine de l'ouverture de la modale.

---

# Exemple complet

```html
<button class="open-modal">Ouvrir la modal</button>

<div role="dialog" aria-modal="true" aria-labelledby="modal-heading">
      <h1 id="modal-heading">Confirmation</h1>
      <form>
        <label>User <input /></label>
        <label>Password <input type="password"/></label>
        <button>Sign Up</button>
      </form>
</div>

<div class="modal-overlay"></div>
```

---

# Exemple complet

```javascript
let focustedElementBeforeModal;

const modal = document.querySelector('[role="modal"]')'
const modalOverlay = document.querySelector('.modal-overlay');
const modalToggle = document.querySelector('.open-modal');
modalToggle.addEventListener('click', openModal);
```

---

# Exemple complet

```javascript
function openModal(){
    focustedElementBeforeModal = document.activeElement;

    modal.addEventListener('keydown', tabKeyHandler);
    modalOverlay.addEventListener('click', closeModal);

    const button = modal.querySelector('button');
    button.addEventListener('click', closeModal);

    ...
```

=== Exemple complet

```javascript
    ...

    const focusableElementSelectors = 'a[href], button, input:not[disabled]';
    let focusableElements = modal.querySelectorAll(focusableElementSelectors);
    focusableElements = Array.prototype.slice.call(focusableElements);

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    ...
```

---

# Exemple complet

```javascript
    ...

    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
    firstFocusableElement.focus();
    ...
```

---

# Exemple complet

```javascript
    ...

    function tabKeyHandler(e){
        if(e.keyCode === 9){
            if(e.shiftKey){
                if(document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                if(document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }

        if(e.keyCode === 27){
            closeModal();
        }
    }
    ...
```

---

# Exemple complet

```javascript
    ...

    function closeModal(e){
        modal.style.display = 'none';
        modalOverlay.style.display = 'none';
        focustedElementBeforeModal.focus();
    }
    ...
```

---

# L'attribut Inert

* Dans les prochaines versions des navigateurs, nous allons avoir l'attribut `inert`
* Cet attribut permet de supprimer les événements utilisateur d'un élément
* Possibilité d'utiliser le `polyfill` *WICG/inert*

```html
<div>
  <button>I am not inert</button>
</div>
<div inert>
  <button>I am inert</button>
</div>
```

---

# Panneau dépliant

```html
<button aria-controls="panel" aria-expanded="true">Expand</button>
<div id="panel">
    ... contenu
</div>
```

---

# Tree

* Nous n'avons pas d'éléments `tree` dans la spécification HTML.
* Nous allons utiliser les attributs ARIA suivant :
    * `role=tree`
    * `role=treeitem`
    * `aria-expanded=true/false`
* Et ajouter du JavaScript

---

# Tree

```html
<ul role="tree">
    <li role="treeitem" aria-expanded="true"> ... </li>
    <li role="treeitem" aria-expanded="false"> ... </li>
</ul>
```

---

# Alertes

* Une alerte correspond à
    * une zone qui est dynamiquement mise à jour
    * qui doit être lue automatiquement dès qu'elle est modifiée.
* Pour cela nous allons utiliser les *aria-live region*

---

# Alertes

* Nous devons ajouter le role *alert* à notre élément HTML
* L'ajout de ce role va le transformer en *aria-live region*

``html
<section role="alert"> Voici le message </section>
```

---

# Alertes

* Il faut laisser le temps à vos utilisateurs de voir/entendre le contenu
    * Éviter les alertes qui disparraissent rapidement.
    * Ou attendre la lecture par le synthétiseur vocal
    * Ou mettre en place un système d'acquittement

---

# Alertes

* Pour des raisons de compatibilité, il est nécessaire que la zone ne soit pas ajouter dynamiquement.

```html
<section role="alert"></section>
<button>Valider</button>
```

---

# Alertes

```javascript
document.querySelector('button').addEventListener('click', () => {
    const alert = document.querySelector("[role='alert']")
    alert.innerHTML = "voici mon contenu"
});
```

---

# Alertes

* Deux types de régions :
    * `assertive` (valeur par défaut)
    * `polite`

```html
<section role="alert" aria-live="assertive"></section>
<section role="alert" aria-live="polite"></section>
```

---

# Videos

* Nécessiteé de définir des transcriptions des vidéos

```html
<video class="span12 readable" poster="your-video-poster.jpg" controls title="My Movie">
  <source src="your-video.m4v" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
  <source src="your-video.ogg" type='application/ogg' />
  <source src="your-video.webm" type='video/webm' />
  <track src="your-video-transcript.vtt" label="English Captions" kind="subtitles" srclang="en-us" default />
</video>
```

---

# Videos

* Différents formats sont disponibles :
    * VTT
    * TTML
    * SRT

---

# Videos - VTT

```
WEBVTT

1
00:00:09.000 --> 00:00:11.000
<b>Alice:</b> Curiouser and curiouser.

2
00:00:17.000 --> 00:00:18.000
<b>Rabbit:</b> I told you she was the right Alice!

3
00:00:19.000 --> 00:00:20.000
<b>Mouse:</b> I am not convinced.
```

---

# Videos - TTML

```
<tt xmlns="http://www.w3.org/ns/ttml" xml:lang="en">
  <body>
    <div>
      <p begin="00:00:9.00" end="00:00:11.00">
        Alice: Curiouser and curiouser.
      </p>
      <p begin="00:00:17:00" end="00:00:18:00">
        Rabbit: I told you she was the right Alice!
      </p>
    </div>
  </body>
</tt>
```

---

# Audio et Video

* Vidéo
    * Mettre en place des sous-titres
    * Mettre en place des transcriptions
    * Inclure un version en langage des signes

* Audio
    * Mettre en place des transcriptions
    * Inclure un version en langage des signes

---

# PW