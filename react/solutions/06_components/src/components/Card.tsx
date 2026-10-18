import { useId, type ReactNode } from 'react';

type CardProps = {
  title: string;
  /** Whatever is written between <Card> and </Card>. */
  children: ReactNode;
  /** A second "slot": any JSX, rendered at the bottom when given. */
  footer?: ReactNode;
};

export function Card({ title, children, footer }: CardProps) {
  const titleId = useId();

  // `aria-labelledby` turns the <section> into a landmark region named after
  // its heading — it is also what lets the specs find it by role.
  return (
    <section className="card" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      {children}
      {footer && <footer>{footer}</footer>}
    </section>
  );
}
