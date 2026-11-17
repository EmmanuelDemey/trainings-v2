import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Summary } from '../src/Summary.tsx';

describe('Summary', () => {
  test('counts the todos done', () => {
    const todos = [
      { id: 1, title: 'Buy milk', done: true },
      { id: 2, title: 'Call Bob', done: false },
      { id: 3, title: 'Learn TypeScript', done: true },
    ];
    render(<Summary todos={todos} />);
    expect(screen.getByText('2/3 done')).toBeDefined();
  });

  test('says when there is nothing to do', () => {
    render(<Summary todos={[]} />);
    expect(screen.getByText('nothing to do')).toBeDefined();
  });
});
