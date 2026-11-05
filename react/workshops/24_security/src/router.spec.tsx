import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderAt } from './tests/render';

async function logIn(username: string, password: string) {
  await userEvent.type(await screen.findByLabelText('Username'), username);
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
}

const mainNav = () => screen.getByRole('navigation', { name: 'Main' });

describe('protected routes', () => {
  it('sends an anonymous visitor to the login page, remembering where they were going', async () => {
    const router = renderAt('/people/1');

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.search).toBe(`?redirectTo=${encodeURIComponent('/people/1')}`);
  });

  it('logs in, then goes back to the page that was asked for', async () => {
    const router = renderAt('/people/1');

    await logIn('luke', 'usetheforce');

    expect(await screen.findByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/people/1');
    expect(screen.getByText(/Logged in as Luke Skywalker/)).toBeInTheDocument();
  });

  it('never follows a redirectTo that leaves the app', async () => {
    const router = renderAt(`/login?redirectTo=${encodeURIComponent('https://evil.example')}`);

    await logIn('luke', 'usetheforce');

    expect(await screen.findByRole('heading', { name: 'People' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('shows the API message for wrong credentials', async () => {
    renderAt('/login');

    await logIn('luke', 'thedarkside');

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password');
  });

  it('logs out, and the protected pages are closed again', async () => {
    const router = renderAt('/');
    await logIn('luke', 'usetheforce');
    await screen.findByRole('heading', { name: 'People' });

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    await router.navigate('/');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });
});

describe('roles', () => {
  it('shows the Admin link and page to an admin', async () => {
    renderAt('/admin');

    await logIn('leia', 'rebellion');

    expect(await screen.findByRole('heading', { name: 'Administration' })).toBeInTheDocument();
    expect(within(mainNav()).getByRole('link', { name: 'Admin' })).toBeInTheDocument();
  });

  it('hides the Admin link from a user, and refuses the page with a 403', async () => {
    renderAt('/admin');

    await logIn('luke', 'usetheforce');

    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
    expect(within(mainNav()).queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });
});

describe('untrusted content', () => {
  it("renders Vader's bio without running its script, and drops its javascript: homepage", async () => {
    renderAt('/people/4');
    await logIn('luke', 'usetheforce');

    expect(await screen.findByText('Dark Lord of the Sith.')).toBeInTheDocument();
    expect(document.querySelector('[onerror]')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Homepage' })).not.toBeInTheDocument();
    expect(screen.getByText('No valid homepage.')).toBeInTheDocument();
  });

  it('opens a safe homepage in a new tab without giving it window.opener', async () => {
    renderAt('/people/1');
    await logIn('luke', 'usetheforce');

    const link = await screen.findByRole('link', { name: 'Homepage' });

    expect(link).toHaveAttribute('href', 'https://starwars.fandom.com/wiki/Luke_Skywalker');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
