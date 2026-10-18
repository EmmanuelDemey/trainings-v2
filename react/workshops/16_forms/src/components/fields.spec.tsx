import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RadioGroupField, SelectField, TextField } from './fields';

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

describe('step 4 — accessible errors', () => {
  it('a valid text field is neither invalid nor described', () => {
    render(<TextField id="name" label="Name" />);

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toBeValid();
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('a text field in error is invalid, and its message is its description', () => {
    render(<TextField id="name" label="Name" error="Name is required" />);

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('Name is required');
  });

  it('a select in error is invalid, and its message is its description', () => {
    render(<SelectField id="hair" label="Hair color" options={options} error="Pick a hair color" />);

    const select = screen.getByRole('combobox', { name: 'Hair color' });
    expect(select).toBeInvalid();
    expect(select).toHaveAccessibleDescription('Pick a hair color');
  });

  it('a radio group in error is invalid as a whole, and its message is its description', () => {
    render(<RadioGroupField id="gender" name="gender" label="Gender" options={options} error="Pick a gender" />);

    const group = screen.getByRole('radiogroup', { name: 'Gender' });
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAccessibleDescription('Pick a gender');
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('two fields in error never share a message id', () => {
    render(
      <>
        <TextField id="first" label="First" error="Wrong" />
        <TextField id="second" label="Second" error="Wrong too" />
      </>,
    );

    expect(screen.getByRole('textbox', { name: 'First' })).toHaveAccessibleDescription('Wrong');
    expect(screen.getByRole('textbox', { name: 'Second' })).toHaveAccessibleDescription('Wrong too');
  });
});
