import { Error as ErrorComponent, Loader } from '@components/common';
import { Person as PersonType } from '@model/person';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/env';
import Person from './Person';

const PeopleContainer = () => {
	const { id } = useParams();
	const { data, isPending, error } = useQuery<PersonType>({
		queryKey: ['person', id],
		queryFn: () => fetch(`${API_BASE_URL}/${id}`).then((r) => r.json()),
	});

	if (isPending) {
		return <Loader />;
	}

	if (error) {
		return <ErrorComponent text={error.message} />;
	}

	return <Person person={data} />;
};

export default PeopleContainer;
