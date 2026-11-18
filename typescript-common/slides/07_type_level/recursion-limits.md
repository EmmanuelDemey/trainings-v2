# Recursion limits — `TS2589`

```ts
// tail call: the recursive call IS the branch
type Tuple<N extends number, Acc extends unknown[] = []> =
  Acc['length'] extends N ? Acc : Tuple<N, [...Acc, 0]>;

// not a tail call: the result is wrapped in [0, ...]
type Zeros<N extends number, Acc extends unknown[] = []> =
  Acc['length'] extends N ? [] : [0, ...Zeros<N, [...Acc, 0]>];

type A = Tuple<999>;   // ✔
type B = Zeros<48>;    // ✔
type C = Zeros<49>;    // ✘ TS2589
type D = Tuple<1000>;  // ✘ TS2589
// Type instantiation is excessively deep and possibly infinite.
```

- Each nested instantiation counts: about **50 levels** in general
- Since TS 4.5, a conditional type that returns the recursive call **directly**
  is **tail-recursive**: evaluated in a loop, up to **1000** iterations
- Wrapping the call (`[0, ...X]`, `` `${H}${X}` ``, `X & Y`) breaks the tail call:
  carry the result in an **accumulator** instead

<!--
Numbers checked with the project's tsc 7.0.2: Zeros<48> passes, Zeros<49>
fails; Tuple<999> passes, Tuple<1000> fails.
The Join of the previous slide is NOT tail-recursive (the call sits inside a
template literal): fine for a path, too deep for a long list. Tail version:
JoinAcc<Rest, Sep, Acc extends '' ? Head : `${Acc}${Sep}${Head}`>.
TS2589 is also what you get for a truly infinite type: the compiler cannot
tell "too deep" from "never ends". Fixes: accumulator, smaller input, or a
plain wider type (string instead of a literal) at the API boundary.
-->
