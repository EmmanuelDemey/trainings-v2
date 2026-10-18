import { Header } from './components/Header';
import { FavoritesProvider } from './context/FavoritesContext';
import { FilterProvider } from './context/FilterContext';
import { HomePage } from './people/HomePage';
import './App.css';

export function App() {
  // The providers sit as low as possible, but above every consumer: the
  // header needs the favorites, the page needs both.
  return (
    <FavoritesProvider>
      <FilterProvider>
        <main className="app">
          <Header />
          <HomePage />
        </main>
      </FilterProvider>
    </FavoritesProvider>
  );
}
