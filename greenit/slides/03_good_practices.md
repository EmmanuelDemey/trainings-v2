---
layout: cover
---

# 03 - The 115 good practices and the INR framework

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Use** the **115 good practices** of web eco-design, and pick the ones that
  matter
- **Situate** the INR framework (**GR491**) next to the RGESN
- **Tell** a lever with a big effect from a lever with a small one

---

# The 115 good practices

*Écoconception web : les 115 bonnes pratiques* — Frédéric Bordage and the
**Collectif Conception Numérique Responsable** (CNumR), GreenIT.fr.

- One practice per sheet: the **life-cycle phase**, the **tier** concerned
  (device, network, data centre), the **priority**, the **difficulty**
- Covers the whole life cycle: from **specification** to **hosting**
- Open: the practices are maintained on **GitHub** by the CNumR
- The base of the **GreenIT-Analysis** extension's recommendations

<!--
The book is the 4th edition (Eyrolles). The repository of the CNumR is the up-to-date version, with a few more practices.
-->

---

# The levers, by effect

<div style="display: flex; gap: 2em;">
<div>

### Big effect

- **Removing** a feature nobody uses
- Supporting **old devices** and slow networks
- **Not** loading what is not seen: lazy loading, on demand
- **Images and videos**: the right size, the right format, no autoplay
- **Fewer third parties**: trackers, widgets, A/B testing, fonts

</div>
<div>

### Small effect, still worth it

- Minifying CSS and JS
- Compressing the responses (gzip, brotli)
- HTTP caching headers
- Fewer DOM elements
- A dark theme on OLED screens

</div>
</div>

<br />

> Start with what is **not needed**, then what is **too big**.

<!--
Ask the room to rank five practices before showing the slide. People always overrate minification and underrate removing a feature.
-->

---

# A few practices, in code

```html
<!-- The right size, the right format, only when it is seen -->
<picture>
  <source type="image/avif" srcset="phone-240.avif 240w, phone-480.avif 480w" sizes="15rem" />
  <img src="phone-240.webp" srcset="phone-240.webp 240w, phone-480.webp 480w" sizes="15rem"
       width="240" height="240" alt="Pixel 7" loading="lazy" decoding="async" />
</picture>
```

```js
// The platform first: no library for what the browser already does
const price = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
price.format(329); // "329,00 €"
```

```js
// Ask once, not every second
fetch('stock.json').then((response) => response.json()).then(showStock);
```

<!--
These three are exactly what workshop 04 asks. Do not give more: let them find the rest with the tools.
-->

---

# The INR and the GR491

The **Institut du Numérique Responsable** (INR), an association, publishes the
**GR491** — *Guide de Référence de conception responsable de services numériques*.

- Wider than eco-design: **planet**, **people** — accessibility, inclusion,
  privacy, ethics — and **prosperity**
- Organised by **families** — strategy, specifications, UX/UI, content,
  front-end, architecture, back-end, hosting
- Each criterion is tied to the **actors** who act on it, and its **impacts**
- Also: the **Responsible Digital label** (*label NR*) for organisations, and
  the free **MOOC** of the INR

<!--
RGESN vs GR491: the RGESN is the official framework, shorter, focused on the environment; the GR491 is broader, the right tool for a full responsible digital approach. Check the current number of criteria of the GR491 on the site before quoting it.
-->

---

# Which one, when?

| | RGESN | GR491 (INR) | 115 good practices |
|---|---|---|---|
| **Who** | Arcep, Arcom, ADEME | INR | CNumR, GreenIT.fr |
| **Scope** | environment | environment + social + economic | environment, web |
| **Form** | criteria, yes/no | criteria, by actor | practical sheets |
| **For** | a statement, a public service | a full responsible approach | the team that builds |

<br />

> The RGESN to **assess and declare**, the 115 practices to **do**, the GR491
> to **go further**.

<!--
They do not compete: the RGESN criteria often point to practices of the 115. Use one framework to assess, not three.
-->
