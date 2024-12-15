import { Language, ThemeSwitcher } from '@components/common';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import './i18n';
import { router } from './router';
import { darkTheme, lightTheme } from './theme';

function App() {
	const [isDarkMode, setIsDarkMode] = useState(false);

	const toggleTheme = () => {
		setIsDarkMode(!isDarkMode);
	};

	const theme = isDarkMode ? darkTheme : lightTheme;

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					background: isDarkMode
						? darkTheme.palette.background.default
						: lightTheme.palette.background.default,
				}}
			>
				<ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
				<Language />
				<RouterProvider router={router} />
			</div>
		</ThemeProvider>
	);
}

export default App;
