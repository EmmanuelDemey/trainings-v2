type HighlightProps = {
  text: string;
  query: string;
};

/** Wraps the first case-insensitive match of `query` in `text` with a <mark>. */
export function Highlight({ text, query }: HighlightProps) {
  const start = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (query.trim() === '' || start === -1) return text;

  const end = start + query.trim().length;
  return (
    <>
      {text.slice(0, start)}
      <mark>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}
