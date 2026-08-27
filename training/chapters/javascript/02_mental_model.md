---
layout: cover
---

# 2 - Mental model

---

# The JavaScript universe

- Think of your program as a **universe of values**
- Two families of values:
  - **Primitive values**: numbers, strings, booleans, `null`, `undefined`... — **immutable**
  - **Objects** (including arrays and functions) — **mutable**
- Your code doesn't *contain* values, it **points at them**

```javascript
let message = 'Hello';
// message is not a box containing 'Hello'
// message is a wire pointing at the value 'Hello'
```

---

# Primitive values

| Type | Examples |
|------|----------|
| `number` | `42`, `3.14`, `NaN`, `Infinity` |
| `string` | `'hello'`, `"world"`, `` `template ${name}` `` |
| `boolean` | `true`, `false` |
| `undefined` | a variable with no value yet |
| `null` | an intentionally missing value |

```javascript
typeof 42        // 'number'
typeof 'hello'   // 'string'
typeof undefined // 'undefined'
typeof null      // 'object'  (historical bug!)
```

---

# Variables are wires

- A variable **points** at a value — assignment moves the wire

```javascript
let a = 10;
let b = a;   // b points at the SAME value 10
a = 20;      // a's wire moves to 20
console.log(b); // 10 — b did not move
```

- With **objects**, two variables can point at the **same object**

```javascript
const user = { name: 'Ada' };
const admin = user;      // same object!
admin.name = 'Grace';
console.log(user.name);  // 'Grace'
```

---

# Equality

- **`===`** (strict equality): same value, **no type conversion** ➜ **always use this**
- **`==`** (loose equality): converts types before comparing ➜ avoid

```javascript
2 === 2          // true
'2' === 2        // false
'2' == 2         // true   (string converted to number)
null == undefined // true  (special rule)

NaN === NaN      // false! use Number.isNaN()
```

- Two objects are equal only if they are the **same object**

```javascript
{} === {}                  // false — two different objects
const a = {}; a === a;     // true  — same object
```

---

# Truthy and falsy

- In a condition, any value is converted to a boolean
- **Falsy values** (only these): `false`, `0`, `''`, `null`, `undefined`, `NaN`
- Everything else is **truthy** (including `'0'`, `[]`, `{}`)

```javascript
if (username) {
  // runs unless username is '', null, undefined...
}

const displayName = username || 'Anonymous'; // default value
const count = quantity ?? 0; // ?? only replaces null/undefined
```

---

# Properties

- Objects are collections of **properties** (key ➜ value)

```javascript
const user = {
  name: 'Ada',
  age: 36,
};

user.name          // 'Ada'   — dot notation
user['name']       // 'Ada'   — bracket notation
user.email         // undefined — missing property, no error
user.email.length  // ❌ TypeError: cannot read 'length' of undefined
```

- Reading a **missing property** gives `undefined`
- Reading a property **of `undefined`** throws an error
- Safe navigation: `user.email?.length` ➜ `undefined`, no crash

---

# Hands-on

## Workshop 2 - Sketching snippets

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/02_mental_model/</code> — ⏱ ~45 min — open <code>index.html</code>, steps in its <code>README.md</code></div>

- Draw the diagram (variables ➜ wires ➜ values) of simple snippets
- Predict the output before running the code in the console
- Explain why `{} === {}` is `false` with a diagram
- Classify a list of values as truthy or falsy
