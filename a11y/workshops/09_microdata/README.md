# TP 9 — Microdata

> Mark each row of the table as a schema.org Person, so that machines read the people as people.

**Duration**: 20 min (10 min for the markup, 10 min to check with the validator and `verify`) · **Chapter**: 11 — Microdata

## Goal

Chapter 11 — HTML says *this is a table cell*. **Microdata** adds *this cell is
the family name of a person*. Search engines read it (rich results), and so can
browser extensions, scrapers, and any tool that wants the data rather than the
layout. You will annotate the table of people with the
[schema.org `Person`](https://schema.org/Person) vocabulary.

Microdata is invisible: it changes nothing for a screen reader or for the eyes.
It is the same idea as semantic HTML, one level up.

**Files:** `script.js` (the rows are rendered there). The `TODO workshop 9`
comment marks the place. The app starts where workshop 8 ended: no axe
violation left.

## Setup

```bash
cd workshops/09_microdata
npx serve .
```

## Steps

### 1. The markup to produce

Each row of the table must come out like this:

```html
<tr itemscope itemtype="https://schema.org/Person">
  <td itemprop="familyName">Dupont</td>
  <td itemprop="givenName">Jean</td>
  <td><time itemprop="birthDate" datetime="1980-05-15">1980-05-15</time></td>
  <td><button type="button" class="btn-details" data-id="1">View details…</button></td>
</tr>
```

- **`itemscope`** starts an item: everything inside describes it;
- **`itemtype`** says what it is, with the full URL of the schema.org type;
- **`itemprop`** names a property of the item, with the schema.org name:
  `familyName`, `givenName`, `birthDate`;
- on a **`<time>`**, the value of `itemprop` is its `datetime` attribute, not
  its text: you can format the date for humans and keep `YYYY-MM-DD` for
  machines. That is why the date already sits in a `<time>` since workshop 4.

### 2. Render it

In `renderPeople()`, at the TODO, add the attributes as you create the
elements:

- `itemscope` (an empty attribute: `setAttribute('itemscope', '')`) and
  `itemtype` on the `<tr>`;
- `itemprop` on the two name cells and on the `<time>`.

The *Actions* cell gets no `itemprop`: a button is not a property of the
person.

### 3. Test it

The pages run on `localhost`, which online testers cannot reach. Two ways:

- in the devtools, **copy the outer HTML** of the `<table>` (right-click →
  *Copy → Copy outerHTML*) after the rows are rendered, and paste it as a code
  snippet into the [Schema.org Validator](https://validator.schema.org/) or the
  [Google Rich Results Test](https://search.google.com/test/rich-results). You
  should see 5 `Person` items, each with its three properties;
- or read them in the console:

  ```javascript
  [...document.querySelectorAll('[itemtype="https://schema.org/Person"]')]
    .map((row) => row.querySelector('[itemprop="familyName"]').textContent);
  ```

## Checking your work

**By hand.** The validator finds 5 `Person` items, with `familyName`,
`givenName` and `birthDate`, and no error. The page looks and sounds exactly as
before.

**From the terminal**, in the training folder:

```bash
pnpm run verify --dir workshops --tp 09
```

It replays the semantics checks of workshop 4, the dialog checks of workshop 7
and the axe audit of workshop 8, then checks that, on `index.html`:

- there are 5 elements with `itemscope itemtype="https://schema.org/Person"`;
- each one is a row of the table (`<tr>`);
- *Dupont* has `familyName`, `givenName` *Jean* and `birthDate` `1980-05-15`;
- every Person has all three, with a `YYYY-MM-DD` birth date.

## Going further

- Add microdata to the **creation form**: an `itemscope itemtype="https://schema.org/Person"`
  on the form, and `itemprop` on what the fields display.
- Use **nested `itemscope`** for the family relations: a `Person` with
  `itemprop="parent"` items, or `children`, each one a `Person` of its own.
- Compare with the two other syntaxes of the same data, **JSON-LD** (a
  `<script type="application/ld+json">` block, what Google recommends) and
  **RDFa**. Generate the JSON-LD of the 5 people from the `people` array.
- Add `deathDate` and `gender` to the people of the sample data, and to the
  table.

## For the trainer

Where learners get stuck, most often:

- **`row.itemScope = true`**: the microdata DOM API (`itemScope`, `itemType`,
  `itemProp`) was never shipped in Chrome and was removed from Firefox. The
  property is silently ignored. Use `setAttribute`.
- **`setAttribute('itemscope')`** without a value throws: the second argument
  is required. An empty string is enough.
- **A short `itemtype`**: `Person` or `schema.org/Person` is not a type. It must
  be the full URL, `https://schema.org/Person`, which is also what `verify`
  looks for.
- **Invented property names**: `firstName`, `lastName`, `birthday`. They are
  the names of the JavaScript object, not of schema.org. The validator reports
  them as unknown; `verify` finds no `givenName`.
- **`itemprop="birthDate"` on the `<td>`** instead of the `<time>`: the value
  becomes the cell text. It works here because the text is already
  `YYYY-MM-DD`, but it breaks as soon as the date is formatted for humans.
- **Testing the page source**: *View source* shows an empty `<tbody>`, the rows
  are rendered by `script.js`. Copy the outer HTML from the Elements panel,
  after the render.
- **"Nothing changed"**: that is the expected result. Microdata is invisible to
  the eyes and to screen readers; only the validator and `verify` see it.

## Useful links

- [schema.org — Person](https://schema.org/Person)
- [MDN — Microdata](https://developer.mozilla.org/en-US/docs/Web/HTML/Microdata)
- [HTML Living Standard — Microdata](https://html.spec.whatwg.org/multipage/microdata.html)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
