import { useState } from 'react';
import { data, type Person, type People } from './fake-data';
import PeopleFilter from './PeopleFilter';
import PeopleTable from './PeopleTable';
import PeopleItem from './PeopleItem';

function App() {
	const [people, setPeople] = useState<People>(data);
	const [filter, setFilter] = useState<string>('');

	const filteredPeople = people.filter(({ name }) => name.includes(filter));

	const add = (p: Person) => {
		setPeople([...people, p]);
	};

	return (
		<section className="section">
			<div className="container">
				<h1 className="title">Hello World</h1>
				<PeopleFilter handleChange={setFilter} />
				<PeopleTable people={filteredPeople} />
				<PeopleItem add={add} />
			</div>
		</section>
	);
}

export default App;
