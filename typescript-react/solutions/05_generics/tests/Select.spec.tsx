import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../src/Select.tsx';

test('starts on the default value, and reports the option picked', async () => {
  const onChange = vi.fn();
  render(<Select label="Theme" options={['light', 'dark']} defaultValue="dark" onChange={onChange} />);
  const select = screen.getByRole('combobox', { name: 'Theme' });
  expect(select).toHaveProperty('value', 'dark');
  await userEvent.selectOptions(select, 'light');
  expect(onChange).toHaveBeenCalledWith('light');
});
