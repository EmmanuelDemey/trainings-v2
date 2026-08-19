---
layout: cover
---

# 2bis - Render functions & JSX

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Read** the render function a template compiles to, and explain what
  `_openBlock`, patch flags and hoisting buy you
- **Write** a component with `h()` — props, children, slots — and translate any
  directive you know into its render-function form
- **Return a function** from `setup()` — and say why returning a VNode instead is
  the bug you will write once
- **Declare** a functional component, typed, for the cases where an instance is
  overkill
- **Set up** JSX in a Vue project, and list what `@vue/babel-plugin-jsx` gives you
  that React's JSX does not
- **Reach** for `cloneVNode`, `mergeProps` and `render()` when you need to
  manipulate or mount VNodes yourself
- **Decide** when a template is the better answer — which is most of the time

---

# Templates *are* render functions

A single-file component is not interpreted at runtime. The compiler turns the
template into JavaScript, at build time:

```vue
<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <slot />
  </div>
</template>
```

```js
// what @vitejs/plugin-vue emits
export function render(_ctx, _cache, $props, $setup) {
  return (_openBlock(), _createElementBlock("div", { class: "card" }, [
    _createElementVNode("h2", null, _toDisplayString($props.title), 1 /* TEXT */),
    _renderSlot(_ctx.$slots, "default")
  ]))
}
```

> Everything in this chapter is about **writing that function by hand**, when the
> template syntax cannot express what you need.

---

# The rendering pipeline

```
template  ──compile──▶  render()  ──call──▶  VNode tree  ──patch──▶  DOM
                                     ▲
                              h() / JSX write this directly
```

- A **VNode** is a plain object describing what the DOM should look like
- `render()` is re-invoked whenever a reactive dependency it read has changed
- The **renderer** diffs the new VNode tree against the previous one and touches
  the DOM as little as possible

<br />

| | Template | Render function |
|---|---|---|
| Written in | HTML-ish DSL | JavaScript / TypeScript |
| Structure known at | **build** time | **runtime** |
| Compiler optimizations | yes | none |
| Full language power | no | yes |

---

# `h()` — the signature

```ts
import { h } from 'vue';

h('div');                                  // <div></div>
h('div', { class: 'card' });               // props only
h('div', 'hello');                         // props omitted, text child
h('div', { class: 'card' }, 'hello');
h('div', [h('span', 'a'), ' and ', h('span', 'b')]);   // array of children
h(MyComponent, { title: 'Invoices' });     // a component, not a string
```

- `h(type, props?, children?)` — `type` is a **tag name** or a **component**
- The second argument is optional: if it is a string, an array or a VNode, it is
  read as `children`
- Children can be a string, a VNode, an array — or, for a component, a **slots
  object**

> `h` stands for *hyperscript*. Vue also exposes `createVNode`; `h` is the
> ergonomic wrapper you should use.

---

# Props are what you already know

```ts
h('button', {
  class: ['btn', { 'btn--primary': isPrimary.value }],   // same syntax as :class
  style: { color: 'red', fontSize: '14px' },             // camelCase properties
  id: dynamicId.value,                                   // any attribute
  disabled: true,                                        // false / null removes it
  innerHTML: trustedHtml.value,                          // v-html

  onClick: () => count.value++,                          // @click
  onClickCapture: onCapture,                             // @click.capture
  onKeyup: withModifiers(submit, ['enter']),             // @keyup.enter
  'onUpdate:modelValue': (v: string) => (draft.value = v), // v-model
}, 'Save');
```

- Attributes, DOM props, `class` and `style` all live in the **same object** —
  Vue picks the right strategy per key
- Listeners are just props starting with `on`, camelCased after the prefix
- Modifiers are helpers: `withModifiers(fn, ['prevent', 'stop'])`,
  `withKeys(fn, ['enter'])`

---

# Every directive, translated

| Template | Render function |
|---|---|
| `v-if="ok"` | `ok ? h('p', 'yes') : h('p', 'no')` — or `createCommentVNode()` |
| `v-for="i in list"` | `list.map(i => h('li', { key: i.id }, i.label))` |
| `@click="fn"` | `{ onClick: fn }` |
| `:disabled="d"` | `{ disabled: d }` |
| `v-bind="obj"` | `{ ...obj }` — or `mergeProps(a, b)` to merge safely |
| `v-model="x"` | `{ modelValue: x.value, 'onUpdate:modelValue': v => (x.value = v) }` |
| `v-html="s"` | `{ innerHTML: s }` |
| `v-text="s"` | `{ textContent: s }` |
| `v-show="ok"` | `withDirectives(h('div'), [[vShow, ok]])` |
| `<slot />` | `slots.default?.()` |
| `<component :is="c" />` | `h(c)` — a variable, nothing special |

> There is no `v-if` to import: control flow *is* the language. That is the whole
> point of a render function.

---

# Where a render function lives

```ts
// 1. setup() returns a render function — the usual place
export default defineComponent({
  props: { count: { type: Number, required: true } },
  setup(props) {
    const double = computed(() => props.count * 2);
    return () => h('div', `${props.count} → ${double.value}`);
  },
});
```

```ts
// 2. the `render` option — no closure, reads from `this`
export default defineComponent({
  props: { count: Number },
  render() { return h('div', String(this.count)); },
});
```

```vue
<!-- 3. inside an SFC, so you keep <style scoped> and the rest of the tooling -->
<script setup lang="ts">
import { h, useSlots } from 'vue';

const props = defineProps<{ level: 1 | 2 | 3 }>();
const slots = useSlots();

const Heading = () => h(`h${props.level}`, null, slots.default?.());
</script>

<template><Heading /></template>
```

---

# The bug you will write once

```ts
setup() {
  const count = ref(0);

  return h('div', count.value);         // ❌ a VNode
}
```

- `setup()` runs **once**. Returning a VNode renders `0` and never updates again —
  the renderer has no function to call a second time

```ts
setup() {
  const count = ref(0);

  return () => h('div', count.value);   // ✅ a function
}
```

- The returned **closure** becomes the render function. Vue tracks the `.value`
  reads *inside it*, and re-invokes it when they change
- Same reason `props.count` must be read **inside** the closure, never destructured
  outside it

---

# Slots — passing them

```ts
// <Modal title="Delete?">
//   <p>This cannot be undone.</p>
//   <template #footer="{ close }"><button @click="close">OK</button></template>
// </Modal>

h(Modal, { title: 'Delete?' }, {
  default: () => h('p', 'This cannot be undone.'),
  footer: ({ close }: { close: () => void }) =>
    h('button', { onClick: close }, 'OK'),
});
```

- Slots are an object of **functions**, one per name — never an array of VNodes
- Vue warns `Non-function value encountered for default slot` otherwise
- Why functions? The child decides **when** and **how many times** to render each
  slot, and a scoped slot needs to pass its props **into** the call

```ts
h(Modal, null, () => h('p', 'body'));   // a lone function = the default slot
```

---

# Slots — receiving them

```ts
export default defineComponent({
  setup(props, { slots }) {
    return () => h('div', { class: 'card' }, [
      h('header', slots.header?.() ?? 'Untitled'),        // fallback content
      h('main', slots.default?.({ id: props.id })),       // a scoped slot
    ]);
  },
});
```

- `slots.x?.()` returns a `VNode[]` — or `undefined` when the parent passed nothing
- Anything you pass to the call becomes the **slot props** on the parent side
- `useSlots()` is the equivalent inside `<script setup>`

> `slots` is *not* destructurable if you want it to stay up to date across
> re-renders — read `slots.x` at render time, as above.

---

# Functional components

```tsx
import { h, type FunctionalComponent } from 'vue';

const AppHeading: FunctionalComponent<{ level: 1 | 2 | 3 | 4 }> = (props, { slots }) =>
  h(`h${props.level}`, { class: 'heading' }, slots.default?.());

AppHeading.props = { level: { type: Number, required: true } };
```

- A plain function of `(props, { slots, emit, attrs })` — **no instance**, no
  `this`, no lifecycle hooks, no reactive state of its own
- Cheaper to create than a stateful component, and impossible to misuse
- Declare `props` / `emits` explicitly: **without a `props` option, everything
  arrives in `attrs` and `props` is empty**
- Attribute fallthrough still applies to the root VNode

> The natural fit: presentational leaves whose only job is to compute a tag or a
> class from their props.

---

# VNodes must be unique

```ts
const item = h('li', 'same');

h('ul', [item, item, item]);            // ❌ the same object, three times
```

- A VNode carries the instance it is currently mounted as; reusing one produces
  a patch against itself and the render is silently wrong

```ts
h('ul', Array.from({ length: 3 }, () => h('li', 'same')));   // ✅ a factory
h('ul', [item, cloneVNode(item)]);                           // ✅ or clone
```

- The same rule explains why `v-for` over a render-function result needs a **`key`**
  on each child: without it the diff falls back to index matching

---

# Manipulating VNodes you did not create

```ts
import { cloneVNode, mergeProps, Fragment, Comment } from 'vue';

setup(props, { slots }) {
  return () => {
    const children = slots.default?.() ?? [];

    return h(Fragment, children.map((child) =>
      // add a class without destroying the one the parent set
      cloneVNode(child, { class: 'row' })
    ));
  };
}
```

- `cloneVNode(vnode, extraProps)` **merges** `class`, `style` and `on*` handlers
  instead of overwriting them; `mergeProps(a, b)` does the same for plain objects
- A `<template>` at the top of a slot yields a single `Fragment` VNode — walk
  `child.children` before assuming you got the real nodes
- Comment VNodes (`child.type === Comment`) are what a falsy `v-if` leaves behind

> This is the one thing templates genuinely cannot do: **inspect and rewrite the
> children you were handed**.

---

# Mounting a VNode yourself

```ts
import { createApp, h, render, type App } from 'vue';

export function createToast() {
  return {
    install(app: App) {
      const host = document.createElement('div');
      document.body.append(host);

      const show = (message: string): void => {
        const vnode = h(ToastList, { message });
        vnode.appContext = app._context;   // inherit provides, components, plugins
        render(vnode, host);               // mount outside the component tree
      };

      app.provide(toastKey, { show });
      app.onUnmount(() => render(null, host));   // null unmounts, then remove
    },
  };
}
```

- `render(vnode, container)` is the low-level mount; `render(null, container)`
  unmounts and runs the cleanup
- Forgetting `appContext` is why the detached component cannot `inject()` anything
- This is exactly how the toast plugin of **chapter 3bis** gets on screen

---

# Setting up JSX

```bash
npm add -D @vitejs/plugin-vue-jsx
```

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({ plugins: [vue(), vueJsx()] });
```

```json
// tsconfig.json — without jsxImportSource, TS types your JSX as React's
{ "compilerOptions": { "jsx": "preserve", "jsxImportSource": "vue" } }
```

- Works in `.tsx` / `.jsx` files, and in an SFC with `<script setup lang="tsx">`
- Under the hood: `@vue/babel-plugin-jsx` compiles JSX to `createVNode` calls —
  and adds the Vue-specific sugar on the next slide

---

# JSX, three ways to say the same thing

```vue
<template>
  <ul class="list">
    <li v-for="user in users" :key="user.id" @click="select(user)">{{ user.name }}</li>
  </ul>
</template>
```

```ts
() => h('ul', { class: 'list' }, users.value.map((user) =>
  h('li', { key: user.id, onClick: () => select(user) }, user.name)
));
```

```tsx
() => (
  <ul class="list">
    {users.value.map((user) => (
      <li key={user.id} onClick={() => select(user)}>{user.name}</li>
    ))}
  </ul>
);
```

> JSX **is** `h()` — with a syntax that survives three levels of nesting.

---

# Vue JSX is not React JSX

| | React | Vue |
|---|---|---|
| CSS classes | `className` | `class` |
| Children of a component | `props.children` | a **slots object** |
| Two-way binding | none | `v-model={value}` |
| Toggling visibility | conditional render | `v-show={ok}` (keeps the node) |
| Re-render granularity | whole subtree, then memo | only the components whose deps changed |
| Reactive values | `useState` | `.value` inside the render closure |

```tsx
<Modal title="Delete?" v-slots={{ footer: () => <button>OK</button> }}>
  <p>This cannot be undone.</p>
</Modal>

<Modal>{{ default: () => <p>body</p>, footer: () => <button>OK</button> }}</Modal>
```

- `v-model={x}`, `v-model:title={x}`, `v-show={ok}` are transforms of the Babel
  plugin — they do **not** exist in the JSX standard
- Custom directives: name the local binding `vTooltip`, use `v-tooltip={value}`

---

# Reactivity behaves differently than in React

```tsx
const Counter = defineComponent({
  setup() {
    const count = ref(0);
    const label = `Clicked ${count.value} times`;      // ❌ read once, at setup

    return () => (
      <button onClick={() => count.value++}>
        {label} — {count.value /* ✅ read again at every render */}
      </button>
    );
  },
});
```

- `setup()` is **not** re-executed on update — only the returned closure is
- Anything computed outside the closure is a snapshot, forever
- No `useMemo`, no `useCallback`, no dependency arrays: an inline arrow handler
  costs nothing, because the component around it does not re-run

---

# Use case — a tag that depends on a prop

```vue
<!-- the template version: honest, and unpleasant -->
<template>
  <h1 v-if="level === 1"><slot /></h1>
  <h2 v-else-if="level === 2"><slot /></h2>
  <h3 v-else-if="level === 3"><slot /></h3>
</template>
```

```tsx
const AppHeading: FunctionalComponent<{ level: number }> = (props, { slots }) =>
  h(`h${props.level}`, slots.default?.());
```

- The dynamic-tag case is the smallest, clearest win for `h()`
- Same shape for a **polymorphic** component: `<AppButton as="a">` renders `a`,
  `router-link` or `button` depending on the props it received

```ts
h(props.to ? RouterLink : props.href ? 'a' : 'button', attrs, slots.default);
```

---

# Use case — rendering from a schema

```tsx
const FIELDS = { text: TextField, select: SelectField, date: DateField } as const;

const FormRenderer = defineComponent({
  props: { schema: { type: Array as PropType<Field[]>, required: true } },
  emits: ['update'],
  setup(props, { emit }) {
    return () => props.schema.map((field) =>
      h(FIELDS[field.type] ?? TextField, {
        key: field.name,
        label: field.label,
        modelValue: field.value,
        'onUpdate:modelValue': (v: unknown) => emit('update', field.name, v),
      })
    );
  },
});
```

- A lookup table plus `map` beats a `v-for` wrapping a `<component :is>` chain as
  soon as the mapping has any logic in it
- The rows come back as an array — Vue wraps it in a **Fragment** for you
- We come back to this in **chapter 7**, with a Zod schema driving the fields

---

# Use case — components that inspect their children

```tsx
const RadioGroup = defineComponent({
  props: { modelValue: String },
  emits: ['update:modelValue'],
  setup(props, { slots, emit }) {
    return () => h('div', { role: 'radiogroup' },
      (slots.default?.() ?? []).map((child, index) =>
        cloneVNode(child, {
          name: 'group',
          checked: child.props?.value === props.modelValue,
          onChange: () => emit('update:modelValue', child.props?.value),
          tabindex: index === 0 ? 0 : -1,
        })
      )
    );
  },
});
```

- The parent wires accessibility and state onto children it never declared
- Headless UI libraries (**Reka UI**, **Headless UI**) are built on this pattern —
  and `provide` / `inject` is the alternative when you can avoid touching VNodes

---

# What you give up

```js
// compiled from a template: the renderer is told exactly what can change
_createElementVNode("div", { class: "card" }, [
  _createElementVNode("h2", null, "Static title"),        // hoisted out of render
  _createElementVNode("p", null, _toDisplayString(_ctx.x), 1 /* TEXT */)
])
```

- **Static hoisting** — nodes that never change are created once, outside `render`
- **Patch flags** (`1 /* TEXT */`) — the diff skips props it knows are static
- **Block tree** — `_openBlock()` flattens the dynamic descendants into one list,
  so the diff is proportional to what moves, not to the tree size
- A hand-written `h()` gets **none of it**: every VNode is fully diffed
- Also lost: `<style scoped>` outside an SFC, and the readability that lets a
  non-author change a class

> And **Vapor mode** (announced for 3.6) compiles *templates*. Render functions and
> JSX stay on the VDom runtime.

---

# When to use which

✅ **Reach for a render function / JSX when**

- The tag or the component is computed (`h('h' + level)`, polymorphic wrappers)
- You must **inspect, filter or clone** the children you were handed
- The structure comes from **data**: schema-driven forms, column definitions
- You are writing a library, a plugin, or mounting outside the component tree
- You genuinely need the language: recursion, closures, higher-order components

❌ **Stay with a template when**

- The structure is known — which is the overwhelming majority of components
- Someone other than you will maintain it
- You care about the compiler's optimizations on a hot list

> Mixing is fine and normal: one `.tsx` next to forty `.vue` is a healthy ratio.

---

# Recap

- A template *is* a render function — the compiler writes it, `h()` lets you
  write it yourself
- `h(type, props?, children?)`: props hold attributes, `class`, `style` and
  `on*` listeners; children hold text, an array, or a **slots object of functions**
- `setup()` must return **a function**, not a VNode — otherwise the component
  renders once and freezes
- Functional components are `(props, ctx) => VNode`, and need their `props`
  option declared
- Never reuse a VNode object; `cloneVNode` and `mergeProps` merge instead of
  overwrite
- JSX is the same thing with better syntax — plus `v-model`, `v-show` and
  `v-slots` from `@vue/babel-plugin-jsx`, and `jsxImportSource: 'vue'` in tsconfig
- The price is every compiler optimization: hoisting, patch flags, block tree

---

# Quiz — Question 1 / 5

**`h(Modal, null, { default: [h('p', 'body')] })` logs `Non-function value
encountered for default slot`. Why does Vue insist on a function?**

- **A.** For type inference only — the warning is cosmetic
- **B.** Because the child decides when, and how many times, to render each slot,
  and a scoped slot must receive its props as arguments
- **C.** Because arrays cannot be keyed
- **D.** Because functions are cheaper to create than arrays

<v-click>

> ✅ **B** — An array is evaluated **once, in the parent**. A slot has to be
> re-invocable: rendered zero times (`v-if` inside the child), twice (a list), or
> with data flowing back (`slots.default({ id })`). Only a function can do that.

</v-click>

---

# Quiz — Question 2 / 5

**A component built with `setup() { const n = ref(0); return h('p', n.value) }`
shows `0` and never updates, even though the ref changes. What is wrong?**

- **A.** `n` must be a `reactive`, not a `ref`
- **B.** `h` does not track reactivity — use `createVNode`
- **C.** `setup()` returned a VNode instead of a function, so there is nothing for
  the renderer to call again
- **D.** The component is missing a `key`

<v-click>

> ✅ **C** — `setup()` runs once. The **returned closure** is the render function;
> Vue tracks the dependencies read inside it and re-invokes it. Return
> `() => h('p', n.value)` and the same code works.

</v-click>

---

# Quiz — Question 3 / 5

**Your `.tsx` builds and runs, but `vue-tsc --noEmit` fails with
`Property 'class' does not exist on type 'DetailedHTMLProps<...>'`. What is missing?**

- **A.** `@types/react` must be installed
- **B.** `"jsxImportSource": "vue"` in `tsconfig.json` — TypeScript is typing the
  JSX against React
- **C.** `@vitejs/plugin-vue-jsx` must be listed before `@vitejs/plugin-vue`
- **D.** JSX has to live in `.vue` files to be typed

<v-click>

> ✅ **B** — Vite compiles the JSX correctly either way; the error comes from the
> **type layer**. `jsxImportSource` tells TS which package provides `JSX.IntrinsicElements`.
> React's says `className`, Vue's says `class` — hence the error on the attribute
> that is actually correct.

</v-click>

---

# Quiz — Question 4 / 5

**`const row = h('li', 'x'); return () => h('ul', [row, row, row])` renders one
`<li>`, or renders wrong. Why?**

- **A.** Arrays need a `Fragment` wrapper
- **B.** A VNode carries the instance it is mounted as; the same object cannot be
  in the tree three times — build it from a factory, or `cloneVNode` it
- **C.** `h('li', 'x')` is hoisted and therefore shared
- **D.** Children arrays are deduplicated by value

<v-click>

> ✅ **B** — VNodes are single-use. The template compiler never produces this
> because it creates a fresh VNode per iteration; by hand, `Array.from({ length: 3 },
> () => h('li', 'x'))` is the fix — and give each one a `key` while you are there.

</v-click>

---

# Quiz — Question 5 / 5

**You rewrite a mostly-static 500-row table from a template to `h()`, expecting it
to be faster. It gets slower. What happened?**

- **A.** `h()` allocates more than `createElementVNode`
- **B.** You lost static hoisting, patch flags and the block tree — the renderer
  now fully diffs nodes the compiler used to skip
- **C.** JSX disables the reactivity system's caching
- **D.** Render functions run outside the scheduler

<v-click>

> ✅ **B** — The compiler annotates what can change; a hand-written render function
> arrives without annotations, so every prop of every node is compared. Render
> functions are for **expressiveness**, never for speed — measure before assuming.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 2bis - Render functions & JSX — 45 min

Continue in `tp/02_advanced_components`, on top of the finished `DataTable`:

1. Replace the `v-if` cascade of `AppHeading` with a **functional component**
   computing `h('h' + level)` — typed, `props` declared, attributes still falling
   through
2. Turn the `DataTable` header into a render function that reads its **scoped
   slots** and falls back to the column label when a slot is absent
3. Add `@vitejs/plugin-vue-jsx` + `jsxImportSource`, and rewrite the body rows in
   **`.tsx`** — `vue-tsc --noEmit` must stay green
4. Build a `RadioGroup` that `cloneVNode`s its children to inject `name`,
   `checked` and `tabindex` — check with the Devtools that the parent's classes
   survived
5. Mount a toast **outside** the component tree with `render(vnode, host)`, set
   `appContext`, and prove `inject()` works inside it
6. *(Bonus)* Diff the two builds in the Vue template explorer, and explain which
   patch flags the JSX version no longer emits

**Done when** the table behaves exactly as before, and you can name — table in
hand — one thing each version does that the other cannot.

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
