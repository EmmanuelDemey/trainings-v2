// TP 4 - Modelling a bank account — solution

// --- 1. Counter --------------------------------------------------------------
class Counter {
  count = 0;

  increment() {
    this.count += 1;
    return this.count;
  }

  reset() {
    this.count = 0;
  }
}

// --- 2 to 7. BankAccount -----------------------------------------------------
class BankAccount {
  #owner;
  #balance = 0;
  #history = [];

  constructor(owner, initialBalance = 0) {
    this.owner = owner; // goes through the setter: validated here too
    this.#balance = initialBalance;
  }

  get balance() {
    return this.#balance;
  }

  get owner() {
    return this.#owner;
  }

  set owner(name) {
    const trimmed = String(name).trim();
    if (trimmed === '') throw new TypeError('an account needs an owner');
    this.#owner = trimmed;
  }

  // A copy: the caller can do what it wants with it, the account is untouched.
  get history() {
    return [...this.#history];
  }

  deposit(amount) {
    this.#assertPositive(amount);
    this.#balance += amount;
    this.#history.push({ type: 'deposit', amount });
  }

  withdraw(amount) {
    this.#assertPositive(amount);
    if (amount > this.#balance) {
      throw new InsufficientFundsError(amount - this.#balance);
    }
    this.#balance -= amount;
    this.#history.push({ type: 'withdraw', amount });
  }

  // Written as "refuse unless valid": `amount <= 0` alone lets NaN through,
  // because every comparison with NaN is false.
  #assertPositive(amount) {
    if (!(Number.isFinite(amount) && amount > 0)) {
      throw new RangeError(`not a valid amount: ${amount}`);
    }
  }

  // Only an object built by this class (or a subclass) carries #balance, so no
  // look-alike can pass — unlike `'balance' in value` or `value.deposit`.
  static isAccount(value) {
    return #balance in value;
  }
}

// --- 5. A custom error -------------------------------------------------------
// Referenced inside withdraw() only, so it may be declared after BankAccount:
// the name is looked up when withdraw runs, not when the class is defined.
class InsufficientFundsError extends Error {
  constructor(missing) {
    super(`insufficient funds: ${missing} missing`);
    this.name = 'InsufficientFundsError';
    this.missing = missing;
  }
}

// --- 8. SavingsAccount -------------------------------------------------------
class SavingsAccount extends BankAccount {
  static WITHDRAWAL_LIMIT = 1000;

  constructor(owner, initialBalance, rate) {
    super(owner, initialBalance); // `this` does not exist before this line
    this.rate = rate;
  }

  addInterest() {
    const interest = this.balance * this.rate; // this.#balance is BankAccount's
    if (interest > 0) this.deposit(interest);
    return interest;
  }

  withdraw(amount) {
    if (amount > SavingsAccount.WITHDRAWAL_LIMIT) {
      throw new RangeError(`at most ${SavingsAccount.WITHDRAWAL_LIMIT} per withdrawal`);
    }
    super.withdraw(amount); // the parent's checks, balance and history, reused
  }
}
