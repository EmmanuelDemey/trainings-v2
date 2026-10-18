---
layout: cover
---

# 23 - React Doctor

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Run** React Doctor on a codebase and **read** its health score and diagnostics
- **Recognize** the effect anti-patterns it reports — derived state, effect
  chains, state reset and event logic in effects — and **fix** them
- **Explain** why an index `key` breaks a reorderable list
- **Target** a scan (changed files, categories) and **configure** rules
- **Integrate** it in ESLint, in a pre-commit hook, in CI and in coding agents

---

# What is React Doctor?

- A command-line **audit** of a React codebase, by Million Software
- **Deterministic** analysis (no LLM): the same sources always give the same report
- ~900 rules in five categories: **Bugs**, **Performance**, **Security**,
  **Accessibility**, **Maintainability**
- Rule families for the ecosystem: React Compiler, Next.js, React Native,
  TanStack Query / Start, Zustand, Motion…
- A **health score out of 100**, and the list of diagnostics behind it
- Works on Vite, Next.js, React Router, Astro, TanStack Start, React Native, Expo
- Modified MIT licence: free for the vast majority of uses

[react.doctor](https://www.react.doctor/)

---

# A first scan

```bash
npx react-doctor@latest            # at the project root, nothing to install
npx react-doctor@latest --verbose  # every rule, with files and line numbers
```

- Detects the framework, the React version, and the rule set to apply
- By default the scan also runs **maintainability** analyses:
  - components and hooks that are too **complex**
  - **duplicated JSX** structures, candidates for a shared component
- And a **supply-chain** check of your dependencies (`--no-supply-chain` to skip)

```bash
npx react-doctor@latest rules list
npx react-doctor@latest rules explain react-doctor/no-derived-state
npx react-doctor@latest why src/App.tsx:42          # why did a rule fire here?
```

- Each rule is named `react-doctor/<rule-name>`, and links to its documentation

---

# Anti-pattern 1 — derived state in an effect

```tsx
// ❌ react-doctor/no-derived-state
function PeopleTable({ people, search }: Props) {
  const [filtered, setFiltered] = useState<Person[]>([]);

  useEffect(() => {
    setFiltered(people.filter((p) => p.name.toLowerCase().includes(search)));
  }, [people, search]);

  return <Table rows={filtered} />;
}
```

```tsx
// ✅ computed during render
function PeopleTable({ people, search }: Props) {
  const filtered = people.filter((p) => p.name.toLowerCase().includes(search));
  return <Table rows={filtered} />;
}
```

- The effect version renders **twice** per change, and the first render shows a
  **stale** list
- Expensive? `useMemo` — or let the React Compiler memoize it (chapter 24)

---

# Anti-pattern 2 — an index as `key`

```tsx
// ❌ react-doctor/no-array-index-as-key
{people.map((person, index) => (
  <li key={index}>
    {person.name} <input aria-label={`Note for ${person.name}`} />
  </li>
))}
```

- Sort or remove an item: React matches rows **by position**, so the `<input>`
  that held Luke's note now sits next to Leia
- Uncontrolled inputs, focus, animations, component state — all follow the
  **key**, not the data

```tsx
// ✅ a stable id from the data
{people.map((person) => (
  <li key={person.id}>…</li>
))}
```

- `Math.random()` or `crypto.randomUUID()` in `key` is worse:
  `react-doctor/no-random-key` — every render remounts every row

---

# Anti-pattern 3 — an effect chain

```tsx
// ❌ react-doctor/no-effect-chain
const [person, setPerson] = useState<Person | null>(null);
const [planet, setPlanet] = useState<string | null>(null);
const [title, setTitle] = useState('');

useEffect(() => { if (person) setPlanet(person.homeworld); }, [person]);
useEffect(() => { if (planet) setTitle(`${person?.name} from ${planet}`); }, [planet, person]);
```

- Each link = one **extra render**, and intermediate states nobody wants to see
- The flow is hidden: "what happens when I select a person?" needs three effects

```tsx
// ✅ derive what can be derived, set the rest in the event handler
const [person, setPerson] = useState<Person | null>(null);
const planet = person?.homeworld ?? null;
const title = person ? `${person.name} from ${planet}` : '';
```

---

# Anti-pattern 4 — resetting state in an effect

```tsx
// ❌ react-doctor/no-reset-all-state-on-prop-change
function PersonNotes({ personId }: { personId: string }) {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNote('');
    setSaved(false);
  }, [personId]);
  // …
}
```

- One render with **Luke's note on Leia's page**, then a reset
- Every new piece of state must be added to the reset by hand

```tsx
// ✅ a new key = a new component instance, with fresh state
<PersonNotes key={personId} personId={personId} />
```

- Need to adjust **part** of the state only? Compute it during render
  (`react-doctor/no-adjust-state-on-prop-change`)

---

# Anti-pattern 5 — event logic in an effect

```tsx
// ❌ react-doctor/no-event-handler
const [submitted, setSubmitted] = useState(false);

useEffect(() => {
  if (submitted) {
    void createPerson(form);
    showToast('Person created');
  }
}, [submitted, form]);

return <button onClick={() => setSubmitted(true)}>Create</button>;
```

- The side effect runs **late** (after an extra render), and **again** if `form`
  changes while `submitted` is still `true`
- The question to ask: **why** does this code run? Because the user clicked → it
  belongs in the **handler**

```tsx
// ✅
async function handleCreate() {
  await createPerson(form);
  showToast('Person created');
}
return <button onClick={handleCreate}>Create</button>;
```

---

# More rules worth knowing

- **Bugs**
  - `effect-needs-cleanup` — return the cleanup of a subscription or a timer
  - `no-direct-state-mutation` — mutating state in place triggers no render
  - `no-fetch-in-effect` — prefer TanStack Query (chapter 17), a router loader,
    or a Server Component
  - `rules-of-hooks`, `exhaustive-deps` — the classics, built in
- **Performance**
  - `jsx-no-constructed-context-values` — a new object as `Provider` value
    re-renders every consumer
- **Security**
  - `artifact-env-leak` — a secret behind a `VITE_` prefix is readable by anyone
  - `dangerous-html-sink` — `dangerouslySetInnerHTML` fed by user data
- **Accessibility**
  - `label-has-associated-control`, `alt-text`, `click-events-have-key-events`
- Ecosystem: `query-mutation-missing-invalidation`, `zustand-no-mutating-state`…

---

# Targeting the scan

- On an existing codebase, the full report is often discouraging
- **`--scope changed`** reports only the problems **introduced** by the branch

```bash
npx react-doctor@latest --verbose --scope changed --base main
```

- Other scopes: `full` (default), `files`, `lines`, `contextual`
- **`--category`** restricts the report (repeatable)

```bash
npx react-doctor@latest --category Security --category Performance
```

- **`--staged`** only scans staged files — made for a pre-commit hook (husky,
  chapter 1)
- **`--baseline report.json`** — only what is new compared to a saved report

---

# Outputs and exit codes

```bash
npx react-doctor@latest --json > report.json      # a structured report
npx react-doctor@latest --score                   # the score only
npx react-doctor@latest --blocking warning        # fail on warnings too
```

- **`--blocking`** drives the exit code: `error` (default), `warning` or `none`
- **`-y`** skips every interactive prompt — required in CI
- **`--no-score`** (alias `--no-telemetry`) skips the score API, the share URL
  and crash reporting — for private code
- `react-doctor design` — a focused audit of UI design issues
- `react-doctor scan http://localhost:5173` — profiles a real **interaction** in Chrome

---

# Configuration

```ts
// doctor.config.ts — or .json, or a "reactDoctor" key in package.json
import { defineConfig } from 'react-doctor/api';

export default defineConfig({
  rules: {
    'react-doctor/no-array-index-as-key': 'error',
  },
  categories: {
    Maintainability: 'warn',
  },
  ignore: {
    rules: ['react-doctor/no-danger'],
    files: ['src/generated/**'],
  },
});
```

- Or from the command line: `react-doctor rules set <rule> error`,
  `rules disable <rule>`, `rules category Security error`
- Command-line flags **override** the configuration file

---

# ESLint, CI and coding agents

```bash
npm install -D eslint-plugin-react-doctor
```

```js
// eslint.config.js
import reactDoctor from 'eslint-plugin-react-doctor';

export default [reactDoctor.configs.recommended];
```

- Presets per stack: `next`, `react-native`, `tanstack-query`, `tanstack-start`,
  `preact`, `all`; an `oxlint-plugin-react-doctor` exists too
- Project-wide rules (secret leaks, config) only run through the **CLI**

```bash
npx react-doctor@latest ci install     # generates .github/workflows/react-doctor.yml
npx react-doctor@latest install        # the rules as a skill for Claude Code, Cursor, Codex…
```

- The CI **comments** new problems on the pull request without blocking;
  `react-doctor ci config` hardens it. Elsewhere: `--scope changed --blocking error`
- Agents learn the rules **before** writing code, and can re-scan what they produced

---

# Recap

- React Doctor: a **deterministic** audit, ~900 rules, a **score out of 100**
- `npx react-doctor@latest --verbose`; `rules explain`, `why file:line` to understand
- Most findings are effects that should not exist:
  **derive** during render, **`key`** to reset, logic in the **event handler**
- **Stable keys** from the data — never the index, never random
- Target with `--scope changed`, `--category`, `--staged`; drive CI with `--blocking`
- Configure in `doctor.config.ts`; ESLint plugin, CI workflow, agent skill

---

# Quiz — Question 1 / 3

```tsx
const [fullName, setFullName] = useState('');
useEffect(() => { setFullName(`${first} ${last}`); }, [first, last]);
```

**What does React Doctor recommend?**

- **A.** Add `fullName` to the dependency array
- **B.** Replace the effect with `useLayoutEffect` to avoid the flicker
- **C.** Compute it during render: `` const fullName = `${first} ${last}` ``
- **D.** Move `fullName` into a Context

<v-click>

> ✅ **C** — `no-derived-state`: a value computed from props or state is
> not state. The effect costs an extra render and shows a stale value first.

</v-click>

---

# Quiz — Question 2 / 3

**A sortable list uses `key={index}`, and each row holds an uncontrolled
`<input>`. The user types in row 1, then sorts the list. What happens?**

- **A.** The text follows its person — React tracks the data
- **B.** The text stays in the **first row**, now showing another person
- **C.** All inputs are cleared
- **D.** React throws a duplicate key error

<v-click>

> ✅ **B** — React matches elements by key. With the index, "row 0" is still
> "row 0" after sorting, so its DOM node — and the typed text — stays there.
> `key={person.id}` moves the input with its person.

</v-click>

---

# Quiz — Question 3 / 3

**A legacy codebase scores 41/100. You want CI to stop new problems without
fixing everything first. Which command?**

- **A.** `npx react-doctor@latest --score`
- **B.** `npx react-doctor@latest --scope changed --base main --blocking error -y`
- **C.** `npx react-doctor@latest --no-lint`
- **D.** `npx react-doctor@latest design`

<v-click>

> ✅ **B** — `--scope changed` reports only what the branch introduces,
> `--blocking error` fails the job on errors, `-y` skips the prompts. Fix the
> legacy at your own pace.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 23 - React Doctor
