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
| **WCAG 2.2** | International (W3C) | The reference: testable success criteria — also **ISO/IEC 40500:2025** |
| **EN 301 549** | European Union | The European standard for ICT products — **V3.2.1** (WCAG 2.1 AA) in force, **V4.1.1** (WCAG 2.2 AA) published |
| **RGAA 4.1.2** | France | A method to **test** WCAG 2.1 AA, criterion by criterion |
| BS 8878 → **ISO 30071-1** | United Kingdom | A process standard: how to build accessibility in |
| **AnySurfer** | Belgium | A quality label and its checklist |
| **Renow** | Luxembourg | The national framework, derived from WCAG |
| **eCH-0059** | Switzerland | The federal standard, based on WCAG |

<br />

> Whatever the country, the **technical** content is WCAG. The local standards
> say **how to test it** and **who must comply**.

<!--
ISO/IEC 40500:2025 = WCAG 2.2, approved 21 October 2025 (it replaces the
2012 edition, WCAG 2.0). EN 301 549 V4.1.1 was published in September 2026;
it gives a presumption of conformity only once cited in the EU Official
Journal (expected end of 2026). Check before each session.
-->

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
| **2.2** | Oct. 2023 | **9** criteria added, **4.1.1 Parsing** removed — ISO/IEC 40500 since 2025 |
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
- Websites and mobile apps, based on **EN 301 549** V3.2.1 (WCAG 2.1 AA)
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
- Same technical reference: **EN 301 549** — **V4.1.1** (WCAG 2.2 AA) maps
  its clauses to the EAA in annex ZB
- Micro-enterprises providing **services** (< 10 people, ≤ €2M) are exempt —
  not those making **products**

[Directive (EU) 2019/882](https://eur-lex.europa.eu/eli/dir/2019/882/oj)

</div>
</div>

<!--
A harmonised standard gives a "presumption of conformity" only once the
Commission cites it in the Official Journal. V3.2.1 is cited for the
directive 2016/2102 (decision 2021/1339). V4.1.1 (Sept. 2026) was not cited
yet mid-November 2026. Products other than services: the micro-enterprises
only get lighter documentation duties.
-->

---

# In France — RGAA 4.1.2

<div style="display: flex; gap: 2em;">
<div>

- **R**éférentiel **G**énéral d'**A**mélioration de l'**A**ccessibilité
- Version **4.1.2** (April 2023): the French method to check **WCAG 2.1 AA**
- **106 criteria** in **13 themes**, **258 tests**
- WCAG 2.1 AA + a few French specifics
- **Next: RGAA 5**, announced for **December 2026**, made official by a
  décret in 2027 — **WCAG 2.2** and EN 301 549 V4.1.1, about **40 new
  criteria**, separate frameworks for web, mobile and documents

[Official RGAA](https://accessibilite.numerique.gouv.fr/) ·
[RGAA 5 announcement](https://design.numerique.gouv.fr/articles/2026-11-03-rgaa5/)

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

<!--
Until RGAA 5 is published, keep working on 4.1.2: the DINUM says the work
must not be postponed. Statements made before RGAA 5 stay valid 18 months
(within 3 years of their date). RGAA 5 also drops the average compliance
rate and declares "non conforme" as soon as a blocking issue exists.
Décret 2026-816 (24 August 2026) already ties the RGAA to the EU harmonised
standards: the legal basis for RGAA 5.
-->

---

# In France — who must comply, and what to publish

<div style="display: flex; gap: 2em;">
<div>

### Who

- **Public sector** (loi 2005-102, art. 47): administrations, local
  authorities, bodies with a public service mission
- **Private sector**: companies with a turnover above **€250 million**
- Requirement: **RGAA 4.1.2** (WCAG 2.1 AA)
- Controlled by **Arcom** since 2023: public formal notice first, then up to
  **€50,000** for an inaccessible service (public sector) and **€25,000** for
  a missing statement or plan (everyone) — again every **6 months** if it lasts

[Décret n° 2019-768](https://www.legifrance.gouv.fr/eli/decret/2019/7/24/CPAE1913344D/jo/texte) ·
[Art. 47-1](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048050174)

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

<!--
Ordonnance 2023-859 (6 Sept. 2023) created art. 47-1 and gave the control
to Arcom; the former caps were €20,000. The €50,000 cap covers the
accessibility duty (art. 47 I) of the public sector and its delegates; the
€25,000 cap covers the statement and the plans (art. 47 III and IV) for all,
including the €250M companies.
-->

---

# In France — the EAA, for products and services

<div style="display: flex; gap: 2em;">
<div>

### The texts

- **Loi n° 2023-171** (9 March 2023) transposes the EAA
- **Décret n° 2023-931** (9 October 2023): products and services in scope,
  obligations, CE marking
- Applies to products placed on the market and services provided after
  **28 June 2025**
- **Exempt**: micro-enterprises providing services (< 10 people, ≤ €2M)
- **Disproportionate burden**: an exemption to justify and document

</div>
<div>

### Control and sanctions

| Sector | Authority |
|---|---|
| E-commerce, transport, e-books | **DGCCRF** |
| Banking | ACPR, AMF, Banque de France |
| Electronic communications | Arcep |
| Audiovisual media | Arcom |

- 5th-class contravention: up to **€7,500 per breach** for a company,
  cumulative — plus injunction and, if it persists, withdrawal from the market

</div>
</div>

[Décret n° 2023-931](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048178349)

<!--
Two regimes, not to be mixed: RGAA + Arcom (art. 47, public sector and
€250M companies) and EAA + DGCCRF and co. (code de la consommation, all
companies selling the listed services, whatever their size above the
micro-enterprise). The DGCCRF shares the control with the sector
authorities. Users report through SignalConso.
-->

<style>
table { font-size: 0.8em; }
</style>

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
| **Parkwood Entertainment** — Beyoncé (USA) | 2019 | Merchandising site: images without alternatives, no keyboard navigation | **Class action** filed in New York — every e-commerce site is a target |
| **impots.gouv.fr** (France) | 2026 | Tax return, messaging, PDF tax notices not usable with a keyboard or a screen reader; a statement claiming "full compliance" for a measured **42%** | First public **formal notice** by Arcom: 9 months to fix, 2 months for the statements |

- [Robles v. Domino's](https://www.supremecourt.gov/search.aspx?filename=/docket/docketfiles/html/public/18-1539.html) ·
  [Billboard — Beyoncé](https://www.billboard.com/business/legal/beyonce-sued-website-violating-americans-disabilities-act-8490493/) ·
  [Arcom decision, 24 June 2026](https://www.arcom.fr/se-documenter/espace-juridique/decisions/decision-du-24-juin-2026-mettant-en-demeure-le-ministere-de-laction-et-des-comptes-publics)

<style>
table { font-size: 0.78em; }
</style>

<!--
Domino's: after the Supreme Court refused the case (Oct. 2019), it went back
to the district court and ended in a settlement in 2022. impots.gouv.fr:
decision n° 2026-358, published in the Journal officiel; the RGAA criteria
cited are 13.3 (PDF), 10.8 (hidden content), 12.11 (keyboard), 5.7
(table headers). Workshop 02 hits the same kind of problems.
-->

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
- In France: **RGAA 4.1.2** — RGAA 5 (WCAG 2.2) is coming — an
  **accessibility statement**, a 3-year plan, yearly action plans; Arcom
  controls, the DGCCRF for the EAA
- It is everyone's job: product, design, development, content, QA

> In the workshop, you audit a page **by hand**: each problem you find gets a
> WCAG criterion number and a fix.

<!--
Transition: workshop 02 is manual, like workshop 01 — no automated grading.
Its findings feed chapters 04 to 08, where each problem gets fixed in code.
-->

---
layout: cover
---

# Workshop 02

## A manual audit

`workshops/02_manual_audit`
