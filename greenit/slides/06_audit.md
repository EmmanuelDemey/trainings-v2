---
layout: cover
---

# 06 - Running an audit

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Run** an eco-design audit of a digital service, step by step
- **Pick** the pages and journeys to measure
- **Prioritise** the findings by effect and by effort
- **Write** an audit report a team can act on

---

# The steps of an audit

1. **Scope** — which service, which pages, which **user journeys**
2. **Need** — what is used, by whom, how often (the analytics, the users)
3. **Measure** — each page of the sample: EcoIndex, weight, requests, third parties
4. **Assess** — against a framework: the RGESN, or the 115 practices
5. **Prioritise** — effect × effort, and who acts
6. **Report** — findings, recommendations, targets
7. **Follow up** — measure again, in the CI (chapter 07)

<!--
Step 2 is the one skipped most often, and the one that finds the biggest gains: an unused feature removed beats any optimisation.
-->

---

# The sample

- Measure **journeys**, not only the home page: search, product, cart, checkout
- **The most visited** pages: the analytics tell which
- **The heaviest** pages, even if less visited
- **Empty cache**, a **mid-range phone** profile, a **4G** or **3G** throttle
- Same conditions **every time**: an audit is a baseline for the next one

<br />

> Footprint of a page × its views = what is worth fixing first.

---

# Prioritising

<div style="display: flex; gap: 2em;">
<div>

### Effect

- How many **views** does it touch?
- How many **kB**, requests, DOM elements?
- Does it lower the **device requirements**?

</div>
<div>

### Effort

- A **setting** (compression, cache)?
- A **content** change (images, videos)?
- A **code** change?
- A **product** decision (remove a feature)?

</div>
</div>

<br />

> Quick wins first to earn trust, product decisions next to earn the big gains.

---

# The report

For each finding:

| # | Finding | Where | Measure | Practice / criterion | Fix | Effect | Effort |
|---|---|---|---|---|---|---|---|
| 1 | Product photos 1000 px PNG, shown at 240 px | home, 6 images | 7.5 MB | RGESN 5.x · 115 BP | AVIF/WebP 240/480 px, `srcset`, lazy | high | low |

And at the end:

- the **baseline**: the measures before
- the **targets**: the measures after, a **budget**
- the **owners** and the **dates**

<style>
table { font-size: 0.7em; }
</style>

<!--
The format of the report of workshop 04. Insist on "measure": a finding without a figure does not survive the first meeting.
-->

---
layout: cover
---

# Workshop 04

## Audit and fix a web page

`workshops/04_frugal_page`

<!--
1 h 15. 20 min of audit with the tools, 50 min of fixes, 5 min of measure. Non-developers: the audit report is the deliverable, pair with a developer for the fixes.
-->
