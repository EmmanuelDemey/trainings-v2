import { useEffect, useState } from 'react';
import { type People } from '../App';

export const useFetch = (url: string) => {
	const [data, setData] = useState<People>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		setLoading(true);
		fetch(url)
			.then((res) => {
				if (!res.ok) {
					throw new Error('Error');
				}
				return res.json();
			})
			.then((r) => r.results)
			.then((results: People) => {
				setData(results);
			})
			.catch((err: Error) => {
				setError(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [setLoading, url]);

	return { data, loading, error };
};
