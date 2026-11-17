# A migration, not a rewrite

- JavaScript **is** TypeScript: every `.js` file can stay as it is, next to the `.ts` ones
- Migrate **incrementally**: every step builds, passes the tests, and ships

<br />

1. Add `typescript` and a `tsconfig.json` — `allowJs`, nothing checked yet
2. Let the checker **read** the JavaScript: `checkJs`, or `// @ts-check` file by file
3. Type the **leaves** first — the modules everything else imports
4. Rename `.js` to `.ts` where it pays: new code, code that changes often
5. Tighten the compiler — `strict`, then the flags beyond it

<br />

> The goal is not "zero `.js` files". It is **every file checked**.
