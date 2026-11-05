import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SafeHtml } from './SafeHtml';

describe('SafeHtml', () => {
  it('keeps the formatting', () => {
    render(<SafeHtml html="<p>A farm boy from <strong>Tatooine</strong>.</p>" />);

    expect(screen.getByText('Tatooine').tagName).toBe('STRONG');
  });

  it.each([
    ['an event handler attribute', '<img src="x" onerror="alert(1)">', 'onerror'],
    ['a script tag', '<p>hi</p><script>alert(1)</script>', '<script'],
    ['a javascript: link', '<a href="javascript:alert(1)">click</a>', 'javascript:'],
    ['an inline svg handler', '<svg><g onload="alert(1)"></g></svg>', 'onload'],
  ])('drops %s', (_label, html, forbidden) => {
    const { container } = render(<SafeHtml html={html} />);

    expect(container.innerHTML).not.toContain(forbidden);
  });
});
