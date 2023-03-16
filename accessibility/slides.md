---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: 'text-center'
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# persist drawings in exports and build
drawings:
  persist: false
# use UnoCSS
css: unocss
---

# Web Accessibility

---

# Plan 

* Introduction
  * What is Web Accessibility ?
  * Legal obligations
  * How to use the Web ?
  * Presentation of the various technical aids (NVDA, VoiceOver, etc.)

* Standards
  * WCAG 2.0
  * RGAA
  * WAI-ARIA

--- 

# Plan 

* Semantic Web
  * HTML
  * Accessiblity Tree
  * ARIA attributes
  * Microformats
  * Best Practices


* Technical Usecases 
  * General design
  * Images
  * Tables
  * Forms
  * Complex component

---

# Plan

* Auditing
  * Manual evaluation
  * Automatic evaluation

---
layout: cover
---

# Introduction 

---

# What is Web Accessibility ? 

> Give the user full access to content and functionalities, despite physical or material constraints 

<style>
blockquote {
  font-size: 3rem !important;
  margin-top: 5rem !important;
}
blockquote p {
  line-height: 3rem !important;
}
</style>

---

# What a Web should be

* In order to work correctly on all user agent, a web page should be 
  * Perceivable
  * Operable
  * Understandable
  * Robust

* These are the 4 statements defined in the WCAG standard
* In order to do so, you have to choose the element that best represents the nature of the content

--- 

# Worst code ever

* This is a code we find a lot on website and that is not accessible

```html
<div 
	onclick=‘open()’ class=‘button’>
  Click me
</div>

<a href="#" onclick="..."> Click here </a>

<button> <a> ... </a> </button>

<div class="list">
  <div> ... </div>
  <div> ... </div>
  <div> ... </div>
  <div> ... </div>
</div>
```

--- 

# Better code

* A better way to write the same code, but not perfect

```html
<div class=‘button’
	onclick=‘open()’
	role=‘button’
	tabindex=‘0’>
  Click me
</div>
```

```css
div.button {
  display: inline-block;
  border-radius: 0,5rem;
  …
}
div.button:hover {…}
div.button:focus {…}
```

--- 

# What is a User Agent ?

> Any device capable of understanding a web page

<style>
blockquote {
  font-size: 3rem !important;
  margin-top: 5rem !important;
}
blockquote p {
  line-height: 3rem !important;
}
</style>

---

# What is a User Agent ?

* A Browser
* A Screen Reader
* A Braille Display
* A Bot
* A Script
* ...

---
layout: cover
---

# How users read the web

--- 

![Image représentant des appareils utilisés par des personnes en situation de handicap](/images/device.png)

---
src: ./pages/screen-readers.md
--- 

--- 


# Accessibility on a Project

* Everyone is responsible for it
* We need to collaborate
* We need to test, test, test
* Mobile first is your friend

--- 

# Browser and AT support

* Operating system being used,
* Operating system’s version,
* Browser being used,
* Browser’s version,
* Assistive technology being used,
* Assistive technology’s version, and
* Complexity of the underlying code.

--- 

# Legal obligations

* When you are in France, you have some obligation
  * Audit your website thanks to the RGAA standard
  * Publish an accessibility statement
  * Define a 3-year plan with a list of actions
  
---

# Standards

* In order to audit a website, we have at least two standards
  * WCAG (International)
  * RGAA (France, based on the WCAG)

---
layout: cover
---

# PW: Let's have a look to the W3C standard

--- 

# Semantic HTML 

![Page du W3C expliquant un élement HTML](/images/w3c.png)

--- 

# Semantic HTML 

* The HTML specification provide a lot of semantic element
* Depending of the browser support you need, you must use them
* **An HTML element is accessible by default**
* If you are not 100% about something, have a look to the specification
* Here are some commons errors
  * Unfocusable element
  * Duplicated ids
  * Unacceptable attributes on some HTML elements
  * Unacceptable children for an HTML element

---

# Landmarks

* We have multiple HTML elements usefull to strucure correctly a web page
  * header
  * footer
  * main
  * aside
  * nav
  * section
  * article
  * form
  * search

--- 

# Other HTML elements

* Ul/Li - Ol/Li - Dl/Dd/Dt
* Dialog
* inert
* Progress
* Details

---
layout: cover
---

# PW Let's write simple Home Page of an Ecommerce website


---
layout: cover
---

# Technical Usecases

---
src: ./pages/focus.md
---

--- 

# Langs

* Some Screen readers will select the right voice based on the lang of your page
* You must
  * define the default lang of the web page
  * define everytime you have a part of the page that is not using the default lang

```html
<html lang="en">
  <body>
    <article lang="fr">
      Ceci est un contenu en français
    </article>
  </body>
</html>
```

---

# Abbreviation

* If you are uing abreviation, you must define the full value the first time the abbreviation appear

```html
<p>
  here is an abbreviation  <abbr title="spécification">spec</abbr>
</p>
```

--- 

# Titles

* All pages of the same web application should have a unique **title**

```html
<head>
  <title> How to write accessible code | EmmanuelDemey.dev</title>
</head>
```

* An HTML page is like a Word document. The **outline** should be clear
  * h1 > h2 > h3 > ... > h6

```javascript
Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
```

--- 

# Titles

* When you develop a **SPA**, you have to give manually the focus everytime the user is redirected from one page to another. 

```javascript
const app = new Vue({
	watch: {
		$route: function(to) {
			this.$nextTick(function () {
    
  		  let focusTarget = this.$refs.routerView.$el;
        
        focusTarget.setAttribute('tabindex', '-1');

        focusTarget.focus();

        focusTarget.removeAttribute('tabindex');
			});
		}
	}
}).$mount('#app');
```

* A PR is opened in order to manage thie behavior internally in Vue.js : https://github.com/vuejs/vue-router/issues/2488

---
--- 

# Images


* An image should contains a text alternative via the **alt** attribute. 
  * if the image does not contain any information **alt=""**
  * if the image contain some information, the value should be accurate

```html
<img src="error.svg" alt="" />

<img src="./conference.png" alt="Conference about Web Accessibility by Emmanuel Demey" />

<picture>
  <source srcset="img/kinepolis.avif" type="image/avif">
  <source srcset="img/kinepolis.webp" type="image/webp">
  <img loading="lazy" src="/img/kinepolis.jpg" alt="Une salle du Lille Grand Palais">
</picture>
```

* Be careful when you have multiple text alternatives

```html
<a href="#" aria-label="Twitter">
  <img src="#" alt="Twitter Logo"/>
</a>
```

--- 

# Images

![Arbre de décision](/images/image.png)

--- 

# Tables

* When creating a table, you must respect theses rules
  * Use the semantic html elements
    * table
    * thead
    * tbody, tr, td
    * tfoot
  * Add a (visually-hidden) caption
  * If you have two levels of headers, you must use the **scope** attribute

---

# Tables

* Here is full example of an HTML table

```html
<table>
    <caption>Things to eat</caption>
    <thead>
        <tr>
            <th scope="col">Product</th>
            <th scope="col">Price</th>
            <th scope="col">Vegan</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Peach</th>
            <td>1.99 €</td>
            <td>yes</td>
        </tr>
        <tr>
            <th scope="row">Cucumber</th>
            <td>0.99 €</td>
            <td>yes</td>
        </tr>
    </tbody>
</table>
```

---
src: ./pages/form.md
---

---
layout: cover
---

# Complex components

--- 

# Complex components

* When you need complex component, you have to develop them from scratch
  * because they are not available in the HTML specification
* Here are few example of complex component
  * Tooltip
  * Carousel
  * Tab
  * Menu Bar
* The **WAI-ARIA** Practices provide a pattern library with few complex component. 
* If your component does not exist in the library, you need to understand correctly the ARIA specifications

---
src: ./pages/aria-attributes.md
---

---
layout: cover
---

# Let's write a tooltip together


---
layout: cover
---

# Let's write a custom radio group together

---
layout: cover
---

# Let's create a Tab component

---

# Microdata

* API used to add *business* metadata to an HTML page
* Useful in order make our website unserstandable by a device
* You can use multiple syntaxes
  * Schema.org
  * JSON LD
  * RDF

---

# Schema.org

* Supported by Bing, Google, Yahoo
* It provides a huge vocabulary
  * Person
  * Restaurant
  * Event
  * Product
  * ...

---

# Vocabulary

* Each vocabulary provides multiples properties you can add on your HTML
* Here is an example for the vocabulary `Restaurant` :
  * name
  * image
  * geo
  * events
  * ...

---

# Vocabulary

* In order to add these metadatas to your HTML, you need to define which node will be the root of your vocabulary.
* You will use `itemscope` and `itemtype` attributes.

```html
<section itemscope itemtype="https://schema.org/Restaurant">
    <h1>Super Taco Bar</h1>
    <h2>Menu</h2>
    <p>
       Lille
   	</p>
</section>
```

---

# Vocabulary

* We can now add attributes to all the children of this root node
* We will use the `itemprop` attribute

```html
<section itemscope itemtype="https://schema.org/Restaurant">
    <h1 itemprop="name">Super Taco Bar</h1>
    <h2>Menu</h2>
    <p itemprop="address">
       Lille
   	</p>
</section>
```

---

# Vocabulary

* We can have nested vocabularies

```html
<section itemscope itemtype="https://schema.org/Restaurant">
    <h1 itemprop="name">Super Taco Bar</h1>
    <h2>Menu</h2>
    <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
        <p itemprop="addressLocality">Lille</p>
    </div>
</section>
```

---

# LD+JSON

* If you prefer, you can use a JSON-like format when defining these matadats

```html
<script type="application/ld+json">
{
  "@context": "http://schema.org/",
  "@type": "Person",
  "name": "Emmanuel Demey",
  "url": "http://twitter.com/EmmanuelDemey"
}
</script>-
```

---
layout: cover
---

# PW Add Microdata to the Product Page 

---
src: ./pages/auditing.md
---

