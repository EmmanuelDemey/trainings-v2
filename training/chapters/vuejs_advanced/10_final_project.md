---
layout: cover
---

# 10 - Final project & cross-review

<div style="opacity: 0.75; font-size: 0.9em;">Optional — half a day, in pairs</div>

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Assemble** a vertical slice that uses the composable, store, router, form,
  async and testing patterns of the previous chapters **together**
- **Hand over** work in progress: what works, what is not done, what you are
  unsure about
- **Review** someone else's Vue code from evidence — running it before reading it
- **Write** a finding that gets acted on: observation, impact, smallest fix
- **Receive** a review without defending, and turn one finding into a change
- **Transpose** the grid into your own team's pull-request routine

---

# Why this chapter exists

Everything you have written in the last three days, **nobody has read**.

<br />

| A training usually gives you | Your team gives you |
|---|---|
| An exercise with one right answer | A codebase with several defensible ones |
| A trainer who already knows the solution | A colleague who has to reconstruct your intent |
| A green test as the verdict | A comment on a pull request as the verdict |

<br />

<v-click>

> The skill this half-day trains is not Vue. It is the one you will use on every
> pull request for the rest of the project: **reading code you did not write,
> and saying something useful about it.**

</v-click>

---

# The brief — one slice, seven steps

An invoicing back-office. Each step is a chapter you have already done:

| Step | What you build | Chapter |
|---|---|---|
| 1 | `useAsyncData`: cancel, ignore stale answers, honest `loading` | 3 |
| 2 | A store that indexes, and updates optimistically with a rollback | 6 |
| 3 | Lazy routes, guard, roles, `?redirect=` that cannot be hijacked | 5 |
| 4 | Async component, `Suspense`, error boundary | 2 · 8bis |
| 5 | Zod schema, accessible form, the server's error under the right field | 7 |
| 6 | **Two tests of your own**, on the behaviours worth protecting | 4 · 8 |
| 7 | A build you would defend: chunks, no leftovers, no secrets | 9 |

<br />

> Steps 1, 2, 3 and 5 are the core. Four steps done well beat seven done halfway
> — and the review round makes the difference visible.

---

# The half-day

| Time | | What happens |
|---|---|---|
| 0:00 | 15 min | Read the brief **together**, decide what you attack |
| 0:15 | 1h45 | Build — driver / navigator, swap every 25 min |
| 2:00 | 10 min | **Freeze**, `npm run review`, write the handover note |
| 2:10 | 45 min | Cross-review — you review a pair, another pair reviews you |
| 2:55 | 20 min | Restitution, then each pair fixes **one** finding |
| 3:15 | 15 min | Debrief |

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

# The 45 minutes — in this order

<div style="display: flex; gap: 1.5em; font-size: 0.95em;">
<div>

### 1. Run it — 20 min

Before reading a single line.

`npm run review`, then walk the journeys.

Write down what you **observe**.

</div>
<div>

### 2. Read it — 15 min

Their handover note, then their
**tests**, then the two files it
pointed you at.

You will not read everything.

</div>
<div>

### 3. Write it — 10 min

**Three findings maximum.**

Plus one thing you are stealing
for your own project.

</div>
</div>

<br />

- Reading first is the natural instinct, and it is the one that burns the round:
  you end up reviewing **naming**, because that is what reading surfaces
- Three is a **cap**, not a target. Found eleven? Choosing the three that matter
  *is* the exercise
- Found none? Say so, and write down the two checks that convinced you

<style>
h3 { margin-bottom: 0.4em; }
</style>

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

# Two rules, both about the reviewer

<div style="display: flex; gap: 2em;">
<div>

### Reproduce before you write

*"I think this might re-render too much"* is not a finding.

*"I clicked Refresh twice and got the first response"* is.

</div>
<div>

### Do not rewrite their code

Propose the **smallest change** that removes the problem, and let them write it.

You are reviewing a decision, not replacing it.

</div>
</div>

<br />

**Out of scope for this round: style, naming, formatting.** Not because they do
not matter — because they are the easiest thing to talk about, and they will eat
your 45 minutes if you let them.

<br />

<v-click>

> Everything on this slide is a rule about the reviewer's discipline, not about
> the code. That ratio is not an accident.

</v-click>

<style>
h3 { margin-bottom: 0.4em; }
</style>

---

# Restitution — five minutes per pair

1. **The thing you are stealing** for your own project — start here. It is not
   politeness: it is the finding the authors are least likely to know about
2. **Your three findings**, evidence first
3. The authors answer with **"agreed / disagreed and why / already knew"** —
   nothing else. No defending, no redesigning on the spot

<br />

Then each pair picks **one** finding and fixes it, in the room, in ten minutes.
Rerun `npm run review`.

<br />

<v-click>

> A review that changes nothing was a conversation. The ten-minute fix is what
> turns it into a review.

</v-click>

---

# What a review is not

| Anti-pattern | What it sounds like | What it costs |
|---|---|---|
| The rewrite | *"I pushed a commit on your branch"* | The author learns nothing, and owns code they did not write |
| The style audit | Twelve comments on naming, none on the rollback | The real finding never gets read |
| The architecture pitch | *"I would have used a data loader"* | A different design is not a defect — say it once, move on |
| The rubber stamp | *"LGTM 👍"* | Two people are now responsible for the bug, and neither looked |
| The ambush | The finding announced in the debrief, not to the authors | The authors stop bringing you their work |

<br />

> The counter to all five is the same: **evidence, smallest fix, to the authors,
> before the debrief.**

---

# Monday

- Which **two** axes of the grid belong in your team's pull-request template?
  Two, not six — a checklist nobody finishes is a checklist nobody reads
- What is your team's equivalent of the **handover note**? A PR description with
  "what I am unsure about" in it changes what reviewers look at
- Which of today's findings would your current CI have caught **for free**?
  Those belong in the pipeline, not in a human's 45 minutes

<br />

<v-click>

> The question worth asking yourself tonight: *what did I change in my own code
> while reviewing someone else's?* Almost everyone has an answer — and it is the
> argument for code review that no slide makes as well.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 10 - Final project (optional, in pairs)
- Build the slice: `useAsyncData` against its given spec, an indexed store with
  an optimistic rollback, guarded and lazy routes, a Zod-validated form
- Add `Suspense` + an error boundary around the async detail, and write **two
  tests of your own** if time allows
- **Freeze at 2:00** and write the five-line `HANDOVER.md`
- Review another pair: run it for 20 minutes, read it for 15, write **three
  findings** and the one thing you are stealing
- Present the findings to the authors, hear "agreed / disagreed / already knew",
  then fix **one** of yours and rerun `npm run review`

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
