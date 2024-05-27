import data from './fake-data.json';

type Person = {
	name: string;
	height: string;
	mass: string;
	hair_color: string;
	skin_color: string;
	eye_color: string;
	birth_year: string;
	gender: string;
	homeworld: string;
	films: string[];
	species: string[];
	vehicles: string[];
	starships: string[];
	created: string;
	edited: string;
	url: string;
};

type People = Array<Person>;

function App() {
	return (
		<section className="section">
			<div className="container">
				<h1 className="title">Hello World</h1>
				<table className="table is-fullwidth">
					<thead>
						<tr>
							<th>Nom</th>
							<th>Genre</th>
							<th>Année de naissance</th>
						</tr>
					</thead>
					<tbody>
						{(data as People).map(
							({ name, gender, birth_year, url }: Person) => (
								<tr key={url}>
									<td>{name}</td>
									<td>{gender}</td>
									<td>{birth_year}</td>
								</tr>
							)
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
}

export default App;
