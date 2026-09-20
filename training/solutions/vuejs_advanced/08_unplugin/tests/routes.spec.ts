import { describe, expect, it } from 'vitest';
import { createAppRouter } from '@/router';
import { mountAt } from './helpers';

/**
 * Every assertion below is about the routes the app actually has — never about
 * how they got there. That is the point: the hand-written array and the
 * generated one are interchangeable, except that one of them drifts.
 *
 * Four of these are red on the skeleton, and each one names a view that exists
 * in `src/views/` and that no URL reaches.
 */

describe('the routes that already work', () => {
  it('serves the home page', () => {
    expect(createAppRouter().resolve('/').matched).toHaveLength(1);
  });

  it('serves the about page', () => {
    expect(createAppRouter().resolve('/about').matched).toHaveLength(1);
  });

  it('reads the user id out of the URL', () => {
    expect(createAppRouter().resolve('/users/42').params).toMatchObject({ id: '42' });
  });
});

describe('the users layout — the file beside the folder', () => {
  it('wraps the list and the detail in the same layout', () => {
    const router = createAppRouter();

    expect(router.resolve('/users').matched).toHaveLength(2);
    expect(router.resolve('/users/42').matched).toHaveLength(2);
    expect(router.resolve('/users').matched[0]!.path).toBe('/users');
  });

  it('renders that layout around the detail page', async () => {
    using app = await mountAt('/users/2');

    expect(app.wrapper.find('[data-testid="users-layout"]').exists()).toBe(true);
    expect(app.wrapper.get('[data-testid="user-card"]').text()).toContain('Grace Hopper');
  });
});

describe('nesting the URL without nesting the UI', () => {
  it('serves /users/create on its own, outside the layout', () => {
    expect(createAppRouter().resolve('/users/create').matched).toHaveLength(1);
  });

  it('renders the create page without the users heading', async () => {
    using app = await mountAt('/users/create');

    expect(app.wrapper.find('[data-testid="create-user"]').exists()).toBe(true);
    expect(app.wrapper.find('[data-testid="users-layout"]').exists()).toBe(false);
  });
});

describe('the catch-all', () => {
  it('matches anything left over, and hands back the path', () => {
    const resolved = createAppRouter().resolve('/nope/not/here');

    expect(resolved.matched).toHaveLength(1);
    expect(resolved.params).toMatchObject({ path: 'nope/not/here' });
  });

  it('renders the not-found page', async () => {
    using app = await mountAt('/nope/not/here');

    expect(app.wrapper.find('[data-testid="not-found"]').exists()).toBe(true);
  });
});

describe('the generated names', () => {
  it('names every route after the file that declares it', () => {
    const router = createAppRouter();

    expect(router.resolve('/').name).toBe('/');
    expect(router.resolve('/about').name).toBe('/about');
    expect(router.resolve('/users').name).toBe('/users/');
    expect(router.resolve('/users/42').name).toBe('/users/[id]');
    expect(router.resolve('/users/create').name).toBe('/users.create');
    expect(router.resolve('/nope').name).toBe('/[...path]');
  });
});
