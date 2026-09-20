import { describe, expect, it } from 'vitest';
import { exists, labelOf, localImportsOf, sourceFiles, SRC } from './architecture';

/**
 * The dependency rule, as a test.
 *
 * Architecture that is only written in a README drifts in a fortnight. These
 * specs read the source tree and hold the three rules of the chapter: what `ui/`
 * may import, what a feature may import, and what the outside may reach into.
 *
 * They are also the only specs here that change: `tests/views.spec.ts` and
 * `tests/dataTable.spec.ts` describe behaviour, and a refactor must leave
 * behaviour alone.
 */

const FORBIDDEN_IN_UI = ['features/', 'stores/', 'api/', 'views/', 'components/'];

describe('ui/ is domain-free', () => {
  it('imports no store, no API client, no feature and no domain type', () => {
    const offences = sourceFiles(`${SRC}/ui`).flatMap((file) =>
      localImportsOf(file)
        .filter((target) => target === 'types' || FORBIDDEN_IN_UI.some((p) => target.startsWith(p)))
        .map((target) => `${labelOf(file)} imports ${target}`),
    );

    // The question, out loud: could I copy this file into a different product?
    expect(offences).toEqual([]);
  });
});

describe('the feature-first layout', () => {
  it('gives every domain one folder, with one entry point', () => {
    expect(exists('features/invoicing/index.ts')).toBe(true);
    expect(exists('features/payments/index.ts')).toBe(true);
  });

  it('has moved everything out of the flat folders', () => {
    // Deleting a feature has to mean deleting one folder.
    expect(exists('components')).toBe(false);
    expect(exists('stores')).toBe(false);
    expect(exists('api')).toBe(false);
    expect(exists('types.ts')).toBe(false);
  });

  it('keeps each feature ignorant of the others', () => {
    const offences: string[] = [];

    for (const feature of ['invoicing', 'payments']) {
      const other = feature === 'invoicing' ? 'payments' : 'invoicing';
      for (const file of sourceFiles(`${SRC}/features/${feature}`)) {
        for (const target of localImportsOf(file)) {
          if (target.startsWith(`features/${other}`)) {
            offences.push(`${labelOf(file)} imports ${target}`);
          }
        }
      }
    }

    expect(offences).toEqual([]);
  });

  it('is only reached through its index, never file by file', () => {
    const offences: string[] = [];

    for (const file of sourceFiles()) {
      const from = labelOf(file);
      for (const target of localImportsOf(file)) {
        const match = /^features\/([^/]+)\/(.+)$/.exec(target);
        if (!match) continue;
        const [, feature, rest] = match;
        if (from.startsWith(`features/${feature}/`)) continue; // inside itself: fine
        if (rest === 'index' || rest === 'index.ts') continue;
        offences.push(`${from} reaches into ${target}`);
      }
    }

    expect(offences).toEqual([]);
  });
});
