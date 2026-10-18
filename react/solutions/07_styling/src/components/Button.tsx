import type { ComponentProps } from 'react';
import { cx } from '../utils/cx';
import styles from './Button.module.css';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium';
};

export function Button({ variant = 'primary', size = 'medium', className, type = 'button', ...buttonProps }: ButtonProps) {
  return (
    <button
      {...buttonProps}
      // A <button> inside a <form> submits it by default: 'button' is the safe
      // default for a component used everywhere.
      type={type}
      // `styles[variant]` maps the prop straight to a class of the module. The
      // caller's `className` comes last so it can add to — not replace — ours.
      className={cx(styles.button, styles[variant], size === 'small' && styles.small, className)}
    />
  );
}
