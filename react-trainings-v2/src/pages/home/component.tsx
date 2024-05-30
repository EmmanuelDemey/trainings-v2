import { useState, useEffect, FC } from 'react';
import { LikeContext } from 'src/contexts';
import { Loader } from 'src/common';
import PeopleFilter from './PeopleFilter';
import PeopleTable from './PeopleTable';
import { useFetch } from 'src/hooks/fetch';
import { count } from 'src/utils';

export type Person = {
	name: string;
	height?: string;
	mass?: string;
	hair_color?: string;
	skin_color?: string;
	eye_color?: string;
	birth_year: string;
	gender: string;
	homeworld?: string;
	films?: string[];
	species?: string[];
	vehicles?: string[];
	starships?: string[];
	created?: string;
	edited?: string;
	url?: string;
};

export type People = Array<Person>;

const HomePage: FC = () => {
	const [filter, setFilter] = useState<string>('');
	const [initialLikes, setInitialLikes] = useState<Record<
		string,
		number
	> | null>(null);
	const [likes, setLikes] = useState<Record<string, number>>({});
	const { data, loading, error } = useFetch(
		`https://swapi.dev/api/people/?search=${filter}`
	);

	const updateLikes = (key: string, value: number) => {
		setLikes({ ...likes, [key]: value });
	};

	useEffect(() => {
		if (!initialLikes) {
			const init = data.reduce(
				(acc: Record<string, number>, { name }: { name: string }) => ({
					...acc,
					[name]: 0,
				}),
				{}
			);
			setLikes(init);
			setInitialLikes(init);
		}
	}, [data, initialLikes]);

	if (error) return <div>{error}</div>;

	return (
		<section className="section">
			<div className="container">
				<h1 className="title">Hello World</h1>
				<h2>{`Vous aimez ${count(likes)} personnages`}</h2>
				<PeopleFilter value={filter} handleChange={setFilter} />
				{loading ? (
					<Loader />
				) : (
					<LikeContext.Provider value={{ likes, updateLikes }}>
						<PeopleTable people={data} />
					</LikeContext.Provider>
				)}
			</div>
		</section>
	);
};

export default HomePage;
