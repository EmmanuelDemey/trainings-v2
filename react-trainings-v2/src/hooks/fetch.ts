import { useEffect, useState } from 'react';
import { type People } from 'src/pages/home/component';

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
			.then((r) => {
				setData(r.results ? r.results : r);
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
