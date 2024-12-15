import { Button, Title } from '@components/common';
import PeopleTable from '@components/people-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLikes } from '../context';

const Home = () => {
	const { likes } = useLikes();

	const navigate = useNavigate();

	const { t } = useTranslation('home');

	const likeNb = useMemo(
		() => Object.values(likes).filter((l) => l === 1).length,
		[likes]
	);

	return (
		<>
			<Title text={t('title')} level={3} />
			<Title text={t('count', { likeNb })} level={4} />
			<div style={{ float: 'right', marginBottom: '1em' }}>
				<Button
					label={t('create')}
					onClick={() => {
						navigate('/person/create');
					}}
				/>
			</div>
			<PeopleTable />
		</>
	);
};

export default Home;
