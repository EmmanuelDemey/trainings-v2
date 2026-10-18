import { PeopleTable } from './components/PeopleTable';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Title } from './components/Title';
import { people } from './data/people';
import { useThemeMode } from './theme/useThemeMode';

export function App() {
  const [mode, toggleMode] = useThemeMode();

  // TODO 2.4: wrap everything in `<ThemeProvider theme={themes[mode]}>` with a
  //           `<CssBaseline />` first, and delete `src/style.css` and its import.
  // TODO 3.3: the header becomes an `AppBar position="static" enableColorOnDark` >
  //           `Toolbar`, the brand a `Typography component="p"` with
  //           `sx={{ flexGrow: 1, fontWeight: 600 }}`, and <main> a
  //           `Container component="main" maxWidth="md" sx={{ py: 4 }}`.
  return (
    <>
      <header className="header">
        <p className="brand">Star Wars directory</p>
        <ThemeSwitcher mode={mode} onToggle={toggleMode} />
      </header>
      <main className="main">
        <Title>Star Wars people</Title>
        <PeopleTable people={people} />
      </main>
    </>
  );
}
