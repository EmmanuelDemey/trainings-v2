import { describe, expect, it } from 'vitest';
import { createI18n } from '.';
import { en } from './en';
import { fr } from './fr';

/** Every key of a catalogue, nested ones as `table.name`. */
function keysOf(catalogue: object, prefix = ''): string[] {
  return Object.entries(catalogue).flatMap(([key, value]) =>
    typeof value === 'object' ? keysOf(value as object, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

/** The message at `table.name`, or `undefined`. */
function valueAt(catalogue: object, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], catalogue);
}

/** The keys without their plural suffix: languages need different forms. */
function messagesOf(catalogue: object): string[] {
  return [...new Set(keysOf(catalogue).map((key) => key.replace(/_(zero|one|two|few|many|other)$/, '')))].sort();
}

describe('the catalogues', () => {
  it('give French a message for every English one', () => {
    expect(messagesOf(fr)).toEqual(messagesOf(en));
  });

  it('translate every message to French', () => {
    const untranslated = keysOf(en).filter((key) => valueAt(fr, key) === valueAt(en, key));

    expect(untranslated).toEqual([]);
  });
});

describe('createI18n', () => {
  it('is ready at once, in the language asked for', () => {
    const i18n = createI18n('fr');

    expect(i18n.resolvedLanguage).toBe('fr');
    expect(i18n.t('title')).toBe('Personnages de Star Wars');
  });

  it('sets the lang of the page, and keeps it in sync', async () => {
    const i18n = createI18n('fr');
    expect(document.documentElement.lang).toBe('fr');

    await i18n.changeLanguage('en');

    expect(document.documentElement.lang).toBe('en');
  });

  it('interpolates the variables of a message', () => {
    expect(createI18n('en').t('table.like', { name: 'Yoda' })).toBe('Like Yoda');
    expect(createI18n('fr').t('table.like', { name: 'Yoda' })).toBe('Aimer Yoda');
  });

  it('picks the English plural form from the count', () => {
    const { t } = createI18n('en');

    expect(t('likes', { count: 0 })).toBe('You like 0 characters.');
    expect(t('likes', { count: 1 })).toBe('You like 1 character.');
    expect(t('likes', { count: 2 })).toBe('You like 2 characters.');
  });

  // The French rules are not the English ones: 0 is singular, and the
  // millions take "de".
  it('picks the French plural form from the count', () => {
    const { t } = createI18n('fr');

    expect(t('likes', { count: 0 })).toBe('Vous aimez 0 personnage.');
    expect(t('likes', { count: 1 })).toBe('Vous aimez 1 personnage.');
    expect(t('likes', { count: 2 })).toBe('Vous aimez 2 personnages.');
    expect(t('likes', { count: 1_000_000 })).toBe('Vous aimez 1000000 de personnages.');
  });
});
