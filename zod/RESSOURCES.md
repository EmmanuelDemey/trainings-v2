# Zod — ressources

## Socle

- Lire — https://zod.dev
- Lire — https://zod.dev/basics
- Lire — https://zod.dev/api
- Lire — https://zod.dev/v4 (les nouveautés de Zod 4)
- Lire — https://zod.dev/v4/changelog (le guide de migration depuis Zod 3)
- Lire — https://github.com/colinhacks/zod
- Lire — https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/ (l'idée derrière tout ça)

## 1. Schémas & types

- Lire — https://zod.dev/api#strings (les formats : `z.email()`, `z.uuid()`, `z.url()`…)
- Lire — https://zod.dev/api#iso-datetimes
- Lire — https://zod.dev/api#objects (`z.object`, `z.strictObject`, `z.looseObject`)
- Lire — https://zod.dev/basics#inferring-types (`z.infer`, `z.input`, `z.output`)
- Lire — https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates (ce que TypeScript ne fait pas à l'exécution)

## 2. Composer des schémas

- Lire — https://zod.dev/api#extend
- Lire — https://zod.dev/api#partial
- Lire — https://zod.dev/api#discriminated-unions
- Lire — https://zod.dev/api#records (`z.record`, `z.partialRecord`)
- Lire — https://zod.dev/api#recursive-objects (les getters)
- Lire — https://zod.dev/api#branded-types
- Lire — https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions

## 3. Transformations & raffinements

- Lire — https://zod.dev/api#coercion
- Lire — https://zod.dev/api#transforms
- Lire — https://zod.dev/api#pipes
- Lire — https://zod.dev/api#defaults (et `.prefault()`)
- Lire — https://zod.dev/api#catch
- Lire — https://zod.dev/api#refinements (`.refine`, `.superRefine`, `abort`, `when`)
- Lire — https://zod.dev/codecs (`z.codec`, `z.decode`, `z.encode`)
- Lire — https://zod.dev/api#stringbool

## 4. Erreurs & frontières

- Lire — https://zod.dev/error-customization (le paramètre `error`)
- Lire — https://zod.dev/error-formatting (`z.prettifyError`, `z.flattenError`, `z.treeifyError`)
- Lire — https://zod.dev/error-customization#internationalization (`z.config(z.locales.fr())`)
- Lire — https://zod.dev/json-schema (`z.toJSONSchema`)
- Lire — https://zod.dev/metadata (`.meta()`, les registres)
- Lire — https://github.com/standard-schema/standard-schema
- Lire — https://12factor.net/fr/config (la configuration dans l'environnement)
- Lire — https://env.t3.gg (une variable d'environnement validée, côté client et serveur)

## Écosystème

- Lire — https://zod.dev/ecosystem
- Lire — https://zod.dev/packages/mini (Zod Mini, pour les bundles front)
- Lire — https://react-hook-form.com/docs/useform#resolver (`@hookform/resolvers/zod`)
- Lire — https://vee-validate.logaretm.com/v4/integrations/zod-schema-validation/
- Lire — https://trpc.io/docs/server/validators
- Lire — https://hono.dev/docs/guides/validation#zod-validator-middleware
- Lire — https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data (sorties structurées d'un LLM)
- Lire — https://github.com/asteasolutions/zod-to-openapi (un schéma Zod → une spec OpenAPI)

## Alternatives

- Lire — https://valibot.dev (modulaire, très léger)
- Lire — https://arktype.io (syntaxe proche de TypeScript, très rapide)
- Lire — https://effect.website/docs/schema/introduction/ (Effect Schema)
- Lire — https://github.com/moltar/typescript-runtime-type-benchmarks

## Veille

- Lire — https://github.com/colinhacks/zod/releases
- Lire — https://bytes.dev
- Écouter — https://syntax.fm
- Écouter — https://ifttd.io (FR)
