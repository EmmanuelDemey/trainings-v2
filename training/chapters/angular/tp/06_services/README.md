# TP 6 — Services and dependency injection

> Deck section **Services**. ~1h. Continues the project of workshop 5, and closes
> the training.

## Goal

Share state between two components that have no parent in common. By the end you
can:

- write an injectable service and say what `providedIn: 'root'` really does
- expose state as a **read-only** stream, and mutate it only through methods
- derive a second stream from the first instead of maintaining two

The feature you are adding: **liking** a character, from the table, and seeing the
count on the home page.

## Why a service at all

`PeopleItem` (deep inside the table) writes the likes. `Home` reads the count.
Passing that up through `PeopleTable` and back down, then doing it again for the
detail page on another route, is the problem services solve. The state stops
belonging to a component and starts belonging to the application.

## Prerequisites

- Workshop 5 finished: two routes, and a detail page that fetches its character

## Setup

```shell
cd first-project
npm start
```

## Steps

### 1. The service — `src/app/likes.service.ts`

```shell
ng generate service likes --type=service
```

> **Why `--type=service`?** Since Angular 20 the schematics drop the type suffix by
> default: plain `ng generate service likes` writes `likes.ts` and calls the class
> `Likes`. Both conventions are fine — pick one and hold it. These instructions say
> `LikesService`, so ask for the suffix.

```ts
@Injectable({ providedIn: 'root' })
export class LikesService {
  private readonly liked$$ = new BehaviorSubject<Person[]>([]);

  readonly liked$ = this.liked$$.asObservable();
  readonly count$ = this.liked$.pipe(map((liked) => liked.length));

  like(person: Person) { /* … */ }
  dislike(person: Person) { /* … */ }
  isLiked$(person: Person): Observable<boolean> { /* … */ }
}
```

`isLiked$` returns a **stream**, not a boolean: the button's label has to change
when the character is liked from the *other* page, and a value read once cannot do
that. (A synchronous `isLiked()` would appear to work — until you add `OnPush`, at
which point it silently stops updating. That is a bad afternoon.)

Three things this shape is doing on purpose:

- the `BehaviorSubject` is **private**, and only `asObservable()` leaves the
  service. A public subject is a shared mutable variable: any component could call
  `.next()` and the service would stop being the one place the rule lives.
- a `BehaviorSubject` and not a `Subject`: a component that subscribes **after** a
  like still gets the current value. With a plain `Subject`, the detail page you
  navigate to would start empty.
- `count$` is **derived**. Storing a `count` field next to the array is two sources
  of truth, and they drift on the first bug.

Implement `like` / `dislike` **immutably** — build a new array, do not `push` into
the current one, and emit it:

```ts
like(person: Person) {
  this.liked$$.next([...this.liked$$.value, person]);
}
```

Identify characters by `person.url`, not by object reference: the object you get
back from a second HTTP call is a different object with the same content.

### 2. `providedIn: 'root'`

Leave the decorator as the CLI generated it, and understand what it says: **one**
instance for the whole application, created the first time something injects it,
and dropped from the bundle entirely if nothing ever does.

Do **not** add `LikesService` to a component's `providers` array. That would give
that component its own instance — and the count on the home page would never move,
which is a genuinely confusing hour to debug.

### 3. The button — `PeopleItem`

```html
<button type="button" class="button is-warning" (click)="toggle()">
  {{ liked() ? 'I Dislike' : 'I Like' }}
</button>
```

> Note `class`, not `className`. `className` is React's spelling; in an Angular
> template it is just an unknown attribute, silently doing nothing — and Bulma
> never styles the button.

Inject the service and wire it:

```ts
private likes = inject(LikesService);
```

The label must follow the character's **current** state, so drive it from
`isLiked$(person())` — through the `async` pipe, or a `toSignal` of it — rather
than from a local boolean that a second component could invalidate.

### 4. The count — `Home`

```html
<h2 class="subtitle">Vous aimez {{ likes.count$ | async }} personnages</h2>
```

**Check it**: like two characters in the table, the heading says 2. Search for
something else so the rows are replaced, and the count stays. Navigate to a
character's page and back — still 2.

### 5. The detail page too

Put the same button on `PersonPage`. Liking from there must update the table's
button when you go back. This is the payoff of step 1: neither component knows the
other exists.

### 6. *(Bonus)* Survive a reload

Persist the liked characters to `localStorage`: read them in the service's
constructor, write on every change with a `tap`. Note that this is also the moment
the service stops being trivially testable — and what you would inject to fix that.

### 7. *(Bonus)* The same service, with signals

Rewrite `LikesService` with signals:

```ts
private readonly liked = signal<Person[]>([]);
readonly count = computed(() => this.liked().length);
```

Templates then read `likes.count()` with no `async` pipe. Compare the two: what
does the RxJS version still give you that the signal version does not, and vice
versa? (Hint: think about a `debounceTime`, and about reading the value
synchronously.)

### 8. *(Bonus)* An `InjectionToken`

The SWAPI base URL is hard-coded in two components. Move it into an
`InjectionToken<string>`, provided in `app.config.ts`, and inject it where it is
needed. That is the pattern for configuration that changes per environment.

## Definition of Done

**It builds and runs**

- [ ] `npm run build` exits 0
- [ ] No error in the browser console

**The behaviour is there**

- [ ] Every row has a like button whose label reflects the character's state
- [ ] Liking a character updates the count on the home page immediately
- [ ] Liking the same character twice does not count it twice
- [ ] Disliking brings the count back down
- [ ] Liking from the detail page is visible in the table when you go back
- [ ] Running a new search does not reset the likes
- [ ] `count$` is **derived** from the array — there is no `count` field to keep in sync

**It is written properly**

- [ ] The `BehaviorSubject` is private; only observables are public
- [ ] `like` / `dislike` emit a **new** array rather than mutating the current one
- [ ] `LikesService` appears in no component's `providers` array

**You can explain**

- [ ] What `providedIn: 'root'` does, and what changes if you provide the service on
      a component instead
- [ ] Why a `BehaviorSubject` and not a `Subject`
- [ ] Why the state does not belong in `Home`, even though `Home` displays the count

## Going further

- Write a unit test for `LikesService`: no `TestBed` needed — it is a class. Assert
  on the values `count$` emits, in order.
- Add an `unlikeAll()` and make the button in the header disabled when the count is
  0, driven by the stream and not by a component field.
- Make the service generic — `SelectionService<T>` — and provide it twice with two
  different tokens. What breaks, and what does that tell you about `providedIn`?
- Replace the `localStorage` read with an `APP_INITIALIZER`-style
  `provideAppInitializer`, and decide whether the application should wait for it.
