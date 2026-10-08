# TP 4 — Modelling a bank account

> Autonomous workshop — chapter 4 (Classes). ~1h30.

## Goal

Write a bank account that **cannot be put in an invalid state**: no negative
deposit, no withdrawal past the balance, no balance rewritten from outside. The
rules live in the class, and the data they guard is **private** — the rest of
the code can only go through the methods.

## Setup

Open `index.html` with the console visible. The page runs a test suite over your
classes and prints ✅ / ❌ per test, then a score.

## Steps

1. **`Counter`** — a public field `count = 0`, `increment()` that returns the
   new count, `reset()`. Create two counters and check in the console that they
   do not share anything.
2. **A private balance** — in `BankAccount`, a `#balance` field, a `balance`
   getter, `deposit()` and `withdraw()`. No setter: in the console, try
   `account.balance = 1000000` and then `account.#balance`. Read both answers —
   one is silent, the other refuses to even run.
3. **`owner`, a getter and a setter** — the name is trimmed, and an empty one
   throws a `TypeError`. Keep `this.owner = owner` in the constructor: it now
   goes through the setter, so `new BankAccount('   ')` is refused too. Then
   `JSON.stringify(account)` returns `'{}'` — nothing private leaks.
4. **`#assertPositive(amount)`** — a private method that throws a `RangeError`
   unless the amount is a finite number above 0. `deposit` and `withdraw` both
   call it first. `NaN > 0` is `false`, but so is `NaN <= 0`: check which way
   round your condition is.
5. **`InsufficientFundsError`** — a class that `extends Error`, with a `name`
   and a `missing` amount. `withdraw` throws it before touching the balance.
6. **A private history** — every successful operation is recorded in
   `#history`, and the `history` getter returns a **copy**. The last test pushes
   into what you returned: it must not reach the account.
7. **`static isAccount(value)`** — `#balance in value`. An object with the very
   same properties is still not an account.
8. **`SavingsAccount extends BankAccount`** — `super(owner, initialBalance)`,
   then a `rate`. `addInterest()` deposits `balance * rate`; `withdraw()` refuses
   more than 1000 at once, and otherwise calls `super.withdraw()`. The history of
   the parent must still record it — that is how you know you reused it.

## Checking your work

The console ends with `32/32 tests passing`.

## Going further

- In `SavingsAccount`, write `this.#balance`. Read the error, and notice *when*
  it happens: before a single test runs.
- Rename `#balance` to `_balance` everywhere. Which tests turn red, and what can
  the console now do to your account?
- `const copy = { ...account }` — what does `copy.balance` give, and does
  `copy.deposit` exist? Why do the states of Day 3 stay plain objects?
- `typeof BankAccount`, `Object.getPrototypeOf(account) === BankAccount.prototype`,
  `Object.hasOwn(account, 'deposit')`: where do the methods actually live?
- Call `BankAccount('Ada')` without `new`. Then `BankAccount.isAccount(null)`:
  why does `#balance in` refuse it, and how would you guard against it?
- Add a `static #opened = 0` counter and a `static get opened()`. Does opening a
  `SavingsAccount` count too?
- A `Temperature` class with a private `#celsius`, a `fahrenheit` getter and
  setter, and a `static fromFahrenheit(value)` factory. Refuse anything below
  -273.15.
