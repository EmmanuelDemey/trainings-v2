import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import * as stories from './Input.stories';

const { Default, Filled, WithError, Disabled } = composeStories(stories);

describe('Input stories', () => {
  it('Default is an empty, valid "Name" field with a placeholder', () => {
    render(<Default />);

    const field = screen.getByRole('textbox', { name: 'Name' });
    expect(field).toHaveValue('');
    expect(field).toHaveAttribute('placeholder', 'Luke Skywalker');
    expect(field).not.toBeInvalid();
  });

  it('Filled starts with "Leia Organa" typed in', () => {
    render(<Filled />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Leia Organa');
  });

  it('WithError is invalid, and announces "Name is required" with the field', () => {
    render(<WithError />);

    const field = screen.getByRole('textbox', { name: 'Name' });
    expect(field).toBeInvalid();
    expect(field).toHaveAccessibleDescription('Name is required');
  });

  it('Disabled is a disabled field', () => {
    render(<Disabled />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled();
  });
});
