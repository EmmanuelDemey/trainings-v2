---
layout: cover
---

# Program

---
src: ../../typescript-common/slides/00_intro/intro.md
---

---
src: ../../typescript-common/slides/00_intro/training-objectives.md
---

---
src: ../../typescript-common/slides/00_intro/what-s-new-typescript-5-x-to-7-0.md
---

---
src: ../../typescript-common/slides/00_intro/prerequisites.md
---

---
src: ../../typescript-common/slides/00_intro/target-audience.md
---

---
src: ../../typescript-common/slides/00_intro/how-a-day-runs.md
---

---
src: ../../typescript-common/slides/00_intro/teaching-methods.md
---

---

# The workshop projects

- **Ten standalone workshops**, one per chapter, under `workshops/` — React 19
  projects, run in the terminal with Testing Library:

```bash
cd 01_getting_started
npm install
npm run test:watch   # the given specs, red until you are done
npm run typecheck    # tsc --noEmit
```

- The code ships as a **skeleton with `// TODO` markers**; the steps are described
  in each workshop's `README.md`
- No workshop imports another: start any of them on its own
- `node check-env.mjs --install` (at the root of `workshops/`) checks your
  machine and pre-installs every workshop — ideally **run a week before** the session
