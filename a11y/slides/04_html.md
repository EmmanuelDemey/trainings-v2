---
layout: cover
---

# 04 - Semantic HTML

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

<!--
Four blocks, in the order of the chapter: document, structure, interaction,
content. Sizes, preferences and contrast were chapter 03. Everything here is fixed in workshop 04 (navigation
landmark, data table) — forms come in chapter 05, ARIA in chapter 06.
-->

---
layout: statement
---

Always use the HTML element made for the interaction you build.

<br />

**HTML first** — then CSS for the look — then JavaScript for the behaviour.
The content still works without the last two: **progressive enhancement**.

<!--
The first rule of ARIA says the same: if a native element exists, use it
(chapter 06). Ask: who turned off JavaScript today? Nobody — but a slow
network, a failing bundle or a blocked script does it for them.
-->

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

<!--
RGAA 4.1.2: 8.1 (doctype), 8.3 / 8.4 (default language present and valid),
8.7 (change of language). Demo: the same English sentence with lang="fr",
read by NVDA — the French voice mangles it.
-->

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

<!--
RGAA 8.5 (title present) and 8.6 (title relevant). Show a browser with many
tabs open: only the start of each title is visible. GOV.UK prefixes the
title with "Error: " after a failed submit — same idea.
-->

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

<!--
WCAG 2.2 removed 4.1.1 Parsing (duplicate ids were part of it), but the
broken relationships still fail 1.3.1 and 4.1.2. RGAA 4.1.2 still checks
8.2 (valid code), which covers unique ids.
-->

---

# Landmarks — the skeleton of the page

![Wireframe of a page: a header band at the top, a sidebar on the left, the main area on the right, a footer at the bottom](/images/a11y/landmarks.png)

<!--
Ask the room to name each zone before the next slide: banner, navigation,
main, complementary, contentinfo.
-->

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
- Inside an `<article>`, `<aside>`, `<main>`, `<nav>` or `<section>`,
  `<header>` / `<footer>` are **not** landmarks

<!--
RGAA 12.6 (header, main navigation, main content, footer and search zones
reachable) and 9.2 (document structure). <search> is in the HTML living
standard since 2023, supported in all current browsers. A <section> or
<form> without a name has no landmark role at all.
-->

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
    <form action="/search">
      <label for="q">Search people</label> <input id="q" name="q" type="search">
      <button>Go</button>
    </form>
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

<!--
<search> wraps the form, it does not replace it: the <form> still submits.
Demo: NVDA Insert+F7 (elements list), Landmarks tab — or VoiceOver rotor.
-->

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

<!--
WebAIM screen reader survey: headings are the first way to find
information on a long page for most respondents. RGAA 9.1 (heading
hierarchy). Demo: the HeadingsMap extension, or NVDA Insert+F7, Headings.
-->

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

<!--
The old "document outline" (an <h1> in every <section>) was never
implemented by browsers and was removed from the HTML spec in 2022: the
<hx> level is what counts.
-->

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

<!--
Workshop 04, step 1, is exactly this slide: a "Main menu" nav, a list of
2 links, aria-current="page" — and a visual mark too (bold), checked by
the verify script. RGAA 3.1 for information given by colour alone.
-->

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
- The sub-list is nested **inside** its `<li>`: the screen reader announces a
  **nested** list of 2 items

<!--
This is the disclosure navigation pattern of the ARIA APG — not a
role="menu" (menus are for application menus, chapter 07). Toggle
aria-expanded and hide the sub-list with JavaScript.
-->

---

# A clickable `<div>` is not a button

```html
<!-- ❌ Not focusable, not announced, Enter and Space do nothing -->
<div class="btn" onclick="save()">Save</div>

<!-- ❌ Rebuilding the button by hand: still no Enter, no Space, no disabled, no form submit -->
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

<!--
role="button" gives the role only: the keyboard is still yours. A div with
an onclick handler does not react to Enter either — only <a href> and
<button> turn Enter into a click. RGAA 7.1 (scripts compatible with
assistive tech) and 11.9 (button names).
-->

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

<!--
Let them react, then the next slide: six CSS lines reset it.
-->

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

<!--
2.5.8 has exceptions: spacing (a 24 px circle around the target hits no
other target), inline links in a sentence, the browser's own controls.
Focus styles were covered in chapter 03: do not reset outline here.
-->

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

<!--
RGAA 6.2 (every link has a name). An <a> without href is a placeholder
link: no role "link" at all. href="#" also breaks the back button and
writes "#" in the URL.
-->

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

<!--
A common trap: a "Download" control is a link (the file has a URL); a
"Delete" control is a button, even if it then redirects.
-->

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

<!--
RGAA 6.1 (explicit links: the link text, or its context). If you use
aria-label anyway, it must start with the visible text — "Learn more about
Ada Lovelace", not "Ada Lovelace biography".
-->

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

<!--
RGAA 1.1 (informative images have an alternative), 1.2 (decorative images
are ignored), 1.3 (the alternative is relevant). A complex chart needs a
long description next to it (RGAA 1.6) — the alt only summarises.
-->

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

<!--
Font icons use private-use Unicode characters: a screen reader reads
nothing, or a strange glyph name. Emoji have names ("birthday cake"),
role="img" + aria-label gives the meaning in context. RGAA 1.1, 11.9.
-->

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

<!--
RGAA 9.3 (lists correctly structured). The Safari behaviour is a WebKit
choice ("list-itis"): role="list" brings the semantics back.
-->

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

<!--
RGAA 5.4 (caption associated), 5.6 / 5.7 (headers declared and associated).
Workshop 04, step 2: this table, and the sortable header as a bonus — the
pattern is the APG "Sortable Table" example.
-->

---

# Native semantics, no JavaScript — `<details>`, `<time>`

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
- Read by search engines, calendars, translation tools — chapter 09 builds on it

</div>
</div>

<!--
::details-content is recent (2025): check caniuse before you rely on it. Use <details> for a disclosure, not for an
accordion with a forced single open panel (the name attribute does that
today, but the keyboard model stays a disclosure).
-->

---

# Recap — semantic HTML

| ✅ | |
|---|---|
| Document | `lang` on `<html>`, a unique `<title>`, unique `id`s |
| Structure | landmarks with names, one `<h1>`, levels without gaps |
| Interaction | `<button>` to act, `<a href>` to go, link texts that make sense |
| Content | `alt` on every image (empty when decorative), lists, real tables |

<br />

> **Test it**: the accessibility tree in DevTools, then the screen reader's
> headings, landmarks and links lists. If the lists read well, the page does.

<!--
Transition: workshop 04 applies two of these lines — a named navigation
landmark with aria-current, and a real data table instead of a grid of
divs. `pnpm run verify --dir workshops --tp 04` checks it. Next chapter:
forms, the other big source of failures.
-->

<style>
table { font-size: 0.85em; }
</style>

---

# Quiz — Semantic HTML

**A `<div>` with a click handler: what is missing for a keyboard user?**

- A) Nothing: a click also fires with the keyboard
- B) Only `role="button"`
- C) Only `tabindex="0"`
- D) The focus, Enter/Space and the role

<v-click>

**Answer: D** — Everything: no focus, no Enter/Space, no role. Use a `<button>`.

</v-click>

---

# Quiz — Semantic HTML

**Button or link?**

- A) `<a href>` to act, `<button>` to go somewhere
- B) `<button>` to act, `<a href>` to go somewhere
- C) Always a `<button>`: easier to style
- D) The same: pick by the look

<v-click>

**Answer: B** — `<button>` to **act**, `<a href>` to **go** somewhere.

</v-click>

---

# Quiz — Semantic HTML

**A decorative image: which `alt`?**

- A) `alt=""`
- B) No `alt` attribute
- C) `alt="decorative"`
- D) `alt="image"`

<v-click>

**Answer: A** — An **empty** one, `alt=""` — not a missing one: the file name would be read.

</v-click>

---
layout: cover
---

# Workshop 04

## Semantic HTML

---
src: ./shared/retro.md
---
