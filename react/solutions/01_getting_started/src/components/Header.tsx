// Props are a plain TypeScript type: the compiler checks every <Header /> call.
type HeaderProps = {
  title: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
      {/* An optional prop: render the paragraph only when it is given. */}
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}
