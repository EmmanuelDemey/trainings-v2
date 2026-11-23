---
layout: cover
---

# 07 - Continuous monitoring

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Set** an environmental budget for a page
- **Enforce** it in the CI, so that a regression fails the pull request
- **Follow** the trend over time, and report it

---

# Why continuous

An audit is a **photo**. The next sprint:

- someone uploads a **3 MB banner**
- a new **tracker** is added by marketing
- a library pulls **200 kB** of dependencies

<br />

> Without a check in the pipeline, the gains of the audit are gone in **three
> months**.

---

# An environmental budget

A few **limits**, per page or per journey, agreed by the team:

```json
{
  "maxDom": 400,
  "maxRequests": 20,
  "maxSizeKb": 300,
  "minGrade": "A"
}
```

- Set from the **baseline** of the audit, then tightened
- **Several** limits: a score alone misses what it does not weigh
- Owned by the **product**, not only by the developers

<!--
Lighthouse CI has budgets too (budget.json, resourceSizes and resourceCounts). The format here is the one of the training's measure script.
-->

---

# In the CI

```yaml
# .github/workflows/greenit-budget.yml
on:
  pull_request:
jobs:
  budget:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm run measure site --budget budget.json
```

- The pull request **fails** when a page goes over its budget
- Same idea with **Lighthouse CI**, **ecoindex-cli**, **GreenFrame**,
  **sitespeed.io**

<!--
Running a browser in the CI has its own footprint: measure the main journeys, not every page on every commit.
-->

---

# Following the trend

- **Store** the measures of each build: a CSV, a dashboard
- Watch the **trend**, not the noise of a single run
- **Report** to the team and to management: per page, per release
- Include it in the **statement of eco-design** (RGESN) and its update

---
layout: cover
---

# Workshop 05

## An environmental budget in the CI

`workshops/05_budget`

<!--
40 minutes. The surprise: the starter is still grade A with its 2 MB banner — only the size limit of the budget catches it.
-->
