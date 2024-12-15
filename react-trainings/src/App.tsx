import { Language, ThemeSwitcher } from '@components/common';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { LikesProvider } from './context';
import './i18n';
import { router } from './router';
import { darkTheme, lightTheme } from './theme';

function App() {
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [likes, setLikes] = useState({});

	const updateLikes = (k: string, v: number) => {
		setLikes({ ...likes, [k]: v });
	};

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
				<LikesProvider value={{ likes, setLikes: updateLikes }}>
					<ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
					<Language />
					<RouterProvider router={router} />
				</LikesProvider>
			</div>
		</ThemeProvider>
	);
}

export default App;
