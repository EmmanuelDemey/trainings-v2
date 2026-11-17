// A <button> that always submits its form: it takes every prop of a button but `type`.
import type { SubmitButtonProps } from './dto.ts';

export function SubmitButton(props: SubmitButtonProps) {
  return <button {...props} type="submit" />;
}
