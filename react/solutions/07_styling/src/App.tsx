import { useState } from 'react';
import styles from './App.module.css';
import { Button } from './components/Button';
import { PersonCard } from './components/PersonCard';
import { ThemeRoot, type Theme } from './components/ThemeRoot';
import { people } from './data/people';

const maxHeight = Math.max(...people.map(({ height }) => height));

export function App() {
  // Given: `useState` is chapter 8.
  const [theme, setTheme] = useState<Theme>('light');
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <ThemeRoot theme={theme}>
      <header className={styles.header}>
        <h1>Star Wars people</h1>
        <Button variant="secondary" size="small" onClick={() => setTheme(nextTheme)}>
          Switch to {nextTheme} theme
        </Button>
      </header>
      <main className={styles.grid}>
        {people.map((person) => (
          <PersonCard key={person.id} person={person} maxHeight={maxHeight} />
        ))}
      </main>
    </ThemeRoot>
  );
}
