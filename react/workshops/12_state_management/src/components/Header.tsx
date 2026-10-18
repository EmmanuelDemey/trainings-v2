interface HeaderProps {
  favorites: string[];
  onClear: () => void;
}

// TODO 5.2: read the favorites from `useFavorites()`, in the two components
// that need them — and drop these props.
export function Header({ favorites, onClear }: HeaderProps) {
  return (
    <header className="header">
      <h1>Star Wars people</h1>
      <FavoritesCount count={favorites.length} />
      <ClearFavoritesButton disabled={favorites.length === 0} onClear={onClear} />
    </header>
  );
}

function FavoritesCount({ count }: { count: number }) {
  return <p>Favorites: {count}</p>;
}

function ClearFavoritesButton({ disabled, onClear }: { disabled: boolean; onClear: () => void }) {
  return (
    <button type="button" onClick={onClear} disabled={disabled}>
      Clear favorites
    </button>
  );
}
