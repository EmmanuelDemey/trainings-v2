import { useFavorites } from '../context/FavoritesContext';

export function Header() {
  return (
    <header className="header">
      <h1>Star Wars people</h1>
      <FavoritesCount />
      <ClearFavoritesButton />
    </header>
  );
}

function FavoritesCount() {
  const { favorites } = useFavorites();
  return <p>Favorites: {favorites.length}</p>;
}

function ClearFavoritesButton() {
  const { favorites, clear } = useFavorites();
  return (
    <button type="button" onClick={clear} disabled={favorites.length === 0}>
      Clear favorites
    </button>
  );
}
