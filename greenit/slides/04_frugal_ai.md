---
layout: cover
---

# 04 - Frugal AI

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Give** the orders of magnitude of the footprint of generative AI
- **Tell** the training from the inference, and why the inference ends up
  weighing more
- **Use** the **AFNOR Spec 2314** to question an AI project
- **Pick** the most frugal solution that meets the need

---

# Why AI changes the picture

- Data centres used **≈ 415 TWh** in 2024; the IEA expects that to
  **double by 2030**, mostly because of AI (IEA, *Energy and AI*, 2025)
- New data centres, new **GPUs** — made, then replaced every few years
- **Water** for cooling, in places where it is scarce
- Every **query** costs: a reply of a large model is far more expensive than
  a search or a lookup in a database

<!--
Quote ranges, not a single figure per query: the estimates differ by an order of magnitude with the model, its size, the length of the answer and the hardware. The EcoLogits project gives per-request estimates for the main APIs.
-->

---

# Training and inference

<div style="display: flex; gap: 2em;">
<div>

### Training

- Once (per model version), **huge**
- Weeks of thousands of GPUs
- Paid once, shared by every user

</div>
<div>

### Inference

- At **every** request
- Small each time, but **multiplied** by billions of uses
- The part that **grows** with adoption, and the one **you** control

</div>
</div>

<br />

> A feature that calls a large model on every page view is a **recurring
> cost**, for the planet as for the budget.

---

# AFNOR Spec 2314

*Référentiel général pour l'IA frugale* — published by AFNOR in **2024**, with
the Ecolab of the Ministry of Ecological Transition and more than 100 contributors.

- **Frugal AI**: the need is justified, the solution is the **least
  demanding** that meets it, its impacts are **measured** and **reduced**
- A **methodology** to measure the footprint of an AI service
- **Best practices** along the life cycle: data, training, inference, end of life
- The question asked **first**: does it need AI at all?

<!--
An AFNOR Spec is a consensus document, not a standard: no certification. It is the base of the "Algorithms" family of the RGESN 2024.
-->

---

# The questions to ask, in order

1. **Is there a need?** Who asked, and what do they do today?
2. **Does it need AI?** A rule, a search, a form, a SQL query?
3. **Does it need *generative* AI?** A classifier, a small model?
4. **Which model?** The smallest that is good enough — not the biggest available
5. **How often?** Precomputed once, cached, or at every request?
6. **Where?** On the device, or in a data centre — and which one?
7. **Measured?** Energy, carbon, water — per request, per month

<br />

> Every "no" higher in the list is worth more than every optimisation below it.

<!--
This list is the grid of workshop 03. Answering "no" to question 2 is the most frugal AI there is.
-->

---

# Frugal techniques

- **Smaller models**: distilled, quantised, specialised
- **Cache** the answers to the frequent questions
- **Shorter** prompts and answers: fewer tokens, less energy
- **Batch** what does not need to be real-time
- **Retrieval** (RAG) rather than a larger model
- **Measure**: CodeCarbon, EcoLogits, the dashboards of the providers

<!--
Mention the agentic IDEs the participants may use: their footprint is that of many inferences. Same questions apply — does this task need an agent?
-->

---
layout: cover
---

# Workshop 03

## Does this feature need AI?

`workshops/03_frugal_ai`

<!--
30 minutes, in groups of 3–4. Each group defends one decision to the room in 2 minutes.
-->
