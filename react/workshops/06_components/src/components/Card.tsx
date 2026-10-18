import type { ReactNode } from 'react';

type CardProps = {
  title: string;
  /** Whatever is written between <Card> and </Card>. */
  children: ReactNode;
  /** A second "slot": any JSX, rendered at the bottom when given. */
  footer?: ReactNode;
};

export function Card({ title, children, footer }: CardProps) {
  // TODO 4.1: a <section className="card"> labelled by its <h2>{title}</h2>
  //           (`useId` + `aria-labelledby`), then the children.
  // TODO 4.2: the footer in a <footer>, only when there is one.
  return null;
}
