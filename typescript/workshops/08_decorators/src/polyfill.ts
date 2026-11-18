// No Node.js version defines `Symbol.metadata` yet (checked up to 26): without
// it, the `context.metadata` object of a decorator is never attached to its class.
// Given — import it once, before any decorated class.
(Symbol as { metadata?: symbol }).metadata ??= Symbol('Symbol.metadata');
