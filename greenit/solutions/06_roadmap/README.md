# TP 6 — Your Green IT roadmap: an example

> A filled-in roadmap, for ReBoot: the form to check yours against.

Yours is about your own service: its figures and its people will differ. Check
the **form**: measures, targets, owners, dates.

```text
Service:            ReBoot shop — the catalogue, ≈ 3,000 visits a day
Baseline:           home: EcoIndex 33 (E), 9,900 kB, 16 requests
                    product page: EcoIndex 41 (D), 3,200 kB, 22 requests
                    cart: EcoIndex 58 (C), 640 kB, 31 requests

Quick wins:         1. Images resized, AVIF/WebP, lazy-loaded
                       home 9,900 kB → < 300 kB
                    2. Stock fetched once per visit, not every second
                       0 request at rest (from 60 a minute per open tab)
                    3. Remove vendor/everything.js, use Intl.NumberFormat
                       −200 kB of JavaScript on every page

Budget in the CI:   maxSizeKb 300, maxRequests 20, maxDom 400, minGrade A
                    on home, product page, cart — failing the pull request

Product decision:   Supported devices: Android 10+ and iOS 15+, a 2019
                    mid-range phone as reference, tested on a real one.
                    Decided by the product owner, at the next roadmap review.

Arguments:          CTO — the hosting and CDN bill falls with the weight;
                      objection "no time": quick wins = 2 days, measured.
                    Marketing — a faster shop converts better on mobile;
                      objection "the reviews sell": keep them, on demand.

Referent, ritual:   one developer, half a day a month; the budget reviewed
                    at each release; statement of eco-design in 3 months.

First three actions, with dates:
  1. Measure the 3 pages, share the baseline        — this week
  2. Quick wins 1 and 2, in one pull request         — within 2 weeks
  3. Budget in the CI, then propose the devices list — within a month
```
