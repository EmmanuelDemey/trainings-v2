import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleCard, Badge, VersionBanner } from '../src/index.ts';

describe('ArticleCard', () => {
  test('slugifies the title into the anchor of its heading, through slugify-lite', () => {
    render(<ArticleCard title="Hello, Wörld!" />);
    expect(screen.getByRole('heading', { name: 'Hello, Wörld!' }).id).toBe('hello-world');
  });

  test('keeps the anchor under 40 characters', () => {
    render(<ArticleCard title="TypeScript modules, declaration files and everything in between" />);
    expect(screen.getByRole('heading').id).toBe('typescript-modules-declaration-files-and');
  });
});

describe('Badge', () => {
  test('sets the --badge-color custom property from its color', () => {
    render(<Badge color="rebeccapurple">new</Badge>);
    expect(screen.getByText('new').style.getPropertyValue('--badge-color')).toBe('rebeccapurple');
  });
});

describe('VersionBanner', () => {
  test('reads the APP_VERSION global', () => {
    globalThis.APP_VERSION = '2.0.0';
    render(<VersionBanner />);
    expect(screen.getByRole('contentinfo').textContent).toBe('blog v2.0.0');
  });
});
