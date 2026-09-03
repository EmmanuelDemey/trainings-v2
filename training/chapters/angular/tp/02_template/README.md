# TP 2 — Dynamic templates

> Deck section **Dynamisation HTML**. ~45 min. Continues the project of workshop 1.

## Goal

Turn an array into a table, with the template syntax of modern Angular. By the
end you can:

- interpolate a value and bind a property, and say which one you need
- loop with the **built-in control flow** (`@for`, `@if`, `@empty`) and explain why
  `track` is not optional
- type your data instead of passing `any` around

No component splitting yet (that is workshop 3) and no network (workshop 4):
everything lives in the root component, in memory.

## Prerequisites

- Workshop 1 finished: a running project with Bulma imported

## Setup

```shell
cd first-project
npm start
```

## Steps

### 1. Type the data — `src/app/person.ts`

The API you will call in workshop 4 returns objects like the ones below. Declare
the shape first, so that the template can be checked against it:

```ts
export interface Person {
  name: string;
  height: string;
  mass: string;
  gender: string;
  birth_year: string;
  url: string;
}
```

> The fields really are strings, including `height` and `mass` — that is SWAPI's
> doing, not a mistake. The real payload has a dozen more fields (`films`,
> `starships`, …); declare the ones you use, and add the others when you need them.

### 2. The data — `src/app/app.ts`

Declare an instance property holding four characters. This is a **stand-in for the
API**, which arrives in workshop 4:

```ts
people: Person[] = [
  {
    name: 'Luke Skywalker', height: '172', mass: '77',
    gender: 'male', birth_year: '19BBY',
    url: 'https://swapi.dev/api/people/1/',
  },
  {
    name: 'C-3PO', height: '167', mass: '75',
    gender: 'n/a', birth_year: '112BBY',
    url: 'https://swapi.dev/api/people/2/',
  },
  {
    name: 'R2-D2', height: '96', mass: '32',
    gender: 'n/a', birth_year: '33BBY',
    url: 'https://swapi.dev/api/people/3/',
  },
  {
    name: 'Darth Vader', height: '202', mass: '136',
    gender: 'male', birth_year: '41.9BBY',
    url: 'https://swapi.dev/api/people/4/',
  },
];
```

Keep the `url` field even though nothing displays it: workshop 5 derives the
character's id from it.

### 3. The table — `src/app/app.html`

Start from this static markup, inside the `container` of workshop 1:

```html
<table class="table is-fullwidth">
  <thead>
    <tr>
      <th>Nom</th>
      <th>Genre</th>
      <th>Année de naissance</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
  </tbody>
</table>
```

Now generate **one `<tr>` per character** with the built-in `@for` block:

```html
@for (person of people; track person.url) {
  <tr>
    <td>{{ person.name }}</td>
    <td>{{ person.gender }}</td>
    <td>{{ person.birth_year }}</td>
  </tr>
}
```

**Check it**: four rows, in the order of the array.

> **`track` is mandatory** — remove it and the template does not compile. It is the
> identity Angular uses to tell rows apart between two renders: without it, adding
> one character at the top would destroy and rebuild every row below. `person.url`
> is a real, stable identity; `$index` is a position, and is the wrong answer as
> soon as the list is filtered or sorted — which is exactly what workshop 3 does.

### 4. The empty case

Add an `@empty` block to the loop: when `people` is empty, the table body shows a
single row saying so. Empty the array for a second to see it, then put it back.

```html
@for (person of people; track person.url) {
  ...
} @empty {
  <tr><td colspan="3">Aucun personnage</td></tr>
}
```

### 5. Bind something other than text

Interpolation (`{{ }}`) writes text. To drive an **attribute or a property**, you
bind it with brackets. Make the row's `title` attribute show the height and mass:

```html
<tr [title]="person.height + ' cm, ' + person.mass + ' kg'">
```

Then try it without the brackets — `title="person.height"` — and hover a row. The
literal string `person.height` is what you get. That difference is the single most
common template bug.

### 6. A count, with `@if`

Above the table, show `N personnages` — and hide the whole block when there are
none:

```html
@if (people.length) {
  <p class="subtitle">{{ people.length }} personnages</p>
}
```

### 7. *(Bonus)* The loop's contextual variables

`@for` exposes `$index`, `$first`, `$last`, `$even`, `$odd`, `$count`. Use them to
add Bulma's `is-selected` class to every other row:

```html
<tr [class.is-selected]="$even">
```

## Definition of Done

**It builds and runs**

- [ ] `npm run build` exits 0 — a template error is a **build** error here, not a
      runtime surprise
- [ ] No error in the browser console

**The behaviour is there**

- [ ] The table shows the four characters, one row each, name / gender / birth year
- [ ] The rows come from `@for`, and its `track` is `person.url` — not `$index`
- [ ] Emptying the `people` array shows the `@empty` row instead of a blank table
- [ ] The count above the table disappears when the array is empty
- [ ] Hovering a row shows the height and mass — bound with `[title]`, not interpolated

**You can explain**

- [ ] The difference between `{{ x }}`, `[title]="x"` and `title="x"`
- [ ] What `track` is for, and what breaks when it is `$index`
- [ ] Why `@for` / `@if` need no import, where `*ngFor` / `*ngIf` did

## Going further

- Rewrite the table with `*ngFor` and `*ngIf` (they still work — import `NgFor` and
  `NgIf` from `@angular/common`), then run `ng generate @angular/core:control-flow`
  and watch the CLI migrate it back. That schematic is how real projects moved.
- Add a `@switch` on `person.gender` that renders a different icon per value.
- Replace the `people` property with a `signal<Person[]>([...])` and read it as
  `people()` in the template. Nothing else changes — which is the point of signals,
  and what workshop 6 comes back to.
