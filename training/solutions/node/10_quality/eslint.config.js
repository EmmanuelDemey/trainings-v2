import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules', '.husky'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Step 1 — the team convention. A `_`-prefixed binding is the standard
      // way to say "this parameter exists because of the signature, not because
      // I use it" — Express error handlers need all four arguments to be
      // recognised as error handlers at all.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Floating promises are the single most common bug in an Express codebase:
      // an unawaited async call whose rejection nobody sees. This rule needs
      // type information — see `tseslint.configs.recommendedTypeChecked` in
      // "Going further" for the type-aware rule set.
      'no-console': 'warn',
    },
  },
);
