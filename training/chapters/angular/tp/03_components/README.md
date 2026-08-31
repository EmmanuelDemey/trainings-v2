# TP 3 — Components and communication

> Deck section **Composants**. ~1h. Continues the project of workshop 2.

## Goal

Break the single root component into three, and make them talk. By the end you
can:

- generate a component with the CLI and place it in a parent template
- pass data **down** with an input, and send an event **up** with an output
- decide where a piece of state has to live — the question this workshop is
  really about

The feature you are adding: a **search field that filters the table**.

## Prerequisites

- Workshop 2 finished: the table renders four characters from an in-memory array

## Setup

```shell
cd first-project
npm start
```

## Steps

### 1. The search field, in one piece first

Above the table, add:

```html
<div class="field">
  <div class="control">
    <input class="input is-info" type="text" />
  </div>
</div>
```

Wire it in the root component, with nothing split out yet: a `search` property,
bound to the input, and the table looping over a filtered list.

```html
<input class="input is-info" type="text" [value]="search" (input)="onSearch($event)" />
```

```ts
search = '';

onSearch(event: Event) {
  this.search = (event.target as HTMLInputElement).value;
}

get filteredPeople(): Person[] {
  const needle = this.search.toLowerCase();
  return this.people.filter((person) => person.name.toLowerCase().includes(needle));
}
```

Point the `@for` at `filteredPeople` and check that typing `dar` leaves one row.

> `(input)="..."` is an **event binding** — the mirror image of the `[value]`
> property binding next to it. `$event` is the DOM event, which is why the cast to
> `HTMLInputElement` is needed to reach `.value`.

### 2. Three components

Now split it. Generate them:

```shell
ng generate component people-filter
ng generate component people-table
ng generate component people-item
```

Their responsibilities, and **nothing else**:

| Component | Owns |
|---|---|
| `PeopleFilter` | the search field, and only it |
| `PeopleTable` | the `<table>`, its header, and the loop |
| `PeopleItem` | one `<tr>` |

The list itself and the current search term stay in the root component. That is
the decision this workshop is about: **state lives where the components that need
it meet** — here, the root, because the filter writes it and the table reads it.

### 3. Data down — inputs

`PeopleTable` receives the list to render; `PeopleItem` receives one character:

```ts
import { Component, input } from '@angular/core';

export class PeopleItem {
  person = input.required<Person>();
}
```

In the template it is a **signal**, so you call it:

```html
<td>{{ person().name }}</td>
```

And the parent passes it with a property binding:

```html
@for (person of filteredPeople; track person.url) {
  <app-people-item [person]="person" />
}
```

> **`input()` or `@Input()`?** Both work. The signal form is the current one: it is
> typed, `input.required<Person>()` makes the input mandatory **at compile time**,
> and reading it in a `computed` just works. The decorator form
> (`@Input({ required: true }) person!: Person;`) is what you will meet in existing
> code — recognise it, write the other.

**One catch on `PeopleItem`**: a component whose selector is `app-people-item`
cannot be a `<tr>` child of a `<tbody>` on its own — the browser would move it out
of the table. Give the component an **attribute selector** instead, and put it on
the `<tr>`:

```ts
@Component({
  selector: 'tr[app-people-item]',
  // ...
})
```

```html
<tr app-people-item [person]="person"></tr>
```

### 4. Events up — outputs

`PeopleFilter` does not own the list, so it cannot filter anything. It reports
what was typed, and the root component decides:

```ts
import { Component, output } from '@angular/core';

export class PeopleFilter {
  search = output<string>();

  onInput(event: Event) {
    this.search.emit((event.target as HTMLInputElement).value);
  }
}
```

```html
<app-people-filter (search)="search = $event" />
```

`$event` here is **your** emitted value — a `string` — not a DOM event.

### 5. Make it work end to end

Typing in `PeopleFilter` must filter the rows in `PeopleTable`. Nothing in
`PeopleTable` knows that a filter exists: it renders the list it is given.

**Check it**: type `r2`, one row. Clear the field, four rows again.

### 6. *(Bonus)* A two-way binding

Replace the input/output pair on the filter with a single `model()`:

```ts
search = model('');
```

The parent then writes `<app-people-filter [(search)]="search" />` — the "banana in
a box". Look at what it saves, and at what it hides.

### 7. *(Bonus)* `OnPush`

Add `changeDetection: ChangeDetectionStrategy.OnPush` to the three new components.
Everything still works, because inputs and events are exactly the two things that
mark an `OnPush` component dirty. This is the default you want in a real project —
`angular.json` can make the schematics generate it for you.

## Definition of Done

**It builds and runs**

- [ ] `npm run build` exits 0
- [ ] No error in the browser console

**The behaviour is there**

- [ ] Three components exist: `PeopleFilter`, `PeopleTable`, `PeopleItem`
- [ ] Typing in the search field filters the table; clearing it restores every row
- [ ] The filter is case-insensitive
- [ ] `PeopleItem` renders a `<tr>` that is really inside the `<tbody>` — inspect the
      DOM, there is no stray element wrapping the row
- [ ] `PeopleTable` has **no** reference to the search term
- [ ] `PeopleFilter` has **no** reference to the list of characters

**You can explain**

- [ ] Why the search term lives in the root component and not in `PeopleFilter`
- [ ] What `$event` is in `(input)="onSearch($event)"` and in `(search)="…"` — and why
      they are not the same kind of thing
- [ ] What `input.required` gives you that a plain `input()` does not

## Going further

- The `filteredPeople` getter runs on **every** change detection pass. Turn `people`
  and `search` into signals and make it a `computed()` instead. Log inside both
  versions and compare how often each runs.
- Add a `@ContentChild`/`ng-content` slot to `PeopleTable` so the parent can inject
  a custom "no result" message.
- Debounce the filter by hand with `setTimeout`, then keep the code — workshop 4
  replaces it with three lines of RxJS, and the comparison is the lesson.
