import { useEffect, useState } from 'react';
import PeopleFilter from './PeopleFilter';
import PeopleTable from './PeopleTable';
import PeopleItem from './PeopleItem';

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

type People = Array<Person>;

function App() {
	const [people, setPeople] = useState<People>([]);
	const [filter, setFilter] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		setLoading(true);
		fetch(`https://swapi.dev/api/people/?search=${filter}`)
			.then((res) => {
				if (!res.ok) {
					throw new Error('Error');
				}
				return res.json();
			})
			.then((r) => r.results)
			.then((results) => setPeople(results as People))
			.catch((err: Error) => {
				setError(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [setLoading, filter]);

	useEffect(() => {});

	const add = (p: Person) => {
		setPeople([...people, p]);
	};

	if (error) return <div>{error}</div>;

	return (
		<section className="section">
			<div className="container">
				<h1 className="title">Hello World</h1>
				<PeopleFilter value={filter} handleChange={setFilter} />
				{loading ? (
					<progress
						className="progress is-small is-primary"
						max="100"
					></progress>
				) : (
					<PeopleTable people={people} />
				)}
				<PeopleItem add={add} />
			</div>
		</section>
	);
}

export default App;
