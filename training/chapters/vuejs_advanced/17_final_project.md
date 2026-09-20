---
layout: cover
---

# 17 - Final project & cross-review

<div style="opacity: 0.75; font-size: 0.9em;">Optional — 90 minutes, in pairs</div>

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Assemble** a vertical slice that uses the composable, store, router, form,
  async and testing patterns of the previous chapters **together**
- **Cut** the scope honestly in 90 minutes: two steps done well beat seven done
  halfway
- **Hand over** work in progress: what works, what is not done, what you are
  unsure about
- **Review** another pair's slice against a six-axis grid, with evidence rather
  than impressions
- **Write** a finding that gets acted on: observation, impact, smallest fix
- **Receive** a review without defending, and **turn** one finding into a change

---

# The brief — one slice, seven steps

An invoicing back-office. Each step is a chapter you have already done:

| Step | What you build | Chapter |
|---|---|---|
| 1 | `useAsyncData`: cancel, ignore stale answers, honest `loading` | 2 |
| 2 | A store that indexes, and updates optimistically with a rollback | 9 |
| 3 | Lazy routes, guard, roles, `?redirect=` that cannot be hijacked | 6 |
| 4 | Async component, `Suspense`, error boundary | 7 · 13 |
| 5 | Zod schema, accessible form, the server's error under the right field | 11 |
| 6 | **Two tests of your own**, on the behaviours worth protecting | 3 · 12 |
| 7 | A build you would defend: chunks, no leftovers, no secrets | 16 |

<br />

> In 90 minutes, **steps 1 and 2 are the core**. Two steps done well beat seven
> done halfway — and the review round makes the difference visible. Steps 3 to 7
> are where the slice goes on your own, after the session.

---

# The 90 minutes

| Time | | What happens |
|---|---|---|
| 0:00 | 10 min | Read the brief **together**, decide what you attack |
| 0:10 | 40 min | Build — driver / navigator, swap every 20 min |
| 0:50 | 5 min | **Freeze**, `npm run review`, write the handover note |
| 0:55 | 25 min | Cross-review — you review a pair, another pair reviews you |
| 1:20 | 10 min | Restitution, and debrief |

<br />

<v-click>

> The freeze is not negotiable. A reviewer cannot review a moving target — and
> *"it works on my machine, I was just about to commit"* is precisely the
> situation this exercise exists to make you feel.

</v-click>

---

# The handover note — five lines that decide the review you get

At the freeze, in a `HANDOVER.md`:

1. **What works** — the journeys a reviewer can run
2. **What is not done** — and why (a deliberate cut is not a gap)
3. **Where to start** — the two files worth reading first
4. **What I am unsure about** — the decision you want a second opinion on
5. **How to run it** — anything beyond `npm install && npm run dev`

<br />

<v-click>

> Point 4 is the one that changes everything. A pair that writes *"we hesitated
> between coercing in the schema and converting in the component"* gets an
> answer. A pair that writes *"everything is fine"* gets a lecture about `:key`.

</v-click>

---

# The grid — six axes, pick the ones that apply

| # | Axis | What you actually check |
|---|------|------------------------|
| 1 | **Contract** | Given spec green. Refresh twice fast: one winner, `loading` false |
| 2 | **State** | Request state where? Collection indexed or scanned? Getters `computed`? Does the list update after a write? |
| 3 | **Routing & security** | Signed-out deep link, hard refresh, roles, `?redirect=https://example.com` |
| 4 | **Failure** | Rollback — and is the user told? `/invoices/999`: boundary or blank page? |
| 5 | **Form & a11y** | Keyboard only. Labels, focus on the summary, server error on the right field |
| 6 | **Ship-ability** | Chunk count, `grep -rn TODO src`, `grep -r sk_live dist/` |

<br />

> The skeleton is **not above suspicion**. Some of what you were handed is
> ordinary code with ordinary defects — and once you ship it, it is yours,
> including the parts you did not write.

---

# How to write a finding

```text
[major] src/views/InvoicesView.vue:18

Observed: with the filter on "All", changing a status to "paid" leaves the row
  showing "sent" until I touch the filter. Reproduced twice.

Why it matters: the user believes the write failed and clicks again.

Smallest fix: derive the visible list with a `computed`, not a `watch`.
```

<br />

| Severity | Means |
|---|---|
| **blocker** | A journey in the Definition of Done does not work |
| **major** | It works, but a user or a maintainer will be hurt by it |
| **minor** | Real, cheap to fix, no user impact today |
| **nit** | Say it out loud — do not write it down |

---

# Restitution — two minutes per pair

1. **The thing you are stealing** for your own project — start here. It is not
   politeness: it is the finding the authors are least likely to know about
2. **Your three findings**, evidence first
3. The authors answer with **"agreed / disagreed and why / already knew"** —
   nothing else. No defending, no redesigning on the spot

<br />

Then each pair picks **one** finding and fixes it — the first thing you do when
you reopen the project. Rerun `npm run review`.

<br />

<v-click>

> A review that changes nothing was a conversation. The one finding you actually
> fix is what turns it into a review.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 17 - Final project (optional, in pairs)
