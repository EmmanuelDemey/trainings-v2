import { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from 'src/common';
import { useFetch } from 'src/hooks/fetch';
import { getEnv } from 'src/utils';

const PersonPage: FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { data, loading, error } = useFetch(`${getEnv('API_BASE_URL')}/${id}`);

	if (error) return <div>{error}</div>;

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<ul>
					{Object.entries(data).map(([k, v], i) => (
						<li key={i}>{`${k}: ${v}`}</li>
					))}
				</ul>
			)}
			<button
				type="button"
				className="button is-warning"
				onClick={() => {
					navigate('/');
				}}
			>
				Back to home
			</button>
		</>
	);
};

export default PersonPage;
