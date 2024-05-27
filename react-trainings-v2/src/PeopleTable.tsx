import { type People, type Person } from './fake-data';

type PeopleTableType = { people: People };

const PeopleTable = ({ people }: PeopleTableType) => (
	<table className="table is-fullwidth">
		<thead>
			<tr>
				<th>Nom</th>
				<th>Genre</th>
				<th>Année de naissance</th>
			</tr>
		</thead>
		<tbody>
			{people.map(({ name, gender, birth_year, url }: Person) => (
				<tr key={url}>
					<td>{name}</td>
					<td>{gender}</td>
					<td>{birth_year}</td>
				</tr>
			))}
		</tbody>
	</table>
);

export default PeopleTable;
