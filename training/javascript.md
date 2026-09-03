---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: "text-center"
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: true
# some information about the slides, markdown enabled
info: |
  ## JavaScript
  JavaScript training for beginners — 3 days.

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

<div style="opacity: 0.75; font-size: 0.9em;">Understanding and using JavaScript in the browser</div>

<br />
<br />

<div style="display: flex; justify-content: center; align-items: center;">
  <div>
    <img src="/images/authors/Manu.jpeg" alt="Manu" height="150" width="150" />
    <div>
      <a href="https://github.com/emmanueldemey" target="_blank" rel="noopener noreferrer">Emmanuel Demey</a>
    </div>
  </div>
</div>

---
src: ./chapters/javascript/00_intro.md
hide: false
---

---
src: ./chapters/javascript/01_introduction.md
hide: false
---

---
src: ./chapters/javascript/02_mental_model.md
hide: false
---

---
src: ./chapters/javascript/03_syntax.md
hide: false
---

---
src: ./chapters/javascript/04_window.md
hide: false
---

---
src: ./chapters/javascript/05_dom.md
hide: false
---

---
src: ./chapters/javascript/06_events.md
hide: false
---

---
src: ./chapters/javascript/07_responsive.md
hide: false
---

---
src: ./chapters/javascript/08_guided_practice.md
hide: false
---

---
# ---------------------------------------------------------------------------
# Optional modules — NOT part of the standard three days.
#
# Each one is a chapter plus its own workshop, disabled by default. To turn one
# on (and with it its workshop, on the site and in the printed handbook):
#
#     pnpm run modules            # from training/ — lists what exists
#     pnpm run modules fetch on
#     pnpm run modules fetch off
#     pnpm run modules all on
#
# The script only flips the `hide:` flags below and renames the matching
# tp/ + solutions/ folders. Doing it by hand works just as well.
# ---------------------------------------------------------------------------
src: ./chapters/javascript/09_fetch.md
hide: true
---

---
src: ./chapters/javascript/10_modules.md
hide: true
---

---
src: ./chapters/javascript/11_storage.md
hide: true
---
