import { useState } from 'react';
import PeopleFilter from './PeopleFilter';
import PeopleTable from './PeopleTable';
import { useFetch } from './hooks/fetch';

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

function App() {
	const [filter, setFilter] = useState<string>('');
	const { data, loading, error } = useFetch(
		`https://swapi.dev/api/people/?search=${filter}`
	);

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
					<PeopleTable people={data} />
				)}
			</div>
		</section>
	);
}

export default App;
