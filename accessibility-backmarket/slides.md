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
  * Ethics and deontology
  * Legal obligations
  * How to use the Web ?
  * Presentation of the various technical aids (NVDA, VoiceOver, etc.)

* Semantic Web
  * HTML
  * Accessiblity Tree
  * ARIA attributes
  * Microformats
  * Best Practices



--- 

# Plan 

* Standards
  * Section 508
  * WCAG 2.0
  * RGAA
  * WAI-ARIA
  * Accessiweb

* Technical Usecases 
  * General design
  * Images
  * Links
  * Tables
  * Forms

---

# Plan

* Technical Usecases 
  * Modals
  * Complex components
  * Accessibility Best Practices with Vue.js

* Auditing
  * Manual evaluation
  * Automatic evaluation

---
layout: cover
---

# Introduction 

---

# What is Web Accessibility ? 

---

# Ethics and deontology

---

# Legal obligations

---

# How to use the Web ?

---

# Presentation of the various technical aids

---
layout: cover
---

---
src: ./pages/aria-attributes.md
---

# Semantic Web 

---

# HTML

---

# Accessiblity Tree

---
src: ./pages/screen-readers.md
--- 

# Best Practices

---
layout: cover
---

# Standards

---

# Section 508

---

# WCAG 2.0

---

# RGAA

---

# WAI-ARIA

---

# Accessiweb

---
layout: cover
---

# Technical Usecases

---

# General design

---
src: ./pages/focus.md
---

--- 

# Langs

* Some Screen readers will select the right voice based on the lang of your page
* You must
  * define the default lang of the web pag
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

* When you develop a **SPA**, you have give manually the focus everytime the user is redirected from one page to another. 

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

# Links

---

# Tables

---
src: ./pages/form.md
---

# Modals

---

# Complex components

---

# Microdata

* API used to *business* metadata to an HTML page
* Useful in order make our website unserstandable by a device
* You can multiple syntaxes
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
** name
** image
** geo
** events
** ...

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

# Accessibility Best Practices with Vue.js

---
src: ./pages/auditing.md
---

