---
layout: cover
---

# 05 - The tools

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Pick** the right tool for each question: a page, a site, a server, a project
- **Compute** an EcoIndex, and say what it does **not** measure
- **Read** the Network panel of the devtools for the weight and the requests

---

# A map of the tools

| Question | Tools |
|---|---|
| How heavy is this **page**? | devtools **Network** panel, **Lighthouse** |
| What is its **EcoIndex**? | **ecoindex.fr**, the **GreenIT-Analysis** extension, `ecoindex-cli` |
| Which **practices** are missing? | **GreenIT-Analysis**, **Ecograder** |
| What does the **server** consume? | **Scaphandre**, **Kepler** (Kubernetes), **PowerJoular** |
| What does this **code** emit? | **CodeCarbon** (Python), **EcoLogits** (AI APIs) |
| What does my **cloud** emit? | the carbon dashboards of the providers, **Cloud Carbon Footprint** |
| How much carbon for **my organisation**? | **NumEcoDiag**, **Resilio**, a full **LCA** |

<style>
table { font-size: 0.8em; }
</style>

<!--
No tool answers every question. The common mistake is measuring a page with a server tool, or a site with a page tool.
-->

---

# The EcoIndex

Created by GreenIT.fr, maintained by the **Green IT** association. Three
measures of a page, compared with the pages of the **HTTP Archive**:

- **DOM** elements — weight **3**: the work of the device
- **Requests** — weight **2**: the work of the network and the servers
- **Size** transferred — weight **1**

A score out of **100**, a grade from **A** to **G**, and estimates of
**greenhouse gases** and **water** per view.

<br />

```text
A > 80   B > 70   C > 55   D > 40   E > 25   F > 10   G
```

<!--
The algorithm is public: scripts/ecoindex.mjs of this training reproduces it in 40 lines. Show it if the room is technical.
-->

---

# What the EcoIndex does not see

- **What** is loaded: 2 MB of one image weigh **as much** as 2 MB of JavaScript
  to execute
- The **CPU** spent running the scripts
- The **video** played after the load, and what happens on scroll beyond the
  first one
- The **servers**: a static page and a page computed on every view
- **Whether the page is needed** at all

<br />

> A score is a **floor and a trend**, never a verdict. Combine it with a
> **budget** (chapter 07) and with the **audit** (chapter 06).

<!--
Workshop 05 shows it: a page can stay grade A while it gains 2 MB of images. Only the size limit of the budget catches it.
-->

---

# The devtools, first

The **Network** panel already tells most of the story:

- **Disable cache**, then reload: what a first visit downloads
- The bottom bar: **requests**, **transferred**, **resources**
- Sort by **Size**: the heaviest files first
- Filter by type: **Img**, **JS**, **Font**, **Media**
- Leave the page alone a minute: does it keep **requesting**?

<br />

**Lighthouse** — performance and best practices, with "Properly size images",
"Serve images in modern formats", "Reduce unused JavaScript": often the same
fixes.

<!--
Live demo on a real news site: the number of third-party domains in the Network panel is the most convincing figure of the day.
-->

---

# From the terminal

The workshops come with a measure script — the EcoIndex of
`scripts/ecoindex.mjs`, in a real Chromium, the cache disabled:

```bash
pnpm run measure workshops/04_frugal_page --top 5
```

```text
  EcoIndex     33.2 / 100   grade E
  DOM          2918 elements
  Requests     16
  Size         9908.1 kB

  ! 3 request(s) while the page was left alone: /stock.json

  The 5 heaviest files
      2251 kB  /images/hero.png
      1286 kB  /images/iphone-12.png
```

<!--
These are the real figures of the starter of workshop 04. Do not give the fixes: the output already points at them.
-->
