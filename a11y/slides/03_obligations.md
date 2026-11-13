---
layout: cover
---

# 03 - Standards and legal obligations

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Name** the standards — WCAG, EN 301 549, RGAA — and how they relate
- **Explain** the structure of WCAG 2.2: 4 principles, guidelines, success
  criteria, levels **A / AA / AAA**
- **Tell** who is legally bound, in Europe and in France, and which documents
  are mandatory
- **Argue** with real cases — lawsuits, success stories, ROI
- **Audit** a page by hand and map each problem to a WCAG criterion —
  workshop 02

---

# The standards, from global to local

| Standard | Scope | What it is |
|---|---|---|
| **WCAG 2.2** | International (W3C) | The reference: testable success criteria — also **ISO 40500** (2.0) |
| **EN 301 549** | European Union | The European standard for ICT products — references **WCAG 2.1 AA** |
| **RGAA 4.1** | France | A method to **test** WCAG 2.1 AA, criterion by criterion |
| BS 8878 → **ISO 30071-1** | United Kingdom | A process standard: how to build accessibility in |
| **AnySurfer** | Belgium | A quality label and its checklist |
| **Renow** | Luxembourg | The national framework, derived from WCAG |
| **eCH-0059** | Switzerland | The federal standard, based on WCAG |

<br />

> Whatever the country, the **technical** content is WCAG. The local standards
> say **how to test it** and **who must comply**.

<style>
table { font-size: 0.85em; }
</style>

---

# The W3C and its accessibility guidelines

| Acronym | Stands for | Covers |
|---|---|---|
| **W3C** | World Wide Web Consortium | The international community that writes the Web standards — led by its inventor, Tim Berners-Lee |
| **WAI** | Web Accessibility Initiative | The W3C group in charge of accessibility |
| **WCAG** | Web Content Accessibility Guidelines | The **content**: pages, apps — what you build |
| **ATAG** | Authoring Tool Accessibility Guidelines | The **tools** that produce content: CMS, editors |
| **UAAG** | User Agent Accessibility Guidelines | The **browsers** and media players |
| **ARIA** | Accessible Rich Internet Applications | Roles, states, properties for custom widgets — chapter 07 |

- Stay up to date: [W3C WAI News](https://www.w3.org/WAI/news/)

<style>
table { font-size: 0.85em; }
</style>

---

# WCAG — four principles, POUR

<div style="display: flex; gap: 2em;">
<div>

| Principle | The content must be… | For example |
|---|---|---|
| **P**erceivable | presented in a way users can **perceive** | text alternatives, captions, contrast |
| **O**perable | **usable** with any input | keyboard, enough time, no seizures |
| **U**nderstandable | **understood**, predictable | language, consistent navigation, error help |
| **R**obust | read by **today's and tomorrow's** tools | valid roles, names and states |

</div>
<div>

### WCAG 2.2, in numbers

- **4** principles
- **13** guidelines
- **86** testable success criteria
- **3** conformance levels

Each criterion has a number — *1.1.1 Non-text Content*, *2.4.7 Focus
Visible* — and a level.

</div>
</div>

<style>
table { font-size: 0.8em; }
</style>

---

# WCAG — from 1.0 to 3.0

| Version | Year | What changed |
|---|---|---|
| **1.0** | 1999 | The first version |
| **2.0** | 2008 | Major overhaul: technology-neutral, testable — became **ISO 40500** |
| **2.1** | 2018 | **17** criteria added: mobile, low vision, cognitive |
| **2.2** | Oct. 2023 | **9** criteria added, **4.1.1 Parsing** removed |
| **3.0** | in progress | New model and scoring — **not** a legal reference yet |

WCAG 2.2 additions:

- **Focus Not Obscured** (2.4.11 AA, 2.4.12 AAA) · **Focus Appearance** (2.4.13 AAA)
- **Dragging Movements** (2.5.7 AA) · **Target Size (Minimum)** (2.5.8 AA)
- **Consistent Help** (3.2.6 A) · **Redundant Entry** (3.3.7 A)
- **Accessible Authentication** (3.3.8 AA, 3.3.9 AAA)

**Sources**: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) ·
[WCAG history](https://www.w3.org/WAI/standards-guidelines/wcag/)

<style>
table { font-size: 0.85em; }
</style>

---

# Conformance levels — A, AA, AAA

| Level | Criteria | Means | Example |
|---|---|---|---|
| **A** — minimum | **31** | Without them, some users **cannot access** the content at all | Every image has a text alternative (1.1.1) |
| **AA** — required | **+24** (55 in total) | The **legally required** level almost everywhere | Text contrast of at least **4.5:1** (1.4.3) |
| **AAA** — excellence | **+31** (86 in total) | Recommended, **not always achievable** for all content | Contrast of **7:1** (1.4.6), sign language for videos (1.2.6) |

<br />

> Picture the levels as mountains. The first peak to reach is **AA** — it
> includes both A and AA criteria. Behind it, in the mist, there is a larger
> peak, **AAA**. That one is not always completely reachable.
>
> — **Marie Guillaumet**

**Source**: [Understanding Levels of Conformance](https://www.w3.org/WAI/WCAG22/Understanding/conformance#levels)

<style>
table { font-size: 0.85em; }
</style>

---

# In Europe — two texts

<div style="display: flex; gap: 2em;">
<div>

### Web Accessibility Directive — 2016/2102

- Adopted on **26 October 2016**
- The **public sector**: national, regional and local authorities, and bodies
  funded by public money
- Websites and mobile apps, based on **EN 301 549** (WCAG 2.1 AA)
- Deadlines: new sites **Sept. 2019**, existing sites **Sept. 2020**, mobile
  apps **June 2021**
- Transposed by each member state — e.g. the UK *Public Sector Bodies
  Accessibility Regulations 2018*, the French *décret n° 2019-768*

[Directive (EU) 2016/2102](https://eur-lex.europa.eu/eli/dir/2016/2102/oj)

</div>
<div>

### European Accessibility Act — 2019/882

- Applies since **28 June 2025**
- The **private sector**: e-commerce, banking, transport, e-books,
  telecoms, and the devices behind them
- Same technical reference: **EN 301 549**
- Micro-enterprises providing services (< 10 people, ≤ €2M) are exempt

[Directive (EU) 2019/882](https://eur-lex.europa.eu/eli/dir/2019/882/oj)

</div>
</div>

---

# In France — RGAA 4.1

<div style="display: flex; gap: 2em;">
<div>

- **R**éférentiel **G**énéral d'**A**mélioration de l'**A**ccessibilité
- Version **4.1** (February 2021): the French method to check **WCAG 2.1 AA**
- **106 criteria** in **13 themes**, each with test procedures
- WCAG 2.1 AA + a few French specifics

[Official RGAA 4.1](https://accessibilite.numerique.gouv.fr/)

</div>
<div>

| # | Theme | # | Theme |
|---|---|---|---|
| 1 | Images | 8 | Mandatory elements |
| 2 | Frames | 9 | Information structure |
| 3 | Colours | 10 | Information presentation |
| 4 | Multimedia | 11 | Forms |
| 5 | Tables | 12 | Navigation |
| 6 | Links | 13 | Consultation |
| 7 | Scripts | | |

</div>
</div>

<style>
table { font-size: 0.8em; }
</style>

---

# In France — who must comply, and what to publish

<div style="display: flex; gap: 2em;">
<div>

### Who

- **Public sector** (décret du 24 juillet 2019): administrations, local
  authorities, public institutions
- **Private sector**: companies with a turnover above **€250 million** — and,
  since June 2025, the EAA services
- Same requirement: **RGAA 4.1** (WCAG 2.1 AA)
- **Penalty**: up to **€20,000 per service and per year** (raised to €50,000
  by the EAA transposition)

[Décret n° 2019-768](https://www.legifrance.gouv.fr/eli/decret/2019/7/24/CPAE1913344D/jo/texte)

</div>
<div>

### Three mandatory documents

1. **Déclaration d'accessibilité** — the statement: compliance level
   (non / partially / fully compliant), test results, justified exemptions
2. **Schéma pluriannuel** — the 3-year accessibility strategy
3. **Plans d'action annuels** — the concrete actions of each year

[RGAA legal obligations](https://accessibilite.numerique.gouv.fr/obligations/)

</div>
</div>

---

# Why most sites are still not accessible

<div style="display: flex; gap: 2em;">
<div>

### The reasons

- **Not a priority** for the project
- Seen as bringing **no added value**
- **Few people** know how

### The most common mistakes

- **Interactive elements** that are not buttons or links
- A **DOM order** that differs from the visual order
- Missing **text alternatives**
- No **skip links**
- No visible **focus** style

</div>
<div>

### Who is involved — everyone

- **Product** — PM, PO, Scrum Master: it is in the backlog, or it is not
- **UX / UI** — contrast, targets, focus, flows
- **Developers** — semantics, keyboard, ARIA
- **Content designers** — headings, alternatives, plain language
- **QA** — keyboard and screen reader tests

</div>
</div>

<br />

> Imagine the needs of disabled people as a rainbow. Each type of disability has
> specific needs, but together, all the adjustments create a cohesive whole.
> The guidelines and success criteria help ensure we forget nothing.
> — **Marie Guillaumet**

---

# Court cases

| Case | Year | What happened | Outcome |
|---|---|---|---|
| **Robles v. Domino's Pizza** (USA) | 2019 | A blind user could not order on the site or the app with a screen reader | The Supreme Court **declined the appeal**: the ADA applies to sites tied to physical "places of public accommodation". Legal fees + full overhaul |
| **Parkwood Entertainment** — Beyoncé (USA) | 2019 | Merchandising site: images without alternatives, no keyboard navigation | **Settled** out of court, site brought into compliance |
| **French ministries** | 2020 | Formal notices: RGAA not met, no accessibility statement | Many administrations still working towards compliance |

- [Robles v. Domino's](https://www.supremecourt.gov/search.aspx?filename=/docket/docketfiles/html/public/18-1539.html) ·
  [Billboard — Beyoncé](https://www.billboard.com/business/legal/beyonce-sued-website-violating-americans-disabilities-act-8490493/) ·
  [Baromètre accessibilité numérique](https://accessibilite.numerique.gouv.fr/ressources/barometre-annuel/)

<style>
table { font-size: 0.78em; }
</style>

---

# Success stories

| Who | What they did | What it brought |
|---|---|---|
| **GOV.UK** | Launched in **2012** with accessibility as priority #1 — now WCAG 2.2 AA | Fewer support calls, higher satisfaction, *Design of the Year* 2013 |
| **Microsoft** | A programme since the 2000s: Narrator in Windows, live captions in Teams, the **Xbox Adaptive Controller** (2018) | A wider market, brand image, innovations that help everyone |
| **BBC** | Strict standards since 2010; **iPlayer** tested with disabled users at every iteration | A wider audience, better SEO, more maintainable code, lower support costs |

- [GOV.UK Accessibility Blog](https://accessibility.blog.gov.uk/) ·
  [Microsoft Accessibility](https://www.microsoft.com/en-us/accessibility) ·
  [BBC Accessibility Guidelines](https://www.bbc.co.uk/accessibility/forproducts/)

<style>
table { font-size: 0.8em; }
</style>

---

# Pitching accessibility — the return on investment

<div style="display: flex; gap: 2em;">
<div>

### The investment

- **Initial audit**: 1–2 weeks
- **Team training**: 1–2 days
- **Implementation**: about 5–10% of development time when built in **from the
  start** — far more when fixed afterwards
- **Continuous testing**: part of QA and CI

</div>
<div>

### The returns

- **Audience**: 16% of the world population — 1.3 billion people, and their
  families
- **Spending power**: trillions worldwide
  ([Return on Disability](https://www.rod-group.com/))
- **SEO** and **performance**: semantic pages index and load better
- **Maintenance** and **support**: fewer bugs, fewer complaints
- **Legal**: avoid lawsuits, fines, settlements
- **Image**: a positive differentiation

</div>
</div>

<br />

> Figures vary widely from one study to another: quote **your own** —
> support tickets, conversion on mobile, audit results — they convince more
> than any global average.

---

# Recap

- **WCAG 2.2** is the technical reference; **EN 301 549** and the **RGAA** say
  how to test it and who must comply
- **POUR**: perceivable, operable, understandable, robust — **AA** is the level
  the law asks for
- Public sector since **2019–2021**, private sector with the **EAA** since
  **June 2025**
- In France: the RGAA, an **accessibility statement**, a 3-year plan, yearly
  action plans
- It is everyone's job: product, design, development, content, QA

> In the workshop, you audit a page **by hand**: each problem you find gets a
> WCAG criterion number and a fix.

---
layout: cover
---

# Workshop 02

## A manual audit

`workshops/02_manual_audit`
