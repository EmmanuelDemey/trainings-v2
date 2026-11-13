---
layout: cover
---

# HTML

---
layout: statement
---

As a general rule, always use the HTML element dedicated to the interaction you want to implement.

---

# HTML

* To build an accessible website:
    * first write the semantic HTML
    * then add styling with CSS
    * finally add behavior with JavaScript
* This approach ensures the foundations of your page are solid
* **Progressive Enhancement**: content remains accessible even without CSS/JS 

---

# HTML - The basics

* We must define a valid **DOCTYPE** for every page
* As well as an **encoding** (UTF-8 recommended)

```html
<!doctype html>
<html>
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      ...
      <!-- The content -->
      ...
    </body>
</html>
```

---

# Language

* We must define the document language on the `html` element
* **WCAG criterion 3.1.1** (level A): the page language must be defined
* This affects:
    * the accent and pronunciation used by screen readers
    * the browser's automatic translation
    * auto-correction and spell checking
    * word hyphenation

```html
<html lang="en">
...
</html>
```

---

# Language - Hyphenation

* The `lang` attribute is also used for automatic hyphenation with the CSS `hyphens` property

```css
p {
    hyphens: auto;
}
```

---

# Language - Change of language

* If part of the site uses another language, you can use the `lang` attribute on any HTML element
* **WCAG criterion 3.1.2** (level AA): changes of language must be indicated

```html
<div lang="en">
...
</div>
```

---

# Identifiers

* An element's `id` attribute **must be unique** across the whole page
* When building components with a framework, avoid static identifiers in your components, because you don't know how many times your component will be instantiated on the page
* Solution: generate unique IDs dynamically
* **⚠️ Don't do this:**

```html
<input id="name" name="lastName"/>
<input id="name" name="firstName"/>
```

---

# Landmarks

![Lens](/images/a11y/landmarks.png)

---

# Landmarks

* Since HTML5, new elements are available to structure a page
* These elements define the **regions** of your page
* They let screen reader users navigate quickly
    * `header`: header of the page or of a section
    * `search`: search area (brand new, HTML 2023)
    * `nav`: main or secondary navigation
    * `main`: main content (one per page)
    * `aside`: complementary content or sidebar
    * `footer`: page footer

---

# Landmarks

```html
<header>
    <h1> Application title</h1>
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

# Landmarks - Compatibility

* For compatibility with older browsers, you may need to add `role` attributes
* **Note**: in most modern cases, HTML5 elements are enough

```html
<header role="banner">
    <h1> Application title</h1>
    <nav role="navigation"> ... </nav>
</header>
<aside role="contentinfo"> ... </aside>
<main role="main"> ... </main>
<footer role="footer"> ... </footer>
```

---

# Landmarks - Benefits

* These landmarks define a skeleton for your application
* These elements give your page a clear structure
* Content is easier to reach through keyboard shortcuts for screen reader users
* Improves navigation and understanding of the site structure
* **WCAG criterion 1.3.1** (level A): Info and Relationships

---

# Page title

* The page title must be defined with the `<title>` element in the `<head>`
* The main content heading must use `<h1>`
* Each page must have a unique, descriptive title
* **WCAG criterion 2.4.2** (level A): Page Titled
* Best practices:
    * `[SITE NAME]` for the home page
    * `[PAGE NAME] - [SITE NAME]` for other pages

---

# Heading hierarchy

* **Navigating by headings** is the most common way screen reader users browse a page
* Headings must follow a logical, sequential hierarchy
    * Like when writing a Word document or a book
    * Always in ascending order: `h1` → `h2` → `h3` → ... → `h6`
    * **❌ Don't skip levels** (h1 → h3 is forbidden)
    * **✅ Only one h1 per page** (the main title)
* **WCAG criterion 1.3.1** (level A) and **2.4.6** (level AA)

```javascript
const headings = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
for(let i=0; i < headings.length; i++){
   console.dir(headings[i])
}
```

---

# Visually hidden headings

* If you don't want to display a heading in your design but it is needed for the structure
    * still add the HTML element
    * hide it visually with CSS (the `.sr-only` class seen in the Reminders chapter)
    * **Don't use** `display: none` or `visibility: hidden` (hides it from screen readers too)

---

# Semantic elements

* `<article>`: self-contained content that could be distributed independently (blog post, comment, widget)
* `<section>`: thematic grouping of related content, usually with a heading
    * Examples: "Top 5 articles", "About us", "Comments"
* **Rule**: every `<section>` should have a heading (`h2`, `h3`, etc.)

---

# NAV

* Element used to define a navigation area
* A page can have several `<nav>` elements (main navigation, secondary navigation, breadcrumb)
* **Requirement**: define a distinct label to tell multiple navigations apart
* Use `aria-label` or `aria-labelledby`

```html
<nav aria-label="main menu">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/contact">Contact</a></li>
    </ul>
</nav>
```

---

# Navigation - Active page

* We must clearly indicate which menu item matches the current page
* **Two possible approaches**:
    * Keep the link and add `aria-current="page"`
    * **Or** replace the link with a `<span>` with `aria-current="page"`
* The `aria-current` attribute tells the user they are on this page

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

# Nested navigation

* If we have two menu levels

```html
<nav aria-label="main">
    <ul>
        <li><a href="/">Home</a></li>
        <li>
            <button aria-current="true">Messaging</button>
            <ul>
                <li><a href="/contact" aria-current="page">Contacts</a></li>
                <li><a href="/sendbox">Sendbox</a></li>
            </ul>
        </li>
    </ul>
</nav>
```

---

# Aria-current

* The `aria-current` attribute can take different values depending on the context:
    * `aria-current="page"`: current page in a navigation
    * `aria-current="step"`: current step in a wizard/process
    * `aria-current="date"`: current date in a date picker
    * `aria-current="time"`: current time in a time picker
    * `aria-current="location"`: current location in a map
    * `aria-current="true"`: current element (generic use)

---

# The Button element

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
The button element can't be styled
<p>A developer (who is wrong)</p>
</blockquote>

---

# Button - Why use `<button>`?

* If you use a `<div>` or a `<span>` as a button, you must:
    * Add `role="button"`
    * Add `tabindex="0"` to make it focusable
    * Write JavaScript to handle activation with **Enter** and **Space**
    * Handle the `disabled` state manually with `aria-disabled`
* With a native `<button>`: **everything is handled for you**! 🎉

---

# Link - Antipatterns

* **❌ Avoid at all costs:**

```html
<span onclick="goTo(...)"> ... </span>
<a onclick="goTo(...)"> ... </a>
<a href="#" onclick="goTo(...)"> ... </a>
<a href="page"><img src="..." /></a>
```

---

# Link - Problems with these antipatterns

* **Consequences**:
    * Won't show up in the screen reader rotor's list of links
    * Won't work with the keyboard (Tab + Enter)
    * Can't be bookmarked
    * Right-click → "Open in new tab" won't work
    * No URL preview on hover
    * Negative impact on SEO

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

# Button vs Link - When to use which?

* **Link (`<a href>`)**:
    * ✅ Navigates to another page or another section
    * ✅ Downloads a file
    * ✅ Anchor to a section (#section)

* **Button (`<button>`)**:
    * ✅ Performs an action (submit a form, open a modal)
    * ✅ Changes the application state
    * ✅ Triggers a JavaScript interaction

---

# Styling a button

* On mobile, make sure the clickable area is large enough (**minimum 44×44px**)
* **Myth**: "`<div>`s are easier to style"
* **Reality**: resetting the styles of a `<button>` is easy:

```css
button {
  background-color: rgba(255,255,255,0);
  padding: 0;
  border: none;
  border-radius: 0;
}
```

---

# Button - Type

* ⚠️ **Important**: the default type of a `<button>` is `submit`
* This can cause unintended form submissions
* **Best practice**: always set the type explicitly

```html
<button type="submit">...</button>
<button type="button">...</button>
<button type="reset">...</button>
```
---

# Images

* **WCAG criterion 1.1.1** (level A): every image must have a text alternative
* The `alt` attribute is **mandatory** on every `<img>` element

```html
<!-- Informative image: descriptive alt -->
<img src="logo.png" alt="Acme company logo" />

<!-- Decorative image: empty alt (not a missing attribute) -->
<img src="decoration.png" alt="" />
```

* **Note**: `alt=""` tells screen readers to ignore the image

---

# Images - Context

* Try to be as explicit as possible by adding context
* The alternative must convey the same information as the image

```html
<img src="" alt="This is the company logo" />
<img src="" alt="Logo" />
```

---

# Images - Icons and Emoji

* The same work must be done for icons and emoji
* Font icons (Font Awesome, Bootstrap Icons) must have a label

```html
<em role="img" aria-label="calendar">📅</em>
<button aria-label="Add"><i aria-hidden="true" class="bi bi-bag-plus"></i></button>
```

---

# Lists

* Two main types of lists:
    * `<ul>`: unordered list
    * `<ol>`: ordered list
* Whenever you need to display a list of items, use one of these elements
* ⚠️ **Watch out**: list semantics can be lost in Safari/VoiceOver if you add `list-style: none`
    * Solution: add `role="list"` on `<ul>`/`<ol>` and `role="listitem"` on the `<li>`s

---

# Lists

* Unordered list

```html
<ul>
    <li>item</li>
    <li>item</li>
    <li>item</li>
</ul>
```

* Ordered list

```html
<ol>
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
</ol>
```

---

# DL / DD / DT

* **Description List**: element used to define a list of key-value pairs
    * `<dl>`: Description List (container)
    * `<dt>`: Description Term (term/key)
    * `<dd>`: Description Details (definition/value)
* Use cases:
    * Glossaries
    * Metadata
    * Question-answer pairs (FAQ)

---

# DL / DD / DT

* Glossary

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

# Table - Sorting

* If you want a sorting system
* Use `aria-sort` to indicate the current sort order

```html
<thead>
    <tr>
        <th aria-sort="descending">
            Person
            <button type="button" aria-label="Sort ascending"> ^ </button>
        </th>
        ...
    </tr>
</thead>
```

---

# Table - Accessibility

* **Best practices** for accessible tables:
    * Always use `<caption>` to describe the table
    * Use `<thead>`, `<tbody>`, `<tfoot>` to structure it
    * Use `<th>` for headers (with `scope="col"` or `scope="row"`)
    * For complex tables, use `headers` and `id`
* **Never use** tables for layout

---

# Details

* Element used to create a **Collapsible Panel**

```html
<details>
    <summary>Details</summary>
    Something small enough to escape casual notice.
</details>
```

* We can style this element a little

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

* New CSS syntaxes are coming soon to give more control over the styling of this element
* Notably the `::details-content` pseudo-element 

---

# Time

* Element used to define a date/time in a machine-readable format
* Improves accessibility and SEO
* We can define:
    * a date (ISO 8601 format)
    * a time
    * a duration

```html
<time datetime="2018-07-07">July 7</time>
<time datetime="20:00">20:00</time>
<time datetime="PT2H30M">2h 30m</time>
```

--- 

# General principles

* Prefer relative units
* **%** for **width**
* **em** or **rem** for text
* **vw** or **vh** for **width** and **height**

---

# General principles - Target size

* Make sure interactive elements on mobile are large enough
* **WCAG 2.5.5** (level AAA): minimum **44×44px** (or 44dp)
* **WCAG 2.5.8** (level AA, WCAG 2.2): minimum **24×24px**
* Keep a gap of at least **8px** between two focusable elements (ideally 32px)

---

# General principles - User preferences

* Respect your users' system preferences:
    * dark or light theme (`prefers-color-scheme`)
    * reduced motion (`prefers-reduced-motion`)
    * high contrast (`prefers-contrast`)
* Modern browsers expose these preferences through CSS media queries
* Chrome/Edge/Firefox provide options to test these preferences

---

# Dark / light theme

* Respect the user's theme preference
* Especially useful for people with:
    * photophobia (light sensitivity)
    * migraines triggered by bright light
    * eye strain

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

# Disabling animations

* **WCAG 2.3.1** (level A): Three Flashes or Below Threshold
* **WCAG 2.3.2** (level AAA): Three Flashes
* **WCAG 2.3.3** (level AAA): Animation from Interactions
* **WCAG 2.2.2** (level A): Pause, Stop, Hide
* Animations can trigger epileptic seizures or dizziness

---

# Disabling animations

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

# Disabling animations - Alternative approach

* To support older browsers, we can invert the logic
* **Mobile-first accessibility**: disabled by default, enabled if the user has no preference

```css

 *,
  *::before,
  *::after {
    /* Disable animations */
  }

@media (prefers-reduced-motion: no-preference) {
  *,
  *::before,
  *::after {
    /* Enable animations */
  }
}

```

---

# MatchMedia API

* We can detect and react to media queries in JavaScript with the `matchMedia` API
* Lets the application adapt its behavior dynamically

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

# Orientation

* **WCAG 1.3.4** (level AA): never force or lock an orientation
* Never lock the `landscape` or `portrait` orientation
* Some users have their device mounted in a fixed orientation (wheelchair mount)
* **⚠️ Avoid**: using the `Screen Orientation API` to lock the orientation

```javascript
screen.orientation.lock('portrait')
screen.orientation.lock('landscape')
screen.orientation.unlock()
```

---

# Orientation - CSS

* If you want to adapt your application's style to the orientation
* Use CSS media queries (never force the orientation)

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

# Contrast Ratio

* The contrast ratio compares the color of a text with the color of its background
* **WCAG criteria**:
    * **WCAG 1.4.3** (level AA): minimum **4.5:1** for normal text
    * **WCAG 1.4.3** (level AA): minimum **3:1** for large text (18pt+ or 14pt+ bold)
    * **WCAG 1.4.6** (level AAA): minimum **7:1** for normal text
* The calculation is based on the **relative luminance** of a color
    * 0 = pure black
    * 1 = pure white
* Formula: `(L1 + 0.05) / (L2 + 0.05)`
* Result between `1:1` (no contrast) and `21:1` (maximum contrast)

---

# Contrast Ratio - Tools

* **Chrome DevTools**: the "Color Picker" shows the ratio automatically
* **Browser extensions**:
    * WAVE
    * axe DevTools
    * Lighthouse
* **Online tools**:
    * WebAIM Contrast Checker
    * Lea Verou's Contrast Ratio
* **Tip**: use these tools from the design phase onwards!

---

# Recap - HTML checklist

* ✅ Always use the appropriate semantic HTML element
* ✅ Set the `lang` attribute on `<html>`
* ✅ Use landmarks (`header`, `nav`, `main`, `aside`, `footer`)
* ✅ Respect the heading hierarchy (h1 → h2 → h3)
* ✅ Provide an `alt` for every image
* ✅ Use `<button>` for actions, `<a>` for navigation
* ✅ Associate every form field with a `<label>`
* ✅ Ensure sufficient contrast (minimum 4.5:1)
* ✅ Respect user preferences (dark mode, animations)
* ✅ Test keyboard navigation

---
layout: cover
---

# Hands-on

---
layout: cover
---

# Workshop 4 - Semantic HTML
