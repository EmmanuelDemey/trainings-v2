import { useState } from 'react';
import { type Person } from './App';

const DEFAULT_PERSON: Person = { name: '', gender: '', birth_year: '' };

type PeopleItemType = { add: (p: Person) => void };

const PeopleItem = ({ add }: PeopleItemType) => {
	const [item, setItem] = useState<Person>(DEFAULT_PERSON);

	const updateItem =
		(field: 'name' | 'gender' | 'birth_year') => (value: string) => {
			setItem({ ...item, [field]: value });
		};

	const onClick = () => {
		add(item);
		setItem(DEFAULT_PERSON);
	};

	const { name, gender, birth_year } = item;

	return (
		<>
			<div className="field">
				<div className="control">
					<input
						className="input is-info"
						type="text"
						onChange={(e) => updateItem('name')(e.target.value)}
						value={name}
					/>
				</div>
			</div>
			<div className="field">
				<div className="control">
					<input
						className="input is-info"
						type="text"
						onChange={(e) => updateItem('gender')(e.target.value)}
						value={gender}
					/>
				</div>
			</div>
			<div className="field">
				<div className="control">
					<input
						className="input is-info"
						type="text"
						onChange={(e) => updateItem('birth_year')(e.target.value)}
						value={birth_year}
					/>
				</div>
			</div>
			<button onClick={onClick}>Add</button>
		</>
	);
};

export default PeopleItem;
