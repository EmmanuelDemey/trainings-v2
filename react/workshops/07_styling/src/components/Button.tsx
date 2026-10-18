import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium';
};

export function Button({ variant = 'primary', size = 'medium', ...buttonProps }: ButtonProps) {
  // TODO 2.2: import the module as `styles` and give the button
  //           `styles.button` + the class of its variant + `styles.small` when
  //           size is 'small' — with `cx`. Keep the caller's `className` too.
  // TODO 2.3: make `type="button"` the default — a caller can still pass
  //           `type="submit"`.
  return <button {...buttonProps} />;
}
