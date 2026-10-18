import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './tests/render';

const plain = (text: string | null) => text?.replace(/\s/g, ' ');

function row(name: string) {
  return screen.getByRole('row', { name: new RegExp(`^${name}`) });
}

describe('App', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('speaks English by default', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: 'Star Wars people' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Height' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders in French when created in French', () => {
    renderApp('fr');

    expect(screen.getByRole('heading', { name: 'Personnages de Star Wars' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Taille' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Dernière mise à jour' })).toBeInTheDocument();
  });

  it('switches to French with the FR button, the page lang included', async () => {
    const user = userEvent.setup();
    renderApp('en');

    await user.click(screen.getByRole('button', { name: 'FR' }));

    expect(screen.getByRole('heading', { name: 'Personnages de Star Wars' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Langue' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'FR' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.lang).toBe('fr');
  });

  it('names each like button after its person, in the current language', async () => {
    const user = userEvent.setup();
    renderApp('fr');

    await user.click(screen.getByRole('button', { name: 'Aimer Luke Skywalker' }));

    expect(screen.getByRole('button', { name: 'Ne plus aimer Luke Skywalker' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('counts the likes with the English plural forms', async () => {
    const user = userEvent.setup();
    renderApp('en');
    expect(screen.getByRole('status')).toHaveTextContent('You like 0 characters.');

    await user.click(screen.getByRole('button', { name: 'Like C-3PO' }));
    expect(screen.getByRole('status')).toHaveTextContent('You like 1 character.');

    await user.click(screen.getByRole('button', { name: 'Like R2-D2' }));
    expect(screen.getByRole('status')).toHaveTextContent('You like 2 characters.');
  });

  it('counts the likes with the French plural forms, where 0 is singular', async () => {
    const user = userEvent.setup();
    renderApp('fr');
    expect(screen.getByRole('status')).toHaveTextContent('Vous aimez 0 personnage.');

    await user.click(screen.getByRole('button', { name: 'Aimer C-3PO' }));
    await user.click(screen.getByRole('button', { name: 'Aimer R2-D2' }));

    expect(screen.getByRole('status')).toHaveTextContent('Vous aimez 2 personnages.');
  });

  it('formats heights and masses for the current language', async () => {
    const user = userEvent.setup();
    renderApp('en');
    const cells = () => within(row('Jabba Desilijic Tiure')).getAllByRole('cell');
    expect(plain(cells()[0]!.textContent)).toBe('1.75 m');
    expect(plain(cells()[1]!.textContent)).toBe('1,358 kilograms');

    await user.click(screen.getByRole('button', { name: 'FR' }));

    expect(plain(cells()[0]!.textContent)).toBe('1,75 m');
    expect(plain(cells()[1]!.textContent)).toBe('1 358 kilogrammes');
  });

  it('shows how long ago each person was updated, with the full date on hover', () => {
    // Only `Date` is faked: user-event keeps its real timers.
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-18T12:00:00Z') });
    renderApp('fr');

    const updated = within(row('Luke Skywalker')).getByText('il y a 12 ans');

    expect(updated).toHaveAttribute('title', '20 décembre 2014');
    expect(updated).toHaveAttribute('datetime', '2014-12-20T21:17:56.891Z');
  });
});
