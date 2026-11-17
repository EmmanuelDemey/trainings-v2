import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmitButton } from '../src/SubmitButton.tsx';

test('is a submit button, whatever the props', () => {
  render(<SubmitButton className="primary">Save</SubmitButton>);
  const button = screen.getByRole('button', { name: 'Save' });
  expect(button.getAttribute('type')).toBe('submit');
  expect(button.className).toBe('primary');
});

test('submits its form', async () => {
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  render(
    <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
      <SubmitButton>Save</SubmitButton>
    </form>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSubmit).toHaveBeenCalledOnce();
});
