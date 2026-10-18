type TitleProps = {
  text: string;
  /** Which heading — `1` by default. */
  level?: 1 | 2 | 3;
};

export function Title({ text, level = 1 }: TitleProps) {
  // TODO 1.1: render `text` in an <h1>, <h2> or <h3> depending on `level`,
  //           with the `title` class.
  return null;
}
