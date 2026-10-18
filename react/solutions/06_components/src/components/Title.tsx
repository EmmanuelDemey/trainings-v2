type TitleProps = {
  text: string;
  /** Which heading — `1` by default. */
  level?: 1 | 2 | 3;
};

export function Title({ text, level = 1 }: TitleProps) {
  // A component name must start with an uppercase letter, a host element with a
  // lowercase one: JSX tells them apart that way. Here the tag is a string —
  // 'h1', 'h2' or 'h3' — stored in a capitalised variable so JSX accepts it.
  const Heading = `h${level}` as const;
  return <Heading className="title">{text}</Heading>;
}
