# TP 8 — Mini-project 1: Countdown

> Day 3, guided practice. ~1h.

## Goal

Your first complete little application: a countdown you start, pause and reset.
The point is not the timer — it is the **state ➜ render ➜ events** pattern that
every project of Day 3 (and every framework you will meet afterwards) is built
on.

## The pattern

```
state    the data: how many seconds are left, is it running
render   ONE function that rebuilds the display FROM the state
events   the handlers change the state, then call render()
```

No handler ever touches the DOM directly. If you find yourself writing
`display.textContent = ...` inside a click handler, you have left the pattern.

## Setup

Open `index.html`. `app.js` already contains the three sections: fill them in.

## Steps

1. **`formatTime(seconds)`** — `95` becomes `01:35`. Pad with
   `String(n).padStart(2, '0')`. Write this one first, it is pure logic and you
   can test it in the console.
2. **`render()`** — displays the remaining time, and puts the buttons in the
   right state: *Start* disabled while running, *Pause* only enabled while
   running.
3. **Start** — read the duration, set the state, start a `setInterval` and keep
   its id. Guard against a double start (two intervals = the clock runs twice as
   fast, and only one of them can ever be stopped).
4. **The tick** — one second less, `render()`, and **stop at zero**: clear the
   interval and show the "Time's up!" message.
5. **Pause / Resume** — the same button. Pausing clears the interval, resuming
   creates a new one. The remaining time does not change.
6. **Reset** — back to the initial state, whatever the current one.
7. **Under 10 seconds** — the `danger` class turns the display red. One line,
   with `classList.toggle(name, condition)`, in `render()` — not in the tick.
8. **Refuse the nonsense** — 0, an empty field, a negative or non-numeric value:
   an error message in the page and no timer started.

## Checking your work

- Start / Pause / Resume / Reset all behave, in any order.
- Clicking *Start* three times in a row does not speed the clock up.
- At zero the interval **stops** — check in the console that it is not counting
  into the negatives.
- The display turns red at 9 seconds, black again after a reset.

## Going further

- **The drift.** `setInterval` counts ticks, not time — and a background tab
  throttles it to one tick a second at best, often far less. Start a 3-minute
  countdown, switch tabs, come back: it is late. Fix: store the **target date**
  (`Date.now() + duration * 1000`) and recompute `target - Date.now()` on every
  tick. The interval then only decides how often you refresh the display.
- Refresh 10 times a second and display tenths. With the target-date version it
  costs one constant; with the tick-counting version it does not work at all.
- Add an audible or visual alert at zero, and persist the target date in
  `localStorage` so a reload does not lose the countdown.
