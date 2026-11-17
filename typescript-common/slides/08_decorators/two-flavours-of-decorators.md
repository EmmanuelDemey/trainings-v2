# Two flavours of decorators

| | Standard (TC39, stage 3) | Legacy (`experimentalDecorators`) |
|---|---|---|
| TypeScript | default since **5.0** | opt-in flag, since 1.5 |
| Signature | `(value, context)` | `(target, key, descriptor)` |
| Parameter decorators | ❌ | ✅ |
| `emitDecoratorMetadata` | ❌ — `context.metadata` | ✅ with `reflect-metadata` |
| Used by | Lit 3, MobX 6, new code | **Angular**, **NestJS**, TypeORM |

- Both compile — **not** at the same time: the flag switches the whole project
- This chapter teaches the **standard** API; the last slides come back to the
  legacy one
