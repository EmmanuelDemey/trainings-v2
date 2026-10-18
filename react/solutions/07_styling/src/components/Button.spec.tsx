import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import styles from './Button.module.css';
import { classOf } from '../tests/classOf';

describe('Button', () => {
  it('is a primary, medium, type="button" button by default', () => {
    render(<Button>Like</Button>);

    const button = screen.getByRole('button', { name: 'Like' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass(classOf(styles, 'button'), classOf(styles, 'primary'));
    expect(button).not.toHaveClass(classOf(styles, 'small'));
  });

  it.each(['secondary', 'danger'] as const)('applies the %s variant class, and not the primary one', (variant) => {
    render(<Button variant={variant}>Go</Button>);

    const button = screen.getByRole('button', { name: 'Go' });
    expect(button).toHaveClass(classOf(styles, 'button'), classOf(styles, variant));
    expect(button).not.toHaveClass(classOf(styles, 'primary'));
  });

  it('adds the small class for size="small"', () => {
    render(<Button size="small">Go</Button>);

    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass(classOf(styles, 'small'));
  });

  it("keeps its own classes when the caller adds a className", () => {
    render(<Button className="extra">Go</Button>);

    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('extra', classOf(styles, 'button'));
  });

  it('passes the native button props through', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <>
        <Button onClick={onClick}>Enabled</Button>
        <Button disabled onClick={onClick}>
          Disabled
        </Button>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Enabled' }));
    await user.click(screen.getByRole('button', { name: 'Disabled' }));

    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('lets a caller ask for a submit button', () => {
    render(<Button type="submit">Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });
});
