import { useNavigate } from 'react-router-dom';
import { Button, Error } from '../common';

const NotFound = () => {
	const navigate = useNavigate();
	return (
		<>
			<Error text={'Not found'} />
			<Button
				label={'Back home'}
				onClick={() => {
					navigate('/');
				}}
			/>
		</>
	);
};

export default NotFound;
