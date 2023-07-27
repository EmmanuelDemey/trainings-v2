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
# page transition
transition: slide-left
# use UnoCSS
css: unocss
---

# JavaScript

---

# Plan

---

# Promise

* Une **Promise** représente un traitement asynchrone.
* Elle peut avoir trois états : 
  * pending
  * fullfilled
  * in error
* Nous allons attacher les traitements grâce à **then**, **catch** et **finally**

```javascript
setLoading(true);

fetch("https://api/person")
  .then(response => response.json())
  .then(body => setData(body))
  .catch(error => setError(error))
  .finally(() => setLoading(false))
```

---

# Async / Await 

* Les termes **async/await** est une seconde solution pour mettre en place des traitements asynchrones
* La syntaxe ressemble plus à une syntaxe *séquentielle* (même si elle ne l'est pas).

```javascript

const fetchData = async () => {
  const response = await fetch("https://api/person");
  const body = await response.json();
  return body;
}

fetchData().then(body => setData(body))
```

