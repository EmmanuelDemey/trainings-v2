// TP 4 - Modelling a bank account
// Complete the classes below, step by step. check.js runs the tests on reload.
//
// ⚠️ A private name must be DECLARED in the class body before it is used:
// `this.#balance` without a `#balance` field at the top is a SyntaxError, and a
// SyntaxError stops the whole file — every test then says "is not defined".

// --- 1. Counter --------------------------------------------------------------
// TODO: a public field `count`, starting at 0.
// TODO: increment() adds 1 to count and RETURNS the new count.
// TODO: reset() puts count back to 0.
class Counter {}

// --- 2 to 7. BankAccount -----------------------------------------------------
class BankAccount {
  // TODO (2): a PRIVATE field #balance, starting at 0.
  // TODO (3): a private field #owner.
  // TODO (6): a private field #history, starting as an empty array.

  constructor(owner, initialBalance = 0) {
    // (3): leave this line as it is. Once the `owner` setter exists, this
    //   assignment goes through it — the constructor validates for free.
    this.owner = owner;
    // TODO (2): store initialBalance in #balance.
  }

  // TODO (2): a getter `balance` that returns #balance — and NO setter:
  //   reading is public, writing is not.
  // TODO (2): deposit(amount) adds to #balance, withdraw(amount) removes from it.

  // TODO (3): `get owner()` returns #owner.
  //   `set owner(name)` trims the name, throws a TypeError when nothing is
  //   left, and stores it in #owner.
  //   ⚠️ Do not ALSO declare a public field `owner` — it would hide the accessor.

  // TODO (4): a PRIVATE method #assertPositive(amount) that throws a RangeError
  //   unless amount is a finite number greater than 0 (see Number.isFinite).
  //   Call it first thing in deposit AND in withdraw.

  // TODO (5): withdraw throws `new InsufficientFundsError(missing)` when the
  //   amount is larger than the balance — before changing anything.

  // TODO (6): every SUCCESSFUL deposit / withdraw pushes
  //   { type: 'deposit', amount } or { type: 'withdraw', amount } into #history.
  //   A getter `history` hands out a COPY: [...this.#history].

  // TODO (7): static isAccount(value) — true only for a real BankAccount, false
  //   for any other object, even one with the same properties.
  //   `#balance in value` answers exactly that. (value is always an object.)
}

// --- 5. A custom error -------------------------------------------------------
// TODO: constructor(missing)
//   - call super() with the message `insufficient funds: ${missing} missing`
//   - set this.name to 'InsufficientFundsError' — what the console prints
//   - keep `missing` on the error, so the caller can say how much is lacking
class InsufficientFundsError extends Error {}

// --- 8. SavingsAccount -------------------------------------------------------
// TODO: constructor(owner, initialBalance, rate) — call super(owner,
//   initialBalance) FIRST, then keep `rate` on the instance.
// TODO: addInterest() computes balance * rate, deposits it, and returns it.
//   On an empty account the interest is 0 — and deposit(0) throws. Skip it.
// TODO: override withdraw(amount): throw a RangeError above 1000, otherwise let
//   the parent do the work with super.withdraw(amount).
//   `this.#balance` does not work here: it belongs to BankAccount. Use
//   `this.balance`, like any other code.
class SavingsAccount extends BankAccount {}
