import { FavoritesCount } from './people/FavoritesCount';
import { PeopleSearch } from './people/PeopleSearch';
import './App.css';

export function App() {
  return (
    <main className="app">
      <header>
        <h1>Star Wars people</h1>
        <FavoritesCount />
      </header>
      <PeopleSearch />
    </main>
  );
}
