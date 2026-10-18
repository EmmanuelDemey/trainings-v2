import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { composeStories } from '@storybook/react-vite';
import * as stories from './Button.stories';

// Every story of the file, as a ready-to-render component: the meta's args, the
// story's args and the preview's annotations are already merged in.
const { Primary, Secondary, Danger, Disabled, Small } = composeStories(stories);

describe('Button stories', () => {
  it('Primary is a primary "Save" button', () => {
    render(<Primary />);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('button--primary');
  });

  it('Primary reports its clicks to the onClick action', async () => {
    const user = userEvent.setup();
    render(<Primary />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(Primary.args.onClick).toHaveBeenCalledOnce();
  });

  it('Secondary is a secondary "Cancel" button', () => {
    render(<Secondary />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('button--secondary');
  });

  it('Danger is a danger "Delete" button', () => {
    render(<Danger />);

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('button--danger');
  });

  it('Disabled is a disabled "Save" button', () => {
    render(<Disabled />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('Small is a small "Save" button', () => {
    render(<Small />);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('button--small');
  });

  it('a story still accepts props, which win over its args', () => {
    render(<Primary>Send</Primary>);

    expect(screen.getByRole('button', { name: 'Send' })).toHaveClass('button--primary');
  });
});
