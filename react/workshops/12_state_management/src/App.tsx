import { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './people/HomePage';
import './App.css';

export function App() {
  // TODO 2.1 / 5.1: this state lives here only because components far apart
  // need it. Follow each prop down the tree: most components only pass it on.
  // Move it into FilterProvider (step 2) and FavoritesProvider (step 5).
  const [filter, setFilter] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) =>
    setFavorites((ids) => (ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id]));

  return (
    <main className="app">
      <Header favorites={favorites} onClear={() => setFavorites([])} />
      <HomePage
        filter={filter}
        onFilterChange={setFilter}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
    </main>
  );
}
