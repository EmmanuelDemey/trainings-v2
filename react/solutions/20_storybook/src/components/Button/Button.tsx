import type { ComponentProps } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = 'primary', size = 'medium', type = 'button', className, ...props }: ButtonProps) {
  const classes = ['button', `button--${variant}`, `button--${size}`, className].filter(Boolean).join(' ');
  return <button type={type} className={classes} {...props} />;
}
