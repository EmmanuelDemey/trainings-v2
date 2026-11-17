// A read-only form field: `name` is a path in `values`, checked by the compiler.
import type { ReactNode } from 'react';
import { get } from './get.ts';
import type { Get, PathOf } from './types.ts';

export interface FieldProps<T, P extends PathOf<T>> {
  values: T;
  name: P;
  render?: (value: Get<T, P>) => ReactNode;
}

export function Field<T, P extends PathOf<T>>({ values, name, render }: FieldProps<T, P>) {
  const value = get(values, name);
  return <output name={name}>{render ? render(value) : String(value)}</output>;
}
