import { createTheme } from '@mui/material';

export const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#90caf9',
		},
		error: { main: '#FF0000' },
		background: {
			default: '#121212',
			paper: '#1e1e1e',
		},
	},
});
