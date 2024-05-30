import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: FC = () => {
	const navigate = useNavigate();
	return (
		<>
			<div>Not found</div>
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

export default NotFoundPage;
