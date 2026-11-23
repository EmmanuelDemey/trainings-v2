---
layout: cover
---

# 02 - RGESN and the REEN law

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Situate** the French legal framework: the **REEN** and **AGEC** laws
- **Describe** the **RGESN** 2024: who wrote it, its families, its criteria
- **Read** a RGESN criterion and tell whether a project meets it
- **Know** what a public or private organisation has to publish

---

# The legal framework in France

<div style="display: flex; gap: 2em;">
<div>

### The AGEC law (2020)

*Anti-gaspillage pour une économie circulaire*

- **Repairability index** on phones and laptops, now a **durability index**
  on some products
- Information on the **carbon footprint** of data use by telecom operators

</div>
<div>

### The REEN law (2021)

*Réduire l'empreinte environnementale du numérique*, 15 November 2021

- Digital sobriety taught at **school** and in **engineering** studies
- Fighting the **planned obsolescence** of devices and software
- **Eco-design** of digital services: a general framework, the **RGESN**
- Municipalities over **50,000 inhabitants**: a **responsible digital
  strategy** (by 2025)

</div>
</div>

<!--
The law of 23 December 2021 completes REEN on the role of Arcep. In Europe: the CSRD (sustainability reporting) and the Ecodesign for Sustainable Products Regulation (ESPR) push in the same direction. Check the state of these texts before the session: they move.
-->

---

# The RGESN

**Référentiel général d'écoconception de services numériques** — the general
framework for the eco-design of digital services.

- Written by the **DINUM**, the **MiNumEco** and the **ADEME**, with the **Inria**;
  the **2024** version is published by the **Arcep** and the **Arcom**
- **78 criteria**, in **9 families**
- Each criterion: an **objective**, an **implementation**, a **means of
  testing**, a **priority** and a **difficulty**
- Recommended to everyone, **expected** from public services
- Comes with a **statement of eco-design** (*déclaration d'écoconception*) to
  publish

<!--
The 2024 version added the "Algorithms" family, for AI. The criteria are the same for a site, a mobile app or an API: some apply, some do not.
-->

---

# The 9 families

| Family | What it covers |
|---|---|
| **Strategy** | the need, the users, the objectives, the steering |
| **Specifications** | the devices and networks supported, the lifespan |
| **Architecture** | what runs where, what is kept, what is computed |
| **UX/UI** | the journeys, the patterns: autoplay, infinite scroll |
| **Content** | images, videos, documents, their formats and their weight |
| **Front-end** | the weight of the page, the requests, the code |
| **Back-end** | caching, the queries, the processing |
| **Hosting** | the host, its energy, its PUE, the location |
| **Algorithms** | AI: is it needed, which model, how often |

<style>
table { font-size: 0.8em; }
</style>

<!--
Most impact is decided in the first three families, before a line of code. Front-end is where developers look first: it is far from the only lever.
-->

---

# A criterion, read closely

### 2.1 — Does the digital service run on **old devices**?

- **Objective** — not to force anyone to replace a device that still works
- **Implementation** — define the oldest devices and OS versions supported, and
  test on them
- **Test** — the list exists, and the service has been tested on it

<br />

### 4.x — Does the service avoid **autoplay** of videos and animations?

- **Objective** — no content loaded and played that nobody asked for
- **Test** — no video starts without an action of the user

<!--
Read the real text of two criteria on the official site (numbers and wording change between versions). Show that a criterion is a yes/no question: that is what makes a self-assessment possible.
-->

---

# The statement of eco-design

What an organisation publishes about a service, like the accessibility
statement:

- The **scope** of the service assessed
- The **criteria** met, not met, not applicable — and the score
- The **objectives** and the **plan** for the ones not met
- The **person** in charge, and the date

<br />

> The online tool of the RGESN helps fill it in, and exports it.

<!--
The value is not the score: it is the plan. A low score with a credible plan beats a high score nobody maintains.
-->

---
layout: cover
---

# Workshop 02

## A RGESN self-assessment

`workshops/02_rgesn_assessment`

<!--
40 minutes. On their own project if they have one, otherwise on ReBoot. The debrief: which family has the most "no", and who in the team can act on it?
-->
