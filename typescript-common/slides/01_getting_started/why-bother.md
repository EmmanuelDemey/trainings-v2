# Why bother

- **Errors move left**: a typo, a missing `null` check, a wrong argument is
  found in the editor, not in production
- **The editor knows your code**: completion, go to definition, safe renames
- **Types are documentation** that cannot drift from the code
- **Refactoring at scale**: change a type, follow the errors

<br />

> TypeScript is not a test framework: it says the code is **consistent**, not
> that it is **right**. `total([10, 20])` returning `40` type checks perfectly.
