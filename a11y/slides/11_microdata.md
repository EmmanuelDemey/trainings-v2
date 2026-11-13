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

---

# schema.org — a shared vocabulary

| Type | Typical properties | Rich result |
|---|---|---|
| `Person` | `givenName`, `familyName`, `birthDate`, `address`, `sameAs` | Knowledge panel |
| `Organization` | `name`, `logo`, `url`, `contactPoint` | Logo, contact |
| `Event` | `name`, `startDate`, `location`, `offers` | Date and place in the results |
| `Product` + `Review` | `name`, `offers`, `aggregateRating` | Price, stars |
| `Recipe` | `cookTime`, `recipeIngredient`, `nutrition` | Image, time, rating |
| `Restaurant` | `name`, `address`, `geo`, `menu`, `servesCuisine` | Local results |

- One vocabulary shared by **Google, Bing, Yahoo and Yandex** since 2011
- Each type lists its properties: [schema.org/Person](https://schema.org/Person)

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
- For an `<a>`, `<img>`, `<time>`, `<meta>`: the value is the `href`, `src`,
  `datetime`, `content` — not the text

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
  <time itemprop="openingHours" datetime="Tu-Sa 12:00-22:00">Tuesday to Saturday, noon to 10 pm</time>
</section>
```

- `itemprop` **and** `itemscope` on the same element: the property's value is
  **another item**
- `<time datetime>`: a human text for the eyes, a machine value for the parser
- Detailed addresses feed **local** search results

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

---
layout: cover
---

# Workshop 09

## Microdata

`workshops/09_microdata`
