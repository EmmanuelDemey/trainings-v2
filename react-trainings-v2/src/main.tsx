import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Home, NotFound, Person } from 'src/pages';
import { Language } from 'src/common';
import './i18n';
import 'bulma/css/bulma.css';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Home />,
		errorElement: <NotFound />,
	},
	{
		path: '/person/:id',
		element: <Person />,
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Language />
		<RouterProvider router={router} />
	</React.StrictMode>
);
