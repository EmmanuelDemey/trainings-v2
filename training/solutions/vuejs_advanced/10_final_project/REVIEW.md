# Cross-review sheet

One sheet per review. Copy it, fill it in, hand it to the authors at the end of
the restitution — they keep it. The protocol, the grid and the severities are in
`README.md`; this is only the form.

```
Reviewers: ......................................  (pair)
Authors:   ......................................  (pair)
Date / slot: ....................................
```

## 1. Run it — 20 minutes, before reading anything

| Check | Result | Note |
|---|---|---|
| `npm install && npm run review` | pass / fail | |
| Given spec (`useAsyncData`) green | pass / fail | |
| "Refresh" twice quickly → one winner | pass / fail | |
| `/invoices` signed out → login + `?redirect=` | pass / fail | |
| Hard refresh on `/invoices` signed in | pass / fail | |
| `?redirect=https://example.com` refused | pass / fail | |
| Alan blocked on `/invoices/new` | pass / fail | |
| Failure switch on → status rolls back **and** says why | pass / fail | |
| `/invoices/999` → error boundary, not a blank page | pass / fail | |
| Invalid submit → summary, focus, no API call | pass / fail | |
| `INV-1001` twice → message under **Reference** | pass / fail | |
| Keyboard only through the form | pass / fail | |
| `npm run build` → chunk count: ....... entry: ....... kB | — | |
| `grep -rn TODO src` / `grep -r "sk_live" dist/` | clean / not | |

## 2. Read it — 15 minutes

Their `HANDOVER.md`, then their tests, then the two files it points at.

```
Files actually read: ...........................................................
Their open question (handover point 4) — my answer: ............................
................................................................................
```

## 3. Write it — 10 minutes

**The thing I am stealing for my own project**

```
................................................................................
................................................................................
```

**Finding 1 — [ blocker / major / minor ]**

```
File:line .....................................................................
Observed (reproduced ___ times): ..............................................
................................................................................
Why it matters: ...............................................................
Smallest fix: .................................................................

Authors' response:  agreed  /  disagreed because ..............................  /  already knew
```

**Finding 2 — [ blocker / major / minor ]**

```
File:line .....................................................................
Observed (reproduced ___ times): ..............................................
................................................................................
Why it matters: ...............................................................
Smallest fix: .................................................................

Authors' response:  agreed  /  disagreed because ..............................  /  already knew
```

**Finding 3 — [ blocker / major / minor ]**

```
File:line .....................................................................
Observed (reproduced ___ times): ..............................................
................................................................................
Why it matters: ...............................................................
Smallest fix: .................................................................

Authors' response:  agreed  /  disagreed because ..............................  /  already knew
```

**Nothing to report?** Then write the two checks that convinced you, and which
axis of the grid you did not have time to cover.

```
Checked and clean: ............................................................
Not covered: ..................................................................
```

## 4. Fixed in the room

```
Finding fixed: ................  `npm run review` green afterwards:  yes  /  no
```
