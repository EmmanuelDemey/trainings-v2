---
layout: cover
---

# 12 - Conclusion

---

# What to remember

<div style="display: flex; gap: 2em;">
<div>

### The principles

- Accessibility is an **investment**, not a constraint: it helps everyone
- **Native HTML first** — `<button>`, `<a>`, `<label>`, `<dialog>` do the
  work for free
- **ARIA last**, and only with the keyboard behaviour that goes with it
- Test the way users browse: **keyboard**, then **screen reader**

</div>
<div>

### In a real project

- A **design system** that ships accessible components — fix once, everywhere
- **axe in the CI**: automated checks catch the regressions
- **Manual checkpoints** at each release: tools only see 30–40 % of issues
- An **accessibility statement** kept up to date (RGAA, EAA)

</div>
</div>

---

# Checklist — your review grid

| Area | Check | WCAG |
|---|---|---|
| Page | `lang` on `<html>`, a descriptive `<title>` | 3.1.1 · 2.4.2 |
| Structure | Landmarks (`header`, `nav`, `main`, `footer`), one `h1`, no skipped level | 1.3.1 · 2.4.6 |
| Images | Every `<img>` has an `alt` — empty when decorative | 1.1.1 |
| Actions | `<button>` to act, `<a href>` to navigate | 4.1.2 |
| Forms | Every field has a `<label>`, errors are announced | 1.3.1 · 3.3.1 |
| Contrast | 4.5:1 for text, 3:1 for large text and UI components | 1.4.3 · 1.4.11 |
| Keyboard | Everything reachable, logical order, no trap | 2.1.1 · 2.4.3 |
| Focus | Always **visible** | 2.4.7 |
| Preferences | `prefers-reduced-motion`, `prefers-color-scheme`, zoom 200 % | 2.3.3 · 1.4.4 |
| Testing | Keyboard + screen reader + axe | — |

<style>
table { font-size: 0.8em; }
td, th { padding-top: 0.25em !important; padding-bottom: 0.25em !important; }
</style>

---

# Further reading

<div style="display: flex; gap: 2em;">
<div>

### References

- [W3C WAI](https://www.w3.org/WAI/) — the official resources
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) —
  patterns with keyboard behaviour
- [RGAA 4.1.2](https://accessibilite.numerique.gouv.fr/)

</div>
<div>

### To go further

- [The A11Y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [Udacity — Web Accessibility](https://www.udacity.com/course/web-accessibility--ud891)
- [Debugging accessibility with Chrome DevTools](https://www.youtube.com/watch?v=Th-nv-SCj4Q&list=PLNYkxOF6rcIDKuCU73tmdRN_-mI3tKFPD&index=14)

</div>
</div>

---

# End-of-training retro

**15 minutes.** One round, everyone speaks.

<div style="display: flex; gap: 2em; font-size: 0.95em;">
<div>

### 1. What I take away

- The one thing that **clicked** — the screen reader? landmarks? ARIA rule #1?
- Something I will **change in my project** next week

</div>
<div>

### 2. What is still fuzzy

- A notion to **revisit** — accessible names, focus management, live regions…
- A workshop step I could not finish

</div>
<div>

### 3. What we adjust

- Pace, depth, demos vs. slides
- More practice on a specific topic?

</div>
</div>

<br />

> **ROTI** (Return On Time Invested) — everyone raises 1 to 5 fingers:
> 1 = wasted my time, 5 = far more than expected. Anything below 3 gets a
> "what would have made it a 4?" follow-up.

---

# End-of-training evaluation

**10 minutes, on your own.** The final questionnaire mirrors the
self-assessment you filled in **before** the session — same questions, so you
and we can measure the progress.

<div style="display: flex; gap: 2em; font-size: 0.95em;">
<div>

### It covers

- Impairments, assistive technologies, the law (EAA, RGAA, WCAG)
- Focus and keyboard navigation
- Semantic HTML and forms
- ARIA and complex components
- Auditing: manual and automated

</div>
<div>

### Afterwards

- Keep the **workshops and their solutions**: every step is in the `README`
- The **checklist** above is your review grid for a real project
- Questions in the coming weeks: ask your trainer

</div>
</div>

---
layout: statement
---

Accessibility is not a feature.
It is a **fundamental quality** of the web.
