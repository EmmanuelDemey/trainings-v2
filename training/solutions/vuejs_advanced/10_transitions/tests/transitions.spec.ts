import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import ReleaseList from '@/components/ReleaseList.vue';
import { afterTheFrame, mountBoard, rowFor } from './helpers';

/**
 * jsdom runs no CSS, so nothing here asserts that something *looked* right —
 * that part is the Definition of Done, in a browser, with the durations turned
 * up. What jsdom does show is the classes Vue applies and the order it applies
 * them in, which is exactly what `name`, `mode` and `appear` control.
 *
 * One consequence: `v-move` is invisible here. FLIP measures positions, and in
 * jsdom every position is zero. Check that one with your eyes.
 */

describe('the tab switcher', () => {
  it('fades the first panel in, on load', () => {
    using app = mountBoard();

    const classes = app.wrapper.get('[data-testid="tab-panel"]').attributes('class') ?? '';

    expect(classes).toContain('fade-enter-active');
    expect(classes).toContain('fade-enter-from');
  });

  it('lets the old panel leave before the new one enters', async () => {
    using app = mountBoard();

    await app.wrapper.get('[data-testid="tab-idea"]').trigger('click');

    // `out-in` serialises the two phases: the outgoing panel is still the only
    // one on screen, and it is on its way out. Without a mode there would be
    // two, stacked, and everything below them would jump.
    const during = app.wrapper.findAll('[data-testid="tab-panel"]');
    expect(during).toHaveLength(1);
    expect(during[0]!.attributes('data-tab')).toBe('shipped');
    expect(during[0]!.attributes('class') ?? '').toContain('fade-leave-active');

    await afterTheFrame();
    await nextTick();

    const panels = app.wrapper.findAll('[data-testid="tab-panel"]');
    expect(panels).toHaveLength(1);
    expect(panels[0]!.attributes('data-tab')).toBe('idea');
  });
});

describe('the release list', () => {
  it('is a TransitionGroup rendering a real <ul>', () => {
    using app = mountBoard();
    const list = app.wrapper.findComponent(ReleaseList);

    expect(list.findComponent({ name: 'TransitionGroup' }).exists()).toBe(true);
    expect(list.find('ul').exists()).toBe(true);
  });

  it('animates each row out on its own', async () => {
    using app = mountBoard();

    await rowFor(app, 'Bulk invoice export').get('[data-testid="remove"]').trigger('click');

    const leaving = rowFor(app, 'Bulk invoice export');
    expect(leaving.attributes('class') ?? '').toContain('list-leave-active');

    await afterTheFrame();
    await nextTick();
    expect(app.wrapper.findAll('[data-testid="release-row"]')).toHaveLength(4);
  });

  it('keeps each row identified by its release, not by its position', async () => {
    using app = mountBoard();

    // A note typed into a row belongs to THAT release.
    await rowFor(app, 'Offline draft recovery').get('[data-testid="note"]').setValue('ask design');

    // Sorting by votes moves it from second place to first.
    await app.wrapper.get('[data-testid="sort"]').trigger('click');
    await nextTick();

    const note = rowFor(app, 'Offline draft recovery').get<HTMLInputElement>('[data-testid="note"]');
    expect(note.element.value).toBe('ask design');
  });

  it('still adds a row', async () => {
    using app = mountBoard();

    await app.wrapper.get('[data-testid="draft"]').setValue('Undo on the invoice list');
    await app.wrapper.get('[data-testid="add"]').trigger('click');

    expect(app.wrapper.findAll('[data-testid="release-row"]')).toHaveLength(6);
  });
});

describe('the detail drawer', () => {
  it('opens on a release', async () => {
    using app = mountBoard();

    await rowFor(app, 'Webhook replay').get('[data-testid="open"]').trigger('click');

    expect(app.wrapper.get('[data-testid="detail-title"]').text()).toBe('Webhook replay');
  });

  it('slides out before it forgets what it was showing', async () => {
    using app = mountBoard();
    await rowFor(app, 'Webhook replay').get('[data-testid="open"]').trigger('click');

    await app.wrapper.get('[data-testid="close"]').trigger('click');
    await afterTheFrame();
    await nextTick();

    expect(app.wrapper.find('[data-testid="detail"]').exists()).toBe(false);

    // The counter only moves from `@after-leave`. Clearing `selected` in the
    // click handler would empty the panel and never reach this hook.
    // That the title survives the whole slide is the part you check with your
    // eyes — jsdom has no duration to wait for.
    expect(app.wrapper.get('[data-testid="leave-count"]').text()).toBe('1');
  });
});
