import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TodoItem } from '../src/TodoItem.tsx';

describe('TodoItem', () => {
  test('checks the box of a todo done', () => {
    render(<TodoItem todo={{ id: 1, title: 'Buy milk', done: true }} onToggle={() => {}} />);
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'Buy milk' }).checked).toBe(true);
  });

  test('leaves the box of a pending todo empty, and toggles it on click', async () => {
    const toggled: number[] = [];
    render(<TodoItem todo={{ id: 2, title: 'Call Bob', done: false }} onToggle={(id: number) => toggled.push(id)} />);
    const checkbox = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Call Bob' });
    expect(checkbox.checked).toBe(false);
    await userEvent.click(checkbox);
    expect(toggled).toEqual([2]);
  });
});
