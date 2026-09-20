---
layout: cover
---

# Annexe — Final project & cross-review

<div style="opacity: 0.75; font-size: 0.9em;">Deep dives — outside the three-day run</div>

<br />

<div style="opacity: 0.6; font-size: 0.8em;">These slides describe the <strong>half-day</strong> format — the follow-up session, with a 45-minute review round. The 90-minute slot on day 3 runs the tightened version.</div>

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

