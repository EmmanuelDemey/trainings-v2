# Knip

* Tool for detecting dead code in a JavaScript / TypeScript project
  * Unused files
  * Unused exports
  * Unused dependencies
  * Unlisted dependencies in `package.json`
* Works by analyzing the dependency tree from the project's entry files
* Over 100 plugins available (Vite, Vitest, ESLint, Storybook, Cypress, ...)

---

# Knip - Installation

```shell
npm install knip --save-dev
```

* Add a script in `package.json`

```json
{
  "scripts": {
    "knip": "knip"
  }
}
```

---

# Knip - Configuration

`knip.json`

```json
{
  "entry": ["src/index.ts"],
  "project": ["src/**/*.{ts,tsx}"]
}
```

* **entry**: the application's entry files
* **project**: all project files to analyze

---

# Knip - Usage

```shell
npx knip
```

* The **--fix** option automatically removes unused exports and dependencies

```shell
npx knip --fix
```

* **VSCode** extension available to view results directly in the editor
