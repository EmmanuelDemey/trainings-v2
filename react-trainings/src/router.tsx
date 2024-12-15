import { CreatePage, HomePage } from '@pages/index';
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Loader } from './components/common';
import NotFound from './components/not-found';
const Person = lazy(() => import('@pages/Person'));

export const router = createBrowserRouter([
	{
		path: '/',
		element: <HomePage />,
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
	{
		path: '/person/create',
		element: <CreatePage />,
	},
]);
