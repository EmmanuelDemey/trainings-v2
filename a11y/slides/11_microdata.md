---
layout: cover
---

# 11 - Microdata

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what microdata adds to semantic HTML — meaning for machines, not
  for screen readers
- **Use** a [schema.org](https://schema.org) vocabulary with `itemscope`,
  `itemtype` and `itemprop`
- **Nest** one item in another (a `Person` with a `PostalAddress`)
- **Write** the same data in **JSON-LD**, and choose between the two
- **Check** the result with a validator

<!--
A short bonus chapter. Say it up front: microdata is not an accessibility technique. It is here because it follows the same logic as semantic HTML: say what things are, not how they look.
-->

---

# One level above semantic HTML

```html
<!-- HTML: "this is a table cell" -->
<td>Dupont</td>

<!-- Microdata: "this cell is the family name of a person" -->
<tr itemscope itemtype="https://schema.org/Person">
  <td itemprop="familyName">Dupont</td>
  <td itemprop="givenName">Jean</td>
</tr>
```

- Read by **search engines** (rich results), browser extensions, scrapers — any
  tool that wants the **data**, not the layout
- **Invisible**: it changes nothing on screen, and nothing for a screen reader —
  it is not an accessibility fix, it is the same idea one level up
- Indirect benefit: the markup only works on **well-structured** HTML

<!--
Insist on "invisible": no screen reader announces itemprop. If a participant asks "does it help NVDA?", the answer is no. The link with the course is the method: annotating data forces a clean structure.
-->

---

# schema.org — a shared vocabulary

| Type | Typical properties | Rich result |
|---|---|---|
| `Person` | `givenName`, `familyName`, `birthDate`, `address`, `sameAs` | Profile page (inside a `ProfilePage`) |
| `Organization` | `name`, `logo`, `url`, `contactPoint` | Logo, contact |
| `Event` | `name`, `startDate`, `location`, `offers` | Date and place in the results |
| `Product` + `Review` | `name`, `offers`, `aggregateRating` | Price, stars |
| `Recipe` | `cookTime`, `recipeIngredient`, `nutrition` | Image, time, rating |
| `Restaurant` | `name`, `address`, `geo`, `menu`, `servesCuisine` | Local results |

- One vocabulary shared by **Google, Bing, Yahoo and Yandex** since 2011
- Each type lists its properties: [schema.org/Person](https://schema.org/Person)
- Which types give a rich result: [Google — structured data gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)

<!--
Rich results are Google's choice, not a right: valid markup makes a page eligible, it does not guarantee the display. A Person alone gives no rich result; Google uses it inside a ProfilePage.
-->

<style>
table { font-size: 0.85em; }
</style>

---

# `itemscope`, `itemtype`, `itemprop`

```html
<section itemscope itemtype="https://schema.org/Restaurant">
  <h1 itemprop="name">Super Taco Bar</h1>
  <h2>Menu</h2>                            <!-- no itemprop: ignored -->
  <p itemprop="address">Lille</p>
</section>
```

- **`itemscope`** — this element is an **item**: its descendants describe it
- **`itemtype`** — the item is a `Restaurant`, from the schema.org vocabulary
- **`itemprop`** — the element's text is the value of this property
- For an `<a>`, `<img>`, `<time>`, `<meta>`, `<data>`: the value is the `href`,
  `src`, `datetime`, `content`, `value` — not the text

<!--
Three attributes are enough for the whole workshop. The last bullet is the trap: on a <time>, the parser reads datetime, not the displayed text.
-->

---

# Nesting items

```html
<section itemscope itemtype="https://schema.org/Restaurant">
  <h1 itemprop="name">Super Taco Bar</h1>
  <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <p itemprop="addressLocality">Lille</p>
    <p itemprop="addressRegion">Hauts-de-France</p>
    <p itemprop="postalCode">59000</p>
  </div>
  <meta itemprop="openingHours" content="Tu-Sa 12:00-22:00" />
  <p>Tuesday to Saturday, noon to 10 pm</p>
</section>
```

- `itemprop` **and** `itemscope` on the same element: the property's value is
  **another item**
- `<meta itemprop content>`: a human text for the eyes, a machine value for the
  parser — `<time datetime>` only accepts a real date or time
- Detailed addresses feed **local** search results

<!--
Why not <time datetime="Tu-Sa 12:00-22:00">? It is not a valid datetime value for HTML, the W3C validator rejects it. A <meta> inside the item carries the machine value, the visible <p> carries the human text.
-->

---

# JSON-LD — the same data, apart from the HTML

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Emmanuel Demey",
  "url": "https://twitter.com/EmmanuelDemey",
  "sameAs": [
    "https://github.com/EmmanuelDemey",
    "https://linkedin.com/in/EmmanuelDemey"
  ]
}
</script>
```

- Same vocabulary, **no change** to the markup — the format Google recommends
- `sameAs`: several profiles, **one** person
- ❌ It can drift from what is on screen: the data must **match** the visible
  content

<!--
Google's guidelines say structured data must describe the visible content; markup that does not can be ignored or penalised. That is the price of JSON-LD's convenience.
-->

---

# Microdata or JSON-LD?

| | Microdata | JSON-LD |
|---|---|---|
| Where | **On** the visible elements | In a `<script>`, anywhere in the page |
| Stays in sync with the page | **By construction** | By discipline |
| Easy to generate | From the template that renders the rows | From the data, server side |
| Readable | Mixed with the HTML | One block, easy to review |

<br />

- Check either with the [Schema Markup Validator](https://validator.schema.org/)
  and Google's [Rich Results Test](https://search.google.com/test/rich-results)
- Workshop 09 uses **microdata**: the rows are already rendered by `script.js`

<!--
No dogma: both are valid, both use schema.org. Choose microdata when the template already renders the data, JSON-LD when the data lives server side or when the HTML is hard to touch.
-->

---
layout: cover
---

# Workshop 09

## Microdata

`workshops/09_microdata`

<!--
Transition: workshop 09 — mark each row of the table as a schema.org Person (familyName, givenName, birthDate on the <time>), check it in the Schema Markup Validator, then `pnpm run verify --dir workshops --tp 09`. The page must look and sound exactly as before. Next chapter: the conclusion — what to remember and how to keep going.
-->
