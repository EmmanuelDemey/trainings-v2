---
layout: cover
---

# HTML

---
layout: statement
---

De manière générale, utilisez toujours la balise HTML qui est dédiée à l'interraction que vous souhaitez implémenter.

---

# HTML

* Pour développer un site web :
    * ecrivez tout d'abord le code HTML
    * ajoutez le style ensuite avec du CSS
    * enfin dynamisez avec du Javascript.
* Pour s'assurer que les fondations de votre page sont bonnes. 

---


# HTML - Les bases

* Nous devons définir un *DOCTYPE* valide pour chaque page
* Ainsi qu'un *encoding*

```html
<!doctype html>
<html>
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      ...
      <!-- Le contenu -->
      ...
    </body>
</html>
```

---

# Langue

* Nous devons définir la langue du document dans la balise *html*.
* Ceci aura un impact sur :
    * l'accent utilisé par les synthétiseurs vocaux
    * la traduction
    * l'auto correction

```html
<html lang="en">
...
</html>
```

---

# Langue

* Cette propriété sera également utilisée pour l'utilisation de l'attribut CSS *hyphens*

```css
p {
    hyphens: auto;
}
```

---


# Langue

* Si une partie du site utilise une autre langue, vous pouvez utiliser cette même propriété sur l'ensemble des éléments HTML.

```html
<div lang="en">
...
</div>
```

---


# Identifiants

* La propriété *id* d'un élément doit être unique.
* Quand vous développez des composants avec un framework, éviter de mettre des identifiants dans vos composants, car vous ne savez pas combien de fois votre composant va être utilisé dans la page.
* À ne pas faire !

```html
<input id="name" name="lastName"/>
<input id="name" name="firstName"/>
```

---


# Landmarks

![Lens](/images/a11y/landmarks.png)

---


# Landmarks

* Depuis HTML5, de nouvelles balises sont disponibles afin de structure une page
    * header
    * search (tout nouveau)
    * nav
    * main
    * aside
    * footer

---


# Landmarks

```html
<header>
    <h1> Titre de l'application</h1>
    <nav> <ul> ... </ul> </nav>

    <search>
        <label>
           Search For 
           <input type="search">
        </label>
        <button>Go</button>
    </search>
</header>
<aside> ... </aside>
<main> ... </main>
<footer> ... </footer>
```

---

# Landmarks

* Pour des raisons de compatibilité navigateur, vous serez peut-être obligé d'ajouter des attributs `role`.

```html
<header role="banner">
    <h1> Titre de l'application</h1>
    <nav role="navigation"> ... </nav>
</header>
<aside role="contentinfo"> ... </aside>
<main role="main"> ... </main>
<footer role="footer"> ... </footer>
```

---

# Landmarks

* Ces landmarks permettent de définir un squelette à votre application
* Ces éléments permettent de définir un structure claire pour votre page.
* Contenu plus facilement accessible via raccourcis par certains utilisateurs

---

# Titre

* Le titre de la page peut être défini soit
    * via l'élément `title`
    * via l'élément `h1`
* Il doit être unique à travers les différentes pages,
* Pratiques :
    * `[SITE NAME]` pour les page d'accueil
    * `[PAGE NAME] - [SITE NAME]` pour les autres pages

---

# Titre

* Le moyen le plus utilisé pour naviguer sur un site se fait via les titres
* Les titres doivent être dans un ordre logique
    * Comme lors de l'écriture d'un document Word
    * Toujours dans un ordre croissant : h1 -> ... -> h6
    * Ne pas oublier un niveau (*INTERDIT* h1 -> h3)

```javascript
const headings = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
for(let i=0; i < headings.length; i++){
   console.dir(headings[i])
}
```

---


# Titre

* Si vous ne souhaitez pas de titre dans votre design
    * ajoutez tout de même la balise HTML
    * et cachez le en CSS (en le positionnant à l'extérieur du viewport)

---

# Balises sémantiques

* article : contenu pouvant étre utilisé en toute autonomie sur autre page
* section : regroupement de contenu homogène : `Top 5 articles`, ...

---


# NAV

* Element permettant de definir une zone de navigation
* Nous pouvons avoir plusieurs éléments `nav` par page
* Nécésitté de definir une alternative textuelle pour les différencier

```html
<nav aria-label="main menu">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/contact">Contact</a></li>
    </ul>
</nav>
```

---

# Navigation

* Nous devons définir quel item est actif (sur quelle page se trouve l'utilisateur)
* Deux choses à faire :
    * Ne pas mettre de lien
    * Utilisez l'attribut `aria-current`

---


# Navigation

```html
<nav aria-label="main">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/contact" aria-current="page">Contact</a></li>
    </ul>
</nav>
```

---

# Navigation imbriquée

* Si nous avons deux niveaux de menu

```html
<nav aria-label="main">
    <ul>
        <li><a href="/">Home</a></li>
        <li>
            <a aria-current="true" href="/mail">Messagerie</a>
            <ul>
                <<li><a href="/contact" aria-current="page">Contacts</a></li>
                <li><a href="/sendbox">Sendbox</a></li>
            </ul>
        </li>
    </ul>
</nav>
```

---

# Aria-current

* L'attribut `aria-current` peut également s'utiliser
    * dans un wizard pour définir l'étape en cours `aria-current=step`
    * dans un datepicker pour définir la date courante `aria-current=date`
    * dans un timepicker pour définir l'heure courante `aria-current=hour`

---

# L'élément Button

```html
<div onclick="" class="btn clickable"></div>
<a class="btn" onclick=""></a>


<div onclick=""
    class="btn"
    tabindex="0"
    role="button"></div>
```

---
layout: statement
---

<blockquote>
La balise button n'est pas stylisable
<p> Un développeur</p>
</blockquote>

---

# Button

* Nous sommes obligés d'ajouter des attributs supplémentaires
* Nécésitté d'écrire du code JavaScript pour gérer le `click` via le clavier
* L'état `disabled` n'est pas géré nativement.
* Le controle via la touche `espace` n'est pas géré.

---


# Lien

* Antipatterns

```html
<span onclick="goTo(...)"> ... </span>
<a onclick="goTo(...)"> ... </a>
<a href="#" onclick="goTo(...)"> ... </a>
<a href="page"><img src="..." /></a>
```

---


# Lien

* Ne s'affichera pas dans la liste des liens du `rotor` du synthétiseur vocal
* Ne fonctionnera pas au clavier
* Ne pourra être `bookmarkable`

---

# Learn More antipattern

```html
<p> Lorem Ipsum <a href="...">Learn more</a></p>

<p>
    Lorem Ipsum
    <a href="..." aria-label="Learn more about Lorem Ipsum">Learn more</a>
</p>
```
---

# Button / Lien

* Si le click redirige vers une nouvelle page -> Un lien
* Si le click exécute une action -> un bouton

---

# Styliser un boutton

* Sur mobile, s'assurer que la zone clickable est assez grande.
* Des fois, nous utilisons une `div` afin de styliser plus facilement.
* Le reset du style d'un boutton se limite à cette déclaration CSS

```html
button {
  background-color: rgba(255,255,255,0);
  padding: 0;
  border: none;
}
```

---

# Button

* Le type par défaut d'un bouton est le type `submit`
* Nous recommendons de définir le type à chaque fois.

```html
<button type="submit">...</button>
<button type="button">...</button>
<button type="reset">...</button>
```
---

# Images

* Une image doit absolument avoir une alternative textuelle

```html
<img src="" alt="Ceci est le logo de la sociéte" />
```

* Si c'est une image décorative, utilisez une alternative vide


```html
<img src="" alt="" />
```

---


# Images

* Essayez d'etre le plus explicite possible en ajoutant du context


```html
<img src="" alt="Ceci est le logo de la société" />
<img src="" alt="Logo" />
```


---


# Images

* Ce travail peut etre realise egalement pour les emoji.
* Ne pas utiliser les balises `<i>` comme certaines librairies


```html
<em role="img" aria-label="calendrier">📅</em>
<button aria-label="Ajouter"><em aria-hidden="true" class="bi bi-bag-plus"></i></button>
```

---


# Listes

* Nous avons deux types de listes
    * liste non-ordonnée
    * liste ordonnée
* Dès que vous devez afficher une liste de ..., utilisez l'un de ces éléments.
* Attention: la sémantique d'une liste est perdue sur Safari/VoiceOver si nous ajoutons le style `list-style: none`.


---


# Listes

* Liste  non-ordonnée

```html
<ul>
    <li>item</li>
    <li>item</li>
    <li>item</li>
</ul>
```

* Liste ordonnée

```html
<ol>
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
</ol>
```


---


# DL / DD / DT

* Éléments permettant de définir une liste de pairs
    * `dt`: terme
    * `dd`: définition
* Nous pouvons utiliser ces éléments comme :
    * Glossaire
    * Metadata

---

# DL / DD / DT

* Glossaire

```html
<dl>
  <dt>RSS</dt>
  <dd>An XML format for aggregating information from websites whose
    content is frequently updated.</dd>

  <dt>Weblog</dt>
  <dd>Contraction of the term "web log", a weblog is a
    website that is periodically updated, like a journal</dd>
</dl>
```

---

# DL / DD / DT

* Metadata

```html
<dl>
  <dt>Authors:</dt>
  <dd>Remy Sharp</dd>
  <dd>Rich Clark</dd>
  <dt>Editor:</dt>
  <dd>Brandan Lennox</dd>
  <dt>Category:</dt>
  <dd>Comment</dd>
</dl>
```

---

# Table

```html
<table>
    <caption>Average daily tea and coffee consumption</caption>
    <thead>
        <tr>
            <th>Person</th>
            <th>Coffee</th>
            <th>Tea</th>
        </tr>
    </thead>
    <tbody>
         <tr>
            <td>Njoki</td>
            <td>5 cups</td>
            <td>0 cups</td>
        </tr>
    </tbody>
    <tfoot>
        ...
    </tfoot>
</table>
```

---

# Table

* Si vous souhaitez un système d'ordonnancement


```html
<thead>
    <tr>
        <th aria-sort="descending">
            Person
            <button type="button" aria-label="Tri ascendant"> ^ </button>
        </th>
        ...
    </tr>
</thead>
```

---

# Details

* Élément permettant de créer un **Collapsible Panel**


```html
<details>
    <summary>Details</summary>
    Something small enough to escape casual notice.
</details>
```

* Nous pouvons légèrement styliser cet élément

```css
summary::-webkit-details-marker {
    display: none;
    /* and display the image you want in HTML */
}
details > summary {
  /* closed styles as necessary */
}

details[open] > summary {
  /* opened styles as necessary */
}
```

* De nouvelles syntaxes CSS vont arrivées prochainement pour avoir plus de controle sur le style de cet élément. 

---

# Time

* Balise permettant de définir dans un format informatique pour une date.
* Nous pouvons définir :
    * une date
    * une heure
    * une durée


```html
<time datetime="2018-07-07">July 7</time>
<time datetime="20:00">20:00</time>
<time datetime="PT2H30M">2h 30m</time>
```

--- 

# Principes généraux

* Préférez les dimensions relatives
* `%` pour `width`
* `em` ou `rem` pour les textes

---

# Principes généraux

* S'assurer que les éléments sur mobile `focusable` ont une taille suffisante
* Recommandation : 48dp.
* Avoir une marge de 32dp entre deux éléments focusables.

---

# Principes généraux

* Prendre en compte le choix de vos utilisateurs
    * thème sombre ou clair
    * activation des animations
* Chrome propose des options pour activer/désactiver ces deux choix

---

# Principes généraux

* thème sombre ou clair
    * Utile notamment pour les personnes atteintes de photophobie

```css
:root {
    --font-color: black;
}

/* @media (prefers-color-scheme: light) { */
@media (prefers-color-scheme: dark) {
    :root {
        --font-color: white;
    }
}
```

---

# Désactivation des animations

* Success Criterion 2.3.1 Three Flashes or Below Threshold
* Success Criterion 2.3.2: Three Flashes
* Success Criterion 2.3.3: Animation from Interactions

---

# Désactivation des animations


```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

```

---

# Désactivation des animations

* Pour des problématique de support des navigateurs, nous pouvons inverser la logique.

```css

 *,
  *::before,
  *::after {
    /* Désactivation des animations */
  }

@media (prefers-reduced-motion: no-preference) {
  *,
  *::before,
  *::after {
    /* Activer les animations */
  }
}

```

---

# Orientation

* Ne jamais bloquer l'orientation `landscape` ou `portrait`
* Ne jamais utiliser par exemple la `Screen Orientation API`


```javascript
screen.orientation.lock('portrait')
screen.orientation.lock('landscape')
screen.orientation.unlock()
```

---

# Orientation

* Si vous souhaitez styliser votre application en fonction de l'orientation


```css
body {
    flex-direction: row;
}

/* @media (orientation: landscape) { */
@media (orientation: portrait) {
  body {
    flex-direction: column;
  }
}
```

---

# MatchMedia

* Nous pouvons manipuler ces media queries en JavaScript avec la MatchMedia api


```javascript
const mql = window.matchMedia("(orientation: portrait)");
/**
 * window.matchMedia("(prefers-reduced-motion: no-preference)");
 * window.matchMedia("(forced-colors: active)");
 * window.matchMedia("(prefers-color-scheme: dark)");
 */

// If there are matches, we're in portrait
if(mql.matches) {
	// Portrait orientation
} else {
	// Landscape orientation
}
```

---

# Orientation


```javascript
mql.addListener(function(m) {
	if(m.matches) {
		// Changed to portrait
	}
	else {
		// Changed to landscape
	}
});
```

---

# Contrast Ratio

* Un contrast ratio compare la couleur d'un texte par rapport à la couleur du `background`
* Le calcul se base sur la propriété `Relative luminance` d'une couleur
    * = 0 pour le noir foncé
    * = 1 pour le blanc
* Pour calculer le contrast : `(L1 + 0.05) / (L2 + 0.05)`
* La valeur retournée aura une forme :
    * `1:1` : aucun contrase
    * `21:1` : le plus gros contraste possible

* Chrome Devtools fait le calcul pour nous.

---
layout: cover
---

# PW