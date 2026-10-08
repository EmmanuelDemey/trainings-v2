// Test suite for this workshop — you do not need to modify it.
// Each test is evaluated in isolation: an unimplemented class fails its own
// tests without stopping the others.
//
// If EVERY test says "... is not defined", app.js did not load at all: look for
// the red SyntaxError above them. A private name used without being declared in
// the class body (`this.#balanse`) stops the whole file before it runs.

(function runTests() {
  let passed = 0;
  let total = 0;

  function test(label, compute, expected) {
    total++;
    let actual;
    try {
      actual = compute();
    } catch (error) {
      console.error(`❌ ${label}\n   threw: ${error.message}`);
      return;
    }
    if (equal(actual, expected)) {
      passed++;
      console.log(`✅ ${label}`);
    } else {
      console.error(`❌ ${label}\n   expected: ${show(expected)}\n   received: ${show(actual)}`);
    }
  }

  function throws(label, compute, ErrorType) {
    total++;
    try {
      compute();
    } catch (error) {
      if (error instanceof ErrorType) {
        passed++;
        console.log(`✅ ${label}`);
      } else {
        console.error(`❌ ${label}\n   expected a ${ErrorType.name}\n   received: ${error?.name}: ${error?.message}`);
      }
      return;
    }
    console.error(`❌ ${label}\n   expected a ${ErrorType.name}, nothing was thrown`);
  }

  function equal(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((item, i) => equal(item, b[i]));
    }
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const keys = Object.keys(b);
      return keys.length === Object.keys(a).length && keys.every((k) => equal(a[k], b[k]));
    }
    return Object.is(a, b);
  }

  const show = (value) => JSON.stringify(value) ?? String(value);

  // 1 — Counter
  test('a new Counter starts at 0', () => new Counter().count, 0);
  test('increment returns the new count', () => {
    const counter = new Counter();
    counter.increment();
    return counter.increment();
  }, 2);
  test('reset goes back to 0', () => {
    const counter = new Counter();
    counter.increment();
    counter.reset();
    return counter.count;
  }, 0);
  test('two counters do not share their count', () => {
    const a = new Counter();
    const b = new Counter();
    a.increment();
    return [a.count, b.count];
  }, [1, 0]);

  // 2 — BankAccount: a private balance
  test('balance defaults to 0', () => new BankAccount('Ada').balance, 0);
  test('balance starts at the initial amount', () => new BankAccount('Ada', 100).balance, 100);
  test('deposit and withdraw move the balance', () => {
    const account = new BankAccount('Ada', 100);
    account.deposit(50);
    account.withdraw(30);
    return account.balance;
  }, 120);
  test('balance cannot be assigned from outside', () => {
    const account = new BankAccount('Ada', 100);
    account.balance = 1_000_000; // no setter: silently ignored, this file is not strict
    return account.balance;
  }, 100);

  // 3 — owner: a getter and a setter that validates
  test('the owner is trimmed', () => new BankAccount('  Ada ').owner, 'Ada');
  test('renaming goes through the same rule', () => {
    const account = new BankAccount('Ada');
    account.owner = ' Grace ';
    return account.owner;
  }, 'Grace');
  throws('an empty owner is refused by the constructor', () => new BankAccount('   '), TypeError);
  throws('an empty owner is refused on rename', () => {
    new BankAccount('Ada').owner = '';
  }, TypeError);
  test('nothing private leaks into JSON', () => JSON.stringify(new BankAccount('Ada', 100)), '{}');

  // 4 — a private method guarding every amount
  throws('deposit(0) is refused', () => new BankAccount('Ada').deposit(0), RangeError);
  throws('deposit(-5) is refused', () => new BankAccount('Ada').deposit(-5), RangeError);
  throws('withdraw(NaN) is refused', () => new BankAccount('Ada', 100).withdraw(NaN), RangeError);
  test('a refused amount leaves the balance alone', () => {
    const account = new BankAccount('Ada', 100);
    try { account.deposit(-5); } catch {}
    return account.balance;
  }, 100);

  // 5 — InsufficientFundsError
  test('InsufficientFundsError carries its name, message and what is missing', () => {
    const error = new InsufficientFundsError(30);
    return [error.name, error.message, error.missing];
  }, ['InsufficientFundsError', 'insufficient funds: 30 missing', 30]);
  test('withdrawing too much throws an InsufficientFundsError', () => {
    try {
      new BankAccount('Ada', 100).withdraw(130);
    } catch (error) {
      return error instanceof InsufficientFundsError;
    }
    return 'nothing was thrown';
  }, true);
  test('the error says how much is missing', () => {
    try {
      new BankAccount('Ada', 100).withdraw(130);
    } catch (error) {
      return error.missing;
    }
    return 'nothing was thrown';
  }, 30);
  test('a refused withdrawal leaves the balance alone', () => {
    const account = new BankAccount('Ada', 100);
    try { account.withdraw(130); } catch {}
    return account.balance;
  }, 100);

  // 6 — a private history, handed out as a copy
  test('history lists the operations, in order', () => {
    const account = new BankAccount('Ada', 100);
    account.deposit(50);
    account.withdraw(20);
    return account.history;
  }, [{ type: 'deposit', amount: 50 }, { type: 'withdraw', amount: 20 }]);
  test('a refused operation is not recorded', () => {
    const account = new BankAccount('Ada', 100);
    try { account.withdraw(500); } catch {}
    try { account.deposit(-1); } catch {}
    return account.history;
  }, []);
  test('history cannot be changed from outside', () => {
    const account = new BankAccount('Ada', 100);
    account.deposit(50);
    account.history.push({ type: 'deposit', amount: 1_000_000 });
    return account.history.length;
  }, 1);

  // 7 — static isAccount
  test('BankAccount.isAccount recognises an account', () =>
    BankAccount.isAccount(new BankAccount('Ada')), true);
  test('BankAccount.isAccount is not fooled by the same shape', () =>
    BankAccount.isAccount({ owner: 'Eve', balance: 1_000_000, deposit() {} }), false);

  // 8 — SavingsAccount extends BankAccount
  test('a SavingsAccount keeps its rate', () => new SavingsAccount('Ada', 1000, 0.02).rate, 0.02);
  test('addInterest deposits the interest and returns it', () => {
    const savings = new SavingsAccount('Ada', 1000, 0.02);
    return [savings.addInterest(), savings.balance];
  }, [20, 1020]);
  test('addInterest on an empty account does nothing', () => {
    const savings = new SavingsAccount('Zoé', 0, 0.02);
    return [savings.addInterest(), savings.balance, savings.history.length];
  }, [0, 0, 0]);
  throws('a withdrawal above 1000 is refused', () =>
    new SavingsAccount('Ada', 5000, 0.02).withdraw(1500), RangeError);
  test('a smaller withdrawal goes through the parent', () => {
    const savings = new SavingsAccount('Ada', 5000, 0.02);
    savings.withdraw(100);
    return [savings.balance, savings.history];
  }, [4900, [{ type: 'withdraw', amount: 100 }]]);
  test('BankAccount.isAccount recognises a SavingsAccount', () =>
    BankAccount.isAccount(new SavingsAccount('Ada', 0, 0.02)), true);

  console.log(
    `%c${passed}/${total} tests passing`,
    `font-weight: bold; color: ${passed === total ? '#1f9d55' : '#d33a3a'}`,
  );
})();
