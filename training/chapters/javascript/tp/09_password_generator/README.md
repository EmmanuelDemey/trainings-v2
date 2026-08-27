# TP 9 — Mini-project 2: Password generator

> Day 3, guided practice. ~1h15.

## Goal

Same pattern as the countdown — state ➜ render ➜ events — on a different kind of
problem: **strings, arrays and randomness**. And one real question at the end:
`Math.random()` is not good enough for a password. Why, and what replaces it.

## Setup

Open `index.html`. The options are already in the markup.

## Steps

1. **The alphabets** — an object holding four strings: `lowercase`, `uppercase`,
   `digits`, `symbols`. Data first: the rest of the code only reads from it.
2. **`buildAlphabet(options)`** — concatenates the alphabets the user ticked.
   Lowercase is always in. Returns a string.
3. **`randomChar(alphabet)`** — one character, at random. `Math.random()` and
   `Math.floor` (workshop 3, task 6).
4. **`generate(length, options)`** — the password. Loop, or
   `Array.from({ length }, ...).join('')` — write it both ways and keep the one
   you find clearer.
5. **Guarantee the classes** — a 20-character password with "digits" ticked can
   come out with no digit at all (unlikely, not impossible). Force **at least
   one** character of every selected class, then shuffle. Do not simply
   overwrite the first characters — say why in a comment.
6. **Render** — the length slider shows its value live (`input` event), the
   password appears in the page, and *Copy* is disabled while there is nothing
   to copy.
7. **Copy** — `navigator.clipboard.writeText(...)`, and a "Copied!" confirmation
   that disappears after 2 seconds (`setTimeout`).
8. **Strength** — compute the entropy: `length * Math.log2(alphabet.length)`
   bits. Under 50 bits *weak*, under 80 *medium*, otherwise *strong*, with the
   matching colour class. An entropy is honest; counting ticked checkboxes is
   not.
9. **Refuse the impossible** — every checkbox off and lowercase excluded, or a
   length below 4: an error in the page, no password.

## Checking your work

- Moving the slider updates the number live.
- Two clicks on *Generate* never give the same password.
- With only "digits" ticked, the password contains only digits.
- With everything ticked at length 8, generate 20 of them: each one contains at
  least one digit, one uppercase and one symbol.
- *Copy* really puts the password in the clipboard (paste it somewhere).

## Going further

- **The real fix.** `Math.random()` is a fast pseudo-random generator, seeded
  from a small state and **not** unpredictable: given enough output, the next
  values can be derived. For anything security-related the browser gives you
  `crypto.getRandomValues(new Uint32Array(1))`. Swap `randomChar` over — the
  rest of the code does not change, which is the payoff for having isolated it.
- Beware the modulo bias when mapping a random integer onto an alphabet whose
  size does not divide 2³². Look up rejection sampling.
- Passphrases: 4 words drawn from a 7776-word list is ~103 bits, and a human can
  actually remember it. Compare with your generator's entropy at 12 characters.
- Show the "time to crack" for a given hash rate — and read out loud why that
  number is mostly marketing.
