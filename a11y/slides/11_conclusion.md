---
layout: cover
---

# 11 - Conclusion

<!--
Last 30 minutes: 5 min recap, 15 min retro, 10 min final questionnaire. Leave the checklist slide on screen while people ask their last questions.
-->

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

- A **design system** — or a headless library — that ships accessible
  components: fix once, everywhere
- In a SPA, **announce** route changes and **move** the focus
- **axe in the CI**: automated checks catch the regressions
- **Manual checkpoints** at each release: tools fully test only about a third
  of the criteria
- An **accessibility statement** kept up to date (RGAA, EAA)

</div>
</div>

<!--
Left column = chapters 01 to 07, right column = chapters 08 and 10. Ask the room to name the chapter behind each bullet: it doubles as a quick recall exercise. The "third" figure is the one from chapter 08 (by criterion; Deque counts ~57% by volume of issues).
-->

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
| Preferences | `prefers-reduced-motion`, zoom 200 %, reflow at 320 px | 2.3.3 · 1.4.4 · 1.4.10 |
| Testing | Keyboard + screen reader + axe | — |

<style>
table { font-size: 0.8em; }
td, th { padding-top: 0.25em !important; padding-bottom: 0.25em !important; }
</style>

<!--
2.3.3 is a AAA criterion: not required by RGAA or EAA, but prefers-reduced-motion is cheap to honour (chapter 03). prefers-color-scheme has no WCAG criterion: it is comfort, not compliance, so it left the grid. The grid is a floor for a code review, not a full RGAA audit (106 criteria).
-->

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

<br />

> The full list, chapter by chapter, is in **`RESSOURCES.md`** with the course
> materials.

<!--
If people keep only one link: the WCAG 2.2 Quick Reference, filtered on level AA. The APG is the one to open before writing any custom widget. The Udacity course is free and old (2016) but its focus and ARIA parts are still accurate.
-->

---
src: ./shared/retro.md
---

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

<!--
Frameworks (10) and microdata (11) are not in the questionnaire: it mirrors the training objectives of chapter 00. Give the link, stay in the room, and do not comment on the answers while people fill it in.
-->

---
layout: statement
---

Accessibility is not a feature.
It is a **fundamental quality** of the web.

<!--
Thank everyone, remind them where the materials and solutions live, and close.
-->
