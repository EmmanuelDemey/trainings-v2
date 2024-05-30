import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Home, NotFound } from 'src/pages';
const Person = lazy(() => import('src/pages/person'));
import { Language, Loader } from 'src/common';
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
		element: (
			<Suspense fallback={<Loader />}>
				<Person />
			</Suspense>
		),
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Language />
		<RouterProvider router={router} />
	</React.StrictMode>
);
