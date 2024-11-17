---
layout: cover
---

# 18

## - 

# Intégration d'un framework UI

---

# Material UI

### Installation

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

### Création d'un thème

```typescript {*}{maxHeight:'300px'}
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Couleur principale
    },
    secondary: {
      main: '#ff4081', // Couleur secondaire
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
  },
});

export default theme;
```

---

# Création d'un composant Title

```typescript
import React from 'react';
import { Typography } from '@mui/material';

interface TitleProps {
  text: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color?: 'primary' | 'secondary' | 'textPrimary' | 'textSecondary';
}

const Title: React.FC<TitleProps> = ({ text, variant = 'h1', color = 'primary' }) => {
  return (
    <Typography variant={variant} color={color}>
      {text}
    </Typography>
  );
};

export default Title;
```

---

# Instanciation de Material UI

```typescript
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Title from './Title';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <Title text="Bienvenue sur mon site !" />
        <Title text="Sous-titre" variant="h2" color="secondary" />
      </div>
    </ThemeProvider>
  );
}

export default App;
```

- `ThemeProvider` : Applique le thème à toute l'application
- `CSSBaseLine` : Fournit des styles CSS globaux par défaut pour un rendu cohérent

---
layout: cover
---

# Travaux Pratiques

## PW 18