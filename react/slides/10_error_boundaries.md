---
layout: cover
---

# 10 - Error boundaries

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what React does when a component throws during render — and why a
  blank page is the default
- **Write** an error boundary class with `getDerivedStateFromError` and
  `componentDidCatch`
- **Place** boundaries so that one broken widget does not take the whole page down
- **Reset** a boundary with a retry button and with `resetKeys`
- **List** what a boundary does **not** catch — event handlers, async code — and
  handle those errors with state
- **Use** `react-error-boundary` instead of maintaining your own class

---

# A render error unmounts everything

```tsx
function PersonCard({ person }: { person: Person }) {
  return <h2>{person.name.toUpperCase()}</h2>;   // person.name is undefined 💥
}
```

- An error thrown **while rendering** (or in a lifecycle / effect) propagates up the tree
- With no boundary to catch it, React **unmounts the whole root**: a blank page
- Rationale: showing a half-broken UI (a wrong balance, a stale cart) is worse than
  showing nothing

<br />

React 19 lets you observe these errors at the root:

```tsx
createRoot(document.getElementById('root')!, {
  onUncaughtError: (error, info) => reportError(error, info.componentStack),
  onCaughtError: (error, info) => reportError(error, info.componentStack), // caught by a boundary
}).render(<App />);
```

---

# Error boundaries

An **error boundary** is a component that:

- catches errors thrown while rendering **its children**
- renders a **fallback UI** instead of the broken subtree
- lets the rest of the page keep working

<br />

```tsx
<Layout>
  <Header />
  <ErrorBoundary fallback={<p>The people table is unavailable.</p>}>
    <PeopleTable />            {/* crashes → only this area shows the fallback */}
  </ErrorBoundary>
  <Footer />
</Layout>
```

- There is **no hook** for this: a boundary is the last place you still write a class
- In practice you write it once — or install `react-error-boundary`

---

# Writing one

```tsx
type Props = { fallback: ReactNode; children: ReactNode };
type State = { error: unknown; hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, hasError: false };

  // render phase: compute the state that shows the fallback (must be pure)
  static getDerivedStateFromError(error: unknown): State {
    return { error, hasError: true };
  }

  // commit phase: side effects allowed — log, report
  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Caught by ErrorBoundary', error, info.componentStack);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
```

---

# A fallback that knows the error and can retry

```tsx
type FallbackProps = { error: unknown; reset: () => void };
type Props = { fallback: (props: FallbackProps) => ReactNode; children: ReactNode };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, hasError: false };
  static getDerivedStateFromError(error: unknown): State { return { error, hasError: true }; }

  reset = () => this.setState({ error: null, hasError: false });

  render() {
    if (this.state.hasError) return this.props.fallback({ error: this.state.error, reset: this.reset });
    return this.props.children;
  }
}
```

```tsx
<ErrorBoundary fallback={({ error, reset }) => (
  <div role="alert">
    <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
    <button onClick={reset}>Try again</button>
  </div>
)}>
```

- `reset` re-renders the children: useful when the cause was transient

---

# Resetting automatically: `resetKeys`

The user picks **another person** while the fallback is shown: the boundary should retry.

```tsx
type Props = { /* … */ resetKeys?: unknown[] };

componentDidUpdate(prevProps: Props) {
  const changed = (a: unknown[] = [], b: unknown[] = []) =>
    a.length !== b.length || a.some((value, i) => !Object.is(value, b[i]));

  if (this.state.hasError && changed(prevProps.resetKeys, this.props.resetKeys)) {
    this.reset();
  }
}
```

```tsx
<ErrorBoundary resetKeys={[selectedId]} fallback={…}>
  <PersonDetails id={selectedId} />
</ErrorBoundary>
```

- Simpler alternative: `<ErrorBoundary key={selectedId}>` — a new key mounts a brand-new
  boundary (and a brand-new subtree, losing its state)

---

# Where to put boundaries

<br />

| Granularity | Effect of a crash |
|---|---|
| One around `<App />` | a friendly "Something went wrong" page instead of a blank one |
| One per **route** | navigation still works, the other pages too |
| One per **widget** | the dashboard loses one card, keeps the rest |
| One per list item | ❌ usually too fine: noise and cost |

<br />

- Start with **one at the top** — always — then add them where a feature can fail alone
- Put the boundary **above** the component that may throw: a component cannot catch its
  own render error
- The router has its own per-route boundary (`ErrorBoundary` route field, chapter 14)

---

# What a boundary does **not** catch

<br />

| Error thrown in… | Caught? | Why |
|---|---|---|
| render, `useMemo`, effects, lifecycles | ✅ | React is on the call stack |
| an **event handler** (`onClick`) | ❌ | runs after render, React does not need to redraw |
| `setTimeout`, a `.then()`, an `await` | ❌ | runs later, outside React's call stack |
| the boundary's **own** render | ❌ | it goes to the next boundary up |
| server-side rendering | ❌ | — |

<br />

- An event handler error leaves the UI **consistent**: React chose not to tear it down
- These errors need **regular JavaScript**: `try/catch`, then state

---

# Handling event-handler errors with state

```tsx
function DeleteButton({ id }: { id: string }) {
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setError(null);
      await deletePerson(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');   // show it inline
    }
  };

  return (
    <>
      <button onClick={handleClick}>Delete</button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
```

- An inline message keeps the context: the user sees **which** action failed

---

# Sending an async error to the boundary anyway

Sometimes the error **is** fatal for the subtree. Re-throw it **during a render**:

```tsx
const [, setState] = useState();

const handleClick = async () => {
  try {
    await loadEverything();
  } catch (error) {
    setState(() => { throw error; });   // thrown while React computes the next state
  }
};
```

- The updater function runs **during render**: the nearest boundary catches it
- In React 19, an error thrown inside `startTransition(async () => …)` (an **Action**)
  also reaches the nearest boundary
- `react-error-boundary` wraps this trick as `showBoundary(error)`

---

# `react-error-boundary`

```shell
npm install react-error-boundary
```

```tsx
import { ErrorBoundary, getErrorMessage, type FallbackProps } from 'react-error-boundary';

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong: {getErrorMessage(error)}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary
  FallbackComponent={Fallback}          // or fallback={<p>…</p>} or fallbackRender={(p) => …}
  resetKeys={[selectedId]}
  onError={(error, info) => reportError(error, info.componentStack)}
  onReset={() => clearCache()}
>
  <PersonDetails id={selectedId} />
</ErrorBoundary>
```

- `error` is typed `unknown`: anything can be thrown, not only `Error`s

---

# `useErrorBoundary`

```tsx
import { useErrorBoundary } from 'react-error-boundary';

function ExportButton() {
  const { showBoundary } = useErrorBoundary();

  const handleClick = async () => {
    try {
      await exportPeople();
    } catch (error) {
      showBoundary(error);     // hand an async / event error to the nearest boundary
    }
  };

  return <button onClick={handleClick}>Export</button>;
}
```

- Must be used **inside** an `<ErrorBoundary>` subtree
- `resetBoundary()` is also available, e.g. from a "retry" button inside the subtree

---

# Testing a boundary

```tsx
function Bomb(): ReactNode {
  throw new Error('Boom');
}

it('shows the fallback when a child crashes, and keeps the rest of the page', () => {
  using _spy = vi.spyOn(console, 'error').mockImplementation(() => {});  // React logs the error

  render(
    <>
      <h1>People</h1>
      <ErrorBoundary fallback={({ error }) => <p role="alert">{String(error)}</p>}>
        <Bomb />
      </ErrorBoundary>
    </>,
  );

  expect(screen.getByRole('alert')).toHaveTextContent('Boom');
  expect(screen.getByRole('heading', { name: 'People' })).toBeInTheDocument();
});
```

- `using` restores `console.error` at the end of the test — no `mockRestore()` to forget

---

# Recap

- A render error with no boundary **unmounts the whole root** — observe it with
  `onUncaughtError` / `onCaughtError` on `createRoot`
- A boundary is a **class** with `getDerivedStateFromError` (show the fallback) and
  `componentDidCatch` (log)
- Give the fallback the `error` and a `reset`; reset automatically with `resetKeys`, or
  remount with `key`
- One boundary at the top, then one per route or per independent widget
- Event handlers and async code are **not** caught: `try/catch` + state, or re-throw
  during render with `showBoundary`
- In real projects, use **`react-error-boundary`**

---

# Quiz — Question 1 / 3

**A click handler throws an error. The button is inside an `<ErrorBoundary>`. What happens?**

- **A.** The boundary shows its fallback
- **B.** The whole root is unmounted
- **C.** Nothing visible: the error is not caught by the boundary, the UI stays as it was
- **D.** React retries the click

<v-click>

> ✅ **C** — Event handlers run outside rendering, so boundaries ignore them. The UI is
> still consistent; the error only reaches the console (and `window.onerror`). Catch it
> and store it in state, or forward it with `showBoundary`.

</v-click>

---

# Quiz — Question 2 / 3

**Why must an error boundary be a class component?**

- **A.** Function components cannot have state
- **B.** `getDerivedStateFromError` and `componentDidCatch` have no hook equivalent
- **C.** Classes render faster
- **D.** It does not have to: `useErrorBoundary` is a built-in React hook

<v-click>

> ✅ **B** — React has no hook for catching render errors yet. `useErrorBoundary` comes
> from the `react-error-boundary` library and only *triggers* the nearest (class-based)
> boundary.

</v-click>

---

# Quiz — Question 3 / 3

**The details of person 3 crash; the fallback is shown. The user selects person 4. How do you make the boundary retry automatically?**

- **A.** Call `window.location.reload()`
- **B.** Pass `resetKeys={[selectedId]}` (or `key={selectedId}`) to the boundary
- **C.** Wrap `PersonDetails` in `memo`
- **D.** Add a `try/catch` inside `PersonDetails`'s JSX

<v-click>

> ✅ **B** — When a reset key changes, the boundary clears its error and renders its
> children again. A changing `key` achieves the same by mounting a fresh boundary.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 10 - Error boundaries
