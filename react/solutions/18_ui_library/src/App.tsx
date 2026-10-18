import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ThemeProvider } from '@mui/material/styles';
import { PeopleTable } from './components/PeopleTable';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Title } from './components/Title';
import { people } from './data/people';
import { themes } from './theme/themes';
import { useThemeMode } from './theme/useThemeMode';

export function App() {
  const [mode, toggleMode] = useThemeMode();

  return (
    // Everything below reads the theme from here: switching it is one prop.
    <ThemeProvider theme={themes[mode]}>
      {/* The reset, and the theme's background and text colour on <body>. */}
      <CssBaseline />
      <AppBar position="static" enableColorOnDark>
        <Toolbar>
          {/* `sx`: one-off styles, with theme shortcuts — `flexGrow`, spacing units. */}
          <Typography component="p" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Star Wars directory
          </Typography>
          <ThemeSwitcher mode={mode} onToggle={toggleMode} />
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="md" sx={{ py: 4 }}>
        <Title>Star Wars people</Title>
        <PeopleTable people={people} />
      </Container>
    </ThemeProvider>
  );
}
