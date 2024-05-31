import { type People, type Person } from './component';
import { Link } from 'react-router-dom';
import { getIDFromUrl } from 'src/utils/url';
import './person.css';
import { useRecoilState } from 'recoil';
import { likeState } from 'src/store';

type PeopleTableType = { people: People };

const PeopleTable = ({ people }: PeopleTableType) => {
	const [likes, setLikes] = useRecoilState(likeState);
	const updateLikes = (k: string, v: number): void => {
		setLikes({ ...likes, [k]: v });
	};
	return (
		<table className="table is-fullwidth">
			<thead>
				<tr>
					<th>Nom</th>
					<th>Genre</th>
					<th>Année de naissance</th>
					<th>Like</th>
				</tr>
			</thead>
			<tbody>
				{people.map(({ name, gender, birth_year, url }: Person) => {
					const like: number = likes[name];
					return (
						<tr key={url}>
							<td className="person">
								<Link to={`/person/${getIDFromUrl(url)}`}>{name}</Link>
							</td>
							<td>{gender}</td>
							<td>{birth_year}</td>
							<td>
								{like !== 1 && (
									<button
										type="button"
										className="button is-warning"
										onClick={() => {
											updateLikes(name, 1);
										}}
									>
										I Like
									</button>
								)}
								{like !== -1 && (
									<button
										type="button"
										className="button is-warning"
										onClick={() => {
											updateLikes(name, -1);
										}}
									>
										I Dislike
									</button>
								)}
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

export default PeopleTable;
