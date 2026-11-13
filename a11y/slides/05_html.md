---
layout: cover
---

# 05 - Semantic HTML

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Structure** a page with `lang`, a `<title>`, landmarks and a heading
  hierarchy a screen reader can navigate
- **Choose** between `<button>` and `<a href>` — and explain what a clickable
  `<div>` costs
- **Write** text alternatives for images, icons and emoji
- **Use** the right element for lists, key-value pairs, tables, disclosures
  and dates
- **Respect** user preferences: theme, reduced motion, orientation, contrast

---
layout: statement
---

Always use the HTML element made for the interaction you build.

<br />

**HTML first** — then CSS for the look — then JavaScript for the behaviour.
The content still works without the last two: **progressive enhancement**.

---

# The document — doctype, charset, language

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>People - Genea11y</title>
  </head>
  <body>
    <p>The whole page is in English, <span lang="fr">sauf ce passage</span>.</p>
  </body>
</html>
```

- **`lang` on `<html>`** — **WCAG 3.1.1** Language of Page (A): the screen
  reader picks its voice and pronunciation, the browser its translation,
  spell checker and `hyphens: auto`
- **`lang` on a part** — **WCAG 3.1.2** Language of Parts (AA)
- A missing doctype puts the page in **quirks mode**: layout surprises included

---

# A unique, descriptive page title

```html
<title>Genea11y</title>                        <!-- home page -->
<title>Add a person - Genea11y</title>         <!-- [page] - [site] -->
<title>2 errors - Add a person - Genea11y</title>  <!-- after a failed submit -->
```

- **WCAG 2.4.2** Page Titled (A): the **first** thing a screen reader reads, and
  the name of the tab and of the bookmark
- The **specific** part first: ten tabs of "Genea11y - …" all look alike
- In a SPA, update `document.title` on every route change (chapter 10)

---

# `id` — unique in the page

```html
<!-- ❌ Two fields, one id: the second label points at the first input -->
<label for="name">Last name</label>  <input id="name" name="lastName">
<label for="name">First name</label> <input id="name" name="firstName">
```

- `for`, `aria-labelledby`, `aria-describedby`, `aria-controls`: all resolve
  **an id** — a duplicate breaks every one of them
- A component instantiated twice duplicates its static ids: generate them
  (`useId()` in React, a counter elsewhere)

---

# Landmarks — the skeleton of the page

![Landmarks](/images/a11y/landmarks.png)

---

# Landmarks — element, role, purpose

| Element | Implicit role | Purpose |
|---|---|---|
| `<header>` (child of `<body>`) | `banner` | site header: logo, main navigation |
| `<nav>` | `navigation` | a set of navigation links |
| `<search>` | `search` | the search form (HTML 2023) |
| `<main>` | `main` | the main content — **one** per page |
| `<aside>` | `complementary` | related content, a sidebar |
| `<footer>` (child of `<body>`) | `contentinfo` | site footer: legal, contact |
| `<section>` **with** an accessible name | `region` | a named area worth jumping to |
| `<form>` **with** an accessible name | `form` | a named form |

<br />

- A screen reader lists them and jumps between them (**D** in NVDA, the rotor
  in VoiceOver) — **WCAG 1.3.1** Info and Relationships (A)
- The elements carry the role: `<main role="main">` is redundant today
- Inside an `<article>` or a `<section>`, `<header>` / `<footer>` are **not**
  landmarks

<style>
table { font-size: 0.8em; }
</style>

---

# Landmarks — in the HTML

```html
<header>
  <a href="/">Genea11y</a>
  <nav aria-label="Main"> <ul> … </ul> </nav>
  <search>
    <label for="q">Search people</label> <input id="q" type="search">
    <button>Go</button>
  </search>
</header>
<main id="main"> … </main>
<aside aria-label="Recently added"> … </aside>
<footer> … </footer>
```

- **Everything** that is content sits in a landmark — axe flags what is left
  out (`region` rule)
- Two landmarks of the same kind need **different names**: `aria-label`, or
  `aria-labelledby` pointing at a visible heading

---

# Headings — the table of contents

```html
<h1>People</h1>
  <h2>Filters</h2>
  <h2>Family tree</h2>
    <h3>Paternal side</h3>
    <!-- ❌ <h5> here: a level skipped -->
```

- **Navigating by heading** is how most screen reader users skim a page (**H**,
  **1** to **6** in NVDA)
- Levels in order, none skipped; **one `<h1>`** — the subject of the page
- The level is about **structure**, not size: style an `<h2>` small in CSS if
  you must
- **WCAG 1.3.1** (A) and **2.4.6** Headings and Labels (AA)
- No visible heading in the design but needed in the structure? Keep it, with
  `.sr-only` — not `display: none`, which hides it from screen readers too

---

# `<article>` and `<section>`

```html
<article>                              <!-- makes sense on its own: a post, a card -->
  <h2>Ada Lovelace</h2>
  <p>Born December 10, 1815</p>
</article>

<section aria-labelledby="top-heading">   <!-- a themed part of the page -->
  <h2 id="top-heading">Most viewed people</h2>
  …
</section>
```

- **`<article>`**: content you could syndicate — a blog post, a comment, a card
- **`<section>`**: a thematic group, **with a heading**; with an accessible name
  it becomes a `region` landmark
- Neither is a styling wrapper: for that, `<div>` is the right element

---

# Navigation — named, and marked "current"

```html
<nav aria-label="Main">
  <ul>
    <li><a href="/">People</a></li>
    <li><a href="/create" aria-current="page">Add a person</a></li>
  </ul>
</nav>
<nav aria-label="Breadcrumb"> … </nav>
```

- Several `<nav>`: each with its own **name** — "Main", "Breadcrumb", "Footer"
- The **list** tells "2 items": the user knows how long the menu is
- **`aria-current="page"`** says which link is the current page — the colour
  alone does not reach a screen reader (**WCAG 1.4.1** Use of Color, A)

| `aria-current=` | for |
|---|---|
| `page` · `step` · `location` | navigation, a wizard, a map |
| `date` · `time` | a calendar, a timetable |
| `true` | any other "the current one in a set" |

<style>
table { font-size: 0.8em; }
</style>

---

# Nested navigation

```html
<nav aria-label="Main">
  <ul>
    <li><a href="/">Home</a></li>
    <li>
      <button aria-expanded="true" aria-controls="messaging-menu">Messaging</button>
      <ul id="messaging-menu">
        <li><a href="/contacts" aria-current="page">Contacts</a></li>
        <li><a href="/sent">Sent</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

- The **button** opens the submenu, and says whether it is open with
  `aria-expanded` — it is an action, not a destination
- The sub-list is nested **inside** its `<li>`: the structure is read as
  "list of 2 items, level 2"

---

# A clickable `<div>` is not a button

```html
<!-- ❌ Not focusable, not announced, Enter and Space do nothing -->
<div class="btn" onclick="save()">Save</div>

<!-- ❌ Rebuilding the button by hand: still no Space, no disabled, no form submit -->
<div class="btn" role="button" tabindex="0" onclick="save()">Save</div>

<!-- ✅ Focusable, announced "Save, button", Enter and Space, disabled, form submit -->
<button type="button" onclick="save()">Save</button>
```

| What you need | `<div role="button" tabindex="0">` | `<button>` |
|---|---|---|
| Focus with Tab | `tabindex="0"` | ✅ built in |
| Announced as a button | `role="button"` | ✅ built in |
| Enter **and** Space | your `keydown` handler | ✅ built in |
| Disabled | `aria-disabled` + your checks | ✅ `disabled` |
| Submits its form | your code | ✅ `type="submit"` |

<style>
table { font-size: 0.8em; }
</style>

---
layout: statement
---

<blockquote>
The button element can't be styled.
<p>A developer (who is wrong)</p>
</blockquote>

---

# Styling a `<button>` — and its `type`

```css
/* The browser's look, gone: now it is yours */
button {
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
}
```

```html
<form>
  <button type="button">Preview</button>   <!-- ✅ an action: does NOT submit -->
  <button>Save</button>                     <!-- ⚠️ no type: submit by default -->
</form>
```

- A `<button>` inside a `<form>` is `type="submit"` by default: write the
  `type` every time
- Keep the target big enough: **WCAG 2.5.8** Target Size (AA) — **24×24 px**
  minimum, **44×44 px** for **2.5.5** (AAA)

---

# A link goes somewhere — with an `href`

```html
<!-- ❌ No href: not focusable, not in the links list -->
<span onclick="goTo('/people/3')">Ada Lovelace</span>
<a onclick="goTo('/people/3')">Ada Lovelace</a>

<!-- ❌ href="#": focusable, but no real URL — the page scrolls to the top -->
<a href="#" onclick="goTo('/people/3')">Ada Lovelace</a>

<!-- ❌ An image link with no text alternative: announced by its file name -->
<a href="/people/3"><img src="ada.jpg"></a>

<!-- ✅ -->
<a href="/people/3">Ada Lovelace</a>
```

- Without a real `href`, the "link" is missing from the **screen reader's links
  list**, from **Tab**, from **open in a new tab**, from **bookmarks**, from the
  URL preview — and from search engines

---

# Button or link?

| | `<a href>` — a **link** | `<button>` — a **button** |
|---|---|---|
| It… | **goes somewhere** | **does something** |
| Examples | another page, an anchor `#section`, a file to download | submit, open a dialog, sort, delete, toggle |
| Keyboard | **Enter** | **Enter** and **Space** |
| Screen reader | "link" — in the links list | "button" — in the form controls list |
| Middle click, new tab, bookmark | ✅ | ❌ |

<br />

> **Ask**: does the URL change? A link. Does the state change? A button. A link
> styled as a button stays a link — and the other way around.

<style>
table { font-size: 0.85em; }
</style>

---

# Links that make sense out of context

```html
<!-- ❌ The links list reads: "Learn more, Learn more, Learn more" -->
<p>Ada Lovelace wrote the first program. <a href="/ada">Learn more</a></p>

<!-- ✅ The link text says where it goes -->
<p>Ada Lovelace wrote the first program. <a href="/ada">Learn more about Ada Lovelace</a></p>

<!-- ✅ Same visible text, more context for the screen reader -->
<a href="/ada">Learn more<span class="sr-only"> about Ada Lovelace</span></a>
```

- **WCAG 2.4.4** Link Purpose in Context (A): the link text, with its
  sentence, tells where it goes
- Prefer **visible** text, or `.sr-only` text, to `aria-label`: speech
  recognition users say what they **see** (**WCAG 2.5.3** Label in Name, A)

---

# Images — a text alternative, or an empty one

```html
<!-- Informative: the alt conveys what the image says -->
<img src="logo.svg" alt="Genea11y">
<img src="chart.png" alt="Births per decade: a peak of 40 in the 1950s">

<!-- Decorative: alt="" — the screen reader skips it -->
<img src="divider.svg" alt="">

<!-- ❌ No alt at all: the screen reader reads the file name -->
<img src="IMG_2034.jpg">
```

- **WCAG 1.1.1** Non-text Content (A): every `<img>` has an `alt`
- **Empty** (`alt=""`) is not **missing**: empty means "decorative, skip it"
- Do not start with "Image of…" or "Logo of the company": the role "image" is
  already announced. Say what the image **tells**, in its context

---

# Icons and emoji

```html
<!-- ❌ Announced "button" — and nothing else -->
<button><i class="bi bi-bag-plus"></i></button>

<!-- ✅ The icon is hidden, the button has a name -->
<button aria-label="Add to cart"><i class="bi bi-bag-plus" aria-hidden="true"></i></button>

<!-- ✅ An emoji that carries meaning -->
<span role="img" aria-label="Birthday">🎂</span>
```

- **Font icons** (Bootstrap Icons, Font Awesome) read as a strange character,
  or nothing: hide them with `aria-hidden="true"`, name the control
- An **inline SVG** icon: `aria-hidden="true"` when decorative,
  `role="img"` + `<title>` when it is the only content

---

# Lists — `<ul>`, `<ol>`, `<dl>`

```html
<ul>  <li>Paris</li> <li>Lyon</li>  </ul>          <!-- order does not matter -->
<ol>  <li>Fill in</li> <li>Check</li> <li>Send</li>  </ol>  <!-- order matters -->

<dl>                                               <!-- key → value(s) -->
  <dt>Born</dt>    <dd>December 10, 1815</dd>
  <dt>Parents</dt> <dd>Lord Byron</dd> <dd>Anne Isabella Milbanke</dd>
</dl>
```

- A list is announced with its **length**: "list, 3 items" — the user knows
  what is ahead, and can skip it
- `<dl>`: glossaries, metadata, FAQ — one `<dt>` can have several `<dd>`
- ⚠️ Safari + VoiceOver drops the list semantics of a `<ul>` with
  `list-style: none`: add `role="list"` when the count matters

---

# Data tables — headers that are read with each cell

```html
<table>
  <caption>People in the family tree</caption>
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">
        <button type="button">Name</button>
      </th>
      <th scope="col">Born</th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">Ada Lovelace</th><td>1815</td></tr>
  </tbody>
</table>
```

- `<caption>` names the table; `<th>` + `scope` let the screen reader read
  "Born, 1815" as you move from cell to cell (**T** jumps to the next table)
- **Sortable**: a `<button>` in the header, `aria-sort` on the **sorted**
  column only
- A grid of `<div>`s is not a table — and a `<table>` is not a layout tool

---

# Native widgets — `<details>`, `<time>`

<div style="display: flex; gap: 2em;">
<div>

```html
<details>
  <summary>More about Ada</summary>
  <p>She worked with Charles Babbage…</p>
</details>
```

```css
details[open] > summary { font-weight: bold; }
summary::marker { content: '+ '; }
details[open] > summary::marker { content: '− '; }
```

- A **disclosure** with no JavaScript: focusable, Enter and Space, "expanded /
  collapsed" announced
- `::details-content` styles the panel (recent browsers)

</div>
<div>

```html
<time datetime="1815-12-10">December 10, 1815</time>
<time datetime="20:00">8 pm</time>
<time datetime="PT2H30M">2 h 30</time>
```

- A **human** text, a **machine** value (ISO 8601) in `datetime`
- Read by search engines, calendars, translation tools — chapter 11 builds on it

</div>
</div>

---

# Sizes — relative units

```css
html { font-size: 100%; }         /* ✅ the user's setting: 16px by default */
body { font-size: 1rem; }         /* ✅ text follows the user's choice */
.card { max-width: 40rem; width: 100%; }
h1 { font-size: 2.5rem; }

p { font-size: 14px; }            /* ⚠️ ignores the user's default size */
```

- **`rem` / `em`** for text: it follows the browser's font size setting
- **WCAG 1.4.4** Resize Text (AA): readable at **200 %**; **1.4.10** Reflow (AA):
  no horizontal scroll at **320 px** wide
- `%`, `vw` / `vh`, `max-width` for layout; avoid fixed heights on text boxes

---

# User preferences — media queries

| Media query | The user asked for… | You… |
|---|---|---|
| `prefers-color-scheme: dark` | a dark theme (photophobia, migraines) | switch your colour tokens |
| `prefers-reduced-motion: reduce` | less motion (vestibular disorders) | drop or shorten animations |
| `prefers-contrast: more` | more contrast | strengthen borders, colours |
| `forced-colors: active` | Windows High Contrast | use system colours, keep borders |

```css
:root { --text: #1a1a1a; --background: #fff; }
@media (prefers-color-scheme: dark) {
  :root { --text: #f0f0f0; --background: #121212; }
}
```

- DevTools → **Rendering** panel: emulate each preference without changing your OS

<style>
table { font-size: 0.8em; }
</style>

---

# Reduced motion

```css
/* Animations only for users who did not ask for less motion */
@media (prefers-reduced-motion: no-preference) {
  .card { transition: transform 300ms; }
  .card:hover { transform: scale(1.05); }
}

/* Or: a safety net for everything */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- Motion can trigger **dizziness, nausea**; flashes can trigger **seizures**
- **WCAG 2.3.1** Three Flashes (A) · **2.2.2** Pause, Stop, Hide (A) ·
  **2.3.3** Animation from Interactions (AAA)

---

# The same preferences, in JavaScript — `matchMedia`

```js
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reducedMotion.matches) startCarousel();

// React when the user changes the setting while the page is open
reducedMotion.addEventListener('change', (event) => {
  if (event.matches) stopCarousel();
});
```

- Any media query: `(prefers-color-scheme: dark)`, `(forced-colors: active)`,
  `(orientation: portrait)`
- `addListener` is deprecated: use `addEventListener('change', …)`
- For what CSS cannot do: a carousel, a video autoplay, a canvas animation

---

# Orientation — adapt, never lock

```css
/* ✅ Adapt the layout to the orientation */
.tree { display: flex; flex-direction: row; }
@media (orientation: portrait) {
  .tree { flex-direction: column; }
}
```

```js
// ❌ Locks the screen: a user whose tablet is mounted on a wheelchair is stuck
screen.orientation.lock('landscape');
```

- **WCAG 1.3.4** Orientation (AA): the content works in **both** orientations
- Never ask "please rotate your device" unless the orientation is essential
  (a piano app, a bank cheque scan)

---

# Contrast ratio

| Content | AA | AAA |
|---|---|---|
| Body text | **4.5:1** — WCAG 1.4.3 | **7:1** — WCAG 1.4.6 |
| Large text (24 px, or 18.66 px bold) | **3:1** — WCAG 1.4.3 | **4.5:1** — WCAG 1.4.6 |
| UI components, focus indicator, icons | **3:1** — WCAG 1.4.11 | — |

<br />

- Ratio = `(L1 + 0.05) / (L2 + 0.05)` on the **relative luminance** (0 = black,
  1 = white): from **1:1** to **21:1**
- **Measure** it: DevTools colour picker (shows the ratio and the AA / AAA
  lines), axe DevTools, WAVE, the WebAIM Contrast Checker
- Check it in the **design** phase: a palette fixed late is a palette redone

<style>
table { font-size: 0.85em; }
</style>

---

# Recap — semantic HTML

| ✅ | |
|---|---|
| Document | `lang` on `<html>`, a unique `<title>`, unique `id`s |
| Structure | landmarks with names, one `<h1>`, levels without gaps |
| Interaction | `<button>` to act, `<a href>` to go, link texts that make sense |
| Content | `alt` on every image (empty when decorative), lists, real tables |
| Preferences | `rem`, dark theme, reduced motion, both orientations |
| Contrast | 4.5:1 for text, 3:1 for large text and UI |

<br />

> **Test it**: the accessibility tree in DevTools, then the screen reader's
> headings, landmarks and links lists. If the lists read well, the page does.

<style>
table { font-size: 0.85em; }
</style>

---
layout: cover
---

# Workshop 04

## Semantic HTML

`workshops/04_semantic_html`
